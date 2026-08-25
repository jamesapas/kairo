export type ApplyContentType =
  | "cover-letter"
  | "application-message"
  | "why-good-fit"
  | "tell-me-about-yourself"
  | "custom-question";

export interface ApplyContentConfig {
  id: ApplyContentType;
  title: string;
  shortLabel: string;
  description: string;
  badge: string;
  placeholder?: string;
}

export const APPLY_CONTENT_TYPES: Record<ApplyContentType, ApplyContentConfig> = {
  "cover-letter": {
    id: "cover-letter",
    title: "Tailored Cover Letter",
    shortLabel: "Cover Letter",
    description:
      "A structured, persuasive cover letter highlighting your top matched accomplishments and relevant skills.",
    badge: "Formal & Detailed",
  },
  "application-message": {
    id: "application-message",
    title: "Quick Application Message",
    shortLabel: "Short Message / Note",
    description:
      "A punchy 2-3 paragraph message optimized for LinkedIn InMail, recruiter outreach, or portal note fields.",
    badge: "Concise & Direct",
  },
  "why-good-fit": {
    id: "why-good-fit",
    title: "“Why Are You a Good Fit?” Answer",
    shortLabel: "Why Good Fit?",
    description:
      "A clear value-proposition pitch linking your verified skills directly to the key requirements of this role.",
    badge: "High-Signal Pitch",
  },
  "tell-me-about-yourself": {
    id: "tell-me-about-yourself",
    title: "“Tell Me About Yourself” Narrative",
    shortLabel: "About Yourself",
    description:
      "A conversational career narrative connecting your trajectory, key wins, and passion to this specific role.",
    badge: "Interview Ready",
  },
  "custom-question": {
    id: "custom-question",
    title: "Custom Application Question",
    shortLabel: "Custom Question",
    description:
      "Provide any specific screening prompt (e.g. 'Describe a challenging project') for an aligned answer.",
    badge: "Tailored Prompt",
    placeholder: "Paste the company's application or screening question here...",
  },
};

export interface ApplyContentRequest {
  jobId?: string;
  jobTitle?: string;
  company?: string;
  description?: string;
  contentType: ApplyContentType;
  customQuestion?: string;
}

export interface ApplyContentResponse {
  contentType: ApplyContentType;
  title: string;
  content: string;
  generatedAt: string;
  keyPointsUsed?: string[];
}
