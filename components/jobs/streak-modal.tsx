"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
  X,
  Flame,
  Calendar,
  Trophy,
  CheckCircle2,
  Briefcase,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { JobApplication, formatRelativeDate } from "@/types/job";
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

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsRendered(false);
      setIsClosing(false);
    }, 200);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isRendered && !isClosing) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isRendered, isClosing]);

  // Analytics
  const {
    currentStreak,
    isTodayCompleted,
    longestStreak,
    totalActiveDays,
    past30Days,
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

    // Generate past 28 days (4 full weeks) for heatmap
    const past30Days: Array<{
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
      past30Days.push({
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
      past30Days,
      dateGroups,
    };
  }, [jobs]);

  if (!isRendered) return null;

  return (
    <div
      onClick={handleClose}
      className={`fixed inset-0 z-50 overflow-y-auto bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center p-4 ${
        isClosing ? "animate-fade-out" : "animate-fade-in"
      }`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden my-auto ${
          isClosing ? "animate-modal-out" : "animate-modal"
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-orange-100 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 shadow-2xs">
              <Flame className="w-6 h-6 fill-orange-500 text-orange-500 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                Application Streak & Activity
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Track your consistency and application history by date
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Streak Overview Metrics */}
          <div className="grid grid-cols-3 gap-3">
            {/* Current Streak */}
            <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 text-center relative overflow-hidden">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 block mb-1">
                Current Streak
              </span>
              <div className="flex items-center justify-center gap-1">
                <Flame className="w-5 h-5 fill-orange-500 text-orange-500" />
                <span className="text-2xl font-black text-amber-950 dark:text-amber-100">
                  {currentStreak}
                </span>
              </div>
              <span className="text-[11px] font-medium text-amber-700 dark:text-amber-400 block mt-0.5">
                {currentStreak === 1 ? "day" : "consecutive days"}
              </span>
            </div>

            {/* Longest Record */}
            <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800/60 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400 block mb-1">
                Best Streak
              </span>
              <div className="flex items-center justify-center gap-1">
                <Trophy className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-2xl font-black text-purple-950 dark:text-purple-100">
                  {longestStreak}
                </span>
              </div>
              <span className="text-[11px] font-medium text-purple-700 dark:text-purple-400 block mt-0.5">
                {longestStreak === 1 ? "day record" : "days record"}
              </span>
            </div>

            {/* Total Active Days */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block mb-1">
                Active Days
              </span>
              <div className="flex items-center justify-center gap-1">
                <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-2xl font-black text-emerald-950 dark:text-emerald-100">
                  {totalActiveDays}
                </span>
              </div>
              <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 block mt-0.5">
                total days applied
              </span>
            </div>
          </div>

          {/* 4-Week Activity Heatmap */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                Past 4 Weeks Activity
              </span>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                {isTodayCompleted ? "Applied today! 🎉" : "Pending application today"}
              </span>
            </div>

            <div className="grid grid-cols-7 gap-1.5 text-center">
              {past30Days.map((day) => {
                const hasApplied = day.count > 0;
                return (
                  <div
                    key={day.dateStr}
                    title={`${day.dateStr}: ${day.count} job(s) applied`}
                    className={`p-2 rounded-xl border flex flex-col items-center justify-center transition select-none ${
                      hasApplied
                        ? "bg-amber-500 text-white border-amber-600 shadow-2xs font-bold"
                        : day.isToday
                        ? "bg-white dark:bg-zinc-800 border-dashed border-orange-400 text-zinc-800 dark:text-zinc-200"
                        : "bg-white dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700 text-zinc-400 dark:text-zinc-500"
                    }`}
                  >
                    <span className="text-[9px] uppercase font-semibold opacity-75">
                      {day.dayOfWeek}
                    </span>
                    <span className="text-xs font-bold">{day.dayNum}</span>
                    {hasApplied && (
                      <span className="text-[9px] leading-tight">
                        {day.count}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Streak History Timeline by Date */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              History by Date ({dateGroups.length} active dates)
            </h3>

            {dateGroups.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs text-zinc-400 dark:text-zinc-500">
                No application dates recorded yet.
              </div>
            ) : (
              <div className="space-y-2.5">
                {dateGroups.map((group) => (
                  <div
                    key={group.dateStr}
                    className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-2xs space-y-2"
                  >
                    {/* Date Header */}
                    <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-orange-500" />
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                          {group.label}
                        </span>
                        <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono">
                          ({group.dateStr})
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                        {group.jobs.length} {group.jobs.length === 1 ? "job" : "jobs"}
                      </span>
                    </div>

                    {/* Job Items on this date */}
                    <div className="divide-y divide-zinc-50 dark:divide-zinc-800">
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
                            className="py-1.5 flex items-center justify-between gap-3 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-800/60 rounded-lg px-1.5 transition cursor-pointer group"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <PlatformIcon
                                platform={job.appliedOn}
                                className="w-3.5 h-3.5 shrink-0"
                              />
                              <span className="font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                                {job.jobTitle}
                              </span>
                              <span className="text-zinc-400 dark:text-zinc-500 text-[11px]">
                                · {job.company}
                              </span>
                            </div>

                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 shrink-0">
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
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/80 flex justify-end">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-semibold transition cursor-pointer shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
