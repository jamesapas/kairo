import React from "react";
import { SettingsView } from "@/components/settings/settings-view";

export const metadata = {
  title: "Profile & Settings | Kairo",
  description: "Manage your personal profile and job search preferences.",
};

export default function SettingsPage() {
  return <SettingsView />;
}
