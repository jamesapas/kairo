"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Sparkles,
  X,
  Copy,
  Check,
  RefreshCw,
  FileText,
  Send,
  Target,
  UserCheck,
  HelpCircle,
  AlertCircle,
  ChevronLeft,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";
import {
  ApplyContentType,
  ApplyContentResponse,
  APPLY_CONTENT_TYPES,
} from "@/types/ai-apply";

interface HelpMeApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId?: string;
  jobTitle?: string;
  company?: string;
  description?: string;
}

const CONTENT_TYPE_ICONS: Record<
  ApplyContentType,
  React.ComponentType<{ className?: string }>
> = {
  "cover-letter": FileText,
  "application-message": Send,
  "why-good-fit": Target,
  "tell-me-about-yourself": UserCheck,
  "custom-question": HelpCircle,
};

const LOADING_STEPS = [
  "Retrieving verified profile & employment history...",
  "Aligning your experience with role requirements...",
  "Applying verified skills and key strengths...",
  "Crafting high-signal application materials...",
];

export function HelpMeApplyModal({
  isOpen,
  onClose,
  jobId,
  jobTitle,
  company,
  description,
}: HelpMeApplyModalProps) {
  const [selectedType, setSelectedType] = useState<ApplyContentType>("cover-letter");
  const [customQuestion, setCustomQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ApplyContentResponse | null>(null);
  const [copied, setCopied] = useState(false);

  // Reset state when opening/closing
  useEffect(() => {
    if (!isOpen) {
      setError(null);
      setCopied(false);
    }
  }, [isOpen]);

  // Loading animation step interval
  useEffect(() => {
    if (!isLoading) {
      setLoadingStep(0);
      return;
    }
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev + 1) % LOADING_STEPS.length);
    }, 1400);
    return () => clearInterval(interval);
  }, [isLoading]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  const handleGenerate = async (typeToGenerate = selectedType) => {
    if (typeToGenerate === "custom-question" && !customQuestion.trim()) {
      setError("Please enter the specific application question first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setCopied(false);

    try {
      const response = await fetch("/api/ai/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId,
          jobTitle,
          company,
          description,
          contentType: typeToGenerate,
          customQuestion: typeToGenerate === "custom-question" ? customQuestion.trim() : undefined,
        }),
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData.error || "Failed to generate application copy.");
      }

      setResult(resData.data);
    } catch (err: unknown) {
      console.error("AI Apply Error:", err);
      setError((err as Error)?.message || "Something went wrong while generating.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = useCallback(() => {
    if (!result?.content) return;
    navigator.clipboard.writeText(result.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2400);
  }, [result]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={() => !isLoading && onClose()}
      />

      {/* Modal Card */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-3xl bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 shadow-2xl overflow-hidden z-10 my-auto flex flex-col max-h-[92vh] transition-all animate-scale-up"
      >
        {/* Modal Header */}
        <div className="px-6 py-4.5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-4 bg-zinc-50/70 dark:bg-zinc-900/70">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 text-white shadow-[0_0_16px_rgba(249,115,22,0.45)]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                  Help Me Apply
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 text-[10px] font-semibold uppercase tracking-wider">
                  <ShieldCheck className="w-3 h-3 text-zinc-500" />
                  Verified Data
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate flex items-center gap-1.5 mt-0.5">
                {jobTitle && (
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                    {jobTitle}
                  </span>
                )}
                {jobTitle && company && <span>•</span>}
                {company && <span>{company}</span>}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer disabled:opacity-50"
            title="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Error Alert */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-0.5">
                <p className="font-semibold">Generation Failed</p>
                <p className="opacity-90">{error}</p>
              </div>
            </div>
          )}

          {/* VIEW A: Content Selector & Prompt Input */}
          {!result && !isLoading && (
            <div className="space-y-5">
              <div className="space-y-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Select Material
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Generated exclusively from your database profile and job match analysis.
                </p>
              </div>

              {/* 5 Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(Object.keys(APPLY_CONTENT_TYPES) as ApplyContentType[]).map((typeKey) => {
                  const item = APPLY_CONTENT_TYPES[typeKey];
                  const Icon = CONTENT_TYPE_ICONS[typeKey];
                  const isSelected = selectedType === typeKey;

                  return (
                    <button
                      key={typeKey}
                      type="button"
                      onClick={() => {
                        setSelectedType(typeKey);
                        setError(null);
                      }}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                        isSelected
                          ? "shadow-sm ring-1 ring-black/5 dark:ring-white/10 bg-gradient-to-br from-amber-50/80 via-orange-50/50 to-rose-50/30 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-rose-950/20 border-amber-300/80 dark:border-amber-800 text-amber-950 dark:text-amber-100 border-amber-400 dark:border-amber-600"
                          : "bg-zinc-50/60 dark:bg-zinc-800/30 border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100"
                      } ${typeKey === "custom-question" ? "sm:col-span-2" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={`p-1.5 rounded-lg shrink-0 ${
                              isSelected
                                ? "bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 text-white shadow-[0_0_12px_rgba(249,115,22,0.4)]"
                                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <h4 className="text-xs font-bold truncate">
                            {item.title}
                          </h4>
                        </div>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border shrink-0 ${
                            isSelected
                              ? "bg-black/10 dark:bg-white/15 text-current border-current/20"
                              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700"
                          }`}
                        >
                          {item.badge}
                        </span>
                      </div>

                      <p
                        className={`text-[11px] leading-relaxed font-normal ${
                          isSelected
                            ? "opacity-90 font-medium"
                            : "text-zinc-500 dark:text-zinc-400"
                        }`}
                      >
                        {item.description}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Custom Question Textarea */}
              {selectedType === "custom-question" && (
                <div className="space-y-2 p-3.5 rounded-2xl border bg-gradient-to-br from-amber-50/80 via-orange-50/50 to-rose-50/30 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-rose-950/20 border-amber-300/80 dark:border-amber-800 text-amber-950 dark:text-amber-100 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="custom-question-input"
                      className="text-xs font-bold flex items-center gap-1.5"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-orange-500" />
                      <span>Screening or Application Question</span>
                    </label>
                    <span className="text-[10px] opacity-75">Required</span>
                  </div>
                  <textarea
                    id="custom-question-input"
                    rows={3}
                    value={customQuestion}
                    onChange={(e) => setCustomQuestion(e.target.value)}
                    placeholder="e.g. 'Describe a challenging engineering roadblock you solved, what stack you used, and what the measurable outcome was.'"
                    className="w-full text-xs p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition resize-none"
                  />
                  <p className="text-[11px] opacity-80">
                    Kairo will craft a direct answer grounded entirely in your database work experience and skills.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* VIEW B: Loading Animation */}
          {isLoading && (
            <div className="py-12 space-y-5 text-center">
              <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                <div className="w-14 h-14 rounded-full border-3 border-amber-100 dark:border-amber-950/60 border-t-orange-500 animate-spin" />
                <Sparkles className="w-4 h-4 absolute animate-pulse text-orange-500" />
              </div>

              <div className="space-y-1 max-w-md mx-auto">
                <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center justify-center gap-1.5">
                  <span>Generating {APPLY_CONTENT_TYPES[selectedType].shortLabel}</span>
                  <span className="flex space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:-0.3s] bg-gradient-to-r from-amber-400 to-rose-400" />
                    <span className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:-0.15s] bg-gradient-to-r from-amber-400 to-rose-400" />
                    <span className="w-1.5 h-1.5 rounded-full animate-bounce bg-gradient-to-r from-amber-400 to-rose-400" />
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  {LOADING_STEPS[loadingStep]}
                </p>
              </div>

              <div className="space-y-2 max-w-md mx-auto pt-2">
                <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg animate-pulse" />
                <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg animate-pulse w-4/5 mx-auto" />
              </div>
            </div>
          )}

          {/* VIEW C: Result View */}
          {result && !isLoading && (
            <div className="space-y-4 animate-fade-in">
              {/* Result Meta Banner */}
              <div className="p-3.5 rounded-2xl bg-zinc-50/80 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  {(() => {
                    const Icon = CONTENT_TYPE_ICONS[result.contentType];
                    return (
                      <div className="p-2 rounded-xl shrink-0 bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 text-white shadow-[0_0_12px_rgba(249,115,22,0.4)]">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                    );
                  })()}
                  <div>
                    <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      {APPLY_CONTENT_TYPES[result.contentType].title}
                    </h3>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Tailored for {company || "Target Role"} • Ready to copy
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleGenerate(result.contentType)}
                    disabled={isLoading}
                    title="Regenerate variation"
                    className="px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-xs font-medium transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <RefreshCw className="w-3 h-3 text-zinc-400" />
                    <span>Regenerate</span>
                  </button>
                  <button
                    onClick={handleCopy}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
                      copied
                        ? "bg-emerald-600 text-white"
                        : "bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-white shadow-[0_4px_24px_rgba(249,115,22,0.5)] border border-amber-300/40"
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Text</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Verified Strengths Leveraged Pills */}
              {result.keyPointsUsed && result.keyPointsUsed.length > 0 && (
                <div className="p-3 rounded-2xl bg-zinc-50/60 dark:bg-zinc-800/30 border border-zinc-200/60 dark:border-zinc-800 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    <Zap className="w-3.5 h-3.5 text-orange-500" />
                    <span>Verified Profile Strengths Emphasized</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {result.keyPointsUsed.map((point, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700/80 text-[11px] font-medium shadow-2xs"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        {point}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Generated Content Canvas */}
              <div className="p-5 rounded-2xl bg-white dark:bg-zinc-800/40 border border-zinc-200/90 dark:border-zinc-800 shadow-inner">
                <div className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed whitespace-pre-line font-normal selection:bg-orange-100 dark:selection:bg-orange-950/60">
                  {result.content}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/70 flex items-center justify-between gap-3">
          {result ? (
            <>
              <button
                onClick={() => {
                  setResult(null);
                  setError(null);
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer flex items-center gap-1.5"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Choose Another Material</span>
              </button>

              <button
                onClick={handleCopy}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
                  copied
                    ? "bg-emerald-600 text-white"
                    : "bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-white shadow-[0_4px_24px_rgba(249,115,22,0.5)] border border-amber-300/40"
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied to Clipboard</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy All</span>
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={() => handleGenerate(selectedType)}
                disabled={
                  isLoading ||
                  (selectedType === "custom-question" && !customQuestion.trim())
                }
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-white shadow-[0_4px_24px_rgba(249,115,22,0.5),0_0_12px_rgba(244,63,94,0.35)] hover:shadow-[0_6px_32px_rgba(249,115,22,0.7)] border border-amber-300/40 transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <Sparkles className="w-3.5 h-3.5 opacity-90 group-hover:rotate-12 transition-transform" />
                <span>Generate Material</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-90 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
