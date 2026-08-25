export interface ProfileLink {
  id: string;
  platform: string;
  label: string;
  url: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  location?: string;
  avatarUrl: string;
  careerSummary: string;
  links: ProfileLink[];
  createdAt?: string;
  updatedAt?: string;
}

export interface UserProfileRow {
  id: string;
  name: string | null;
  email: string | null;
  location: string | null;
  avatar_url: string | null;
  career_summary: string | null;
  links: ProfileLink[] | null;
  created_at: string;
  updated_at: string;
}

export function mapRowToProfile(row: UserProfileRow): UserProfile {
  return {
    id: row.id,
    name: row.name || "",
    email: row.email || "",
    location: row.location || "",
    avatarUrl: row.avatar_url || "",
    careerSummary: row.career_summary || "",
    links: Array.isArray(row.links) ? row.links : [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
