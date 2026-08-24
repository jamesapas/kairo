"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowLeft,
  Building2,
  Calendar,
  DollarSign,
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
  AlertCircle,
  Sparkles,
} from "lucide-react";
import Loading from "@/app/(workspace)/jobs/[id]/loading";
import {
  JobApplication,
  JobApplicationRow,
  JobStatus,
  WorkplaceType,
  JOB_STATUS_CONFIG,
  formatRelativeDate,
  formatDateWords,
  formatSalaryDisplay,
  mapRowToJob,
} from "@/types/job";
import { StatusDropdown } from "./status-dropdown";
import { PlatformIcon } from "./platform-badge";
import { JobModal } from "./job-modal";
import { AIMatchPanel } from "./ai-match-panel";
import {
  deleteJobAction,
  updateJobStatusAction,
  togglePinJobAction,
} from "@/lib/actions/jobs";

interface JobDetailPageProps {
  jobId: string;
}

type ActiveTab = "ai-match" | "description";

const DEFAULT_CHECKLIST_ITEMS = [
  "Customized resume & portfolio submitted",
  "Researched company culture & recent product updates",
  "Prepared questions for hiring team & interviewers",
  "Followed up with recruiter / sent thank-you note",
];

function WorkplaceBadge({ type }: { type: WorkplaceType }) {
  const config = {
    Remote: {
      icon: Laptop,
      label: "Remote",
      iconColor: "text-emerald-500",
    },
    Hybrid: {
      icon: Building,
      label: "Hybrid",
      iconColor: "text-purple-500",
    },
    "On-site": {
      icon: Building2,
      label: "On-site",
      iconColor: "text-blue-500",
    },
  }[type] || {
    icon: Laptop,
    label: type,
    iconColor: "text-emerald-500",
  };

  const Icon = config.icon;

  return (
    <div className="inline-flex items-center gap-1.5">
      <Icon className={`w-3.5 h-3.5 ${config.iconColor} shrink-0`} />
      <span>{config.label}</span>
    </div>
  );
}

export function JobDetailPage({ jobId }: JobDetailPageProps) {
  const router = useRouter();
  const [job, setJob] = useState<JobApplication | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedDesc, setCopiedDesc] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedContactLink, setCopiedContactLink] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active Tab State
  const [activeTab, setActiveTab] = useState<ActiveTab>("ai-match");

  // Checklist state persisted to localStorage per job
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!jobId) return;
    try {
      const saved = localStorage.getItem(`kairo-checklist-${jobId}`);
      if (saved) {
        setChecklist(JSON.parse(saved));
      }
    } catch {}
  }, [jobId]);

  const toggleChecklistItem = (item: string) => {
    setChecklist((prev) => {
      const updated = { ...prev, [item]: !prev[item] };
      try {
        localStorage.setItem(`kairo-checklist-${jobId}`, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  }, []);

  // Fetch job details on load
  const fetchJob = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadError(null);

      const supabase = createClient();
      const { data, error } = await supabase
        .from("job_applications")
        .select("*")
        .eq("id", jobId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          setLoadError("Job application not found");
        } else {
          setLoadError(error.message);
        }
        return;
      }

      if (data) {
        setJob(mapRowToJob(data as JobApplicationRow));
      }
    } catch (err: unknown) {
      console.error("Error loading job details:", err);
      setLoadError("An unexpected error occurred while fetching details.");
    } finally {
      setIsLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  // Realtime subscription for live sync
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`job-detail-${jobId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "job_applications",
          filter: `id=eq.${jobId}`,
        },
        (payload) => {
          if (payload.eventType === "DELETE") {
            router.push("/");
          } else if (payload.new) {
            setJob(mapRowToJob(payload.new as JobApplicationRow));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [jobId, router]);

  const handleStatusChange = async (newStatus: JobStatus) => {
    if (!job || job.status === newStatus) return;
    const oldStatus = job.status;

    setJob((prev) => (prev ? { ...prev, status: newStatus } : null));

    const res = await updateJobStatusAction(job.id, newStatus);
    if (!res.success) {
      setJob((prev) => (prev ? { ...prev, status: oldStatus } : null));
      alert(res.error || "Failed to update status");
    } else {
      showToast(`Status updated to ${JOB_STATUS_CONFIG[newStatus]?.label || newStatus}`);
    }
  };

  const handleTogglePin = async () => {
    if (!job) return;
    const newPinned = !job.isPinned;
    setJob((prev) => (prev ? { ...prev, isPinned: newPinned } : null));

    const res = await togglePinJobAction(job.id, newPinned);
    if (!res.success) {
      setJob((prev) => (prev ? { ...prev, isPinned: !newPinned } : null));
    } else {
      showToast(newPinned ? "Pinned application to top" : "Unpinned application");
    }
  };

  const handleDelete = async () => {
    if (!job) return;
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${job.jobTitle} at ${job.company}? This cannot be undone.`
    );
    if (!confirmDelete) return;

    const res = await deleteJobAction(job.id);
    if (res.success) {
      router.push("/");
    } else {
      alert(res.error || "Failed to delete job application");
    }
  };

  const handleEditSave = (
    savedJobData: Omit<JobApplication, "id" | "createdAt" | "updatedAt"> & { id?: string }
  ) => {
    setJob((prev) =>
      prev
        ? {
            ...prev,
            ...savedJobData,
            id: prev.id,
            createdAt: prev.createdAt,
            updatedAt: new Date().toISOString(),
          }
        : null
    );
    showToast("Application details saved successfully");
  };

  const handleCopyDescription = () => {
    if (!job?.description) return;
    navigator.clipboard.writeText(job.description);
    setCopiedDesc(true);
    showToast("Description copied to clipboard");
    setTimeout(() => setCopiedDesc(false), 2000);
  };

  const handleCopyLink = () => {
    if (!job?.jobUrl) return;
    navigator.clipboard.writeText(job.jobUrl);
    setCopiedLink(true);
    showToast("Job link copied");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyContactLink = () => {
    if (!job?.contactUrl) return;
    navigator.clipboard.writeText(job.contactUrl);
    setCopiedContactLink(true);
    showToast("Contact link copied");
    setTimeout(() => setCopiedContactLink(false), 2000);
  };

  const handleCopySummary = () => {
    if (!job) return;
    const matchLine = job.aiMatchAnalysis?.matchPercentage !== undefined ? `AI Match: ${job.aiMatchAnalysis.matchPercentage}%\n` : "";
    const summary = `${job.jobTitle} @ ${job.company}\nStatus: ${JOB_STATUS_CONFIG[job.status]?.label}\nWorkplace: ${job.workplaceType}\nApplied on: ${job.appliedOn} (${job.dateApplied})\n${matchLine}${job.salary ? `Salary: ${job.salary}\n` : ""}${job.jobUrl ? `Link: ${job.jobUrl}` : ""}`.trim();
    navigator.clipboard.writeText(summary);
    setCopiedSummary(true);
    showToast("Summary copied for sharing");
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const getDomain = (url?: string) => {
    if (!url) return "";
    try {
      const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
      return parsed.hostname.replace(/^www\./, "");
    } catch {
      return url;
    }
  };

  // Keyboard shortcuts listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
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
      <main className="flex-1 max-w-[1536px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 flex items-center justify-center">
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

  return (
    <>
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2.5 rounded-2xl shadow-xl border border-zinc-800 dark:border-zinc-200 flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="flex-1 max-w-[1536px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Top Breadcrumb & Executive Toolbar */}
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

        {/* Two-Column Executive Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT MAIN COLUMN: Hero & Tabbed Workspace (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Header Hero Title Card (Compact Hero) */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 sm:p-6 border border-zinc-200/90 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  <Building2 className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">{job.company}</span>
                  <span>•</span>
                  <span>Applied on {formatDateWords(job.dateApplied)} ({formatRelativeDate(job.dateApplied)})</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight truncate">
                  {job.jobTitle}
                </h1>
                <div className="flex items-center gap-2 pt-0.5 flex-wrap text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                  <div className="inline-flex items-center gap-1.5 font-semibold text-zinc-800 dark:text-zinc-200">
                    <PlatformIcon platform={job.appliedOn} className="w-3.5 h-3.5" />
                    <span>{job.appliedOn}</span>
                  </div>
                  <span className="text-zinc-300 dark:text-zinc-700">•</span>
                  <WorkplaceBadge type={job.workplaceType} />
                  {job.salary && (
                    <>
                      <span className="text-zinc-300 dark:text-zinc-700">•</span>
                      <span>{formatSalaryDisplay(job.salary)}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="shrink-0 pt-0.5">
                <StatusDropdown
                  value={job.status}
                  onChange={handleStatusChange}
                  size="md"
                  className="w-full sm:w-auto min-w-[145px]"
                />
              </div>
            </div>

            {/* Segmented Workspace Tabs Bar */}
            <div className="flex items-center gap-1.5 p-1 bg-zinc-100/90 dark:bg-zinc-800/70 border border-zinc-200/80 dark:border-zinc-700/80 rounded-2xl">
              <button
                onClick={() => setActiveTab("ai-match")}
                className={`flex-1 py-2.5 px-3.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === "ai-match"
                    ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs"
                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>AI Match Analysis</span>
              </button>

              <button
                onClick={() => setActiveTab("description")}
                className={`flex-1 py-2.5 px-3.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === "description"
                    ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs"
                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-blue-500" />
                <span>Job Description & Scope</span>
              </button>
            </div>

            {/* Active Tab Panel Content */}
            <div>
              {/* Tab 1: AI Match Analysis */}
              {activeTab === "ai-match" && (
                <AIMatchPanel
                  jobId={job.id}
                  jobTitle={job.jobTitle}
                  company={job.company}
                  description={job.description}
                  initialAnalysis={job.aiMatchAnalysis}
                  onOpenEditModal={() => setIsModalOpen(true)}
                />
              )}

              {/* Tab 2: Job Description & Scope */}
              {activeTab === "description" && (
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
                    <div className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line font-normal selection:bg-zinc-200 dark:selection:bg-zinc-700">
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
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Sidebar Rail (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Application Checklist */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200/90 dark:border-zinc-800 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <ListChecks className="w-4 h-4 text-zinc-400" />
                  <h2 className="text-xs uppercase font-bold tracking-wider text-zinc-500 dark:text-zinc-400">
                    Application Checklist
                  </h2>
                </div>

                <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500">
                  {Object.values(checklist).filter(Boolean).length} of {DEFAULT_CHECKLIST_ITEMS.length}
                </span>
              </div>

              <div className="space-y-2 pt-1">
                {DEFAULT_CHECKLIST_ITEMS.map((item) => {
                  const isChecked = !!checklist[item];
                  return (
                    <button
                      key={item}
                      onClick={() => toggleChecklistItem(item)}
                      className={`w-full p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center gap-2.5 ${
                        isChecked
                          ? "bg-zinc-50/70 dark:bg-zinc-800/40 border-zinc-200/60 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 line-through"
                          : "bg-white dark:bg-zinc-900 border-zinc-200/90 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:border-zinc-300 dark:hover:border-zinc-700"
                      }`}
                    >
                      {isChecked ? (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-600 shrink-0" />
                      )}
                      <span className="text-xs font-semibold leading-snug">{item}</span>
                    </button>
                  );
                })}
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
