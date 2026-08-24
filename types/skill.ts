export type SkillCategory =
  | "Languages"
  | "Frameworks & Libraries"
  | "Backend & APIs"
  | "AI & LLMs"
  | "CMS & Design"
  | "Dev Tools"
  | "Collaboration"
  | "Other";

export const SKILL_CATEGORIES: SkillCategory[] = [
  "Languages",
  "Frameworks & Libraries",
  "Backend & APIs",
  "AI & LLMs",
  "CMS & Design",
  "Dev Tools",
  "Collaboration",
];

export interface UserSkill {
  id: string;
  userId?: string;
  name: string;
  category: string;
  sortOrder?: number;
  createdAt?: string;
}

export interface UserSkillRow {
  id: string;
  user_id: string;
  name: string;
  category: string;
  sort_order: number;
  created_at: string;
}

export function mapRowToSkill(row: UserSkillRow): UserSkill {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    category: row.category || "Other",
    sortOrder: row.sort_order ?? 0,
    createdAt: row.created_at,
  };
}
