"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Send,
  CalendarCheck,
  BadgeCheck,
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
    case "applied":
      return <Send className={`${className} text-blue-600 shrink-0`} />;
    case "interviewing":
      return <CalendarCheck className={`${className} text-purple-600 shrink-0`} />;
    case "offer":
      return <BadgeCheck className={`${className} text-emerald-600 shrink-0`} />;
    case "no_response":
      return <Hourglass className={`${className} text-amber-500 shrink-0`} />;
    case "rejected":
      return <XCircle className={`${className} text-rose-500 shrink-0`} />;
    case "withdrawn":
      return <Undo2 className={`${className} text-zinc-400 shrink-0`} />;
    default:
      return <Send className={`${className} text-blue-600 shrink-0`} />;
  }
}

export function StatusDropdown({
  value,
  onChange,
  className = "",
  size = "sm",
}: StatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; width?: number }>({
    top: 0,
    left: 0,
  });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const dropdownHeight = 220;
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUpward = spaceBelow < dropdownHeight && rect.top > dropdownHeight;

      setCoords({
        top: openUpward ? rect.top - dropdownHeight - 6 : rect.bottom + 6,
        left: Math.min(rect.left, window.innerWidth - 190),
        width: size === "md" ? rect.width : undefined,
      });
    }

    const handleScroll = () => {
      setIsOpen(false);
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
        setIsOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll, true);
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, size]);

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
        className={`transition cursor-pointer ${
          size === "sm"
            ? "inline-flex items-center gap-1.5 rounded-full bg-white border border-zinc-200 text-zinc-800 shadow-2xs hover:border-zinc-300 px-2.5 py-1 text-xs font-semibold"
            : "flex w-full items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-800 shadow-2xs hover:border-zinc-300"
        }`}
      >
        <div className="flex items-center gap-1.5 truncate">
          <StatusIcon status={value} className={size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"} />
          <span className="truncate">{currentConfig.label}</span>
        </div>
        <ChevronDown
          className={`w-3 h-3 text-zinc-400 transition-transform duration-150 shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Floating Portal Menu - rendered outside table rows to prevent overflow scrollbars */}
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
              width: coords.width ? `${coords.width}px` : "176px",
              zIndex: 9999,
            }}
            className="rounded-2xl bg-white border border-zinc-200 shadow-2xl py-1.5 animate-fade-in"
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
                      ? "bg-zinc-100/80 text-zinc-900 font-bold"
                      : "text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <StatusIcon status={st} className="w-3.5 h-3.5" />
                    <span>{config.label}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-zinc-900 stroke-[2.5]" />}
                </button>
              );
            })}
          </div>,
          document.body
        )}
    </div>
  );
}
