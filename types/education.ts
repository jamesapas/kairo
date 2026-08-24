export interface UserEducation {
  id: string;
  userId?: string;
  school: string;
  degree: string;
  fieldOfStudy?: string;
  startMonth: string;
  startYear: string;
  endMonth?: string;
  endYear?: string;
  isCurrent: boolean;
  location?: string;
  honors?: string;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserEducationRow {
  id: string;
  user_id: string;
  school: string;
  degree: string;
  field_of_study: string | null;
  start_month: string;
  start_year: string;
  end_month: string | null;
  end_year: string | null;
  is_current: boolean;
  location: string | null;
  honors: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export function mapRowToEducation(row: UserEducationRow): UserEducation {
  return {
    id: row.id,
    userId: row.user_id,
    school: row.school,
    degree: row.degree,
    fieldOfStudy: row.field_of_study || undefined,
    startMonth: row.start_month || "Aug",
    startYear: row.start_year || "2020",
    endMonth: row.end_month || undefined,
    endYear: row.end_year || undefined,
    isCurrent: !!row.is_current,
    location: row.location || undefined,
    honors: row.honors || undefined,
    sortOrder: row.sort_order ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
