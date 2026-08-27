import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
import {
  ApplyContentType,
  ApplyContentResponse,
  APPLY_CONTENT_TYPES,
} from "@/types/ai-apply";
import { JobMatchAnalysis } from "@/types/ai-match";

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
    const {
      jobId,
      jobTitle,
      company,
      description: customDescription,
      contentType,
    } = body as {
      jobId?: string;
      jobTitle?: string;
      company?: string;
      description?: string;
      contentType?: ApplyContentType;
    };

    if (!contentType || !APPLY_CONTENT_TYPES[contentType]) {
      return NextResponse.json(
        {
          success: false,
          error: "A valid contentType is required (cover-letter, application-message, resume-suggestions).",
        },
        { status: 400 }
      );
    }

    let targetJobTitle = jobTitle || "";
    let targetCompany = company || "";
    let targetDescription = customDescription || "";
    let targetMatchAnalysis: JobMatchAnalysis | null = null;

    if (jobId) {
      const { data: jobData, error: jobError } = await supabase
        .from("job_applications")
        .select("job_title, company, description, ai_match_analysis")
        .eq("id", jobId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (!jobError && jobData) {
        targetJobTitle = targetJobTitle || jobData.job_title || "";
        targetCompany = targetCompany || jobData.company || "";
        targetDescription = targetDescription || jobData.description || "";
        targetMatchAnalysis = (jobData.ai_match_analysis as JobMatchAnalysis) || null;
      }
    }

    if (!targetDescription || !targetDescription.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Job description is required to generate tailored application materials.",
        },
        { status: 400 }
      );
    }

    // Fetch user profile data from Supabase (Source of Truth)
    const [profileRes, skillsRes, experienceRes, educationRes, projectsRes] =
      await Promise.all([
        supabase
          .from("users")
          .select("name, email, location, career_summary, links")
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
            "job_title, company_name, workplace_type, location, start_month, start_year, end_month, end_year, is_current, bullets, sort_order"
          )
          .eq("user_id", user.id)
          .order("sort_order", { ascending: true })
          .order("start_year", { ascending: false }),
        supabase
          .from("user_educations")
          .select(
            "school, degree, field_of_study, start_month, start_year, end_month, end_year, is_current, location, honors, sort_order"
          )
          .eq("user_id", user.id)
          .order("sort_order", { ascending: true })
          .order("start_year", { ascending: false }),
        supabase
          .from("user_projects")
          .select(
            "title, live_url, bullets, sort_order"
          )
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

    // Compact, token-efficient candidate profile formatting
    const compactExperiences = experienceData.slice(0, 5).map((exp) => {
      const highlights = Array.isArray(exp.bullets)
        ? exp.bullets.filter(Boolean).slice(0, 4).join(" | ")
        : "";
      return `- ${exp.job_title} at ${exp.company_name} (${exp.start_year || ""}-${exp.is_current ? "Present" : exp.end_year || ""})${highlights ? `: ${highlights}` : ""}`;
    }).join("\n");

    const compactProjects = projectsData.slice(0, 3).map((proj) => {
      const highlights = Array.isArray(proj.bullets)
        ? proj.bullets.filter(Boolean).slice(0, 3).join(" | ")
        : "";
      return `- ${proj.title}${proj.live_url ? ` (${proj.live_url})` : ""}${highlights ? `: ${highlights}` : ""}`;
    }).join("\n");

    const compactEducation = educationData.slice(0, 2).map((edu) => {
      return `- ${edu.degree || ""} in ${edu.field_of_study || "General"} from ${edu.school || ""} (${edu.start_year || ""}-${edu.end_year || ""})`;
    }).join("\n");

    const candidateProfileText = `Name: ${profileData?.name || "Candidate"}
${profileData?.location ? `Location: ${profileData.location}\n` : ""}${profileData?.career_summary ? `Summary: ${profileData.career_summary}\n` : ""}Skills: ${candidateSkillsUnique.join(", ") || "None listed"}
${compactExperiences ? `Experience:\n${compactExperiences}\n` : ""}${compactProjects ? `Projects:\n${compactProjects}\n` : ""}${compactEducation ? `Education:\n${compactEducation}` : ""}`.trim();

    // Extract key AI match context if available (concise)
    const matchContextText = targetMatchAnalysis
      ? `MATCH INSIGHTS:
- Score: ${targetMatchAnalysis.matchPercentage}%
- Matched Skills: ${(targetMatchAnalysis.matchedSkills || []).slice(0, 8).join(", ") || "None"}
- Key Strengths: ${(targetMatchAnalysis.keyStrengths || []).slice(0, 3).join("; ") || "None"}`
      : "";

    // Clean and cap job description to prevent token waste from legal/footer disclaimers
    const cleanDescription = targetDescription.trim().slice(0, 3200);

    // Extract candidate location from profile (only if added by user)
    const candidateLocation = profileData?.location?.trim() || "";

    const rawLinks = Array.isArray(profileData?.links) ? profileData.links : [];
    const formattedLinks = rawLinks
      .map((l: { url?: string; label?: string }) => {
        if (!l?.url) return "";
        return l.url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
      })
      .filter(Boolean);
    const formattedLinksStr = formattedLinks.join(" | ");
    const candidateContactRow = [candidateLocation, profileData?.email, formattedLinksStr]
      .filter(Boolean)
      .join(" | ");

    const formattedDate = new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    // Build specific prompt instructions and set strict max token ceilings
    let taskInstructions = "";
    let systemPrompt = "";
    let maxTokens = 500;

    switch (contentType) {
      case "cover-letter":
        maxTokens = 900;
        systemPrompt = `You are Kairo's AI Career Co-Pilot specializing in writing authentic, formal, executive-ready Cover Letters.
STRICT RULES:
1. ONLY use verified skills, experiences, and education provided in the candidate context.
2. DO NOT invent or assume any unlisted companies, tools, metrics, or credentials.
3. DO NOT invent imaginary street addresses, postal codes, building names, or fake recipient addresses for the company. Only use the company name (and city/location ONLY IF explicitly mentioned in the job description).
4. Output must follow a clean, formal letter structure with Candidate Header, Date, Recipient block, Subject line ('Re: ... Application'), formal salutation, 3-4 structured body paragraphs, and formal closing.

Return JSON matching:
{
  "title": string, // e.g. "Cover Letter for [Job Title]"
  "content": string, // Full formal cover letter text formatted with proper line breaks
  "keyPointsUsed": string[] // 2-3 brief bullet points of verified candidate strengths leveraged
}`;
        taskInstructions = `Generate a formal, beautifully structured Cover Letter for "${targetJobTitle}" at ${targetCompany || "the company"}.

Follow this EXACT layout structure:

${(profileData?.name || "Candidate").toUpperCase()}
${candidateLocation ? `${candidateLocation}\n` : ""}${candidateContactRow}

${formattedDate}

Hiring Manager
${targetCompany || "Hiring Team"}

Re: ${targetJobTitle || "Role"} Application

Dear Hiring Manager,

[Paragraph 1: Clear application intent for the ${targetJobTitle || "role"} at ${targetCompany || "the company"}. Highlight total verified years of experience and core technical capabilities from profile.]

[Paragraph 2: Specific hands-on accomplishments and technical tools from candidate's verified experience (e.g. frontend/backend systems, APIs, responsive design, performance optimization) matching the role requirements.]

[Paragraph 3: Motivation for joining ${targetCompany || "the team"}, alignment with the role, problem-solving mindset, and willingness to learn and contribute.]

[Paragraph 4: Thank them for considering the application, and state enthusiastic anticipation to discuss how candidate can contribute to the team.]

Sincerely,
${profileData?.name || "Candidate"}`;
        break;

      case "application-message":
        maxTokens = 300;
        systemPrompt = `You are Kairo's AI Career Co-Pilot specializing in concise recruiter outreach and application notes.
STRICT RULES:
1. ONLY use verified skills, experiences, and education provided in the candidate context.
2. DO NOT invent or assume any unlisted companies, tools, metrics, or credentials.
3. Keep it punchy, professional, and directly relevant (100-140 words).

Return JSON matching:
{
  "title": string,
  "content": string,
  "keyPointsUsed": string[] // 2-3 brief bullet points of verified candidate strengths leveraged
}`;
        taskInstructions = `Generate a punchy 2-paragraph outreach note (approx. 100-140 words) for recruiter messages or portal notes.
- Brief greeting, core match points from verified skills, and interest in ${targetCompany || "this role"}.
- Sign-off with name: "${profileData?.name || "Candidate"}".`;
        break;

      case "resume-suggestions":
        maxTokens = 850;
        systemPrompt = `You are Kairo's AI Career Co-Pilot specializing in generating single-column, ATS-friendly resumes.
ABSOLUTE STRICT RULES:
1. ONLY use verified skills, experiences, and career history provided in the candidate context.
2. DO NOT invent or assume any unlisted companies, tools, metrics, or credentials.
3. DO NOT write letters, greetings ('Dear...'), or conversational filler.
4. Auto-detect a clean, professional role title based on the target job (e.g. 'Full-Stack Developer', 'Front-End Developer', 'Full-Stack React Developer', 'Software Engineer', 'Mobile Developer').
   - STRICT RULE: Do NOT include seniority levels or prefixes (never write 'Mid-Level', 'Junior', 'Senior', 'Entry-Level', 'Lead', 'Principal', etc.).
   - Example: If the target role is 'Mid-Level Full-stack React JS Developer', output 'Full-Stack Developer' or 'Full-Stack React Developer'.
5. Generate the tailored Resume Header, 'PROFESSIONAL SUMMARY', and 'TECHNICAL SKILLS' sections.
   - The 'PROFESSIONAL SUMMARY' must be concise, punchy, and around 55–60 words, directly tailored to the role using verified experience.
6. In 'TECHNICAL SKILLS', dynamically generate 3 to 4 natural, well-targeted categories that directly match what the job description is looking for. DO NOT force 5 categories if it causes awkward, redundant, or inaccurate groupings.
   - Strict Domain Categorization Rules:
     * Databases / BaaS / Backend: Firebase, Supabase, PostgreSQL, MySQL, MongoDB, Node.js, Express, REST APIs. (CRITICAL: Firebase is a Backend-as-a-Service/Database platform, NEVER classify Firebase as a CMS).
     * CMS: WordPress, Statamic, Strapi, Sanity, Shopify, Contentful.
     * Frontend: Next.js, React, Tailwind CSS, HTML/CSS, Responsive Web Design.
     * Languages: TypeScript, JavaScript, HTML5, CSS3, SQL, PHP, Python.
     * Tools & Practices: Git, GitHub, Cursor, Vite, Web Performance (Lighthouse, Core Web Vitals), SEO Best Practices, Agile Development.
   - Do NOT create micro-categories with only 1 or 2 items (e.g. do not create a separate 'Performance Optimization' category when Lighthouse/Web Vitals naturally belong under 'Tools & Practices' or 'Frontend').
   - Keep categories cohesive, accurate, and relevant.
   - Format each category line as: "Category Name: Skill1, Skill2, Skill3".

Return JSON matching:
{
  "title": string, // e.g. "Tailored Resume - [Job Title]"
  "content": string, // ATS Resume text starting with Header, PROFESSIONAL SUMMARY, and TECHNICAL SKILLS
  "keyPointsUsed": string[] // 2-3 brief bullet points of verified candidate strengths leveraged
}`;
        taskInstructions = `Generate the single-column ATS Resume header, PROFESSIONAL SUMMARY, and TECHNICAL SKILLS for "${targetJobTitle}" at ${targetCompany || "the company"}.

Follow this EXACT layout structure:

${(profileData?.name || "Candidate").toUpperCase()}
[Clean Role Title without seniority prefixes, e.g. Full-Stack Developer / Front-End Developer / Software Engineer. Omit 'Mid-Level', 'Junior', 'Senior', etc.]
${candidateContactRow}

PROFESSIONAL SUMMARY
--------------------
[A strong, concise professional summary of around 55–60 words tailored directly to "${targetJobTitle}". Highlight candidate's verified technical experience, key achievements, and direct value to ${targetCompany || "the company"}. Do not invent unverified tools.]

TECHNICAL SKILLS
----------------
[3-4 natural, cohesive categories tailored to what the job description requires from the candidate's verified background. Examples:
Languages: TypeScript, JavaScript, HTML5, CSS3
Frontend: Next.js, React, Tailwind CSS, Responsive Web Design
Databases & Backend: Supabase, Firebase, Node.js, RESTful APIs
Tools & Practices: Git, GitHub, Cursor, Web Performance (Lighthouse, Web Vitals), SEO Best Practices

Strict accuracy: Firebase belongs in Databases/Backend, NEVER in CMS. Do not force 5 categories if 3 or 4 are more cohesive and accurate.]`;
        break;
    }

    const userPrompt = `CANDIDATE PROFILE:
${candidateProfileText}

${matchContextText ? `${matchContextText}\n\n` : ""}TARGET ROLE: ${targetJobTitle || "Role"} at ${targetCompany || "Company"}
JOB REQUIREMENTS:
${cleanDescription}

TASK:
${taskInstructions}`;

    const openai = new OpenAI({ apiKey });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      max_completion_tokens: maxTokens,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const rawResponse = completion.choices[0]?.message?.content;
    if (!rawResponse) {
      throw new Error("No response received from OpenAI.");
    }

    const parsed = JSON.parse(rawResponse);
    let finalContent = parsed.content || "";

    // If generating resume, append verified database PROFESSIONAL EXPERIENCE directly without hallucination
    if (contentType === "resume-suggestions" && experienceData.length > 0) {
      const sortedExperiences = [...experienceData].sort((a, b) => {
        if (a.sort_order !== undefined && b.sort_order !== undefined && a.sort_order !== b.sort_order) {
          return a.sort_order - b.sort_order;
        }
        if (a.is_current && !b.is_current) return -1;
        if (!a.is_current && b.is_current) return 1;
        const aEnd = parseInt(a.end_year || a.start_year || "0", 10);
        const bEnd = parseInt(b.end_year || b.start_year || "0", 10);
        if (aEnd !== bEnd) return bEnd - aEnd;
        const aStart = parseInt(a.start_year || "0", 10);
        const bStart = parseInt(b.start_year || "0", 10);
        return bStart - aStart;
      });

      const expBlocks = sortedExperiences.map((exp) => {
        const startPart = [exp.start_month, exp.start_year].filter(Boolean).join(" ");
        const endPart = exp.is_current
          ? "Present"
          : [exp.end_month, exp.end_year].filter(Boolean).join(" ");
        const dateRange = startPart && endPart ? `${startPart} – ${endPart}` : startPart || endPart || "";

        // Line 1: Job Title on the left, Date Range on the right
        const titleDateLine = dateRange ? `${exp.job_title} | ${dateRange}` : exp.job_title;

        // Line 2: Company, Location (Workplace Type) e.g. "Company Here, Banbridge, UK (Remote)"
        const locationStr = exp.location?.trim() ? `, ${exp.location.trim()}` : "";
        const workplaceStr = exp.workplace_type?.trim() ? ` (${exp.workplace_type.trim()})` : "";
        const companyLine = `${exp.company_name}${locationStr}${workplaceStr}`;

        const bulletLines = Array.isArray(exp.bullets)
          ? exp.bullets
              .filter(Boolean)
              .map((b: string) => `• ${b.trim()}`)
              .join("\n")
          : "";

        return [titleDateLine, companyLine, bulletLines].filter(Boolean).join("\n");
      });

      const experienceSectionText = `\n\nPROFESSIONAL EXPERIENCE\n-----------------------\n${expBlocks.join("\n\n")}`;
      if (!finalContent.toUpperCase().includes("PROFESSIONAL EXPERIENCE")) {
        finalContent = `${finalContent.trim()}${experienceSectionText}`;
      }
    }

    // If generating resume, append verified database PROJECTS directly next to PROFESSIONAL EXPERIENCE (Pure CRUD, no AI hallucination)
    if (contentType === "resume-suggestions" && projectsData.length > 0) {
      const sortedProjects = [...projectsData].sort((a, b) => {
        if (a.sort_order !== undefined && b.sort_order !== undefined && a.sort_order !== b.sort_order) {
          return a.sort_order - b.sort_order;
        }
        return 0;
      });

      const projBlocks = sortedProjects.map((proj) => {
        // Line 1: Project Title | Live URL (if provided)
        const titleLine = proj.live_url?.trim()
          ? `${proj.title.trim()} | ${proj.live_url.trim()}`
          : proj.title.trim();

        const bulletLines = Array.isArray(proj.bullets)
          ? proj.bullets
              .filter(Boolean)
              .map((b: string) => `• ${b.trim()}`)
              .join("\n")
          : "";

        return [titleLine, bulletLines].filter(Boolean).join("\n");
      });

      const projectsSectionText = `\n\nPROJECTS\n--------\n${projBlocks.join("\n\n")}`;
      if (!finalContent.toUpperCase().includes("PROJECTS")) {
        finalContent = `${finalContent.trim()}${projectsSectionText}`;
      }
    }

    // If generating resume, append verified database EDUCATION directly without hallucination
    if (contentType === "resume-suggestions" && educationData.length > 0) {
      const sortedEducations = [...educationData].sort((a, b) => {
        if (a.sort_order !== undefined && b.sort_order !== undefined && a.sort_order !== b.sort_order) {
          return a.sort_order - b.sort_order;
        }
        if (a.is_current && !b.is_current) return -1;
        if (!a.is_current && b.is_current) return 1;
        const aEnd = parseInt(a.end_year || a.start_year || "0", 10);
        const bEnd = parseInt(b.end_year || b.start_year || "0", 10);
        if (aEnd !== bEnd) return bEnd - aEnd;
        const aStart = parseInt(a.start_year || "0", 10);
        const bStart = parseInt(b.start_year || "0", 10);
        return bStart - aStart;
      });

      const eduBlocks = sortedEducations.map((edu) => {
        // Line 1: Course (Degree + Field of study) | Date Range
        const courseTitle = edu.field_of_study
          ? `${edu.degree || ""} in ${edu.field_of_study}`.trim()
          : edu.degree || "Education";
        const startPart = [edu.start_month, edu.start_year].filter(Boolean).join(" ");
        const endPart = edu.is_current
          ? "Present"
          : [edu.end_month, edu.end_year].filter(Boolean).join(" ");
        const dateRange = startPart && endPart ? `${startPart} – ${endPart}` : startPart || endPart || "";
        const titleDateLine = dateRange ? `${courseTitle} | ${dateRange}` : courseTitle;

        // Line 2: School (with optional location)
        const schoolLine = edu.school ? `${edu.school}${edu.location ? `, ${edu.location}` : ""}` : "";

        // Line 3: Award / Honors (if any)
        const awardLine = edu.honors?.trim() || "";

        return [titleDateLine, schoolLine, awardLine].filter(Boolean).join("\n");
      });

      const educationSectionText = `\n\nEDUCATION\n---------\n${eduBlocks.join("\n\n")}`;
      if (!finalContent.toUpperCase().includes("EDUCATION")) {
        finalContent = `${finalContent.trim()}${educationSectionText}`;
      }
    }

    const data: ApplyContentResponse = {
      contentType,
      title: parsed.title || APPLY_CONTENT_TYPES[contentType].title,
      content: finalContent,
      keyPointsUsed: Array.isArray(parsed.keyPointsUsed) ? parsed.keyPointsUsed : [],
      generatedAt: new Date().toISOString(),
    };

    // Auto-save generated materials to database if jobId is provided
    if (jobId) {
      try {
        const { data: currentJob } = await supabase
          .from("job_applications")
          .select("ai_apply_materials")
          .eq("id", jobId)
          .eq("user_id", user.id)
          .maybeSingle();

        const currentMaterials =
          (currentJob?.ai_apply_materials as Record<string, unknown>) || {};
        const updatedMaterials = {
          ...currentMaterials,
          [contentType]: {
            title: data.title,
            content: data.content,
            keyPointsUsed: data.keyPointsUsed,
            updatedAt: data.generatedAt,
          },
        };

        await supabase
          .from("job_applications")
          .update({
            ai_apply_materials: updatedMaterials,
            updated_at: new Date().toISOString(),
          })
          .eq("id", jobId)
          .eq("user_id", user.id);
      } catch (saveErr) {
        console.error("Failed to auto-save generated material to DB:", saveErr);
      }
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: unknown) {
    console.error("AI Apply API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error)?.message || "Failed to generate application materials.",
      },
      { status: 500 }
    );
  }
}
