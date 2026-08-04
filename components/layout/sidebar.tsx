"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutAction } from "@/lib/actions/auth";
import {
  FileText,
  User,
  LogOut,
  Loader2,
} from "lucide-react";

interface SidebarProps {
  userEmail?: string;
}

export function Sidebar({ userEmail }: SidebarProps) {
  const [loggingOut, setLoggingOut] = useState(false);
  const pathname = usePathname();

  const handleSignOut = async () => {
    setLoggingOut(true);
    await signOutAction();
  };

  const navItems = [
    { href: "/", label: "Resume Generator", icon: FileText },
    { href: "/profile", label: "My Profile", icon: User },
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
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
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

      {/* User Info & Logout Footer */}
      <div className="p-4 m-3 rounded-2xl bg-zinc-50 border border-zinc-200/80 text-xs space-y-3">
        {userEmail && (
          <div className="space-y-0.5 border-b border-zinc-200 pb-2">
            <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">
              Account
            </p>
            <p className="text-xs font-medium text-zinc-800 truncate" title={userEmail}>
              {userEmail}
            </p>
          </div>
        )}

        <button
          onClick={handleSignOut}
          disabled={loggingOut}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-full bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-700 font-semibold text-xs transition cursor-pointer disabled:opacity-50"
        >
          {loggingOut ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <LogOut className="h-3.5 w-3.5 text-zinc-500" />
          )}
          Sign Out
        </button>
      </div>
    </aside>
  );
}
