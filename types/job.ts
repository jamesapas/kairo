import { JobMatchAnalysis } from "./ai-match";

export type JobStatus =
  | "applied"
  | "interviewing"
  | "offer"
  | "declined"
  | "no_response"
  | "rejected"
  | "withdrawn";

export type WorkplaceType = "Remote" | "Hybrid" | "On-site";

export interface JobApplication {
  id: string;
  userId?: string;
  jobTitle: string;
  company: string;
  description: string;
  appliedOn: string;
  jobUrl?: string;
  contactUrl?: string;
  dateApplied: string; // YYYY-MM-DD
  status: JobStatus;
  workplaceType: WorkplaceType;
  salary?: string;
  isPinned?: boolean;
  aiMatchAnalysis?: JobMatchAnalysis | null;
  createdAt: string;
  updatedAt: string;
}

export interface JobApplicationRow {
  id: string;
  user_id: string;
  job_title: string;
  company: string;
  description: string | null;
  applied_on: string | null;
  job_url: string | null;
  contact_url: string | null;
  date_applied: string;
  status: string;
  workplace_type: string;
  salary: string | null;
  is_pinned: boolean;
  ai_match_analysis?: JobMatchAnalysis | null;
  created_at: string;
  updated_at: string;
}

export function mapRowToJob(row: JobApplicationRow): JobApplication {
  return {
    id: row.id,
    userId: row.user_id,
    jobTitle: row.job_title,
    company: row.company,
    description: row.description || "",
    appliedOn: row.applied_on || "LinkedIn",
    jobUrl: row.job_url || "",
    contactUrl: row.contact_url || "",
    dateApplied: row.date_applied,
    status: (row.status as JobStatus) || "applied",
    workplaceType: (row.workplace_type as WorkplaceType) || "Remote",
    salary: row.salary || "",
    isPinned: Boolean(row.is_pinned),
    aiMatchAnalysis: row.ai_match_analysis || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const JOB_STATUS_CONFIG: Record<
  JobStatus,
  { label: string; iconColor: string; dot: string }
> = {
  applied: {
    label: "Applied",
    iconColor: "text-blue-500",
    dot: "bg-blue-500",
  },
  interviewing: {
    label: "Interviewing",
    iconColor: "text-purple-500",
    dot: "bg-purple-500",
  },
  offer: {
    label: "Offer",
    iconColor: "text-emerald-500",
    dot: "bg-emerald-500",
  },
  declined: {
    label: "Declined",
    iconColor: "text-stone-500",
    dot: "bg-stone-500",
  },
  no_response: {
    label: "No Response",
    iconColor: "text-amber-500",
    dot: "bg-amber-500",
  },
  rejected: {
    label: "Rejected",
    iconColor: "text-rose-500",
    dot: "bg-rose-500",
  },
  withdrawn: {
    label: "Withdrawn",
    iconColor: "text-zinc-400",
    dot: "bg-zinc-400",
  },
};

export const PLATFORM_OPTIONS = [
  "LinkedIn",
  "Indeed",
  "JobStreet",
  "Company Website",
] as const;

export type PlatformOption = (typeof PLATFORM_OPTIONS)[number];

export function formatRelativeDate(dateStr: string): string {
  if (!dateStr) return "—";
  try {
    const applied = new Date(dateStr + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - applied.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "Upcoming";
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "1d ago";
    if (diffDays < 7) return `${diffDays}d ago`;

    const diffWeeks = Math.floor(diffDays / 7);
    if (diffWeeks < 4) return `${diffWeeks}w ago`;

    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) return `${diffMonths}mo ago`;

    const diffYears = Math.floor(diffDays / 365);
    return `${diffYears}y ago`;
  } catch {
    return dateStr;
  }
}

export function formatDateWords(
  dateStr?: string | null,
  options: { shortMonth?: boolean } = { shortMonth: false }
): string {
  if (!dateStr) return "—";
  try {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString("en-US", {
          month: options.shortMonth ? "short" : "long",
          day: "numeric",
          year: "numeric",
        });
      }
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString("en-US", {
        month: options.shortMonth ? "short" : "long",
        day: "numeric",
        year: "numeric",
      });
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

export function formatSalaryDisplay(salary?: string | null): string {
  if (!salary || !salary.trim()) return "";
  return salary.replace(/[\d,]+/g, (match) => {
    const raw = match.replace(/,/g, "");
    if (!raw || isNaN(Number(raw))) return match;
    return Number(raw).toLocaleString("en-US");
  });
}

export const INITIAL_SAMPLE_JOBS: JobApplication[] = [
  {
    id: "job-1",
    jobTitle: "Senior Frontend Engineer",
    company: "Linear",
    description: "Lead product UI and build high performance web application interfaces with React and Next.js.",
    appliedOn: "Company Website",
    jobUrl: "https://linear.app/careers",
    dateApplied: "2026-08-14",
    status: "interviewing",
    workplaceType: "Remote",
    salary: "₱120,000 - 150,000/mo",
    isPinned: true,
    createdAt: "2026-08-14T09:00:00.000Z",
    updatedAt: "2026-08-18T14:30:00.000Z",
  },
  {
    id: "job-2",
    jobTitle: "Fullstack AI Engineer",
    company: "Vercel",
    description: "Develop AI SDK integrations and edge computing platform capabilities.",
    appliedOn: "LinkedIn",
    jobUrl: "https://vercel.com/careers",
    dateApplied: "2026-08-18",
    status: "applied",
    workplaceType: "Remote",
    salary: "₱140,000 - 180,000/mo",
    isPinned: false,
    createdAt: "2026-08-18T10:30:00.000Z",
    updatedAt: "2026-08-18T10:30:00.000Z",
  },
  {
    id: "job-3",
    jobTitle: "UI/UX Developer",
    company: "Stripe",
    description: "Craft world-class dashboard interfaces and design system component primitives.",
    appliedOn: "JobStreet",
    jobUrl: "https://stripe.com/jobs",
    dateApplied: "2026-08-01",
    status: "offer",
    workplaceType: "Hybrid",
    salary: "₱95,000 - 125,000/mo",
    isPinned: false,
    createdAt: "2026-08-01T08:15:00.000Z",
    updatedAt: "2026-08-19T11:00:00.000Z",
  },
  {
    id: "job-4",
    jobTitle: "Senior Web Developer",
    company: "Airbnb",
    description: "Work on internal tools and design token infrastructure.",
    appliedOn: "Indeed",
    jobUrl: "https://airbnb.com/careers",
    dateApplied: "2026-07-20",
    status: "rejected",
    workplaceType: "Remote",
    salary: "₱85,000 - 110,000/mo",
    isPinned: false,
    createdAt: "2026-07-20T10:00:00.000Z",
    updatedAt: "2026-07-28T12:00:00.000Z",
  },
];
