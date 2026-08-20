"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Navbar } from "@/components/layout/navbar";
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  CheckCircle2,
  X,
  FileSpreadsheet,
  Star,
  Globe,
  Building2,
  Building,
  Laptop,
  Calendar,
  ArrowUpDown,
  Filter,
  Briefcase,
} from "lucide-react";
import {
  JobApplication,
  JobStatus,
  WorkplaceType,
  JOB_STATUS_CONFIG,
  PLATFORM_OPTIONS,
} from "@/types/job";
import {
  createJobAction,
  updateJobAction,
  deleteJobAction,
  updateJobStatusAction,
  togglePinJobAction,
} from "@/lib/actions/jobs";
import { JobTable } from "./job-table";
import { JobKanban } from "./job-kanban";
import { JobModal } from "./job-modal";
import { JobDetailDrawer } from "./job-detail-drawer";
import { CustomSelect, CustomSelectOption } from "./custom-select";
import { StatusIcon } from "./status-dropdown";

type SortOption = "date-desc" | "date-asc" | "company-asc" | "title-asc";

interface JobDashboardProps {
  userEmail?: string;
  initialJobs?: JobApplication[];
}

export function JobDashboard({ userEmail, initialJobs = [] }: JobDashboardProps) {
  const [jobs, setJobs] = useState<JobApplication[]>(initialJobs);

  useEffect(() => {
    setJobs(initialJobs);
  }, [initialJobs]);

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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleSaveJob = async (
    jobData: Omit<JobApplication, "id" | "createdAt" | "updatedAt"> & { id?: string }
  ) => {
    const now = new Date().toISOString();
    if (jobData.id) {
      const prevJobs = [...jobs];
      const updated = jobs.map((j) =>
        j.id === jobData.id
          ? {
              ...j,
              ...jobData,
              updatedAt: now,
            }
          : j
      );
      setJobs(updated);
      showToast(`Updated ${jobData.jobTitle}`);
      if (selectedJob && selectedJob.id === jobData.id) {
        setSelectedJob({ ...selectedJob, ...jobData, updatedAt: now } as JobApplication);
      }

      const res = await updateJobAction(jobData.id, jobData);
      if (!res.success) {
        setJobs(prevJobs);
        showToast(res.error || "Failed to update application");
      } else if (res.data) {
        setJobs((curr) => curr.map((j) => (j.id === res.data!.id ? res.data! : j)));
      }
    } else {
      const tempId = `temp-${Date.now()}`;
      const tempJob: JobApplication = {
        ...jobData,
        id: tempId,
        createdAt: now,
        updatedAt: now,
      };
      setJobs((prev) => [tempJob, ...prev]);
      showToast(`Added ${jobData.jobTitle}`);

      const res = await createJobAction(jobData);
      if (!res.success) {
        setJobs((curr) => curr.filter((j) => j.id !== tempId));
        showToast(res.error || "Failed to save application");
      } else if (res.data) {
        setJobs((curr) => curr.map((j) => (j.id === tempId ? res.data! : j)));
      }
    }
  };

  const handleStatusChange = async (id: string, newStatus: JobStatus) => {
    const now = new Date().toISOString();
    const prevJobs = [...jobs];
    const updated = jobs.map((j) => (j.id === id ? { ...j, status: newStatus, updatedAt: now } : j));
    setJobs(updated);
    if (selectedJob && selectedJob.id === id) {
      setSelectedJob({ ...selectedJob, status: newStatus, updatedAt: now });
    }

    const res = await updateJobStatusAction(id, newStatus);
    if (!res.success) {
      setJobs(prevJobs);
      showToast(res.error || "Failed to update status");
    }
  };

  const handleTogglePin = async (id: string) => {
    const target = jobs.find((j) => j.id === id);
    if (!target) return;
    const nextPin = !target.isPinned;
    const now = new Date().toISOString();
    const prevJobs = [...jobs];
    const updated = jobs.map((j) => (j.id === id ? { ...j, isPinned: nextPin, updatedAt: now } : j));
    setJobs(updated);
    showToast(nextPin ? `Pinned ${target.jobTitle}` : `Unpinned ${target.jobTitle}`);
    if (selectedJob && selectedJob.id === id) {
      setSelectedJob({ ...selectedJob, isPinned: nextPin, updatedAt: now });
    }

    const res = await togglePinJobAction(id, nextPin);
    if (!res.success) {
      setJobs(prevJobs);
      showToast(res.error || "Failed to update pin");
    }
  };

  const handleDeleteJob = async (id: string) => {
    const target = jobs.find((j) => j.id === id);
    if (confirm(`Delete application for ${target?.jobTitle || "this job"}?`)) {
      const prevJobs = [...jobs];
      const updated = jobs.filter((j) => j.id !== id);
      setJobs(updated);
      showToast("Application deleted");
      if (selectedJob && selectedJob.id === id) {
        setSelectedJob(null);
      }

      const res = await deleteJobAction(id);
      if (!res.success) {
        setJobs(prevJobs);
        showToast(res.error || "Failed to delete application");
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
      "Contact URL",
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
      `"${j.contactUrl || ""}"`,
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

  // Options for custom filter selectors
  const statusOptions: CustomSelectOption<JobStatus | "all">[] = [
    {
      value: "all",
      label: "All Statuses",
      icon: <Filter className="w-3.5 h-3.5 text-zinc-400" />,
    },
    ...(Object.keys(JOB_STATUS_CONFIG) as JobStatus[]).map((st) => ({
      value: st,
      label: JOB_STATUS_CONFIG[st].label,
      icon: <StatusIcon status={st} className="w-3.5 h-3.5" />,
    })),
  ];

  const platformOptions: CustomSelectOption<string>[] = [
    {
      value: "all",
      label: "All Platforms",
      icon: <Globe className="w-3.5 h-3.5 text-zinc-400" />,
    },
    ...PLATFORM_OPTIONS.map((plat) => ({
      value: plat,
      label: plat,
      icon: <Globe className="w-3.5 h-3.5 text-zinc-400" />,
    })),
  ];

  const workplaceOptions: CustomSelectOption<WorkplaceType | "all">[] = [
    {
      value: "all",
      label: "All Workplaces",
      icon: <Briefcase className="w-3.5 h-3.5 text-zinc-400" />,
    },
    {
      value: "Remote",
      label: "Remote",
      icon: <Laptop className="w-3.5 h-3.5 text-emerald-600" />,
    },
    {
      value: "Hybrid",
      label: "Hybrid",
      icon: <Building2 className="w-3.5 h-3.5 text-blue-600" />,
    },
    {
      value: "On-site",
      label: "On-site",
      icon: <Building className="w-3.5 h-3.5 text-purple-600" />,
    },
  ];

  const sortOptions: CustomSelectOption<SortOption>[] = [
    {
      value: "date-desc",
      label: "Newest First",
      icon: <Calendar className="w-3.5 h-3.5 text-zinc-400" />,
    },
    {
      value: "date-asc",
      label: "Oldest First",
      icon: <Calendar className="w-3.5 h-3.5 text-zinc-400" />,
    },
    {
      value: "company-asc",
      label: "Company (A-Z)",
      icon: <Building2 className="w-3.5 h-3.5 text-zinc-400" />,
    },
    {
      value: "title-asc",
      label: "Role (A-Z)",
      icon: <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" />,
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col">
      <Navbar userEmail={userEmail} />

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-zinc-800 flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
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
                  className="px-3.5 py-2 rounded-xl bg-white border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 text-zinc-700 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
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
                className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
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

            {/* Custom Filter Selectors with Icons */}
            <div className="flex flex-wrap items-center gap-2">
              <CustomSelect<JobStatus | "all">
                value={statusFilter}
                onChange={(val) => setStatusFilter(val)}
                options={statusOptions}
                width="170px"
              />

              <CustomSelect<string>
                value={platformFilter}
                onChange={(val) => setPlatformFilter(val)}
                options={platformOptions}
                width="170px"
              />

              <CustomSelect<WorkplaceType | "all">
                value={workplaceFilter}
                onChange={(val) => setWorkplaceFilter(val)}
                options={workplaceOptions}
                width="160px"
              />

              <CustomSelect<SortOption>
                value={sortBy}
                onChange={(val) => setSortBy(val)}
                options={sortOptions}
                width="160px"
              />

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
