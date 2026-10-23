"use client";

import React, { useEffect, useRef, useState } from "react";
import { Plus, Trash2, FileText, Sparkles, HelpCircle, Camera } from "lucide-react";
import { ensureAiDevelopmentTools } from "@/lib/utils/resume-editor";

interface EditableProps {
  value: string;
  lineIndex: number;
  part?: number;
  onCommit: (next: string) => void;
  onEnter?: () => void;
  onBackspaceEmpty?: () => void;
  className?: string;
  placeholder?: string;
}

function Editable({
  value,
  lineIndex,
  part = 0,
  onCommit,
  onEnter,
  onBackspaceEmpty,
  className,
  placeholder,
}: EditableProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (el && document.activeElement !== el && el.innerText !== value) {
      el.innerText = value;
    }
  }, [value]);

  return (
    <span
      ref={ref}
      data-line={lineIndex}
      data-part={part}
      data-placeholder={placeholder}
      contentEditable
      suppressContentEditableWarning
      spellCheck
      onBlur={(e) => {
        const next = e.currentTarget.innerText.replace(/\r?\n/g, " ");
        if (next !== value) onCommit(next);
      }}
      onPaste={(e) => {
        e.preventDefault();
        const text = e.clipboardData.getData("text/plain").replace(/\s*\r?\n\s*/g, " ");
        document.execCommand("insertText", false, text);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          e.currentTarget.blur();
          onEnter?.();
        } else if (e.key === "Backspace" && !e.currentTarget.innerText.trim() && onBackspaceEmpty) {
          e.preventDefault();
          onBackspaceEmpty();
        }
      }}
      className={`outline-hidden transition-colors rounded-xs hover:bg-amber-100/40 focus:bg-amber-50 focus:ring-1 focus:ring-amber-400/80 empty:before:content-[attr(data-placeholder)] empty:before:text-zinc-300 empty:before:italic ${
        className ?? ""
      }`}
    >
      {value}
    </span>
  );
}

const isSectionHeaderLine = (line: string) =>
  /^[A-Z\s/&-]{3,}$/.test(line) &&
  ["SUMMARY", "SKILL", "EXPERIENCE", "EDUCATION", "PROJECT", "CAPSTONE"].some((k) => line.includes(k));

const focusLine = (index: number, atEnd = false) => {
  setTimeout(() => {
    const el = document.querySelector<HTMLElement>(`[data-line="${index}"][data-part="0"]`);
    if (!el) return;
    el.focus();
    if (atEnd) {
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, 20);
};

export function ResumePageEditor({
  content,
  onChange,
  includePhoto = false,
  photoUrl,
  photoSize = "md",
  onTogglePhoto,
  onPhotoSizeChange,
  onUploadPhoto,
  onRemovePhoto,
}: {
  content: string;
  onChange: (next: string) => void;
  includePhoto?: boolean;
  photoUrl?: string | null;
  photoSize?: "sm" | "md" | "lg";
  onTogglePhoto?: () => void;
  onPhotoSizeChange?: (size: "sm" | "md" | "lg") => void;
  onUploadPhoto?: (file: File) => void;
  onRemovePhoto?: () => void;
}) {
  const [showTips, setShowTips] = useState(false);
  const lines = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  const firstSectionIdx = lines.findIndex((l) => isSectionHeaderLine(l.trim()));
  const headerEnd = firstSectionIdx === -1 ? lines.length : firstSectionIdx;
  const headerLineIdxs = lines.slice(0, headerEnd).map((l, i) => (l.trim() ? i : -1)).filter((i) => i !== -1);

  const setLine = (index: number, next: string) => {
    const updated = [...lines];
    updated[index] = next;
    onChange(updated.join("\n"));
  };

  const insertAfter = (index: number, next: string) => {
    const updated = [...lines];
    updated.splice(index + 1, 0, next);
    onChange(updated.join("\n"));
    focusLine(index + 1);
  };

  const removeLine = (index: number) => {
    const updated = [...lines];
    updated.splice(index, 1);
    onChange(updated.join("\n"));
    let prev = index - 1;
    while (prev >= 0 && (!updated[prev]?.trim() || /^[-=_]{3,}$/.test(updated[prev].trim()))) prev--;
    if (prev >= 0) focusLine(prev, true);
  };

  const addSection = (title: string, sampleLine: string) => {
    const underline = "-".repeat(title.length);
    const newLines = [...lines, "", title, underline, sampleLine];
    onChange(newLines.join("\n"));
    focusLine(newLines.length - 1);
  };

  let currentSection = "";

  return (
    <div className="w-full flex flex-col items-center py-4 sm:py-6 bg-zinc-200/80 dark:bg-zinc-950/90 rounded-2xl border border-zinc-300 dark:border-zinc-800 shadow-inner">
      {/* Document Desk Top Bar */}
      <div className="w-full max-w-[816px] px-3 pb-3 flex flex-wrap items-center justify-between gap-2 text-xs select-none">
        <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
          <span className="inline-flex items-center gap-1 font-semibold text-zinc-900 dark:text-zinc-200 bg-white/80 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 px-2 py-0.5 rounded-md shadow-2xs">
            <FileText className="w-3.5 h-3.5 text-rose-500" />
            <span>US Letter (8.5 × 11 in)</span>
          </span>
          <span className="hidden sm:inline text-zinc-400 dark:text-zinc-500">•</span>
          <span className="hidden sm:inline font-medium text-[11px]">WYSIWYG PDF Mode</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle Photo Button */}
          {onTogglePhoto && (
            <div className="inline-flex items-center gap-1">
              <button
                type="button"
                onClick={onTogglePhoto}
                className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-[11px] font-medium shadow-2xs transition cursor-pointer ${
                  includePhoto
                    ? "bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200"
                    : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                }`}
                title={includePhoto ? "Candidate photo is included on resume" : "Include candidate photo on resume"}
              >
                <Camera className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Photo: {includePhoto ? "Included" : "None"}</span>
              </button>

              {/* Photo Size Selector when Photo is Enabled */}
              {includePhoto && onPhotoSizeChange && (
                <div className="inline-flex items-center rounded-md bg-white dark:bg-zinc-800 p-0.5 border border-zinc-200 dark:border-zinc-700 text-[10px] font-semibold">
                  {(["sm", "md", "lg"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => onPhotoSizeChange(s)}
                      className={`px-1.5 py-0.5 rounded uppercase transition cursor-pointer ${
                        photoSize === s
                          ? "bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 font-bold"
                          : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                      }`}
                      title={`Photo Size: ${s === "sm" ? "Small (76px / 22mm)" : s === "md" ? "Medium (92px / 28mm)" : "Large (112px / 34mm)"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Quick Add Section Dropdown / Helpers */}
          <div className="relative inline-flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => insertAfter(lines.length - 1, "• New bullet point")}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium text-[11px] shadow-2xs transition cursor-pointer"
              title="Add a new bullet point to the end of the resume"
            >
              <Plus className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>Add Bullet</span>
            </button>

            <button
              type="button"
              onClick={() => setShowTips(!showTips)}
              className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
              title="Editing tips"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Editing Tips Card */}
      {showTips && (
        <div className="w-full max-w-[816px] mb-3 px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2 shadow-sm animate-fade-in">
          <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-semibold">WYSIWYG Resume Mode Tips:</p>
            <p className="text-[11px] text-amber-800 dark:text-amber-300">
              • Click any text directly on the page to edit. Everything matches the exported PDF layout exactly.
            </p>
            <p className="text-[11px] text-amber-800 dark:text-amber-300">
              • Press <kbd className="px-1 py-0.5 rounded bg-amber-200/70 dark:bg-amber-900 font-mono text-[10px]">Enter</kbd> to insert a new line or bullet.
            </p>
            <p className="text-[11px] text-amber-800 dark:text-amber-300">
              • Press <kbd className="px-1 py-0.5 rounded bg-amber-200/70 dark:bg-amber-900 font-mono text-[10px]">Backspace</kbd> on an empty line or bullet to delete it.
            </p>
          </div>
        </div>
      )}

      {/* Realistic Printable Letter Paper Sheet */}
      <div className="w-full overflow-x-auto flex justify-center px-2 sm:px-4">
        <div
          className="bg-white text-zinc-950 shadow-[0_4px_30px_rgba(0,0,0,0.15)] ring-1 ring-zinc-300 dark:ring-zinc-700 rounded-[2px] transition-all select-text"
          style={{
            width: "816px", // 8.5in at 96 DPI
            minHeight: "1056px", // 11in at 96 DPI (Letter)
            padding: "58px 58px", // ~15.5mm margins matching PDF
            fontFamily: "Helvetica, Arial, sans-serif",
            fontSize: "14px",
            lineHeight: "18.8px",
          }}
        >
          {lines.map((raw, i) => {
            const line = raw.trim();

            // 1. Candidate Header (Name, Target Title, Contact Lines)
            if (i < headerEnd) {
              if (!line) return null;
              const pos = headerLineIdxs.indexOf(i);

              if (includePhoto) {
                // Render the left-aligned layout with square photo on the left
                if (pos !== 0) return null;

                const photoDimPx = photoSize === "sm" ? 76 : photoSize === "lg" ? 112 : 92;

                return (
                  <div key="photo-header" className="flex items-center gap-4 mb-8 pb-3 border-b border-zinc-200/90">
                    {/* Square Photo on Left */}
                    <div className="relative group/avatar shrink-0">
                      {photoUrl ? (
                        <div className="relative">
                          <img
                            src={photoUrl}
                            alt="Candidate Photo"
                            style={{ width: `${photoDimPx}px`, height: `${photoDimPx}px` }}
                            className="rounded-xs object-cover border border-zinc-300 shadow-xs"
                          />
                          <div className="absolute inset-0 bg-black/45 rounded-xs opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                            <label
                              className="p-1.5 rounded-md bg-white text-zinc-800 hover:bg-zinc-100 cursor-pointer shadow-xs transition"
                              title="Change photo"
                            >
                              <Camera className="w-3.5 h-3.5" />
                              <input
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) onUploadPhoto?.(file);
                                }}
                              />
                            </label>
                            {onRemovePhoto && (
                              <button
                                type="button"
                                onClick={onRemovePhoto}
                                className="p-1.5 rounded-md bg-rose-600 text-white hover:bg-rose-700 cursor-pointer shadow-xs transition"
                                title="Remove photo"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <label
                          style={{ width: `${photoDimPx}px`, height: `${photoDimPx}px` }}
                          className="flex flex-col items-center justify-center rounded-xs border-2 border-dashed border-zinc-300 hover:border-amber-500 bg-zinc-50 hover:bg-amber-50/50 text-zinc-400 hover:text-amber-600 cursor-pointer transition group"
                        >
                          <Camera className="w-5 h-5 mb-0.5 group-hover:scale-110 transition-transform" />
                          <span className="text-[10px] font-semibold">Upload Photo</span>
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) onUploadPhoto?.(file);
                            }}
                          />
                        </label>
                      )}
                    </div>

                    {/* Left-Aligned Heading Details on Right */}
                    <div className="flex-1 min-w-0 text-left space-y-0.5">
                      {headerLineIdxs.map((hIdx, p) => {
                        const hLine = lines[hIdx].trim();
                        if (!hLine) return null;
                        const hStyle =
                          p === 0
                            ? "text-[23px] leading-[28px] font-bold tracking-tight uppercase mb-0.5"
                            : p === 1
                            ? "text-[15.5px] leading-[21px] font-medium text-zinc-800 mb-0.5"
                            : "text-[13px] leading-[18px] text-zinc-700";
                        return (
                          <div key={hIdx} className={`text-left ${hStyle}`}>
                            <Editable
                              value={hLine}
                              lineIndex={hIdx}
                              onCommit={(v) => setLine(hIdx, v)}
                              onEnter={() => insertAfter(hIdx, "")}
                              onBackspaceEmpty={() => removeLine(hIdx)}
                              placeholder={p === 0 ? "Candidate Name" : p === 1 ? "Target Role" : "Contact Info"}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              }

              // Default centered header when no photo
              const style =
                pos === 0
                  ? "text-[23px] leading-[28px] font-bold tracking-tight uppercase mb-1"
                  : pos === 1
                  ? "text-[15.5px] leading-[21px] font-medium text-zinc-800 mb-1"
                  : "text-[13px] leading-[18px] text-zinc-700";
              return (
                <div key={i} className={`text-center ${style}`}>
                  <Editable
                    value={line}
                    lineIndex={i}
                    onCommit={(v) => setLine(i, v)}
                    onEnter={() => insertAfter(i, "")}
                    onBackspaceEmpty={() => removeLine(i)}
                    placeholder="Candidate Header Line"
                  />
                </div>
              );
            }

            // Skip raw markdown dashes (we render real crisp solid black rules for section headers)
            if (/^[-=_]{3,}$/.test(line)) return null;

            // Spacing between paragraphs / entries
            if (!line) {
              return <div key={i} className="h-[10px]" />;
            }

            // 2. Section Header (e.g. PROFESSIONAL SUMMARY, TECHNICAL SKILLS, EXPERIENCE, EDUCATION)
            if (isSectionHeaderLine(line)) {
              currentSection = line;
              return (
                <div
                  key={i}
                  className="mt-[16px] first:mt-[18px] mb-[6px] border-b-[0.9px] border-zinc-950 pb-[2px]"
                >
                  <Editable
                    value={line}
                    lineIndex={i}
                    onCommit={(v) => setLine(i, v.toUpperCase())}
                    className="text-[14.5px] font-bold uppercase tracking-wider text-zinc-950 inline-block w-full"
                    placeholder="SECTION TITLE"
                  />
                </div>
              );
            }

            // 3. Bullet Point Line (e.g. "• Developed full-stack web applications...")
            if (line.startsWith("•") || line.startsWith("- ")) {
              const text = line.replace(/^[•-]\s*/, "");
              return (
                <div key={i} className="flex items-start pl-[2px] mb-[3px] text-[13.5px] leading-[18.5px]">
                  <span className="w-[15px] shrink-0 font-bold select-none text-zinc-950">•</span>
                  <Editable
                    value={text}
                    lineIndex={i}
                    onCommit={(v) => setLine(i, `• ${v}`)}
                    onEnter={() => insertAfter(i, "• ")}
                    onBackspaceEmpty={() => removeLine(i)}
                    className="flex-1 min-w-[50px] text-zinc-900"
                    placeholder="Bullet point item..."
                  />
                </div>
              );
            }

            // 4. Job Title / Degree / Piped Header (e.g. "Software Engineer | 2022 - Present")
            if (line.includes("|")) {
              const [left, ...rest] = line.split("|");
              const right = rest.join("|").trim();
              return (
                <div key={i} className="flex items-baseline justify-between gap-4 text-[13.5px] leading-[19px] mt-[4px] first:mt-0">
                  <Editable
                    value={left.trim()}
                    lineIndex={i}
                    onCommit={(v) => setLine(i, right ? `${v} | ${right}` : v)}
                    onEnter={() => insertAfter(i, "")}
                    onBackspaceEmpty={() => removeLine(i)}
                    className="font-bold text-zinc-950 min-w-[60px]"
                    placeholder="Title or Degree"
                  />
                  <Editable
                    value={right}
                    lineIndex={i}
                    part={1}
                    onCommit={(v) => setLine(i, v.trim() ? `${left.trim()} | ${v.trim()}` : left.trim())}
                    onEnter={() => insertAfter(i, "")}
                    className="shrink-0 text-zinc-800 text-right min-w-[30px]"
                    placeholder="Date or URL"
                  />
                </div>
              );
            }

            // 5. Skill Category Line (e.g. "Languages: TypeScript, JavaScript, HTML, CSS")
            const colonMatch = line.match(/^([^:]+):\s*(.*)$/);
            if (colonMatch && currentSection.includes("SKILL")) {
              return (
                <div key={i} className="text-[13.5px] leading-[19px] mb-[2px]">
                  <Editable
                    value={colonMatch[1]}
                    lineIndex={i}
                    onCommit={(v) => setLine(i, `${v}: ${colonMatch[2]}`)}
                    onEnter={() => insertAfter(i, "")}
                    onBackspaceEmpty={() => removeLine(i)}
                    className="font-bold text-zinc-950"
                    placeholder="Category"
                  />
                  <span className="font-bold text-zinc-950">: </span>
                  <Editable
                    value={colonMatch[2]}
                    lineIndex={i}
                    part={1}
                    onCommit={(v) => setLine(i, `${colonMatch[1]}: ${v}`)}
                    onEnter={() => insertAfter(i, "")}
                    className="text-zinc-900"
                    placeholder="Skills separated by commas"
                  />
                </div>
              );
            }

            // 6. Education Degree line without pipe (always bold) or general body paragraph
            const prev = lines[i - 1]?.trim() ?? "";
            const isEduTitle =
              currentSection.includes("EDUCATION") &&
              (!prev || /^[-=_]{3,}$/.test(prev) || isSectionHeaderLine(prev));

            return (
              <div
                key={i}
                className={`text-[13.5px] leading-[19px] ${
                  isEduTitle ? "font-bold text-zinc-950 mt-[3px] first:mt-0" : "text-zinc-900"
                }`}
              >
                <Editable
                  value={line}
                  lineIndex={i}
                  onCommit={(v) => setLine(i, v)}
                  onEnter={() => insertAfter(i, "")}
                  onBackspaceEmpty={() => removeLine(i)}
                  className="inline-block min-w-[50px] w-full"
                  placeholder="Text line..."
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
