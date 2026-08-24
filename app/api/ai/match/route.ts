import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
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

    // Fetch user profile data in parallel
    const [profileRes, skillsRes, experienceRes, educationRes] =
      await Promise.all([
        supabase
          .from("users")
          .select("name, career_summary")
          .eq("id", user.id)
          .maybeSingle(),
        supabase
          .from("user_skills")
          .select("name, category")
          .eq("user_id", user.id)
          .order("sort_order", { ascending: true }),
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
      ]);

    const profileData = profileRes.data;
    const skillsData = skillsRes.data || [];
    const experienceData = experienceRes.data || [];
    const educationData = educationRes.data || [];

    // Format candidate profile for the prompt
    const candidateProfile = {
      careerSummary: profileData?.career_summary || "None provided",
      skills: skillsData.map((s) => `${s.name} (${s.category})`),
      experiences: experienceData.map((exp) => ({
        role: exp.job_title,
        company: exp.company_name,
        period: `${exp.start_month} ${exp.start_year} - ${
          exp.is_current ? "Present" : `${exp.end_month || ""} ${exp.end_year || ""}`.trim()
        }`,
        highlights: Array.isArray(exp.bullets) ? exp.bullets : [],
      })),
      education: educationData.map((edu) => ({
        degree: edu.degree,
        school: edu.school,
        fieldOfStudy: edu.field_of_study || "",
        period: `${edu.start_year} - ${edu.is_current ? "Present" : edu.end_year || ""}`.trim(),
        honors: edu.honors || "",
      })),
    };

    const openai = new OpenAI({ apiKey });

    const systemPrompt = `You are Kairo's Senior Technical Recruiter and Career Advisor AI.
Your task is to conduct an objective, high-signal, and actionable job match evaluation comparing a candidate's background against a job description.

Evaluate:
1. Match percentage (0 - 100): Calculated based on how well skills, years of experience, responsibilities, and seniority align.
2. Recommendation: "apply" (strong fit >= 75%), "maybe" (moderate fit 50-74% or great stretch role), or "skip" (< 50% or critical hard blockers).
3. Summary: 2-3 sentence executive synthesis of candidate-job alignment.
4. Matched skills: list of specific skills & technologies the candidate has that match job requirements.
5. Missing skills: list of specific skills & technologies mentioned or implied in the job description that the candidate does not list.
6. Relevant experience: 2 to 4 bullet items highlighting specific past roles/achievements that prove candidate capability for this role.
7. Unmet requirements: 1 to 3 items listing gaps (e.g., missing years of experience, specific domain knowledge, certifications, or requirements candidate lacks).
8. Seniority assessment: 1-2 sentences assessing whether candidate's experience level matches the target role's seniority (Junior, Mid, Senior, Lead, Staff, Principal, Manager, etc.).

Return the response STRICTLY as a JSON object matching this schema:
{
  "matchPercentage": number,
  "recommendation": "apply" | "maybe" | "skip",
  "summary": string,
  "matchedSkills": string[],
  "missingSkills": string[],
  "relevantExperience": string[],
  "unmetRequirements": string[],
  "seniorityAssessment": string
}`;

    const userPrompt = `CANDIDATE BACKGROUND:
${JSON.stringify(candidateProfile, null, 2)}

JOB POSTING:
Role: ${targetJobTitle || "Not specified"}
Company: ${targetCompany || "Not specified"}
Description:
${targetDescription}

Analyze the match and provide the structured evaluation JSON.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
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

    const parsed = JSON.parse(content) as JobMatchAnalysis;

    // Normalize and validate
    const sanitizedResult: JobMatchAnalysis = {
      matchPercentage: Math.max(
        0,
        Math.min(100, Math.round(Number(parsed.matchPercentage) || 0))
      ),
      recommendation:
        parsed.recommendation === "apply" ||
        parsed.recommendation === "maybe" ||
        parsed.recommendation === "skip"
          ? parsed.recommendation
          : "maybe",
      summary: parsed.summary || "No summary provided.",
      matchedSkills: Array.isArray(parsed.matchedSkills) ? parsed.matchedSkills : [],
      missingSkills: Array.isArray(parsed.missingSkills) ? parsed.missingSkills : [],
      relevantExperience: Array.isArray(parsed.relevantExperience)
        ? parsed.relevantExperience
        : [],
      unmetRequirements: Array.isArray(parsed.unmetRequirements)
        ? parsed.unmetRequirements
        : [],
      seniorityAssessment:
        parsed.seniorityAssessment || "Seniority alignment not specified.",
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
