"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
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
  JobApplicationRow,
  JobStatus,
  WorkplaceType,
  JOB_STATUS_CONFIG,
  PLATFORM_OPTIONS,
  mapRowToJob,
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
import { CustomSelect, CustomSelectOption } from "./custom-select";
import { StatusIcon } from "./status-dropdown";
import { PlatformIcon } from "./platform-badge";
import { JobStatsOverview } from "./job-stats-overview";
import { StreakModal } from "./streak-modal";
import { DashboardHeader } from "./dashboard-header";

type SortOption = "date-desc" | "date-asc" | "company-asc" | "title-asc";

interface JobDashboardProps {
  userEmail?: string;
  initialJobs?: JobApplication[];
}

export function JobDashboard({ userEmail: initialUserEmail, initialJobs }: JobDashboardProps = {}) {
  const router = useRouter();
  const [jobs, setJobs] = useState<JobApplication[]>(initialJobs || []);
  const [userEmail, setUserEmail] = useState<string | undefined>(initialUserEmail);
  const [userName, setUserName] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(!initialJobs || initialJobs.length === 0);
  const fetchedRef = useRef(false);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        if (user.email && !userEmail) {
          setUserEmail(user.email);
        }
        supabase
          .from("users")
          .select("name")
          .eq("id", user.id)
          .maybeSingle()
          .then(({ data }) => {
            if (data?.name) {
              setUserName(data.name);
            }
          });
      }
    });

    if (initialJobs && initialJobs.length > 0) {
      setJobs(initialJobs);
      setIsLoading(false);
      return;
    }

    if (fetchedRef.current) return;
    fetchedRef.current = true;

    async function fetchJobs() {
      const { data, error } = await supabase
        .from("job_applications")
        .select("*")
        .order("is_pinned", { ascending: false })
        .order("date_applied", { ascending: false })
        .order("created_at", { ascending: false });

      if (!error && data) {
        setJobs((data as JobApplicationRow[]).map(mapRowToJob));
      }
      setIsLoading(false);
    }

    fetchJobs();
  }, [initialJobs, userEmail]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<JobStatus | "all">("all");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [workplaceFilter, setWorkplaceFilter] = useState<WorkplaceType | "all">("all");
  const [sortBy, setSortBy] = useState<SortOption>("date-desc");
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");
  const [weekOnlyFilter, setWeekOnlyFilter] = useState(false);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStreakModalOpen, setIsStreakModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobApplication | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleSelectJob = (job: JobApplication) => {
    router.push(`/jobs/${job.id}`);
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
    // Current week boundary
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diffToMonday = (dayOfWeek + 6) % 7;
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - diffToMonday);
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfWeekStr = startOfWeek.toISOString().split("T")[0];

    return jobs
      .filter((job) => {
        if (weekOnlyFilter && job.dateApplied < startOfWeekStr) return false;
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
      icon: <PlatformIcon platform={plat} className="w-3.5 h-3.5" />,
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
    <>
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2.5 rounded-2xl shadow-xl border border-zinc-800 dark:border-zinc-200 flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="flex-1 max-w-[1536px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Executive Workspace Header */}
        <div className="space-y-4">
          <DashboardHeader
            jobs={jobs}
            userEmail={userEmail}
            userName={userName}
            onAddNew={() => {
              setEditingJob(null);
              setIsModalOpen(true);
            }}
            onExportCSV={handleExportCSV}
            onOpenStreakModal={() => setIsStreakModalOpen(true)}
          />

          {/* Stats Overview Metric Cards */}
          <JobStatsOverview
            jobs={jobs}
            isLoading={isLoading}
            onOpenStreakModal={() => setIsStreakModalOpen(true)}
            onFilterThisWeek={() => setWeekOnlyFilter((prev) => !prev)}
            onFilterInterviewing={() =>
              setStatusFilter((curr) =>
                curr === "interviewing" ? "all" : "interviewing"
              )
            }
          />
        </div>

        {/* Command Bar / Filter System */}
        <div className="bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="flex flex-1 items-center gap-2 min-w-[220px]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by role, company, platform..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-1.5 rounded-xl bg-zinc-50/80 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:bg-white dark:focus:bg-zinc-800 focus:border-zinc-400 dark:focus:border-zinc-600 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {weekOnlyFilter && (
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/70 text-blue-800 dark:text-blue-300 text-xs font-semibold shrink-0">
                <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>This Week</span>
                <button
                  onClick={() => setWeekOnlyFilter(false)}
                  className="hover:bg-blue-200/60 dark:hover:bg-blue-900/60 p-0.5 rounded-full text-blue-700 dark:text-blue-300 ml-0.5 cursor-pointer"
                  title="Clear filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
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

            {/* View Switcher: Table / Board */}
            <div className="flex items-center p-0.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 ml-0.5">
              <button
                onClick={() => setViewMode("table")}
                title="Table View"
                className={`p-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  viewMode === "table"
                    ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-2xs"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode("kanban")}
                title="Board View"
                className={`p-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  viewMode === "kanban"
                    ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-2xs"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
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
            isLoading={isLoading}
            onSelectJob={handleSelectJob}
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
            isLoading={isLoading}
            onSelectJob={handleSelectJob}
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

      {/* Streak History & Activity Modal */}
      <StreakModal
        isOpen={isStreakModalOpen}
        onClose={() => setIsStreakModalOpen(false)}
        jobs={jobs}
        onSelectJob={handleSelectJob}
      />
    </>
  );
}
