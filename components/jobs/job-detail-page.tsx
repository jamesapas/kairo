"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
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
  CheckCircle2,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
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
import { JobModal } from "./job-modal";
import {
  updateJobAction,
  deleteJobAction,
  updateJobStatusAction,
  togglePinJobAction,
} from "@/lib/actions/jobs";

interface JobDetailPageProps {
  initialJob: JobApplication;
  userEmail?: string;
}

function MatchBadge({ match }: { match?: JobMatch }) {
  const m = match || "good";
  const config = MATCH_CONFIG[m] || MATCH_CONFIG.good;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold tracking-wide transition-colors ${config.bg} ${config.text} ${config.border}`}
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
        return <Laptop className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />;
      case "Hybrid":
        return <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />;
      case "On-site":
        return <Building className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />;
      default:
        return <Briefcase className="w-4 h-4 text-zinc-500 shrink-0" />;
    }
  };

  return (
    <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200 font-semibold text-xs">
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

export function JobDetailPage({ initialJob, userEmail }: JobDetailPageProps) {
  const router = useRouter();
  const [job, setJob] = useState<JobApplication>(initialJob);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedContactLink, setCopiedContactLink] = useState(false);
  const [copiedDesc, setCopiedDesc] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleStatusChange = async (newStatus: JobStatus) => {
    const prevJob = job;
    const now = new Date().toISOString();
    setJob({ ...job, status: newStatus, updatedAt: now });
    showToast(`Status updated to ${JOB_STATUS_CONFIG[newStatus]?.label || newStatus}`);

    const res = await updateJobStatusAction(job.id, newStatus);
    if (!res.success) {
      setJob(prevJob);
      showToast(res.error || "Failed to update status");
    }
  };

  const handleTogglePin = async () => {
    const nextPin = !job.isPinned;
    const prevJob = job;
    const now = new Date().toISOString();
    setJob({ ...job, isPinned: nextPin, updatedAt: now });
    showToast(nextPin ? "Pinned application" : "Unpinned application");

    const res = await togglePinJobAction(job.id, nextPin);
    if (!res.success) {
      setJob(prevJob);
      showToast(res.error || "Failed to update pin");
    }
  };

  const handleEditSave = async (
    jobData: Omit<JobApplication, "id" | "createdAt" | "updatedAt"> & { id?: string }
  ) => {
    const now = new Date().toISOString();
    const prevJob = job;
    const updated: JobApplication = {
      ...job,
      ...jobData,
      updatedAt: now,
    };
    setJob(updated);
    setIsModalOpen(false);
    showToast("Application updated");

    const res = await updateJobAction(job.id, jobData);
    if (!res.success) {
      setJob(prevJob);
      showToast(res.error || "Failed to update application");
    } else if (res.data) {
      setJob(res.data);
    }
  };

  const handleDelete = async () => {
    if (confirm(`Delete application for "${job.jobTitle}" at ${job.company}?`)) {
      showToast("Deleting application...");
      const res = await deleteJobAction(job.id);
      if (res.success) {
        router.push("/");
      } else {
        showToast(res.error || "Failed to delete application");
      }
    }
  };

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

  const currentStatusConfig = JOB_STATUS_CONFIG[job.status] || JOB_STATUS_CONFIG.applied;

  return (
    <div className="min-h-screen bg-zinc-50/90 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col relative selection:bg-zinc-900 dark:selection:bg-zinc-100 selection:text-white dark:selection:text-zinc-900">
      {/* Subtle Background Glow Accent */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-64 bg-gradient-to-b from-zinc-200/40 dark:from-zinc-800/20 via-zinc-100/20 dark:via-zinc-900/10 to-transparent pointer-events-none blur-3xl -z-10" />

      <Navbar userEmail={userEmail} />

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2.5 rounded-2xl shadow-xl border border-zinc-800 dark:border-zinc-200 flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Navigation Breadcrumb & Back button */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-semibold transition cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Applications</span>
          </Link>

          <div className="flex items-center gap-2">
            <MatchBadge match={job.match} />
          </div>
        </div>

        {/* Hero Application Header Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200/90 dark:border-zinc-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight">
                {job.jobTitle}
              </h1>
              {job.isPinned && (
                <span title="Pinned to top">
                  <Pin className="w-4 h-4 fill-rose-500 text-rose-500 shrink-0" />
                </span>
              )}
            </div>
            <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-zinc-400 dark:text-zinc-500 shrink-0" />
              <span>{job.company}</span>
            </p>
          </div>

          {/* Action Buttons Toolbar */}
          <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
            <button
              onClick={handleTogglePin}
              title={job.isPinned ? "Unpin application" : "Pin to top"}
              className={`p-2.5 rounded-xl transition cursor-pointer border ${
                job.isPinned
                  ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50 hover:bg-rose-100 dark:hover:bg-rose-950/70"
                  : "bg-white dark:bg-zinc-800 border-zinc-200/80 dark:border-zinc-700/80 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-700"
              }`}
            >
              <Pin className={`w-4 h-4 ${job.isPinned ? "fill-rose-500 text-rose-500" : ""}`} />
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition cursor-pointer text-xs font-semibold flex items-center gap-2 shadow-2xs"
            >
              <Edit3 className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
              <span>Edit</span>
            </button>

            <button
              onClick={handleDelete}
              className="p-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 text-zinc-500 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:border-rose-200 dark:border-rose-900/50 transition cursor-pointer shadow-2xs"
              title="Delete Application"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Application Stage / Status Bar */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 sm:p-6 border border-zinc-200/90 dark:border-zinc-800 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase font-bold tracking-wider text-zinc-400 dark:text-zinc-500">
                Application Stage
              </span>
              <span className={`inline-block w-2 h-2 rounded-full ${currentStatusConfig.dot}`} />
            </div>
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
              Current status is set to <span className="font-bold text-zinc-900 dark:text-zinc-100">{currentStatusConfig.label}</span>
            </p>
          </div>

          <div className="shrink-0 min-w-[200px]">
            <StatusDropdown
              value={job.status}
              onChange={handleStatusChange}
              size="md"
              className="w-full"
            />
          </div>
        </div>

        {/* Overview Metric Grid */}
        <div className="space-y-3">
          <h2 className="text-xs uppercase font-bold tracking-wider text-zinc-400 dark:text-zinc-500 px-1">
            Application Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date Applied */}
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 flex items-start gap-3.5 shadow-2xs">
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 dark:text-zinc-500 block mb-0.5">
                  Date Applied
                </span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200 text-xs block">{job.dateApplied}</span>
                <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">
                  {formatRelativeDate(job.dateApplied)}
                </span>
              </div>
            </div>

            {/* Platform */}
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 flex items-start gap-3.5 shadow-2xs">
              <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 shrink-0">
                <PlatformIcon platform={job.appliedOn} className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 dark:text-zinc-500 block mb-1">
                  Platform
                </span>
                <PlatformBadge platform={job.appliedOn} />
              </div>
            </div>

            {/* Workplace */}
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 flex items-start gap-3.5 shadow-2xs">
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 shrink-0">
                <Briefcase className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 dark:text-zinc-500 block mb-1">
                  Workplace Type
                </span>
                <WorkplaceBadge type={job.workplaceType} />
              </div>
            </div>

            {/* Salary */}
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 flex items-start gap-3.5 shadow-2xs">
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 shrink-0">
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

        {/* Links & Resources Section */}
        {(job.jobUrl || job.contactUrl) && (
          <div className="space-y-3">
            <h2 className="text-xs uppercase font-bold tracking-wider text-zinc-400 dark:text-zinc-500 px-1">
              Links & Resources
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Job Posting URL */}
              {job.jobUrl && (
                <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 flex items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 shrink-0">
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
                      className="px-2.5 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition"
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
                <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 flex items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 shrink-0">
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
                      className="px-2.5 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition"
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

        {/* Job Description Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200/90 dark:border-zinc-800 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <h2 className="text-xs uppercase font-bold tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>Job Description & Notes</span>
            </h2>
            {job.description && (
              <button
                onClick={handleCopyDescription}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer transition"
              >
                {copiedDesc ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>
            )}
          </div>

          {job.description ? (
            <div className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line font-normal selection:bg-zinc-200 dark:selection:bg-zinc-700">
              {job.description}
            </div>
          ) : (
            <div className="py-8 text-center space-y-2">
              <FileText className="w-8 h-8 text-zinc-300 dark:text-zinc-600 mx-auto" />
              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">No job description provided</p>
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                Click Edit to add notes, qualifications, or requirements.
              </p>
            </div>
          )}
        </div>

        {/* Footer Meta Details */}
        <div className="flex items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-500 px-2">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Tracked on {job.dateApplied}</span>
          </div>
          {job.updatedAt && (
            <span>Last updated {formatRelativeDate(job.updatedAt.split("T")[0])}</span>
          )}
        </div>
      </main>

      {/* Edit Modal */}
      <JobModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleEditSave}
        initialJob={job}
      />
    </div>
  );
}
