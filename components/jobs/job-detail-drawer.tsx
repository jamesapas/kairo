"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Building2,
  Calendar,
  DollarSign,
  Briefcase,
  Edit3,
  Trash2,
  Copy,
  Check,
  Globe,
  Star,
  Pin,
  Laptop,
  Building,
  FileText,
  Clock,
  ArrowUpRight,
  Link2,
} from "lucide-react";
import {
  JobApplication,
  JobStatus,
  JobMatch,
  WorkplaceType,
  JOB_STATUS_CONFIG,
  MATCH_CONFIG,
  formatRelativeDate,
  formatSalaryDisplay,
} from "@/types/job";
import { StatusDropdown } from "./status-dropdown";
import { PlatformIcon, PlatformBadge } from "./platform-badge";

interface JobDetailDrawerProps {
  job: JobApplication | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (job: JobApplication) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, newStatus: JobStatus) => void;
  onTogglePin: (id: string) => void;
}

function MatchBadge({ match }: { match?: JobMatch }) {
  const m = match || "good";
  const config = MATCH_CONFIG[m] || MATCH_CONFIG.good;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold tracking-wide transition-colors ${config.bg} ${config.text} ${config.border}`}
    >
      {m === "good" && <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />}
      {m === "mid" && <Star className="w-3.5 h-3.5 text-amber-500 stroke-[2.2] shrink-0" />}
      {m === "far" && <Star className="w-3.5 h-3.5 text-zinc-400 stroke-[2] shrink-0" />}
      <span>{config.label}</span>
    </div>
  );
}

function WorkplaceBadge({ type }: { type: WorkplaceType }) {
  const getIcon = () => {
    switch (type) {
      case "Remote":
        return <Laptop className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />;
      case "Hybrid":
        return <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />;
      case "On-site":
        return <Building className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />;
      default:
        return <Briefcase className="w-3.5 h-3.5 text-zinc-500 shrink-0" />;
    }
  };

  return (
    <div className="flex items-center gap-1.5 text-zinc-800 dark:text-zinc-200 font-semibold text-xs">
      {getIcon()}
      <span>{type}</span>
    </div>
  );
}

function getDomain(url?: string): string {
  if (!url) return "";
  try {
    const formatted = url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;
    const parsed = new URL(formatted);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function JobDetailDrawer({
  job,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onStatusChange,
  onTogglePin,
}: JobDetailDrawerProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedContactLink, setCopiedContactLink] = useState(false);
  const [copiedDesc, setCopiedDesc] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !job) return null;

  const currentStatusConfig = JOB_STATUS_CONFIG[job.status] || JOB_STATUS_CONFIG.applied;
  const companyInitial = job.company ? job.company.trim().charAt(0).toUpperCase() : "J";

  const handleCopyLink = () => {
    if (job.jobUrl) {
      navigator.clipboard.writeText(job.jobUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleCopyContactLink = () => {
    if (job.contactUrl) {
      navigator.clipboard.writeText(job.contactUrl);
      setCopiedContactLink(true);
      setTimeout(() => setCopiedContactLink(false), 2000);
    }
  };

  const handleCopyDescription = () => {
    if (job.description) {
      navigator.clipboard.writeText(job.description);
      setCopiedDesc(true);
      setTimeout(() => setCopiedDesc(false), 2000);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 overflow-hidden bg-zinc-950/60 backdrop-blur-xs flex justify-end animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-white dark:bg-zinc-900 h-full shadow-2xl flex flex-col justify-between border-l border-zinc-200/90 dark:border-zinc-800 animate-slide-in overflow-hidden"
      >
        {/* Header Bar */}
        <div className="px-6 py-5 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-zinc-900/90 backdrop-blur-md flex flex-col gap-4">
          {/* Top Row: Badges & Controls */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <MatchBadge match={job.match} />
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => onTogglePin(job.id)}
                title={job.isPinned ? "Unpin application" : "Pin to top"}
                className={`p-2 rounded-xl transition cursor-pointer border ${
                  job.isPinned
                    ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50 hover:bg-rose-100 dark:hover:bg-rose-950/70"
                    : "bg-white dark:bg-zinc-800 border-zinc-200/80 dark:border-zinc-700/80 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-700"
                }`}
              >
                <Pin className={`w-3.5 h-3.5 ${job.isPinned ? "fill-rose-500 text-rose-500" : ""}`} />
              </button>

              <button
                onClick={() => onEdit(job)}
                title="Edit Application"
                className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onDelete(job.id)}
                title="Delete Application"
                className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 text-zinc-500 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:border-rose-200 dark:border-rose-900/50 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={onClose}
                title="Close drawer"
                className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition cursor-pointer ml-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Job Title & Company Header */}
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center font-black text-sm shrink-0 shadow-sm">
              {companyInitial}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight">
                {job.jobTitle}
              </h2>
              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 mt-0.5">
                <Building2 className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 shrink-0" />
                <span className="truncate">{job.company}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 text-xs">
          {/* Status Pipeline & Stage Card */}
          <div className="p-4 rounded-2xl bg-zinc-50/90 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 dark:text-zinc-500">
                  Application Stage
                </span>
                <span className={`inline-block w-1.5 h-1.5 rounded-full ${currentStatusConfig.dot}`} />
              </div>
              <p className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                Current status is set to <span className="font-bold text-zinc-900 dark:text-zinc-100">{currentStatusConfig.label}</span>
              </p>
            </div>

            <div className="shrink-0 min-w-[180px]">
              <StatusDropdown
                value={job.status}
                onChange={(newStatus) => onStatusChange(job.id, newStatus)}
                size="md"
                className="w-full"
              />
            </div>
          </div>

          {/* Overview Key Metric Grid (2x2) */}
          <div>
            <h3 className="text-[11px] uppercase font-bold tracking-wider text-zinc-400 dark:text-zinc-500 mb-2.5">
              Overview & Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Date Applied */}
              <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 flex items-start gap-3 shadow-2xs">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 dark:text-zinc-500 block mb-0.5">
                    Date Applied
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-zinc-800 dark:text-zinc-200 text-xs">{job.dateApplied}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300">
                      {formatRelativeDate(job.dateApplied)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Platform */}
              <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 flex items-start gap-3 shadow-2xs">
                <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 shrink-0">
                  <PlatformIcon platform={job.appliedOn} className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 dark:text-zinc-500 block mb-0.5">
                    Platform
                  </span>
                  <div className="pt-0.5">
                    <PlatformBadge platform={job.appliedOn} />
                  </div>
                </div>
              </div>

              {/* Workplace */}
              <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 flex items-start gap-3 shadow-2xs">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 shrink-0">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 dark:text-zinc-500 block mb-0.5">
                    Workplace Type
                  </span>
                  <div className="pt-0.5">
                    <WorkplaceBadge type={job.workplaceType} />
                  </div>
                </div>
              </div>

              {/* Salary */}
              <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 flex items-start gap-3 shadow-2xs">
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 shrink-0">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 dark:text-zinc-500 block mb-0.5">
                    Compensation
                  </span>
                  <p className="font-bold text-zinc-800 dark:text-zinc-200 text-xs truncate">
                    {formatSalaryDisplay(job.salary) || (
                      <span className="text-zinc-400 dark:text-zinc-500 font-normal italic">Not specified</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* External Links & Resources */}
          {(job.jobUrl || job.contactUrl) && (
            <div>
              <h3 className="text-[11px] uppercase font-bold tracking-wider text-zinc-400 dark:text-zinc-500 mb-2.5">
                Links & Resources
              </h3>
              <div className="space-y-2.5">
                {/* Job Posting URL */}
                {job.jobUrl && (
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 flex items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-700/60 text-zinc-600 dark:text-zinc-300 shrink-0">
                        <Globe className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 dark:text-zinc-500 block">
                          Job Posting Link
                        </span>
                        <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate" title={job.jobUrl}>
                          {getDomain(job.jobUrl)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={handleCopyLink}
                        title="Copy URL"
                        className="px-2.5 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-700/70 border border-zinc-200 dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-200 font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition"
                      >
                        {copiedLink ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-zinc-400" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>

                      <a
                        href={job.jobUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white font-semibold text-xs flex items-center gap-1 cursor-pointer transition shadow-2xs"
                      >
                        <span>Visit</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                )}

                {/* Contact / Outreach URL */}
                {job.contactUrl && (
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 flex items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-700/60 text-zinc-600 dark:text-zinc-300 shrink-0">
                        <Link2 className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 dark:text-zinc-500 block">
                          Contact / Outreach
                        </span>
                        <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate" title={job.contactUrl}>
                          {getDomain(job.contactUrl)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={handleCopyContactLink}
                        title="Copy Contact Link"
                        className="px-2.5 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-700/70 border border-zinc-200 dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-200 font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition"
                      >
                        {copiedContactLink ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-zinc-400" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>

                      <a
                        href={job.contactUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white font-semibold text-xs flex items-center gap-1 cursor-pointer transition shadow-2xs"
                      >
                        <span>Visit</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Job Description */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-[11px] uppercase font-bold tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span>Job Description</span>
              </h3>
              {job.description && (
                <button
                  onClick={handleCopyDescription}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer transition"
                >
                  {copiedDesc ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-zinc-400" />
                      <span>Copy Text</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {job.description ? (
              <div className="p-4 rounded-2xl bg-zinc-50/90 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800/90 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line font-normal selection:bg-zinc-200 dark:selection:bg-zinc-700">
                {job.description}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-zinc-50/50 dark:bg-zinc-800/20 border border-dashed border-zinc-200 dark:border-zinc-800 text-center space-y-1.5">
                <FileText className="w-6 h-6 text-zinc-300 dark:text-zinc-600 mx-auto" />
                <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">No job description provided</p>
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                  Click Edit to add notes, qualifications, or requirements.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="px-6 py-4 border-t border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-zinc-900/90 backdrop-blur-md flex items-center justify-between gap-3 text-[11px] text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-1.5 truncate">
            <Clock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span className="truncate">
              Tracked on {job.dateApplied} ({formatRelativeDate(job.dateApplied)})
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onEdit(job)}
              className="px-4 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 font-semibold transition cursor-pointer text-xs shadow-2xs flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5 text-zinc-400" />
              <span>Edit</span>
            </button>

            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold hover:bg-zinc-800 dark:hover:bg-white transition cursor-pointer text-xs shadow-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
