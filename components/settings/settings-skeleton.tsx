import React from "react";
import {
  User,
  Briefcase,
  Wrench,
  GraduationCap,
  Link2,
  Code2,
  FileText,
  MapPin,
  Mail,
} from "lucide-react";

export function ProfileSectionSkeleton() {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 shadow-xs overflow-hidden animate-pulse">
      {/* Header Ribbon */}
      <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 flex items-center justify-center">
            <User className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-600" />
          </div>
          <div className="w-14 h-3.5 rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Avatar Section */}
        <div className="flex flex-col items-center gap-3 pt-1">
          <div className="w-28 h-28 rounded-full bg-zinc-100 dark:bg-zinc-800 border-2 border-zinc-200/90 dark:border-zinc-700 flex items-center justify-center">
            <User className="w-12 h-12 text-zinc-300 dark:text-zinc-700" />
          </div>
          <div className="w-32 h-[30px] rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700" />
        </div>

        {/* Inputs Section */}
        <div className="space-y-3.5 pt-1">
          {/* Full Name */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-zinc-400/70" />
              <div className="w-16 h-3 rounded bg-zinc-200 dark:bg-zinc-800" />
            </div>
            <div className="w-full h-[38px] rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700" />
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-zinc-400/70" />
              <div className="w-14 h-3 rounded bg-zinc-200 dark:bg-zinc-800" />
            </div>
            <div className="w-full h-[38px] rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700" />
          </div>

          {/* Account Email */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-zinc-400/70" />
                <div className="w-20 h-3 rounded bg-zinc-200 dark:bg-zinc-800" />
              </div>
              <div className="w-14 h-4 rounded-md bg-emerald-500/10 border border-emerald-500/20" />
            </div>
            <div className="w-full h-[38px] rounded-xl bg-zinc-100/70 dark:bg-zinc-800/40 border border-zinc-200/70 dark:border-zinc-800" />
          </div>
        </div>

        {/* Links Section */}
        <div className="space-y-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link2 className="w-3.5 h-3.5 text-zinc-400" />
              <div className="w-10 h-3 rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="w-5 h-4 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/70 dark:border-zinc-700" />
            </div>
            <div className="w-16 h-[26px] rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700" />
          </div>

          <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 divide-y divide-zinc-200/60 dark:divide-zinc-800 overflow-hidden">
            {[1, 2].map((i) => (
              <div key={i} className="p-3 flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-md bg-zinc-200 dark:bg-zinc-700 shrink-0" />
                  <div className="space-y-1">
                    <div className="w-16 h-3 rounded bg-zinc-200 dark:bg-zinc-800" />
                    <div className="w-24 h-2.5 rounded bg-zinc-100 dark:bg-zinc-800/60" />
                  </div>
                </div>
                <div className="w-6 h-6 rounded-lg bg-zinc-200/70 dark:bg-zinc-750 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProfileCompletenessSkeleton() {
  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-xs space-y-3 animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-36 h-3 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="w-9 h-4 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/70 dark:border-zinc-700" />
          </div>
          <div className="w-72 max-w-full h-3 rounded bg-zinc-100 dark:bg-zinc-800/70 mt-1.5" />
        </div>
        <div className="w-24 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/70 dark:border-zinc-700 shrink-0" />
      </div>

      <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
        <div className="w-2/3 h-full bg-zinc-200 dark:bg-zinc-700 rounded-full" />
      </div>
    </div>
  );
}

export function CareerSummarySkeleton() {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 shadow-xs overflow-hidden animate-pulse">
      <div className="px-6 sm:px-8 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 flex items-center justify-center">
            <FileText className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-600" />
          </div>
          <div className="w-28 h-3.5 rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-2">
        <div className="w-96 max-w-full h-3 rounded bg-zinc-100 dark:bg-zinc-800/70" />
        <div className="w-full h-[106px] rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700" />
      </div>
    </div>
  );
}

export function ExperienceSectionSkeleton() {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 shadow-xs overflow-hidden animate-pulse">
      <div className="px-6 sm:px-8 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 flex items-center justify-center">
            <Briefcase className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-600" />
          </div>
          <div className="w-20 h-3.5 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="w-6 h-4 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/70 dark:border-zinc-700" />
        </div>
        <div className="w-28 h-[30px] rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700" />
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        <div className="relative pl-2 sm:pl-4 space-y-6 before:absolute before:left-6 sm:before:left-8 before:top-4 before:bottom-4 before:w-[2px] before:bg-zinc-200 dark:before:bg-zinc-800">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="relative flex items-start gap-4 p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-2xs"
            >
              <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 shrink-0" />
              <div className="space-y-2 min-w-0 flex-1">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 sm:gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="w-40 sm:w-48 h-4 rounded bg-zinc-200 dark:bg-zinc-800" />
                    <div className="w-20 h-3.5 rounded bg-zinc-100 dark:bg-zinc-800/70" />
                    <div className="w-14 h-4 rounded-md bg-zinc-100 dark:bg-zinc-800" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-3.5 rounded bg-zinc-200 dark:bg-zinc-800" />
                    <div className="w-12 h-4 rounded-full bg-zinc-100 dark:bg-zinc-800" />
                  </div>
                </div>
                <div className="w-24 h-3 rounded bg-zinc-100 dark:bg-zinc-800/70" />
                <div className="space-y-1.5 pt-1.5">
                  <div className="w-11/12 h-3 rounded bg-zinc-100 dark:bg-zinc-800/60" />
                  <div className="w-4/5 h-3 rounded bg-zinc-100 dark:bg-zinc-800/60" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SkillsSectionSkeleton() {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 shadow-xs overflow-hidden animate-pulse">
      <div className="px-6 sm:px-8 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 flex items-center justify-center">
            <Wrench className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-600" />
          </div>
          <div className="w-14 h-3.5 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="w-6 h-4 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/70 dark:border-zinc-700" />
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        {/* Search & Add Input Row Skeleton */}
        <div className="flex items-center gap-2.5">
          <div className="flex-1 h-[38px] rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700" />
          <div className="w-16 h-[38px] rounded-xl bg-zinc-200 dark:bg-zinc-800 shrink-0" />
        </div>

        {/* Active Skills Cloud Skeleton */}
        <div className="space-y-2">
          <div className="w-28 h-3 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="flex flex-wrap gap-2">
            {[24, 28, 20, 32, 24, 28, 20, 26].map((w, i) => (
              <div
                key={i}
                style={{ width: `${w * 4}px` }}
                className="h-8 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200/90 dark:border-zinc-700/80 shadow-2xs"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function EducationSectionSkeleton() {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 shadow-xs overflow-hidden animate-pulse">
      <div className="px-6 sm:px-8 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 flex items-center justify-center">
            <GraduationCap className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-600" />
          </div>
          <div className="w-18 h-3.5 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="w-6 h-4 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/70 dark:border-zinc-700" />
        </div>
        <div className="w-28 h-[30px] rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700" />
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        <div className="relative pl-2 sm:pl-4 space-y-6 before:absolute before:left-6 sm:before:left-8 before:top-4 before:bottom-4 before:w-[2px] before:bg-zinc-200 dark:before:bg-zinc-800">
          <div className="relative flex items-start gap-4 p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 shrink-0" />
            <div className="space-y-1.5 min-w-0 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 sm:gap-2">
                <div className="w-48 sm:w-56 h-4 rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="w-28 h-3.5 rounded bg-zinc-200 dark:bg-zinc-800" />
              </div>
              <div className="w-44 h-3.5 rounded bg-zinc-100 dark:bg-zinc-800/70" />
              <div className="w-24 h-3 rounded bg-zinc-100 dark:bg-zinc-800/60" />
              <div className="w-28 h-6 rounded-lg bg-amber-500/10 border border-amber-300/30 dark:border-amber-700/30" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProjectsSectionSkeleton() {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 shadow-xs overflow-hidden animate-pulse">
      <div className="px-6 sm:px-8 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 flex items-center justify-center">
            <Code2 className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-600" />
          </div>
          <div className="w-18 h-3.5 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="w-6 h-4 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/70 dark:border-zinc-700" />
        </div>
        <div className="w-28 h-[30px] rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700" />
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        {/* Filter Pills Skeleton */}
        <div className="flex flex-wrap items-center gap-2 pb-1">
          <div className="w-16 h-[30px] rounded-xl bg-zinc-900/80 dark:bg-zinc-100/80" />
          <div className="w-32 h-[30px] rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700" />
          <div className="w-32 h-[30px] rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700" />
          <div className="w-28 h-[30px] rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700" />
        </div>

        <div className="grid grid-cols-1 gap-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-2xs space-y-2.5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-44 h-4 rounded bg-zinc-200 dark:bg-zinc-800" />
                  <div className="w-24 h-6 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/70 dark:border-zinc-700" />
                  <div className="w-20 h-6 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/70 dark:border-zinc-700" />
                </div>
                <div className="w-12 h-6 rounded-lg bg-zinc-100 dark:bg-zinc-800" />
              </div>
              <div className="space-y-1.5 pt-0.5 pl-1">
                <div className="w-11/12 h-3 rounded bg-zinc-100 dark:bg-zinc-800/70" />
                <div className="w-4/5 h-3 rounded bg-zinc-100 dark:bg-zinc-800/60" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
