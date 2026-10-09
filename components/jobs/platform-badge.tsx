"use client";

import { Icon } from "@iconify/react";
import clsx from "clsx";

export interface PlatformConfig {
  label: string;
  icon?: string;
  imageSrc?: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
}

export const PLATFORM_CONFIG: Record<string, PlatformConfig> = {
  LinkedIn: {
    label: "LinkedIn",
    icon: "simple-icons:linkedin",
    textColor: "text-[#0A66C2]",
    bgColor: "bg-[#0A66C2]/10",
    borderColor: "border-[#0A66C2]/20",
  },
  Indeed: {
    label: "Indeed",
    icon: "simple-icons:indeed",
    textColor: "text-[#003A9B]",
    bgColor: "bg-[#003A9B]/10",
    borderColor: "border-[#003A9B]/20",
  },
  JobStreet: {
    label: "JobStreet",
    imageSrc: "/platforms/jobstreet.png",
    textColor: "text-[#1C3F94]",
    bgColor: "bg-[#1C3F94]/10",
    borderColor: "border-[#1C3F94]/20",
  },
  Mynimo: {
    label: "Mynimo",
    imageSrc: "/platforms/mynimo.png",
    textColor: "text-amber-700",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
  },
  Jobslin: {
    label: "Jobslin",
    imageSrc: "/platforms/jobslin.png",
    textColor: "text-cyan-700",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/20",
  },
  "OnlineJobs.ph": {
    label: "OnlineJobs.ph",
    imageSrc: "/platforms/onlinejobs.png",
    textColor: "text-blue-700",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
  },
  Upwork: {
    label: "Upwork",
    imageSrc: "/platforms/upwork.png",
    textColor: "text-green-700",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/20",
  },
  "Company Website": {
    label: "Company Website",
    icon: "lucide:globe",
    textColor: "text-zinc-700",
    bgColor: "bg-zinc-100",
    borderColor: "border-zinc-200",
  },
  Others: {
    label: "Others",
    icon: "ri-question-line",
    textColor: "text-zinc-700",
    bgColor: "bg-zinc-100",
    borderColor: "border-zinc-200",
  },
};

export function getPlatformConfig(platform?: string): PlatformConfig {
  if (!platform) return PLATFORM_CONFIG["Company Website"];

  const lower = platform.toLowerCase().trim();
  if (lower.includes("linkedin")) return PLATFORM_CONFIG.LinkedIn;
  if (lower.includes("indeed")) return PLATFORM_CONFIG.Indeed;
  if (lower.includes("jobstreet") || lower.includes("job street")) return PLATFORM_CONFIG.JobStreet;
  if (lower.includes("mynimo")) return PLATFORM_CONFIG.Mynimo;
  if (lower.includes("jobslin")) return PLATFORM_CONFIG.Jobslin;
  if (lower.includes("onlinejobs.ph")) return PLATFORM_CONFIG["OnlineJobs.ph"];
  if (lower.includes("upwork")) return PLATFORM_CONFIG.Upwork;
  if (lower.includes("others")) return PLATFORM_CONFIG.Others;
  if (lower.includes("company") || lower.includes("website") || lower.includes("site"))
    return PLATFORM_CONFIG["Company Website"];

  return {
    label: platform,
    icon: "lucide:globe",
    textColor: "text-zinc-700",
    bgColor: "bg-zinc-100",
    borderColor: "border-zinc-200",
  };
}

export function PlatformIcon({
  platform,
  className = "w-3.5 h-3.5",
}: {
  platform?: string;
  className?: string;
}) {
  const config = getPlatformConfig(platform);

  if (config.imageSrc) {
    return (
      <img
        src={config.imageSrc}
        alt={config.label}
        className={clsx(className, "shrink-0 inline-block object-contain")}
      />
    );
  }

  return (
    <Icon
      icon={config.icon || "lucide:globe"}
      className={clsx(className, config.textColor, "shrink-0 inline-block")}
    />
  );
}

export function PlatformBadge({
  platform,
  className,
  showIcon = true,
}: {
  platform?: string;
  className?: string;
  showIcon?: boolean;
}) {
  const config = getPlatformConfig(platform);

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border select-none transition-colors",
        config.bgColor,
        config.textColor,
        config.borderColor,
        className
      )}
    >
      {showIcon && (
        <PlatformIcon platform={platform} className="w-3.5 h-3.5 shrink-0" />
      )}
      <span className="truncate">{config.label}</span>
    </span>
  );
}
