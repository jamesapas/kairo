"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  AlertCircle,
  Edit3,
  Save,
  RotateCcw,
  Play,
  Pause,
  X,
  Plus,
  Minus,
} from "lucide-react";
import { VideoScriptData, VideoScriptSection } from "@/types/ai-apply";

interface VideoScriptViewProps {
  content: string;
  scriptData?: VideoScriptData | null;
  jobTitle?: string;
  company?: string;
  isEditing?: boolean;
  onStartEdit?: () => void;
  onCancelEdit?: () => void;
  onSaveEdit?: () => Promise<void> | void;
  onContentChange?: (newContent: string) => void;
  isSaving?: boolean;
  savedSuccess?: boolean;
  onRegenerateWithNotes?: (notes: string) => Promise<void>;
  isRegenerating?: boolean;
}

export function VideoScriptView({
  content,
  scriptData,
  jobTitle,
  company,
  isEditing = false,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onContentChange,
  isSaving = false,
  savedSuccess = false,
  onRegenerateWithNotes,
  isRegenerating = false,
}: VideoScriptViewProps) {
  const [candidateNotes, setCandidateNotes] = useState(
    scriptData?.candidateNotesUsed || ""
  );
  const [isTeleprompterOpen, setIsTeleprompterOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Teleprompter Modal State
  const [isPlaying, setIsPlaying] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState<number>(1); // 1 to 5 (starts at 1x)
  const [fontSizeIndex, setFontSizeIndex] = useState<number>(2); // 0 = S, 1 = M, 2 = L, 3 = XL
  const teleprompterScrollRef = useRef<HTMLDivElement>(null);
  const scrollPosRef = useRef<number>(0);

  const fontSizes = [
    { label: "S", class: "text-xl leading-relaxed" },
    { label: "M", class: "text-2xl leading-relaxed" },
    { label: "L", class: "text-3xl leading-relaxed" },
    { label: "XL", class: "text-4xl leading-loose" },
  ];

  // Distinct pixels-per-second values: calibrated for comfortable spoken pacing
  // 1x = ~16px/s (~130 words/min natural speech pace), progressing smoothly up to 5x
  const speedTable = [16, 28, 45, 70, 110];
  const speedMultiplier = speedTable[scrollSpeed - 1] || 16;

function formatSectionTitle(title: string): string {
  if (!title) return "";
  return title.replace(/^(\d+[\.\)]\s*|Section\s+\d+[:\s-]*)/i, "").trim();
}

  // Derive dynamic sections directly from current content so user edits are instantly reflected in teleprompter
  const sections: VideoScriptSection[] = useMemo(() => {
    const baseSections = scriptData?.sections || [];
    if (!content || !content.trim()) return baseSections;

    // Check if content matches baseSections joined together
    const baseJoined = baseSections
      .map((s) => s.spokenText.trim())
      .filter(Boolean)
      .join("\n\n");

    // If unmodified, preserve baseSections directly so titles and content never drift
    if (baseSections.length > 0 && content.trim() === baseJoined) {
      return baseSections;
    }

    const paragraphs = content
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);

    if (baseSections.length > 0) {
      return paragraphs.map((para, idx) => {
        const base = baseSections[idx];
        const words = para.split(/\s+/).filter(Boolean).length;
        const estSeconds = Math.max(5, Math.round((words / 140) * 60));

        if (base) {
          return {
            ...base,
            spokenText: para,
            estimatedSeconds: estSeconds,
          };
        }

        return {
          id: `section-${idx + 1}`,
          title: `Section ${idx + 1}`,
          timeRange: `~${estSeconds}s`,
          estimatedSeconds: estSeconds,
          spokenText: para,
          requirementAddressed: "",
          deliveryTip: "",
        };
      });
    }

    return paragraphs.map((para, idx) => {
      const words = para.split(/\s+/).filter(Boolean).length;
      const estSeconds = Math.max(5, Math.round((words / 140) * 60));
      return {
        id: `section-${idx + 1}`,
        title: `Section ${idx + 1}`,
        timeRange: `~${estSeconds}s`,
        estimatedSeconds: estSeconds,
        spokenText: para,
        requirementAddressed: "",
        deliveryTip: "",
      };
    });
  }, [content, scriptData]);

  // Missing application items / questions
  const missingItems = scriptData?.unansweredQuestionsSummary || [];

  // Auto-resize textarea when in edit mode
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      const el = textareaRef.current;
      el.style.height = "auto";
      el.style.height = `${Math.max(el.scrollHeight, 280)}px`;
    }
  }, [isEditing, content]);

  // Keep scroll accumulator in sync with DOM when toggling play or opening modal
  useEffect(() => {
    if (teleprompterScrollRef.current) {
      scrollPosRef.current = teleprompterScrollRef.current.scrollTop;
    }
  }, [isPlaying, isTeleprompterOpen]);

  // Teleprompter Auto-scroll Animation Loop with Sub-Pixel Precision
  useEffect(() => {
    if (!isTeleprompterOpen || !isPlaying) return;

    let animId: number;
    let lastTime = performance.now();

    const scrollStep = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      const container = teleprompterScrollRef.current;
      if (container) {
        scrollPosRef.current += speedMultiplier * dt;
        container.scrollTop = scrollPosRef.current;

        // Auto pause when end of script is reached
        if (
          container.scrollTop + container.clientHeight >=
          container.scrollHeight - 5
        ) {
          setIsPlaying(false);
          return;
        }
      }
      animId = requestAnimationFrame(scrollStep);
    };

    animId = requestAnimationFrame(scrollStep);
    return () => cancelAnimationFrame(animId);
  }, [isTeleprompterOpen, isPlaying, speedMultiplier]);

  // Handle Teleprompter Keyboard Shortcuts (Space to play/pause, Esc to close)
  useEffect(() => {
    if (!isTeleprompterOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsTeleprompterOpen(false);
        setIsPlaying(false);
      } else if (e.code === "Space") {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isTeleprompterOpen]);

  const handleResetScroll = useCallback(() => {
    scrollPosRef.current = 0;
    if (teleprompterScrollRef.current) {
      teleprompterScrollRef.current.scrollTop = 0;
    }
  }, []);

  const handleRefineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateNotes.trim() || !onRegenerateWithNotes || isRegenerating) return;
    await onRegenerateWithNotes(candidateNotes);
  };

  return (
    <div className="space-y-4 select-text">
      {/* ── Personalize & Answer Specific Questions (Always Shown, Clean & Simple) ── */}
      {onRegenerateWithNotes && (
        <div className="p-4 sm:p-5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Personalize & Answer Specific Questions
            </h4>
          </div>

          {missingItems.length > 0 && (
            <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-200">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Explicit Employer Questions</span>
              </div>
              <ul className="space-y-1 text-xs text-amber-950 dark:text-amber-200">
                {missingItems.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                    <span className="leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <form onSubmit={handleRefineSubmit} className="space-y-2.5">
            <textarea
              value={candidateNotes}
              onChange={(e) => setCandidateNotes(e.target.value)}
              placeholder="Add your answers to employer questions, specific project metrics, or personal talking points..."
              rows={2}
              className="w-full text-xs sm:text-sm p-3 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700/80 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-hidden focus:border-amber-500 transition leading-relaxed resize-y"
            />
            <div className="flex items-center justify-end">
              <button
                type="submit"
                disabled={!candidateNotes.trim() || isRegenerating}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-white font-semibold text-xs transition cursor-pointer shadow-sm flex items-center gap-1.5 disabled:opacity-50"
              >
                <RotateCcw
                  className={`w-3.5 h-3.5 ${
                    isRegenerating ? "animate-spin" : ""
                  }`}
                />
                <span>
                  {isRegenerating ? "Regenerating..." : "Regenerate with Details"}
                </span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Script Body: Editable Canvas OR Teleprompter View ── */}
      {isEditing ? (
        /* Manual Editing Mode */
        <div className="p-5 sm:p-7 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-amber-500" />
              <span className="text-xs uppercase font-bold tracking-wider text-zinc-800 dark:text-zinc-200">
                Editing Video Script
              </span>
            </div>

            {/* Launch Auto-Scrolling Teleprompter Popup from Edit Mode */}
            <button
              type="button"
              onClick={() => {
                setIsTeleprompterOpen(true);
                setIsPlaying(false);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white text-xs font-bold transition shadow-xs cursor-pointer active:scale-[0.98]"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Teleprompter</span>
            </button>
          </div>

          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => {
              if (onContentChange) {
                onContentChange(e.target.value);
              }
            }}
            placeholder="Edit your video script text here..."
            className="w-full min-h-[380px] p-4 sm:p-6 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-sans leading-relaxed focus:border-amber-500 focus:outline-hidden resize-y text-xs sm:text-sm"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs text-zinc-500 dark:text-zinc-400">
            <span>You can edit words, timing cues, or details freely.</span>
            <div className="flex items-center gap-2">
              {onCancelEdit && (
                <button
                  type="button"
                  onClick={onCancelEdit}
                  className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold cursor-pointer transition"
                >
                  Cancel
                </button>
              )}
              {onSaveEdit && (
                <button
                  type="button"
                  onClick={onSaveEdit}
                  disabled={isSaving}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1.5 cursor-pointer transition shadow-2xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savedSuccess ? "Saved!" : isSaving ? "Saving..." : "Save Changes"}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Teleprompter View Container */
        <div className="p-5 sm:p-7 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-2xs space-y-6">
          {/* Header Bar: Teleprompter Title & Teleprompter Popup Launcher */}
          <div className="flex items-center justify-between gap-2.5 pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                Teleprompter View
              </h3>
            </div>

            {/* Launch Auto-Scrolling Teleprompter Popup */}
            <button
              type="button"
              onClick={() => {
                setIsTeleprompterOpen(true);
                setIsPlaying(false);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white text-xs font-bold transition shadow-xs cursor-pointer active:scale-[0.98]"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Teleprompter</span>
            </button>
          </div>

          {sections.length > 0 ? (
            <div className="space-y-6 divide-y divide-zinc-100 dark:divide-zinc-800/80">
              {sections.map((sec, sIdx) => (
                <div
                  key={sec.id || sIdx}
                  className={`space-y-3.5 ${sIdx > 0 ? "pt-6" : ""}`}
                >
                  {/* Section Header: Title & Timing Badge */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-[11px] flex items-center justify-center shrink-0 border border-zinc-200 dark:border-zinc-700">
                        {sIdx + 1}
                      </span>
                      <h4 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
                        {formatSectionTitle(sec.title)}
                      </h4>
                    </div>

                    {/* Time Range Badge */}
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                      {sec.timeRange || `~${sec.estimatedSeconds || 25}s`}
                    </span>
                  </div>



                  {/* High-Legibility Spoken Script Text */}
                  <p className="text-base sm:text-lg text-zinc-900 dark:text-zinc-100 leading-relaxed font-sans pt-1 select-text">
                    {sec.spokenText}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            /* Fallback: Continuous Document View */
            <div className="text-base sm:text-lg leading-relaxed whitespace-pre-line font-sans text-zinc-900 dark:text-zinc-100 select-text">
              {content}
            </div>
          )}
        </div>
      )}

      {/* ── Auto-Scrolling Teleprompter Popup Modal ── */}
      {isTeleprompterOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 text-white flex flex-col justify-between animate-fade-in backdrop-blur-md">
          {/* Top Control Bar */}
          <div className="w-full px-4 sm:px-8 py-3.5 border-b border-zinc-800 bg-zinc-950/90 flex flex-wrap items-center justify-between gap-4 select-none shrink-0 z-10 shadow-lg">
            {/* Title / Info */}
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-white tracking-wide">
                  Teleprompter
                </h3>
                <p className="text-[10px] text-zinc-400 hidden sm:block">
                  Press Space to Start/Pause • Esc to Exit
                </p>
              </div>
            </div>

            {/* Simple Controls: Start, Reset, Font, Speed */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Start / Pause Button */}
              <button
                type="button"
                onClick={() => setIsPlaying((prev) => !prev)}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer active:scale-95 ${
                  isPlaying
                    ? "bg-amber-500 hover:bg-amber-600 text-black"
                    : "bg-emerald-500 hover:bg-emerald-600 text-black"
                }`}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Start</span>
                  </>
                )}
              </button>

              {/* Reset to Top */}
              <button
                type="button"
                onClick={handleResetScroll}
                title="Reset to Top"
                className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {/* Font Size Controls */}
              <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1 text-xs">
                <span className="text-[10px] text-zinc-400 font-semibold px-1">Font</span>
                <button
                  type="button"
                  disabled={fontSizeIndex <= 0}
                  onClick={() => setFontSizeIndex((i) => Math.max(0, i - 1))}
                  className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-300 disabled:opacity-30 cursor-pointer"
                  title="Smaller font"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="px-1 font-bold text-[11px] text-white min-w-[18px] text-center">
                  {fontSizes[fontSizeIndex].label}
                </span>
                <button
                  type="button"
                  disabled={fontSizeIndex >= fontSizes.length - 1}
                  onClick={() => setFontSizeIndex((i) => Math.min(fontSizes.length - 1, i + 1))}
                  className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-300 disabled:opacity-30 cursor-pointer"
                  title="Larger font"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              {/* Speed Controls */}
              <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1 text-xs">
                <span className="text-[10px] text-zinc-400 font-semibold px-1">Speed</span>
                <button
                  type="button"
                  disabled={scrollSpeed <= 1}
                  onClick={() => setScrollSpeed((s) => Math.max(1, s - 1))}
                  className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-300 disabled:opacity-30 cursor-pointer"
                  title="Slower speed"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="px-1 font-bold text-[11px] text-white min-w-[20px] text-center">
                  {scrollSpeed}x
                </span>
                <button
                  type="button"
                  disabled={scrollSpeed >= 5}
                  onClick={() => setScrollSpeed((s) => Math.min(5, s + 1))}
                  className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-300 disabled:opacity-30 cursor-pointer"
                  title="Faster speed"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => {
                  setIsTeleprompterOpen(false);
                  setIsPlaying(false);
                }}
                className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition cursor-pointer"
                title="Close Teleprompter (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Reading Focus Eye-Line Marker */}
          <div className="pointer-events-none fixed top-1/3 left-0 right-0 z-20 flex items-center justify-between px-4 sm:px-8 opacity-25">
            <div className="h-[1px] flex-1 bg-rose-500/50" />
            <span className="text-[10px] tracking-wider uppercase px-2 text-rose-400 font-semibold">
              Eye Level
            </span>
            <div className="h-[1px] flex-1 bg-rose-500/50" />
          </div>

          {/* Teleprompter Scrolling Content Container */}
          <div
            ref={teleprompterScrollRef}
            onScroll={(e) => {
              const current = e.currentTarget.scrollTop;
              if (Math.abs(current - scrollPosRef.current) > 5) {
                scrollPosRef.current = current;
              }
            }}
            className="flex-1 overflow-y-auto scrollbar-thin px-6 sm:px-12 py-36 select-text"
          >
            <div className="max-w-3xl mx-auto space-y-12">
              {sections.length > 0 ? (
                sections.map((sec, idx) => (
                  <div key={sec.id || idx} className="space-y-4">
                    {/* Section Label & Time */}
                    <div className="flex items-center gap-3 text-xs tracking-wider uppercase font-bold text-zinc-400 border-b border-zinc-800 pb-2">
                      <span className="text-amber-400">Section {idx + 1}</span>
                      <span>•</span>
                      <span>{formatSectionTitle(sec.title)}</span>
                      {sec.timeRange && (
                        <>
                          <span>•</span>
                          <span className="text-zinc-500">{sec.timeRange}</span>
                        </>
                      )}
                    </div>

                    {/* Spoken Text */}
                    <p
                      className={`${fontSizes[fontSizeIndex].class} text-zinc-100 font-sans tracking-wide font-normal`}
                    >
                      {sec.spokenText}
                    </p>
                  </div>
                ))
              ) : (
                <div
                  className={`${fontSizes[fontSizeIndex].class} text-zinc-100 font-sans tracking-wide font-normal whitespace-pre-line`}
                >
                  {content}
                </div>
              )}

              {/* Bottom Spacer */}
              <div className="h-64 flex items-center justify-center text-xs text-zinc-600 uppercase tracking-widest font-semibold">
                — End of Script —
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
