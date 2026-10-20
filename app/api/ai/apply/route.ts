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
            "title, project_type, live_url, bullets, sort_order"
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

    const sortedProjectsForPrompt = [...projectsData].sort((a, b) => {
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
    });

    const compactProjects = sortedProjectsForPrompt.slice(0, 5).map((proj) => {
      const typeLabel =
        proj.project_type === "capstone" || proj.project_type === "capstone_project"
          ? "Capstone Project"
          : proj.project_type === "side" || proj.project_type === "side_project"
          ? "Side Project"
          : "Key Project";
      const highlights = Array.isArray(proj.bullets)
        ? proj.bullets.filter(Boolean).slice(0, 3).join(" | ")
        : "";
      return `- ${proj.title} [${typeLabel}]${proj.live_url ? ` (${proj.live_url})` : ""}${highlights ? `: ${highlights}` : ""}`;
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
- Matched Skills For This Role: ${(targetMatchAnalysis.matchedSkills || []).join(", ") || "None"}
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
${candidateContactRow}

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
4. TARGET ROLE TITLE:
   - Auto-detect a clean, professional role title directly matching the target job (e.g. 'Web Developer', 'Front-End Developer', 'Full-Stack Developer', 'Software Engineer', 'React Developer', 'Mobile Developer').
   - STRICT RULE: Do NOT include seniority levels or prefixes in the role title (never write 'Mid-Level', 'Junior', 'Senior', 'Entry-Level', 'Lead', 'Principal', etc.).
   - Example: If the target role is 'Junior Web Developer', the clean role title is 'Web Developer'.
   - Example: If the target role is 'Mid-Level Full-stack React JS Developer', the clean role title is 'Full-Stack Developer' or 'Full-Stack React Developer'.
5. PROFESSIONAL SUMMARY AND ROLE TITLE ALIGNMENT:
   - CRITICAL REQUIREMENT: The 'PROFESSIONAL SUMMARY' opening MUST EXACTLY match the target role title chosen for the header.
   - If the target position is 'Web Developer', the summary MUST start by identifying as a Web Developer (e.g. "[Results-driven / Dedicated / Innovative] Web Developer with [X] years of experience in..." or "Web Developer with [X] years of experience...").
   - NEVER default or revert to 'Full-Stack Developer' unless 'Full-Stack Developer' is the actual target position.
   - The 'PROFESSIONAL SUMMARY' must be concise, punchy, and around 55–60 words, directly tailored to the role using verified experience.
6. TARGETED TECHNICAL SKILLS (SMART ATS CATEGORIZATION & STRICT JOB RELEVANCE):
   - STRICT JOB RELEVANCE: ONLY include candidate skills that are directly related to, required by, or mentioned in the job description, or that directly support the role's primary tech stack. Strictly exclude unrelated technologies (e.g. no PHP/WordPress on a React/Next.js role).
   - BALANCED, COHESIVE CATEGORIES (ANTI-FRAGMENTATION):
     * NEVER create awkward micro-categories with only 1 or 2 items (e.g. NEVER output "Version Control: Git" or "Performance Optimization: Lighthouse, Web Vitals" on their own lines).
     * Group tooling, version control, build tools, workflows, and performance into a single unified category:
       "Developer Tools & Practices: Git, GitHub, Cursor, Vite, Lighthouse, Core Web Vitals" (or "Tools & Performance: Git, Vite, Lighthouse, Web Vitals").
     * DO NOT dump all languages and frameworks into a single bloated "Frontend Technologies" line. Separate core languages from frameworks/libraries for clean ATS readability:
       - Languages: Core programming & markup languages (e.g. "Languages: TypeScript, JavaScript, HTML5, CSS3")
       - Frontend Frameworks & Libraries: UI frameworks, libraries, & styling (e.g. "Frontend Frameworks: React, Next.js, Vue.js, Tailwind CSS, Alpine.js")
       - Backend & Databases: Server, API, and DB tech (e.g. "Backend & Databases: Node.js, Supabase, PostgreSQL, REST APIs" — only if relevant to the role)
       - Tools & Performance: VCS, build tools, performance & SEO (e.g. "Tools & Performance: Git, GitHub, Vite, Lighthouse, Web Vitals")
   - CANONICAL EXAMPLES:
     * Frontend role example:
       Languages: TypeScript, JavaScript, HTML5, CSS3
       Frontend Frameworks: React, Next.js, Vue.js, Tailwind CSS, Alpine.js
       Tools & Performance: Git, GitHub, Lighthouse, Web Vitals, Vite
     * Full-Stack role example:
       Languages: TypeScript, JavaScript, SQL, HTML5, CSS3
       Frontend: React, Next.js, Tailwind CSS
       Backend & Databases: Node.js, Supabase, PostgreSQL, RESTful APIs
       Tools & Practices: Git, GitHub, Vite, Lighthouse
   - All included skills MUST come from the candidate's verified profile, experiences, or projects. NEVER fabricate or hallucinate unverified skills.
   - Domain Accuracy: Firebase and Supabase belong under Databases/Backend or BaaS, NEVER under CMS.
   - Format each category line strictly as: "Category Name: Skill1, Skill2, Skill3".

Return JSON matching:
{
  "title": string, // e.g. "Tailored Resume - [Job Title]"
  "content": string, // ATS Resume text starting with Header, PROFESSIONAL SUMMARY, and TECHNICAL SKILLS
  "keyPointsUsed": string[] // 2-3 brief bullet points of verified candidate strengths leveraged
}`;
        taskInstructions = `Generate the single-column ATS Resume header, PROFESSIONAL SUMMARY, and TECHNICAL SKILLS for "${targetJobTitle}" at ${targetCompany || "the company"}.

Follow this EXACT layout structure:

${(profileData?.name || "Candidate").toUpperCase()}
[Clean Role Title matching "${targetJobTitle}" without seniority prefixes, e.g. Web Developer / Front-End Developer / Software Engineer / Full-Stack Developer. Omit 'Mid-Level', 'Junior', 'Senior', etc.]
${candidateContactRow}

PROFESSIONAL SUMMARY
--------------------
[A strong, concise professional summary of around 55–60 words. The opening sentence MUST start by matching the target role title (e.g., "[Results-driven / Dedicated] [Clean Role Title matching '${targetJobTitle}'] with [X] years of experience in..."). Highlight candidate's verified technical experience, key achievements, and direct value to ${targetCompany || "the company"}. NEVER use 'Full-Stack Developer' unless the target role is actually Full-Stack Developer.]

TECHNICAL SKILLS
----------------
[Organize ONLY verified candidate skills that are directly relevant to the job description into smart, balanced, ATS-friendly categories.
- NO MICRO-CATEGORIES: NEVER output 1-2 item lines like "Version Control: Git" or "Performance Optimization: Lighthouse, Web Vitals". Combine tooling, VCS, and performance together into a cohesive line (e.g. "Tools & Performance: Git, Vite, Lighthouse, Web Vitals").
- SEPARATE LANGUAGES & FRAMEWORKS: Do NOT lump all languages, frameworks, and styling into one bloated line. Keep "Languages: TypeScript, JavaScript, HTML5, CSS3" and "Frontend Frameworks: React, Next.js, Vue.js, Tailwind CSS" clean and distinct.
- Format strictly as:
Category Name: Skill1, Skill2, Skill3]`;
        break;
    }

    const userPrompt = `CANDIDATE PROFILE:
${candidateProfileText}

${matchContextText ? `${matchContextText}\n\n` : ""}TARGET ROLE: ${targetJobTitle || "Role"} at ${targetCompany || "Company"}
JOB REQUIREMENTS:
${cleanDescription}

TASK:
${taskInstructions}

NOTE FOR TECHNICAL SKILLS:
1. Select ONLY the candidate's verified skills that are related to or included in this job description.
2. Be smart with categorization: Never output 1-2 item lines like "Version Control: Git" or "Performance Optimization: Lighthouse, Web Vitals". Combine tooling, VCS, and performance under "Tools & Performance" or "Developer Tools".
3. Keep Languages (TypeScript, JavaScript, HTML5, CSS3) and Frameworks/Libraries (React, Next.js, Tailwind CSS) clean and distinct instead of bloated under one giant line.`;

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

    // If generating resume, append verified database sections (PROFESSIONAL EXPERIENCE, PROJECTS, EDUCATION)
    if (contentType === "resume-suggestions") {
      // Strip any hallucinated sections if the model generated beyond TECHNICAL SKILLS
      const trailingSectionRegex = /\n+(?:PROFESSIONAL\s+EXPERIENCE|PROJECTS|KEY\s+PROJECTS|SIDE\s+PROJECTS|CAPSTONE\s+PROJECTS?|EDUCATION)\s*(?:\n[-=_\s]*\n|\n|$)/i;
      const match = finalContent.match(trailingSectionRegex);
      if (match && match.index !== undefined) {
        finalContent = finalContent.slice(0, match.index).trim();
      }

      // 1. Append verified database PROFESSIONAL EXPERIENCE directly without hallucination
      if (experienceData.length > 0) {
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
        finalContent = `${finalContent.trim()}${experienceSectionText}`;
      }

      // 2. Append verified database PROJECTS directly next to PROFESSIONAL EXPERIENCE (Pure CRUD, no AI hallucination)
      if (projectsData.length > 0) {
        const sortedProjects = [...projectsData].sort((a, b) => {
          if (a.sort_order !== undefined && b.sort_order !== undefined && a.sort_order !== b.sort_order) {
            return a.sort_order - b.sort_order;
          }
          return 0;
        });

        const keyProjects = sortedProjects.filter(
          (p) => !p.project_type || p.project_type === "key"
        );
        const capstoneProjects = sortedProjects.filter(
          (p) => p.project_type === "capstone" || p.project_type === "capstone_project"
        );
        const sideProjects = sortedProjects.filter(
          (p) => p.project_type === "side" || p.project_type === "side_project"
        );

        const renderProjBlocks = (projs: typeof sortedProjects) =>
          projs.map((proj) => {
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

        const sectionParts: string[] = [];

        // If candidate only has one single type of project and it's key (default)
        if (capstoneProjects.length === 0 && sideProjects.length === 0) {
          const blocks = renderProjBlocks(keyProjects);
          sectionParts.push(`\n\nKEY PROJECTS\n------------\n${blocks.join("\n\n")}`);
        } else {
          // Order strictly: 1. Key Projects, 2. Side Projects, 3. Capstone Project
          if (keyProjects.length > 0) {
            const blocks = renderProjBlocks(keyProjects);
            sectionParts.push(`\n\nKEY PROJECTS\n------------\n${blocks.join("\n\n")}`);
          }
          if (sideProjects.length > 0) {
            const blocks = renderProjBlocks(sideProjects);
            sectionParts.push(`\n\nSIDE PROJECTS\n-------------\n${blocks.join("\n\n")}`);
          }
          if (capstoneProjects.length > 0) {
            const header = capstoneProjects.length > 1 ? "CAPSTONE PROJECTS" : "CAPSTONE PROJECT";
            const underline = "-".repeat(header.length);
            const blocks = renderProjBlocks(capstoneProjects);
            sectionParts.push(`\n\n${header}\n${underline}\n${blocks.join("\n\n")}`);
          }
        }

        if (sectionParts.length > 0) {
          finalContent = `${finalContent.trim()}${sectionParts.join("")}`;
        }
      }

      // 3. Append verified database EDUCATION directly without hallucination
      if (educationData.length > 0) {
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
