"use client";

import React from "react";
import { Check, X } from "lucide-react";

export function LandingComparison() {
  const comparisonItems = [
    {
      feature: "Grounded in Verified Experience (Zero Hallucinations)",
      kairo: true,
      spreadsheets: false,
      chatgpt: false,
      note: "Kairo strictly references your database history; generic LLMs invent jobs, metrics, and skills.",
    },
    {
      feature: "8-Stage Dual Kanban & Dense Data Table",
      kairo: true,
      spreadsheets: "Partial",
      chatgpt: false,
      note: "Live drag-and-drop workflow with platform tags and interview dates.",
    },
    {
      feature: "Deterministic 0–100% Fit Scoring & Skill Gap Analysis",
      kairo: true,
      spreadsheets: false,
      chatgpt: "Partial",
      note: "Objective match algorithm cross-referencing verified skills with role requirements.",
    },
    {
      feature: "Single-Column ATS-Tested Resumes with Live Customizer",
      kairo: true,
      spreadsheets: false,
      chatgpt: false,
      note: "Edit summaries, toggle recommended skills, and categorize AI development tools.",
    },
    {
      feature: "Instant 1-Click Client-Side PDF Export (jsPDF)",
      kairo: true,
      spreadsheets: false,
      chatgpt: false,
      note: "Download print-perfect, 1-inch margin executive PDFs in under 1 second.",
    },
    {
      feature: "Executive 3-Paragraph Cover Letters Without Fluff",
      kairo: true,
      spreadsheets: false,
      chatgpt: "Partial",
      note: "Zero robotic openings or generic adjectives; direct focus on employer technical priorities.",
    },
    {
      feature: "Dedicated Career Source of Truth with RLS Security",
      kairo: true,
      spreadsheets: "Partial",
      chatgpt: false,
      note: "Private PostgreSQL storage with Supabase Row Level Security ensuring complete candidate data privacy.",
    },
  ];

  return (
    <section id="comparison" className="py-20 sm:py-28 bg-zinc-100/60 dark:bg-zinc-900/40 relative border-y border-zinc-200/80 dark:border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50">
            Why Modern Job Seekers Choose Kairo
          </h2>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
            See how Kairo stacks up against traditional chaotic spreadsheets and generic chatbot prompts.
          </p>
        </div>

        {/* Comparison Matrix Table */}
        <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-md overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/50">
                  <th className="p-5 sm:p-6 text-sm font-bold text-zinc-700 dark:text-zinc-300 w-1/2 sm:w-2/5">
                    Feature & Reliability
                  </th>
                  <th className="p-5 sm:p-6 text-center text-sm font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/30 border-x border-blue-200/60 dark:border-blue-900/60">
                    <div className="flex flex-col items-center">
                      <span className="text-base font-black">Kairo</span>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-blue-700 dark:text-blue-300">
                        AI Copilot OS
                      </span>
                    </div>
                  </th>
                  <th className="p-5 sm:p-6 text-center text-xs sm:text-sm font-bold text-zinc-600 dark:text-zinc-400">
                    Spreadsheets (Notion/Sheets)
                  </th>
                  <th className="p-5 sm:p-6 text-center text-xs sm:text-sm font-bold text-zinc-600 dark:text-zinc-400">
                    Generic AI (ChatGPT / Claude)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs sm:text-sm text-zinc-800 dark:text-zinc-200">
                {comparisonItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition">
                    <td className="p-5 sm:p-6">
                      <div className="font-bold text-zinc-900 dark:text-zinc-100">{item.feature}</div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{item.note}</div>
                    </td>

                    {/* Kairo Column (Highlighted) */}
                    <td className="p-5 sm:p-6 text-center bg-blue-50/20 dark:bg-blue-950/15 border-x border-blue-200/50 dark:border-blue-900/50">
                      <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 font-bold">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    </td>

                    {/* Spreadsheets Column */}
                    <td className="p-5 sm:p-6 text-center">
                      {item.spreadsheets === true ? (
                        <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      ) : item.spreadsheets === "Partial" ? (
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                          Manual Only
                        </span>
                      ) : (
                        <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400">
                          <X className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </td>

                    {/* Generic ChatGPT Column */}
                    <td className="p-5 sm:p-6 text-center">
                      {item.chatgpt === true ? (
                        <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      ) : item.chatgpt === "Partial" ? (
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60">
                          High Hallucination
                        </span>
                      ) : (
                        <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400">
                          <X className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
