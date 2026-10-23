"use client";

import React from "react";
import { useAuthModal } from "@/components/auth/auth-modal-context";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export function LandingCta() {
  const { openAuthModal } = useAuthModal();

  return (
    <section className="py-20 sm:py-28 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl p-8 sm:p-12 lg:p-16 bg-gradient-to-br from-zinc-900 via-zinc-950 to-blue-950 text-white overflow-hidden shadow-2xl border border-zinc-800">
          {/* Subtle Ambient Radial Glows */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-3xl pointer-events-none -z-0" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600/20 rounded-full blur-3xl pointer-events-none -z-0" />

          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6 sm:space-y-8">
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              Stop guessing. Start landing.
            </h2>

            <p className="text-sm sm:text-base lg:text-lg text-zinc-300 max-w-2xl mx-auto leading-relaxed">
              Organize your pipeline across 8 stages, verify job compatibility with 0–100% deterministic scores, and export tailored ATS resumes in 1 click.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-4">
              <button
                type="button"
                onClick={() => openAuthModal("register")}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white hover:bg-zinc-100 text-zinc-950 text-sm font-bold shadow-xl shadow-white/10 transition cursor-pointer active:scale-98"
              >
                <span>Get Started for Free</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => openAuthModal("login")}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white text-sm font-bold border border-white/15 backdrop-blur-md transition cursor-pointer active:scale-98"
              >
                <span>Sign In</span>
              </button>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs text-zinc-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Instant account setup
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Zero AI hallucinations
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                No credit card required
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
