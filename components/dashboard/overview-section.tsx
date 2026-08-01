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
    <div className="space-y-6">
      {/* Title & Intro Header */}
      <div className="bg-white rounded-lg p-6 border border-zinc-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-zinc-900">
            {profile?.full_name ? profile.full_name : "Career Dashboard"}
          </h2>
          <p className="text-xs text-zinc-500 max-w-xl">
            {profile?.headline ||
              "Central hub for managing professional details, experience, skills, and projects."}
          </p>
        </div>

        <div className="flex items-center gap-3 bg-zinc-50 p-3 rounded-lg border border-zinc-200/80 shrink-0">
          <div className="text-right">
            <p className="text-[10px] uppercase font-bold text-zinc-400">Completeness</p>
            <p className="text-lg font-bold text-zinc-900">{completenessScore}%</p>
          </div>
          <div className="w-16 bg-zinc-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-zinc-900 h-full transition-all duration-300"
              style={{ width: `${completenessScore}%` }}
            />
          </div>
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
          },
          {
            title: "Education",
            count: educations.length,
            unit: "Records",
            icon: GraduationCap,
            section: "educations" as SectionType,
          },
          {
            title: "Skills Inventory",
            count: skills.length,
            unit: "Skills Listed",
            icon: Wrench,
            section: "skills" as SectionType,
          },
          {
            title: "Projects Showcase",
            count: projects.length,
            unit: "Projects",
            icon: FolderGit2,
            section: "projects" as SectionType,
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              onClick={() => onNavigate(stat.section)}
              className="group cursor-pointer bg-white rounded-lg p-5 border border-zinc-200 shadow-sm hover:border-zinc-300 transition space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-zinc-100 text-zinc-700">
                  <Icon className="h-4 w-4" />
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-zinc-400 group-hover:text-zinc-900 transition" />
              </div>
              <div>
                <p className="text-2xl font-bold text-zinc-900">
                  {stat.count}
                </p>
                <p className="text-xs font-semibold text-zinc-700">
                  {stat.title}
                </p>
                <p className="text-[11px] text-zinc-400">{stat.unit}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Profile Summary Card */}
      <div className="bg-white rounded-lg p-6 border border-zinc-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-zinc-500" />
            <h3 className="text-sm font-bold text-zinc-900">
              Profile Summary
            </h3>
          </div>
          <button
            onClick={() => onNavigate("profile")}
            className="text-xs font-semibold text-zinc-900 hover:underline"
          >
            Edit Profile
          </button>
        </div>

        {profile?.summary ? (
          <p className="text-xs text-zinc-600 leading-relaxed">
            {profile.summary}
          </p>
        ) : (
          <div className="p-4 rounded-lg bg-zinc-50 text-center space-y-2 border border-zinc-100">
            <p className="text-xs text-zinc-500">
              No summary added yet.
            </p>
            <button
              onClick={() => onNavigate("profile")}
              className="px-3 py-1.5 rounded-lg bg-zinc-900 text-white text-xs font-medium hover:bg-zinc-800 transition"
            >
              Add Summary
            </button>
          </div>
        )}
      </div>

      {/* Profile Check Checklist */}
      <div className="bg-white rounded-lg p-6 border border-zinc-200 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider text-zinc-400">
          Setup Checklist
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Personal Info", done: Boolean(profile?.full_name && profile?.email) },
            { label: "Work Experience", done: experiences.length > 0 },
            { label: "Skills Inventory", done: skills.length > 0 },
            { label: "Portfolio / Projects", done: projects.length > 0 },
          ].map((step, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 p-2.5 rounded-lg bg-zinc-50 border border-zinc-200/80 text-xs font-medium"
            >
              <CheckCircle2
                className={`h-4 w-4 shrink-0 ${
                  step.done ? "text-emerald-600" : "text-zinc-300"
                }`}
              />
              <span className={step.done ? "text-zinc-900 font-semibold" : "text-zinc-500"}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
