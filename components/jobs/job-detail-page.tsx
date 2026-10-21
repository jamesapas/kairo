"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowLeft,
  Building2,
  Edit3,
  Trash2,
  Pin,
  Laptop,
  Building,
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  AlertCircle,
  Sparkles,
  Send,
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
import { JobDescriptionView } from "./job-description-view";
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

type ActiveTab = "ai-match" | "materials";

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
  const [isHelpMeApplyOpen, setIsHelpMeApplyOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active Tab State
  const [activeTab, setActiveTab] = useState<ActiveTab>("ai-match");



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
      job.company
        ? `Are you sure you want to delete ${job.jobTitle} at ${job.company}? This cannot be undone.`
        : `Are you sure you want to delete ${job.jobTitle}? This cannot be undone.`
    );
    if (!confirmDelete) return;

    const res = await deleteJobAction(job.id);
    if (res.success) {
      router.push("/");
    } else {
      alert(res.error || "Failed to delete job application");
    }
  };

  const handleEditSave = async (
    savedJobData: Omit<JobApplication, "id" | "createdAt" | "updatedAt"> & { id?: string }
  ) => {
    if (!job) return;
    const prevJob = { ...job };
    const updatedJob: JobApplication = {
      ...prevJob,
      ...savedJobData,
      id: prevJob.id,
      createdAt: prevJob.createdAt,
      updatedAt: new Date().toISOString(),
    };
    setJob(updatedJob);
    showToast("Application details saved successfully");

    try {
      const res = await updateJobAction(job.id, savedJobData);
      if (!res.success) {
        setJob(prevJob);
        showToast(res.error || "Failed to update application");
      } else if (res.data) {
        setJob(res.data);
      }
    } catch (err: unknown) {
      setJob(prevJob);
      showToast((err as Error)?.message || "Failed to update application");
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
            {job.company ? (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-700" />
                <span className="font-semibold text-zinc-700 dark:text-zinc-300 truncate max-w-[140px]">
                  {job.company}
                </span>
              </>
            ) : null}
            <ChevronRight className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-700" />
            <span className="text-zinc-900 dark:text-zinc-100 font-semibold truncate max-w-[200px]">
              {job.jobTitle}
            </span>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2">
            {job.status === "saved" ? (
              <button
                type="button"
                onClick={() => handleStatusChange("applied")}
                className="h-8.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs hover:shadow active:scale-[0.98]"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Mark as Applied</span>
              </button>
            ) : (
              <StatusDropdown
                value={job.status}
                onChange={handleStatusChange}
                size="sm"
                buttonClassName="!rounded-xl !h-8.5 px-3"
              />
            )}

            <button
              onClick={() => setIsModalOpen(true)}
              title="Edit Application (E)"
              className="h-8.5 w-8.5 rounded-xl flex items-center justify-center bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition cursor-pointer shadow-2xs"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleDelete}
              className="h-8.5 w-8.5 rounded-xl flex items-center justify-center bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:border-rose-200 dark:border-rose-900/50 transition cursor-pointer shadow-2xs"
              title="Delete Application"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Two-Column Split Layout: 5 cols Left (Unified Job Box, Sticky) / 7 cols Right (AI Workspace) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: Unified Job Context Box (Sticky on Desktop below navbar) */}
          <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-[5.25rem] lg:self-start z-10">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 shadow-xs flex flex-col lg:max-h-[calc(100vh-6.75rem)] overflow-hidden">
              {/* Header: Company, Date, Title, Badges & Links (Pinned in card) */}
              <div className="p-5 sm:p-6 pb-5 space-y-3.5 shrink-0">
                {/* Top Row: Company & Date Applied (Separated with breathing room) */}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 flex items-center justify-center shrink-0">
                      <Building2 className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                    </div>
                    <span className={`text-sm truncate ${job.company ? "font-bold text-zinc-900 dark:text-zinc-100" : "font-medium text-zinc-400 dark:text-zinc-500 italic"}`}>
                      {job.company || "No company specified"}
                    </span>
                  </div>

                  <span
                    className="text-xs text-zinc-400 dark:text-zinc-500 font-normal shrink-0"
                    title={job.dateApplied ? `Applied on ${formatDateWords(job.dateApplied)}` : undefined}
                  >
                    {job.status === "saved" ? "Saved" : "Applied"} {formatRelativeDate(job.dateApplied)}
                  </span>
                </div>

                {/* Role Title */}
                <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight leading-snug">
                  {job.jobUrl ? (
                    <a
                      href={job.jobUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline transition inline-flex items-center gap-1.5 group"
                      title={`Open job posting: ${job.jobUrl}`}
                    >
                      <span>{job.jobTitle}</span>
                      <ArrowUpRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition shrink-0" />
                    </a>
                  ) : (
                    <span>{job.jobTitle}</span>
                  )}
                </h1>

                {/* Metadata: Platform, Workplace, Salary, Recruiter */}
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
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                        {formatSalaryDisplay(job.salary)}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Job Description (Scrolls internally inside card) */}
              <div className="flex-1 overflow-y-auto scrollbar-thin p-5 sm:p-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
                <h2 className="text-xs uppercase font-bold tracking-wider text-zinc-500 dark:text-zinc-400">
                  Job Description
                </h2>

                {job.description ? (
                  <JobDescriptionView description={job.description} />
                ) : (
                  <div className="py-8 text-center space-y-3">
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
            </div>
          </div>

          {/* RIGHT COLUMN: AI Copilot & Materials Workspace */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
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
              </button>
            </div>

            {/* Active Tab Panel Content */}
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

            {activeTab === "materials" && (
              <ApplyMaterialsPanel
                jobId={job.id}
                jobTitle={job.jobTitle}
                company={job.company}
                description={job.description}
                currentStatus={job.status}
                initialMaterials={job.aiApplyMaterials}
                matchAnalysis={job.aiMatchAnalysis}
                onOpenHelpMeApply={() => setIsHelpMeApplyOpen(true)}
                onMarkApplied={() => handleStatusChange("applied")}
                onMaterialsUpdated={(updatedMap) =>
                  setJob((prev) => (prev ? { ...prev, aiApplyMaterials: updatedMap } : null))
                }
              />
            )}
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
