"use client";

import React from "react";
import { UserCheck, Sparkles, Trophy, ArrowRight } from "lucide-react";

export function LandingHowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Establish Your Career Source of Truth",
      description:
        "Input your verified work history, technical projects, and skills once into your Kairo profile. Kairo locks these credentials into your private Supabase database as the immutable benchmark.",
      icon: UserCheck,
      badge: "Verified Proof",
    },
    {
      step: "02",
      title: "Capture Jobs & Score Fit Deterministically",
      description:
        "Save opportunities directly from LinkedIn, Indeed, or company sites. Kairo's OpenAI engine analyzes the role against your profile, yielding an objective 0–100% fit score and highlighting skill gaps.",
      icon: Sparkles,
      badge: "Objective Fit",
    },
    {
      step: "03",
      title: "Generate Tailored Materials & Track to Offer",
      description:
        "Generate role-aligned ATS resumes, executive cover letters, and outreach emails in seconds. Download print-ready PDFs and manage every interview stage through the interactive Kanban board.",
      icon: Trophy,
      badge: "Signed Offer",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 sm:py-28 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50">
            How Kairo Works in 3 Steps
          </h2>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
            A battle-tested workflow designed to take you from discovery to signed offer without chaotic spreadsheets or hallucinated resumes.
          </p>
        </div>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="relative p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-sm hover:shadow-md transition space-y-5 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-black text-zinc-300 dark:text-zinc-700 font-mono">
                      {item.step}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                      {item.badge}
                    </span>
                  </div>

                  <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200/60 dark:border-blue-900/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <Icon className="w-6 h-6" />
                  </div>

                  <h3 className="text-xl font-bold text-zinc-950 dark:text-zinc-50">
                    {item.title}
                  </h3>

                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                  <span>Streamlined Execution</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
