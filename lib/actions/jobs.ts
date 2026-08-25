"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import {
  JobApplication,
  JobApplicationRow,
  JobStatus,
  mapRowToJob,
} from "@/types/job";

export async function getJobsAction(): Promise<{
  success: boolean;
  data: JobApplication[];
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, data: [], error: "Not authenticated" };
    }

    const { data, error } = await supabase
      .from("job_applications")
      .select("*")
      .order("is_pinned", { ascending: false })
      .order("date_applied", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching jobs:", error);
      return { success: false, data: [], error: error.message };
    }

    const jobs = ((data as JobApplicationRow[]) || []).map(mapRowToJob);
    return { success: true, data: jobs };
  } catch (err: unknown) {
    console.error("Unexpected error fetching jobs:", err);
    return { success: false, data: [], error: (err as Error)?.message || "Failed to fetch jobs" };
  }
}

export async function getJobByIdAction(id: string): Promise<{
  success: boolean;
  data?: JobApplication;
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
      .from("job_applications")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return { success: false, error: error?.message || "Application not found" };
    }

    return { success: true, data: mapRowToJob(data as JobApplicationRow) };
  } catch (err: unknown) {
    console.error("Unexpected error fetching job:", err);
    return { success: false, error: (err as Error)?.message || "Failed to fetch application" };
  }
}

export async function createJobAction(
  jobData: Omit<JobApplication, "id" | "createdAt" | "updatedAt">
): Promise<{
  success: boolean;
  data?: JobApplication;
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
      job_title: jobData.jobTitle,
      company: jobData.company,
      description: jobData.description || "",
      applied_on: jobData.appliedOn || "LinkedIn",
      job_url: jobData.jobUrl || "",
      contact_url: jobData.contactUrl || "",
      date_applied: jobData.dateApplied || new Date().toISOString().split("T")[0],
      status: jobData.status || "saved",
      workplace_type: jobData.workplaceType || "Remote",
      salary: jobData.salary || "",
      is_pinned: jobData.isPinned || false,
    };

    const { data, error } = await supabase
      .from("job_applications")
      .insert(newRow)
      .select()
      .single();

    if (error) {
      console.error("Error creating job:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/");
    return { success: true, data: mapRowToJob(data as JobApplicationRow) };
  } catch (err: unknown) {
    console.error("Unexpected error creating job:", err);
    return { success: false, error: (err as Error)?.message || "Failed to create job" };
  }
}

export async function updateJobAction(
  id: string,
  updates: Partial<JobApplication>
): Promise<{
  success: boolean;
  data?: JobApplication;
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

    const rowUpdates: Partial<JobApplicationRow> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.jobTitle !== undefined) rowUpdates.job_title = updates.jobTitle;
    if (updates.company !== undefined) rowUpdates.company = updates.company;
    if (updates.description !== undefined) rowUpdates.description = updates.description;
    if (updates.appliedOn !== undefined) rowUpdates.applied_on = updates.appliedOn;
    if (updates.jobUrl !== undefined) rowUpdates.job_url = updates.jobUrl;
    if (updates.contactUrl !== undefined) rowUpdates.contact_url = updates.contactUrl;
    if (updates.dateApplied !== undefined) rowUpdates.date_applied = updates.dateApplied;
    if (updates.status !== undefined) rowUpdates.status = updates.status;
    if (updates.workplaceType !== undefined) rowUpdates.workplace_type = updates.workplaceType;
    if (updates.salary !== undefined) rowUpdates.salary = updates.salary;
    if (updates.isPinned !== undefined) rowUpdates.is_pinned = updates.isPinned;
    if (updates.aiMatchAnalysis !== undefined) rowUpdates.ai_match_analysis = updates.aiMatchAnalysis;
    if (updates.aiApplyMaterials !== undefined) rowUpdates.ai_apply_materials = updates.aiApplyMaterials;

    const { data, error } = await supabase
      .from("job_applications")
      .update(rowUpdates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating job:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/");
    return { success: true, data: mapRowToJob(data as JobApplicationRow) };
  } catch (err: unknown) {
    console.error("Unexpected error updating job:", err);
    return { success: false, error: (err as Error)?.message || "Failed to update job" };
  }
}

export async function saveApplyMaterialAction(
  jobId: string,
  contentType: string,
  material: { content: string; title?: string; keyPointsUsed?: string[] }
): Promise<{
  success: boolean;
  data?: Record<string, unknown>;
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

    const { data: existingJob, error: fetchErr } = await supabase
      .from("job_applications")
      .select("ai_apply_materials")
      .eq("id", jobId)
      .eq("user_id", user.id)
      .single();

    if (fetchErr) {
      return { success: false, error: fetchErr.message };
    }

    const currentMaterials = (existingJob.ai_apply_materials as Record<string, unknown>) || {};
    const updatedMaterials = {
      ...currentMaterials,
      [contentType]: {
        title: material.title,
        content: material.content,
        keyPointsUsed: material.keyPointsUsed || [],
        updatedAt: new Date().toISOString(),
      },
    };

    const { error: updateErr } = await supabase
      .from("job_applications")
      .update({
        ai_apply_materials: updatedMaterials,
        updated_at: new Date().toISOString(),
      })
      .eq("id", jobId)
      .eq("user_id", user.id);

    if (updateErr) {
      return { success: false, error: updateErr.message };
    }

    revalidatePath(`/jobs/${jobId}`);
    revalidatePath("/");

    return { success: true, data: updatedMaterials };
  } catch (err: unknown) {
    console.error("Error saving apply material:", err);
    return { success: false, error: (err as Error)?.message || "Failed to save material" };
  }
}

export async function deleteJobAction(id: string): Promise<{
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
      .from("job_applications")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting job:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/");
    return { success: true };
  } catch (err: unknown) {
    console.error("Unexpected error deleting job:", err);
    return { success: false, error: (err as Error)?.message || "Failed to delete job" };
  }
}

export async function updateJobStatusAction(
  id: string,
  newStatus: JobStatus
): Promise<{
  success: boolean;
  error?: string;
}> {
  return updateJobAction(id, { status: newStatus });
}

export async function togglePinJobAction(
  id: string,
  isPinned: boolean
): Promise<{
  success: boolean;
  error?: string;
}> {
  return updateJobAction(id, { isPinned });
}
