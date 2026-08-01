"use client";

import React, { useState } from "react";
import Image from "next/image";
import { signOutAction } from "@/lib/actions/auth";
import {
  LayoutDashboard,
  User,
  Briefcase,
  GraduationCap,
  Wrench,
  FolderGit2,
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
    { id: "profile", label: "Profile", icon: User },
    { id: "experiences", label: "Experience", icon: Briefcase },
    { id: "educations", label: "Education", icon: GraduationCap },
    { id: "skills", label: "Skills", icon: Wrench },
    { id: "projects", label: "Projects", icon: FolderGit2 },
  ];

  return (
    <aside className="w-60 border-r border-zinc-200 bg-white flex flex-col justify-between shrink-0 min-h-screen">
      <div className="p-5">
        {/* Brand Logo */}
        <div className="mb-6 pb-4 border-b border-zinc-100 flex items-center gap-3">
          <Image
            src="/logo.svg"
            alt="Kairo Logo"
            width={32}
            height={32}
            className="w-8 h-8 rounded-lg object-contain"
          />
          <div>
            <h1 className="text-base font-bold tracking-tight text-zinc-900 leading-none">
              Kairo
            </h1>
            <p className="text-[10px] text-zinc-500 font-medium mt-1">
              Career Assistant
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
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-zinc-100 text-zinc-900 font-semibold"
                    : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                }`}
              >
                <Icon
                  className={`h-4 w-4 ${
                    isActive ? "text-zinc-900" : "text-zinc-400"
                  }`}
                />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Info & Logout Footer */}
      <div className="p-4 m-3 rounded-lg bg-zinc-50 border border-zinc-200/80 text-xs space-y-3">
        {userEmail && (
          <div className="space-y-0.5 border-b border-zinc-200 pb-2">
            <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">
              Account
            </p>
            <p className="text-xs font-medium text-zinc-800 truncate" title={userEmail}>
              {userEmail}
            </p>
          </div>
        )}

        <button
          onClick={handleSignOut}
          disabled={loggingOut}
          className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-700 font-medium text-xs transition disabled:opacity-50"
        >
          {loggingOut ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <LogOut className="h-3.5 w-3.5 text-zinc-500" />
          )}
          Sign Out
        </button>
      </div>
    </aside>
  );
}
