"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { signOutAction } from "@/lib/actions/auth";
import {
  LogOut,
  Loader2,
  User,
} from "lucide-react";
import { KairoLogo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";

interface NavbarProps {
  userEmail?: string;
  onOpenStreakModal?: () => void;
}

export function Navbar({ userEmail }: NavbarProps = {}) {
  const [loggingOut, setLoggingOut] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    setLoggingOut(true);
    await signOutAction();
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand + Workspace Breadcrumb with Live Sync Dot */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 cursor-pointer hover:opacity-85 transition">
            <KairoLogo className="w-7 h-7 rounded-lg" size={32} />
            <span className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100 leading-none">
              Kairo
            </span>
          </Link>

          <span className="text-zinc-300 dark:text-zinc-700 font-mono select-none">/</span>

          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 text-xs font-semibold text-zinc-800 dark:text-zinc-200 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Personal Workspace</span>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono font-normal">● Synced</span>
          </div>
        </div>

        {/* Right: Theme Toggle & User Avatar Menu */}
        <div className="flex items-center gap-2">
          {/* Theme Changer */}
          <ThemeToggle />

          {/* User Avatar & Account Popover */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label="User account menu"
              title={userEmail || "Account"}
              className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200/70 dark:hover:bg-zinc-700/80 border border-zinc-200/90 dark:border-zinc-700/80 text-zinc-700 dark:text-zinc-200 flex items-center justify-center transition cursor-pointer select-none shadow-2xs"
            >
              <User className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
            </button>

            {/* Account Popover Menu */}
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 p-1.5 bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-2xl shadow-xl animate-fade-in z-50">
                <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 dark:text-zinc-500">
                    Signed in as
                  </p>
                  <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200 truncate mt-0.5" title={userEmail}>
                    {userEmail || "User"}
                  </p>
                </div>

                <div className="pt-1">
                  <button
                    onClick={handleSignOut}
                    disabled={loggingOut}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer disabled:opacity-50"
                  >
                    {loggingOut ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-rose-600 dark:text-rose-400" />
                    ) : (
                      <LogOut className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                    )}
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
