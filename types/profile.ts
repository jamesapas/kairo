export interface UserProfile {
  id: string;
  name: string;
  location: string;
  email: string;
  avatarUrl: string;
  linkedinUrl: string;
  githubUrl: string;
  portfolioUrl: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserProfileRow {
  id: string;
  name: string | null;
  location: string | null;
  email: string | null;
  avatar_url: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  portfolio_url: string | null;
  created_at: string;
  updated_at: string;
}

export function mapRowToProfile(row: UserProfileRow): UserProfile {
  return {
    id: row.id,
    name: row.name || "",
    location: row.location || "",
    email: row.email || "",
    avatarUrl: row.avatar_url || "",
    linkedinUrl: row.linkedin_url || "",
    githubUrl: row.github_url || "",
    portfolioUrl: row.portfolio_url || "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
