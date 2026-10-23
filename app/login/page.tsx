"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowLeft,
  ArrowRight,
  Info,
} from "lucide-react";
import { KairoLogo } from "@/components/ui/logo";
import { FullscreenLoader } from "@/components/ui/fullscreen-loader";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectUrl = searchParams.get("redirect") || "/dashboard";
  const reasonParam = searchParams.get("reason");
  const registeredParam = searchParams.get("registered");
  const errorParam = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState(
    errorParam === "auth_callback_failed"
      ? "Authentication session expired or failed. Please sign in again."
      : ""
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMsg("Please enter both your email address and password.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        setErrorMsg(
          error.message === "Invalid login credentials"
            ? "Invalid email or password. Please verify and try again."
            : error.message || "Failed to sign in. Please try again."
        );
        setLoading(false);
      } else {
        window.location.href = redirectUrl;
      }
    } catch {
      setErrorMsg("A network or server error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;

    setResetLoading(true);
    setResetMessage("");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/auth/callback?next=/settings`,
      });
      if (error) {
        setResetMessage(`Error: ${error.message}`);
      } else {
        setResetMessage("Password reset email sent! Please check your inbox.");
      }
    } catch {
      setResetMessage("Unable to send reset email at this time. Please try again.");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm sm:max-w-md mx-auto space-y-6">
      {/* Fullscreen Loading Overlay */}
      {loading && (
        <FullscreenLoader
          title="Signing in..."
          subtitle="Verifying your credentials and preparing workspace..."
        />
      )}

      {/* Back to Home Link */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition group py-1"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Kairo</span>
        </Link>
      </div>

      {/* Main Header & Brand */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center">
          <KairoLogo className="w-12 h-12 rounded-2xl shadow-xs" size={48} />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Sign in to Kairo
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
          Welcome back! Enter your credentials to continue.
        </p>
      </div>

      {/* Contextual Reason Alert */}
      {reasonParam && (
        <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/50 text-blue-800 dark:text-blue-300 text-xs font-medium flex items-start gap-2.5 animate-fade-in">
          <Info className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
          <span>{reasonParam}</span>
        </div>
      )}

      {/* Feedback Alerts */}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200/60 dark:border-red-900/50 text-red-700 dark:text-red-400 text-xs font-medium flex items-start gap-2.5 animate-fade-in">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Minimalist Auth Card */}
      <div className="relative rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 sm:p-7 shadow-xs">

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Email address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                autoComplete="email"
                disabled={loading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/70 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:border-zinc-900 dark:focus:border-zinc-300 focus:bg-white dark:focus:bg-zinc-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Password
              </label>
              <button
                type="button"
                onClick={() => {
                  setResetEmail(email);
                  setShowResetModal(true);
                }}
                className="text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition font-medium cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                disabled={loading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full h-11 pl-10 pr-10 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/70 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:border-zinc-900 dark:focus:border-zinc-300 focus:bg-white dark:focus:bg-zinc-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me Option */}
          <div className="flex items-center">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                disabled={loading}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded-md border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-0 cursor-pointer"
              />
              <span className="text-xs text-zinc-600 dark:text-zinc-400">
                Remember me
              </span>
            </label>
          </div>

          {/* Submit Button with Dedicated Loading State */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full h-11 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 text-white transition-all shadow-xs cursor-pointer ${
              loading
                ? "bg-zinc-800 dark:bg-zinc-700 opacity-90 cursor-not-allowed"
                : "bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white dark:text-zinc-950 active:scale-[0.99]"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Switch to Signup */}
        <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800 text-center text-xs text-zinc-500 dark:text-zinc-400">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-semibold text-zinc-900 dark:text-zinc-100 hover:underline"
          >
            Sign up
          </Link>
        </div>
      </div>

      {/* Forgot Password Modal Dialog */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl space-y-4 animate-modal">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Reset your password
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Enter your email address and we will send you a link to reset your account password.
            </p>

            {resetMessage && (
              <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs text-zinc-800 dark:text-zinc-200">
                {resetMessage}
              </div>
            )}

            <form onSubmit={handleForgotPassword} className="space-y-3">
              <input
                type="email"
                required
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full h-10 px-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100"
              />
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="px-4 py-2 text-xs font-semibold text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white rounded-lg flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {resetLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Send Reset Link</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans">
      <Suspense
        fallback={
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
