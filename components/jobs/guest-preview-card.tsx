"use client";

import React from "react";
import {
  Sparkles,
  LayoutGrid,
  Flame,
  FileText,
  CheckCircle2,
} from "lucide-react";

export function GuestPreviewCard() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-6 sm:p-10">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full space-y-8 text-center sm:text-left">
        {/* Top Heading */}
        <div className="space-y-2 sm:w-1/2">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
            The modern command center for your job hunt
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
            Tired of chaotic spreadsheets and lost follow-ups? Track your applications from first click
            to accepted offer with built-in AI match analysis, interview pipelines, and daily momentum streaks.
          </p>
        </div>

        {/* 4 Feature Value Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
          {/* Card 1 */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/60 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
              AI Match & Gap Analysis
            </h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Instant resume-to-job matching score with actionable missing skills to highlight on your resume.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/60 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <LayoutGrid className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
              Table & Board Views
            </h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Switch smoothly between detailed spreadsheet rows and drag-and-drop Kanban pipeline stages.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/60 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
              Application Streaks
            </h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Stay motivated with daily application streaks, activity calendar heatmaps, and response rate metrics.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/60 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
              Tailored Materials Hub
            </h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Keep custom cover letters, resumes, and interview notes neatly linked to each individual company.
            </p>
          </div>
        </div>

        {/* Bottom Banner with reassuring micro-features */}
        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-zinc-500 dark:text-zinc-400">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>100% Free Personal Workspace</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Real-time Cloud Sync</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Dark & Light Mode</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
