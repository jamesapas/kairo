"use client";

import React, { useState } from "react";
import { signOutAction } from "@/lib/actions/auth";
import {
  LayoutDashboard,
  User,
  Briefcase,
  GraduationCap,
  Wrench,
  FolderGit2,
  Sparkles,
  LogOut,
  Loader2,
} from "lucide-react";

export type SectionType =
  | "overview"
  | "profile"
  | "experiences"
  | "educations"
  | "skills"
  | "projects";

interface SidebarProps {
  activeSection: SectionType;
  onSelectSection: (section: SectionType) => void;
  userEmail?: string;
}

export function Sidebar({ activeSection, onSelectSection, userEmail }: SidebarProps) {
  const [loggingOut, setLoggingOut] = useState(false);

  const handleSignOut = async () => {
    setLoggingOut(true);
    await signOutAction();
  };

  const navItems: { id: SectionType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "profile", label: "Personal Profile", icon: User },
    { id: "experiences", label: "Experience", icon: Briefcase },
    { id: "educations", label: "Education", icon: GraduationCap },
    { id: "skills", label: "Skills Inventory", icon: Wrench },
    { id: "projects", label: "Projects Portfolio", icon: FolderGit2 },
  ];

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col justify-between shrink-0 min-h-screen">
      <div className="p-6">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Kairo
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Career AI Assistant
            </p>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectSection(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-100"
                }`}
              >
                <Icon
                  className={`h-4 w-4 ${
                    isActive
                      ? "text-indigo-600 dark:text-indigo-400"
                      : "text-slate-400 dark:text-slate-500"
                  }`}
                />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Info & Logout Footer */}
      <div className="p-4 m-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 text-xs space-y-3">
        {userEmail && (
          <div className="space-y-0.5 border-b border-slate-200 dark:border-slate-800 pb-2">
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Logged in as
            </p>
            <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate" title={userEmail}>
              {userEmail}
            </p>
          </div>
        )}

        <button
          onClick={handleSignOut}
          disabled={loggingOut}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-950 dark:hover:text-red-400 text-slate-700 dark:text-slate-300 font-semibold text-xs transition disabled:opacity-50"
        >
          {loggingOut ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <LogOut className="h-3.5 w-3.5" />
          )}
          Sign Out
        </button>
      </div>
    </aside>
  );
}
