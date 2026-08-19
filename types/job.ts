export type JobStatus =
  | "applied"
  | "interviewing"
  | "offer"
  | "no_response"
  | "rejected"
  | "withdrawn";

export type WorkplaceType = "Remote" | "Hybrid" | "On-site";
export type JobMatch = "good" | "mid" | "far";

export interface JobApplication {
  id: string;
  jobTitle: string;
  company: string;
  description: string;
  appliedOn: string;
  jobUrl?: string;
  dateApplied: string; // YYYY-MM-DD
  status: JobStatus;
  workplaceType: WorkplaceType;
  salary?: string;
  match: JobMatch;
  isPinned?: boolean;
  createdAt: string;
  updatedAt: string;
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

export const MATCH_CONFIG: Record<
  JobMatch,
  { label: string; iconType: "star" | "star-outline" | "star-gray"; bg: string; text: string; border: string }
> = {
  good: {
    label: "Good Match",
    iconType: "star",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  mid: {
    label: "Mid Match",
    iconType: "star-outline",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  far: {
    label: "Far Match",
    iconType: "star-gray",
    bg: "bg-zinc-100",
    text: "text-zinc-600",
    border: "border-zinc-200",
  },
};

export const PLATFORM_OPTIONS = [
  "LinkedIn",
  "Indeed",
  "Company Website",
  "Wellfound",
  "Glassdoor",
  "Referral",
  "JobStreet",
  "Other",
];

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
    salary: "$165,000 - $190,000",
    match: "good",
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
    salary: "$170,000 - $200,000",
    match: "good",
    isPinned: false,
    createdAt: "2026-08-18T10:30:00.000Z",
    updatedAt: "2026-08-18T10:30:00.000Z",
  },
  {
    id: "job-3",
    jobTitle: "UI/UX Developer",
    company: "Stripe",
    description: "Craft world-class dashboard interfaces and design system component primitives.",
    appliedOn: "Referral",
    jobUrl: "https://stripe.com/jobs",
    dateApplied: "2026-08-01",
    status: "offer",
    workplaceType: "Hybrid",
    salary: "$180,000 - $210,000",
    match: "mid",
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
    salary: "$150,000 - $175,000",
    match: "far",
    isPinned: false,
    createdAt: "2026-07-20T10:00:00.000Z",
    updatedAt: "2026-07-28T12:00:00.000Z",
  },
];
