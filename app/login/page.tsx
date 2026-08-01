"use client";

import React, { useState } from "react";
import Image from "next/image";
import { sendMagicLink } from "@/lib/actions/auth";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

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
    <div className="min-h-screen bg-zinc-50 flex flex-col justify-center items-center p-6 font-sans text-zinc-900">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image
            src="/logo.svg"
            alt="Kairo Logo"
            width={64}
            height={64}
            className="w-16 h-16 rounded-2xl object-contain"
            priority
          />
        </div>

        {errorMsg && (
          <div className="p-3.5 px-5 rounded-full bg-red-50 text-red-700 text-xs font-medium flex items-center justify-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 px-5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium flex items-center justify-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className="w-full py-3 px-5 rounded-full bg-zinc-100 text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition placeholder-zinc-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center py-3 px-5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-semibold disabled:opacity-50 transition"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Send Login Link"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
