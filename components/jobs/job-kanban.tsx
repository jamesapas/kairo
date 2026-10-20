"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowLeft,
  Trash2,
  Edit3,
  Star,
  Pin,
} from "lucide-react";
import {
  JobApplication,
  JobStatus,
  JOB_STATUS_CONFIG,
  formatRelativeDate,
  formatSalaryDisplay,
} from "@/types/job";
import { StatusIcon } from "./status-dropdown";
import { PlatformIcon } from "./platform-badge";
import { MatchCircularProgress } from "./job-table";

interface JobKanbanProps {
  jobs: JobApplication[];
  isLoading?: boolean;
  onSelectJob: (job: JobApplication) => void;
  onEditJob: (job: JobApplication) => void;
  onDeleteJob: (id: string) => void;
  onStatusChange: (id: string, newStatus: JobStatus) => void;
}

const KANBAN_COLUMNS: JobStatus[] = [
  "saved",
  "applied",
  "interviewing",
  "offer",
  "declined",
  "no_response",
  "rejected",
  "withdrawn",
];

export function JobKanban({
  jobs,
  isLoading = false,
  onSelectJob,
  onEditJob,
  onDeleteJob,
  onStatusChange,
}: JobKanbanProps) {
  const router = useRouter();

  const getNextStatus = (current: JobStatus): JobStatus | null => {
    const idx = KANBAN_COLUMNS.indexOf(current);
    if (idx >= 0 && idx < KANBAN_COLUMNS.length - 1) {
      return KANBAN_COLUMNS[idx + 1];
    }
    return null;
  };

  const getPrevStatus = (current: JobStatus): JobStatus | null => {
    const idx = KANBAN_COLUMNS.indexOf(current);
    if (idx > 0) {
      return KANBAN_COLUMNS[idx - 1];
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7 gap-3.5 items-start">
        {KANBAN_COLUMNS.map((statusKey) => {
          const config = JOB_STATUS_CONFIG[statusKey];
          return (
            <div
              key={statusKey}
              className="bg-zinc-100/70 dark:bg-zinc-900/60 rounded-2xl p-3 border border-zinc-200/80 dark:border-zinc-800 flex flex-col min-h-[460px] shadow-2xs space-y-3"
            >
              <div className="flex items-center justify-between px-1.5 py-1.5">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-white dark:bg-zinc-800 shadow-2xs">
                    <StatusIcon status={statusKey} className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{config.label}</h4>
                </div>
                <div className="w-5 h-4 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
              </div>
              <div className="space-y-2.5 flex-1">
                {[1, 2].map((k) => (
                  <div
                    key={k}
                    className="bg-white dark:bg-zinc-900 p-3.5 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 shadow-xs space-y-2.5 animate-pulse"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-20 h-3 rounded bg-zinc-200 dark:bg-zinc-800" />
                      <div className="w-3.5 h-3.5 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                    </div>
                    <div className="w-32 h-4 rounded bg-zinc-200 dark:bg-zinc-800" />
                    <div className="flex items-center gap-2 pt-1 border-t border-zinc-100 dark:border-zinc-800">
                      <div className="w-14 h-3 rounded bg-zinc-100 dark:bg-zinc-800" />
                      <div className="w-12 h-3 rounded bg-zinc-100 dark:bg-zinc-800" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7 gap-3.5 items-start">
      {KANBAN_COLUMNS.map((statusKey) => {
        const config = JOB_STATUS_CONFIG[statusKey];
        const columnJobs = jobs.filter((j) => j.status === statusKey);

        return (
          <div
            key={statusKey}
            className="bg-zinc-100/70 dark:bg-zinc-900/60 rounded-2xl p-3 border border-zinc-200/80 dark:border-zinc-800 flex flex-col min-h-[460px] shadow-2xs"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between px-1.5 py-1.5 mb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-lg bg-white dark:bg-zinc-800 shadow-2xs">
                  <StatusIcon status={statusKey} className="w-3.5 h-3.5" />
                </div>
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{config.label}</h4>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[11px] font-bold border border-zinc-200 dark:border-zinc-700 shadow-2xs">
                {columnJobs.length}
              </span>
            </div>

            {/* Column Cards */}
            <div className="space-y-2.5 flex-1">
              {columnJobs.map((job) => {
                const next = getNextStatus(job.status);
                const prev = getPrevStatus(job.status);

                return (
                  <div
                    key={job.id}
                    onClick={() => onSelectJob(job)}
                    onMouseEnter={() => router.prefetch(`/jobs/${job.id}`)}
                    className="bg-white dark:bg-zinc-900 p-3.5 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 shadow-[0_1px_4px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 cursor-pointer space-y-2.5 group relative"
                  >
                    {/* Header: Company & AI Match Badge */}
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 truncate">
                        {job.company}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {job.isPinned && (
                          <Pin className="w-3 h-3 text-rose-500 fill-rose-500" />
                        )}
                        {job.aiMatchAnalysis?.matchPercentage !== undefined && job.aiMatchAnalysis?.matchPercentage !== null ? (
                          <MatchCircularProgress
                            percentage={job.aiMatchAnalysis.matchPercentage}
                            label={job.aiMatchAnalysis.matchLabel}
                            size={28}
                          />
                        ) : null}
                      </div>
                    </div>

                    {/* Role Title */}
                    <h5 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                      {job.jobTitle}
                    </h5>

                    {/* Salary Tag (if available) */}
                    {job.salary && (
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-50 dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700 text-[10px] font-medium text-zinc-600 dark:text-zinc-300">
                        <span>{formatSalaryDisplay(job.salary)}</span>
                      </div>
                    )}

                    {/* Meta Footer */}
                    <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
                      <div className="flex items-center gap-1.5 truncate max-w-[110px]" title={job.appliedOn}>
                        <PlatformIcon platform={job.appliedOn} className="w-3 h-3 shrink-0" />
                        <span className="truncate">{job.appliedOn}</span>
                      </div>
                      <span title={job.dateApplied}>{formatRelativeDate(job.dateApplied)}</span>
                    </div>

                    {/* Card Actions Toolbar */}
                    <div
                      className="pt-1 flex items-center justify-between gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-1">
                        {prev && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onStatusChange(job.id, prev);
                            }}
                            title="Move to previous stage"
                            className="p-1 rounded-lg bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 transition cursor-pointer"
                          >
                            <ArrowLeft className="w-3 h-3" />
                          </button>
                        )}
                        {next && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onStatusChange(job.id, next);
                            }}
                            title="Advance to next stage"
                            className="p-1 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white transition cursor-pointer shadow-2xs"
                          >
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-0.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditJob(job);
                          }}
                          title="Edit"
                          className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 dark:text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteJob(job.id);
                          }}
                          title="Delete"
                          className="p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-zinc-400 dark:text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {columnJobs.length === 0 && (
                <div className="py-10 text-center border-2 border-dashed border-zinc-200/80 dark:border-zinc-800 rounded-2xl text-[11px] text-zinc-400 dark:text-zinc-500 flex flex-col items-center justify-center gap-1">
                  <span>No jobs</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
