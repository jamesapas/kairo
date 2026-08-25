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
      customQuestion,
    } = body as {
      jobId?: string;
      jobTitle?: string;
      company?: string;
      description?: string;
      contentType?: ApplyContentType;
      customQuestion?: string;
    };

    if (!contentType || !APPLY_CONTENT_TYPES[contentType]) {
      return NextResponse.json(
        {
          success: false,
          error: "A valid contentType is required (cover-letter, application-message, why-good-fit, tell-me-about-yourself, custom-question).",
        },
        { status: 400 }
      );
    }

    if (contentType === "custom-question" && (!customQuestion || !customQuestion.trim())) {
      return NextResponse.json(
        {
          success: false,
          error: "Please provide the custom application question to generate an answer.",
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
          .select("name, email, career_summary, links")
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
${profileData?.career_summary ? `Summary: ${profileData.career_summary}\n` : ""}Skills: ${candidateSkillsUnique.join(", ") || "None listed"}
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

    // Build specific prompt instructions and set strict max token ceilings
    let taskInstructions = "";
    let maxTokens = 500;

    switch (contentType) {
      case "cover-letter":
        maxTokens = 650;
        taskInstructions = `Generate a 3-paragraph professional Cover Letter for "${targetJobTitle}" at ${targetCompany || "the company"}.
- Paragraph 1: Enthusiastic hook and alignment for this specific role.
- Paragraph 2: Core relevant experience and verified skills from profile.
- Paragraph 3: Value proposition and confident sign-off with candidate's name: "${profileData?.name || "Candidate"}".`;
        break;

      case "application-message":
        maxTokens = 300;
        taskInstructions = `Generate a punchy 2-paragraph outreach note (approx. 100-140 words) for recruiter/portal note.
- Brief greeting, core match points from verified skills, and interest in ${targetCompany || "this role"}.
- Sign-off with name: "${profileData?.name || "Candidate"}".`;
        break;

      case "why-good-fit":
        maxTokens = 450;
        taskInstructions = `Generate a compelling "Why are you a good fit?" answer for "${targetJobTitle}" at ${targetCompany || "the company"}.
- 2-3 focused bullet points connecting candidate's verified skills & accomplishments to role needs.
- Crisp closing sentence.`;
        break;

      case "tell-me-about-yourself":
        maxTokens = 450;
        taskInstructions = `Generate a natural "Tell me about yourself" interview answer (2-3 paragraphs, 60-90s speech) for "${targetJobTitle}".
- Present (current focus) -> Past (key journey wins) -> Future (why this role at ${targetCompany || "this company"}).`;
        break;

      case "custom-question":
        maxTokens = 500;
        taskInstructions = `Answer this question authentically using candidate's actual background:
QUESTION: "${customQuestion}"
- Provide a direct, well-structured response connecting real experiences to "${targetJobTitle}" at ${targetCompany || "the company"}.`;
        break;
    }

    const systemPrompt = `You are Kairo's AI Career Co-Pilot. Generate concise, high-signal, authentic application copy.
STRICT RULES:
1. ONLY use verified skills, experiences, and education provided in the candidate context.
2. DO NOT invent or assume any unlisted companies, tools, metrics, or credentials.
3. Keep it punchy, professional, and directly relevant.

Return JSON matching:
{
  "title": string,
  "content": string,
  "keyPointsUsed": string[] // 2-3 brief bullet points of verified candidate strengths leveraged
}`;

    const userPrompt = `CANDIDATE:
${candidateProfileText}

${matchContextText ? `${matchContextText}\n\n` : ""}TARGET ROLE: ${targetJobTitle || "Role"} at ${targetCompany || "Company"}
JOB REQUIREMENTS:
${cleanDescription}

TASK (${APPLY_CONTENT_TYPES[contentType].title}):
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

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { success: false, error: "Failed to generate application materials from AI." },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(content);

    const result: ApplyContentResponse = {
      contentType,
      title:
        parsed.title ||
        `${APPLY_CONTENT_TYPES[contentType].title} · ${targetJobTitle || "Application"}`,
      content: parsed.content || "No content generated.",
      generatedAt: new Date().toISOString(),
      keyPointsUsed: Array.isArray(parsed.keyPointsUsed) ? parsed.keyPointsUsed : [],
    };

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err: unknown) {
    console.error("Error in AI apply route:", err);
    return NextResponse.json(
      {
        success: false,
        error: (err as Error)?.message || "Failed to generate application materials.",
      },
      { status: 500 }
    );
  }
}
