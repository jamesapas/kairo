"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import {
  Calendar,
  ExternalLink,
  Edit3,
  Trash2,
  Briefcase,
  Star,
  Pin,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreVertical,
  Copy,
  Check,
  Link2,
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
  isLoading?: boolean;
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

function JobRowActionMenu({
  job,
  onEditJob,
  onDeleteJob,
  onTogglePin,
}: {
  job: JobApplication;
  onEditJob: (job: JobApplication) => void;
  onDeleteJob: (id: string) => void;
  onTogglePin: (id: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const menuHeight = 200;
      const menuWidth = 145;
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUpward = spaceBelow < menuHeight && rect.top > menuHeight;

      setCoords({
        top: openUpward ? rect.top - menuHeight - 6 : rect.bottom + 6,
        left: Math.max(12, Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - 12)),
      });
    }

    const handleScroll = () => setIsOpen(false);
    const handleClickOutside = (e: MouseEvent) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node) &&
        menuRef.current &&
        !menuRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("scroll", handleScroll, true);
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (job.jobUrl) {
      navigator.clipboard.writeText(job.jobUrl);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setIsOpen(false);
      }, 1200);
    }
  };

  return (
    <div className="relative inline-block text-left" onClick={(e) => e.stopPropagation()}>
      <button
        ref={buttonRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        title="Actions"
        className={`p-1.5 rounded-lg transition cursor-pointer ${
          isOpen
            ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white"
            : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        }`}
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "fixed",
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              width: "145px",
              zIndex: 9999,
            }}
            className="rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 shadow-2xl py-1.5 animate-fade-in text-xs font-semibold select-none"
          >
            {/* Pin / Unpin */}
            <button
              type="button"
              onClick={() => {
                onTogglePin(job.id);
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/80 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white cursor-pointer transition"
            >
              <Pin
                className={`w-3.5 h-3.5 ${
                  job.isPinned ? "fill-rose-500 text-rose-500" : "text-zinc-400 dark:text-zinc-500"
                }`}
              />
              <span>{job.isPinned ? "Unpin" : "Pin"}</span>
            </button>

            {/* Edit */}
            <button
              type="button"
              onClick={() => {
                onEditJob(job);
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/80 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white cursor-pointer transition"
            >
              <Edit3 className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
              <span>Edit</span>
            </button>

            {/* Visit Job Post */}
            {job.jobUrl && (
              <a
                href={job.jobUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/80 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white cursor-pointer transition"
              >
                <ExternalLink className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
                <span>Open Link</span>
              </a>
            )}

            {/* Copy Job URL */}
            {job.jobUrl && (
              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/80 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white cursor-pointer transition"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            )}

            {/* Visit Contact Link */}
            {job.contactUrl && (
              <a
                href={job.contactUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/80 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white cursor-pointer transition"
              >
                <Link2 className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
                <span>Contact Link</span>
              </a>
            )}

            {/* Divider */}
            <div className="border-t border-zinc-100 dark:border-zinc-800 my-1" />

            {/* Delete */}
            <button
              type="button"
              onClick={() => {
                onDeleteJob(job.id);
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer transition"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
              <span>Delete</span>
            </button>
          </div>,
          document.body
        )}
    </div>
  );
}

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  if (current <= 3) {
    return [1, 2, 3, 4, "...", total];
  }
  if (current >= total - 2) {
    return [1, "...", total - 3, total - 2, total - 1, total];
  }
  return [1, "...", current - 1, current, current + 1, "...", total];
}

export function JobTable({
  jobs,
  isLoading = false,
  onSelectJob,
  onEditJob,
  onDeleteJob,
  onStatusChange,
  onTogglePin,
  onAddNew,
}: JobTableProps) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Group jobs into sections: Pinned, Active, Rejected
  const pinnedJobs = useMemo(
    () => jobs.filter((j) => j.isPinned && j.status !== "rejected"),
    [jobs]
  );
  const activeJobs = useMemo(
    () => jobs.filter((j) => !j.isPinned && j.status !== "rejected"),
    [jobs]
  );
  const rejectedJobs = useMemo(
    () => jobs.filter((j) => j.status === "rejected"),
    [jobs]
  );

  const totalActive = activeJobs.length;
  const totalPages = Math.max(1, Math.ceil(totalActive / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  // Reset or clamp page if list shrinks
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const startIndex = (safeCurrentPage - 1) * pageSize;
  const paginatedActiveJobs = useMemo(() => {
    return activeJobs.slice(startIndex, startIndex + pageSize);
  }, [activeJobs, startIndex, pageSize]);

  const endIndex = Math.min(startIndex + paginatedActiveJobs.length, totalActive);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-800/80 text-[10px] uppercase font-bold tracking-wider text-zinc-400 dark:text-zinc-500">
                <th className="py-3 pl-4 pr-1 w-8 text-center">Match</th>
                <th className="py-3 px-4">Role & Company</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Platform</th>
                <th className="py-3 px-3">Workplace</th>
                <th className="py-3 px-3">Salary</th>
                <th className="py-3 px-3">Applied</th>
                <th className="py-3 px-4 w-10 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <tr key={i} className="animate-pulse">
                  {/* Match */}
                  <td className="py-3.5 pl-4 pr-1 text-center align-middle">
                    <Star className="w-3.5 h-3.5 text-zinc-200 dark:text-zinc-700 mx-auto" />
                  </td>

                  {/* Role & Company */}
                  <td className="py-3.5 px-4">
                    <div className="min-w-0 space-y-1.5">
                      <div className="w-44 h-3.5 rounded bg-zinc-200 dark:bg-zinc-800" />
                      <div className="w-28 h-2.5 rounded bg-zinc-100 dark:bg-zinc-800/70" />
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-3">
                    <div className="w-24 h-7 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60" />
                  </td>

                  {/* Platform */}
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3.5 h-3.5 rounded-full bg-zinc-200 dark:bg-zinc-800 shrink-0" />
                      <div className="w-16 h-3 rounded bg-zinc-100 dark:bg-zinc-800" />
                    </div>
                  </td>

                  {/* Workplace */}
                  <td className="py-3.5 px-3">
                    <div className="w-14 h-5 rounded-md bg-zinc-100/70 dark:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-700" />
                  </td>

                  {/* Salary */}
                  <td className="py-3.5 px-3">
                    <div className="w-20 h-3.5 rounded bg-zinc-100 dark:bg-zinc-800" />
                  </td>

                  {/* Applied */}
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3.5 h-3.5 rounded bg-zinc-200 dark:bg-zinc-800" />
                      <div className="w-14 h-3 rounded bg-zinc-100 dark:bg-zinc-800" />
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="w-6 h-6 ml-auto rounded-lg bg-zinc-100 dark:bg-zinc-800" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer Skeleton */}
        <div className="bg-white dark:bg-zinc-900 px-4 py-2.5 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-32 h-3.5 rounded bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-16 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
            <div className="w-16 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 p-12 text-center flex flex-col items-center justify-center space-y-3 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 flex items-center justify-center text-zinc-400 dark:text-zinc-500">
          <Briefcase className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">No job applications tracked yet</h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm">
          Keep your applications organized. Add your first role to start tracking status, dates, and response streaks.
        </p>
        <button
          onClick={onAddNew}
          className="mt-2 px-5 py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold text-xs hover:bg-zinc-800 dark:hover:bg-white active:scale-[0.98] transition cursor-pointer shadow-sm"
        >
          + Add Application
        </button>
      </div>
    );
  }

  const renderJobRows = (list: JobApplication[], isMuted = false) => {
    return list.map((job) => {
      return (
        <tr
          key={job.id}
          onClick={() => onSelectJob(job)}
          onMouseEnter={() => router.prefetch(`/jobs/${job.id}`)}
          className={`hover:bg-zinc-50/90 dark:hover:bg-zinc-800/60 cursor-pointer group relative ${
            isMuted ? "opacity-75 hover:opacity-100 bg-zinc-50/20 dark:bg-zinc-800/20" : ""
          }`}
        >
          {/* Match Icon - Direct without box */}
          <td className="py-3.5 pl-4 pr-1 text-center align-middle">
            <MatchIcon match={job.match} />
          </td>

          {/* Role & Company */}
          <td className="py-3.5 px-4">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                  {job.jobTitle}
                </p>
                {job.isPinned && (
                  <span title="Pinned">
                    <Pin className="w-3 h-3 fill-rose-500 text-rose-500 shrink-0" />
                  </span>
                )}
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 text-[11px] font-medium truncate mt-0.5">
                {job.company}
              </p>
            </div>
          </td>

          {/* Status Dropdown */}
          <td className="py-3.5 px-3" onClick={(e) => e.stopPropagation()}>
            <StatusDropdown
              value={job.status}
              onChange={(newStatus) => onStatusChange(job.id, newStatus)}
              size="sm"
            />
          </td>

          {/* Platform */}
          <td className="py-3.5 px-3 text-zinc-600 dark:text-zinc-400 font-medium">
            <div className="flex items-center gap-1.5 text-xs">
              <PlatformIcon platform={job.appliedOn} className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{job.appliedOn}</span>
            </div>
          </td>

          {/* Workplace */}
          <td className="py-3.5 px-3 text-zinc-600 dark:text-zinc-400 font-medium text-xs">
            <span className="px-2 py-0.5 rounded-md bg-zinc-100/70 dark:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-700 text-[11px]">
              {job.workplaceType}
            </span>
          </td>

          {/* Compensation */}
          <td className="py-3.5 px-3 text-zinc-700 dark:text-zinc-300 font-medium text-xs">
            <span className="truncate block max-w-[130px] text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              {formatSalaryDisplay(job.salary) || "—"}
            </span>
          </td>

          {/* Date Applied */}
          <td className="py-3.5 px-3 text-zinc-500 dark:text-zinc-400 font-medium text-xs">
            <div className="flex items-center gap-1.5" title={job.dateApplied}>
              <Calendar className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 shrink-0" />
              <span>{formatRelativeDate(job.dateApplied)}</span>
            </div>
          </td>

          {/* Actions - 3-dots Menu */}
          <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-end">
              <JobRowActionMenu
                job={job}
                onEditJob={onEditJob}
                onDeleteJob={onDeleteJob}
                onTogglePin={onTogglePin}
              />
            </div>
          </td>
        </tr>
      );
    });
  };

  return (
    <div className="space-y-6">
      {/* Pinned Section (if any) */}
      {pinnedJobs.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <div className="p-1 rounded-md bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
              <Pin className="w-3 h-3 fill-rose-600 text-rose-600" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-900 dark:text-rose-400">
              Pinned ({pinnedJobs.length})
            </h3>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-rose-200/90 dark:border-rose-900/50 shadow-[0_2px_8px_rgba(244,63,94,0.06)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-rose-100 dark:border-rose-900/50 bg-rose-50/40 dark:bg-rose-950/20 text-[10px] uppercase font-bold tracking-wider text-zinc-500 dark:text-zinc-400">
                    <th className="py-3 pl-4 pr-1 w-8 text-center">Match</th>
                    <th className="py-3 px-4">Role & Company</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Platform</th>
                    <th className="py-3 px-3">Workplace</th>
                    <th className="py-3 px-3">Salary</th>
                    <th className="py-3 px-3">Applied</th>
                    <th className="py-3 px-4 w-10 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
                  {renderJobRows(pinnedJobs)}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Main Applications Section with Clean Table Footer */}
      <div className="space-y-2">
        {pinnedJobs.length > 0 && activeJobs.length > 0 && (
          <div className="flex items-center gap-2 px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              Applications ({activeJobs.length})
            </h3>
          </div>
        )}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-800/80 text-[10px] uppercase font-bold tracking-wider text-zinc-400 dark:text-zinc-500">
                  <th className="py-3 pl-4 pr-1 w-8 text-center">Match</th>
                  <th className="py-3 px-4">Role & Company</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Platform</th>
                  <th className="py-3 px-3">Workplace</th>
                  <th className="py-3 px-3">Salary</th>
                  <th className="py-3 px-3">Applied</th>
                  <th className="py-3 px-4 w-10 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
                {activeJobs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-zinc-400 dark:text-zinc-500 text-xs">
                      No matching applications found.
                    </td>
                  </tr>
                ) : (
                  renderJobRows(paginatedActiveJobs)
                )}
              </tbody>
            </table>
          </div>

          {/* Lowkey Minimalist Table Footer */}
          <div className="bg-white dark:bg-zinc-900 px-4 py-2.5 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            {/* Left: Summary & Rows Selector */}
            <div className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400 font-medium">
              <span>
                Showing <span className="text-zinc-900 dark:text-zinc-100 font-semibold">{totalActive === 0 ? 0 : startIndex + 1}–{endIndex}</span> of{" "}
                <span className="text-zinc-900 dark:text-zinc-100 font-semibold">{totalActive}</span>
              </span>

              <div className="flex items-center gap-1.5 pl-3 border-l border-zinc-200 dark:border-zinc-700">
                <span className="text-[11px] text-zinc-400 dark:text-zinc-500">Show:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="h-8 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100/80 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-lg px-2 text-xs font-semibold focus:outline-none transition cursor-pointer"
                >
                  <option value={5}>5 / page</option>
                  <option value={10}>10 / page</option>
                  <option value={25}>25 / page</option>
                  <option value={50}>50 / page</option>
                </select>
              </div>
            </div>

            {/* Right: Lowkey Consistent Navigation Controls */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              {/* Page Info Badge with Matching h-8 Height */}
              <div className="h-8 px-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700 text-xs font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-1 shrink-0">
                <span>Page</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">{safeCurrentPage}</span>
                <span className="text-zinc-400 dark:text-zinc-600">/</span>
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">{totalPages}</span>
              </div>

              {/* Navigation Capsule with Matching h-8 Height */}
              <div className="h-8 px-1 rounded-lg bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700 flex items-center gap-0.5 shrink-0">
                {/* Jump to First Page */}
                <button
                  type="button"
                  onClick={() => setCurrentPage(1)}
                  disabled={safeCurrentPage === 1}
                  className="h-6 w-6 rounded-md flex items-center justify-center hover:bg-white dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-100 disabled:opacity-25 disabled:cursor-not-allowed disabled:hover:bg-transparent text-zinc-500 dark:text-zinc-400 transition cursor-pointer"
                  title="First page"
                >
                  <ChevronsLeft className="w-3.5 h-3.5" />
                </button>

                {/* Previous Page */}
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safeCurrentPage === 1}
                  className="h-6 px-1.5 rounded-md flex items-center gap-0.5 text-xs font-medium hover:bg-white dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-100 disabled:opacity-25 disabled:cursor-not-allowed disabled:hover:bg-transparent text-zinc-600 dark:text-zinc-300 transition cursor-pointer"
                  title="Previous page"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[11px]">Prev</span>
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-0.5 px-0.5">
                  {getPageNumbers(safeCurrentPage, totalPages).map((p, idx) => {
                    if (p === "...") {
                      return (
                        <span
                          key={`ellipsis-${idx}`}
                          className="px-1 text-zinc-400 dark:text-zinc-600 font-mono text-xs select-none"
                        >
                          ...
                        </span>
                      );
                    }
                    const isCurrent = p === safeCurrentPage;
                    return (
                      <button
                        type="button"
                        key={p}
                        onClick={() => setCurrentPage(p as number)}
                        className={`min-w-[24px] h-6 px-1.5 rounded-md text-xs font-semibold transition cursor-pointer flex items-center justify-center select-none ${
                          isCurrent
                            ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold"
                            : "text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-100"
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>

                {/* Next Page */}
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safeCurrentPage === totalPages}
                  className="h-6 px-1.5 rounded-md flex items-center gap-0.5 text-xs font-medium hover:bg-white dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-100 disabled:opacity-25 disabled:cursor-not-allowed disabled:hover:bg-transparent text-zinc-600 dark:text-zinc-300 transition cursor-pointer"
                  title="Next page"
                >
                  <span className="hidden sm:inline text-[11px]">Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                {/* Jump to Last Page */}
                <button
                  type="button"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={safeCurrentPage === totalPages}
                  className="h-6 w-6 rounded-md flex items-center justify-center hover:bg-white dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-100 disabled:opacity-25 disabled:cursor-not-allowed disabled:hover:bg-transparent text-zinc-500 dark:text-zinc-400 transition cursor-pointer"
                  title="Last page"
                >
                  <ChevronsRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rejected Section at the bottom */}
      {rejectedJobs.length > 0 && (
        <div className="space-y-2 pt-2">
          <div className="flex items-center gap-2 px-1">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Archived / Rejected ({rejectedJobs.length})
            </h3>
          </div>
          <div className="bg-zinc-50/60 rounded-2xl border border-zinc-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200/70 bg-zinc-100/60 text-[10px] uppercase font-bold tracking-wider text-zinc-400">
                    <th className="py-2.5 pl-4 pr-1 w-8 text-center">Match</th>
                    <th className="py-2.5 px-4">Role & Company</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Platform</th>
                    <th className="py-2.5 px-3">Workplace</th>
                    <th className="py-2.5 px-3">Salary</th>
                    <th className="py-2.5 px-3">Applied</th>
                    <th className="py-2.5 px-4 w-10 text-right"></th>
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
