"use client";

import React from "react";
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
  JobMatch,
  JOB_STATUS_CONFIG,
  formatRelativeDate,
} from "@/types/job";
import { StatusIcon } from "./status-dropdown";
import { PlatformIcon } from "./platform-badge";

interface JobKanbanProps {
  jobs: JobApplication[];
  onSelectJob: (job: JobApplication) => void;
  onEditJob: (job: JobApplication) => void;
  onDeleteJob: (id: string) => void;
  onStatusChange: (id: string, newStatus: JobStatus) => void;
}

const KANBAN_COLUMNS: JobStatus[] = [
  "applied",
  "interviewing",
  "offer",
  "no_response",
  "rejected",
  "withdrawn",
];

function MatchIcon({ match }: { match?: JobMatch }) {
  const m = match || "good";

  if (m === "good") {
    return (
      <span title="Good Match" className="inline-flex items-center justify-center">
        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
      </span>
    );
  }

  if (m === "mid") {
    return (
      <span title="Mid Match" className="inline-flex items-center justify-center">
        <Star className="w-3.5 h-3.5 text-amber-400 stroke-[2] shrink-0" />
      </span>
    );
  }

  return (
    <span title="Far Match" className="inline-flex items-center justify-center">
      <Star className="w-3.5 h-3.5 text-zinc-300 stroke-[2] shrink-0" />
    </span>
  );
}

export function JobKanban({
  jobs,
  onSelectJob,
  onEditJob,
  onDeleteJob,
  onStatusChange,
}: JobKanbanProps) {
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 items-start">
      {KANBAN_COLUMNS.map((statusKey) => {
        const config = JOB_STATUS_CONFIG[statusKey];
        const columnJobs = jobs.filter((j) => j.status === statusKey);

        return (
          <div
            key={statusKey}
            className="bg-zinc-100/60 rounded-2xl p-3 border border-zinc-200/70 flex flex-col min-h-[420px]"
          >
            {/* Column Header with StatusIcon */}
            <div className="flex items-center justify-between px-1 py-1.5 mb-2">
              <div className="flex items-center gap-1.5">
                <StatusIcon status={statusKey} className="w-3.5 h-3.5" />
                <h4 className="text-xs font-bold text-zinc-900">{config.label}</h4>
              </div>
              <span className="px-2 py-0.2 rounded-full bg-white text-zinc-600 text-[10px] font-bold border border-zinc-200">
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
                    className="bg-white p-3.5 rounded-xl border border-zinc-200 shadow-2xs hover:shadow-xs hover:border-zinc-300 transition cursor-pointer space-y-2 group"
                  >
                    {/* Header: Match icon and Company */}
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <MatchIcon match={job.match} />
                        <span className="text-[11px] font-bold text-zinc-600 truncate">
                          {job.company}
                        </span>
                      </div>
                      {job.isPinned && (
                        <Pin className="w-3 h-3 text-rose-500 fill-rose-500 shrink-0" />
                      )}
                    </div>

                    {/* Role Title */}
                    <h5 className="text-xs font-bold text-zinc-900 leading-tight group-hover:text-blue-600 transition line-clamp-2">
                      {job.jobTitle}
                    </h5>

                    {/* Meta with relative date indicator */}
                    <div className="pt-1.5 border-t border-zinc-100 flex items-center justify-between text-[10px] text-zinc-500 font-medium">
                      <div className="flex items-center gap-1.5 truncate max-w-[110px]" title={job.appliedOn}>
                        <PlatformIcon platform={job.appliedOn} className="w-3 h-3 shrink-0" />
                        <span className="truncate">{job.appliedOn}</span>
                      </div>
                      <span title={job.dateApplied}>{formatRelativeDate(job.dateApplied)}</span>
                    </div>

                    {/* Actions */}
                    <div
                      className="pt-1 flex items-center justify-between gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-1">
                        {prev && (
                          <button
                            onClick={() => onStatusChange(job.id, prev)}
                            className="p-1 rounded-lg bg-zinc-50 hover:bg-zinc-200 text-zinc-500 transition cursor-pointer"
                          >
                            <ArrowLeft className="w-3 h-3" />
                          </button>
                        )}
                        {next && (
                          <button
                            onClick={() => onStatusChange(job.id, next)}
                            className="p-1 rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 transition cursor-pointer"
                          >
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={() => onEditJob(job)}
                          className="p-1 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-800 transition cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => onDeleteJob(job.id)}
                          className="p-1 rounded-lg hover:bg-rose-50 text-zinc-400 hover:text-rose-600 transition cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {columnJobs.length === 0 && (
                <div className="py-6 text-center border border-dashed border-zinc-200 rounded-xl text-[11px] text-zinc-400">
                  Empty
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
