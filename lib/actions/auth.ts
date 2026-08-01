"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

const ALLOWED_EMAIL = "apasjameskarl@gmail.com";

export async function sendMagicLink(email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  // Strict email check
  if (normalizedEmail !== ALLOWED_EMAIL) {
    return {
      success: false,
      error: "Access denied.",
    };
  }

  const supabase = await createClient();
  const headerList = await headers();
  const origin = headerList.get("origin") || "http://localhost:3000";

  const { error } = await supabase.auth.signInWithOtp({
    email: normalizedEmail,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      shouldCreateUser: true, // Allow user creation for authorized email if first time
    },
  });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
    message: "Magic link sent! Check your inbox to sign in.",
  };
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
