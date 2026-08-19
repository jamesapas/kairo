import { createClient } from "@/lib/supabase/server";
import { ResumeGenerator } from "@/components/resume/resume-generator";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ResumePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <ResumeGenerator userEmail={user.email} />;
}
