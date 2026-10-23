"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export function LandingFaq() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      question: "How does Kairo guarantee zero AI hallucination?",
      answer:
        "Unlike generic ChatGPT prompts that invent unlisted companies, metrics, or technologies to make a candidate sound qualified, Kairo performs strict deterministic reconciliation. When generating resumes or cover letters, the AI is constrained by an immutable prompt ceiling and database reconciliation logic that uses only verified career history, projects, and skills stored in your profile.",
    },
    {
      question: "How do I get started with Kairo?",
      answer:
        "Getting started takes under 60 seconds. Simply click 'Get Started' to create your account with your email. Enter your verified work history, technical projects, and skills once to establish your career benchmark, and you're immediately ready to track opportunities and generate tailored application materials.",
    },
    {
      question: "Are the generated resumes and cover letters ATS-compliant?",
      answer:
        "Yes, 100%. Resumes are generated using clean, single-column, standard typography (Helvetica/Arial) with 1-inch margins, high-contrast dark text, clean category headers, and ATS-friendly parsing structures. You can download the finished document in 1 click using client-side jsPDF with zero formatting glitches or visual clutter.",
    },
    {
      question: "How does Kairo handle freelance and independent project experience?",
      answer:
        "Kairo enforces strict phrasing constraints to ensure freelance and independent engineering is communicated with high professionalism. It never generates awkward phrases like 'at Freelance'; instead, it formats independent client work naturally as 'in my freelance engineering work', 'as a freelance developer', or 'delivering independent client solutions'.",
    },
    {
      question: "What platforms and job boards does Kairo support?",
      answer:
        "Kairo supports any job board or direct company career portal. It includes specialized tags for LinkedIn, Indeed, JobStreet, OnlineJobs.ph, Upwork, and direct company links. You can paste any raw job posting text or description, and Kairo's HTML sanitizer immediately extracts and formats the requirements.",
    },
    {
      question: "Is my personal data and career profile secure?",
      answer:
        "Yes. Your career history, applications, notes, and uploaded avatars are housed in your private PostgreSQL instance powered by Supabase with Row Level Security (RLS). Only your authenticated session can read or mutate your records.",
    },
  ];

  return (
    <section id="faq" className="py-20 sm:py-28 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50">
            Frequently Asked Questions
          </h2>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
            Everything you need to know about Kairo's deterministic AI matching and application tracker.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3.5">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-2xs overflow-hidden transition"
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-hidden"
                >
                  <span className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
                    {faq.question}
                  </span>
                  <div
                    className={`p-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 transition-transform duration-200 shrink-0 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-800/60 animate-fade-in">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
