import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
import { JobMatchAnalysis } from "@/types/ai-match";
import { reconcileJobMatch } from "@/lib/utils/skill-matcher";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "OpenAI API key is missing. Please add OPENAI_API_KEY to your .env file.",
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { jobId, jobTitle, company, description: customDescription } = body;

    let targetJobTitle = jobTitle || "";
    let targetCompany = company || "";
    let targetDescription = customDescription || "";

    if (jobId && (!targetDescription || !targetJobTitle)) {
      const { data: jobData, error: jobError } = await supabase
        .from("job_applications")
        .select("job_title, company, description")
        .eq("id", jobId)
        .eq("user_id", user.id)
        .single();

      if (!jobError && jobData) {
        targetJobTitle = targetJobTitle || jobData.job_title || "";
        targetCompany = targetCompany || jobData.company || "";
        targetDescription = targetDescription || jobData.description || "";
      }
    }

    if (!targetDescription || !targetDescription.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Job description is required to perform an AI match analysis.",
        },
        { status: 400 }
      );
    }

    // Fetch user profile data in parallel from Supabase (Source of Truth)
    const [profileRes, skillsRes, experienceRes, educationRes, projectsRes] =
      await Promise.all([
        supabase
          .from("users")
          .select("name, career_summary")
          .eq("id", user.id)
          .maybeSingle(),
        supabase
          .from("user_skills")
          .select("name")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true }),
        supabase
          .from("user_experiences")
          .select(
            "job_title, company_name, workplace_type, start_month, start_year, end_month, end_year, is_current, bullets"
          )
          .eq("user_id", user.id)
          .order("start_year", { ascending: false }),
        supabase
          .from("user_educations")
          .select(
            "school, degree, field_of_study, start_year, end_year, is_current, honors"
          )
          .eq("user_id", user.id)
          .order("start_year", { ascending: false }),
        supabase
          .from("user_projects")
          .select("title, live_url, bullets, sort_order")
          .eq("user_id", user.id)
          .order("sort_order", { ascending: true })
          .order("created_at", { ascending: false }),
      ]);

    const profileData = profileRes.data;
    const skillsData = skillsRes.data || [];
    const experienceData = experienceRes.data || [];
    const educationData = educationRes.data || [];
    const projectsData = projectsRes.data || [];

    // Deduplicate candidate skills from DB
    const rawSkillsList = skillsData.map((s) => s.name.trim()).filter(Boolean);
    const candidateSkillsUnique: string[] = [];
    const seenLower = new Set<string>();
    for (const sk of rawSkillsList) {
      const low = sk.toLowerCase();
      if (!seenLower.has(low)) {
        seenLower.add(low);
        candidateSkillsUnique.push(sk);
      }
    }

    // Format candidate profile for the prompt
    const candidateProfile = {
      careerSummary: profileData?.career_summary || "None provided",
      skills: candidateSkillsUnique,
      experiences: experienceData.map((exp) => ({
        role: exp.job_title,
        company: exp.company_name,
        period: `${exp.start_month} ${exp.start_year} - ${
          exp.is_current ? "Present" : `${exp.end_month || ""} ${exp.end_year || ""}`.trim()
        }`,
        highlights: Array.isArray(exp.bullets) ? exp.bullets : [],
      })),
      projects: projectsData.slice(0, 5).map((proj) => ({
        title: proj.title,
        liveUrl: proj.live_url || undefined,
        highlights: Array.isArray(proj.bullets) ? proj.bullets.filter(Boolean) : [],
      })),
      education: educationData.map((edu) => ({
        degree: edu.degree,
        school: edu.school,
        fieldOfStudy: edu.field_of_study || "",
        period: `${edu.start_year} - ${edu.is_current ? "Present" : edu.end_year || ""}`.trim(),
        honors: edu.honors || "",
      })),
    };

    // Clean description: strip excessive whitespace, then truncate intelligently.
    // Try to keep up to 4500 chars to preserve requirement sections that often appear
    // at the end of postings. If the description is longer, try to find a paragraph
    // boundary near the limit to avoid cutting mid-requirement.
    const DESC_LIMIT = 4500;
    const trimmedDescription = targetDescription.trim().replace(/\n{3,}/g, "\n\n");
    let cleanDescription: string;
    if (trimmedDescription.length <= DESC_LIMIT) {
      cleanDescription = trimmedDescription;
    } else {
      // Look for a paragraph break within the last 500 chars of the limit zone
      const cutZoneStart = DESC_LIMIT - 500;
      const cutZone = trimmedDescription.slice(cutZoneStart, DESC_LIMIT);
      const lastBreak = cutZone.lastIndexOf("\n\n");
      if (lastBreak !== -1) {
        cleanDescription = trimmedDescription.slice(0, cutZoneStart + lastBreak);
      } else {
        // Fall back to sentence boundary
        const lastPeriod = cutZone.lastIndexOf(". ");
        if (lastPeriod !== -1) {
          cleanDescription = trimmedDescription.slice(0, cutZoneStart + lastPeriod + 1);
        } else {
          cleanDescription = trimmedDescription.slice(0, DESC_LIMIT);
        }
      }
    }

    const openai = new OpenAI({ apiKey });

    const systemPrompt = `You are Kairo's Job Match Analyst. Perform a strict, evidence-based comparison of a candidate against a job posting.

CORE PRINCIPLE: Prioritize MATCHING ACCURACY over making the candidate appear qualified. Only classify a skill, experience, or requirement as a match when there is EXPLICIT evidence in the candidate data. When evidence is missing, classify as NOT PROVEN.

═══════════════════════════════════════════════════
EVIDENCE RULES
═══════════════════════════════════════════════════

You may ONLY use information explicitly present in:
- candidate.skills (the skills array)
- candidate.experiences (job titles, companies, and highlight bullets)
- candidate.projects (project titles and highlight bullets)
- candidate.education (when relevant)

You must NEVER infer qualifications because:
- Two technologies are related or in the same ecosystem
- Technologies are commonly used together
- The candidate has a similar job title
- The candidate is generally a software developer
- A project could theoretically have used a technology
- A skill is commonly learned alongside another skill

═══════════════════════════════════════════════════
TECHNOLOGY ALIASING (STRICT RULES)
═══════════════════════════════════════════════════

EXACT EQUIVALENTS (true naming variations of the same technology):
- PostgreSQL = Postgres
- Node = Node.js = NodeJS
- React = React.js = ReactJS
- TypeScript = TS
- JavaScript = JS
- Next.js = NextJS
- MySQL = MySQL Database
- Vue = Vue.js = VueJS
- Redux Toolkit = RTK

DIRECTIONAL RELATIONSHIPS (specialized → parent ONLY):
A specialized technology demonstrates knowledge of its underlying technology, but NOT the reverse.
- Laravel → PHP (Laravel proves PHP; PHP does NOT prove Laravel)
- Next.js → React (Next.js proves React; React does NOT prove Next.js)
- Nuxt → Vue (Nuxt proves Vue; Vue does NOT prove Nuxt)
- Redux Toolkit → Redux (RTK proves Redux; Redux does NOT prove RTK)
- Apollo → GraphQL (Apollo proves GraphQL; GraphQL does NOT prove Apollo)
- NestJS → Node.js (NestJS proves Node.js; Node.js does NOT prove NestJS)
- Express → Node.js (Express proves Node.js; Node.js does NOT prove Express)

RELATED BUT DISTINCT (NEVER treat as equivalent):
- PHP ≠ Laravel
- React ≠ Next.js
- Vue ≠ Nuxt
- GraphQL ≠ Apollo
- Node.js ≠ Express.js
- JavaScript ≠ TypeScript
- PostgreSQL ≠ MySQL
- REST ≠ GraphQL
- Tailwind CSS ≠ CSS
- Docker ≠ Kubernetes
- Prisma ≠ Drizzle ≠ TypeORM
- Supabase ≠ Firebase
- Jest ≠ Vitest

═══════════════════════════════════════════════════
REQUIRED vs PREFERRED CLASSIFICATION
═══════════════════════════════════════════════════

First, classify every job requirement into one of three categories:

REQUIRED — signaled by: "required", "must have", "must", "essential", "minimum", "required experience", "strong experience with", or unmarked technical qualifications in the core requirements section.

PREFERRED / NICE-TO-HAVE — signaled by: "preferred", "nice to have", "bonus", "plus", "desirable", "would be a bonus", "ideally", "familiarity with".

RESPONSIBILITY / CONTEXT — job activities and responsibilities that are NOT themselves explicit qualification requirements.

Rules:
- A preferred/nice-to-have requirement must NEVER appear in missingSkills.
- General job responsibilities should NOT automatically become missing skills.
- Only explicit required technical qualifications belong in missingSkills.

═══════════════════════════════════════════════════
OUTPUT FIELD RULES
═══════════════════════════════════════════════════

matchedSkills:
- ONLY required technical skills/tools from the job posting that the candidate ACTUALLY possesses.
- Every item must have explicit evidence in the candidate data.
- Use the job's terminology where possible.
- Do NOT simply return all candidate skills.

missingSkills:
- ONLY technical skills that are (1) explicitly required by the job, (2) relevant to the role, and (3) NOT supported by candidate evidence.
- NEVER include preferred/nice-to-have skills here.
- NEVER include candidate skills or generic abilities here.

niceToHave:
- ONLY technologies or qualifications explicitly marked as preferred/optional/bonus/plus/desirable by the job posting.
- Do NOT put candidate skills or required skills here.

matchingExperience:
- 2-3 concrete pieces of evidence from the candidate's ACTUAL background.
- Prioritize: (1) directly matching professional work, (2) directly matching responsibilities, (3) relevant project experience, (4) clearly transferable experience.
- NEVER fabricate years of experience, team size, user counts, system scale, leadership, ownership, production usage, technologies, company size, or responsibilities.
- Do NOT say the candidate "led" something unless explicitly supported.
- Do NOT describe project experience as professional experience.

experienceGaps:
- Only meaningful gaps related to domain experience, responsibility scope, production experience, or required experience level.
- Return [] when there is no meaningful gap. Do NOT manufacture gaps.

relevantProjects:
- 1-3 projects ONLY when they provide direct evidence relevant to the job.
- A project is relevant because it demonstrates a required technology, responsibility, architecture, domain, or engineering capability.
- Do NOT select a project merely because it is impressive.
- Do NOT infer technologies not explicitly present in project data.
- projectTitle must EXACTLY match the candidate project's title.

unmetRequirements:
- ONLY important NON-TECHNICAL requirements the candidate clearly does not meet (e.g., required degree, certification, work authorization, location, language, years of experience, domain experience).
- NEVER put technical skills here.
- Do NOT assume the candidate lacks something solely because it is not mentioned, unless the job explicitly requires it.

seniorityLevel:
- Determine from actual evidence: professional experience, role level, complexity, ownership, production experience, leadership expectations, scope.
- Use exactly: "Good Match", "Slight Gap", or "Significant Gap".

keyStrengths:
- 2-3 specific strengths directly supported by candidate data.
- Avoid generic claims like "hard worker", "fast learner", "great communicator", "passionate developer" unless explicitly supported.

potentialGaps:
- 1-2 of the most important realistic risks.
- Avoid generic or manufactured gaps.

═══════════════════════════════════════════════════
SCORING
═══════════════════════════════════════════════════

matchPercentage (0-100) — evidence-based, using this conceptual weighting:
- Required technical skills: 50%
- Relevant professional experience: 25%
- Seniority/scope alignment: 15%
- Important non-skill requirements: 10%

Preferred/nice-to-have requirements should have little or no effect on the score.
Do NOT inflate the score because the candidate has many unrelated skills.
Missing a core mandatory requirement should materially reduce the score.

Score ranges:
- 90-100 = Excellent alignment
- 75-89 = Strong alignment
- 60-74 = Moderate alignment with meaningful gaps
- 40-59 = Weak alignment
- 0-39 = Major mismatch

recommendation:
- "apply" if matchPercentage >= 75
- "maybe" if matchPercentage 50-74
- "skip" if matchPercentage < 50

If a clearly critical mandatory requirement is missing, the recommendationReason must NOT describe the candidate as strongly qualified.

matchLabel:
- >= 80: "Strong Match"
- 65-79: "Good Match"
- 50-64: "Moderate Match"
- < 50: "Low Fit"

═══════════════════════════════════════════════════
ANTI-HALLUCINATION
═══════════════════════════════════════════════════

NEVER infer:
- A skill from an adjacent skill
- A framework from its ecosystem
- Experience from a job title alone
- Professional experience from a personal project
- Production experience from project existence
- Leadership from participation
- Domain expertise from unrelated work
- Years of experience unless supported by the supplied dates/data

When uncertain, ALWAYS choose the conservative interpretation.

═══════════════════════════════════════════════════
RESPONSE FORMAT
═══════════════════════════════════════════════════

Return STRICTLY a JSON object matching this schema (no markdown, no explanation):
{
  "matchPercentage": number,
  "matchLabel": "Strong Match" | "Good Match" | "Moderate Match" | "Low Fit",
  "recommendation": "apply" | "maybe" | "skip",
  "recommendationReason": string,
  "summary": string,
  "matchedSkills": string[],
  "missingSkills": string[],
  "matchingExperience": string[],
  "experienceGaps": string[],
  "relevantProjects": [{ "projectTitle": string, "relevanceNote": string }],
  "unmetRequirements": string[],
  "niceToHave": string[],
  "seniorityLevel": "Good Match" | "Slight Gap" | "Significant Gap",
  "seniorityAssessment": string,
  "keyStrengths": string[],
  "potentialGaps": string[]
}`;

    const userPrompt = `══════ CANDIDATE BACKGROUND ══════
${JSON.stringify(candidateProfile, null, 2)}

══════ JOB POSTING ══════
Role: ${targetJobTitle || "Not specified"}
Company: ${targetCompany || "Not specified"}

Description:
${cleanDescription}

══════ INSTRUCTIONS ══════
Evaluate the candidate ONLY from the supplied candidate data above. Do not assume missing information is true. Apply the strict technology aliasing and evidence rules from your system instructions.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.1,
      max_completion_tokens: 1200,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { success: false, error: "Failed to generate match analysis from AI." },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(content);

    // Run deterministic reconciliation against the database truth
    const reconciled = reconcileJobMatch({
      candidateSkills: candidateProfile.skills,
      rawMatchedSkills: Array.isArray(parsed.matchedSkills) ? parsed.matchedSkills : [],
      rawMissingSkills: Array.isArray(parsed.missingSkills) ? parsed.missingSkills : [],
      rawUnmetRequirements: Array.isArray(parsed.unmetRequirements) ? parsed.unmetRequirements : [],
      rawNiceToHave: Array.isArray(parsed.niceToHave) ? parsed.niceToHave : [],
      rawMatchingExperience: Array.isArray(parsed.matchingExperience)
        ? parsed.matchingExperience
        : Array.isArray(parsed.relevantExperience)
        ? parsed.relevantExperience
        : [],
      rawExperienceGaps: Array.isArray(parsed.experienceGaps) ? parsed.experienceGaps : [],
      rawRelevantProjects: Array.isArray(parsed.relevantProjects) ? parsed.relevantProjects : [],
      rawSeniorityLevel: parsed.seniorityLevel,
      rawSeniorityAssessment: parsed.seniorityAssessment,
      rawKeyStrengths: Array.isArray(parsed.keyStrengths) ? parsed.keyStrengths : [],
      rawPotentialGaps: Array.isArray(parsed.potentialGaps) ? parsed.potentialGaps : [],
      rawMatchPercentage: Number(parsed.matchPercentage) || 0,
    });

    // Normalize and validate final payload
    const sanitizedResult: JobMatchAnalysis = {
      matchPercentage: reconciled.matchPercentage,
      matchLabel: reconciled.matchLabel,
      recommendation: reconciled.recommendation,
      recommendationReason:
        parsed.recommendationReason ||
        (reconciled.recommendation === "apply"
          ? "Your core stack and past experiences strongly align with the requirements for this role."
          : reconciled.recommendation === "maybe"
          ? "You match several key areas, making this a viable stretch role with some learnable gaps."
          : "Significant prerequisites or core stack alignment are missing for this position."),
      summary: parsed.summary || "No summary provided.",
      matchedSkills: reconciled.matchedSkills,
      missingSkills: reconciled.missingSkills,
      matchingExperience: reconciled.matchingExperience,
      experienceGaps: reconciled.experienceGaps,
      relevantProjects: reconciled.relevantProjects,
      unmetRequirements: reconciled.unmetRequirements,
      niceToHave: reconciled.niceToHave,
      seniorityLevel: reconciled.seniorityLevel,
      seniorityAssessment: reconciled.seniorityAssessment,
      keyStrengths: reconciled.keyStrengths,
      potentialGaps: reconciled.potentialGaps,
      relevantExperience: reconciled.matchingExperience, // Legacy fallback
      analyzedAt: new Date().toISOString(),
    };

    // Persist analysis directly to Supabase if jobId belongs to user
    if (jobId) {
      const { error: updateError } = await supabase
        .from("job_applications")
        .update({
          ai_match_analysis: sanitizedResult,
          updated_at: new Date().toISOString(),
        })
        .eq("id", jobId)
        .eq("user_id", user.id);

      if (updateError) {
        console.warn("Could not save ai_match_analysis to database:", updateError);
      }
    }

    return NextResponse.json({
      success: true,
      data: sanitizedResult,
    });
  } catch (err: unknown) {
    console.error("Error in AI match route:", err);
    return NextResponse.json(
      {
        success: false,
        error: (err as Error)?.message || "Failed to analyze job match.",
      },
      { status: 500 }
    );
  }
}
