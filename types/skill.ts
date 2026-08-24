export interface UserSkill {
  id: string;
  userId?: string;
  name: string;
  createdAt?: string;
}

export interface UserSkillRow {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export function mapRowToSkill(row: UserSkillRow): UserSkill {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    createdAt: row.created_at,
  };
}
