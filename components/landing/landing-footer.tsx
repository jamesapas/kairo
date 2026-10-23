"use client";

import React from "react";
import Link from "next/link";
import { KairoLogo } from "@/components/ui/logo";
import { useAuthModal } from "@/components/auth/auth-modal-context";
import { Globe, Heart } from "lucide-react";

export function LandingFooter() {
  const { openAuthModal } = useAuthModal();

  return (
    <footer className="border-t border-zinc-200/80 dark:border-zinc-800 bg-white/60 dark:bg-zinc-950/60 backdrop-blur-md pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <KairoLogo className="w-7 h-7 rounded-xl" size={32} />
              <span className="text-base font-bold text-zinc-950 dark:text-zinc-50">
                Kairo
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-sm leading-relaxed">
              The intelligent career operating system. Track applications, analyze role compatibility with deterministic scoring, and generate tailored, ATS-ready resumes grounded in your verified experience.
            </p>
            <div className="flex items-center gap-3 pt-2 text-zinc-500 dark:text-zinc-400">
              <a
                href="https://github.com/jamesapas/kairo"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:text-zinc-950 dark:hover:text-zinc-100 transition"
                aria-label="GitHub Repository"
              >
                <svg
                  className="w-4 h-4 fill-current"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  />
                </svg>
              </a>
              <a
                href="https://jobkairo.vercel.app/"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:text-zinc-950 dark:hover:text-zinc-100 transition"
                aria-label="Kairo Website"
              >
                <Globe className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              Product
            </div>
            <ul className="space-y-2 text-xs text-zinc-500 dark:text-zinc-400">
              <li>
                <a href="#features" className="hover:text-zinc-900 dark:hover:text-zinc-200 transition">
                  Features
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-zinc-900 dark:hover:text-zinc-200 transition">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#comparison" className="hover:text-zinc-900 dark:hover:text-zinc-200 transition">
                  Comparison
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-zinc-900 dark:hover:text-zinc-200 transition">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Account & Resources */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              Access
            </div>
            <ul className="space-y-2 text-xs text-zinc-500 dark:text-zinc-400">
              <li>
                <button
                  type="button"
                  onClick={() => openAuthModal("login")}
                  className="hover:text-zinc-900 dark:hover:text-zinc-200 transition cursor-pointer"
                >
                  Sign In
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openAuthModal("register")}
                  className="hover:text-zinc-900 dark:hover:text-zinc-200 transition cursor-pointer"
                >
                  Create Account
                </button>
              </li>
              <li>
                <a href="#faq" className="hover:text-zinc-900 dark:hover:text-zinc-200 transition">
                  Frequently Asked Questions
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/jamesapas/kairo"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-zinc-900 dark:hover:text-zinc-200 transition"
                >
                  Source Code & Docs
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Tech Stack & Credits */}
        <div className="pt-8 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 dark:text-zinc-400">
          <div>
            © {new Date().getFullYear()} Kairo. Built for modern software engineers.
          </div>

          <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>by</span>
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">James Karl Apas</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
