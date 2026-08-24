"use client";

import React, { useMemo } from "react";
import {
  Flame,
  Calendar,
  Briefcase,
  TrendingUp,
  Radio,
  Sparkles,
  ArrowUpRight,
  Zap,
} from "lucide-react";
import { JobApplication } from "@/types/job";

export interface JobStats {
  total: number;
  streak: number;
  isTodayCompleted: boolean;
  thisWeek: number;
  weekRangeLabel: string;
  interviewing: number;
  offers: number;
  responseRate: number;
}

export function calculateJobStats(jobs: JobApplication[]): JobStats {
  const total = jobs.length;
  const interviewing = jobs.filter((j) => j.status === "interviewing").length;
  const offers = jobs.filter((j) => j.status === "offer").length;

  const responded = jobs.filter(
    (j) =>
      j.status === "interviewing" ||
      j.status === "offer" ||
      j.status === "rejected"
  ).length;

  const responseRate = total > 0 ? Math.round((responded / total) * 100) : 0;

  const now = new Date();

  // Calculate Current Calendar Week (Mon - Sun)
  const dayOfWeek = now.getDay();
  const diffToMonday = (dayOfWeek + 6) % 7;
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - diffToMonday);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const startOfWeekStr = startOfWeek.toISOString().split("T")[0];
  const endOfWeekStr = endOfWeek.toISOString().split("T")[0];

  const thisWeek = jobs.filter(
    (j) => j.dateApplied >= startOfWeekStr && j.dateApplied <= endOfWeekStr
  ).length;

  const startMonth = startOfWeek.toLocaleDateString("en-US", { month: "short" });
  const startDay = startOfWeek.getDate();
  const endMonth = endOfWeek.toLocaleDateString("en-US", { month: "short" });
  const endDay = endOfWeek.getDate();
  const weekRangeLabel =
    startMonth === endMonth
      ? `${startMonth} ${startDay} – ${endDay}`
      : `${startMonth} ${startDay} – ${endMonth} ${endDay}`;

  // Calculate Streak
  const uniqueDates = Array.from(
    new Set(jobs.map((j) => j.dateApplied).filter(Boolean))
  ).sort((a, b) => (a > b ? -1 : 1));

  const todayStr = now.toISOString().split("T")[0];
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  const isTodayCompleted = uniqueDates.includes(todayStr);
  const isYesterdayCompleted = uniqueDates.includes(yesterdayStr);

  let streak = 0;
  if (isTodayCompleted || isYesterdayCompleted) {
    let checkDate = new Date(isTodayCompleted ? now : yesterday);
    while (true) {
      const checkStr = checkDate.toISOString().split("T")[0];
      if (uniqueDates.includes(checkStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  return {
    total,
    streak,
    isTodayCompleted,
    thisWeek,
    weekRangeLabel,
    interviewing,
    offers,
    responseRate,
  };
}

interface JobStatsOverviewProps {
  jobs: JobApplication[];
  onOpenStreakModal?: () => void;
  onFilterThisWeek?: () => void;
  onFilterInterviewing?: () => void;
  className?: string;
}

export function JobStatsOverview({
  jobs,
  onOpenStreakModal,
  onFilterThisWeek,
  onFilterInterviewing,
  className = "",
}: JobStatsOverviewProps) {
  const stats = useMemo(() => calculateJobStats(jobs), [jobs]);

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Daily Streak */}
        <button
          type="button"
          onClick={onOpenStreakModal}
          className="relative text-left p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(249,115,22,0.12)] hover:border-amber-400 dark:hover:border-amber-500/80 hover:-translate-y-0.5 active:scale-[0.99] cursor-pointer overflow-hidden group select-none"
        >
          {/* Subtle Ambient Gradient Glow */}
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-gradient-to-br from-amber-400/10 to-orange-500/10 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-300" />

          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 group-hover:text-amber-700 dark:group-hover:text-amber-400">
              Daily Streak
            </span>
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 duration-200 ${
                stats.streak > 0
                  ? "bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-sm shadow-orange-500/20"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500"
              }`}
            >
              <Flame
                className={`w-4 h-4 ${
                  stats.streak > 0 ? "fill-white text-white animate-pulse" : ""
                }`}
              />
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
              {stats.streak}
            </span>
            <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500">
              {stats.streak === 1 ? "day active" : "days active"}
            </span>
          </div>

          <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-zinc-100 dark:border-zinc-800 text-[11px]">
            <span className="text-zinc-500 dark:text-zinc-400 font-medium truncate flex items-center gap-1.5">
              {stats.isTodayCompleted ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span>Applied today 🔥</span>
                </>
              ) : stats.streak > 0 ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>Due today</span>
                </>
              ) : (
                <span>Start today</span>
              )}
            </span>
            <span className="text-orange-600 dark:text-orange-400 font-semibold text-[11px] opacity-80 group-hover:opacity-100 flex items-center gap-0.5 shrink-0">
              History <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </span>
          </div>
        </button>

        {/* Card 2: This Week */}
        <button
          type="button"
          onClick={onFilterThisWeek}
          className="relative text-left p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(59,130,246,0.12)] hover:border-blue-400 dark:hover:border-blue-500/80 hover:-translate-y-0.5 active:scale-[0.99] cursor-pointer overflow-hidden group select-none"
        >
          {/* Subtle Ambient Gradient Glow */}
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-gradient-to-br from-blue-400/10 to-indigo-500/10 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-300" />

          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 group-hover:text-blue-700 dark:group-hover:text-blue-400">
              This Week
            </span>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-sm shadow-blue-500/20 group-hover:scale-110 transition-transform duration-200">
              <Calendar className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
              {stats.thisWeek}
            </span>
            <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500">submitted</span>
          </div>

          <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-zinc-100 dark:border-zinc-800 text-[11px]">
            <span className="text-zinc-500 dark:text-zinc-400 font-medium truncate">
              {stats.weekRangeLabel}
            </span>
            <span className="text-blue-600 dark:text-blue-400 font-semibold text-[11px] opacity-80 group-hover:opacity-100 flex items-center gap-0.5 shrink-0">
              Filter <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </span>
          </div>
        </button>

        {/* Card 3: In Interview */}
        <button
          type="button"
          onClick={onFilterInterviewing}
          className="relative text-left p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(168,85,247,0.12)] hover:border-purple-400 dark:hover:border-purple-500/80 hover:-translate-y-0.5 active:scale-[0.99] cursor-pointer overflow-hidden group select-none"
        >
          {/* Subtle Ambient Gradient Glow */}
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-gradient-to-br from-purple-400/10 to-pink-500/10 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-300" />

          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 group-hover:text-purple-700 dark:group-hover:text-purple-400">
              In Interview
            </span>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 text-white flex items-center justify-center shadow-sm shadow-purple-500/20 group-hover:scale-110 transition-transform duration-200">
              <Radio className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
              {stats.interviewing}
            </span>
            <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500">active</span>
          </div>

          <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-zinc-100 dark:border-zinc-800 text-[11px]">
            <span className="text-zinc-500 dark:text-zinc-400 font-medium truncate">
              {stats.offers > 0 ? `${stats.offers} offer received 🎉` : stats.interviewing > 0 ? "Active pipeline" : "No active interviews"}
            </span>
            <span className="text-purple-600 dark:text-purple-400 font-semibold text-[11px] opacity-80 group-hover:opacity-100 flex items-center gap-0.5 shrink-0">
              View <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </span>
          </div>
        </button>

        {/* Card 4: Response Rate */}
        <div className="relative text-left p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(16,185,129,0.12)] hover:border-emerald-400 dark:hover:border-emerald-500/80 hover:-translate-y-0.5 overflow-hidden group select-none">
          {/* Subtle Ambient Gradient Glow */}
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-gradient-to-br from-emerald-400/10 to-teal-500/10 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-300" />

          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
              Response Rate
            </span>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-sm shadow-emerald-500/20 group-hover:scale-110 transition-transform duration-200">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
              {stats.responseRate}%
            </span>
            <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500">
              of {stats.total} total
            </span>
          </div>

          <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-zinc-100 dark:border-zinc-800 text-[11px]">
            <span className="text-zinc-500 dark:text-zinc-400 font-medium truncate">
              {stats.total > 0 ? "Advancement rate" : "No data yet"}
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px] flex items-center gap-0.5 shrink-0">
              <Zap className="w-3 h-3 text-emerald-500" /> High
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
