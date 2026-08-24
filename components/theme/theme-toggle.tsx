"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "./theme-provider";
import { Sun, Moon } from "lucide-react";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/90 dark:border-zinc-700/80 shrink-0 ${className}`} />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      className={`w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200/70 dark:hover:bg-zinc-700/80 border border-zinc-200/90 dark:border-zinc-700/80 text-zinc-700 dark:text-zinc-200 flex items-center justify-center transition cursor-pointer select-none shadow-2xs active:scale-95 ${className}`}
    >
      {isDark ? (
        <Moon className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400/20" />
      ) : (
        <Sun className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
      )}
    </button>
  );
}
