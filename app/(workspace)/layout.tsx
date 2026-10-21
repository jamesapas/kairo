import React from "react";
import { Navbar } from "@/components/layout/navbar";
import { createClient } from "@/lib/supabase/server";

export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-zinc-50/90 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col relative selection:bg-zinc-900 dark:selection:bg-zinc-100 selection:text-white dark:selection:text-zinc-900">
      {/* Subtle Ambient Background Glow Accent */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[1536px] h-64 bg-gradient-to-b from-zinc-200/40 dark:from-zinc-800/20 via-zinc-100/20 dark:via-zinc-900/10 to-transparent pointer-events-none blur-3xl -z-10" />

      {/* Global Persistent Workspace Navbar */}
      <Navbar userEmail={user?.email} />

      {/* Workspace Content Shell */}
      <div className="flex-1 flex flex-col w-full">
        {children}
      </div>
    </div>
  );
}
