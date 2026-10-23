"use client";

import React from "react";
import {
  LayoutGrid,
  Sparkles,
  FileCheck2,
  Send,
  FileText,
  BadgeCheck,
} from "lucide-react";

export function LandingFeatures() {
  return (
    <section id="features" className="py-20 sm:py-28 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50">
            Engineered for High-Velocity Software Careers
          </h2>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
            Every feature in Kairo is purpose-built to eliminate guesswork, keep your application pipeline immaculate, and give you an unfair advantage in interviews.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Dual-View Pipeline (Span 2) */}
          <div className="md:col-span-2 p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-sm hover:shadow-md transition group relative overflow-hidden">
            <div className="relative z-10 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/80 border border-blue-200/60 dark:border-blue-900/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <LayoutGrid className="w-6 h-6" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-zinc-50">
                8-Stage Dual-View Pipeline (Kanban & Table)
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-xl">
                Switch seamlessly between an interactive drag-and-drop Kanban board and a dense, sortable data table. Track every lead across 8 lifecycle stages with platform tags (LinkedIn, Indeed, Upwork, Company Portals) and pinned priority markers.
              </p>

              {/* Visual Mini Graphic */}
              <div className="pt-4 grid grid-cols-4 gap-2">
                {["Saved", "Applied", "Interviewing", "Offer"].map((stage, idx) => (
                  <div
                    key={stage}
                    className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-700/70 text-center"
                  >
                    <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      Step 0{idx + 1}
                    </div>
                    <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">
                      {stage}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 2: Deterministic Match Engine (Span 1) */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-50/60 via-white to-white dark:from-indigo-950/30 dark:via-zinc-900 dark:to-zinc-900 border border-indigo-200/80 dark:border-indigo-900/60 shadow-sm hover:shadow-md transition space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200/60 dark:border-indigo-900/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-zinc-950 dark:text-zinc-50">
              Deterministic 0–100% Fit Scoring
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Never apply blind. Kairo's AI analyzes the job description against your verified database profile, distinguishing matched skills from bridgeable gaps and interview risks without hallucinations.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400">
              <BadgeCheck className="w-4 h-4" />
              <span>Grounded in DB Reality</span>
            </div>
          </div>

          {/* Card 3: 1-Click ATS Resume Generator */}
          <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-sm hover:shadow-md transition space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200/60 dark:border-emerald-900/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-zinc-950 dark:text-zinc-50">
              Tailored ATS-Ready Resumes
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Generates clean, single-column ATS resumes with targeted summaries, smartly categorized technical skills (including modern AI development tools), and instant client-side PDF downloads.
            </p>
          </div>

          {/* Card 4: Executive Cover Letters */}
          <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-sm hover:shadow-md transition space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-950/80 border border-violet-200/60 dark:border-violet-900/60 flex items-center justify-center text-violet-600 dark:text-violet-400">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-zinc-950 dark:text-zinc-50">
              Executive Cover Letters
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              No robotic throat-clearing or fluffy clichés. Kairo writes crisp, 3-paragraph executive cover letters highlighting your verified achievements closest to the employer's tech stack.
            </p>
          </div>

          {/* Card 5: Recruiter Outreach & Profiles */}
          <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-sm hover:shadow-md transition space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/80 border border-amber-200/60 dark:border-amber-900/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Send className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-zinc-950 dark:text-zinc-50">
              Recruiter Outreach Notes
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              High-converting 80–120 word application emails and LinkedIn direct messages with verified portfolio links, tailored to capture hiring manager attention within 5 seconds.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
