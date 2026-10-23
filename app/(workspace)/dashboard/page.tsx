import { redirect } from "next/navigation";
import { JobDashboard } from "@/components/jobs/job-dashboard";
import { createClient } from "@/lib/supabase/server";
import { JobApplicationRow, mapRowToJob } from "@/types/job";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  let userName: string | undefined;
  const userEmail = user.email;

  const { data: profile } = await supabase
    .from("users")
    .select("name")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.name) {
    userName = profile.name;
  }

  const { data: jobsData } = await supabase
    .from("job_applications")
    .select("*")
    .eq("user_id", user.id)
    .order("is_pinned", { ascending: false })
    .order("date_applied", { ascending: false })
    .order("created_at", { ascending: false });

  const initialJobs = jobsData
    ? (jobsData as JobApplicationRow[]).map(mapRowToJob)
    : [];

  return (
    <JobDashboard
      userEmail={userEmail}
      userName={userName}
      initialJobs={initialJobs}
    />
  );
}
