import React from "react";

interface LogoProps {
  className?: string;
  iconClassName?: string;
}

export function KairoLogo({
  className = "w-8 h-8",
  iconClassName = "w-4 h-4",
}: LogoProps) {
  return (
    <div
      className={`rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white shadow-sm shrink-0 select-none ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={iconClassName}
      >
        <path d="M5 4v16" />
        <path d="M5 12l11-8" />
        <path d="M9.5 9l8.5 11" />
      </svg>
    </div>
  );
}
