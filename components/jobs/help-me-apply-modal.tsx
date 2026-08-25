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
  AlertCircle,
  ChevronLeft,
  ArrowRight,
  Edit3,
  Eye,
  ListChecks,
  CheckSquare,
  Square,
  Save,
  CheckCircle2,
} from "lucide-react";
import {
  ApplyContentType,
  ApplyContentResponse,
  APPLY_CONTENT_TYPES,
  APPLY_CONTENT_KEYS,
  JobApplyMaterialsMap,
} from "@/types/ai-apply";
import { JobStatus } from "@/types/job";
import { saveApplyMaterialAction } from "@/lib/actions/jobs";

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
  currentStatus,
  initialMaterials,
  onMarkApplied,
  onMaterialsUpdated,
}: HelpMeApplyModalProps) {
  const [isRendered, setIsRendered] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);

  // Multi-select state
  const [selectedTypes, setSelectedTypes] = useState<Set<ApplyContentType>>(
    new Set(["resume-suggestions", "cover-letter"])
  );
  const [activeTab, setActiveTab] = useState<ApplyContentType>("resume-suggestions");
  const [materialsMap, setMaterialsMap] = useState<JobApplyMaterialsMap>(
    initialMaterials || {}
  );

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit state per content type
  const [editedContents, setEditedContents] = useState<Partial<Record<ApplyContentType, string>>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [isViewingResults, setIsViewingResults] = useState(false);
  const [isAppliedUpdated, setIsAppliedUpdated] = useState(false);

  // Sync initialMaterials whenever opening or prop changes
  useEffect(() => {
    if (initialMaterials) {
      setMaterialsMap(initialMaterials);
      const initialEdits: Partial<Record<ApplyContentType, string>> = {};
      for (const k of APPLY_CONTENT_KEYS) {
        if (initialMaterials[k]?.content) {
          initialEdits[k] = initialMaterials[k]?.content;
        }
      }
      setEditedContents(initialEdits);

      // If existing materials already exist, default to viewing them
      const hasAnySaved = APPLY_CONTENT_KEYS.some((k) => Boolean(initialMaterials[k]?.content));
      if (hasAnySaved) {
        const firstSaved = APPLY_CONTENT_KEYS.find((k) => Boolean(initialMaterials[k]?.content));
        if (firstSaved) setActiveTab(firstSaved);
      }
    }
  }, [initialMaterials]);

  // Handle open/close animation states
  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      setIsClosing(false);
    } else if (isRendered) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setIsRendered(false);
        setIsClosing(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isRendered]);

  const handleClose = useCallback(() => {
    if (isClosing || isLoading) return;
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsRendered(false);
      setIsClosing(false);
      setError(null);
      setCopied(false);
      setIsAppliedUpdated(false);
      setSavedSuccess(false);
      setIsEditing(false);
    }, 200);
  }, [isClosing, isLoading, onClose]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isRendered && !isClosing && !isLoading) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isRendered, isClosing, isLoading, handleClose]);

  // Toggle selection for multi-select
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

  // Generate all selected materials in parallel
  const handleGenerateSelected = async () => {
    if (selectedTypes.size === 0) {
      setError("Please select at least one material to generate.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setCopied(false);
    setSavedSuccess(false);

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
          throw new Error(resData.error || `Failed to generate ${APPLY_CONTENT_TYPES[type].title}.`);
        }
        return resData.data as ApplyContentResponse;
      });

      const results = await Promise.all(requests);

      // Merge into materialsMap & editedContents
      const nextMaterialsMap = { ...materialsMap };
      const nextEdits = { ...editedContents };

      for (const res of results) {
        nextMaterialsMap[res.contentType] = {
          title: res.title,
          content: res.content,
          keyPointsUsed: res.keyPointsUsed,
          updatedAt: res.generatedAt,
        };
        nextEdits[res.contentType] = res.content;
      }

      setMaterialsMap(nextMaterialsMap);
      setEditedContents(nextEdits);
      setActiveTab(typesToGenerate[0]);
      setIsViewingResults(true);
      setIsEditing(false);

      if (onMaterialsUpdated) {
        onMaterialsUpdated(nextMaterialsMap);
      }
    } catch (err: unknown) {
      console.error("AI Apply Generation Error:", err);
      setError((err as Error)?.message || "Something went wrong while generating.");
    } finally {
      setIsLoading(false);
    }
  };

  // Single item regenerate
  const handleRegenerateCurrent = async (type: ApplyContentType) => {
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
          contentType: type,
        }),
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.error || "Failed to regenerate material.");
      }

      const generated = resData.data as ApplyContentResponse;
      const nextMaterialsMap = {
        ...materialsMap,
        [type]: {
          title: generated.title,
          content: generated.content,
          keyPointsUsed: generated.keyPointsUsed,
          updatedAt: generated.generatedAt,
        },
      };
      const nextEdits = {
        ...editedContents,
        [type]: generated.content,
      };

      setMaterialsMap(nextMaterialsMap);
      setEditedContents(nextEdits);
      setIsEditing(false);

      if (onMaterialsUpdated) {
        onMaterialsUpdated(nextMaterialsMap);
      }
    } catch (err: unknown) {
      console.error("Regenerate Error:", err);
      setError((err as Error)?.message || "Failed to regenerate.");
    } finally {
      setIsLoading(false);
    }
  };

  // Save edits to database
  const handleSaveEdits = async () => {
    if (!jobId) return;
    const currentText = editedContents[activeTab] || "";
    setIsSaving(true);
    setError(null);

    try {
      const res = await saveApplyMaterialAction(jobId, activeTab, {
        content: currentText,
        title: materialsMap[activeTab]?.title || APPLY_CONTENT_TYPES[activeTab].title,
        keyPointsUsed: materialsMap[activeTab]?.keyPointsUsed,
      });

      if (!res.success) {
        throw new Error(res.error || "Failed to save edits.");
      }

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);

      const nextMaterialsMap = {
        ...materialsMap,
        [activeTab]: {
          title: materialsMap[activeTab]?.title || APPLY_CONTENT_TYPES[activeTab].title,
          content: currentText,
          keyPointsUsed: materialsMap[activeTab]?.keyPointsUsed,
          updatedAt: new Date().toISOString(),
        },
      };
      setMaterialsMap(nextMaterialsMap);

      if (onMaterialsUpdated) {
        onMaterialsUpdated(nextMaterialsMap);
      }
    } catch (err: unknown) {
      console.error("Save Edits Error:", err);
      setError((err as Error)?.message || "Failed to save edits.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = useCallback(() => {
    const textToCopy = editedContents[activeTab] || materialsMap[activeTab]?.content || "";
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2400);
  }, [activeTab, editedContents, materialsMap]);

  const handleMarkApplied = () => {
    if (onMarkApplied) {
      onMarkApplied();
      setIsAppliedUpdated(true);
    }
  };

  const currentContent = editedContents[activeTab] ?? materialsMap[activeTab]?.content ?? "";
  const isCurrentModified =
    materialsMap[activeTab]?.content !== undefined &&
    editedContents[activeTab] !== undefined &&
    editedContents[activeTab] !== materialsMap[activeTab]?.content;

  const currentWordCount = currentContent.trim()
    ? currentContent.trim().split(/\s+/).length
    : 0;

  // Available tabs that have content or are in selected types
  const availableTabs = APPLY_CONTENT_KEYS.filter(
    (k) => Boolean(materialsMap[k]?.content) || selectedTypes.has(k)
  );

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

      {/* Modal Card - Matches JobModal exact frame & styling */}
      <div
        role="dialog"
        aria-modal="true"
        className={`relative z-10 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden my-auto ${
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
                {jobTitle ? `${jobTitle}${company ? ` at ${company}` : ""}` : "Tailored application materials"}
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
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Error Alert */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p className="flex-1">{error}</p>
            </div>
          )}

          {/* VIEW 1: Selection Form */}
          {!isViewingResults && !isLoading && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Select materials to generate
                </label>
                <span className="text-[11px] text-zinc-400">
                  {selectedTypes.size} selected
                </span>
              </div>

              {/* 3 Ordered Cards: Resume -> Cover Letter -> Application Message */}
              <div className="space-y-2.5">
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

              {/* Quick Jump to Saved Material if any exist */}
              {APPLY_CONTENT_KEYS.some((k) => Boolean(materialsMap[k]?.content)) && (
                <div className="pt-1 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      const firstSaved = APPLY_CONTENT_KEYS.find((k) => Boolean(materialsMap[k]?.content));
                      if (firstSaved) setActiveTab(firstSaved);
                      setIsViewingResults(true);
                    }}
                    className="text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 underline cursor-pointer"
                  >
                    View existing saved materials →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* VIEW 2: Loading State */}
          {isLoading && (
            <div className="py-12 space-y-4 text-center">
              <div className="relative w-12 h-12 mx-auto flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border-2 border-amber-100 dark:border-amber-950/60 border-t-orange-500 animate-spin" />
                <Sparkles className="w-3.5 h-3.5 absolute text-orange-500" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  Generating {selectedTypes.size > 1 ? `${selectedTypes.size} Materials` : "Application Material"}...
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Aligning your verified experience with role requirements
                </p>
              </div>
            </div>
          )}

          {/* VIEW 3: Results Workspace with Tabs */}
          {isViewingResults && !isLoading && (
            <div className="space-y-3.5 animate-fade-in">
              {/* Tab Switcher */}
              <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800/70 border border-zinc-200/80 dark:border-zinc-700/80 rounded-2xl">
                {availableTabs.map((tabKey) => {
                  const item = APPLY_CONTENT_TYPES[tabKey];
                  const Icon = CONTENT_TYPE_ICONS[tabKey];
                  const isActive = activeTab === tabKey;

                  return (
                    <button
                      key={tabKey}
                      type="button"
                      onClick={() => {
                        setActiveTab(tabKey);
                        setIsEditing(false);
                      }}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        isActive
                          ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs"
                          : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{item.shortLabel}</span>
                    </button>
                  );
                })}
              </div>

              {/* Action Ribbon above text */}
              <div className="flex items-center justify-between text-xs text-zinc-500 gap-2">
                <span className="text-[11px]">
                  {currentWordCount} words {isCurrentModified && "• (Unsaved edits)"}
                </span>

                <div className="flex items-center gap-1.5">
                  {/* Save Edits */}
                  {isCurrentModified && jobId && (
                    <button
                      onClick={handleSaveEdits}
                      disabled={isSaving}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-1 cursor-pointer transition"
                    >
                      <Save className="w-3 h-3" />
                      <span>{savedSuccess ? "Saved!" : isSaving ? "Saving..." : "Save"}</span>
                    </button>
                  )}

                  {/* Edit / Preview Toggle */}
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium flex items-center gap-1 cursor-pointer transition hover:bg-zinc-50"
                  >
                    {isEditing ? <Eye className="w-3 h-3" /> : <Edit3 className="w-3 h-3" />}
                    <span>{isEditing ? "Preview" : "Edit"}</span>
                  </button>

                  {/* Regenerate Current */}
                  <button
                    onClick={() => handleRegenerateCurrent(activeTab)}
                    disabled={isLoading}
                    title="Regenerate this material"
                    className="px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs font-medium flex items-center gap-1 cursor-pointer transition hover:bg-zinc-50"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Regenerate</span>
                  </button>

                  {/* Copy Button */}
                  <button
                    onClick={handleCopy}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-xs ${
                      copied
                        ? "bg-emerald-600 text-white"
                        : "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white"
                    }`}
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>

              {/* Text Canvas */}
              {isEditing ? (
                <textarea
                  rows={10}
                  value={editedContents[activeTab] ?? ""}
                  onChange={(e) =>
                    setEditedContents((prev) => ({ ...prev, [activeTab]: e.target.value }))
                  }
                  className="w-full text-xs p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100 font-medium focus:border-zinc-500 focus:outline-hidden resize-y min-h-[220px]"
                  placeholder="Edit content here..."
                />
              ) : (
                <div
                  onClick={() => setIsEditing(true)}
                  className="p-4 rounded-2xl bg-zinc-50/70 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/80 text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed whitespace-pre-line cursor-text min-h-[200px]"
                >
                  {currentContent || (
                    <span className="text-zinc-400 italic">No content generated yet for this material.</span>
                  )}
                </div>
              )}

              {/* Mark as Applied Action if saved */}
              {currentStatus === "saved" && onMarkApplied && (
                <div className="p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/50 flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <p className="font-bold text-blue-950 dark:text-blue-200">
                      Applied with these materials?
                    </p>
                    <p className="text-[11px] text-blue-700 dark:text-blue-300 truncate">
                      Move this job directly to Applied.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleMarkApplied}
                    disabled={isAppliedUpdated}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0 ${
                      isAppliedUpdated
                        ? "bg-emerald-600 text-white"
                        : "bg-blue-600 hover:bg-blue-500 text-white"
                    }`}
                  >
                    {isAppliedUpdated ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Applied!</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Mark Applied</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer - Matches JobModal exact styling */}
        <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/80 flex items-center justify-between gap-2.5">
          {isViewingResults ? (
            <>
              <button
                type="button"
                onClick={() => setIsViewingResults(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer flex items-center gap-1.5"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Choose Materials</span>
              </button>

              <button
                type="button"
                onClick={handleCopy}
                className="px-5 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 font-semibold text-xs transition cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Current</span>
              </button>
            </>
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
                onClick={handleGenerateSelected}
                disabled={isLoading || selectedTypes.size === 0}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-white shadow-[0_4px_24px_rgba(249,115,22,0.5),0_0_12px_rgba(244,63,94,0.35)] hover:shadow-[0_6px_32px_rgba(249,115,22,0.7)] border border-amber-300/40 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate ({selectedTypes.size})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
