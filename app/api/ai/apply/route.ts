import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
import {
  ApplyContentType,
  ApplyContentResponse,
  APPLY_CONTENT_TYPES,
  VideoScriptData,
} from "@/types/ai-apply";
import { JobMatchAnalysis } from "@/types/ai-match";
import { richHtmlToPlainText } from "@/lib/utils/job-description";
import { ensureAiDevelopmentTools } from "@/lib/utils/resume-editor";

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
      candidateNotes,
    } = body as {
      jobId?: string;
      jobTitle?: string;
      company?: string;
      description?: string;
      contentType?: ApplyContentType;
      candidateNotes?: string;
    };

    if (!contentType || !APPLY_CONTENT_TYPES[contentType]) {
      return NextResponse.json(
        {
          success: false,
          error: "A valid contentType is required (cover-letter, application-message, resume-suggestions, video-script).",
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
      const dates = [edu.start_year, edu.end_year].filter(Boolean).join("-");
      return `- ${edu.degree || ""} in ${edu.field_of_study || "General"} from ${edu.school || ""}${dates ? ` (${dates})` : ""}`;
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
    const cleanDescription = richHtmlToPlainText(targetDescription).trim().slice(0, 3600);

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

    // Extract portfolio URL from profile links
    const portfolioLinkObj =
      rawLinks.find((l: { platform?: string; label?: string; url?: string }) => {
        const p = (l.platform || "").toLowerCase();
        const label = (l.label || "").toLowerCase();
        return (
          p === "website" ||
          p === "portfolio" ||
          label.includes("portfolio") ||
          label.includes("website")
        );
      }) ||
      rawLinks.find((l: { platform?: string; url?: string }) => {
        const p = (l.platform || "").toLowerCase();
        return p !== "github" && p !== "linkedin" && p !== "twitter" && p !== "x";
      });
    const portfolioUrl = portfolioLinkObj?.url?.trim() || "[link]";

    // Calculate verified years of experience from profile history
    let yearsOfExp = 0;
    const startYears = experienceData
      .map((e) => parseInt(e.start_year || "0", 10))
      .filter((y) => y > 1990 && y <= new Date().getFullYear());
    if (startYears.length > 0) {
      const earliestYear = Math.min(...startYears);
      yearsOfExp = Math.max(1, new Date().getFullYear() - earliestYear);
    }

    const candidateFullName = profileData?.name?.trim() || "Candidate";
    const candidateSignOff = candidateFullName === "James Karl Apas" ? "James Karl" : candidateFullName;

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
        maxTokens = 1400;
        systemPrompt = `You are Kairo's AI Career Co-Pilot specializing in writing authentic, high-impact, executive-ready Cover Letters.

### CORE PRINCIPLE
THE JOB DESCRIPTION DETERMINES WHAT THE CANDIDATE SHOULD TALK ABOUT. THE CANDIDATE'S PROFILE, RÉSUMÉ, AND PROJECTS PROVIDE THE EVIDENCE.
Do not generate a generic cover letter summarizing the candidate's general background with boilerplate filler. Analyze the job description deeply first, identify the employer's highest priorities, required tech stack, and primary domain, and build the letter directly around those needs.

### 1. CLOSEST ROLE & EXPERIENCE MATCHING (CRITICAL PRIORITY)
- IDENTIFY THE PRIMARY DOMAIN of the target role (e.g. Full Stack Developer, Frontend Developer, Backend Engineer, Mobile Developer, DevOps Engineer, etc.).
- ALWAYS MATCH THE CLOSEST RELEVANT EXPERIENCE: When presenting the candidate's professional background, past roles, and accomplishments, ALWAYS feature and emphasize the experience that is closest in title, scope, and technical depth to the target role.
- CRITICAL FULL-STACK EXAMPLE:
  * If the candidate is applying for "Full Stack Developer" (or Full Stack Engineer), the letter MUST highlight the candidate's verified Full Stack engineering capabilities (both frontend client architecture AND backend APIs, databases, microservices, and server-side logic).
  * DO NOT narrow or reduce the candidate's narrative to merely "Frontend Developer" if they have verified full-stack experience, full-stack projects, or backend skills in their profile!
  * If their most recent job title was "Frontend Developer" or "Web Developer", but they have built full-stack projects, designed REST/GraphQL APIs, worked with databases (PostgreSQL, Supabase, MySQL, MongoDB), or engineered full-lifecycle features, you MUST frame and bridge their experience as a versatile Full-Stack Software Engineer who brings deep frontend UI craftsmanship alongside robust backend systems capability!
  * Never downplay the candidate by pitching them with a narrower past title or specialized scope when applying for a broader role that they have verified evidence for.
- CONVERSE DOMAIN MATCHING:
  * If the target role is "Backend Engineer", prioritize and lead with backend architecture, APIs, data modeling, concurrency, caching, and server reliability.
  * If the target role is "Frontend Developer", prioritize UI component architecture, client-side state management, performance optimization (Core Web Vitals), and responsive design.

### 2. DEEP ALIGNMENT WITH THE JOB DESCRIPTION
- Thoroughly extract the core requirements, technologies, and challenges emphasized in the job description:
  * Mention the specific technologies, architectural patterns, and methodologies requested by the employer (e.g. React, Next.js, Node.js, TypeScript, PostgreSQL, REST APIs, CI/CD, responsive design).
  * Connect the candidate's verified accomplishments directly to the employer's stated challenges (e.g., scaling APIs, building responsive web apps, improving site speed, building clean dashboards).
  * Echo the employer's domain language and engineering values naturally (e.g., clean code, type safety, modular architecture, end-to-end ownership).

### 3. BODY STRUCTURE & NARRATIVE ARCHITECTURE
The cover letter body must be compelling, authentic, and flow naturally across 4 focused paragraphs (approx. 280-380 words):
- Paragraph 1: Intent & Target Domain Hook
  State enthusiastic application for "${targetJobTitle}" at ${targetCompany || "your team"}. Immediately position the candidate in terms of the target role's primary domain (e.g. "as a Full Stack Engineer with X years of experience building scalable, end-to-end web applications..."). Summarize verified core strengths that directly solve the employer's primary needs.
- Paragraph 2: Closest Experience & Technical Deep Dive
  Highlight the candidate's verified professional experience and projects that are closest in scope and relevance to the target position. Detail concrete accomplishments: for Full Stack, explain how they architected responsive, performant user interfaces on the frontend while simultaneously developing robust backend APIs, server logic, database schemas, and third-party integrations using verified technologies.
- Paragraph 3: Verified Impact & Modern Engineering Workflow
  Provide evidence of measurable impact, technical problem-solving, and workflow discipline (e.g., performance optimizations, test coverage, agile collaboration, or modern AI-assisted engineering velocity with tools like Cursor/Claude Code if relevant). Connect this evidence directly to how it will accelerate ${targetCompany || "the company"}'s upcoming engineering goals.
- Paragraph 4: Alignment with Company Mission & Confident Call to Action
  Express genuine motivation for ${targetCompany || "the company"}'s product, engineering focus, or vision. Reiterate commitment to delivering immediate value, and state enthusiastic anticipation to discuss how their background aligns with the team's needs in an interview.

### 4. STRICT INTEGRITY RULES
1. ONLY use verified skills, experiences, projects, and education provided in the candidate context.
2. DO NOT invent or assume unlisted employers, metrics, credentials, or proprietary products.
3. DO NOT invent imaginary street addresses, postal codes, or fake recipient addresses for the company. Only use the company name (and city/location ONLY IF explicitly mentioned in the job description).
4. Strictly follow the formal business letter format: Candidate Header, Date, Recipient block, Subject line ('Re: ... Application'), formal salutation, 4 structured body paragraphs separated by double newlines, and formal sign-off.

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

[Paragraph 1: Clear application intent for the ${targetJobTitle || "role"} at ${targetCompany || "the company"}. Frame the candidate in the exact primary domain of the target role (e.g. Full Stack Developer), highlighting total verified years of experience and core technical capabilities that mirror the job posting's main requirements.]

[Paragraph 2: The closest, most relevant experience and verified projects. IF APPLYING FOR FULL STACK: Feature full-stack engineering achievements (both frontend client interfaces AND backend APIs, database modeling, and server-side logic). Do not reduce to frontend only. Mention concrete technical tools, architectural decisions, and production accomplishments from verified bullets.]

[Paragraph 3: Engineering problem-solving, proven impact, and workflow rigor matching the job description's challenges (e.g. application performance, robust API integrations, scalability, code quality, developer velocity). Connect this directly to how the candidate will solve problems for ${targetCompany || "the team"}.]

[Paragraph 4: Genuine motivation for ${targetCompany || "the company"}'s product/mission and alignment with their engineering culture. Confidently reiterate readiness to make an immediate impact and state anticipation to discuss the role in an interview.]

Sincerely,
${profileData?.name || "Candidate"}`;
        break;

      case "application-message":
        maxTokens = 250;
        systemPrompt = `You write concise, natural, personalized job application emails for software professionals.

CRITICAL REQUIREMENTS:
1. Target length: around 80–120 words.
2. Tone: Friendly, confident, professional. Avoid robotic wording, unnecessary introductions (no "I am writing to express my interest...", "I hope this email finds you well"), repetition, and excessive enthusiasm.
3. Structure strictly matching:
Hello,

I'm excited to apply for the [Role] position at [Company]. With over [X] years of experience building [web/mobile/domain] applications, including experience with [relevant technologies], I believe I'm a strong fit for this role. My background in [relevant strengths] aligns with your needs, and I'm interested in contributing to [company/product mission].

Resume: [link]
Portfolio: ${portfolioUrl}

Thank you for considering my application.

Best regards,
${candidateSignOff}

4. Mention relevant technologies ONLY when they match the job requirements.
5. Highlight why candidate is a strong fit without exaggerating qualifications or making generic claims.
6. Return only the finished email ready to send. No explanations, no markdown code blocks in content, no multiple versions.

Return JSON format:
{
  "title": "Application Message",
  "content": string,
  "keyPointsUsed": string[] // 2-3 brief bullet points of key candidate strengths leveraged
}`;
        taskInstructions = `Generate a concise, natural, tailored 80–120 word application email for "${targetJobTitle || "Role"}" at ${targetCompany || "Company"}.
Follow the required structure, include Resume: [link] and Portfolio: ${portfolioUrl}, and sign off with "Best regards,\n${candidateSignOff}".`;
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
   - MANDATORY "AI Development Tools" CATEGORY:
     * ALWAYS include an "AI Development Tools" category placed DIRECTLY ABOVE "Tools & Performance" (or "Developer Tools & Practices").
     * Skills under this category can include modern AI engineering tools such as: Claude Code, Codex, Cursor (as well as ChatGPT, GitHub Copilot, v0 if applicable).
     * Standard line format: "AI Development Tools: Claude Code, Codex, Cursor"
   - BALANCED, COHESIVE CATEGORIES (ANTI-FRAGMENTATION):
     * NEVER create awkward micro-categories with only 1 or 2 items (e.g. NEVER output "Version Control: Git" or "Performance Optimization: Lighthouse, Web Vitals" on their own lines).
     * Group tooling, version control, build tools, workflows, and performance into a single unified category placed AFTER AI Development Tools:
       "Tools & Performance: Git, GitHub, Vite, Lighthouse, Web Vitals" (or "Developer Tools & Practices: Git, Vite, Lighthouse, Web Vitals").
     * DO NOT dump all languages and frameworks into a single bloated "Frontend Technologies" line. Separate core languages from frameworks/libraries for clean ATS readability:
       - Languages: Core programming & markup languages (e.g. "Languages: TypeScript, JavaScript, HTML5, CSS3")
       - Frontend Frameworks & Libraries: UI frameworks, libraries, & styling (e.g. "Frontend Frameworks: React, Next.js, Vue.js, Tailwind CSS, Alpine.js")
       - Backend & Databases: Server, API, and DB tech (e.g. "Backend & Databases: Node.js, Supabase, PostgreSQL, REST APIs" — only if relevant to the role)
       - AI Development Tools: AI-assisted development tools (e.g. "AI Development Tools: Claude Code, Codex, Cursor")
       - Tools & Performance: VCS, build tools, performance & SEO (e.g. "Tools & Performance: Git, GitHub, Vite, Lighthouse, Web Vitals")
   - CANONICAL EXAMPLES:
     * Frontend role example:
       Languages: TypeScript, JavaScript, HTML5, CSS3
       Frontend Frameworks: React, Next.js, Vue.js, Tailwind CSS, Alpine.js
       AI Development Tools: Claude Code, Codex, Cursor
       Tools & Performance: Git, GitHub, Lighthouse, Web Vitals, Vite
     * Full-Stack role example:
       Languages: TypeScript, JavaScript, SQL, HTML5, CSS3
       Frontend: React, Next.js, Tailwind CSS
       Backend & Databases: Node.js, Supabase, PostgreSQL, RESTful APIs
       AI Development Tools: Claude Code, Codex, Cursor
       Tools & Practices: Git, GitHub, Vite, Lighthouse
   - All included skills MUST come from the candidate's verified profile, experiences, or projects (with AI development tools representing verified modern AI workflow). NEVER fabricate unrelated tech.
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
[Organize skills into smart, balanced, ATS-friendly categories.
- ALWAYS include "AI Development Tools: Claude Code, Codex, Cursor" directly ABOVE "Tools & Performance".
- NO MICRO-CATEGORIES: NEVER output 1-2 item lines like "Version Control: Git". Combine tooling, VCS, and performance together into "Tools & Performance".
- SEPARATE LANGUAGES & FRAMEWORKS: Keep "Languages: TypeScript, JavaScript, HTML5, CSS3" and "Frontend Frameworks: React, Next.js, Vue.js, Tailwind CSS" clean and distinct.
- Format strictly as:
Category Name: Skill1, Skill2, Skill3]`;
        break;

      case "video-script":
        maxTokens = 5000;
        systemPrompt = `You are Kairo's AI Career Co-Pilot specializing in generating high-impact, job-specific AI Intro Video Scripts.

### CORE PRINCIPLE
THE JOB DESCRIPTION DETERMINES WHAT THE CANDIDATE SHOULD TALK ABOUT. THE CANDIDATE'S PROFILE, RÉSUMÉ, AND PROJECTS PROVIDE THE EVIDENCE.
Do not generate a generic introduction summarizing the candidate's general background. Analyze the job description first, identify what the employer cares about most, and build the script around those priorities.

### 1. EXPLICIT APPLICATION & INTRO VIDEO QUESTIONS (HIGHEST PRIORITY)
- Many job postings include explicit instructions, questions, or screening prompts for candidates to answer in their intro video (e.g., sections labeled "APPLICATION REQUIREMENTS", "INTRO VIDEO (1-2 MINUTES)", "SCREENING QUESTIONS", "PLEASE ANSWER IN YOUR VIDEO:").
- SCAN & DETECT ALL EXPLICIT QUESTIONS: You MUST thoroughly scan the job description for questions such as:
  * "Describe your experience with [Technologies, e.g. React.js and TypeScript]"
  * "Describe a software project you contributed to and your role in the project"
  * "Have you used AI-assisted development tools such as ChatGPT, Claude, GitHub Copilot, or Cursor? If so, explain how."
  * "What is your preferred hourly rate or salary expectation?"
  * "What is your availability to start?"
- DEDICATED SPOKEN SECTIONS: When the employer asks explicit questions, the video script MUST dedicate specific sections to answering each question directly, intelligently, and thoroughly!
- ACCURATE SECTION TITLES: Give each section a clean title matching the exact question answered (e.g. "Experience with React & TypeScript", "Project Contribution & Role", "AI-Assisted Development Workflow", "Compensation & Availability").
- SALARY / RATE HANDLING: If the employer asks for hourly rate or salary expectation:
  * Check candidate profile or candidate notes. If provided, state it clearly.
  * If not explicitly stated, include a polite, professional, confident response with an editable placeholder tag:
    "Regarding compensation, my preferred rate is around [Insert Rate, e.g. $X/hr or aligned with your posted budget], and I am available to start immediately."
  * NEVER ignore the salary question if asked by the employer!

### 2. CLOSEST ROLE & EXPERIENCE MATCHING
- IDENTIFY THE PRIMARY DOMAIN of the target role (e.g. Full Stack Developer, Frontend Developer, Backend Engineer, Mobile Developer, DevOps, etc.).
- ALWAYS MATCH THE CLOSEST RELEVANT EXPERIENCE: When introducing the candidate's professional background and previous roles, ALWAYS feature and speak about the experience that is closest in title, scope, and technical depth to the target role.
- CRITICAL EXAMPLE: If the target job is "Full Stack Developer", you MUST speak about the candidate's Full Stack engineering experience (both frontend client-side and backend APIs/architecture/database), NOT merely a Frontend role! If applying for a "Backend" role, focus on backend services, APIs, and databases.
- Never downplay the candidate by introducing them with a narrower past title if they have held a title or experience that directly matches the target role!

### 3. AI-ASSISTED DEVELOPMENT TOOLS VS. BACKEND AI APIs (CRITICAL DISTINCTION)
- Understand what "AI-assisted development tools" means:
  * AI-ASSISTED DEVELOPMENT TOOLS are DEVELOPER WORKFLOW AND AGENTIC CODING TOOLS used by the software engineer to accelerate and enhance their development lifecycle:
    - Cursor AI (IDE with Composer, agentic multi-file editing, codebase indexing, semantic search, fast refactoring)
    - Claude Code (Anthropic's agentic CLI coding tool for automated repo exploration, test-driven iteration, git workflows)
    - GitHub Copilot (inline completions, workspace chat, PR generation)
    - ChatGPT / Claude web (architectural brainstorming, algorithm design, debugging tricky race conditions, regex/SQL optimization)
    - Windsurf, v0, Supermaven
  * WHAT THEY ARE NOT: DO NOT confuse "AI-assisted development tools" with "integrating LLM APIs" (like calling OpenAI API, Anthropic Claude API, Google Gemini API, or LangChain into an app). Integrating an API is a product feature, NOT an AI-assisted development workflow!
- HOW TO ANSWER: When the employer asks "Have you used AI-assisted development tools?", speak to the candidate's actual engineering workflow:
  * Mention modern tools like Cursor AI and Claude Code alongside Copilot/ChatGPT.
  * Explain practical usage: rapid boilerplate scaffolding, architecture sanity checks, generating edge-case unit and integration tests, refactoring complex code, and diagnosing tricky bugs.
  * Emphasize engineering rigor: "I use AI tools to multiply velocity and explore solution spaces, while maintaining full ownership of code quality, type safety, architecture decisions, and security review."

### 4. MAP REQUIREMENTS TO CANDIDATE EVIDENCE
- Use the candidate's verified profile, experiences, projects, skills, education, and any candidate notes provided.
- For every important requirement, determine:
  * What the employer wants to know.
  * Which real experience or project demonstrates the capability.
  * What the candidate specifically contributed.
  * What outcome, implementation detail, or example makes the evidence convincing.
  * Whether the candidate has a genuine gap that should not be misrepresented.
- STRICT RULE: NEVER invent, fabricate, or hallucinate experience, achievements, metrics, technical skills, or project functionality.
- If the employer asks a direct question that candidate data cannot answer:
  * In the script, include a clear placeholder (e.g. "[Candidate Note: Briefly explain your personal motivation for Company X / your experience with Y]").
  * Mark it as "missing" or "partial" in the requirement coverage summary.
  * Set hasUnansweredQuestions to true and summarize the missing question.

### 5. SCRIPT ALLOCATION & SECTION INTEGRITY
- Target duration: If employer specifies a duration (e.g. "1-2 minutes"), STRICTLY target ~160 to 260 words (~60-120 seconds). If not specified, target 2 to 3 minutes (~260 to 380 words).
- Conversational, first-person spoken English ("I", "my work on..."). Keep sentences punchy, natural, and rhythmic for reading aloud.
- STRICT SECTION TITLE RULES:
  * Clean titles WITHOUT numbering (e.g. write "Introduction & Role Alignment", "Core Project: Kairo", "AI-Assisted Workflow", NOT "1. Introduction" or "2. Core Project: Kairo").
  * STRICT CONTENT ALIGNMENT: Every section's 'title' MUST accurately describe the exact content spoken in 'spokenText'. NEVER title a section 'Core Project: [X]' unless that section's 'spokenText' exclusively discusses project [X]!
  * Arrange 'sections' in chronological delivery order.
  * 'content' string must match the exact spoken dialogue of all sections joined by double newlines.

Return JSON matching:
{
  "title": string, // e.g. "Intro Video Script - [Job Title] at [Company]"
  "content": string, // Full unbroken teleprompter script formatted in clean paragraphs ready to be read aloud (clean spoken sentences, no stage directions inside speech except for placeholders)
  "keyPointsUsed": string[], // 3-4 bullet points of verified strengths leveraged
  "scriptData": {
    "sections": [
      {
        "id": string, // "section-1", "section-2", etc.
        "title": string, // Clean section title WITHOUT numbers, e.g. "Introduction & Role Alignment", "Relevant Experience: Full Stack Architecture", "Core Project: Kairo", "Direct Answer: AI Workflow & Testing", "Compensation & Availability", "Closing"
        "timeRange": string, // e.g. "0:00 - 0:25"
        "estimatedSeconds": number, // e.g. 25
        "spokenText": string, // Spoken dialogue for this section - MUST strictly match the section title
        "requirementAddressed": string, // Requirement or prompt addressed
        "deliveryTip": string // Pacing / tone coaching tip, e.g. "Warm, confident eye contact; pause slightly after naming key metrics"
      }
    ],
    "coverage": [
      {
        "id": string, // "cov-1", "cov-2", etc.
        "requirement": string, // Employer requirement or specific question
        "priority": "explicit-instruction" | "must-have" | "responsibility" | "preferred" | "work-style",
        "priorityLabel": string, // "Application Question", "Must-Have Requirement", "Core Responsibility", "Preferred Qualification", or "Work Style"
        "howAddressed": string, // How script demonstrates or answers it
        "supportingEvidence": string, // Verified project, role, or skill used
        "missingInfo": string | null, // Detail candidate should provide if missing, otherwise null
        "status": "covered" | "partial" | "missing"
      }
    ],
    "totalDurationSeconds": number, // Total spoken seconds (~120 - 180s)
    "totalWordCount": number, // Total word count across sections
    "hasUnansweredQuestions": boolean, // True if any explicit question or critical requirement lacks candidate evidence
    "unansweredQuestionsSummary": string[], // List of unanswered questions / missing details
    "candidateNotesUsed": string // Brief note on candidate inputs incorporated
  }
}`;
        taskInstructions = `Generate a job-specific AI Intro Video Script for "${targetJobTitle}" at ${targetCompany || "the company"}.

CANDIDATE NOTES & USER-PROVIDED DETAILS:
${candidateNotes && candidateNotes.trim() ? candidateNotes.trim() : "None provided."}

Analyze the job description carefully:
1. Identify any explicit application instructions or questions first. Dedicate meaningful time to directly answering them.
2. Rank must-have requirements and core responsibilities, and map the candidate's strongest verified experience and projects as convincing proof.
3. If an employer question cannot be answered from available candidate data, include a clear placeholder and flag it in the requirement coverage summary.
4. Target a 2–3 minute spoken delivery (~260–380 words) divided into adaptive, well-timed sections with coaching delivery tips.
5. In coverage, focus on the top 4 to 6 critical requirements with concise 1-2 sentence evidence mappings.`;
        break;
    }

    const userPrompt =
      contentType === "application-message"
        ? `TARGET ROLE: ${targetJobTitle || "Role"} at ${targetCompany || "Company"}

JOB REQUIREMENTS:
${cleanDescription.slice(0, 1000).trim()}

CANDIDATE CONTEXT:
- Name: ${candidateSignOff}
- Experience: Over ${yearsOfExp || 3} years (${experienceData.map((e) => e.job_title).filter(Boolean).slice(0, 3).join(", ") || "web and mobile applications"})
- Matching Technologies: ${(candidateSkillsUnique.filter((sk) => `${targetJobTitle} ${cleanDescription}`.toLowerCase().includes(sk.toLowerCase())).length > 0 ? candidateSkillsUnique.filter((sk) => `${targetJobTitle} ${cleanDescription}`.toLowerCase().includes(sk.toLowerCase())) : candidateSkillsUnique).slice(0, 8).join(", ") || "Web development"}
${targetMatchAnalysis?.keyStrengths?.length ? `- Verified Strengths: ${targetMatchAnalysis.keyStrengths.slice(0, 2).join("; ")}\n` : ""}${candidateNotes && candidateNotes.trim() ? `- Candidate Note: ${candidateNotes.trim()}\n` : ""}
TASK:
${taskInstructions}`
        : `CANDIDATE PROFILE:
${candidateProfileText}

${matchContextText ? `${matchContextText}\n\n` : ""}TARGET ROLE: ${targetJobTitle || "Role"} at ${targetCompany || "Company"}
JOB REQUIREMENTS:
${cleanDescription}

TASK:
${taskInstructions}${
  contentType === "resume-suggestions"
    ? `\n\nNOTE FOR TECHNICAL SKILLS:
1. ALWAYS include an "AI Development Tools" category line (e.g. "AI Development Tools: Claude Code, Codex, Cursor") placed directly ABOVE "Tools & Performance".
2. Select candidate's verified skills related to the job description, keeping Languages, Frameworks, AI Development Tools, and Tools & Performance distinct.
3. Be smart with categorization: Never output 1-2 item lines like "Version Control: Git". Combine tooling, VCS, and performance under "Tools & Performance".`
    : contentType === "cover-letter"
    ? `\n\nCRITICAL INSTRUCTIONS FOR COVER LETTER:
1. FOCUS HEAVILY ON THE JOB DESCRIPTION: Extract the employer's core priorities, required tech stack, and primary domain problems, and tailor every paragraph directly to them.
2. CLOSEST ROLE MATCHING: Feature and speak about the candidate's experience closest in scope to "${targetJobTitle}". If applying for Full Stack Developer, speak to their Full Stack engineering capabilities (both frontend client architecture AND backend APIs/databases/architecture)—NEVER reduce or downplay to frontend only if they have full-stack evidence!
3. AUTHENTIC EVIDENCE: Back every technical claim with verified candidate experience, projects, or accomplishments.`
    : ""
}`;

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

    let parsed: any;
    try {
      parsed = JSON.parse(rawResponse.trim());
    } catch {
      // Attempt safe truncation repair if response hit ceiling
      let repaired = rawResponse.trim();
      if (repaired.startsWith("```")) {
        repaired = repaired.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
      }
      const quoteCount = (repaired.match(/(?<!\\)"/g) || []).length;
      if (quoteCount % 2 !== 0) repaired += '"';
      repaired = repaired.replace(/,\s*([}\]])/g, "$1").replace(/,\s*"[^"]*"?\s*:\s*"?$/, "");
      const openB = (repaired.match(/{/g) || []).length;
      const closeB = (repaired.match(/}/g) || []).length;
      const openBk = (repaired.match(/\[/g) || []).length;
      const closeBk = (repaired.match(/\]/g) || []).length;
      for (let i = 0; i < openBk - closeBk; i++) repaired += "]";
      for (let i = 0; i < openB - closeB; i++) repaired += "}";
      try {
        parsed = JSON.parse(repaired);
      } catch (finalErr) {
        throw new Error(
          "The AI generation was cut short. Please try generating again."
        );
      }
    }
    let finalContent = parsed.content || "";

    if (contentType === "application-message") {
      // Ensure portfolio link is filled with candidate's actual profile portfolio URL
      if (portfolioUrl && portfolioUrl !== "[link]") {
        finalContent = finalContent.replace(
          /Portfolio:\s*(?:\[(?:link|portfolio(?:\s*link)?)\]|https?:\/\/[^\s\n]+)?/gi,
          `Portfolio: ${portfolioUrl}`
        );
      }
      // Ensure Resume: [link] exists
      if (!/Resume:\s*/i.test(finalContent)) {
        finalContent = finalContent.replace(
          /(Portfolio:[^\n]+)/i,
          `Resume: [link]\n$1`
        );
      }
    }

    // If generating resume, append verified database sections (PROFESSIONAL EXPERIENCE, PROJECTS, EDUCATION)
    if (contentType === "resume-suggestions") {
      // Strip any hallucinated sections if the model generated beyond TECHNICAL SKILLS
      const trailingSectionRegex = /\n+(?:PROFESSIONAL\s+EXPERIENCE|PROJECTS|KEY\s+PROJECTS|SIDE\s+PROJECTS|CAPSTONE\s+PROJECTS?|EDUCATION)\s*(?:\n[-=_\s]*\n|\n|$)/i;
      const match = finalContent.match(trailingSectionRegex);
      if (match && match.index !== undefined) {
        finalContent = finalContent.slice(0, match.index).trim();
      }

      // Guarantee AI Development Tools is present directly above Tools & Performance
      finalContent = ensureAiDevelopmentTools(finalContent);

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

    if (contentType === "video-script") {
      const scriptData = parsed.scriptData as VideoScriptData | undefined;
      if (scriptData && Array.isArray(scriptData.sections) && scriptData.sections.length > 0) {
        // Clean section titles from accidental AI numbers (e.g. "2. Core Project: Kairo" -> "Core Project: Kairo")
        scriptData.sections = scriptData.sections.map((sec, idx) => ({
          ...sec,
          id: sec.id || `section-${idx + 1}`,
          title: (sec.title || `Section ${idx + 1}`).replace(/^(\d+[\.\)]\s*|Section\s+\d+[:\s-]*)/i, "").trim(),
          spokenText: (sec.spokenText || "").trim(),
        }));

        // ALWAYS build finalContent directly from sections to guarantee 100% synchronization
        const fullContent = scriptData.sections
          .map((s) => s.spokenText)
          .filter(Boolean)
          .join("\n\n");
        finalContent = fullContent;
        const words = fullContent.trim().split(/\s+/).filter(Boolean).length;
        scriptData.totalWordCount = scriptData.totalWordCount || words;
        if (!scriptData.totalDurationSeconds) {
          scriptData.totalDurationSeconds =
            scriptData.sections.reduce(
              (acc, s) => acc + (s.estimatedSeconds || 0),
              0
            ) || Math.round((words / 140) * 60);
        }
      }
    }

    const data: ApplyContentResponse = {
      contentType,
      title: parsed.title || APPLY_CONTENT_TYPES[contentType].title,
      content: finalContent,
      keyPointsUsed: Array.isArray(parsed.keyPointsUsed) ? parsed.keyPointsUsed : [],
      generatedAt: new Date().toISOString(),
      scriptData: parsed.scriptData,
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
            scriptData: data.scriptData,
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
