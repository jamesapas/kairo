"use client";

import React, { useState, useMemo } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  CheckCircle2,
  X,
  FileSpreadsheet,
  Star,
} from "lucide-react";
import {
  JobApplication,
  JobStatus,
  WorkplaceType,
  INITIAL_SAMPLE_JOBS,
  JOB_STATUS_CONFIG,
  PLATFORM_OPTIONS,
} from "@/types/job";
import { JobTable } from "./job-table";
import { JobKanban } from "./job-kanban";
import { JobModal } from "./job-modal";
import { JobDetailDrawer } from "./job-detail-drawer";

const STORAGE_KEY = "kairo_job_applications_v2";

type SortOption = "date-desc" | "date-asc" | "company-asc" | "title-asc";

interface JobDashboardProps {
  userEmail?: string;
}

export function JobDashboard({ userEmail }: JobDashboardProps) {
  const [jobs, setJobs] = useState<JobApplication[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {
        console.error("Failed to parse stored jobs:", e);
      }
    }
    return INITIAL_SAMPLE_JOBS;
  });

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<JobStatus | "all">("all");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [workplaceFilter, setWorkplaceFilter] = useState<WorkplaceType | "all">("all");
  const [sortBy, setSortBy] = useState<SortOption>("date-desc");
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");

  // Modal / Drawer state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobApplication | null>(null);
  const [selectedJob, setSelectedJob] = useState<JobApplication | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const persistJobs = (updatedJobs: JobApplication[]) => {
    setJobs(updatedJobs);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedJobs));
    } catch (e) {
      console.error("Failed to save jobs to localStorage:", e);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleSaveJob = (
    jobData: Omit<JobApplication, "id" | "createdAt" | "updatedAt"> & { id?: string }
  ) => {
    const now = new Date().toISOString();
    if (jobData.id) {
      const updated = jobs.map((j) =>
        j.id === jobData.id
          ? {
              ...j,
              ...jobData,
              updatedAt: now,
            }
          : j
      );
      persistJobs(updated);
      showToast(`Updated ${jobData.jobTitle}`);
      if (selectedJob && selectedJob.id === jobData.id) {
        setSelectedJob({ ...selectedJob, ...jobData, updatedAt: now } as JobApplication);
      }
    } else {
      const newJob: JobApplication = {
        ...jobData,
        id: `job-${Date.now()}`,
        createdAt: now,
        updatedAt: now,
      };
      const updated = [newJob, ...jobs];
      persistJobs(updated);
      showToast(`Added ${newJob.jobTitle}`);
    }
  };

  const handleStatusChange = (id: string, newStatus: JobStatus) => {
    const now = new Date().toISOString();
    const updated = jobs.map((j) => (j.id === id ? { ...j, status: newStatus, updatedAt: now } : j));
    persistJobs(updated);
    if (selectedJob && selectedJob.id === id) {
      setSelectedJob({ ...selectedJob, status: newStatus, updatedAt: now });
    }
  };

  const handleTogglePin = (id: string) => {
    const now = new Date().toISOString();
    const updated = jobs.map((j) => (j.id === id ? { ...j, isPinned: !j.isPinned, updatedAt: now } : j));
    persistJobs(updated);
    const target = jobs.find((j) => j.id === id);
    if (target) {
      showToast(target.isPinned ? `Unpinned ${target.jobTitle}` : `Pinned ${target.jobTitle}`);
    }
    if (selectedJob && selectedJob.id === id) {
      setSelectedJob({ ...selectedJob, isPinned: !selectedJob.isPinned, updatedAt: now });
    }
  };

  const handleDeleteJob = (id: string) => {
    const target = jobs.find((j) => j.id === id);
    if (confirm(`Delete application for ${target?.jobTitle || "this job"}?`)) {
      const updated = jobs.filter((j) => j.id !== id);
      persistJobs(updated);
      showToast("Application deleted");
      if (selectedJob && selectedJob.id === id) {
        setSelectedJob(null);
      }
    }
  };

  const handleExportCSV = () => {
    if (jobs.length === 0) {
      showToast("No jobs to export");
      return;
    }

    const headers = [
      "Job Title",
      "Company",
      "Status",
      "Match",
      "Applied On",
      "Date Applied",
      "Workplace Type",
      "Salary",
      "Job URL",
      "Description",
    ];

    const rows = jobs.map((j) => [
      `"${j.jobTitle.replace(/"/g, '""')}"`,
      `"${j.company.replace(/"/g, '""')}"`,
      `"${j.status}"`,
      `"${j.match || "good"}"`,
      `"${j.appliedOn}"`,
      `"${j.dateApplied}"`,
      `"${j.workplaceType}"`,
      `"${j.salary || ""}"`,
      `"${j.jobUrl || ""}"`,
      `"${(j.description || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `job_applications.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredJobs = useMemo(() => {
    return jobs
      .filter((job) => {
        if (statusFilter !== "all" && job.status !== statusFilter) return false;
        if (platformFilter !== "all" && job.appliedOn !== platformFilter) return false;
        if (workplaceFilter !== "all" && job.workplaceType !== workplaceFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = job.jobTitle.toLowerCase().includes(q);
          const matchCompany = job.company.toLowerCase().includes(q);
          const matchDesc = (job.description || "").toLowerCase().includes(q);
          const matchPlatform = job.appliedOn.toLowerCase().includes(q);
          if (!matchTitle && !matchCompany && !matchDesc && !matchPlatform) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "date-desc") {
          return new Date(b.dateApplied).getTime() - new Date(a.dateApplied).getTime();
        }
        if (sortBy === "date-asc") {
          return new Date(a.dateApplied).getTime() - new Date(b.dateApplied).getTime();
        }
        if (sortBy === "company-asc") {
          return a.company.localeCompare(b.company);
        }
        if (sortBy === "title-asc") {
          return a.jobTitle.localeCompare(b.jobTitle);
        }
        return 0;
      });
  }, [jobs, searchQuery, statusFilter, platformFilter, workplaceFilter, sortBy]);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <Sidebar userEmail={userEmail} />

      <main className="pl-60 min-h-screen flex flex-col">
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-zinc-800 flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-bottom-5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        <div className="flex-1 p-8 lg:p-10 max-w-7xl mx-auto w-full space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
                Job Tracker
              </h1>
              <div className="flex items-center gap-3 text-xs text-zinc-500 mt-1">
                <span>
                  {jobs.length} {jobs.length === 1 ? "application" : "applications"}
                </span>
                <span className="text-zinc-300">•</span>
                <div className="flex items-center gap-2.5 text-[11px]">
                  <span className="flex items-center gap-1 font-medium text-zinc-600">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> Good Match
                  </span>
                  <span className="flex items-center gap-1 font-medium text-zinc-600">
                    <Star className="w-3.5 h-3.5 text-amber-400 stroke-[2]" /> Mid Match
                  </span>
                  <span className="flex items-center gap-1 font-medium text-zinc-600">
                    <Star className="w-3.5 h-3.5 text-zinc-400 stroke-[2]" /> Far Match
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {jobs.length > 0 && (
                <button
                  onClick={handleExportCSV}
                  className="px-3.5 py-2 rounded-full bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-700 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-zinc-500" />
                  Export
                </button>
              )}

              <button
                onClick={() => {
                  setEditingJob(null);
                  setIsModalOpen(true);
                }}
                className="px-4 py-2 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Add Job
              </button>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="bg-white p-3 rounded-2xl border border-zinc-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by title, company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-1.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-medium text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as JobStatus | "all")}
                className="px-3 py-1.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-semibold text-zinc-700 focus:border-zinc-400 cursor-pointer"
              >
                <option value="all">All Statuses</option>
                {Object.entries(JOB_STATUS_CONFIG).map(([key, val]) => (
                  <option key={key} value={key}>
                    {val.label}
                  </option>
                ))}
              </select>

              <select
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-semibold text-zinc-700 focus:border-zinc-400 cursor-pointer"
              >
                <option value="all">All Platforms</option>
                {PLATFORM_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>

              <select
                value={workplaceFilter}
                onChange={(e) => setWorkplaceFilter(e.target.value as WorkplaceType | "all")}
                className="px-3 py-1.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-semibold text-zinc-700 focus:border-zinc-400 cursor-pointer"
              >
                <option value="all">All Workplaces</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-3 py-1.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-semibold text-zinc-700 focus:border-zinc-400 cursor-pointer"
              >
                <option value="date-desc">Newest</option>
                <option value="date-asc">Oldest</option>
                <option value="company-asc">Company (A-Z)</option>
                <option value="title-asc">Role (A-Z)</option>
              </select>

              {/* View Switcher */}
              <div className="flex items-center p-0.5 rounded-xl bg-zinc-100 border border-zinc-200 ml-1">
                <button
                  onClick={() => setViewMode("table")}
                  title="Table View"
                  className={`p-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    viewMode === "table"
                      ? "bg-white text-zinc-900 shadow-xs"
                      : "text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode("kanban")}
                  title="Board View"
                  className={`p-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    viewMode === "kanban"
                      ? "bg-white text-zinc-900 shadow-xs"
                      : "text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          {viewMode === "table" ? (
            <JobTable
              jobs={filteredJobs}
              onSelectJob={(job) => setSelectedJob(job)}
              onEditJob={(job) => {
                setEditingJob(job);
                setIsModalOpen(true);
              }}
              onDeleteJob={handleDeleteJob}
              onStatusChange={handleStatusChange}
              onTogglePin={handleTogglePin}
              onAddNew={() => {
                setEditingJob(null);
                setIsModalOpen(true);
              }}
            />
          ) : (
            <JobKanban
              jobs={filteredJobs}
              onSelectJob={(job) => setSelectedJob(job)}
              onEditJob={(job) => {
                setEditingJob(job);
                setIsModalOpen(true);
              }}
              onDeleteJob={handleDeleteJob}
              onStatusChange={handleStatusChange}
            />
          )}
        </div>
      </main>

      {/* Add / Edit Modal */}
      <JobModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingJob(null);
        }}
        onSave={handleSaveJob}
        initialJob={editingJob}
      />

      {/* Detail Drawer */}
      <JobDetailDrawer
        isOpen={!!selectedJob}
        job={selectedJob}
        onClose={() => setSelectedJob(null)}
        onEdit={(job) => {
          setSelectedJob(null);
          setEditingJob(job);
          setIsModalOpen(true);
        }}
        onDelete={(id) => {
          handleDeleteJob(id);
        }}
        onStatusChange={handleStatusChange}
        onTogglePin={handleTogglePin}
      />
    </div>
  );
}
