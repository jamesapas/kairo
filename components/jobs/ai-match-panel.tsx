"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Briefcase,
  Award,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  Plus,
  Loader2,
  FileText,
  Clock,
  Star,
  ShieldCheck,
  CheckCheck,
  Zap,
  PenLine,
} from "lucide-react";
import {
  JobMatchAnalysis,
  MatchRecommendation,
  SeniorityMatchLevel,
} from "@/types/ai-match";
import { JobStatus } from "@/types/job";
import { createSkillAction } from "@/lib/actions/skill";
import { HelpMeApplyModal } from "./help-me-apply-modal";

interface AIMatchPanelProps {
  jobId: string;
  jobTitle?: string;
  company?: string;
  description?: string;
  currentStatus?: JobStatus;
  initialAnalysis?: JobMatchAnalysis | null;
  onOpenEditModal?: () => void;
  onOpenHelpMeApply?: () => void;
  onMarkApplied?: () => void;
}

export function AIMatchPanel({
  jobId,
  jobTitle,
  company,
  description,
  currentStatus,
  initialAnalysis,
  onOpenEditModal,
  onOpenHelpMeApply,
  onMarkApplied,
}: AIMatchPanelProps) {
  const [isHelpMeApplyOpen, setIsHelpMeApplyOpen] = useState(false);
  const [analysis, setAnalysis] = useState<JobMatchAnalysis | null>(
    initialAnalysis || null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [loadingStep, setLoadingStep] = useState(0);
  const [addingSkill, setAddingSkill] = useState<string | null>(null);
  const [addedSkillNotification, setAddedSkillNotification] = useState<string | null>(
    null
  );

  const storageKey = `kairo-ai-match-${jobId}`;

  // Sync initialAnalysis or load cached analysis from localStorage
  useEffect(() => {
    if (initialAnalysis) {
      setAnalysis(initialAnalysis);
      return;
    }
    try {
      const cached = localStorage.getItem(storageKey);
      if (cached) {
        setAnalysis(JSON.parse(cached));
      }
    } catch {}
  }, [initialAnalysis, storageKey]);

  // Loading step animation loop
  useEffect(() => {
    if (!isLoading) {
      setLoadingStep(0);
      return;
    }
    const steps = [
      "Benchmarking profile & verified skills...",
      "Extracting required vs nice-to-have requirements...",
      "Evaluating experience, seniority & requirements...",
      "Finalizing structured match assessment...",
    ];
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev + 1) % steps.length);
    }, 1400);
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleAnalyze = async () => {
    if (!description || !description.trim()) {
      setError("Please add a job description first to analyze the match.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId,
          jobTitle,
          company,
          description,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to analyze match.");
      }

      setAnalysis(result.data);
      try {
        localStorage.setItem(storageKey, JSON.stringify(result.data));
      } catch {}
    } catch (err: unknown) {
      console.error("Match analysis error:", err);
      setError((err as Error)?.message || "Something went wrong while analyzing.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSkill = async (skillName: string) => {
    if (addingSkill) return;
    setAddingSkill(skillName);
    setError(null);
    try {
      const res = await createSkillAction(skillName);
      if (!res.success) {
        throw new Error(res.error || "Failed to add skill");
      }

      setAddedSkillNotification(`Added "${skillName}"! Updating match score...`);

      // Optimistically update analysis state
      if (analysis) {
        const updatedMissing = (analysis.missingSkills || []).filter(
          (s) => s.toLowerCase() !== skillName.toLowerCase()
        );
        const updatedMatched = [...(analysis.matchedSkills || []), skillName];
        const updatedNiceToHave = (analysis.niceToHave || []).map((item) =>
          item.name.toLowerCase() === skillName.toLowerCase()
            ? { ...item, hasSkill: true }
            : item
        );

        const total = updatedMatched.length + updatedMissing.length;
        const ratio = total > 0 ? updatedMatched.length / total : 1;
        const optimisticPct = Math.min(
          98,
          Math.max(analysis.matchPercentage + 4, Math.round(ratio * 90))
        );

        let optRec = analysis.recommendation;
        if (optimisticPct >= 75) optRec = "apply";
        else if (optimisticPct >= 50) optRec = "maybe";

        const optimisticAnalysis: JobMatchAnalysis = {
          ...analysis,
          matchPercentage: optimisticPct,
          recommendation: optRec,
          missingSkills: updatedMissing,
          matchedSkills: updatedMatched,
          niceToHave: updatedNiceToHave,
        };

        setAnalysis(optimisticAnalysis);
        try {
          localStorage.setItem(storageKey, JSON.stringify(optimisticAnalysis));
        } catch {}
      }

      // Fetch fresh official analysis from server with the newly added skill
      const response = await fetch("/api/ai/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId,
          jobTitle,
          company,
          description,
        }),
      });

      const result = await response.json();
      if (response.ok && result.success && result.data) {
        setAnalysis(result.data);
        try {
          localStorage.setItem(storageKey, JSON.stringify(result.data));
        } catch {}
        setAddedSkillNotification(
          `Added "${skillName}"! Match updated to ${result.data.matchPercentage}%.`
        );
        setTimeout(() => setAddedSkillNotification(null), 3500);
      }
    } catch (err: unknown) {
      console.error("Error adding skill:", err);
      setError((err as Error)?.message || "Failed to add skill");
    } finally {
      setAddingSkill(null);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-emerald-600 dark:text-emerald-400";
    if (score >= 50) return "text-amber-600 dark:text-amber-400";
    return "text-rose-600 dark:text-rose-400";
  };

  const getScoreRingColor = (score: number) => {
    if (score >= 75) return "#10b981"; // emerald-500
    if (score >= 50) return "#f59e0b"; // amber-500
    return "#f43f5e"; // rose-500
  };

  const getRecommendationBadge = (rec: MatchRecommendation) => {
    switch (rec) {
      case "apply":
        return {
          label: "Strong Fit — Apply",
          bg: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60",
          dot: "bg-emerald-500",
          icon: CheckCircle2,
        };
      case "maybe":
        return {
          label: "Viable Stretch — Maybe",
          bg: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/60",
          dot: "bg-amber-500",
          icon: AlertTriangle,
        };
      case "skip":
        return {
          label: "Low Fit — Consider Skipping",
          bg: "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/60",
          dot: "bg-rose-500",
          icon: XCircle,
        };
    }
  };

  const getSeniorityBadge = (level?: SeniorityMatchLevel) => {
    switch (level) {
      case "Good Match":
        return {
          label: "Good Match",
          bg: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60",
          icon: Check,
        };
      case "Slight Gap":
        return {
          label: "Slight Gap",
          bg: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60",
          icon: AlertTriangle,
        };
      case "Significant Gap":
        return {
          label: "Significant Gap",
          bg: "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60",
          icon: X,
        };
      default:
        return {
          label: "Good Match",
          bg: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60",
          icon: Check,
        };
    }
  };

  const hasDescription = !!(description && description.trim());

  // Radial progress calculations
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = analysis
    ? circumference - (analysis.matchPercentage / 100) * circumference
    : circumference;

  const loadingStepsText = [
    "Benchmarking profile & verified skills...",
    "Extracting required vs nice-to-have requirements...",
    "Evaluating experience, seniority & requirements...",
    "Finalizing structured match assessment...",
  ];

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200/90 dark:border-zinc-800 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-5 transition-all">
      {/* Modern Header with Top-Level Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl flex items-center justify-center bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 text-white shadow-[0_0_16px_rgba(249,115,22,0.5)]">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs uppercase font-bold tracking-wider text-zinc-900 dark:text-zinc-100">
              Job Match Analysis
            </h3>
          </div>
        </div>

        {/* Top Header Action Cluster */}
        <div className="flex items-center gap-2">
          {analysis && (
            <>
              {/* Primary 'Help Me Apply' Button with Orange Gradient & Glow Shadow */}
              <button
                type="button"
                onClick={() => {
                  if (onOpenHelpMeApply) {
                    onOpenHelpMeApply();
                  } else {
                    setIsHelpMeApplyOpen(true);
                  }
                }}
                className="px-3.5 py-1.5 rounded-xl text-xs bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-white font-bold shadow-[0_4px_24px_rgba(249,115,22,0.5),0_0_12px_rgba(244,63,94,0.35)] hover:shadow-[0_6px_32px_rgba(249,115,22,0.7)] border border-amber-300/40 transition flex items-center gap-1.5 cursor-pointer active:scale-[0.98] group"
              >
                <PenLine className="w-3.5 h-3.5 opacity-90 group-hover:opacity-100 group-hover:rotate-6 transition-all" />
                <span>Help Me Apply</span>
              </button>

              {/* Re-analyze Button */}
              <button
                onClick={handleAnalyze}
                disabled={isLoading}
                title="Re-analyze match against current profile"
                className="px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-medium transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-2xs active:scale-[0.98]"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-zinc-600" : "text-zinc-400"}`} />
                <span className="hidden sm:inline">Re-analyze</span>
              </button>

              {/* Collapse / Expand Toggle */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                title={isExpanded ? "Collapse panel" : "Expand panel"}
              >
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <p className="font-semibold">Analysis Failed</p>
            <p className="opacity-90">{error}</p>
          </div>
        </div>
      )}

      {/* State 1: No description warning */}
      {!hasDescription && !analysis && (
        <div className="p-6 rounded-2xl bg-zinc-50/70 dark:bg-zinc-800/30 border border-dashed border-zinc-200 dark:border-zinc-800 text-center space-y-3">
          <FileText className="w-6 h-6 text-zinc-400 mx-auto" />
          <div className="space-y-1">
            <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
              No Job Description Provided
            </p>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-sm mx-auto">
              Add the role description and requirements to enable AI matching against your verified profile.
            </p>
          </div>
          {onOpenEditModal && (
            <button
              onClick={onOpenEditModal}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white shadow-[0_4px_24px_rgba(249,115,22,0.5)] border border-amber-300/40 transition cursor-pointer active:scale-[0.98]"
            >
              + Add Job Description
            </button>
          )}
        </div>
      )}

      {/* State 2: Initial prompt to analyze (Warm Sunset Theme) */}
      {hasDescription && !analysis && !isLoading && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl border bg-gradient-to-br from-amber-50/80 via-orange-50/50 to-rose-50/30 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-rose-950/20 border-amber-300/80 dark:border-amber-800 text-amber-950 dark:text-amber-100 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-orange-500 dark:text-orange-400" />
              <span>Evaluate Match Signal</span>
            </div>
            <p className="text-[11px] opacity-90 leading-relaxed">
              Benchmark your technical skills, experience history, and credentials against this posting to calculate an objective match assessment.
            </p>
          </div>

          <button
            onClick={handleAnalyze}
            className="w-full py-2.5 px-4 rounded-2xl text-xs font-bold tracking-wide bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-white shadow-[0_4px_24px_rgba(249,115,22,0.5),0_0_12px_rgba(244,63,94,0.35)] hover:shadow-[0_6px_32px_rgba(249,115,22,0.7)] border border-amber-300/40 transition flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] group"
          >
            <Sparkles className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform opacity-90" />
            <span>Analyze Job Match</span>
          </button>
        </div>
      )}

      {/* State 3: Loading State */}
      {isLoading && (
        <div className="space-y-5 py-4">
          <div className="flex items-center justify-center gap-4">
            <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
              <div className="w-14 h-14 rounded-full border-3 border-amber-100 dark:border-amber-950/60 border-t-orange-500 animate-spin" />
              <Sparkles className="w-4 h-4 absolute animate-pulse text-orange-500" />
            </div>

            <div className="space-y-1 flex-1 min-w-0">
              <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                <span>Analyzing Fit</span>
                <span className="flex space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:-0.3s] bg-gradient-to-r from-amber-400 to-rose-400" />
                  <span className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:-0.15s] bg-gradient-to-r from-amber-400 to-rose-400" />
                  <span className="w-1.5 h-1.5 rounded-full animate-bounce bg-gradient-to-r from-amber-400 to-rose-400" />
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                {loadingStepsText[loadingStep]}
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <div className="h-3.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg animate-pulse" />
            <div className="h-3.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg animate-pulse w-4/5" />
          </div>
        </div>
      )}

      {/* State 4: Analysis Results */}
      {analysis && !isLoading && (
        <div className="space-y-5">
          {/* Main Score Card */}
          <div className="p-4 rounded-2xl bg-zinc-50/80 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              {/* Circular Gauge */}
              <div className="relative w-15 h-15 flex items-center justify-center shrink-0">
                <svg className="w-15 h-15 -rotate-90" viewBox="0 0 76 76">
                  <circle
                    cx="38"
                    cy="38"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="5.5"
                    className="text-zinc-200 dark:text-zinc-700"
                    fill="transparent"
                  />
                  <circle
                    cx="38"
                    cy="38"
                    r={radius}
                    stroke={getScoreRingColor(analysis.matchPercentage)}
                    strokeWidth="5.5"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span
                    className={`text-sm font-extrabold tracking-tight ${getScoreColor(
                      analysis.matchPercentage
                    )}`}
                  >
                    {analysis.matchPercentage}%
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    {analysis.matchPercentage}% Overall Fit
                  </h4>
                </div>
                <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                  {analysis.matchLabel || "Match Assessment"}
                </p>
              </div>
            </div>

            {/* Recommendation badge */}
            {(() => {
              const badge = getRecommendationBadge(analysis.recommendation);
              const IconComp = badge.icon;
              return (
                <div
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold ${badge.bg}`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{badge.label}</span>
                </div>
              );
            })()}
          </div>

          {/* Added Skill Notification Toast */}
          {addedSkillNotification && (
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-200 animate-fade-in shadow-2xs">
              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 stroke-[2.5]" />
              <span className="font-semibold text-[11px]">
                {addedSkillNotification}
              </span>
            </div>
          )}

          {/* Collapsible Structured Details */}
          {isExpanded && (
            <div className="space-y-4 pt-1 text-xs">
              {/* =========================================================================
                  1. SKILLS GROUP
                  ========================================================================= */}
              <div className="space-y-3 p-4 rounded-2xl bg-zinc-50/50 dark:bg-zinc-800/20 border border-zinc-100 dark:border-zinc-800/80">
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Skills</span>
                </div>

                {/* Skills You Have */}
                {analysis.matchedSkills && analysis.matchedSkills.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Check className="w-3 h-3 stroke-[2.5]" />
                      Skills You Have ({analysis.matchedSkills.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.matchedSkills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/50 text-[11px] font-medium"
                        >
                          <Check className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills You're Missing */}
                {analysis.missingSkills && analysis.missingSkills.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <X className="w-3 h-3 stroke-[2.5]" />
                      Skills You&apos;re Missing ({analysis.missingSkills.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.missingSkills.map((skill, idx) => {
                        const isCurrentlyAdding = addingSkill === skill;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleAddSkill(skill)}
                            disabled={!!addingSkill}
                            title={`Click to add "${skill}" to your skills`}
                            className="group/skill inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border border-amber-200/70 dark:border-amber-800/50 text-[11px] font-medium hover:bg-amber-100/90 dark:hover:bg-amber-900/50 hover:border-amber-300 dark:hover:border-amber-700 hover:text-amber-950 dark:hover:text-amber-100 transition-all cursor-pointer disabled:opacity-50"
                          >
                            {isCurrentlyAdding ? (
                              <Loader2 className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400 animate-spin" />
                            ) : (
                              <>
                                <X className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400 group-hover/skill:hidden" />
                                <Plus className="w-2.5 h-2.5 text-amber-700 dark:text-amber-300 hidden group-hover/skill:inline-block stroke-[2.5]" />
                              </>
                            )}
                            <span>{skill}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* =========================================================================
                  2. EXPERIENCE GROUP
                  ========================================================================= */}
              {(analysis.matchingExperience?.length > 0 ||
                analysis.experienceGaps?.length > 0) && (
                <div className="space-y-3 p-4 rounded-2xl bg-zinc-50/50 dark:bg-zinc-800/20 border border-zinc-100 dark:border-zinc-800/80">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                    <Briefcase className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Experience</span>
                  </div>

                  {/* Matching Experience */}
                  {analysis.matchingExperience &&
                    analysis.matchingExperience.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-500" />
                          Matching Experience
                        </span>
                        <ul className="space-y-1.5">
                          {analysis.matchingExperience.map((exp, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-2 text-[11px] text-zinc-700 dark:text-zinc-300 leading-relaxed"
                            >
                              <Award className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
                              <span>{exp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                  {/* Experience Gaps */}
                  {analysis.experienceGaps && analysis.experienceGaps.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-500" />
                        Experience Gaps
                      </span>
                      <ul className="space-y-1.5">
                        {analysis.experienceGaps.map((gap, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed"
                          >
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                            <span>{gap}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* =========================================================================
                  3. REQUIREMENTS & NICE TO HAVE GROUP
                  ========================================================================= */}
              {(analysis.unmetRequirements?.length > 0 ||
                analysis.niceToHave?.length > 0) && (
                <div className="space-y-3 p-4 rounded-2xl bg-zinc-50/50 dark:bg-zinc-800/20 border border-zinc-100 dark:border-zinc-800/80">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                    <ShieldCheck className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Requirements</span>
                  </div>

                  {/* Requirements You Don't Meet */}
                  {analysis.unmetRequirements &&
                    analysis.unmetRequirements.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Requirements You Don&apos;t Meet
                        </span>
                        <ul className="space-y-1.5">
                          {analysis.unmetRequirements.map((unmet, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-2 text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed"
                            >
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                              <span>{unmet}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                  {/* Nice To Have */}
                  {analysis.niceToHave && analysis.niceToHave.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-500" />
                        Nice to Have
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {analysis.niceToHave.map((item, idx) => {
                          if (item.hasSkill) {
                            return (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40 text-[11px] font-medium"
                              >
                                <Check className="w-2.5 h-2.5 text-emerald-600" />
                                <span>{item.name}</span>
                              </span>
                            );
                          }
                          const isCurrentlyAdding = addingSkill === item.name;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleAddSkill(item.name)}
                              disabled={!!addingSkill}
                              title={`Click to add "${item.name}" to your skills`}
                              className="group/nice inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/70 dark:border-zinc-700 text-[11px] font-medium hover:bg-zinc-200/80 dark:hover:bg-zinc-700 transition cursor-pointer disabled:opacity-50"
                            >
                              {isCurrentlyAdding ? (
                                <Loader2 className="w-2.5 h-2.5 text-zinc-500 animate-spin" />
                              ) : (
                                <Plus className="w-2.5 h-2.5 text-zinc-400 group-hover/nice:text-zinc-900 dark:group-hover/nice:text-zinc-100" />
                              )}
                              <span>{item.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* =========================================================================
                  4. SENIORITY GROUP
                  ========================================================================= */}
              {analysis.seniorityAssessment && (
                <div className="space-y-2 p-4 rounded-2xl bg-zinc-50/50 dark:bg-zinc-800/20 border border-zinc-100 dark:border-zinc-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-zinc-500" />
                      Seniority
                    </span>
                    {(() => {
                      const senBadge = getSeniorityBadge(analysis.seniorityLevel);
                      const SenIcon = senBadge.icon;
                      return (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-bold ${senBadge.bg}`}
                        >
                          <SenIcon className="w-3 h-3" />
                          <span>{senBadge.label}</span>
                        </span>
                      );
                    })()}
                  </div>
                  <p className="text-[11px] text-zinc-700 dark:text-zinc-300 leading-relaxed font-normal">
                    {analysis.seniorityAssessment}
                  </p>
                </div>
              )}

              {/* =========================================================================
                  5. ASSESSMENT (STRENGTHS & GAPS)
                  ========================================================================= */}
              {(analysis.keyStrengths?.length > 0 ||
                analysis.potentialGaps?.length > 0) && (
                <div className="space-y-3 p-4 rounded-2xl bg-zinc-50/50 dark:bg-zinc-800/20 border border-zinc-100 dark:border-zinc-800/80">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                    <Sparkles className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Assessment</span>
                  </div>

                  {/* Key Strengths */}
                  {analysis.keyStrengths && analysis.keyStrengths.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                        <CheckCheck className="w-3 h-3 text-emerald-500" />
                        Key Strengths
                      </span>
                      <ul className="space-y-1.5">
                        {analysis.keyStrengths.map((str, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-[11px] text-zinc-700 dark:text-zinc-300 leading-relaxed"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                            <span>{str}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Potential Gaps */}
                  {analysis.potentialGaps && analysis.potentialGaps.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-500" />
                        Potential Gaps
                      </span>
                      <ul className="space-y-1.5">
                        {analysis.potentialGaps.map((gap, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                            <span>{gap}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* =========================================================================
                  6. RECOMMENDATION BANNER
                  ========================================================================= */}
              <div className="p-4 rounded-2xl bg-zinc-50/90 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
                    <Sparkles className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 dark:text-zinc-400">
                      Recommendation
                    </span>
                  </div>
                  {(() => {
                    const badge = getRecommendationBadge(analysis.recommendation);
                    return (
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${badge.bg}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                        <span>{badge.label}</span>
                      </span>
                    );
                  })()}
                </div>
                <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-normal">
                  &ldquo;
                  {analysis.recommendationReason ||
                    analysis.summary ||
                    "Review the alignment breakdown above to guide your application decision."}
                  &rdquo;
                </p>
              </div>

              {/* Footer Timestamp */}
              {analysis.analyzedAt && (
                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[10px] text-zinc-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Evaluated on {new Date(analysis.analyzedAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      <HelpMeApplyModal
        isOpen={isHelpMeApplyOpen}
        onClose={() => setIsHelpMeApplyOpen(false)}
        jobId={jobId}
        jobTitle={jobTitle}
        company={company}
        description={description}
        currentStatus={currentStatus}
        onMarkApplied={onMarkApplied}
      />
    </div>
  );
}
