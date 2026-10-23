import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const isCustomRedirect = next.startsWith("/");
      return NextResponse.redirect(`${origin}${isCustomRedirect ? next : "/dashboard"}`);
    }
  }

  // Return the user to an error page or login page if exchange failed
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
