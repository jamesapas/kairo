"use client";

import React, { useState, useEffect } from "react";
import { Plus, FileSpreadsheet } from "lucide-react";
import { JobApplication } from "@/types/job";

interface DashboardHeaderProps {
  jobs: JobApplication[];
  userEmail?: string;
  userName?: string;
  isLoading?: boolean;
  onAddNew: () => void;
  onExportCSV: () => void;
  onOpenStreakModal?: () => void;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function DashboardHeader({
  jobs,
  userEmail,
  userName,
  isLoading = false,
  onAddNew,
  onExportCSV,
}: DashboardHeaderProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const displayName = userName || (userEmail ? userEmail.split("@")[0] : "");
  const isReady = mounted && !isLoading && Boolean(displayName);
  const greeting = mounted ? getGreeting() : "";

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Title & Subtitle */}
      <div className="space-y-1.5">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
          Job Applications
        </h1>

        {/* Personalized Subtitle or Skeleton until fully mounted & loaded */}
        {!isReady ? (
          <div className="w-52 h-4 rounded-md bg-zinc-100 dark:bg-zinc-800 animate-pulse mt-0.5" />
        ) : (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            <span title={userEmail}>
              {greeting}, <span className="font-semibold text-zinc-800 dark:text-zinc-200">{displayName}</span>
            </span>
          </p>
        )}
      </div>

      {/* Header Action Buttons */}
      <div className="flex items-center gap-2.5 shrink-0">
        {jobs.length > 0 && (
          <button
            type="button"
            onClick={onExportCSV}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200/90 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-[0.98]"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
            Export CSV
          </button>
        )}

        <button
          type="button"
          onClick={onAddNew}
          className="px-4 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Application</span>
        </button>
      </div>
    </div>
  );
}
