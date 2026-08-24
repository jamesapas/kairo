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
  avatarUrl: string;
  links: ProfileLink[];
  createdAt?: string;
  updatedAt?: string;
}

export interface UserProfileRow {
  id: string;
  name: string | null;
  email: string | null;
  avatar_url: string | null;
  links: ProfileLink[] | null;
  created_at: string;
  updated_at: string;
}

export function mapRowToProfile(row: UserProfileRow): UserProfile {
  return {
    id: row.id,
    name: row.name || "",
    email: row.email || "",
    avatarUrl: row.avatar_url || "",
    links: Array.isArray(row.links) ? row.links : [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
