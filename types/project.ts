export type ProjectType = "key" | "side" | "capstone";

export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  key: "Key Project",
  side: "Side Project",
  capstone: "Capstone Project",
};

export const PROJECT_TYPE_SECTION_HEADERS: Record<ProjectType, string> = {
  key: "KEY PROJECTS",
  side: "SIDE PROJECTS",
  capstone: "CAPSTONE PROJECT",
};

export const PROJECT_TYPE_ORDER: Record<ProjectType, number> = {
  key: 1,
  side: 2,
  capstone: 3,
};

export function sortProjectsByType(projects: UserProject[]): UserProject[] {
  return [...projects].sort((a, b) => {
    const prioA = PROJECT_TYPE_ORDER[a.projectType || "key"] ?? 99;
    const prioB = PROJECT_TYPE_ORDER[b.projectType || "key"] ?? 99;
    if (prioA !== prioB) return prioA - prioB;
    if (a.sortOrder !== undefined && b.sortOrder !== undefined && a.sortOrder !== b.sortOrder) {
      return a.sortOrder - b.sortOrder;
    }
    const aCreated = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bCreated = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bCreated - aCreated;
  });
}

export interface UserProject {
  id: string;
  userId?: string;
  title: string;
  projectType: ProjectType;
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
  project_type: string | null;
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

  let projectType: ProjectType = "key";
  if (row.project_type === "side" || row.project_type === "side_project") {
    projectType = "side";
  } else if (row.project_type === "capstone" || row.project_type === "capstone_project") {
    projectType = "capstone";
  } else {
    projectType = "key";
  }

  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    projectType,
    liveUrl: row.live_url || undefined,
    bullets,
    sortOrder: row.sort_order ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
