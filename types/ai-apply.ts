export type ApplyContentType =
  | "resume-suggestions"
  | "cover-letter"
  | "application-message";

export interface ApplyContentConfig {
  id: ApplyContentType;
  title: string;
  shortLabel: string;
  description: string;
}

export const APPLY_CONTENT_KEYS: ApplyContentType[] = [
  "resume-suggestions",
  "cover-letter",
  "application-message",
];

export const APPLY_CONTENT_TYPES: Record<ApplyContentType, ApplyContentConfig> = {
  "resume-suggestions": {
    id: "resume-suggestions",
    title: "Resume Suggestions",
    shortLabel: "Resume",
    description: "Tailored bullet points, verified skills, and ATS keywords to feature.",
  },
  "cover-letter": {
    id: "cover-letter",
    title: "Cover Letter",
    shortLabel: "Cover Letter",
    description: "A professional 3-paragraph letter matching your experience to the role.",
  },
  "application-message": {
    id: "application-message",
    title: "Application Message",
    shortLabel: "Message",
    description: "A short 2-paragraph outreach note for recruiter messages or portal notes.",
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

export interface SavedApplyMaterial {
  title?: string;
  content: string;
  keyPointsUsed?: string[];
  updatedAt: string;
}

export type JobApplyMaterialsMap = Partial<Record<ApplyContentType, SavedApplyMaterial>>;
