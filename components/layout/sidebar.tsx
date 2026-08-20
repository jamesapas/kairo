"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutAction } from "@/lib/actions/auth";
import {
  User,
  LogOut,
  Loader2,
  Briefcase,
  ChevronUp,
} from "lucide-react";

interface SidebarProps {
  userEmail?: string;
}

export function Sidebar({ userEmail }: SidebarProps = {}) {
  const [loggingOut, setLoggingOut] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

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

  const navItems = [
    { href: "/", label: "Job Tracker", icon: Briefcase },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 w-60 border-r border-zinc-200 bg-white flex flex-col justify-between z-10">
      <div className="p-5">
        {/* Brand Logo */}
        <div className="mb-6 pb-4 border-b border-zinc-100 flex items-center gap-3">
          <Image
            src="/logo.svg"
            alt="Kairo Logo"
            width={32}
            height={32}
            className="w-8 h-8 rounded-lg object-contain"
          />
          <div>
            <h1 className="text-base font-bold tracking-tight text-zinc-900 leading-none">
              Kairo
            </h1>
            <p className="text-[10px] text-zinc-500 font-medium mt-1">
              Career Assistant
            </p>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  isActive
                    ? "bg-zinc-900 text-white font-bold"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                }`}
              >
                <Icon
                  className={`h-4 w-4 ${
                    isActive ? "text-white" : "text-zinc-400"
                  }`}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Account Section at Bottom */}
      <div className="p-3 border-t border-zinc-100 relative" ref={menuRef}>
        {/* Sign Out Popover Menu */}
        {menuOpen && (
          <div className="absolute bottom-full left-3 right-3 mb-2 p-1.5 bg-white border border-zinc-200 rounded-xl shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-150 z-20">
            <button
              onClick={handleSignOut}
              disabled={loggingOut}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 transition cursor-pointer disabled:opacity-50"
            >
              {loggingOut ? (
                <Loader2 className="h-4 w-4 animate-spin text-rose-600" />
              ) : (
                <LogOut className="h-4 w-4 text-rose-600" />
              )}
              Sign Out
            </button>
          </div>
        )}

        {/* User Account Trigger (Unboxed) */}
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-zinc-100 transition cursor-pointer text-left group"
        >
          <div className="w-8 h-8 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-600 shrink-0 group-hover:border-zinc-300 transition">
            <User className="h-4 w-4 text-zinc-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-zinc-900 truncate" title={userEmail}>
              {userEmail || "Account"}
            </p>
            <p className="text-[10px] text-zinc-400 font-medium leading-none mt-0.5">
              Signed in
            </p>
          </div>
          <ChevronUp
            className={`h-3.5 w-3.5 text-zinc-400 transition-transform duration-200 ${
              menuOpen ? "rotate-180 text-zinc-700" : ""
            }`}
          />
        </button>
      </div>
    </aside>
  );
}
