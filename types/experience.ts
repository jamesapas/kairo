export type WorkplaceType = "Remote" | "Hybrid" | "On-site";

export interface UserExperience {
  id: string;
  userId?: string;
  jobTitle: string;
  companyName: string;
  workplaceType: WorkplaceType;
  location?: string;
  startMonth: string;
  startYear: string;
  endMonth?: string;
  endYear?: string;
  isCurrent: boolean;
  bullets: string[];
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserExperienceRow {
  id: string;
  user_id: string;
  job_title: string;
  company_name: string;
  workplace_type: string;
  location: string | null;
  start_month: string;
  start_year: string;
  end_month: string | null;
  end_year: string | null;
  is_current: boolean;
  bullets: string[] | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export function mapRowToExperience(row: UserExperienceRow): UserExperience {
  return {
    id: row.id,
    userId: row.user_id,
    jobTitle: row.job_title,
    companyName: row.company_name,
    workplaceType: (row.workplace_type as WorkplaceType) || "Remote",
    location: row.location || undefined,
    startMonth: row.start_month || "Jan",
    startYear: row.start_year || "2024",
    endMonth: row.end_month || undefined,
    endYear: row.end_year || undefined,
    isCurrent: !!row.is_current,
    bullets: Array.isArray(row.bullets) ? row.bullets : [],
    sortOrder: row.sort_order ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
