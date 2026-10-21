"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  LogOut,
  Loader2,
  User,
  Settings,
} from "lucide-react";
import { KairoLogo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useAuthModal } from "@/components/auth/auth-modal-context";

interface NavbarProps {
  userEmail?: string;
  onOpenStreakModal?: () => void;
}

export function Navbar({ userEmail: initialEmail }: NavbarProps = {}) {
  const router = useRouter();
  const { openAuthModal } = useAuthModal();
  const [userEmail, setUserEmail] = useState<string | undefined>(initialEmail);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>();
  const [loggingOut, setLoggingOut] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUserEmail(initialEmail);

    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserEmail(user.email);
        supabase
          .from("users")
          .select("avatar_url")
          .eq("id", user.id)
          .maybeSingle()
          .then(({ data }) => {
            if (data?.avatar_url) {
              setAvatarUrl(data.avatar_url);
            }
          });
      } else {
        setUserEmail(undefined);
        setAvatarUrl(undefined);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const email = session?.user?.email;
      setUserEmail(email);
      if (!session?.user) {
        setAvatarUrl(undefined);
      } else {
        supabase
          .from("users")
          .select("avatar_url")
          .eq("id", session.user.id)
          .maybeSingle()
          .then(({ data }) => {
            if (data?.avatar_url) {
              setAvatarUrl(data.avatar_url);
            }
          });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [initialEmail]);

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
    setMenuOpen(false);
    const supabase = createClient();
    await supabase.auth.signOut();
    setUserEmail(undefined);
    setAvatarUrl(undefined);
    setLoggingOut(false);
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand + Workspace Breadcrumb with Live Sync Dot */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 cursor-pointer hover:opacity-85 transition">
            <KairoLogo className="w-7 h-7 rounded-lg" size={32} />
            <span className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100 leading-none">
              Kairo
            </span>
          </Link>

          <span className="text-zinc-300 dark:text-zinc-700 font-mono select-none">/</span>

          {userEmail ? (
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 text-xs font-semibold text-zinc-800 dark:text-zinc-200 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Personal Workspace</span>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono font-normal">● Synced</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-800/60 text-xs font-semibold text-amber-900 dark:text-amber-200 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span>Preview Mode</span>
              <span className="text-[10px] text-amber-600/80 dark:text-amber-400/80 font-mono font-normal">● Sign in required</span>
            </div>
          )}
        </div>

        {/* Right: Theme Toggle & User Auth / Account */}
        <div className="flex items-center gap-2.5">
          {/* Theme Changer */}
          <ThemeToggle />

          {userEmail ? (
            /* User Avatar & Account Popover */
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                aria-label="User account menu"
                title={userEmail || "Account"}
                className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200/70 dark:hover:bg-zinc-700/80 border border-zinc-200/90 dark:border-zinc-700/80 text-zinc-700 dark:text-zinc-200 flex items-center justify-center transition cursor-pointer select-none shadow-2xs overflow-hidden"
              >
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt="User Avatar"
                    width={32}
                    height={32}
                    unoptimized
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                )}
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

                  <div className="py-1 border-b border-zinc-100 dark:border-zinc-800">
                    <Link
                      href="/settings"
                      onClick={() => setMenuOpen(false)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                    >
                      <Settings className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400" />
                      Profile Settings
                    </Link>
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
          ) : (
            /* Guest Actions */
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => openAuthModal("login")}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => openAuthModal("register")}
                className="px-3.5 py-1.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-semibold transition cursor-pointer shadow-2xs active:scale-[0.98]"
              >
                Create Account
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
