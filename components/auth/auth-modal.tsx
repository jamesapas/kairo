"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, AlertCircle, CheckCircle2, Eye, EyeOff, X } from "lucide-react";
import { KairoLogo } from "@/components/ui/logo";

interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  rightElement?: React.ReactNode;
}

function FloatingInput({
  label,
  rightElement,
  value,
  type,
  onChange,
  onFocus,
  onBlur,
  className,
  ...props
}: FloatingInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = Boolean(value && String(value).length > 0);
  const isFloated = isFocused || hasValue;

  return (
    <div
      className={`group relative flex items-center h-12 bg-white dark:bg-zinc-800/80 border rounded-xl transition-all duration-200 ${
        isFocused
          ? "border-zinc-900 dark:border-zinc-100 ring-2 ring-zinc-900/10 dark:ring-zinc-100/10 shadow-xs"
          : "border-zinc-200 dark:border-zinc-700/80 hover:border-zinc-300 dark:hover:border-zinc-600"
      }`}
    >
      <label
        className={`absolute left-4 pointer-events-none transition-all duration-200 ease-out select-none ${
          isFloated
            ? "top-1.5 -translate-y-0 text-[10px] font-medium text-zinc-500 dark:text-zinc-400"
            : "top-1/2 -translate-y-1/2 text-sm font-normal text-zinc-400 dark:text-zinc-500"
        }`}
      >
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={onChange}
        onFocus={(e) => {
          setIsFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          onBlur?.(e);
        }}
        className={`w-full h-full bg-transparent px-4 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none transition-all pt-4 pb-1 ${
          rightElement ? "pr-11" : "pr-4"
        } ${className || ""}`}
        {...props}
      />

      {rightElement && (
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center">
          {rightElement}
        </div>
      )}
    </div>
  );
}

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "register";
  reason?: string;
}

export function AuthModal({
  isOpen,
  onClose,
  initialMode = "login",
  reason,
}: AuthModalProps) {
  const router = useRouter();
  const [isRendered, setIsRendered] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      setIsClosing(false);
      setMode(initialMode);
      setErrorMsg("");
      setSuccessMsg("");
    } else if (isRendered) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setIsRendered(false);
        setIsClosing(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initialMode, isRendered]);

  const handleClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsRendered(false);
      setIsClosing(false);
    }, 200);
  }, [isClosing, onClose]);

  useEffect(() => {
    if (!isRendered) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isClosing) {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isRendered, isClosing, handleClose]);

  if (!isRendered) return null;

  const handleTabSwitch = (newMode: "login" | "register") => {
    setMode(newMode);
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    const supabase = createClient();

    if (mode === "register") {
      if (password.length < 6) {
        setErrorMsg("Password must be at least 6 characters.");
        setLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        setErrorMsg("Passwords do not match.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        setErrorMsg(error.message || "Registration failed.");
        setLoading(false);
      } else {
        if (data.user && !data.session) {
          setSuccessMsg("Account created! Please check your email to confirm your account.");
          setLoading(false);
        } else {
          setSuccessMsg("Account created! Logging you in...");
          handleClose();
          router.refresh();
        }
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        setErrorMsg(error.message || "Failed to sign in. Please check your credentials.");
        setLoading(false);
      } else {
        handleClose();
        router.refresh();
      }
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
    >
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity ${
          isClosing ? "animate-fade-out" : "animate-fade-in"
        }`}
        onClick={handleClose}
      />

      <div
        ref={modalRef}
        className={`relative z-10 w-full max-w-sm sm:max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-2xl my-auto ${
          isClosing ? "animate-modal-out" : "animate-modal"
        }`}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close"
          className="absolute right-4 top-4 p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-5">
          {/* Brand & Heading */}
          <div className="flex flex-col items-center text-center space-y-2">
            <KairoLogo className="w-12 h-12 rounded-2xl shadow-none border-0" size={48} />
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {mode === "login" ? "Sign in to Kairo" : "Create your Kairo account"}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs">
              {mode === "login"
                ? "Sign in to manage your career journey"
                : "Create an account to get started"}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-xl flex items-center text-xs font-medium border border-zinc-200/50 dark:border-zinc-700/60">
            <button
              type="button"
              onClick={() => handleTabSwitch("login")}
              className={`flex-1 py-2 text-center rounded-lg transition-all cursor-pointer ${
                mode === "login"
                  ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-2xs font-semibold"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => handleTabSwitch("register")}
              className={`flex-1 py-2 text-center rounded-lg transition-all cursor-pointer ${
                mode === "register"
                  ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-2xs font-semibold"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Feedback Messages */}
          {errorMsg && (
            <div className="p-3 px-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200/60 dark:border-red-900/50 text-red-700 dark:text-red-400 text-xs font-medium flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 px-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-xs font-medium flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <FloatingInput
              label="Email address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <FloatingInput
              label={mode === "register" ? "Password (min 6 chars)" : "Password"}
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 focus:outline-none cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />

            {mode === "register" && (
              <FloatingInput
                label="Confirm password"
                type={showPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 flex items-center justify-center px-5 rounded-xl bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-semibold disabled:opacity-50 transition shadow-sm mt-3 cursor-pointer active:scale-[0.99]"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : mode === "login" ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
