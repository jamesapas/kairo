"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  User,
  Briefcase,
  Wrench,
  GraduationCap,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { BasicInfoSection } from "./basic-info-section";

type SettingsSection = "basic-info" | "experience" | "skills" | "education";

export function SettingsView() {
  const [activeSection, setActiveSection] = useState<SettingsSection>("basic-info");

  const navigationItems = [
    {
      id: "basic-info" as const,
      label: "Basic Info",
      description: "Name, avatar, contact & links",
      icon: User,
      badge: null,
    },
    {
      id: "experience" as const,
      label: "Experience",
      description: "Work history & achievements",
      icon: Briefcase,
      badge: "Coming Soon",
    },
    {
      id: "skills" as const,
      label: "Skills & Stack",
      description: "Technologies & competencies",
      icon: Wrench,
      badge: "Coming Soon",
    },
    {
      id: "education" as const,
      label: "Education",
      description: "Degrees & certifications",
      icon: GraduationCap,
      badge: "Coming Soon",
    },
  ];

  return (
    <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header & Breadcrumb */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 dark:text-zinc-500">
          <Link href="/" className="hover:text-zinc-700 dark:hover:text-zinc-300 transition">
            Workspace
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-zinc-800 dark:text-zinc-200">Settings</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
              Profile & Career Settings
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Manage your personal details, resume profile, and career preferences
            </p>
          </div>
        </div>
      </div>

      {/* Grid Layout: Sidebar Navigation + Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-4 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 p-3 sm:p-4 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-1.5">
          <div className="px-3 py-2">
            <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 dark:text-zinc-500">
              Profile Sections
            </p>
          </div>

          <div className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              const isAvailable = item.badge === null;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (isAvailable) {
                      setActiveSection(item.id);
                    }
                  }}
                  disabled={!isAvailable}
                  className={`w-full flex items-start gap-3 p-3 rounded-2xl text-left transition-all ${
                    isActive
                      ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-md"
                      : isAvailable
                      ? "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 cursor-pointer"
                      : "opacity-60 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 text-zinc-400 dark:text-zinc-500 cursor-not-allowed"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isActive
                        ? "bg-white/20 dark:bg-black/10 text-white dark:text-zinc-900"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="text-xs font-bold truncate">{item.label}</span>
                      {item.badge && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-semibold px-2 py-0.5 rounded-md bg-zinc-200/80 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                          <Sparkles className="w-2.5 h-2.5" />
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-[11px] truncate mt-0.5 ${
                        isActive
                          ? "text-zinc-300 dark:text-zinc-600"
                          : "text-zinc-400 dark:text-zinc-500"
                      }`}
                    >
                      {item.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section Content */}
        <div className="lg:col-span-8">
          {activeSection === "basic-info" && <BasicInfoSection />}
        </div>
      </div>
    </main>
  );
}
