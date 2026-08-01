import { createClient } from "@/lib/supabase/server";
import { getCareerData } from "@/lib/actions/career";
import { DashboardView } from "@/components/dashboard/dashboard-view";
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

  const careerData = await getCareerData();

  return <DashboardView initialData={careerData} userEmail={user.email} />;
}
