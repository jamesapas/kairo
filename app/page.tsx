import { createClient } from "@/lib/supabase/server";
import { JobDashboard } from "@/components/jobs/job-dashboard";
import { getJobsAction } from "@/lib/actions/jobs";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: initialJobs } = await getJobsAction();

  return <JobDashboard userEmail={user.email} initialJobs={initialJobs || []} />;
}

