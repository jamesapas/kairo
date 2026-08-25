export type ApplyContentType =
  | "cover-letter"
  | "application-message"
  | "resume-suggestions";

export interface ApplyContentConfig {
  id: ApplyContentType;
  title: string;
  shortLabel: string;
  description: string;
  badge: string;
}

export const APPLY_CONTENT_TYPES: Record<ApplyContentType, ApplyContentConfig> = {
  "cover-letter": {
    id: "cover-letter",
    title: "Tailored Cover Letter",
    shortLabel: "Cover Letter",
    description:
      "A structured, persuasive cover letter highlighting your top matched accomplishments and relevant skills.",
    badge: "Formal & Impactful",
  },
  "application-message": {
    id: "application-message",
    title: "Quick Application Message",
    shortLabel: "Short Message / Note",
    description:
      "A punchy 2-3 paragraph outreach message optimized for LinkedIn InMail, recruiter emails, or portal notes.",
    badge: "Concise & Direct",
  },
  "resume-suggestions": {
    id: "resume-suggestions",
    title: "Tailored Resume Suggestions",
    shortLabel: "Resume Suggestions",
    description:
      "Actionable recommendations to tailor your resume bullets, emphasize verified skills, and match ATS keywords for this role.",
    badge: "Role-Specific Advice",
  },
};

export interface ApplyContentRequest {
  jobId?: string;
  jobTitle?: string;
  company?: string;
  description?: string;
  contentType: ApplyContentType;
}

export interface ApplyContentResponse {
  contentType: ApplyContentType;
  title: string;
  content: string;
  keyPointsUsed: string[];
  generatedAt: string;
}
