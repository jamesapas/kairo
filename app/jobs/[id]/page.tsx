import { createClient } from "@/lib/supabase/server";
import { getJobByIdAction } from "@/lib/actions/jobs";
import { JobDetailPage } from "@/components/jobs/job-detail-page";
import { redirect, notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { success, data: job } = await getJobByIdAction(id);

  if (!success || !job) {
    notFound();
  }

  return <JobDetailPage initialJob={job} userEmail={user.email} />;
}
