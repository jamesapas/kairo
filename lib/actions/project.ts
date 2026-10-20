"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import {
  UserProject,
  UserProjectRow,
  mapRowToProject,
  sortProjectsByType,
} from "@/types/project";

export async function getProjectsAction(): Promise<{
  success: boolean;
  data?: UserProject[];
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
      .from("user_projects")
      .select("*")
      .eq("user_id", user.id)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching projects:", error);
      return { success: false, error: error.message };
    }

    const mapped = (data || []).map((row) => mapRowToProject(row as UserProjectRow));

    return {
      success: true,
      data: sortProjectsByType(mapped),
    };
  } catch (err: unknown) {
    console.error("Unexpected error fetching projects:", err);
    return { success: false, error: (err as Error)?.message || "Failed to fetch projects" };
  }
}

export async function createProjectAction(
  payload: Omit<UserProject, "id" | "userId" | "createdAt" | "updatedAt">
): Promise<{
  success: boolean;
  data?: UserProject;
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

    const newRow = {
      user_id: user.id,
      title: payload.title.trim(),
      project_type: payload.projectType || "key",
      live_url: payload.liveUrl?.trim() || null,
      bullets: Array.isArray(payload.bullets) ? payload.bullets.filter(Boolean) : [],
      sort_order: payload.sortOrder ?? 0,
    };

    const { data, error } = await supabase
      .from("user_projects")
      .insert(newRow)
      .select()
      .single();

    if (error) {
      console.error("Error creating project:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/settings", "page");
    return { success: true, data: mapRowToProject(data as UserProjectRow) };
  } catch (err: unknown) {
    console.error("Unexpected error creating project:", err);
    return { success: false, error: (err as Error)?.message || "Failed to create project" };
  }
}

export async function updateProjectAction(
  id: string,
  payload: Partial<Omit<UserProject, "id" | "userId" | "createdAt" | "updatedAt">>
): Promise<{
  success: boolean;
  data?: UserProject;
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

    const updateFields: Partial<UserProjectRow> = {
      updated_at: new Date().toISOString(),
    };

    if (payload.title !== undefined) updateFields.title = payload.title.trim();
    if (payload.projectType !== undefined) updateFields.project_type = payload.projectType;
    if (payload.liveUrl !== undefined) updateFields.live_url = payload.liveUrl?.trim() || null;
    if (payload.bullets !== undefined) {
      updateFields.bullets = Array.isArray(payload.bullets) ? payload.bullets.filter(Boolean) : [];
    }
    if (payload.sortOrder !== undefined) updateFields.sort_order = payload.sortOrder;

    const { data, error } = await supabase
      .from("user_projects")
      .update(updateFields)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating project:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/settings", "page");
    return { success: true, data: mapRowToProject(data as UserProjectRow) };
  } catch (err: unknown) {
    console.error("Unexpected error updating project:", err);
    return { success: false, error: (err as Error)?.message || "Failed to update project" };
  }
}

export async function deleteProjectAction(id: string): Promise<{
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
      .from("user_projects")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting project:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/settings", "page");
    return { success: true };
  } catch (err: unknown) {
    console.error("Unexpected error deleting project:", err);
    return { success: false, error: (err as Error)?.message || "Failed to delete project" };
  }
}

export async function reorderProjectsAction(
  orderedIds: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Not authenticated" };
    }

    // Update each project's sort_order sequentially
    const updates = orderedIds.map((id, index) =>
      supabase
        .from("user_projects")
        .update({ sort_order: index, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", user.id)
    );

    await Promise.all(updates);

    revalidatePath("/settings", "page");
    return { success: true };
  } catch (err: unknown) {
    console.error("Unexpected error reordering projects:", err);
    return { success: false, error: (err as Error)?.message || "Failed to reorder projects" };
  }
}
