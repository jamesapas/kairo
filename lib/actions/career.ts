"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type {
  CareerData,
  ProfileFormData,
  ExperienceFormData,
  EducationFormData,
  SkillFormData,
  ProjectFormData,
} from "@/types/database";

export async function getCareerData(): Promise<CareerData> {
  const supabase = await createClient();

  const [
    { data: profiles },
    { data: experiences },
    { data: educations },
    { data: skills },
    { data: projects },
  ] = await Promise.all([
    supabase.from("profiles").select("*").limit(1),
    supabase.from("experiences").select("*").order("start_date", { ascending: false }),
    supabase.from("educations").select("*").order("start_date", { ascending: false }),
    supabase.from("skills").select("*").order("category", { ascending: true }).order("name", { ascending: true }),
    supabase.from("projects").select("*").order("is_featured", { ascending: false }).order("created_at", { ascending: false }),
  ]);

  return {
    profile: profiles && profiles.length > 0 ? profiles[0] : null,
    experiences: experiences || [],
    educations: educations || [],
    skills: skills || [],
    projects: projects || [],
  };
}

// ---------------- PROFILE ACTIONS ----------------
export async function updateProfile(formData: ProfileFormData) {
  const supabase = await createClient();
  const { data: existing } = await supabase.from("profiles").select("id").limit(1);

  let error;
  if (existing && existing.length > 0) {
    const profileId = existing[0].id;
    const res = await supabase
      .from("profiles")
      .update({ ...formData, updated_at: new Date().toISOString() })
      .eq("id", profileId);
    error = res.error;
  } else {
    const res = await supabase.from("profiles").insert([formData]);
    error = res.error;
  }

  if (error) {
    throw new Error(`Failed to update profile: ${error.message}`);
  }

  revalidatePath("/");
  return { success: true };
}

// ---------------- EXPERIENCE ACTIONS ----------------
export async function addExperience(formData: ExperienceFormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("experiences").insert([formData]);

  if (error) {
    throw new Error(`Failed to add experience: ${error.message}`);
  }

  revalidatePath("/");
  return { success: true };
}

export async function updateExperience(id: string, formData: Partial<ExperienceFormData>) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("experiences")
    .update({ ...formData, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to update experience: ${error.message}`);
  }

  revalidatePath("/");
  return { success: true };
}

export async function deleteExperience(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("experiences").delete().eq("id", id);

  if (error) {
    throw new Error(`Failed to delete experience: ${error.message}`);
  }

  revalidatePath("/");
  return { success: true };
}

// ---------------- EDUCATION ACTIONS ----------------
export async function addEducation(formData: EducationFormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("educations").insert([formData]);

  if (error) {
    throw new Error(`Failed to add education: ${error.message}`);
  }

  revalidatePath("/");
  return { success: true };
}

export async function updateEducation(id: string, formData: Partial<EducationFormData>) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("educations")
    .update({ ...formData, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to update education: ${error.message}`);
  }

  revalidatePath("/");
  return { success: true };
}

export async function deleteEducation(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("educations").delete().eq("id", id);

  if (error) {
    throw new Error(`Failed to delete education: ${error.message}`);
  }

  revalidatePath("/");
  return { success: true };
}

// ---------------- SKILL ACTIONS ----------------
export async function addSkill(formData: SkillFormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("skills").insert([formData]);

  if (error) {
    throw new Error(`Failed to add skill: ${error.message}`);
  }

  revalidatePath("/");
  return { success: true };
}

export async function updateSkill(id: string, formData: Partial<SkillFormData>) {
  const supabase = await createClient();
  const { error } = await supabase.from("skills").update(formData).eq("id", id);

  if (error) {
    throw new Error(`Failed to update skill: ${error.message}`);
  }

  revalidatePath("/");
  return { success: true };
}

export async function deleteSkill(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("skills").delete().eq("id", id);

  if (error) {
    throw new Error(`Failed to delete skill: ${error.message}`);
  }

  revalidatePath("/");
  return { success: true };
}

// ---------------- PROJECT ACTIONS ----------------
export async function addProject(formData: ProjectFormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("projects").insert([formData]);

  if (error) {
    throw new Error(`Failed to add project: ${error.message}`);
  }

  revalidatePath("/");
  return { success: true };
}

export async function updateProject(id: string, formData: Partial<ProjectFormData>) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("projects")
    .update({ ...formData, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to update project: ${error.message}`);
  }

  revalidatePath("/");
  return { success: true };
}

export async function deleteProject(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("projects").delete().eq("id", id);

  if (error) {
    throw new Error(`Failed to delete project: ${error.message}`);
  }

  revalidatePath("/");
  return { success: true };
}
