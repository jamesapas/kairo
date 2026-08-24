import React from "react";
import { User, Briefcase, Wrench, GraduationCap, Link2 } from "lucide-react";

export function ProfileSectionSkeleton() {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 shadow-xs overflow-hidden animate-pulse">
      <div className="px-6 sm:px-8 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
          <User className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-600" />
        </div>
        <div className="w-20 h-4 rounded bg-zinc-200 dark:bg-zinc-800" />
      </div>

      <div className="p-6 sm:p-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Left: Avatar Skeleton */}
          <div className="flex flex-col items-center gap-3.5 shrink-0 self-center md:self-start">
            <div className="w-36 h-36 sm:w-40 sm:h-40 rounded-full bg-zinc-200 dark:bg-zinc-800 border-2 border-zinc-200/90 dark:border-zinc-700 flex items-center justify-center">
              <User className="w-16 h-16 text-zinc-300 dark:text-zinc-700" />
            </div>
            <div className="w-32 h-8 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
          </div>

          {/* Right: Inputs & Links Skeleton */}
          <div className="flex-1 w-full space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="w-24 h-3.5 rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="w-full h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800/80" />
              </div>
              <div className="space-y-2">
                <div className="w-28 h-3.5 rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="w-full h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800/80" />
              </div>
            </div>

            {/* Career Summary Skeleton */}
            <div className="space-y-2">
              <div className="w-32 h-3.5 rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="w-full h-20 rounded-xl bg-zinc-100 dark:bg-zinc-800/80" />
            </div>

            {/* Links Skeleton */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Link2 className="w-3.5 h-3.5 text-zinc-400" />
                  <div className="w-14 h-3.5 rounded bg-zinc-200 dark:bg-zinc-800" />
                </div>
                <div className="w-20 h-6 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
              </div>

              <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 divide-y divide-zinc-200/60 dark:divide-zinc-800 overflow-hidden">
                {[1, 2].map((i) => (
                  <div key={i} className="p-3.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-zinc-200 dark:bg-zinc-800 shrink-0" />
                      <div className="w-20 h-3.5 rounded bg-zinc-200 dark:bg-zinc-800" />
                    </div>
                    <div className="flex-1 max-w-sm h-7 rounded-lg bg-zinc-200/70 dark:bg-zinc-800/70" />
                    <div className="w-14 h-6 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ExperienceSectionSkeleton() {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 shadow-xs overflow-hidden animate-pulse">
      <div className="px-6 sm:px-8 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
            <Briefcase className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-600" />
          </div>
          <div className="w-24 h-4 rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
        <div className="w-28 h-7 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        <div className="relative pl-2 sm:pl-4 space-y-6 before:absolute before:left-6 sm:before:left-8 before:top-4 before:bottom-4 before:w-[2px] before:bg-zinc-200 dark:before:bg-zinc-800">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="relative flex items-start gap-4 p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-2xs"
            >
              <div className="w-10 h-10 rounded-xl bg-zinc-200 dark:bg-zinc-800 shrink-0" />
              <div className="space-y-2 min-w-0 flex-1">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-40 sm:w-52 h-4 rounded bg-zinc-200 dark:bg-zinc-800" />
                    <div className="w-20 h-4 rounded bg-zinc-100 dark:bg-zinc-800/70" />
                    <div className="w-14 h-5 rounded-md bg-zinc-200 dark:bg-zinc-800" />
                  </div>
                  <div className="w-28 h-3.5 rounded bg-zinc-200 dark:bg-zinc-800" />
                </div>
                <div className="w-32 h-3 rounded bg-zinc-100 dark:bg-zinc-800/70" />
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
      <div className="px-6 sm:px-8 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
          <Wrench className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-600" />
        </div>
        <div className="w-16 h-4 rounded bg-zinc-200 dark:bg-zinc-800" />
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        {/* Search Input Skeleton */}
        <div className="flex items-center gap-2.5">
          <div className="flex-1 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800/80" />
          <div className="w-16 h-10 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
        </div>

        {/* Active Skills Cloud Skeleton */}
        <div className="space-y-2">
          <div className="w-24 h-3 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <div
                key={i}
                className="w-24 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-750"
              />
            ))}
          </div>
        </div>

        {/* Suggestions Skeleton */}
        <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <div className="w-24 h-3 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="flex flex-wrap gap-1.5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="w-20 h-7 rounded-lg bg-zinc-100/70 dark:bg-zinc-800/50" />
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
          <div className="w-7 h-7 rounded-lg bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
            <GraduationCap className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-600" />
          </div>
          <div className="w-24 h-4 rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
        <div className="w-28 h-7 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        <div className="relative pl-2 sm:pl-4 space-y-6 before:absolute before:left-6 sm:before:left-8 before:top-4 before:bottom-4 before:w-[2px] before:bg-zinc-200 dark:before:bg-zinc-800">
          <div className="relative flex items-start gap-4 p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-zinc-200 dark:bg-zinc-800 shrink-0" />
            <div className="space-y-2 min-w-0 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                <div className="w-48 sm:w-64 h-4 rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="w-28 h-3.5 rounded bg-zinc-200 dark:bg-zinc-800" />
              </div>
              <div className="w-56 h-3.5 rounded bg-zinc-100 dark:bg-zinc-800/70" />
              <div className="w-28 h-3 rounded bg-zinc-100 dark:bg-zinc-800/60" />
              <div className="w-32 h-6 rounded-lg bg-zinc-200/70 dark:bg-zinc-800/70 pt-1" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
