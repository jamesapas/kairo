"use client";

import React from "react";
import { Loader2 } from "lucide-react";

interface FullscreenLoaderProps {
  title?: string;
  subtitle?: string;
}

export function FullscreenLoader({
  title = "Loading...",
}: FullscreenLoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/40 backdrop-blur-xs animate-fade-in select-none"
    >
      <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg animate-modal">
        <Loader2 className="w-4 h-4 animate-spin text-zinc-700 dark:text-zinc-300" />
        <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
          {title}
        </span>
      </div>
    </div>
  );
}
