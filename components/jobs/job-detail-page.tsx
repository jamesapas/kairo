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
  Briefcase,
  AlertCircle,
  Sparkles,
  Send,
  Plus,
  MoreHorizontal,
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
import { HelpMeApplyModal } from "./help-me-apply-modal";
import { ApplyMaterialsPanel } from "./apply-materials-panel";
import { APPLY_CONTENT_KEYS } from "@/types/ai-apply";
import {
  deleteJobAction,
  updateJobAction,
  updateJobStatusAction,
  togglePinJobAction,
} from "@/lib/actions/jobs";

interface JobDetailPageProps {
  jobId: string;
}

type ActiveTab = "ai-match" | "materials" | "description";

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

function LinkActionDropdown({
  url,
  onEdit,
  onDelete,
  onCopy,
  copied,
}: {
  url: string;
  onEdit: () => void;
  onDelete: () => void;
  onCopy: () => void;
  copied: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative shrink-0" ref={dropdownRef} onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-700/60 transition cursor-pointer"
        title="Link options"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 z-30 w-36 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl py-1 text-xs font-semibold animate-scale-up">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white transition cursor-pointer"
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400" />
            <span>Visit link</span>
          </a>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onCopy();
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white transition cursor-pointer text-left"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-zinc-400" />
                <span>Copy link</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onEdit();
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white transition cursor-pointer text-left"
          >
            <Edit3 className="w-3.5 h-3.5 text-zinc-400" />
            <span>Edit link</span>
          </button>

          <div className="border-t border-zinc-100 dark:border-zinc-800 my-1" />

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onDelete();
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer text-left"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  );
}

export function JobDetailPage({ jobId }: JobDetailPageProps) {
  const router = useRouter();
  const [job, setJob] = useState<JobApplication | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHelpMeApplyOpen, setIsHelpMeApplyOpen] = useState(false);
  const [copiedDesc, setCopiedDesc] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedContactLink, setCopiedContactLink] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active Tab State
  const [activeTab, setActiveTab] = useState<ActiveTab>("ai-match");

  // Quick Link Inline Edit state
  const [editingLinkType, setEditingLinkType] = useState<"jobUrl" | "contactUrl" | null>(null);
  const [tempLinkValue, setTempLinkValue] = useState("");
  const [isSavingLink, setIsSavingLink] = useState(false);

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

  const startEditLink = (type: "jobUrl" | "contactUrl", currentValue: string = "") => {
    setEditingLinkType(type);
    setTempLinkValue(currentValue);
  };

  const cancelEditLink = () => {
    setEditingLinkType(null);
    setTempLinkValue("");
  };

  const handleSaveQuickLink = async (type: "jobUrl" | "contactUrl") => {
    if (!job) return;
    const trimmed = tempLinkValue.trim();
    setIsSavingLink(true);

    try {
      const updates = { [type]: trimmed };
      const res = await updateJobAction(job.id, updates);
      if (!res.success) {
        alert(res.error || "Failed to update link");
      } else {
        setJob((prev) => (prev ? { ...prev, [type]: trimmed } : null));
        setEditingLinkType(null);
        setTempLinkValue("");
        showToast(
          trimmed
            ? `${type === "jobUrl" ? "Posting URL" : "Contact link"} saved!`
            : `${type === "jobUrl" ? "Posting URL" : "Contact link"} removed.`
        );
      }
    } catch (err) {
      console.error("Error updating link:", err);
    } finally {
      setIsSavingLink(false);
    }
  };

  const handleDeleteQuickLink = async (type: "jobUrl" | "contactUrl") => {
    if (!job) return;
    const label = type === "jobUrl" ? "Posting URL" : "Contact link";
    setIsSavingLink(true);

    try {
      const updates = { [type]: "" };
      const res = await updateJobAction(job.id, updates);
      if (!res.success) {
        alert(res.error || "Failed to remove link");
      } else {
        setJob((prev) => (prev ? { ...prev, [type]: "" } : null));
        setEditingLinkType(null);
        setTempLinkValue("");
        showToast(`${label} removed.`);
      }
    } catch (err) {
      console.error("Error removing link:", err);
    } finally {
      setIsSavingLink(false);
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
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsModalOpen(true)}
              title="Edit Application (E)"
              className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition cursor-pointer shadow-2xs"
            >
              <Edit3 className="w-3.5 h-3.5" />
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
                  <span>
                    {job.status === "saved"
                      ? `Saved on ${formatDateWords(job.dateApplied)}`
                      : `Applied on ${formatDateWords(job.dateApplied)} (${formatRelativeDate(job.dateApplied)})`}
                  </span>
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
                {job.status === "saved" ? (
                  <button
                    type="button"
                    onClick={() => handleStatusChange("applied")}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm hover:shadow active:scale-[0.98]"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Mark as Applied</span>
                  </button>
                ) : (
                  <StatusDropdown
                    value={job.status}
                    onChange={handleStatusChange}
                    size="md"
                    className="w-full sm:w-auto min-w-[145px]"
                  />
                )}
              </div>
            </div>

            {/* Segmented Workspace Tabs Bar */}
            <div className="flex items-center gap-1.5 p-1 bg-zinc-100/90 dark:bg-zinc-800/70 border border-zinc-200/80 dark:border-zinc-700/80 rounded-2xl">
              <button
                onClick={() => setActiveTab("ai-match")}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer truncate ${
                  activeTab === "ai-match"
                    ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs"
                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span className="truncate">AI Match Analysis</span>
              </button>

              <button
                onClick={() => setActiveTab("materials")}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer truncate ${
                  activeTab === "materials"
                    ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs"
                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="truncate">Help Me Apply</span>
                {APPLY_CONTENT_KEYS.filter((k) => Boolean(job.aiApplyMaterials?.[k]?.content)).length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-[10px] font-extrabold shrink-0">
                    {APPLY_CONTENT_KEYS.filter((k) => Boolean(job.aiApplyMaterials?.[k]?.content)).length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab("description")}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer truncate ${
                  activeTab === "description"
                    ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs"
                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                <Briefcase className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span className="truncate">Job Description</span>
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
                  currentStatus={job.status}
                  initialAnalysis={job.aiMatchAnalysis}
                  initialMaterials={job.aiApplyMaterials}
                  onOpenEditModal={() => setIsModalOpen(true)}
                  onOpenHelpMeApply={() => setIsHelpMeApplyOpen(true)}
                  onMarkApplied={() => handleStatusChange("applied")}
                  onMaterialsUpdated={(updatedMap) =>
                    setJob((prev) => (prev ? { ...prev, aiApplyMaterials: updatedMap } : null))
                  }
                />
              )}

              {/* Tab 2: Application Materials Kit */}
              {activeTab === "materials" && (
                <ApplyMaterialsPanel
                  jobId={job.id}
                  jobTitle={job.jobTitle}
                  company={job.company}
                  description={job.description}
                  currentStatus={job.status}
                  initialMaterials={job.aiApplyMaterials}
                  onOpenHelpMeApply={() => setIsHelpMeApplyOpen(true)}
                  onMarkApplied={() => handleStatusChange("applied")}
                  onMaterialsUpdated={(updatedMap) =>
                    setJob((prev) => (prev ? { ...prev, aiApplyMaterials: updatedMap } : null))
                  }
                />
              )}

              {/* Tab 3: Job Description & Scope */}
              {activeTab === "description" && (
                <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-7 border border-zinc-200/90 dark:border-zinc-800 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3.5">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-blue-500" />
                      <h2 className="text-xs uppercase font-bold tracking-wider text-zinc-500 dark:text-zinc-400">
                        Job Description & Role Scope
                      </h2>
                    </div>

                    {job.description && (
                      <button
                        onClick={handleCopyDescription}
                        className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs active:scale-[0.98]"
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
                      <Briefcase className="w-8 h-8 text-zinc-300 dark:text-zinc-600 mx-auto" />
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
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3.5">
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

            {/* Direct Links Card - Minimalist List Mode */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200/90 dark:border-zinc-800 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-3">
              <div className="flex items-center justify-between pb-3.5 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-zinc-400" />
                  <h2 className="text-xs uppercase font-bold tracking-wider text-zinc-500 dark:text-zinc-400">
                    Links & Outreach
                  </h2>
                </div>
              </div>

              {/* List items */}
              <div className="space-y-2">
                {/* 1. Job Posting URL */}
                {editingLinkType === "jobUrl" ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSaveQuickLink("jobUrl");
                    }}
                    className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-2"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-800 dark:text-zinc-200">
                      <Globe className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Posting URL</span>
                    </div>
                    <input
                      type="url"
                      autoFocus
                      value={tempLinkValue}
                      onChange={(e) => setTempLinkValue(e.target.value)}
                      placeholder="https://example.com/job/..."
                      className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:border-zinc-500"
                    />
                    <div className="flex items-center justify-end gap-1.5 pt-0.5">
                      <button
                        type="button"
                        onClick={cancelEditLink}
                        className="px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSavingLink}
                        className="px-3 py-1 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-white transition cursor-pointer disabled:opacity-50"
                      >
                        {isSavingLink ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </form>
                ) : job.jobUrl ? (
                  <div className="p-2.5 rounded-2xl bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-200/70 dark:border-zinc-800 flex items-center justify-between gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/70 transition group">
                    <a
                      href={job.jobUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
                    >
                      <div className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 text-zinc-500 shrink-0 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                        <Globe className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition truncate">
                            Posting URL
                          </span>
                          <ArrowUpRight className="w-3 h-3 text-zinc-400 group-hover:text-blue-500 transition shrink-0" />
                        </div>
                        <p className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500 truncate" title={job.jobUrl}>
                          {getDomain(job.jobUrl)}
                        </p>
                      </div>
                    </a>

                    <LinkActionDropdown
                      url={job.jobUrl}
                      onEdit={() => startEditLink("jobUrl", job.jobUrl)}
                      onDelete={() => handleDeleteQuickLink("jobUrl")}
                      onCopy={handleCopyLink}
                      copied={copiedLink}
                    />
                  </div>
                ) : (
                  <button
                    onClick={() => startEditLink("jobUrl", "")}
                    className="w-full py-2 px-3 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/40 dark:bg-zinc-800/20 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Job Posting URL</span>
                  </button>
                )}

                {/* 2. Contact / Recruiter URL */}
                {editingLinkType === "contactUrl" ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSaveQuickLink("contactUrl");
                    }}
                    className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-2"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-800 dark:text-zinc-200">
                      <Link2 className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Contact / Recruiter</span>
                    </div>
                    <input
                      type="url"
                      autoFocus
                      value={tempLinkValue}
                      onChange={(e) => setTempLinkValue(e.target.value)}
                      placeholder="https://linkedin.com/in/... or email link"
                      className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:border-zinc-500"
                    />
                    <div className="flex items-center justify-end gap-1.5 pt-0.5">
                      <button
                        type="button"
                        onClick={cancelEditLink}
                        className="px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSavingLink}
                        className="px-3 py-1 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-white transition cursor-pointer disabled:opacity-50"
                      >
                        {isSavingLink ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </form>
                ) : job.contactUrl ? (
                  <div className="p-2.5 rounded-2xl bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-200/70 dark:border-zinc-800 flex items-center justify-between gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/70 transition group">
                    <a
                      href={job.contactUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
                    >
                      <div className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 text-zinc-500 shrink-0 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                        <Link2 className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition truncate">
                            Contact / Recruiter
                          </span>
                          <ArrowUpRight className="w-3 h-3 text-zinc-400 group-hover:text-blue-500 transition shrink-0" />
                        </div>
                        <p className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500 truncate" title={job.contactUrl}>
                          {getDomain(job.contactUrl)}
                        </p>
                      </div>
                    </a>

                    <LinkActionDropdown
                      url={job.contactUrl}
                      onEdit={() => startEditLink("contactUrl", job.contactUrl)}
                      onDelete={() => handleDeleteQuickLink("contactUrl")}
                      onCopy={handleCopyContactLink}
                      copied={copiedContactLink}
                    />
                  </div>
                ) : (
                  <button
                    onClick={() => startEditLink("contactUrl", "")}
                    className="w-full py-2.5 px-3 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/40 dark:bg-zinc-800/20 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Contact / Recruiter Link</span>
                  </button>
                )}
              </div>
            </div>

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

      {/* Help Me Apply Modal */}
      <HelpMeApplyModal
        isOpen={isHelpMeApplyOpen}
        onClose={() => setIsHelpMeApplyOpen(false)}
        jobId={job.id}
        jobTitle={job.jobTitle}
        company={job.company}
        description={job.description}
        currentStatus={job.status}
        initialMaterials={job.aiApplyMaterials}
        onMarkApplied={() => handleStatusChange("applied")}
        onMaterialsUpdated={(updatedMap) =>
          setJob((prev) => (prev ? { ...prev, aiApplyMaterials: updatedMap } : null))
        }
      />
    </>
  );
}
