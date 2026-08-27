export interface UserProject {
  id: string;
  userId?: string;
  title: string;
  liveUrl?: string;
  bullets: string[];
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserProjectRow {
  id: string;
  user_id: string;
  title: string;
  live_url: string | null;
  bullets: string[] | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export function mapRowToProject(row: UserProjectRow): UserProject {
  let bullets: string[] = [];
  if (Array.isArray(row.bullets)) {
    bullets = row.bullets;
  } else if (typeof row.bullets === "string") {
    try {
      bullets = JSON.parse(row.bullets);
    } catch {
      bullets = [];
    }
  }

  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    liveUrl: row.live_url || undefined,
    bullets,
    sortOrder: row.sort_order ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
