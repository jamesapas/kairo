"use client";

import React, { useState } from "react";
import { sendMagicLink } from "@/lib/actions/auth";
import { Sparkles, Mail, ArrowRight, Loader2, AlertCircle, CheckCircle2, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    const res = await sendMagicLink(email);

    if (!res.success) {
      setErrorMsg(res.error || "Access denied.");
    } else {
      setSuccessMsg(res.message || "Magic link sent!");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Background Glow Elements */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-bold mx-auto shadow-lg shadow-indigo-500/25">
            <Sparkles className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">
              Kairo
            </h1>
            <p className="text-sm text-slate-400 font-medium mt-1">
              Personal AI Career Assistant
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 border border-slate-800 shadow-2xl space-y-6">
          <div className="space-y-2 border-b border-slate-800 pb-5">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 bg-indigo-950/60 px-3 py-1 rounded-full w-fit">
              <ShieldCheck className="h-3.5 w-3.5" /> Authorized Access Only
            </div>
            <h2 className="text-lg font-bold text-slate-100">Sign in with Magic Link</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enter your authorized email address to receive a secure sign-in link in your inbox.
            </p>
          </div>

          {errorMsg && (
            <div className="p-4 rounded-2xl bg-red-950/50 border border-red-800/80 text-red-300 text-xs font-medium flex items-center gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-4 rounded-2xl bg-emerald-950/50 border border-emerald-800/80 text-emerald-300 text-xs font-medium flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-slate-400" /> Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-600 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 disabled:opacity-50 transition"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Send Magic Link <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center">
            <p className="text-[11px] text-slate-500">
              No password needed. Public registration is disabled.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
