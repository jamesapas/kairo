import { JobDetailPage } from "@/components/jobs/job-detail-page";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <JobDetailPage jobId={id} />;
}
