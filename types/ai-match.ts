export type MatchRecommendation = "apply" | "maybe" | "skip";
export type SeniorityMatchLevel = "Good Match" | "Slight Gap" | "Significant Gap";

export interface NiceToHaveSkill {
  name: string;
  hasSkill: boolean;
}

export interface JobMatchAnalysis {
  matchPercentage: number;
  matchLabel: string; // e.g. "Strong Match", "Good Match", "Moderate Match", "Low Fit"
  recommendation: MatchRecommendation;
  recommendationReason?: string;
  summary: string;

  // Skills
  matchedSkills: string[];
  missingSkills: string[];

  // Experience
  matchingExperience: string[];
  experienceGaps: string[];

  // Requirements & Nice-to-Have
  unmetRequirements: string[];
  niceToHave: NiceToHaveSkill[];

  // Seniority
  seniorityLevel: SeniorityMatchLevel;
  seniorityAssessment: string;

  // Strengths & Gaps
  keyStrengths: string[];
  potentialGaps: string[];

  // Legacy field for backward compatibility with cached records
  relevantExperience?: string[];

  analyzedAt?: string;
}
