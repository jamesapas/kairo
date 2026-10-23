"use client";

import React from "react";
import { useAuthModal } from "@/components/auth/auth-modal-context";
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

export function LandingHero() {
  const { openAuthModal } = useAuthModal();

  return (
    <section className="relative pt-32 sm:pt-40 pb-20 overflow-hidden">
      {/* Ambient Radial Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[900px] h-[450px] bg-gradient-to-tr from-blue-600/15 via-indigo-500/15 to-violet-500/10 dark:from-blue-500/20 dark:via-indigo-500/20 dark:to-violet-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/2 right-10 w-[350px] h-[350px] bg-blue-500/10 dark:bg-blue-400/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Subtle Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:28px_28px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 sm:space-y-10">
        {/* Main Headline */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50 leading-[1.08] sm:leading-[1.1]">
            Track every application.{" "}
            <br className="hidden sm:inline" />
            Land your next role with{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 dark:from-blue-400 dark:via-indigo-300 dark:to-violet-400">
              Deterministic AI Precision.
            </span>
          </h1>

          <p className="text-base sm:text-lg lg:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto font-normal leading-relaxed">
            Stop wrestling with disconnected spreadsheets and generic AI chatbots. Kairo pairs an 8-stage dual Kanban & Table pipeline with an OpenAI evaluation engine to score job compatibility and generate role-tailored ATS resumes grounded in your verified experience.
          </p>
        </div>

        {/* Call-to-Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2">
          <button
            type="button"
            onClick={() => openAuthModal("register")}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl bg-zinc-950 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-950 text-sm font-bold shadow-lg shadow-zinc-900/10 dark:shadow-zinc-100/5 transition-all duration-200 cursor-pointer active:scale-98 group"
          >
            <span>Get Started for Free</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            type="button"
            onClick={() => openAuthModal("login")}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 text-sm font-bold border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all duration-200 cursor-pointer active:scale-98"
          >
            <span>Sign In</span>
          </button>
        </div>

        {/* Micro-Trust Copy */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-zinc-500 dark:text-zinc-400 pt-1">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            No credit card required
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            Instant setup in &lt; 60 seconds
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            Zero AI fabrication guarantee
          </span>
        </div>
      </div>
    </section>
  );
}
