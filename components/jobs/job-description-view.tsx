"use client";

import React, { useMemo } from "react";
import {
  isHtmlContent,
  plainTextToRichHtml,
  sanitizePastedHtml,
} from "@/lib/utils/job-description";

interface JobDescriptionViewProps {
  description?: string | null;
  className?: string;
}

export function JobDescriptionView({
  description,
  className = "",
}: JobDescriptionViewProps) {
  const formattedHtml = useMemo(() => {
    if (!description || !description.trim()) return "";

    if (isHtmlContent(description)) {
      return sanitizePastedHtml(description);
    }

    // Legacy or plain text: automatically format bullets, lists, and headers
    return plainTextToRichHtml(description);
  }, [description]);

  if (!formattedHtml) {
    return null;
  }

  return (
    <div
      className={`job-rich-content text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-normal selection:bg-zinc-200 dark:selection:bg-zinc-700 ${className}`}
      dangerouslySetInnerHTML={{ __html: formattedHtml }}
    />
  );
}
