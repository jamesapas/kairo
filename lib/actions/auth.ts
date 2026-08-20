"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signInWithPassword(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail || !password) {
    return {
      success: false,
      error: "Email and password are required.",
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
  };
}

export async function signUpWithPassword(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail || !password) {
    return {
      success: false,
      error: "Email and password are required.",
    };
  }

  if (password.length < 6) {
    return {
      success: false,
      error: "Password must be at least 6 characters.",
    };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email: normalizedEmail,
    password,
  });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  // If Supabase has email confirmation enabled, session will be null
  if (data.user && !data.session) {
    return {
      success: true,
      requiresEmailConfirmation: true,
      message: "Account created! Please check your email to confirm your account before signing in.",
    };
  }

  return {
    success: true,
    requiresEmailConfirmation: false,
    message: "Account created successfully!",
  };
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
