export type ApplyContentType =
  | "resume-suggestions"
  | "cover-letter"
  | "application-message"
  | "video-script";

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
  "video-script",
];

export const APPLY_CONTENT_TYPES: Record<ApplyContentType, ApplyContentConfig> = {
  "resume-suggestions": {
    id: "resume-suggestions",
    title: "Tailored Resume",
    shortLabel: "Resume",
    description: "Single-column, ATS-friendly resume tailored to role specifications.",
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
  "video-script": {
    id: "video-script",
    title: "AI Intro Video Script",
    shortLabel: "Video Script",
    description: "Job-specific 2–3 minute video script prioritizing employer questions and requirements.",
  },
};

export type RequirementPriority =
  | "explicit-instruction"
  | "must-have"
  | "responsibility"
  | "preferred"
  | "work-style";

export type CoverageStatus = "covered" | "partial" | "missing";

export interface RequirementCoverageItem {
  id: string;
  requirement: string;
  priority: RequirementPriority;
  priorityLabel: string;
  howAddressed: string;
  supportingEvidence: string;
  missingInfo?: string | null;
  status: CoverageStatus;
}

export interface VideoScriptSection {
  id: string;
  title: string;
  timeRange: string;
  estimatedSeconds: number;
  spokenText: string;
  requirementAddressed?: string;
  deliveryTip?: string;
}

export interface VideoScriptData {
  sections: VideoScriptSection[];
  coverage: RequirementCoverageItem[];
  totalDurationSeconds: number;
  totalWordCount: number;
  hasUnansweredQuestions: boolean;
  unansweredQuestionsSummary?: string[];
  candidateNotesUsed?: string;
}

export interface ApplyContentRequest {
  jobId?: string;
  jobTitle?: string;
  company?: string;
  description?: string;
  contentType: ApplyContentType;
  candidateNotes?: string;
}

export interface ApplyContentResponse {
  contentType: ApplyContentType;
  title: string;
  content: string;
  keyPointsUsed: string[];
  generatedAt: string;
  scriptData?: VideoScriptData;
}

export interface SavedApplyMaterial {
  title?: string;
  content: string;
  keyPointsUsed?: string[];
  updatedAt: string;
  scriptData?: VideoScriptData;
}

export type JobApplyMaterialsMap = Partial<Record<ApplyContentType, SavedApplyMaterial>>;

