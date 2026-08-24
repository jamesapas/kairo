"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { signOutAction } from "@/lib/actions/auth";
import {
  User,
  LogOut,
  Loader2,
  Copy,
  Check,
} from "lucide-react";
import { KairoLogo } from "@/components/ui/logo";

interface NavbarProps {
  userEmail?: string;
  onOpenStreakModal?: () => void;
}

export function Navbar({ userEmail }: NavbarProps = {}) {
  const [loggingOut, setLoggingOut] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
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

  const handleCopyEmail = () => {
    if (userEmail) {
      navigator.clipboard.writeText(userEmail);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  const initial = userEmail ? userEmail.charAt(0).toUpperCase() : "U";

  return (
    <header className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur-md border-b border-zinc-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand + Workspace Breadcrumb with Live Sync Dot */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 cursor-pointer hover:opacity-85 transition">
            <KairoLogo className="w-7 h-7 rounded-lg" size={32} />
            <span className="text-sm font-bold tracking-tight text-zinc-900 leading-none">
              Kairo
            </span>
          </Link>

          <span className="text-zinc-300 font-mono select-none">/</span>

          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-zinc-50 border border-zinc-200/80 text-xs font-semibold text-zinc-800 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Personal Workspace</span>
            <span className="text-[10px] text-zinc-400 font-mono font-normal">● Synced</span>
          </div>
        </div>

        {/* Right: User Avatar & Account Menu */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="User account menu"
            title={userEmail || "Account"}
            className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-950 text-white flex items-center justify-center text-xs font-bold shadow-xs hover:scale-105 transition cursor-pointer select-none"
          >
            {initial}
          </button>

          {/* Account Popover Menu */}
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-60 p-2 bg-white border border-zinc-200/90 rounded-2xl shadow-xl animate-fade-in z-50">
              <div className="px-3 py-2.5 border-b border-zinc-100 bg-zinc-50/50 rounded-xl mb-1">
                <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">Signed In As</p>
                <p className="text-xs font-semibold text-zinc-900 truncate mt-0.5" title={userEmail}>
                  {userEmail || "User"}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCopyEmail}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
                  <span>{copiedEmail ? "Copied to clipboard!" : "Copy Email"}</span>
                </div>
              </button>

              <button
                onClick={handleSignOut}
                disabled={loggingOut}
                className="w-full mt-1 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition cursor-pointer disabled:opacity-50"
              >
                {loggingOut ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-rose-600" />
                ) : (
                  <LogOut className="h-3.5 w-3.5 text-rose-600" />
                )}
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
