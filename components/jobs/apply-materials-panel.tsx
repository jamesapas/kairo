"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Sparkles,
  FileText,
  ListChecks,
  Send,
  Copy,
  Check,
  Edit3,
  Eye,
  RefreshCw,
  Save,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
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

interface ApplyMaterialsPanelProps {
  jobId: string;
  jobTitle?: string;
  company?: string;
  description?: string;
  currentStatus?: JobStatus;
  initialMaterials?: JobApplyMaterialsMap | null;
  onOpenHelpMeApply?: () => void;
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

export function ApplyMaterialsPanel({
  jobId,
  jobTitle,
  company,
  description,
  currentStatus,
  initialMaterials,
  onOpenHelpMeApply,
  onMarkApplied,
  onMaterialsUpdated,
}: ApplyMaterialsPanelProps) {
  const [materialsMap, setMaterialsMap] = useState<JobApplyMaterialsMap>(
    initialMaterials || {}
  );
  const [activeSubTab, setActiveSubTab] = useState<ApplyContentType>("resume-suggestions");
  const [editedContents, setEditedContents] = useState<Partial<Record<ApplyContentType, string>>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAppliedUpdated, setIsAppliedUpdated] = useState(false);

  // Sync initialMaterials
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

      // Default to first saved material if available
      const firstSaved = APPLY_CONTENT_KEYS.find((k) => Boolean(initialMaterials[k]?.content));
      if (firstSaved) {
        setActiveSubTab(firstSaved);
      }
    }
  }, [initialMaterials]);

  // Generate single material
  const handleGenerateMaterial = async (type: ApplyContentType) => {
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
        throw new Error(resData.error || `Failed to generate ${APPLY_CONTENT_TYPES[type].title}.`);
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
      console.error("Material Generation Error:", err);
      setError((err as Error)?.message || "Failed to generate material.");
    } finally {
      setIsLoading(false);
    }
  };

  // Save edits
  const handleSaveEdits = async () => {
    if (!jobId) return;
    const currentText = editedContents[activeSubTab] || "";
    setIsSaving(true);
    setError(null);

    try {
      const res = await saveApplyMaterialAction(jobId, activeSubTab, {
        content: currentText,
        title: materialsMap[activeSubTab]?.title || APPLY_CONTENT_TYPES[activeSubTab].title,
        keyPointsUsed: materialsMap[activeSubTab]?.keyPointsUsed,
      });

      if (!res.success) {
        throw new Error(res.error || "Failed to save edits.");
      }

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);

      const nextMaterialsMap = {
        ...materialsMap,
        [activeSubTab]: {
          title: materialsMap[activeSubTab]?.title || APPLY_CONTENT_TYPES[activeSubTab].title,
          content: currentText,
          keyPointsUsed: materialsMap[activeSubTab]?.keyPointsUsed,
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
    const textToCopy = editedContents[activeSubTab] || materialsMap[activeSubTab]?.content || "";
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2400);
  }, [activeSubTab, editedContents, materialsMap]);

  const handleMarkApplied = () => {
    if (onMarkApplied) {
      onMarkApplied();
      setIsAppliedUpdated(true);
    }
  };

  const currentContent =
    editedContents[activeSubTab] ?? materialsMap[activeSubTab]?.content ?? "";
  const isCurrentModified =
    materialsMap[activeSubTab]?.content !== undefined &&
    editedContents[activeSubTab] !== undefined &&
    editedContents[activeSubTab] !== materialsMap[activeSubTab]?.content;

  const currentWordCount = currentContent.trim()
    ? currentContent.trim().split(/\s+/).length
    : 0;

  const hasCurrentContent = Boolean(currentContent.trim());

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-7 border border-zinc-200/90 dark:border-zinc-800 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3.5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h2 className="text-xs uppercase font-bold tracking-wider text-zinc-500 dark:text-zinc-400">
            Help Me Apply
          </h2>
        </div>

        {onOpenHelpMeApply && (
          <button
            type="button"
            onClick={onOpenHelpMeApply}
            className="px-3.5 py-1.5 rounded-xl text-xs bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-white font-bold shadow-[0_4px_24px_rgba(249,115,22,0.4),0_0_12px_rgba(244,63,94,0.3)] hover:shadow-[0_6px_32px_rgba(249,115,22,0.6)] border border-amber-300/40 transition flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Help Me Apply</span>
          </button>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p className="flex-1">{error}</p>
        </div>
      )}

      {/* Sub-Tabs Switcher */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-1 bg-zinc-100 dark:bg-zinc-800/70 border border-zinc-200/80 dark:border-zinc-700/80 rounded-2xl">
        {APPLY_CONTENT_KEYS.map((key) => {
          const config = APPLY_CONTENT_TYPES[key];
          const Icon = CONTENT_TYPE_ICONS[key];
          const isActive = activeSubTab === key;
          const isReady = Boolean(materialsMap[key]?.content);

          return (
            <button
              key={key}
              type="button"
              onClick={() => {
                setActiveSubTab(key);
                setIsEditing(false);
              }}
              className={`p-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between gap-2 cursor-pointer ${
                isActive
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{config.shortLabel}</span>
              </div>

              {isReady ? (
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 shrink-0">
                  Ready
                </span>
              ) : (
                <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-zinc-200/70 dark:bg-zinc-700/60 text-zinc-500 dark:text-zinc-400 shrink-0">
                  Empty
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Material Workspace Content */}
      {isLoading ? (
        <div className="py-16 space-y-4 text-center">
          <div className="relative w-12 h-12 mx-auto flex items-center justify-center">
            <div className="w-12 h-12 rounded-full border-2 border-amber-100 dark:border-amber-950/60 border-t-orange-500 animate-spin" />
            <Sparkles className="w-3.5 h-3.5 absolute text-orange-500" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
              Generating {APPLY_CONTENT_TYPES[activeSubTab].title}...
            </p>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Tailoring verified candidate experience to role specifications
            </p>
          </div>
        </div>
      ) : hasCurrentContent ? (
        <div className="space-y-3.5">
          {/* Action Ribbon */}
          <div className="flex items-center justify-between text-xs text-zinc-500 gap-2 flex-wrap">
            <span className="text-[11px] font-medium">
              {currentWordCount} words {isCurrentModified && "• (Unsaved edits)"}
            </span>

            <div className="flex items-center gap-1.5">
              {/* Save Edits */}
              {isCurrentModified && jobId && (
                <button
                  type="button"
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
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium flex items-center gap-1 cursor-pointer transition hover:bg-zinc-50"
              >
                {isEditing ? <Eye className="w-3 h-3" /> : <Edit3 className="w-3 h-3" />}
                <span>{isEditing ? "Preview" : "Edit"}</span>
              </button>

              {/* Regenerate Button */}
              <button
                type="button"
                onClick={() => handleGenerateMaterial(activeSubTab)}
                disabled={isLoading}
                title="Regenerate this material"
                className="px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs font-medium flex items-center gap-1 cursor-pointer transition hover:bg-zinc-50"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Regenerate</span>
              </button>

              {/* Copy Button */}
              <button
                type="button"
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
              rows={12}
              value={editedContents[activeSubTab] ?? ""}
              onChange={(e) =>
                setEditedContents((prev) => ({ ...prev, [activeSubTab]: e.target.value }))
              }
              className="w-full text-xs sm:text-sm p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100 font-medium focus:border-zinc-500 focus:outline-hidden resize-y min-h-[260px] leading-relaxed"
              placeholder="Edit content here..."
            />
          ) : (
            <div
              onClick={() => setIsEditing(true)}
              className="p-5 rounded-2xl bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800 text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed whitespace-pre-line cursor-text min-h-[220px]"
            >
              {currentContent}
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="py-12 px-6 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20 text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-100/60 dark:bg-amber-950/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Sparkles className="w-6 h-6" />
          </div>

          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              No {APPLY_CONTENT_TYPES[activeSubTab].title} generated yet
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {APPLY_CONTENT_TYPES[activeSubTab].description}
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleGenerateMaterial(activeSubTab)}
            disabled={isLoading}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-white shadow-[0_4px_24px_rgba(249,115,22,0.4)] text-xs font-bold transition inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate {APPLY_CONTENT_TYPES[activeSubTab].shortLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Mark as Applied Quick Action */}
      {currentStatus === "saved" && onMarkApplied && hasCurrentContent && (
        <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/50 flex items-center justify-between gap-3 text-xs">
          <div className="min-w-0">
            <p className="font-bold text-blue-950 dark:text-blue-200">
              Applied with these materials?
            </p>
            <p className="text-[11px] text-blue-700 dark:text-blue-300 truncate">
              Move this application directly to Applied.
            </p>
          </div>
          <button
            type="button"
            onClick={handleMarkApplied}
            disabled={isAppliedUpdated}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0 ${
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
  );
}
