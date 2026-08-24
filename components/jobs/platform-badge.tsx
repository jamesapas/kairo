"use client";

import React from "react";
import { Icon } from "@iconify/react";
import clsx from "clsx";

export interface PlatformConfig {
  label: string;
  icon: string;
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
    icon: "arcticons:jobstreet",
    textColor: "text-[#1C3F94]",
    bgColor: "bg-[#1C3F94]/10",
    borderColor: "border-[#1C3F94]/20",
  },
  "Company Website": {
    label: "Company Website",
    icon: "lucide:globe",
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
  return (
    <Icon
      icon={config.icon}
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
