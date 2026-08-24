"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { UserSkill, UserSkillRow, mapRowToSkill } from "@/types/skill";

export async function getSkillsAction(): Promise<{
  success: boolean;
  data?: UserSkill[];
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Not authenticated" };
    }

    const { data, error } = await supabase
      .from("user_skills")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching skills:", error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: (data || []).map((row) => mapRowToSkill(row as UserSkillRow)),
    };
  } catch (err: unknown) {
    console.error("Unexpected error fetching skills:", err);
    return { success: false, error: (err as Error)?.message || "Failed to fetch skills" };
  }
}

export async function createSkillAction(
  name: string
): Promise<{
  success: boolean;
  data?: UserSkill;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Not authenticated" };
    }

    const trimmedName = name.trim();
    if (!trimmedName) {
      return { success: false, error: "Skill name cannot be empty" };
    }

    // Check if skill already exists (case-insensitive)
    const { data: existing } = await supabase
      .from("user_skills")
      .select("*")
      .eq("user_id", user.id)
      .ilike("name", trimmedName)
      .maybeSingle();

    if (existing) {
      return { success: true, data: mapRowToSkill(existing as UserSkillRow) };
    }

    const { data, error } = await supabase
      .from("user_skills")
      .insert({
        user_id: user.id,
        name: trimmedName,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating skill:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/settings", "page");
    return { success: true, data: mapRowToSkill(data as UserSkillRow) };
  } catch (err: unknown) {
    console.error("Unexpected error creating skill:", err);
    return { success: false, error: (err as Error)?.message || "Failed to create skill" };
  }
}

export async function deleteSkillAction(id: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Not authenticated" };
    }

    const { error } = await supabase
      .from("user_skills")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting skill:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/settings", "page");
    return { success: true };
  } catch (err: unknown) {
    console.error("Unexpected error deleting skill:", err);
    return { success: false, error: (err as Error)?.message || "Failed to delete skill" };
  }
}

export async function seedSkillsAction(
  skills: { name: string }[]
): Promise<{
  success: boolean;
  data?: UserSkill[];
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Not authenticated" };
    }

    const rows = skills.map((s) => ({
      user_id: user.id,
      name: s.name.trim(),
    }));

    const { data, error } = await supabase
      .from("user_skills")
      .insert(rows)
      .select();

    if (error) {
      console.error("Error seeding skills:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/settings", "page");
    return {
      success: true,
      data: (data || []).map((row) => mapRowToSkill(row as UserSkillRow)),
    };
  } catch (err: unknown) {
    console.error("Unexpected error seeding skills:", err);
    return { success: false, error: (err as Error)?.message || "Failed to seed skills" };
  }
}
