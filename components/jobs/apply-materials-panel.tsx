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
  EyeOff,
  RefreshCw,
  Save,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  Download,
  X,
  MoreHorizontal,
  Plus,
  Video,
  MessageSquare,
} from "lucide-react";
import {
  ApplyContentType,
  ApplyContentResponse,
  APPLY_CONTENT_TYPES,
  APPLY_CONTENT_KEYS,
  JobApplyMaterialsMap,
} from "@/types/ai-apply";
import { JobStatus } from "@/types/job";
import { JobMatchAnalysis } from "@/types/ai-match";
import { saveApplyMaterialAction } from "@/lib/actions/jobs";
import { downloadCoverLetterPdf } from "@/lib/utils/cover-letter-pdf";
import { downloadResumePdf } from "@/lib/utils/resume-pdf";
import { VideoScriptView } from "./video-script-view";
import {
  updateResumeSummary,
  addResumeSkill,
  removeResumeSkill,
  changeResumeProjectType,
  hideResumeProject,
  restoreResumeProject,
  autoDetectResumeProjectTypes,
  getRecommendedSkillsForJob,
  ParsedProject,
} from "@/lib/utils/resume-editor";

interface ApplyMaterialsPanelProps {
  jobId: string;
  jobTitle?: string;
  company?: string;
  description?: string;
  currentStatus?: JobStatus;
  initialMaterials?: JobApplyMaterialsMap | null;
  matchAnalysis?: JobMatchAnalysis | null;
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
  "video-script": Video,
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

function InlineAddSkillInput({ onAdd }: { onAdd: (skill: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState("");

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50 transition cursor-pointer"
        title="Add skill to this category"
      >
        <Plus className="w-2.5 h-2.5" />
        <span>Add</span>
      </button>
    );
  }

  const handleCommit = () => {
    const trimmed = value.trim();
    if (trimmed) {
      onAdd(trimmed);
    }
    setValue("");
    setIsOpen(false);
  };

  return (
    <span className="inline-flex items-center gap-1">
      <input
        type="text"
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleCommit();
          } else if (e.key === "Escape") {
            setValue("");
            setIsOpen(false);
          }
        }}
        placeholder="Type skill & press Enter"
        className="h-5 px-1.5 text-xs rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-amber-500 w-36"
      />
      <button
        type="button"
        onClick={handleCommit}
        className="text-[11px] text-emerald-600 hover:text-emerald-700 font-bold px-1 cursor-pointer"
      >
        OK
      </button>
      <button
        type="button"
        onClick={() => {
          setValue("");
          setIsOpen(false);
        }}
        className="text-zinc-400 hover:text-zinc-600 p-0.5 cursor-pointer"
      >
        <X className="w-2.5 h-2.5" />
      </button>
    </span>
  );
}

function chooseCategoryForSkill(skill: string, availableCategories: string[]): string {
  if (availableCategories.length === 0) return "Technical Skills";
  const s = skill.toLowerCase();
  for (const rawCat of availableCategories) {
    const cat = rawCat.replace(/:$/, "").trim();
    const c = cat.toLowerCase();
    if (
      (s.includes("react") ||
        s.includes("css") ||
        s.includes("html") ||
        s.includes("tailwind") ||
        s.includes("vue") ||
        s.includes("next") ||
        s.includes("angular") ||
        s.includes("ui") ||
        s.includes("frontend")) &&
      c.includes("front")
    ) {
      return cat;
    }
    if (
      (s.includes("node") ||
        s.includes("express") ||
        s.includes("nest") ||
        s.includes("django") ||
        s.includes("flask") ||
        s.includes("spring") ||
        s.includes("backend") ||
        s.includes("api") ||
        s.includes("fastapi")) &&
      c.includes("back")
    ) {
      return cat;
    }
    if (
      (s.includes("sql") ||
        s.includes("postgres") ||
        s.includes("mongo") ||
        s.includes("supabase") ||
        s.includes("firebase") ||
        s.includes("redis") ||
        s.includes("database") ||
        s.includes("prisma")) &&
      (c.includes("data") || c.includes("storage") || c.includes("db"))
    ) {
      return cat;
    }
    if (
      (s.includes("git") ||
        s.includes("docker") ||
        s.includes("aws") ||
        s.includes("ci/cd") ||
        s.includes("github") ||
        s.includes("jira") ||
        s.includes("linux")) &&
      (c.includes("tool") || c.includes("devops") || c.includes("version"))
    ) {
      return cat;
    }
    if (
      (s.includes("python") ||
        s.includes("javascript") ||
        s.includes("typescript") ||
        s.includes("java") ||
        s.includes("go") ||
        s.includes("c++") ||
        s.includes("c#") ||
        s.includes("rust") ||
        s.includes("ruby") ||
        s.includes("php")) &&
      (c.includes("lang") || c.includes("technol"))
    ) {
      return cat;
    }
  }
  return availableCategories[0].replace(/:$/, "").trim();
}

interface ResumeDocumentViewProps {
  content: string;
  isEditing?: boolean;
  jobTitle?: string;
  description?: string;
  matchAnalysis?: JobMatchAnalysis | null;
  hiddenProjects?: ParsedProject[];
  onContentChange?: (newContent: string) => void;
  onHideProject?: (project: ParsedProject) => void;
  onRestoreProject?: (project: ParsedProject) => void;
}

function ResumeDocumentView({
  content,
  isEditing = false,
  jobTitle,
  description,
  matchAnalysis,
  hiddenProjects = [],
  onContentChange,
  onHideProject,
  onRestoreProject,
}: ResumeDocumentViewProps) {
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
        line.includes("PROJECT") ||
        line.includes("CAPSTONE"));

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
      <div className="space-y-6 font-sans text-zinc-900 dark:text-zinc-100 px-1 sm:px-2">
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
        {sections.map((sec, sIdx) => {
          const isSummary = sec.title.includes("SUMMARY");
          const isSkills = sec.title.includes("SKILL");
          const isProjects = sec.title.includes("PROJECT") || sec.title.includes("CAPSTONE");

          const projectSectionType: "key" | "side" | "capstone" = sec.title.includes("SIDE")
            ? "side"
            : sec.title.includes("CAPSTONE")
            ? "capstone"
            : "key";

          return (
            <div key={sIdx} className="space-y-2">
              {/* Section Header with Black Horizontal Line */}
              <div className="border-b border-black dark:border-white pb-1">
                <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-950 dark:text-zinc-50">
                  {sec.title}
                </h4>
              </div>

              {/* Body with subtle gap */}
              <div className="text-xs sm:text-sm leading-relaxed text-zinc-800 dark:text-zinc-200 space-y-1.5 pt-1 font-sans">
                {/* 1. PROFESSIONAL SUMMARY SECTION */}
                {isSummary ? (
                  isEditing ? (
                    <div className="space-y-1.5 pt-1">
                      <textarea
                        value={sec.body.join("\n\n")}
                        onChange={(e) => {
                          const updated = updateResumeSummary(content, e.target.value);
                          onContentChange?.(updated);
                        }}
                        rows={Math.max(3, Math.min(8, sec.body.join("\n").split("\n").length + 2))}
                        placeholder="Write your professional summary tailored to this position..."
                        className="w-full text-xs sm:text-sm leading-relaxed p-2.5 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 bg-white/70 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 font-sans focus:outline-hidden focus:ring-1 focus:ring-amber-500/50 resize-y"
                      />
                      <div className="flex justify-between items-center text-[10px] text-zinc-500 dark:text-zinc-400">
                        <span>Directly tailored for {jobTitle || "this position"}</span>
                        <span>{sec.body.join(" ").trim().split(/\s+/).filter(Boolean).length} words</span>
                      </div>
                    </div>
                  ) : (
                    sec.body.map((p, pIdx) => <p key={pIdx}>{p}</p>)
                  )
                ) : isSkills ? (
                  /* 2. TECHNICAL SKILLS SECTION */
                  (() => {
                    const allCurrentSkills: string[] = [];
                    const categoryNames: string[] = [];
                    sec.body.forEach((line) => {
                      const colonMatch = line.match(/^([^:]+:)\s*(.*)$/);
                      if (colonMatch && !line.startsWith("•") && !line.startsWith("-")) {
                        categoryNames.push(colonMatch[1].replace(/:$/, "").trim());
                        const sks = colonMatch[2].split(",").map((s) => s.trim()).filter(Boolean);
                        allCurrentSkills.push(...sks);
                      }
                    });

                    const recommendedSkills = getRecommendedSkillsForJob(
                      description,
                      matchAnalysis,
                      allCurrentSkills
                    );

                    return (
                      <div className="space-y-2">
                        {sec.body.map((p, pIdx) => {
                          const colonMatch = p.match(/^([^:]+:)\s*(.*)$/);
                          if (colonMatch && !p.startsWith("•") && !p.startsWith("-")) {
                            const catName = colonMatch[1].replace(/:$/, "").trim();
                            const skills = colonMatch[2]
                              .split(",")
                              .map((s) => s.trim())
                              .filter(Boolean);

                            if (isEditing) {
                              const categoryRecs = recommendedSkills.filter(
                                (rec) =>
                                  chooseCategoryForSkill(rec, categoryNames).toLowerCase() ===
                                  catName.toLowerCase()
                              );

                              return (
                                <div key={pIdx} className="space-y-1.5 py-1">
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <strong className="font-bold text-zinc-950 dark:text-zinc-50 text-xs sm:text-sm mr-1">
                                      {colonMatch[1]}
                                    </strong>
                                    {skills.map((skill, sIdx) => (
                                      <span
                                        key={sIdx}
                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-200/80 dark:bg-zinc-700/60 text-zinc-800 dark:text-zinc-200 text-xs font-medium"
                                      >
                                        <span>{skill}</span>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const updated = removeResumeSkill(content, catName, skill);
                                            onContentChange?.(updated);
                                          }}
                                          className="text-zinc-400 hover:text-rose-500 cursor-pointer transition p-0.5 -mr-0.5"
                                          title={`Remove ${skill}`}
                                        >
                                          <X className="w-2.5 h-2.5" />
                                        </button>
                                      </span>
                                    ))}

                                    {/* Recommended Skills for this category */}
                                    {categoryRecs.map((rec) => (
                                      <button
                                        key={rec}
                                        type="button"
                                        onClick={() => {
                                          const updated = addResumeSkill(content, catName, rec);
                                          onContentChange?.(updated);
                                        }}
                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-dashed border-amber-400/80 dark:border-amber-600/70 bg-amber-50/70 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-xs font-medium transition cursor-pointer group shadow-2xs"
                                        title={`Recommended: Click to add ${rec}`}
                                      >
                                        <Plus className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform" />
                                        <span>{rec}</span>
                                      </button>
                                    ))}

                                    {/* Inline Add Skill to this Category */}
                                    <InlineAddSkillInput
                                      onAdd={(newSkill) => {
                                        const updated = addResumeSkill(content, catName, newSkill);
                                        onContentChange?.(updated);
                                      }}
                                    />
                                  </div>
                                </div>
                              );
                            }

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

                          return <p key={pIdx}>{p}</p>;
                        })}
                      </div>
                    );
                  })()
                ) : isProjects ? (
                  /* 3. ALL PROJECTS (KEY, SIDE, CAPSTONE, ETC.) */
                  sec.body.map((p, pIdx) => {
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

                    // Project header line (Title | Link | Date, or Title | Link, or Title)
                    const parts = p.split("|").map((s) => s.trim()).filter(Boolean);
                    const titlePart = parts[0] || p;
                    const remainingParts = parts.slice(1);

                    return (
                      <div key={pIdx} className="flex flex-wrap items-center justify-between gap-2 pt-3.5 first:pt-0">
                        {/* Project Title and Links / Dates */}
                        <div className="flex flex-wrap items-baseline gap-1.5">
                          <h5 className="font-bold text-zinc-950 dark:text-zinc-50 text-xs sm:text-sm">
                            {titlePart}
                          </h5>
                          {remainingParts.map((part, partIdx) => {
                            const isUrl = part.includes(".") || part.startsWith("http");
                            const displayUrl = part.replace(/^https?:\/\//i, "").replace(/\/+$/g, "");
                            const fullUrl = part.startsWith("http") ? part : `https://${part}`;
                            return (
                              <React.Fragment key={partIdx}>
                                <span className="text-zinc-400 text-xs select-none">|</span>
                                {isUrl ? (
                                  <a
                                    href={fullUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:underline font-normal"
                                  >
                                    {displayUrl}
                                  </a>
                                ) : (
                                  <span className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 font-normal">
                                    {part}
                                  </span>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </div>

                        {/* When Editing: Compact & Clean Controls Right Next to Project Title */}
                        {isEditing && (
                          <div className="flex items-center gap-1.5 select-none shrink-0">
                            <div className="inline-flex items-center rounded-md bg-zinc-200/80 dark:bg-zinc-800 p-0.5 text-[10px] font-semibold">
                              {(["key", "side", "capstone"] as const).map((t) => {
                                const label = t === "key" ? "Key" : t === "side" ? "Side" : "Capstone";
                                const isSelected = projectSectionType === t;
                                return (
                                  <button
                                    key={t}
                                    type="button"
                                    onClick={() => {
                                      const updated = changeResumeProjectType(content, titlePart, t);
                                      onContentChange?.(updated);
                                    }}
                                    className={`px-2 py-0.5 rounded transition cursor-pointer ${
                                      isSelected
                                        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-2xs font-bold"
                                        : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                                    }`}
                                  >
                                    {label}
                                  </button>
                                );
                              })}
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                const { updatedContent, hiddenProject } = hideResumeProject(content, titlePart);
                                if (hiddenProject) {
                                  onHideProject?.(hiddenProject);
                                }
                                onContentChange?.(updatedContent);
                              }}
                              className="p-1 rounded-md text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                              title={`Hide ${titlePart} from this resume`}
                            >
                              <EyeOff className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  /* 4. EXPERIENCE, EDUCATION, OTHER SECTIONS */
                  sec.body.map((p, pIdx) => {
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

                    // Check for Job Title | Date Range line
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
                  })
                )}
              </div>
            </div>
          );
        })}

        {/* Hidden Projects Box at the Bottom of the Resume (When Editing) */}
        {isEditing && hiddenProjects && hiddenProjects.length > 0 && (
          <div className="mt-6 p-3.5 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-100/60 dark:bg-zinc-800/40 text-xs space-y-2">
            <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 font-semibold">
              <EyeOff className="w-3.5 h-3.5" />
              <span>Hidden from this resume ({hiddenProjects.length}):</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {hiddenProjects.map((hp) => (
                <div
                  key={hp.title}
                  className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 shadow-2xs"
                >
                  <span className="font-medium">{hp.title}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = restoreResumeProject(content, hp);
                      onRestoreProject?.(hp);
                      onContentChange?.(updated);
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Restore</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed whitespace-pre-line select-text font-sans">
      {content}
    </div>
  );
}

function renderResumeContent(content: string) {
  return <ResumeDocumentView content={content} isEditing={false} />;
}

export function ApplyMaterialsPanel({
  jobId,
  jobTitle,
  company,
  description,
  currentStatus,
  initialMaterials,
  matchAnalysis,
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
  const [hiddenProjects, setHiddenProjects] = useState<ParsedProject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAppliedUpdated, setIsAppliedUpdated] = useState(false);
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Close dropdown on outside click or ESC key
  useEffect(() => {
    if (!isMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuButtonRef.current &&
        !menuButtonRef.current.contains(e.target as Node) &&
        menuRef.current &&
        !menuRef.current.contains(e.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMenuOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

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
  const handleGenerateMaterial = async (
    type: ApplyContentType,
    candidateNotes?: string
  ) => {
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
          candidateNotes,
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
          scriptData: generated.scriptData,
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
      let scriptDataToSave = materialsMap[activeSubTab]?.scriptData;
      if (activeSubTab === "video-script" && currentText.trim()) {
        const paragraphs = currentText
          .split(/\n\s*\n/)
          .map((p) => p.trim())
          .filter(Boolean);
        const existingSections = scriptDataToSave?.sections || [];
        const newSections = paragraphs.map((para, idx) => {
          const existing = existingSections[idx];
          const words = para.split(/\s+/).filter(Boolean).length;
          const estSeconds = Math.max(5, Math.round((words / 140) * 60));
          if (existing) {
            return {
              ...existing,
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

        const totalWords = currentText.trim().split(/\s+/).filter(Boolean).length;
        const totalDuration = newSections.reduce(
          (acc, s) => acc + (s.estimatedSeconds || 0),
          0
        );

        scriptDataToSave = {
          coverage: scriptDataToSave?.coverage || [],
          hasUnansweredQuestions: scriptDataToSave?.hasUnansweredQuestions || false,
          ...(scriptDataToSave || {}),
          sections: newSections,
          totalWordCount: totalWords,
          totalDurationSeconds: totalDuration,
        };
      }

      const res = await saveApplyMaterialAction(jobId, activeSubTab, {
        content: currentText,
        title: materialsMap[activeSubTab]?.title || APPLY_CONTENT_TYPES[activeSubTab].title,
        keyPointsUsed: materialsMap[activeSubTab]?.keyPointsUsed,
        scriptData: scriptDataToSave,
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
          scriptData: scriptDataToSave,
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
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p className="flex-1">{error}</p>
        </div>
      )}

      {/* Sub-Tabs Switcher */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1 bg-zinc-100 dark:bg-zinc-800/70 border border-zinc-200/80 dark:border-zinc-700/80 rounded-2xl">
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
        <div className="relative">
          {/* Floating Controls at Top Right of Preview */}
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 flex items-center gap-2">
            {isCurrentModified && (
              <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-100/90 dark:bg-amber-950/80 border border-amber-300/80 dark:border-amber-700/80 px-2 py-0.5 rounded-md shadow-2xs backdrop-blur-xs">
                Unsaved edits
              </span>
            )}

            {isEditing ? (
              /* When Editing: Prominent Cancel & Save Actions */
              <div className="flex items-center gap-1.5 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xs p-1 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm">
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
              <div className="flex items-center gap-1.5">
                {activeSubTab === "resume-suggestions" && hasCurrentContent && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="h-7 px-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 text-xs font-semibold transition flex items-center gap-1.5 shadow-2xs active:scale-[0.98] cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-400" />
                    <span>Edit Resume</span>
                  </button>
                )}

                {/* When Viewing: 3-Dots Dropdown Menu (Matches Table Behavior) */}
                <div className="relative inline-block text-left" onClick={(e) => e.stopPropagation()}>
                  <button
                    ref={menuButtonRef}
                    type="button"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    title="Actions"
                    className={`p-1.5 rounded-lg transition cursor-pointer ${
                      isMenuOpen
                        ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white"
                        : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>

                  {isMenuOpen && (
                    <div
                      ref={menuRef}
                      className="absolute right-0 top-full mt-1.5 w-48 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 shadow-2xl py-1.5 animate-fade-in text-xs font-semibold select-none z-30"
                    >
                      {/* Copy */}
                      <button
                        type="button"
                        onClick={() => {
                          handleCopy();
                          setIsMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/80 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white cursor-pointer transition"
                      >
                        {copied ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
                        )}
                        <span>{copied ? "Copied!" : "Copy"}</span>
                      </button>

                      {/* Edit */}
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(true);
                          setIsMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/80 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white cursor-pointer transition"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
                        <span>
                          {activeSubTab === "resume-suggestions"
                            ? "Edit Resume"
                            : activeSubTab === "video-script"
                            ? "Edit Script"
                            : "Edit Text"}
                        </span>
                      </button>

                    {/* Download PDF (for Cover Letter or Resume) */}
                    {(activeSubTab === "cover-letter" || activeSubTab === "resume-suggestions") && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsMenuOpen(false);
                          const resumeText =
                            editedContents["resume-suggestions"] ??
                            materialsMap["resume-suggestions"]?.content;
                          let cleanPosition = "";
                          if (resumeText) {
                            const rLines = resumeText
                              .replace(/\r\n/g, "\n")
                              .replace(/\r/g, "\n")
                              .split("\n")
                              .map((l) => l.trim())
                              .filter(Boolean);
                            if (
                              rLines.length > 1 &&
                              !rLines[1].includes("@") &&
                              !rLines[1].includes("http") &&
                              !rLines[1].includes("|") &&
                              !/^professional\s+summary/i.test(rLines[1])
                            ) {
                              cleanPosition = rLines[1];
                            }
                          }

                          if (activeSubTab === "cover-letter") {
                            downloadCoverLetterPdf({
                              content: currentContent,
                              companyName: company,
                              jobTitle: cleanPosition || jobTitle,
                            });
                          } else {
                            downloadResumePdf({
                              content: currentContent,
                              jobTitle: cleanPosition || jobTitle,
                            });
                          }
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/80 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white cursor-pointer transition"
                      >
                        <Download className="w-3.5 h-3.5 text-rose-500" />
                        <span>Download PDF</span>
                      </button>
                    )}

                    {/* Divider */}
                    <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />

                    {/* Regenerate */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        setShowRegenerateConfirm(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 cursor-pointer transition"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-amber-500" />
                      <span>Regenerate</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

          {/* Text Canvas / Document Container */}
          {activeSubTab === "video-script" ? (
            <VideoScriptView
              content={currentContent}
              scriptData={materialsMap["video-script"]?.scriptData}
              jobTitle={jobTitle}
              company={company}
              isEditing={isEditing}
              onStartEdit={() => setIsEditing(true)}
              onCancelEdit={handleCancelEdit}
              onSaveEdit={handleSaveEdits}
              onContentChange={(newText) => {
                setEditedContents((prev) => ({
                  ...prev,
                  "video-script": newText,
                }));
              }}
              isSaving={isSaving}
              savedSuccess={savedSuccess}
              onRegenerateWithNotes={async (notes) => {
                await handleGenerateMaterial("video-script", notes);
              }}
              isRegenerating={isLoading}
            />
          ) : isEditing && activeSubTab !== "resume-suggestions" ? (
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
              className="w-full text-xs sm:text-sm p-6 sm:p-8 pt-12 sm:pt-14 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100 font-medium focus:border-zinc-500 focus:outline-hidden resize-none overflow-hidden leading-relaxed font-sans"
              placeholder="Edit content here..."
            />
          ) : (
            <div className="w-full p-6 sm:p-8 md:p-10 rounded-2xl bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 select-text transition-all">
              {activeSubTab === "resume-suggestions" ? (
                <ResumeDocumentView
                  content={currentContent}
                  isEditing={isEditing}
                  jobTitle={jobTitle}
                  description={description}
                  matchAnalysis={matchAnalysis}
                  hiddenProjects={hiddenProjects}
                  onContentChange={(newContent) => {
                    setEditedContents((prev) => ({
                      ...prev,
                      "resume-suggestions": newContent,
                    }));
                  }}
                  onHideProject={(p) => {
                    setHiddenProjects((prev) => [
                      ...prev.filter((item) => item.title.toLowerCase() !== p.title.toLowerCase()),
                      p,
                    ]);
                  }}
                  onRestoreProject={(p) => {
                    setHiddenProjects((prev) =>
                      prev.filter((item) => item.title.toLowerCase() !== p.title.toLowerCase())
                    );
                  }}
                />
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

      {/* Confirmation Modal for Single Material Regeneration */}
      {showRegenerateConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
                Regenerate {APPLY_CONTENT_TYPES[activeSubTab].title}?
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                This will overwrite your current {APPLY_CONTENT_TYPES[activeSubTab].title.toLowerCase()} with a newly generated version.
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
                onClick={() => {
                  setShowRegenerateConfirm(false);
                  handleGenerateMaterial(activeSubTab);
                }}
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
