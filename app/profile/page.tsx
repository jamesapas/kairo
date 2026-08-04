import { createClient } from "@/lib/supabase/server";
import { getCareerData } from "@/lib/actions/career";
import { ProfileView } from "@/components/profile/profile-view";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const careerData = await getCareerData();

  return <ProfileView initialData={careerData} userEmail={user.email} />;
}
