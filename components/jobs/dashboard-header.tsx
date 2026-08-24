"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  FileSpreadsheet,
  Flame,
} from "lucide-react";
import { JobApplication } from "@/types/job";
import { calculateJobStats } from "./job-stats-overview";

interface DashboardHeaderProps {
  jobs: JobApplication[];
  userEmail?: string;
  onAddNew: () => void;
  onExportCSV: () => void;
  onOpenStreakModal?: () => void;
}

export function DashboardHeader({
  jobs,
  userEmail,
  onAddNew,
  onExportCSV,
  onOpenStreakModal,
}: DashboardHeaderProps) {
  const stats = calculateJobStats(jobs);

  // Time-aware greeting
  const [greeting, setGreeting] = useState("Good day");
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  const displayName = userEmail ? userEmail.split("@")[0] : "there";

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Title & Live Pipeline Status */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
            Job Applications
          </h1>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {stats.interviewing > 0
              ? `${stats.interviewing} in interview stages`
              : stats.offers > 0
              ? `${stats.offers} offer received`
              : "Pipeline Active"}
          </span>
        </div>

        {/* Personalized Subtitle */}
        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium flex flex-wrap items-center gap-2">
          <span title={userEmail}>{greeting}, <span className="font-semibold text-zinc-800 dark:text-zinc-200">{displayName}</span></span>
          {stats.streak > 0 && (
            <>
              <span className="text-zinc-300 dark:text-zinc-700">•</span>
              <button
                type="button"
                onClick={onOpenStreakModal}
                className="inline-flex items-center gap-1 text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-semibold transition cursor-pointer"
                title="View Streak History"
              >
                <Flame className="w-3 h-3 fill-orange-500 text-orange-500" />
                <span>{stats.streak}d streak</span>
              </button>
            </>
          )}
        </p>
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
