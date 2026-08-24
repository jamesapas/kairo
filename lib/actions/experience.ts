"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import {
  UserExperience,
  UserExperienceRow,
  mapRowToExperience,
} from "@/types/experience";

export async function getExperiencesAction(): Promise<{
  success: boolean;
  data?: UserExperience[];
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
      .from("user_experiences")
      .select("*")
      .eq("user_id", user.id)
      .order("sort_order", { ascending: true })
      .order("start_year", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching experiences:", error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: (data || []).map((row) => mapRowToExperience(row as UserExperienceRow)),
    };
  } catch (err: unknown) {
    console.error("Unexpected error fetching experiences:", err);
    return { success: false, error: (err as Error)?.message || "Failed to fetch experiences" };
  }
}

export async function createExperienceAction(
  payload: Omit<UserExperience, "id" | "userId" | "createdAt" | "updatedAt">
): Promise<{
  success: boolean;
  data?: UserExperience;
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
      job_title: payload.jobTitle.trim(),
      company_name: payload.companyName.trim(),
      workplace_type: payload.workplaceType || "Remote",
      location: payload.location ? payload.location.trim() : null,
      start_month: payload.startMonth || "Jan",
      start_year: payload.startYear || "2024",
      end_month: payload.isCurrent ? null : payload.endMonth || null,
      end_year: payload.isCurrent ? null : payload.endYear || null,
      is_current: !!payload.isCurrent,
      bullets: payload.bullets || [],
      sort_order: payload.sortOrder ?? 0,
    };

    const { data, error } = await supabase
      .from("user_experiences")
      .insert(newRow)
      .select()
      .single();

    if (error) {
      console.error("Error creating experience:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/settings", "page");
    return { success: true, data: mapRowToExperience(data as UserExperienceRow) };
  } catch (err: unknown) {
    console.error("Unexpected error creating experience:", err);
    return { success: false, error: (err as Error)?.message || "Failed to create experience" };
  }
}

export async function updateExperienceAction(
  id: string,
  payload: Partial<Omit<UserExperience, "id" | "userId" | "createdAt" | "updatedAt">>
): Promise<{
  success: boolean;
  data?: UserExperience;
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

    const updateFields: Partial<UserExperienceRow> = {
      updated_at: new Date().toISOString(),
    };

    if (payload.jobTitle !== undefined) updateFields.job_title = payload.jobTitle.trim();
    if (payload.companyName !== undefined) updateFields.company_name = payload.companyName.trim();
    if (payload.workplaceType !== undefined) updateFields.workplace_type = payload.workplaceType;
    if (payload.location !== undefined) updateFields.location = payload.location?.trim() || null;
    if (payload.startMonth !== undefined) updateFields.start_month = payload.startMonth;
    if (payload.startYear !== undefined) updateFields.start_year = payload.startYear;
    if (payload.endMonth !== undefined) updateFields.end_month = payload.endMonth || null;
    if (payload.endYear !== undefined) updateFields.end_year = payload.endYear || null;
    if (payload.isCurrent !== undefined) {
      updateFields.is_current = payload.isCurrent;
      if (payload.isCurrent) {
        updateFields.end_month = null;
        updateFields.end_year = null;
      }
    }
    if (payload.bullets !== undefined) updateFields.bullets = payload.bullets;
    if (payload.sortOrder !== undefined) updateFields.sort_order = payload.sortOrder;

    const { data, error } = await supabase
      .from("user_experiences")
      .update(updateFields)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating experience:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/settings", "page");
    return { success: true, data: mapRowToExperience(data as UserExperienceRow) };
  } catch (err: unknown) {
    console.error("Unexpected error updating experience:", err);
    return { success: false, error: (err as Error)?.message || "Failed to update experience" };
  }
}

export async function deleteExperienceAction(id: string): Promise<{
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
      .from("user_experiences")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting experience:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/settings", "page");
    return { success: true };
  } catch (err: unknown) {
    console.error("Unexpected error deleting experience:", err);
    return { success: false, error: (err as Error)?.message || "Failed to delete experience" };
  }
}
