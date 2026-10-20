"use client";

import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Laptop, GraduationCap, ChevronDown, Check, Loader2 } from "lucide-react";
import { ProjectType, PROJECT_TYPE_LABELS } from "@/types/project";

interface ProjectTypeDropdownProps {
  value: ProjectType;
  onChange: (newType: ProjectType) => void;
  disabled?: boolean;
  isLoading?: boolean;
}

const TYPE_CONFIG: Record<
  ProjectType,
  {
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    badgeClasses: string;
    iconColor: string;
  }
> = {
  key: {
    label: "Key Project",
    description: "Core flagship build",
    icon: Sparkles,
    badgeClasses:
      "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/50",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  side: {
    label: "Side Project",
    description: "Personal experiment",
    icon: Laptop,
    badgeClasses:
      "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200/80 dark:border-blue-800/60 hover:bg-blue-100/80 dark:hover:bg-blue-900/50",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  capstone: {
    label: "Capstone Project",
    description: "Academic thesis / final build",
    icon: GraduationCap,
    badgeClasses:
      "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/60 hover:bg-amber-100/80 dark:hover:bg-amber-900/50",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
};

const PROJECT_TYPES: ProjectType[] = ["key", "side", "capstone"];

export function ProjectTypeDropdown({
  value,
  onChange,
  disabled = false,
  isLoading = false,
}: ProjectTypeDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentConfig = TYPE_CONFIG[value] || TYPE_CONFIG.key;
  const CurrentIcon = currentConfig.icon;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (newType: ProjectType) => {
    if (newType !== value) {
      onChange(newType);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative inline-flex items-center" ref={containerRef}>
      <button
        type="button"
        disabled={disabled || isLoading}
        onClick={() => setIsOpen((prev) => !prev)}
        title="Quickly change project classification"
        className={`group inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold border transition shadow-2xs cursor-pointer select-none disabled:opacity-60 disabled:cursor-not-allowed ${currentConfig.badgeClasses}`}
      >
        {isLoading ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <CurrentIcon className="w-3 h-3" />
        )}
        <span>{currentConfig.label}</span>
        <ChevronDown
          className={`w-2.5 h-2.5 transition-transform duration-150 ${
            isOpen ? "rotate-180" : "opacity-70 group-hover:opacity-100"
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 w-52 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-xl p-1 z-30 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 border-b border-zinc-100 dark:border-zinc-800/80 mb-1">
            Change Classification
          </div>
          <div className="space-y-0.5">
            {PROJECT_TYPES.map((typeKey) => {
              const cfg = TYPE_CONFIG[typeKey];
              const IconComp = cfg.icon;
              const isSelected = typeKey === value;

              return (
                <button
                  key={typeKey}
                  type="button"
                  onClick={() => handleSelect(typeKey)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs transition cursor-pointer ${
                    isSelected
                      ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-850 hover:text-zinc-900 dark:hover:text-zinc-100"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <IconComp className={`w-3.5 h-3.5 ${cfg.iconColor}`} />
                    <div>
                      <div className="text-[11px] font-semibold leading-tight">
                        {cfg.label}
                      </div>
                      <div className="text-[9px] text-zinc-400 font-normal">
                        {cfg.description}
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-100" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
