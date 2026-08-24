"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
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
  ChevronRight,
  Share2,
  ListChecks,
  CheckCircle,
  Circle,
  HelpCircle,
  XCircle,
  AlertCircle,
  Send,
  UserCheck,
  Award,
} from "lucide-react";
import Loading from "@/app/(workspace)/jobs/[id]/loading";
import {
  JobApplication,
  JobApplicationRow,
  JobStatus,
  JobMatch,
  WorkplaceType,
  JOB_STATUS_CONFIG,
  MATCH_CONFIG,
  formatRelativeDate,
  formatSalaryDisplay,
  mapRowToJob,
} from "@/types/job";
import { StatusDropdown } from "./status-dropdown";
import { PlatformIcon, PlatformBadge } from "./platform-badge";
import { JobModal } from "./job-modal";
import { AIMatchPanel } from "./ai-match-panel";
import {
  updateJobAction,
  deleteJobAction,
  updateJobStatusAction,
  togglePinJobAction,
} from "@/lib/actions/jobs";

interface JobDetailPageProps {
  jobId: string;
}

const PRIMARY_STAGES: { status: JobStatus; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { status: "applied", label: "Applied", icon: Send },
  { status: "interviewing", label: "Interviewing", icon: UserCheck },
  { status: "offer", label: "Offer", icon: Award },
];

const RESOLUTION_STAGES: { status: JobStatus; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { status: "declined", label: "Declined", icon: AlertCircle },
  { status: "rejected", label: "Rejected", icon: XCircle },
  { status: "withdrawn", label: "Withdrawn", icon: HelpCircle },
  { status: "no_response", label: "No Response", icon: Clock },
];

const DEFAULT_CHECKLIST_ITEMS = [
  "Customized resume & portfolio submitted",
  "Researched company culture & recent product updates",
  "Prepared questions for hiring team & interviewers",
  "Followed up with recruiter / sent thank-you note",
];

function MatchBadge({ match }: { match?: JobMatch }) {
  const m = match || "good";
  const config = MATCH_CONFIG[m] || MATCH_CONFIG.good;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold tracking-wide transition-colors ${config.bg} ${config.text} ${config.border}`}
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

export function JobDetailPage({ jobId }: JobDetailPageProps) {
  const router = useRouter();
  const [job, setJob] = useState<JobApplication | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const supabase = createClient();

    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) setUserEmail(user.email);

      const { data, error } = await supabase
        .from("job_applications")
        .select("*")
        .eq("id", jobId)
        .single();

      if (error || !data) {
        setLoadError("Application not found");
        setIsLoading(false);
        return;
      }

      setJob(mapRowToJob(data as JobApplicationRow));
      setIsLoading(false);
    }

    fetchData();
  }, [jobId]);

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedContactLink, setCopiedContactLink] = useState(false);
  const [copiedDesc, setCopiedDesc] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Local checklist state for interview prep
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!job) return;
    try {
      const saved = localStorage.getItem(`kairo-checklist-${job.id}`);
      if (saved) {
        setChecklist(JSON.parse(saved));
      }
    } catch {
      // fallback
    }
  }, [job?.id]);

  const toggleChecklistItem = (item: string) => {
    if (!job) return;
    setChecklist((prev) => {
      const next = { ...prev, [item]: !prev[item] };
      try {
        localStorage.setItem(`kairo-checklist-${job.id}`, JSON.stringify(next));
      } catch {
        // fallback
      }
      return next;
    });
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleStatusChange = useCallback(async (newStatus: JobStatus) => {
    if (!job) return;
    const prevJob = job;
    const now = new Date().toISOString();
    setJob((curr) => curr ? { ...curr, status: newStatus, updatedAt: now } : curr);
    showToast(`Stage updated to ${JOB_STATUS_CONFIG[newStatus]?.label || newStatus}`);

    const res = await updateJobStatusAction(job.id, newStatus);
    if (!res.success) {
      setJob(prevJob);
      showToast(res.error || "Failed to update status");
    }
  }, [job]);

  const handleTogglePin = useCallback(async () => {
    if (!job) return;
    const nextPin = !job.isPinned;
    const prevJob = job;
    const now = new Date().toISOString();
    setJob((curr) => curr ? { ...curr, isPinned: nextPin, updatedAt: now } : curr);
    showToast(nextPin ? "Pinned to top" : "Unpinned");

    const res = await togglePinJobAction(job.id, nextPin);
    if (!res.success) {
      setJob(prevJob);
      showToast(res.error || "Failed to update pin");
    }
  }, [job]);

  const handleEditSave = async (
    jobData: Omit<JobApplication, "id" | "createdAt" | "updatedAt"> & { id?: string }
  ) => {
    if (!job) return;
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
    if (!job) return;
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
    if (!job) return;
    if (job.jobUrl) {
      navigator.clipboard.writeText(job.jobUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleCopyContactLink = () => {
    if (!job) return;
    if (job.contactUrl) {
      navigator.clipboard.writeText(job.contactUrl);
      setCopiedContactLink(true);
      setTimeout(() => setCopiedContactLink(false), 2000);
    }
  };

  const handleCopyDescription = () => {
    if (!job) return;
    if (job.description) {
      navigator.clipboard.writeText(job.description);
      setCopiedDesc(true);
      setTimeout(() => setCopiedDesc(false), 2000);
    }
  };

  const handleCopySummary = () => {
    if (!job) return;
    const summary = `${job.company} — ${job.jobTitle}\nStatus: ${JOB_STATUS_CONFIG[job.status]?.label}\nWorkplace: ${job.workplaceType}\nApplied: ${job.dateApplied}\nPlatform: ${job.appliedOn}${job.salary ? `\nCompensation: ${job.salary}` : ""}${job.jobUrl ? `\nLink: ${job.jobUrl}` : ""}`;
    navigator.clipboard.writeText(summary);
    setCopiedSummary(true);
    showToast("Application summary copied to clipboard");
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  // Keyboard shortcut support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA" ||
        isModalOpen
      ) {
        return;
      }

      if (e.key === "Escape") {
        router.push("/");
      } else if (e.key.toLowerCase() === "e" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setIsModalOpen(true);
      } else if (e.key.toLowerCase() === "p" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        handleTogglePin();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router, isModalOpen, handleTogglePin]);

  if (isLoading) {
    return <Loading />;
  }

  if (loadError || !job) {
    return (
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-zinc-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Application not found</h2>
            <p className="text-sm text-zinc-500 mt-1">This application may have been deleted or doesn't exist.</p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  const currentStatusConfig = JOB_STATUS_CONFIG[job.status] || JOB_STATUS_CONFIG.applied;
  const isTerminalStatus = RESOLUTION_STAGES.some((s) => s.status === job.status);

  // Stepper progress index
  const primaryIndex = PRIMARY_STAGES.findIndex((s) => s.status === job.status);
  const currentStep = isTerminalStatus ? (job.status === "rejected" || job.status === "declined" ? 1 : 0) : primaryIndex;

  return (
    <>
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2.5 rounded-2xl shadow-xl border border-zinc-800 dark:border-zinc-200 flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Top Breadcrumb & Executive Toolbar Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-zinc-200/60 dark:border-zinc-800/60">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            <Link
              href="/"
              className="hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-1.5 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Applications</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-700" />
            <span className="font-semibold text-zinc-700 dark:text-zinc-300 truncate max-w-[140px]">
              {job.company}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-700" />
            <span className="text-zinc-900 dark:text-zinc-100 font-semibold truncate max-w-[200px]">
              {job.jobTitle}
            </span>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySummary}
              title="Copy formatted summary"
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-semibold transition cursor-pointer shadow-2xs flex items-center gap-1.5"
            >
              {copiedSummary ? (
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Share2 className="w-3.5 h-3.5" />
              )}
              <span>{copiedSummary ? "Copied" : "Share"}</span>
            </button>

            <button
              onClick={handleTogglePin}
              title={job.isPinned ? "Unpin application (P)" : "Pin to top (P)"}
              className={`p-2 rounded-xl transition cursor-pointer border ${
                job.isPinned
                  ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50 hover:bg-rose-100 dark:hover:bg-rose-950/70"
                  : "bg-white dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800 shadow-2xs"
              }`}
            >
              <Pin className={`w-3.5 h-3.5 ${job.isPinned ? "fill-rose-500 text-rose-500" : ""}`} />
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition cursor-pointer text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
            >
              <Edit3 className="w-3.5 h-3.5 text-zinc-400" />
              <span>Edit</span>
              <kbd className="hidden sm:inline-block px-1 py-0.2 bg-zinc-100 dark:bg-zinc-800 text-[10px] text-zinc-400 rounded border border-zinc-200 dark:border-zinc-700">
                E
              </kbd>
            </button>

            <button
              onClick={handleDelete}
              className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:border-rose-200 dark:border-rose-900/50 transition cursor-pointer shadow-2xs"
              title="Delete Application"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Interactive Hiring Pipeline Stepper */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 sm:p-5 border border-zinc-200/90 dark:border-zinc-800 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase font-bold tracking-wider text-zinc-400 dark:text-zinc-500">
                Pipeline Stage
              </span>
              <span className={`inline-block w-2 h-2 rounded-full ${currentStatusConfig.dot}`} />
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                {currentStatusConfig.label}
              </span>
            </div>

            {/* Quick Resolution Tags for Terminal Stages */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {RESOLUTION_STAGES.map((res) => {
                const isSelected = job.status === res.status;
                const Icon = res.icon;
                return (
                  <button
                    key={res.status}
                    onClick={() => handleStatusChange(res.status)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 border ${
                      isSelected
                        ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 shadow-2xs"
                        : "bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 dark:text-zinc-400 border-zinc-200/70 dark:border-zinc-700/60 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{res.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Primary Pipeline Steps */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-1">
            {PRIMARY_STAGES.map((stage, idx) => {
              const isActive = job.status === stage.status;
              const isPast = primaryIndex > idx && !isTerminalStatus;
              const Icon = stage.icon;

              return (
                <button
                  key={stage.status}
                  onClick={() => handleStatusChange(stage.status)}
                  className={`group relative p-3 rounded-xl border text-left transition cursor-pointer flex items-center gap-3 ${
                    isActive
                      ? "bg-blue-50/60 dark:bg-blue-950/30 border-blue-300 dark:border-blue-800 text-blue-950 dark:text-blue-200 shadow-2xs"
                      : isPast
                      ? "bg-zinc-50/70 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300"
                      : "bg-white dark:bg-zinc-900/60 border-zinc-200/80 dark:border-zinc-800/80 text-zinc-400 dark:text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-700"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition ${
                      isActive
                        ? "bg-blue-600 text-white shadow-sm"
                        : isPast
                        ? "bg-emerald-600 text-white"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300"
                    }`}
                  >
                    {isPast ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Icon className="w-3.5 h-3.5" />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 dark:text-zinc-500">
                      Step {idx + 1}
                    </div>
                    <div
                      className={`text-xs font-bold truncate ${
                        isActive
                          ? "text-blue-900 dark:text-blue-100"
                          : isPast
                          ? "text-zinc-800 dark:text-zinc-200"
                          : "text-zinc-600 dark:text-zinc-400"
                      }`}
                    >
                      {stage.label}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Two-Column Executive Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT MAIN COLUMN: Overview, Scope & Notes (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Header Hero Title Card */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-7 border border-zinc-200/90 dark:border-zinc-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <MatchBadge match={job.match} />
                    <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500">•</span>
                    <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      Applied on {job.dateApplied} ({formatRelativeDate(job.dateApplied)})
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight pt-1">
                    {job.jobTitle}
                  </h1>

                  <div className="flex items-center gap-2 text-sm font-semibold text-zinc-600 dark:text-zinc-300 pt-0.5">
                    <Building2 className="w-4 h-4 text-zinc-400 shrink-0" />
                    <span>{job.company}</span>
                  </div>
                </div>
              </div>

              {/* High-Level Overview Tags in Main View */}
              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
                  <PlatformIcon platform={job.appliedOn} className="w-4 h-4 text-zinc-400" />
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">{job.appliedOn}</span>
                </div>

                <span className="text-zinc-300 dark:text-zinc-700">•</span>

                <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
                  <WorkplaceBadge type={job.workplaceType} />
                </div>

                {job.salary && (
                  <>
                    <span className="text-zinc-300 dark:text-zinc-700">•</span>
                    <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 font-semibold">
                      <DollarSign className="w-3.5 h-3.5 text-amber-500" />
                      <span className="text-zinc-800 dark:text-zinc-200">{formatSalaryDisplay(job.salary)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Job Description & Responsibilities */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-7 border border-zinc-200/90 dark:border-zinc-800 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3.5">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-zinc-400" />
                  <h2 className="text-xs uppercase font-bold tracking-wider text-zinc-500 dark:text-zinc-400">
                    Job Description & Role Scope
                  </h2>
                </div>

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
                <div className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line font-normal selection:bg-zinc-200 dark:selection:bg-zinc-700 max-h-[500px] overflow-y-auto pr-2">
                  {job.description}
                </div>
              ) : (
                <div className="py-10 text-center space-y-3">
                  <FileText className="w-8 h-8 text-zinc-300 dark:text-zinc-600 mx-auto" />
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    No description or requirements provided
                  </p>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-white transition cursor-pointer"
                  >
                    + Add Role Scope
                  </button>
                </div>
              )}
            </div>

            {/* Application Milestone Checklist */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-7 border border-zinc-200/90 dark:border-zinc-800 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <ListChecks className="w-4 h-4 text-zinc-400" />
                  <h2 className="text-xs uppercase font-bold tracking-wider text-zinc-500 dark:text-zinc-400">
                    Application Checklist & Prep
                  </h2>
                </div>

                <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500">
                  {Object.values(checklist).filter(Boolean).length} of {DEFAULT_CHECKLIST_ITEMS.length} completed
                </span>
              </div>

              <div className="space-y-2 pt-1">
                {DEFAULT_CHECKLIST_ITEMS.map((item) => {
                  const isChecked = !!checklist[item];
                  return (
                    <button
                      key={item}
                      onClick={() => toggleChecklistItem(item)}
                      className={`w-full p-3 rounded-2xl border text-left transition cursor-pointer flex items-center gap-3 ${
                        isChecked
                          ? "bg-zinc-50/70 dark:bg-zinc-800/40 border-zinc-200/60 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 line-through"
                          : "bg-white dark:bg-zinc-900 border-zinc-200/90 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:border-zinc-300 dark:hover:border-zinc-700"
                      }`}
                    >
                      {isChecked ? (
                        <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-zinc-300 dark:text-zinc-600 shrink-0" />
                      )}
                      <span className="text-xs font-semibold">{item}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Linear-Style Properties Inspector Rail (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* AI Job Match Analysis Card */}
            <AIMatchPanel
              jobId={job.id}
              jobTitle={job.jobTitle}
              company={job.company}
              description={job.description}
              initialAnalysis={job.aiMatchAnalysis}
              onOpenEditModal={() => setIsModalOpen(true)}
            />

            {/* Properties Card */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200/90 dark:border-zinc-800 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-5">
              <h3 className="text-xs uppercase font-bold tracking-wider text-zinc-400 dark:text-zinc-500 pb-2 border-b border-zinc-100 dark:border-zinc-800">
                Application Properties
              </h3>

              {/* Property: Status */}
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="font-semibold text-zinc-500 dark:text-zinc-400">Stage</span>
                <div className="min-w-[150px]">
                  <StatusDropdown
                    value={job.status}
                    onChange={handleStatusChange}
                    size="sm"
                    className="w-full"
                  />
                </div>
              </div>

              {/* Property: Match */}
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="font-semibold text-zinc-500 dark:text-zinc-400">Match Level</span>
                <MatchBadge match={job.match} />
              </div>

              {/* Property: Date Applied */}
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="font-semibold text-zinc-500 dark:text-zinc-400">Date Applied</span>
                <div className="flex items-center gap-1.5 font-bold text-zinc-800 dark:text-zinc-200">
                  <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{job.dateApplied}</span>
                </div>
              </div>

              {/* Property: Platform */}
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="font-semibold text-zinc-500 dark:text-zinc-400">Platform</span>
                <PlatformBadge platform={job.appliedOn} />
              </div>

              {/* Property: Workplace */}
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="font-semibold text-zinc-500 dark:text-zinc-400">Workplace</span>
                <WorkplaceBadge type={job.workplaceType} />
              </div>

              {/* Property: Compensation */}
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="font-semibold text-zinc-500 dark:text-zinc-400">Salary Target</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200 truncate">
                  {formatSalaryDisplay(job.salary) || "Not specified"}
                </span>
              </div>
            </div>

            {/* Direct Links Card */}
            {(job.jobUrl || job.contactUrl) && (
              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200/90 dark:border-zinc-800 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-4">
                <h3 className="text-xs uppercase font-bold tracking-wider text-zinc-400 dark:text-zinc-500 pb-2 border-b border-zinc-100 dark:border-zinc-800">
                  Links & Outreach
                </h3>

                {/* Job URL */}
                {job.jobUrl && (
                  <div className="p-3.5 rounded-2xl bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-200/70 dark:border-zinc-800 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-800 dark:text-zinc-200">
                      <Globe className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Posting URL</span>
                    </div>
                    <p className="text-[11px] font-mono text-zinc-500 truncate" title={job.jobUrl}>
                      {getDomain(job.jobUrl)}
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={handleCopyLink}
                        className="flex-1 py-1.5 px-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        {copiedLink ? (
                          <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3 text-zinc-400" />
                        )}
                        <span>{copiedLink ? "Copied" : "Copy"}</span>
                      </button>

                      <a
                        href={job.jobUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-1.5 px-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-white transition cursor-pointer flex items-center justify-center gap-1 shadow-2xs"
                      >
                        <span>Visit</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                )}

                {/* Contact URL */}
                {job.contactUrl && (
                  <div className="p-3.5 rounded-2xl bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-200/70 dark:border-zinc-800 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-800 dark:text-zinc-200">
                      <Link2 className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Contact / Recruiter</span>
                    </div>
                    <p className="text-[11px] font-mono text-zinc-500 truncate" title={job.contactUrl}>
                      {getDomain(job.contactUrl)}
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={handleCopyContactLink}
                        className="flex-1 py-1.5 px-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        {copiedContactLink ? (
                          <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3 text-zinc-400" />
                        )}
                        <span>{copiedContactLink ? "Copied" : "Copy"}</span>
                      </button>

                      <a
                        href={job.contactUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-1.5 px-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-white transition cursor-pointer flex items-center justify-center gap-1 shadow-2xs"
                      >
                        <span>Visit</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Audit & Timestamps Card */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-zinc-200/90 dark:border-zinc-800 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-2 text-[11px] text-zinc-500 dark:text-zinc-400">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-zinc-400" />
                  Created
                </span>
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                  {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : job.dateApplied}
                </span>
              </div>
              {job.updatedAt && (
                <div className="flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-zinc-800">
                  <span>Last Updated</span>
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                    {formatRelativeDate(job.updatedAt.split("T")[0])}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Edit Modal */}
      <JobModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleEditSave}
        initialJob={job}
      />
    </>
  );
}
