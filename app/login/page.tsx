"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";
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
      className={`group relative flex items-center h-12 bg-white border rounded-xl transition-all duration-200 ${
        isFocused
          ? "border-zinc-900 ring-2 ring-zinc-900/10 shadow-xs"
          : "border-zinc-200 hover:border-zinc-300"
      }`}
    >
      <label
        className={`absolute left-4 pointer-events-none transition-all duration-200 ease-out select-none ${
          isFloated
            ? "top-1.5 -translate-y-0 text-[10px] font-medium text-zinc-500"
            : "top-1/2 -translate-y-1/2 text-sm font-normal text-zinc-400"
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
        className={`w-full h-full bg-transparent px-4 text-sm text-zinc-900 focus:outline-none transition-all pt-4 pb-1 ${
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

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

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
          router.push("/");
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
        router.push("/");
        router.refresh();
      }
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col justify-center items-center p-6 font-sans text-zinc-900">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo and App Title */}
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="flex justify-center">
            <KairoLogo className="w-14 h-14 rounded-2xl shadow-none border-0" size={56} />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900">Kairo</h1>
          <p className="text-xs text-zinc-500">
            {mode === "login" ? "Sign in to manage your career journey" : "Create an account to get started"}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="bg-zinc-200/70 p-1 rounded-xl flex items-center text-xs font-medium">
          <button
            type="button"
            onClick={() => handleTabSwitch("login")}
            className={`flex-1 py-2 text-center rounded-lg transition-all cursor-pointer ${
              mode === "login"
                ? "bg-white text-zinc-900 shadow-sm font-semibold"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => handleTabSwitch("register")}
            className={`flex-1 py-2 text-center rounded-lg transition-all cursor-pointer ${
              mode === "register"
                ? "bg-white text-zinc-900 shadow-sm font-semibold"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Feedback Messages */}
        {errorMsg && (
          <div className="p-3.5 px-4 rounded-xl bg-red-50 border border-red-200/60 text-red-700 text-xs font-medium flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 px-4 rounded-xl bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs font-medium flex items-start gap-2.5">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
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
                className="text-zinc-400 hover:text-zinc-600 focus:outline-none cursor-pointer"
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
            className="w-full h-12 flex items-center justify-center px-5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-semibold disabled:opacity-50 transition shadow-sm mt-3 cursor-pointer"
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
  );
}
