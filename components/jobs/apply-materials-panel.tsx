"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
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
  Download,
  X,
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
import { downloadCoverLetterPdf } from "@/lib/utils/cover-letter-pdf";
import { downloadResumePdf } from "@/lib/utils/resume-pdf";

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

function renderCoverLetterContent(content: string) {
  const normalized = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
  if (!normalized) return null;

  const blocks = normalized.split(/\n\s*\n+/);

  return (
    <div className="space-y-5 font-sans text-zinc-900 dark:text-zinc-100">
      {blocks.map((rawBlock, bIdx) => {
        const block = rawBlock.trim();
        if (!block) return null;

        // Block 1: Candidate Header (First block)
        if (bIdx === 0) {
          const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
          const firstLine = lines[0] || "";
          const isCandidateName =
            firstLine.length > 0 &&
            (firstLine === firstLine.toUpperCase() ||
              /^[A-Z\s.-]+$/i.test(firstLine));

          if (isCandidateName) {
            return (
              <div key={bIdx} className="space-y-0.5 pb-1">
                <h3 className="text-sm sm:text-base font-bold tracking-tight uppercase text-zinc-950 dark:text-zinc-50">
                  {firstLine}
                </h3>
                {lines.slice(1).map((l, lIdx) => (
                  <p key={lIdx} className="text-xs sm:text-[13px] text-zinc-800 dark:text-zinc-200 font-normal">
                    {l}
                  </p>
                ))}
              </div>
            );
          }
        }

        // Subject line ("Re: ... Application")
        if (/^re:/i.test(block)) {
          return (
            <div key={bIdx}>
              <p className="text-xs sm:text-[13px] font-bold text-zinc-950 dark:text-zinc-50">
                {block}
              </p>
            </div>
          );
        }

        // Formal sign-off ("Sincerely,\nJames Karl Apas")
        if (
          /^(sincerely|best regards|warm regards|regards|respectfully|thank you),?/i.test(block)
        ) {
          const signLines = block.split("\n").map((l) => l.trim()).filter(Boolean);
          return (
            <div key={bIdx} className="space-y-3 pt-2">
              <p className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 font-normal">
                {signLines[0]}
              </p>
              {signLines.slice(1).map((s, sIdx) => (
                <p key={sIdx} className="text-xs sm:text-sm font-bold text-zinc-950 dark:text-zinc-50">
                  {s}
                </p>
              ))}
            </div>
          );
        }

        // Multi-line Date & Recipient block
        const linesInBlock = block.split("\n").map((l) => l.trim()).filter(Boolean);
        const looksLikeDateOrRecipient =
          linesInBlock.length >= 2 &&
          linesInBlock.length <= 6 &&
          linesInBlock.some(
            (l) =>
              /^(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d+/i.test(l) ||
              /hiring|manager|director|recruiter|team|inc|llc|co|ltd|corp/i.test(l)
          );

        if (looksLikeDateOrRecipient) {
          return (
            <div key={bIdx} className="space-y-0.5 text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 font-normal">
              {linesInBlock.map((line, lIdx) => (
                <p key={lIdx}>{line}</p>
              ))}
            </div>
          );
        }

        // Standard body paragraph or salutation
        return (
          <p key={bIdx} className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed font-normal">
            {block}
          </p>
        );
      })}
    </div>
  );
}

function renderResumeContent(content: string) {
  const normalized = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
  if (!normalized) return null;
  const lines = normalized.split("\n");

  const headerLines: string[] = [];
  let idx = 0;
  while (idx < lines.length && !lines[idx].trim().match(/^PROFESSIONAL SUMMARY/i)) {
    const line = lines[idx].trim();
    if (line) headerLines.push(line);
    idx++;
  }

  const sections: { title: string; body: string[] }[] = [];
  let currentSectionTitle = "";
  let currentBody: string[] = [];

  while (idx < lines.length) {
    const line = lines[idx].trim();
    if (!line) {
      idx++;
      continue;
    }

    if (line.match(/^[-=_]{3,}$/)) {
      idx++;
      continue;
    }

    const isSectionHeader =
      line.match(/^[A-Z\s/&-]{3,}$/) &&
      (line.includes("SUMMARY") ||
        line.includes("SKILL") ||
        line.includes("EXPERIENCE") ||
        line.includes("EDUCATION") ||
        line.includes("PROJECT"));

    if (isSectionHeader) {
      if (currentSectionTitle) {
        sections.push({ title: currentSectionTitle, body: currentBody });
      }
      currentSectionTitle = line.toUpperCase();
      currentBody = [];
      idx++;
      continue;
    }

    currentBody.push(line);
    idx++;
  }

  if (currentSectionTitle) {
    sections.push({ title: currentSectionTitle, body: currentBody });
  }

  if (headerLines.length > 0) {
    return (
      <div className="space-y-6 font-sans text-zinc-900 dark:text-zinc-100">
        {/* ATS Resume Header */}
        <div className="text-center space-y-1 pb-2">
          <h3 className="text-base sm:text-lg font-bold tracking-tight uppercase text-zinc-950 dark:text-zinc-50">
            {headerLines[0]}
          </h3>
          {headerLines[1] && (
            <p className="text-xs sm:text-sm font-normal text-zinc-800 dark:text-zinc-200">
              {headerLines[1]}
            </p>
          )}
          {headerLines.slice(2).map((l, i) => {
            const parts = l.split("|").map((s) => s.trim()).filter(Boolean);
            return (
              <div key={i} className="flex flex-wrap justify-center items-center gap-1.5 text-xs sm:text-sm font-normal text-zinc-800 dark:text-zinc-200 pt-0.5">
                {parts.map((p, pIdx) => {
                  let href: string | null = null;
                  if (p.includes("@") && !p.includes("/")) {
                    href = `https://mail.google.com/mail/u/0/?fs=1&to=${encodeURIComponent(p)}&tf=cm`;
                  } else if (p.includes(".") || p.startsWith("http")) {
                    href = p.startsWith("http") ? p : `https://${p}`;
                  }
                  return (
                    <span key={pIdx} className="inline-flex items-center gap-1.5">
                      {pIdx > 0 && <span className="text-zinc-400 select-none">|</span>}
                      {href ? (
                        <a
                          href={href}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline text-blue-600 dark:text-blue-400"
                        >
                          {p}
                        </a>
                      ) : (
                        <span>{p}</span>
                      )}
                    </span>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Sections */}
        {sections.map((sec, sIdx) => (
          <div key={sIdx} className="space-y-2">
            {/* Section Header with Black Horizontal Line */}
            <div className="border-b border-black dark:border-white pb-1">
              <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-950 dark:text-zinc-50">
                {sec.title}
              </h4>
            </div>
            {/* Body with subtle gap */}
            <div className="text-xs sm:text-sm leading-relaxed text-zinc-800 dark:text-zinc-200 space-y-1.5 pt-1 font-sans">
              {sec.body.map((p, pIdx) => {
                // Check for categorized line (e.g. "Languages: TypeScript, ...")
                const colonMatch = p.match(/^([^:]+:)\s*(.*)$/);
                if (colonMatch && !p.startsWith("•") && !p.startsWith("-")) {
                  return (
                    <p key={pIdx}>
                      <strong className="font-bold text-zinc-950 dark:text-zinc-50">
                        {colonMatch[1]}
                      </strong>{" "}
                      <span className="font-normal text-zinc-800 dark:text-zinc-200">
                        {colonMatch[2]}
                      </span>
                    </p>
                  );
                }

                // Check for bullet points
                if (p.startsWith("•") || p.startsWith("- ")) {
                  const bulletText = p.replace(/^[•-]\s*/, "");
                  return (
                    <div key={pIdx} className="flex items-start gap-2 pl-1.5">
                      <span className="text-zinc-900 dark:text-zinc-100 font-bold select-none">•</span>
                      <span className="font-normal text-zinc-800 dark:text-zinc-200">
                        {bulletText}
                      </span>
                    </div>
                  );
                }

                // Check for Job Title | Date Range line (e.g. "Junior Web Developer | July 2025 – July 2026")
                if (p.includes("|") && /\b(present|\d{4})\b/i.test(p) && !p.includes(":")) {
                  const [titlePart, datePart] = p.split("|").map((s) => s.trim());
                  return (
                    <div key={pIdx} className="flex items-baseline justify-between gap-4 pt-3.5 first:pt-0">
                      <h5 className="font-bold text-zinc-950 dark:text-zinc-50 text-xs sm:text-sm">
                        {titlePart}
                      </h5>
                      {datePart && (
                        <span className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 font-normal shrink-0">
                          {datePart}
                        </span>
                      )}
                    </div>
                  );
                }

                // Check for Project Title | Link line or other piped project line
                if (p.includes("|") && (/\b(https?:\/\/|www\.)/i.test(p) || sec.title === "PROJECTS") && !p.includes(":")) {
                  const [titlePart, linkPart] = p.split("|").map((s) => s.trim());
                  const displayLink = linkPart ? linkPart.replace(/^https?:\/\//i, "").replace(/\/+$/g, "") : "";
                  const fullUrl = linkPart ? (linkPart.startsWith("http") ? linkPart : `https://${linkPart}`) : "";

                  return (
                    <div key={pIdx} className="flex flex-wrap items-baseline gap-1.5 pt-3.5 first:pt-0">
                      <h5 className="font-bold text-zinc-950 dark:text-zinc-50 text-xs sm:text-sm">
                        {titlePart}
                      </h5>
                      {linkPart && (
                        <>
                          <span className="text-zinc-400 text-xs select-none">|</span>
                          <a
                            href={fullUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:underline font-normal"
                          >
                            {displayLink}
                          </a>
                        </>
                      )}
                    </div>
                  );
                }

                // Check for Project Title without link (under PROJECTS section)
                if (sec.title === "PROJECTS" && !p.startsWith("•") && !p.startsWith("-") && !p.includes(":")) {
                  return (
                    <h5 key={pIdx} className="font-bold text-zinc-950 dark:text-zinc-50 pt-3.5 first:pt-0 text-xs sm:text-sm">
                      {p}
                    </h5>
                  );
                }

                // Check for Company, Location (Workplace Type) line
                if (
                  (p.includes("(") || p.includes(",")) &&
                  !p.startsWith("•") &&
                  !p.startsWith("-") &&
                  !p.includes(":") &&
                  !p.includes("|")
                ) {
                  return (
                    <p key={pIdx} className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 font-normal pb-0.5">
                      {p}
                    </p>
                  );
                }

                return <p key={pIdx}>{p}</p>;
              })}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed whitespace-pre-line select-text font-sans">
      {content}
    </div>
  );
}

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
  const [activeSubTab, setActiveSubTab] = useState<ApplyContentType>(() => {
    if (initialMaterials) {
      const firstSaved = APPLY_CONTENT_KEYS.find((k) => Boolean(initialMaterials[k]?.content));
      if (firstSaved) return firstSaved;
    }
    return "resume-suggestions";
  });
  const [editedContents, setEditedContents] = useState<Partial<Record<ApplyContentType, string>>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAppliedUpdated, setIsAppliedUpdated] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea to fit content without shifting page scroll position
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      const el = textareaRef.current;
      const scrollY = window.scrollY;
      el.style.height = "auto";
      el.style.height = `${Math.max(el.scrollHeight, 120)}px`;
      window.scrollTo(0, scrollY);
    }
  }, [isEditing, activeSubTab]);

  // Sync initialMaterials (preserves current activeSubTab so regenerating doesn't switch tabs)
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
      setIsEditing(false);
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

  const handleCancelEdit = () => {
    setEditedContents((prev) => ({
      ...prev,
      [activeSubTab]: materialsMap[activeSubTab]?.content || "",
    }));
    setIsEditing(false);
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

  const isAnyModified = APPLY_CONTENT_KEYS.some((k) => {
    const saved = materialsMap[k]?.content;
    const edited = editedContents[k];
    return saved !== undefined && edited !== undefined && edited !== saved;
  });

  // Prompt confirmation if user tries to refresh or close tab with unsaved edits
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isAnyModified) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isAnyModified]);

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

            {isEditing ? (
              /* When Editing: Prominent Cancel & Save Actions */
              <div className="flex items-center gap-1.5">
                {/* Cancel Edit Button */}
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  title="Discard edits and exit"
                  className="h-7 px-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold flex items-center gap-1 cursor-pointer transition shadow-2xs active:scale-[0.98]"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>

                {/* Save Edits Button */}
                <button
                  type="button"
                  onClick={handleSaveEdits}
                  disabled={isSaving}
                  title="Save changes"
                  className="h-7 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition shadow-2xs active:scale-[0.98]"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savedSuccess ? "Saved!" : isSaving ? "Saving..." : "Save"}</span>
                </button>
              </div>
            ) : (
              /* When Viewing: Standard Toolbar Actions */
              <div className="flex items-center gap-1.5">
                {/* Regenerate Button (With Label) */}
                <button
                  type="button"
                  onClick={() => handleGenerateMaterial(activeSubTab)}
                  disabled={isLoading}
                  title="Regenerate this material"
                  aria-label="Regenerate"
                  className="h-7 px-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition shadow-2xs active:scale-[0.98]"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                  <span>Regenerate</span>
                </button>

                {/* Download PDF (for Cover Letter or Resume) */}
                {(activeSubTab === "cover-letter" || activeSubTab === "resume-suggestions") && (
                  <button
                    type="button"
                    onClick={() => {
                      if (activeSubTab === "cover-letter") {
                        downloadCoverLetterPdf({
                          content: currentContent,
                          companyName: company,
                          jobTitle: jobTitle,
                        });
                      } else {
                        downloadResumePdf({
                          content: currentContent,
                          jobTitle: jobTitle,
                        });
                      }
                    }}
                    title={
                      activeSubTab === "cover-letter"
                        ? "Download Cover Letter as formatted PDF (Arial)"
                        : "Download ATS Resume as formatted PDF (Arial)"
                    }
                    className="h-7 px-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition shadow-2xs active:scale-[0.98]"
                  >
                    <Download className="w-3.5 h-3.5 text-rose-500" />
                    <span>PDF</span>
                  </button>
                )}

                {/* Edit Button (Icon Only) */}
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  title="Edit text"
                  aria-label="Edit text"
                  className="h-7 w-7 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 flex items-center justify-center cursor-pointer transition shadow-2xs active:scale-[0.98]"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>

                {/* Copy Button (Icon Only) */}
                <button
                  type="button"
                  onClick={handleCopy}
                  title={copied ? "Copied to clipboard!" : "Copy to clipboard"}
                  aria-label={copied ? "Copied" : "Copy"}
                  className={`h-7 w-7 rounded-lg border flex items-center justify-center cursor-pointer transition shadow-2xs active:scale-[0.98] ${
                    copied
                      ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400"
                      : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}
          </div>

          {/* Text Canvas / Document Container */}
          {isEditing ? (
            <textarea
              ref={textareaRef}
              value={editedContents[activeSubTab] ?? ""}
              onChange={(e) => {
                const val = e.target.value;
                setEditedContents((prev) => ({ ...prev, [activeSubTab]: val }));
                const el = e.target;
                const scrollY = window.scrollY;
                el.style.height = "auto";
                el.style.height = `${Math.max(el.scrollHeight, 120)}px`;
                window.scrollTo(0, scrollY);
              }}
              className="w-full text-xs sm:text-sm p-6 sm:p-8 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100 font-medium focus:border-zinc-500 focus:outline-hidden resize-none overflow-hidden leading-relaxed font-sans"
              placeholder="Edit content here..."
            />
          ) : (
            <div className="w-full p-6 sm:p-8 md:p-10 rounded-2xl bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 select-text transition-all">
              {activeSubTab === "resume-suggestions" ? (
                renderResumeContent(currentContent)
              ) : activeSubTab === "cover-letter" ? (
                renderCoverLetterContent(currentContent)
              ) : (
                <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-line font-sans">
                  {currentContent}
                </div>
              )}
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
