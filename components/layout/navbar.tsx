"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { signOutAction } from "@/lib/actions/auth";
import { User, LogOut, Loader2 } from "lucide-react";

interface NavbarProps {
  userEmail?: string;
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
    <header className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur-md border-b border-zinc-200/80">
      <div className="w-full px-6 sm:px-8 lg:px-12 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-3 cursor-pointer hover:opacity-85 transition">
          <Image
            src="/logo.svg"
            alt="Kairo Logo"
            width={32}
            height={32}
            className="w-8 h-8 rounded-lg object-contain"
          />
          <h1 className="text-base font-bold tracking-tight text-zinc-900 leading-none">
            Kairo
          </h1>
        </Link>

        {/* Account Menu */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="User account menu"
            title={userEmail || "Account"}
            className="w-9 h-9 rounded-full bg-zinc-100 border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-200/60 flex items-center justify-center text-zinc-700 transition cursor-pointer"
          >
            <User className="h-4 w-4" />
          </button>

          {/* Sign Out Popover Dropdown */}
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-52 p-1.5 bg-white border border-zinc-200 rounded-2xl shadow-xl animate-in fade-in slide-in-from-top-2 duration-150 z-40">
              <div className="px-3 py-2 border-b border-zinc-100">
                <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">Signed in as</p>
                <p className="text-xs font-semibold text-zinc-900 truncate mt-0.5" title={userEmail}>
                  {userEmail || "User"}
                </p>
              </div>
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
