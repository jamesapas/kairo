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
          .select("title, project_type, live_url, bullets, sort_order")
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
      projects: [...projectsData]
        .sort((a, b) => {
          const typePrio: Record<string, number> = { key: 1, side: 2, capstone: 3 };
          const aType = a.project_type || "key";
          const bType = b.project_type || "key";
          const prioA = typePrio[aType] ?? 99;
          const prioB = typePrio[bType] ?? 99;
          if (prioA !== prioB) return prioA - prioB;
          if (a.sort_order !== undefined && b.sort_order !== undefined && a.sort_order !== b.sort_order) {
            return a.sort_order - b.sort_order;
          }
          return 0;
        })
        .slice(0, 6)
        .map((proj) => ({
          title: proj.title,
          projectType:
            proj.project_type === "capstone" || proj.project_type === "capstone_project"
              ? "Capstone Project"
              : proj.project_type === "side" || proj.project_type === "side_project"
              ? "Side Project"
              : "Key Project",
          liveUrl: proj.live_url || undefined,
          highlights: Array.isArray(proj.bullets) ? proj.bullets.filter(Boolean) : [],
        })),
      education: educationData.map((edu) => ({
        degree: edu.degree,
        school: edu.school,
        fieldOfStudy: edu.field_of_study || "",
        period: [edu.start_year, edu.is_current ? "Present" : edu.end_year].filter(Boolean).join(" - "),
        honors: edu.honors || "",
      })),
    };

    // Clean and cap description to 3500 chars to avoid spending tokens on footers/legal disclaimers
    const cleanDescription = targetDescription.trim().slice(0, 3500);

    const openai = new OpenAI({ apiKey });

    const systemPrompt = `You are Kairo's Senior Technical Recruiter and Career Advisor AI.
Conduct a structured, high-signal, and objective Job Match Analysis comparing the candidate's background against the job posting.

IMPORTANT GUIDELINES FOR ACCURACY & RELIABILITY:

1. SKILLS BREAKDOWN (Source of Truth is CANDIDATE BACKGROUND.skills & demonstrated project technologies):
   - "matchedSkills": Required technical skills & tools mentioned in the job that the candidate POSSESSES (account for aliases like PHP/Laravel, Node.js/Node, Redux/Redux Toolkit, GraphQL/Apollo, React/React.js, TypeScript/TS, Postgres/PostgreSQL).
   - "missingSkills": STRICTLY required technical skills that the candidate truly DOES NOT have. DO NOT put skills the candidate has here.
   - "niceToHave": List optional / bonus / preferred technologies mentioned in the job. Separate these from strictly required skills.

2. REQUIREMENTS GAP ANALYSIS:
   - "unmetRequirements": ONLY important NON-SKILL requirements that the candidate does NOT meet. If candidate meets all non-skill requirements, return [].

3. SENIORITY ASSESSMENT:
   - "seniorityLevel": "Good Match" | "Slight Gap" | "Significant Gap"
   - "seniorityAssessment": 1-2 sentences assessing seniority alignment.

4. KAIRO'S ASSESSMENT:
   - "keyStrengths": 2 to 3 bullet points highlighting candidate's competitive advantages across skills and qualifications.
   - "potentialGaps": 1 to 2 constructive bullet points highlighting main risks.

5. OVERALL RECOMMENDATION & SCORE:
   - "matchPercentage": 0 - 100 percentage. Factor in skills match, qualifications, and seniority alignment.
   - "recommendation": "apply" (>= 75% match), "maybe" (50-74% match), or "skip" (< 50% match).
   - "recommendationReason": 1 sentence reason.
   - "summary": 2 sentence executive synthesis.

Return the response STRICTLY as a JSON object matching this schema:
{
  "matchPercentage": number,
  "matchLabel": "Strong Match" | "Good Match" | "Moderate Match" | "Low Fit",
  "recommendation": "apply" | "maybe" | "skip",
  "recommendationReason": string,
  "summary": string,
  "matchedSkills": string[],
  "missingSkills": string[],
  "unmetRequirements": string[],
  "niceToHave": string[],
  "seniorityLevel": "Good Match" | "Slight Gap" | "Significant Gap",
  "seniorityAssessment": string,
  "keyStrengths": string[],
  "potentialGaps": string[]
}`;

    const userPrompt = `CANDIDATE BACKGROUND:
${JSON.stringify(candidateProfile)}

JOB POSTING:
Role: ${targetJobTitle || "Not specified"}
Company: ${targetCompany || "Not specified"}
Description:
${cleanDescription}

Evaluate the match thoroughly adhering strictly to the candidate's actual skills, experiences, and projects.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.1,
      max_completion_tokens: 900,
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
      unmetRequirements: reconciled.unmetRequirements,
      niceToHave: reconciled.niceToHave,
      seniorityLevel: reconciled.seniorityLevel,
      seniorityAssessment: reconciled.seniorityAssessment,
      keyStrengths: reconciled.keyStrengths,
      potentialGaps: reconciled.potentialGaps,
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
