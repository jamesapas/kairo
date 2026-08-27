"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Sparkles,
  X,
  AlertCircle,
  FileText,
  Send,
  ListChecks,
  CheckCircle2,
  ArrowRight,
  CheckSquare,
  Square,
} from "lucide-react";
import {
  ApplyContentType,
  ApplyContentResponse,
  APPLY_CONTENT_TYPES,
  APPLY_CONTENT_KEYS,
  JobApplyMaterialsMap,
} from "@/types/ai-apply";
import { JobStatus } from "@/types/job";

interface HelpMeApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId?: string;
  jobTitle?: string;
  company?: string;
  description?: string;
  currentStatus?: JobStatus;
  initialMaterials?: JobApplyMaterialsMap | null;
  onMarkApplied?: () => void;
  onMaterialsUpdated?: (updatedMap: JobApplyMaterialsMap) => void;
}

const CONTENT_TYPE_ICONS: Record<
  ApplyContentType,
  React.ComponentType<{ className?: string }>
> = {
  "resume-suggestions": ListChecks,
  "cover-letter": FileText,
  "application-message": Send,
};

export function HelpMeApplyModal({
  isOpen,
  onClose,
  jobId,
  jobTitle,
  company,
  description,
  initialMaterials,
  onMaterialsUpdated,
}: HelpMeApplyModalProps) {
  const [isRendered, setIsRendered] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);

  const [selectedTypes, setSelectedTypes] = useState<Set<ApplyContentType>>(
    new Set(["resume-suggestions", "cover-letter"])
  );
  const [materialsMap, setMaterialsMap] = useState<JobApplyMaterialsMap>(
    initialMaterials || {}
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasExistingSaved = Array.from(selectedTypes).some((t) =>
    Boolean(materialsMap[t]?.content)
  );

  useEffect(() => {
    if (initialMaterials) {
      setMaterialsMap(initialMaterials);
    }
  }, [initialMaterials]);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      setIsClosing(false);
      setIsSuccess(false);
      setShowRegenerateConfirm(false);
      setError(null);
    } else if (isRendered) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setIsRendered(false);
        setIsClosing(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    if (isClosing || isLoading) return;
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsRendered(false);
      setIsClosing(false);
      setIsSuccess(false);
      setShowRegenerateConfirm(false);
      setError(null);
    }, 200);
  }, [isClosing, isLoading, onClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isRendered && !isClosing && !isLoading) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isRendered, isClosing, isLoading, handleClose]);

  const toggleSelectType = (type: ApplyContentType) => {
    setSelectedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        if (next.size > 1) next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  const handleStartGenerate = () => {
    if (selectedTypes.size === 0) {
      setError("Please select at least one material.");
      return;
    }

    if (hasExistingSaved && !showRegenerateConfirm) {
      setShowRegenerateConfirm(true);
      return;
    }

    handleGenerate();
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setShowRegenerateConfirm(false);
    setError(null);

    try {
      const typesToGenerate = Array.from(selectedTypes);
      const requests = typesToGenerate.map(async (type) => {
        const response = await fetch("/api/ai/apply", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jobId,
            jobTitle,
            company,
            description,
            contentType: type,
          }),
        });

        const resData = await response.json();
        if (!response.ok || !resData.success) {
          throw new Error(
            resData.error || `Failed to generate ${APPLY_CONTENT_TYPES[type].title}.`
          );
        }
        return resData.data as ApplyContentResponse;
      });

      const results = await Promise.all(requests);

      const nextMaterialsMap = { ...(materialsMap || {}) };
      for (const res of results) {
        nextMaterialsMap[res.contentType] = {
          title: res.title,
          content: res.content,
          keyPointsUsed: res.keyPointsUsed,
          updatedAt: res.generatedAt,
        };
      }

      setMaterialsMap(nextMaterialsMap);
      if (onMaterialsUpdated) {
        onMaterialsUpdated(nextMaterialsMap);
      }

      setIsSuccess(true);
    } catch (err: unknown) {
      console.error("AI Apply Generation Error:", err);
      setError((err as Error)?.message || "Something went wrong while generating.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isRendered) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity ${
          isClosing ? "animate-fade-out" : "animate-fade-in"
        }`}
        onClick={handleClose}
      />

      {/* Modal Card */}
      <div
        role="dialog"
        aria-modal="true"
        className={`relative z-10 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl max-w-md w-full overflow-hidden my-auto ${
          isClosing ? "animate-modal-out" : "animate-modal"
        }`}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 text-white shadow-[0_0_12px_rgba(249,115,22,0.45)] shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                Help Me Apply
              </h2>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                {jobTitle ? `${jobTitle}${company ? ` at ${company}` : ""}` : "Generate application materials"}
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            disabled={isLoading}
            className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition cursor-pointer disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Error Alert */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p className="flex-1">{error}</p>
            </div>
          )}

          {/* Success State */}
          {isSuccess ? (
            <div className="py-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Materials Generated!
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">
                  Your tailored materials are ready. You can review, edit, copy, and download them anytime in the materials section.
                </p>
              </div>
            </div>
          ) : isLoading ? (
            /* Loading State */
            <div className="py-8 space-y-3 text-center">
              <div className="relative w-10 h-10 mx-auto flex items-center justify-center">
                <div className="w-10 h-10 rounded-full border-2 border-amber-100 dark:border-amber-950/60 border-t-orange-500 animate-spin" />
                <Sparkles className="w-3.5 h-3.5 absolute text-orange-500" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  {hasExistingSaved ? "Regenerating Materials..." : "Generating Materials..."}
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Tailoring your verified profile to this position
                </p>
              </div>
            </div>
          ) : (
            /* Selection View */
            <div className="space-y-2">
              {APPLY_CONTENT_KEYS.map((typeKey) => {
                const item = APPLY_CONTENT_TYPES[typeKey];
                const Icon = CONTENT_TYPE_ICONS[typeKey];
                const isSelected = selectedTypes.has(typeKey);
                const isSaved = Boolean(materialsMap[typeKey]?.content);

                return (
                  <div
                    key={typeKey}
                    onClick={() => toggleSelectType(typeKey)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? "bg-zinc-50 dark:bg-zinc-800/80 border-amber-400/80 dark:border-amber-600/80 shadow-2xs"
                        : "bg-zinc-50/50 dark:bg-zinc-800/30 border-zinc-200 dark:border-zinc-700/80 hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`p-2 rounded-xl shrink-0 ${
                          isSelected
                            ? "bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 text-white shadow-[0_0_10px_rgba(249,115,22,0.35)]"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                            {item.title}
                          </h3>
                          {isSaved && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                              Saved
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 text-zinc-400">
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-orange-500" />
                      ) : (
                        <Square className="w-4 h-4 text-zinc-300 dark:text-zinc-600" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/80 flex items-center justify-end gap-2.5">
          {isSuccess ? (
            <button
              type="button"
              onClick={handleClose}
              className="w-full py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 font-semibold text-xs transition cursor-pointer shadow-xs"
            >
              Done
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-100/70 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-xs transition cursor-pointer shadow-2xs"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleStartGenerate}
                disabled={isLoading || selectedTypes.size === 0}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-white shadow-[0_4px_24px_rgba(249,115,22,0.5),0_0_12px_rgba(244,63,94,0.35)] hover:shadow-[0_6px_32px_rgba(249,115,22,0.7)] border border-amber-300/40 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{hasExistingSaved ? `Regenerate (${selectedTypes.size})` : `Generate (${selectedTypes.size})`}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Confirmation Modal for Regeneration (Simple, clean, no icon box) */}
      {showRegenerateConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-fade-in"
            onClick={() => setShowRegenerateConfirm(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            className="relative z-10 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl max-w-sm w-full p-6 space-y-4 animate-modal text-center"
          >
            <div className="space-y-1.5 pt-1">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                Regenerate Materials?
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                This will overwrite your existing saved materials for this job with newly generated versions.
              </p>
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowRegenerateConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-xs transition cursor-pointer shadow-2xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-white shadow-[0_4px_20px_rgba(249,115,22,0.45)] text-xs font-bold transition cursor-pointer"
              >
                Regenerate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
