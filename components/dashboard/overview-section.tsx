"use client";

import React from "react";
import type { CareerData } from "@/types/database";
import type { SectionType } from "@/components/layout/sidebar";
import {
  User,
  Briefcase,
  GraduationCap,
  Wrench,
  FolderGit2,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface OverviewSectionProps {
  data: CareerData;
  onNavigate: (section: SectionType) => void;
}

export function OverviewSection({ data, onNavigate }: OverviewSectionProps) {
  const { profile, experiences, educations, skills, projects } = data;

  // Calculate completeness score
  let completenessScore = 0;
  if (profile?.full_name) completenessScore += 20;
  if (profile?.headline && profile?.summary) completenessScore += 20;
  if (experiences.length > 0) completenessScore += 20;
  if (skills.length > 0) completenessScore += 20;
  if (projects.length > 0 || educations.length > 0) completenessScore += 20;

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-8 text-white shadow-xl">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5" /> Kairo Foundation Active
          </div>
          <h2 className="text-3xl font-bold tracking-tight">
            Welcome, {profile?.full_name || "Career Builder"}
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            {profile?.headline ||
              "Your central hub for managing your professional profile, work history, skills, and portfolio before AI resume generation."}
          </p>
        </div>
      </div>

      {/* Profile Completeness Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Profile Completeness
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              A comprehensive profile enables higher quality AI resume generation later.
            </p>
          </div>
          <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {completenessScore}%
          </span>
        </div>

        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-indigo-600 h-full transition-all duration-500 ease-out"
            style={{ width: `${completenessScore}%` }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          {[
            { label: "Personal Info", done: Boolean(profile?.full_name && profile?.email) },
            { label: "Work Experience", done: experiences.length > 0 },
            { label: "Skills Inventory", done: skills.length > 0 },
            { label: "Portfolio / Projects", done: projects.length > 0 },
          ].map((step, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-xs font-medium"
            >
              <CheckCircle2
                className={`h-4 w-4 shrink-0 ${
                  step.done ? "text-emerald-500" : "text-slate-300 dark:text-slate-700"
                }`}
              />
              <span className={step.done ? "text-slate-900 dark:text-slate-200" : "text-slate-500"}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: "Work Experience",
            count: experiences.length,
            unit: "Positions",
            icon: Briefcase,
            section: "experiences" as SectionType,
            color: "text-blue-600 bg-blue-50 dark:bg-blue-950/50",
          },
          {
            title: "Education",
            count: educations.length,
            unit: "Records",
            icon: GraduationCap,
            section: "educations" as SectionType,
            color: "text-amber-600 bg-amber-50 dark:bg-amber-950/50",
          },
          {
            title: "Skills Inventory",
            count: skills.length,
            unit: "Skills Listed",
            icon: Wrench,
            section: "skills" as SectionType,
            color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50",
          },
          {
            title: "Projects",
            count: projects.length,
            unit: "Projects Showcase",
            icon: FolderGit2,
            section: "projects" as SectionType,
            color: "text-purple-600 bg-purple-50 dark:bg-purple-950/50",
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              onClick={() => onNavigate(stat.section)}
              className="group cursor-pointer bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className={`p-2.5 rounded-xl ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 dark:text-slate-600 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {stat.count}
                </p>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {stat.title}
                </p>
                <p className="text-[11px] text-slate-400">{stat.unit}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Summary Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-indigo-600" />
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Profile Summary
            </h3>
          </div>
          <button
            onClick={() => onNavigate("profile")}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Edit Profile
          </button>
        </div>

        {profile?.summary ? (
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {profile.summary}
          </p>
        ) : (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 text-center space-y-2">
            <p className="text-xs text-slate-500">
              No summary provided yet. Add a career summary in your Personal Profile section.
            </p>
            <button
              onClick={() => onNavigate("profile")}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 transition"
            >
              Add Summary
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
