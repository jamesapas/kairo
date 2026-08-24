"use client";

import React from "react";
import {
  Calendar,
  ExternalLink,
  Edit3,
  Trash2,
  Briefcase,
  Star,
  Pin,
} from "lucide-react";
import {
  JobApplication,
  JobStatus,
  JobMatch,
  formatRelativeDate,
  formatSalaryDisplay,
} from "@/types/job";
import { StatusDropdown } from "./status-dropdown";
import { PlatformIcon } from "./platform-badge";

interface JobTableProps {
  jobs: JobApplication[];
  onSelectJob: (job: JobApplication) => void;
  onEditJob: (job: JobApplication) => void;
  onDeleteJob: (id: string) => void;
  onStatusChange: (id: string, newStatus: JobStatus) => void;
  onTogglePin: (id: string) => void;
  onAddNew: () => void;
}

export function MatchIcon({ match }: { match?: JobMatch }) {
  const m = match || "good";

  if (m === "good") {
    return (
      <span title="Good Match" className="inline-flex items-center justify-center">
        <Star className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0" />
      </span>
    );
  }

  if (m === "mid") {
    return (
      <span title="Mid Match" className="inline-flex items-center justify-center">
        <Star className="w-4 h-4 text-amber-400 stroke-[2] shrink-0" />
      </span>
    );
  }

  return (
    <span title="Far Match" className="inline-flex items-center justify-center">
      <Star className="w-4 h-4 text-zinc-300 stroke-[2] shrink-0" />
    </span>
  );
}

export function JobTable({
  jobs,
  onSelectJob,
  onEditJob,
  onDeleteJob,
  onStatusChange,
  onTogglePin,
  onAddNew,
}: JobTableProps) {
  if (jobs.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-10 text-center flex flex-col items-center justify-center space-y-2.5">
        <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-400">
          <Briefcase className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-bold text-zinc-800">No applications tracked yet</h3>
        <p className="text-xs text-zinc-500">
          Add your first job application to get started.
        </p>
        <button
          onClick={onAddNew}
          className="mt-1 px-4 py-2 rounded-xl bg-zinc-900 text-white font-semibold text-xs hover:bg-zinc-800 transition cursor-pointer shadow-sm"
        >
          + Add Job
        </button>
      </div>
    );
  }

  // Group jobs into sections: Pinned, Active, Rejected
  const pinnedJobs = jobs.filter((j) => j.isPinned && j.status !== "rejected");
  const activeJobs = jobs.filter((j) => !j.isPinned && j.status !== "rejected");
  const rejectedJobs = jobs.filter((j) => j.status === "rejected");

  const renderJobRows = (list: JobApplication[], isMuted = false) => {
    return list.map((job) => {
      return (
        <tr
          key={job.id}
          onClick={() => onSelectJob(job)}
          className={`hover:bg-zinc-50/80 transition-colors cursor-pointer group ${
            isMuted ? "opacity-75 hover:opacity-100 bg-zinc-50/30" : ""
          }`}
        >
          {/* First Side: Match Icon */}
          <td className="py-3.5 pl-4 pr-1 text-center align-middle">
            <MatchIcon match={job.match} />
          </td>

          {/* Role & Company */}
          <td className="py-3.5 px-4">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="font-bold text-zinc-900 truncate">{job.jobTitle}</p>
                {job.isPinned && (
                  <Pin className="w-3 h-3 text-rose-500 fill-rose-500 shrink-0" />
                )}
              </div>
              <p className="text-zinc-500 text-[11px] font-medium truncate">
                {job.company}
              </p>
            </div>
          </td>

          {/* Custom Status Dropdown with icons on all options */}
          <td className="py-3.5 px-3" onClick={(e) => e.stopPropagation()}>
            <StatusDropdown
              value={job.status}
              onChange={(newStatus) => onStatusChange(job.id, newStatus)}
              size="sm"
            />
          </td>

          {/* Platform */}
          <td className="py-3.5 px-3 text-zinc-600 font-medium">
            <div className="flex items-center gap-1.5">
              <PlatformIcon platform={job.appliedOn} className="w-3.5 h-3.5 shrink-0" />
              <span>{job.appliedOn}</span>
            </div>
          </td>

          {/* Workplace */}
          <td className="py-3.5 px-3 text-zinc-600 font-medium">
            <span>{job.workplaceType}</span>
          </td>

          {/* Compensation */}
          <td className="py-3.5 px-3 text-zinc-600 font-medium">
            <span className="truncate block max-w-[120px]">
              {formatSalaryDisplay(job.salary) || "—"}
            </span>
          </td>

          {/* Date Applied */}
          <td className="py-3.5 px-3 text-zinc-500 font-medium">
            <div className="flex items-center gap-1" title={job.dateApplied}>
              <Calendar className="w-3 h-3 text-zinc-400" />
              <span>{formatRelativeDate(job.dateApplied)}</span>
            </div>
          </td>

          {/* Actions */}
          <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-end gap-1">
              {/* Red Pin Toggle */}
              <button
                onClick={() => onTogglePin(job.id)}
                title={job.isPinned ? "Unpin job" : "Pin job to top"}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  job.isPinned
                    ? "text-rose-600 bg-rose-50 hover:bg-rose-100"
                    : "text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100"
                }`}
              >
                <Pin
                  className={`w-3.5 h-3.5 ${
                    job.isPinned ? "fill-rose-500 text-rose-500" : ""
                  }`}
                />
              </button>

              {job.jobUrl && (
                <a
                  href={job.jobUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open Link"
                  className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-900 transition cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              <button
                onClick={() => onEditJob(job)}
                title="Edit Application"
                className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDeleteJob(job.id)}
                title="Delete Application"
                className="p-1.5 rounded-lg hover:bg-rose-50 text-zinc-400 hover:text-rose-600 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </td>
        </tr>
      );
    });
  };

  return (
    <div className="space-y-5">
      {/* Pinned Section (if any) */}
      {pinnedJobs.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 px-1">
            <Pin className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-800">
              Pinned ({pinnedJobs.length})
            </h3>
          </div>
          <div className="bg-white rounded-2xl border border-rose-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-100 bg-rose-50/40 text-[10px] uppercase font-bold tracking-wider text-zinc-500">
                    <th className="py-2.5 pl-4 pr-1 w-8"></th>
                    <th className="py-2.5 px-4">Role & Company</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Platform</th>
                    <th className="py-2.5 px-3">Workplace</th>
                    <th className="py-2.5 px-3">Salary</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-xs">
                  {renderJobRows(pinnedJobs)}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Active Section */}
      {activeJobs.length > 0 && (
        <div className="space-y-2">
          {pinnedJobs.length > 0 && (
            <div className="flex items-center gap-1.5 px-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600">
                Applications ({activeJobs.length})
              </h3>
            </div>
          )}
          <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-100 bg-zinc-50/70 text-[10px] uppercase font-bold tracking-wider text-zinc-500">
                    <th className="py-3 pl-4 pr-1 w-8"></th>
                    <th className="py-3 px-4">Role & Company</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Platform</th>
                    <th className="py-3 px-3">Workplace</th>
                    <th className="py-3 px-3">Salary</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-xs">
                  {renderJobRows(activeJobs)}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Rejected Section at the bottom */}
      {rejectedJobs.length > 0 && (
        <div className="space-y-2 pt-2">
          <div className="flex items-center gap-1.5 px-1">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Rejected ({rejectedJobs.length})
            </h3>
          </div>
          <div className="bg-zinc-50/60 rounded-2xl border border-zinc-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200/70 bg-zinc-100/60 text-[10px] uppercase font-bold tracking-wider text-zinc-400">
                    <th className="py-2.5 pl-4 pr-1 w-8"></th>
                    <th className="py-2.5 px-4">Role & Company</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Platform</th>
                    <th className="py-2.5 px-3">Workplace</th>
                    <th className="py-2.5 px-3">Salary</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/60 text-xs">
                  {renderJobRows(rejectedJobs, true)}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
