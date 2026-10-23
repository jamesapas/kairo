import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LandingPage } from "@/components/landing/landing-page";

export const dynamic = "force-dynamic";

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If user is already authenticated, immediately direct them to their workspace dashboard
  if (user) {
    redirect("/dashboard");
  }

  // Otherwise, present the professional SaaS landing page
  return <LandingPage />;
}
