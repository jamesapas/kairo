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
    const [profileRes, skillsRes, experienceRes, educationRes] =
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
            "job_title, company_name, workplace_type, location, start_month, start_year, end_month, end_year, is_current, bullets"
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
      ]);

    const profileData = profileRes.data;
    const skillsData = skillsRes.data || [];
    const experienceData = experienceRes.data || [];
    const educationData = educationRes.data || [];

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

    const compactEducation = educationData.slice(0, 2).map((edu) => {
      return `- ${edu.degree || ""} in ${edu.field_of_study || "General"} from ${edu.school || ""} (${edu.start_year || ""}-${edu.end_year || ""})`;
    }).join("\n");

    const candidateProfileText = `Name: ${profileData?.name || "Candidate"}
${profileData?.location ? `Location: ${profileData.location}\n` : ""}${profileData?.career_summary ? `Summary: ${profileData.career_summary}\n` : ""}Skills: ${candidateSkillsUnique.join(", ") || "None listed"}
${compactExperiences ? `Experience:\n${compactExperiences}\n` : ""}${compactEducation ? `Education:\n${compactEducation}` : ""}`.trim();

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
    const contactLine = [profileData?.email, formattedLinksStr].filter(Boolean).join(" | ");

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
${candidateLocation ? `${candidateLocation}\n` : ""}${contactLine}

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
        maxTokens = 700;
        systemPrompt = `You are Kairo's AI Career Co-Pilot specializing in Resume Optimization, ATS keyword matching, and bullet point crafting.
ABSOLUTE STRICT RULES:
1. DO NOT write a letter, email, greeting ('Dear...'), or cover letter. This is NOT a message or letter.
2. ONLY use verified skills, experiences, and education provided in the candidate context.
3. DO NOT invent or assume any unlisted companies, tools, metrics, or credentials.
4. Output MUST be formatted resume bullet point recommendations and skills suggestions.

Return JSON matching:
{
  "title": string, // e.g. "Resume Tailoring for [Job Title]"
  "content": string, // Formatted markdown with headings and bullet points
  "keyPointsUsed": string[] // 2-3 brief bullet points of verified candidate strengths leveraged
}`;
        taskInstructions = `Generate structured, high-impact Resume Suggestions and bullet point rephrasings for "${targetJobTitle}" at ${targetCompany || "the company"}.

Format the "content" strictly into these 3 clean sections:

1. 🎯 Top Verified Skills to Feature
- [List 4-6 most relevant verified skills from candidate's profile that directly match the job description]

2. ✍️ Tailored Experience Bullet Points
- [Provide 3 quantifiable, high-impact resume bullet point examples tailored from candidate's actual background using Action Verb + Task + Tool + Result]

3. 🔍 Priority ATS Keywords
- [List 5-8 essential keywords and technical terms found in the job requirements to include in candidate's resume]`;
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

    const data: ApplyContentResponse = {
      contentType,
      title: parsed.title || APPLY_CONTENT_TYPES[contentType].title,
      content: parsed.content || "",
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
