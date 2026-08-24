export type MatchRecommendation = "apply" | "maybe" | "skip";

export interface JobMatchAnalysis {
  matchPercentage: number;
  recommendation: MatchRecommendation;
  summary: string;
  matchedSkills: string[];
  missingSkills: string[];
  relevantExperience: string[];
  unmetRequirements: string[];
  seniorityAssessment: string;
  analyzedAt?: string;
}
