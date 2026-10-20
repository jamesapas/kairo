"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Bookmark,
  Send,
  CalendarCheck,
  BadgeCheck,
  CircleSlash,
  Hourglass,
  XCircle,
  Undo2,
  ChevronDown,
  Check,
} from "lucide-react";
import { JobStatus, JOB_STATUS_CONFIG } from "@/types/job";

interface StatusDropdownProps {
  value: JobStatus;
  onChange: (newStatus: JobStatus) => void;
  className?: string;
  buttonClassName?: string;
  size?: "sm" | "md";
}

export function StatusIcon({
  status,
  className = "w-3.5 h-3.5",
}: {
  status: JobStatus;
  className?: string;
}) {
  switch (status) {
    case "saved":
      return <Bookmark className={`${className} text-slate-500 shrink-0`} />;
    case "applied":
      return <Send className={`${className} text-blue-600 shrink-0`} />;
    case "interviewing":
      return <CalendarCheck className={`${className} text-purple-600 shrink-0`} />;
    case "offer":
      return <BadgeCheck className={`${className} text-emerald-600 shrink-0`} />;
    case "declined":
      return <CircleSlash className={`${className} text-stone-500 shrink-0`} />;
    case "no_response":
      return <Hourglass className={`${className} text-amber-500 shrink-0`} />;
    case "rejected":
      return <XCircle className={`${className} text-rose-500 shrink-0`} />;
    case "withdrawn":
      return <Undo2 className={`${className} text-zinc-400 shrink-0`} />;
    default:
      return <Bookmark className={`${className} text-slate-500 shrink-0`} />;
  }
}

export function StatusDropdown({
  value,
  onChange,
  className = "",
  buttonClassName = "",
  size = "sm",
}: StatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; width?: number }>({
    top: 0,
    left: 0,
  });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const updateCoords = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) {
        setIsOpen(false);
        return;
      }

      const dropdownHeight = 265;
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUpward = spaceBelow < dropdownHeight && rect.top > dropdownHeight;
      const targetWidth = size === "md" ? rect.width : 180;
      const left = Math.max(8, Math.min(rect.left, window.innerWidth - targetWidth - 8));

      setCoords({
        top: openUpward ? Math.max(8, rect.top - dropdownHeight - 6) : rect.bottom + 6,
        left,
        width: size === "md" ? rect.width : undefined,
      });
    }
  }, [size]);

  useEffect(() => {
    if (!isOpen) return;

    updateCoords();

    const handleScroll = (event: Event) => {
      if (
        dropdownRef.current &&
        (dropdownRef.current === event.target ||
          dropdownRef.current.contains(event.target as Node))
      ) {
        return;
      }
      updateCoords();
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        setIsOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", updateCoords);
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", updateCoords);
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, updateCoords]);

  const currentConfig = JOB_STATUS_CONFIG[value] || JOB_STATUS_CONFIG.applied;
  const statuses = Object.keys(JOB_STATUS_CONFIG) as JobStatus[];

  return (
    <div className={`${className.includes("w-full") ? "w-full" : "inline-block"} ${className}`}>
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`cursor-pointer select-none ${
          size === "sm"
            ? "inline-flex items-center gap-1.5 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200/90 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 shadow-2xs hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-700 px-2.5 py-1 text-xs font-semibold"
            : "flex w-full items-center justify-between px-3.5 py-2 text-xs font-semibold rounded-xl bg-zinc-50/80 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 shadow-2xs hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-100/80 dark:hover:bg-zinc-700"
        } ${buttonClassName}`}
      >
        <div className="flex items-center gap-1.5 truncate">
          <StatusIcon status={value} className={size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"} />
          <span className="truncate">{currentConfig.label}</span>
        </div>
        <ChevronDown
          className={`w-3 h-3 text-zinc-400 dark:text-zinc-500 transition-transform duration-150 shrink-0 ml-0.5 ${
            isOpen ? "rotate-180 text-zinc-700 dark:text-zinc-300" : ""
          }`}
        />
      </button>

      {/* Floating Portal Menu */}
      {isOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={dropdownRef}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "fixed",
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              width: coords.width ? `${coords.width}px` : "180px",
              zIndex: 9999,
              maxHeight: "280px",
            }}
            className="rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 shadow-2xl py-1.5 overflow-y-auto overscroll-contain animate-fade-in"
          >
            {statuses.map((st) => {
              const config = JOB_STATUS_CONFIG[st];
              const isSelected = value === st;

              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => {
                    onChange(st);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold transition cursor-pointer ${
                    isSelected
                      ? "bg-zinc-100/90 dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold"
                      : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <StatusIcon status={st} className="w-3.5 h-3.5" />
                    <span>{config.label}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-zinc-900 dark:text-white stroke-[2.5]" />}
                </button>
              );
            })}
          </div>,
          document.body
        )}
    </div>
  );
}
