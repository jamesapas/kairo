"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import {
  UserProfile,
  UserProfileRow,
  ProfileLink,
  mapRowToProfile,
} from "@/types/profile";

export async function getProfileAction(): Promise<{
  success: boolean;
  data?: UserProfile;
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
      .from("users")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching user profile:", error);
      return { success: false, error: error.message };
    }

    if (!data) {
      // Create initial user record if missing
      const initialUser = {
        id: user.id,
        email: user.email || "",
        name: user.email ? user.email.split("@")[0] : "User",
        career_summary: null,
        links: [],
      };

      const { data: newRow, error: insertError } = await supabase
        .from("users")
        .insert(initialUser)
        .select()
        .single();

      if (insertError) {
        console.error("Error creating initial user profile:", insertError);
        return { success: false, error: insertError.message };
      }

      return { success: true, data: mapRowToProfile(newRow as UserProfileRow) };
    }

    return { success: true, data: mapRowToProfile(data as UserProfileRow) };
  } catch (err: unknown) {
    console.error("Unexpected error fetching profile:", err);
    return { success: false, error: (err as Error)?.message || "Failed to fetch profile" };
  }
}

export async function updateProfileAction(
  payload: Partial<Pick<UserProfile, "name" | "location" | "avatarUrl" | "careerSummary" | "links">>
): Promise<{
  success: boolean;
  data?: UserProfile;
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

    const updateFields: Partial<UserProfileRow> = {
      updated_at: new Date().toISOString(),
    };

    if (payload.name !== undefined) updateFields.name = payload.name.trim();
    if (payload.location !== undefined) updateFields.location = payload.location.trim();
    if (payload.avatarUrl !== undefined) updateFields.avatar_url = payload.avatarUrl.trim();
    if (payload.careerSummary !== undefined) updateFields.career_summary = payload.careerSummary.trim();
    if (payload.links !== undefined) updateFields.links = payload.links;

    const { data, error } = await supabase
      .from("users")
      .update(updateFields)
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating profile:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/", "layout");
    revalidatePath("/settings", "page");
    return { success: true, data: mapRowToProfile(data as UserProfileRow) };
  } catch (err: unknown) {
    console.error("Unexpected error updating profile:", err);
    return { success: false, error: (err as Error)?.message || "Failed to update profile" };
  }
}

export async function uploadAvatarAction(formData: FormData): Promise<{
  success: boolean;
  publicUrl?: string;
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

    const file = formData.get("file") as File;
    if (!file || file.size === 0) {
      return { success: false, error: "No file provided" };
    }

    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: "Image size must be less than 5MB" };
    }

    const fileExt = file.name.split(".").pop() || "png";
    const filePath = `${user.id}/avatar-${Date.now()}.${fileExt}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("Error uploading avatar to storage:", uploadError);
      return { success: false, error: uploadError.message };
    }

    const { data: publicUrlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    return { success: true, publicUrl: publicUrlData.publicUrl };
  } catch (err: unknown) {
    console.error("Unexpected error uploading avatar:", err);
    return { success: false, error: (err as Error)?.message || "Failed to upload avatar" };
  }
}
