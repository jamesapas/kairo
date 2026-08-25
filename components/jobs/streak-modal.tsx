"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import {
  X,
  Flame,
  Calendar,
  Trophy,
  Activity,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { JobApplication, formatRelativeDate, formatDateWords } from "@/types/job";
import { PlatformIcon } from "./platform-badge";
import { StatusIcon } from "./status-dropdown";
import { JOB_STATUS_CONFIG } from "@/types/job";

interface StreakModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobs: JobApplication[];
  onSelectJob?: (job: JobApplication) => void;
}

export function StreakModal({
  isOpen,
  onClose,
  jobs,
  onSelectJob,
}: StreakModalProps) {
  const [isRendered, setIsRendered] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      setIsClosing(false);
    } else if (isRendered) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setIsRendered(false);
        setIsClosing(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isRendered]);

  const handleClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsRendered(false);
      setIsClosing(false);
    }, 200);
  }, [isClosing, onClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isRendered && !isClosing) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isRendered, isClosing, handleClose]);

  // Analytics calculated only from submitted applications (not saved)
  const {
    currentStreak,
    isTodayCompleted,
    longestStreak,
    totalActiveDays,
    past28Days,
    dateGroups,
  } = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    // Map jobs by date
    const dateMap: Record<string, JobApplication[]> = {};
    jobs.forEach((j) => {
      if (j.dateApplied) {
        if (!dateMap[j.dateApplied]) dateMap[j.dateApplied] = [];
        dateMap[j.dateApplied].push(j);
      }
    });

    const uniqueDates = Object.keys(dateMap).sort().reverse();
    const totalActiveDays = uniqueDates.length;

    // Current Streak calculation
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    const isTodayCompleted = uniqueDates.includes(todayStr);
    const isYesterdayCompleted = uniqueDates.includes(yesterdayStr);

    let currentStreak = 0;
    if (isTodayCompleted || isYesterdayCompleted) {
      let checkDate = new Date(isTodayCompleted ? now : yesterday);
      while (true) {
        const checkStr = checkDate.toISOString().split("T")[0];
        if (uniqueDates.includes(checkStr)) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // Longest Streak calculation
    const sortedAsc = Object.keys(dateMap).sort();
    let longestStreak = 0;
    let tempStreak = 0;
    let prevDate: Date | null = null;

    sortedAsc.forEach((dStr) => {
      const d = new Date(dStr + "T00:00:00");
      if (!prevDate) {
        tempStreak = 1;
      } else {
        const diffDays = Math.round(
          (d.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (diffDays === 1) {
          tempStreak++;
        } else if (diffDays > 1) {
          tempStreak = 1;
        }
      }
      if (tempStreak > longestStreak) longestStreak = tempStreak;
      prevDate = d;
    });

    // Generate past 28 days (4 full 7-day weeks) for heatmap
    const past28Days: Array<{
      dateStr: string;
      dayOfWeek: string;
      dayNum: number;
      count: number;
      isToday: boolean;
      jobs: JobApplication[];
    }> = [];

    for (let i = 27; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const dayJobs = dateMap[dateStr] || [];
      past28Days.push({
        dateStr,
        dayOfWeek: d.toLocaleDateString("en-US", { weekday: "narrow" }),
        dayNum: d.getDate(),
        count: dayJobs.length,
        isToday: dateStr === todayStr,
        jobs: dayJobs,
      });
    }

    // Group active dates for list
    const dateGroups = uniqueDates.map((dateStr) => {
      const d = new Date(dateStr + "T00:00:00");
      const label =
        dateStr === todayStr
          ? "Today"
          : dateStr === yesterdayStr
          ? "Yesterday"
          : d.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              weekday: "short",
            });

      return {
        dateStr,
        label,
        jobs: dateMap[dateStr] || [],
      };
    });

    return {
      currentStreak,
      isTodayCompleted,
      longestStreak: Math.max(longestStreak, currentStreak),
      totalActiveDays,
      past28Days,
      dateGroups,
    };
  }, [jobs]);

  if (!isRendered) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity ${
          isClosing ? "animate-fade-out" : "animate-fade-in"
        }`}
        onClick={handleClose}
      />

      {/* Modal Card - Matches JobModal & HelpMeApplyModal exact style */}
      <div
        role="dialog"
        aria-modal="true"
        className={`relative z-10 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden my-auto ${
          isClosing ? "animate-modal-out" : "animate-modal"
        }`}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 text-white shadow-[0_0_12px_rgba(249,115,22,0.45)] shrink-0">
              <Flame className="w-3.5 h-3.5 fill-current" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                Streak & Activity
              </h2>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Consistency tracking and application history
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Key Metrics Overview */}
          <div className="grid grid-cols-3 gap-3">
            {/* Current Streak */}
            <div className="p-3.5 rounded-2xl bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block mb-1">
                Current Streak
              </span>
              <div className="flex items-center justify-center gap-1.5">
                <Flame className="w-4 h-4 fill-orange-500 text-orange-500 shrink-0" />
                <span className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100">
                  {currentStreak}
                </span>
              </div>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block mt-0.5 font-medium">
                {currentStreak === 1 ? "day streak" : "days streak"}
              </span>
            </div>

            {/* Best Streak */}
            <div className="p-3.5 rounded-2xl bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block mb-1">
                Best Streak
              </span>
              <div className="flex items-center justify-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100">
                  {longestStreak}
                </span>
              </div>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block mt-0.5 font-medium">
                {longestStreak === 1 ? "day record" : "days record"}
              </span>
            </div>

            {/* Total Active Days */}
            <div className="p-3.5 rounded-2xl bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block mb-1">
                Active Days
              </span>
              <div className="flex items-center justify-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100">
                  {totalActiveDays}
                </span>
              </div>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block mt-0.5 font-medium">
                total days active
              </span>
            </div>
          </div>

          {/* 4-Week Activity Heatmap */}
          <div className="p-4 rounded-2xl bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                <span>Past 4 Weeks</span>
              </span>
              <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                {isTodayCompleted ? "✓ Applied today" : "No application yet today"}
              </span>
            </div>

            <div className="grid grid-cols-7 gap-1.5 text-center">
              {past28Days.map((day) => {
                const hasApplied = day.count > 0;
                return (
                  <div
                    key={day.dateStr}
                    title={`${day.dateStr}: ${day.count} job(s)`}
                    className={`py-2 px-1 rounded-xl border flex flex-col items-center justify-center transition select-none ${
                      hasApplied
                        ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 shadow-2xs font-bold"
                        : day.isToday
                        ? "bg-white dark:bg-zinc-900 border-amber-400 text-zinc-900 dark:text-zinc-100 font-semibold"
                        : "bg-white dark:bg-zinc-900/60 border-zinc-200/70 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500"
                    }`}
                  >
                    <span className="text-[9px] uppercase font-medium opacity-60">
                      {day.dayOfWeek}
                    </span>
                    <span className="text-xs font-bold leading-tight mt-0.5">
                      {day.dayNum}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Activity Timeline List */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Application History
              </label>
              <span className="text-[11px] text-zinc-400">
                {dateGroups.length} active {dateGroups.length === 1 ? "day" : "days"}
              </span>
            </div>

            {dateGroups.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs text-zinc-400 dark:text-zinc-500">
                No activity recorded yet.
              </div>
            ) : (
              <div className="space-y-2 max-h-[240px] overflow-y-auto pr-0.5">
                {dateGroups.map((group) => (
                  <div
                    key={group.dateStr}
                    className="p-3 rounded-2xl bg-zinc-50/50 dark:bg-zinc-800/30 border border-zinc-200/70 dark:border-zinc-800 space-y-1.5"
                  >
                    {/* Date Header */}
                    <div className="flex items-center justify-between pb-1.5 border-b border-zinc-100 dark:border-zinc-800 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-zinc-800 dark:text-zinc-200">
                        <span>{group.label}</span>
                        <span className="text-[11px] text-zinc-400 font-normal font-mono">
                          • {group.dateStr}
                        </span>
                      </div>
                      <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800">
                        {group.jobs.length} {group.jobs.length === 1 ? "job" : "jobs"}
                      </span>
                    </div>

                    {/* Jobs on this date */}
                    <div className="space-y-1">
                      {group.jobs.map((job) => {
                        const statusConfig =
                          JOB_STATUS_CONFIG[job.status] || JOB_STATUS_CONFIG.applied;
                        return (
                          <div
                            key={job.id}
                            onClick={() => {
                              if (onSelectJob) {
                                onSelectJob(job);
                                handleClose();
                              }
                            }}
                            className="py-1 px-2 rounded-xl flex items-center justify-between gap-2 text-xs hover:bg-white dark:hover:bg-zinc-800 transition cursor-pointer group"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <PlatformIcon
                                platform={job.appliedOn}
                                className="w-3.5 h-3.5 shrink-0"
                              />
                              <span className="font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition truncate">
                                {job.jobTitle}
                              </span>
                              <span className="text-zinc-400 dark:text-zinc-500 text-[11px] truncate">
                                · {job.company}
                              </span>
                            </div>

                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 shrink-0">
                              {statusConfig.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/80 flex items-center justify-end">
          <button
            type="button"
            onClick={handleClose}
            className="px-5 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 font-semibold text-xs transition cursor-pointer shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
