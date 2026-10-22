"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import {
  UserEducation,
  UserEducationRow,
  mapRowToEducation,
} from "@/types/education";

export async function getEducationsAction(): Promise<{
  success: boolean;
  data?: UserEducation[];
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
      .from("user_educations")
      .select("*")
      .eq("user_id", user.id)
      .order("sort_order", { ascending: true })
      .order("start_year", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching educations:", error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: (data || []).map((row) => mapRowToEducation(row as UserEducationRow)),
    };
  } catch (err: unknown) {
    console.error("Unexpected error fetching educations:", err);
    return { success: false, error: (err as Error)?.message || "Failed to fetch educations" };
  }
}

export async function createEducationAction(
  payload: Omit<UserEducation, "id" | "userId" | "createdAt" | "updatedAt">
): Promise<{
  success: boolean;
  data?: UserEducation;
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
      school: payload.school.trim(),
      degree: payload.degree.trim(),
      field_of_study: payload.fieldOfStudy ? payload.fieldOfStudy.trim() : null,
      start_month: payload.startMonth?.trim() || null,
      start_year: payload.startYear?.trim() || null,
      end_month: payload.isCurrent ? null : payload.endMonth?.trim() || null,
      end_year: payload.isCurrent ? null : payload.endYear?.trim() || null,
      is_current: !!payload.isCurrent,
      location: payload.location ? payload.location.trim() : null,
      honors: payload.honors ? payload.honors.trim() : null,
      sort_order: payload.sortOrder ?? 0,
    };

    const { data, error } = await supabase
      .from("user_educations")
      .insert(newRow)
      .select()
      .single();

    if (error) {
      console.error("Error creating education:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/settings", "page");
    return { success: true, data: mapRowToEducation(data as UserEducationRow) };
  } catch (err: unknown) {
    console.error("Unexpected error creating education:", err);
    return { success: false, error: (err as Error)?.message || "Failed to create education" };
  }
}

export async function updateEducationAction(
  id: string,
  payload: Partial<Omit<UserEducation, "id" | "userId" | "createdAt" | "updatedAt">>
): Promise<{
  success: boolean;
  data?: UserEducation;
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

    const updateFields: Partial<UserEducationRow> = {
      updated_at: new Date().toISOString(),
    };

    if (payload.school !== undefined) updateFields.school = payload.school.trim();
    if (payload.degree !== undefined) updateFields.degree = payload.degree.trim();
    if (payload.fieldOfStudy !== undefined) updateFields.field_of_study = payload.fieldOfStudy?.trim() || null;
    if (payload.startMonth !== undefined) updateFields.start_month = payload.startMonth?.trim() || null;
    if (payload.startYear !== undefined) updateFields.start_year = payload.startYear?.trim() || null;
    if (payload.endMonth !== undefined) updateFields.end_month = payload.endMonth?.trim() || null;
    if (payload.endYear !== undefined) updateFields.end_year = payload.endYear?.trim() || null;
    if (payload.isCurrent !== undefined) {
      updateFields.is_current = payload.isCurrent;
      if (payload.isCurrent) {
        updateFields.end_month = null;
        updateFields.end_year = null;
      }
    }
    if (payload.location !== undefined) updateFields.location = payload.location?.trim() || null;
    if (payload.honors !== undefined) updateFields.honors = payload.honors?.trim() || null;
    if (payload.sortOrder !== undefined) updateFields.sort_order = payload.sortOrder;

    const { data, error } = await supabase
      .from("user_educations")
      .update(updateFields)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating education:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/settings", "page");
    return { success: true, data: mapRowToEducation(data as UserEducationRow) };
  } catch (err: unknown) {
    console.error("Unexpected error updating education:", err);
    return { success: false, error: (err as Error)?.message || "Failed to update education" };
  }
}

export async function deleteEducationAction(id: string): Promise<{
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
      .from("user_educations")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting education:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/settings", "page");
    return { success: true };
  } catch (err: unknown) {
    console.error("Unexpected error deleting education:", err);
    return { success: false, error: (err as Error)?.message || "Failed to delete education" };
  }
}
