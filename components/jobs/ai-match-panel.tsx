"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  AlertTriangle,
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
  TrendingUp,
  Target,
} from "lucide-react";
import {
  JobMatchAnalysis,
  MatchRecommendation,
  SeniorityMatchLevel,
} from "@/types/ai-match";
import { JobApplyMaterialsMap } from "@/types/ai-apply";
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
  initialMaterials?: JobApplyMaterialsMap | null;
  onOpenEditModal?: () => void;
  onOpenHelpMeApply?: () => void;
  onMarkApplied?: () => void;
  onMaterialsUpdated?: (updatedMap: JobApplyMaterialsMap) => void;
}

export function AIMatchPanel({
  jobId,
  jobTitle,
  company,
  description,
  currentStatus,
  initialAnalysis,
  initialMaterials,
  onOpenEditModal,
  onOpenHelpMeApply,
  onMarkApplied,
  onMaterialsUpdated,
}: AIMatchPanelProps) {
  const [isHelpMeApplyOpen, setIsHelpMeApplyOpen] = useState(false);
  const [analysis, setAnalysis] = useState<JobMatchAnalysis | null>(
    initialAnalysis || null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [addingSkill, setAddingSkill] = useState<string | null>(null);
  const [addedSkillNotification, setAddedSkillNotification] = useState<string | null>(
    null
  );
  const [showReanalyzeConfirm, setShowReanalyzeConfirm] = useState(false);

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
      "Benchmarking profile, skills & project portfolio...",
      "Extracting required vs nice-to-have requirements...",
      "Evaluating seniority alignment & key requirements...",
      "Finalizing structured match assessment...",
    ];
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev + 1) % steps.length);
    }, 1400);
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleStartAnalyze = () => {
    if (analysis && !showReanalyzeConfirm) {
      setShowReanalyzeConfirm(true);
      return;
    }
    handleAnalyze();
  };

  const handleAnalyze = async () => {
    if (!description || !description.trim()) {
      setError("Please add a job description first to analyze the match.");
      return;
    }

    setIsLoading(true);
    setShowReanalyzeConfirm(false);
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

  // ── Visual helpers ──

  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-emerald-600 dark:text-emerald-400";
    if (score >= 50) return "text-amber-600 dark:text-amber-400";
    return "text-rose-600 dark:text-rose-400";
  };

  const getScoreRingColor = (score: number) => {
    if (score >= 75) return "#10b981";
    if (score >= 50) return "#f59e0b";
    return "#f43f5e";
  };

  const getScoreBgGradient = (score: number) => {
    if (score >= 75)
      return "from-emerald-50/60 via-emerald-50/30 to-transparent dark:from-emerald-950/30 dark:via-emerald-950/10 dark:to-transparent";
    if (score >= 50)
      return "from-amber-50/60 via-amber-50/30 to-transparent dark:from-amber-950/30 dark:via-amber-950/10 dark:to-transparent";
    return "from-rose-50/60 via-rose-50/30 to-transparent dark:from-rose-950/30 dark:via-rose-950/10 dark:to-transparent";
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

  // Radial progress — larger gauge
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = analysis
    ? circumference - (analysis.matchPercentage / 100) * circumference
    : circumference;

  const loadingStepsText = [
    "Benchmarking profile, skills & project portfolio...",
    "Extracting required vs nice-to-have requirements...",
    "Evaluating seniority alignment & key requirements...",
    "Finalizing structured match assessment...",
  ];

  // Skill stats for the fraction display
  const matchedCount = analysis?.matchedSkills?.length || 0;
  const missingCount = analysis?.missingSkills?.length || 0;
  const totalRequired = matchedCount + missingCount;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-all overflow-hidden">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-zinc-100 dark:border-zinc-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              AI Match Analysis
            </h2>
          </div>
        </div>

        <button
          onClick={handleStartAnalyze}
          disabled={isLoading}
          title="Re-analyze match against current profile"
          className="px-3.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-xs active:scale-[0.98]"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-zinc-500" : "text-zinc-400"}`} />
          <span>{analysis ? "Re-analyze" : "Analyze"}</span>
        </button>
      </div>

      <div className="p-6 space-y-5">
        {/* ── Error ── */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-start gap-3 text-sm text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-0.5">
              <p className="font-semibold text-xs">Analysis Failed</p>
              <p className="text-xs opacity-90">{error}</p>
            </div>
          </div>
        )}

        {/* ── State 1: No description ── */}
        {!hasDescription && !analysis && (
          <div className="p-8 rounded-2xl bg-zinc-50/70 dark:bg-zinc-800/30 border border-dashed border-zinc-200 dark:border-zinc-800 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto">
              <FileText className="w-5 h-5 text-zinc-400" />
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                No Job Description Provided
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xs mx-auto">
                Add the role description and requirements to enable AI matching against your verified profile.
              </p>
            </div>
            {onOpenEditModal && (
              <button
                onClick={onOpenEditModal}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white shadow-[0_4px_24px_rgba(249,115,22,0.5)] border border-amber-300/40 transition cursor-pointer active:scale-[0.98]"
              >
                + Add Job Description
              </button>
            )}
          </div>
        )}

        {/* ── State 2: Ready to analyze ── */}
        {hasDescription && !analysis && !isLoading && (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl border bg-gradient-to-br from-amber-50/80 via-orange-50/50 to-rose-50/30 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-rose-950/20 border-amber-300/80 dark:border-amber-800 text-amber-950 dark:text-amber-100 space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold">
                <Sparkles className="w-4 h-4 text-orange-500 dark:text-orange-400" />
                <span>Evaluate Match Signal</span>
              </div>
              <p className="text-xs opacity-90 leading-relaxed">
                Benchmark your technical skills, qualifications, and credentials against this posting to calculate an objective match assessment.
              </p>
            </div>

            <button
              onClick={handleAnalyze}
              className="w-full py-3 px-4 rounded-2xl text-sm font-bold tracking-wide bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-white shadow-[0_4px_24px_rgba(249,115,22,0.5),0_0_12px_rgba(244,63,94,0.35)] hover:shadow-[0_6px_32px_rgba(249,115,22,0.7)] border border-amber-300/40 transition flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] group"
            >
              <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform opacity-90" />
              <span>Analyze Job Match</span>
            </button>
          </div>
        )}

        {/* ── State 3: Loading ── */}
        {isLoading && (
          <div className="space-y-6 py-6">
            <div className="flex items-center justify-center gap-5">
              <div className="relative w-18 h-18 flex items-center justify-center shrink-0">
                <div className="w-16 h-16 rounded-full border-[3px] border-amber-100 dark:border-amber-950/60 border-t-orange-500 animate-spin" />
                <Sparkles className="w-5 h-5 absolute animate-pulse text-orange-500" />
              </div>

              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="text-sm font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                  <span>Analyzing Fit</span>
                  <span className="flex space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:-0.3s] bg-gradient-to-r from-amber-400 to-rose-400" />
                    <span className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:-0.15s] bg-gradient-to-r from-amber-400 to-rose-400" />
                    <span className="w-1.5 h-1.5 rounded-full animate-bounce bg-gradient-to-r from-amber-400 to-rose-400" />
                  </span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                  {loadingStepsText[loadingStep]}
                </p>
              </div>
            </div>

            <div className="space-y-2.5 pt-1">
              <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg animate-pulse" />
              <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg animate-pulse w-4/5" />
              <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg animate-pulse w-3/5" />
            </div>
          </div>
        )}

        {/* ── State 4: Results ── */}
        {analysis && !isLoading && (
          <div className="space-y-5">
            {/* ═══ HERO: Score + Recommendation + Summary ═══ */}
            <div className={`relative p-5 rounded-2xl bg-gradient-to-br ${getScoreBgGradient(analysis.matchPercentage)} border border-zinc-200/60 dark:border-zinc-800/80 overflow-hidden`}>
              <div className="flex items-center gap-5">
                {/* Circular Gauge */}
                <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                  <svg className="w-20 h-20 -rotate-90" viewBox="0 0 88 88">
                    <circle
                      cx="44"
                      cy="44"
                      r={radius}
                      stroke="currentColor"
                      strokeWidth="6"
                      className="text-zinc-200/80 dark:text-zinc-700/80"
                      fill="transparent"
                    />
                    <circle
                      cx="44"
                      cy="44"
                      r={radius}
                      stroke={getScoreRingColor(analysis.matchPercentage)}
                      strokeWidth="6"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-lg font-extrabold tracking-tight leading-none ${getScoreColor(analysis.matchPercentage)}`}>
                      {analysis.matchPercentage}%
                    </span>
                    <span className="text-[9px] font-medium text-zinc-400 dark:text-zinc-500 mt-0.5">match</span>
                  </div>
                </div>

                {/* Score info + badge */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div>
                    <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                      {analysis.matchLabel || "Match Assessment"}
                    </h3>
                    {totalRequired > 0 && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                        {matchedCount} of {totalRequired} required skills matched
                      </p>
                    )}
                  </div>

                  {/* Recommendation badge */}
                  {(() => {
                    const badge = getRecommendationBadge(analysis.recommendation);
                    const IconComp = badge.icon;
                    return (
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-semibold ${badge.bg}`}>
                        <IconComp className="w-3.5 h-3.5" />
                        <span>{badge.label}</span>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Summary */}
              {(analysis.recommendationReason || analysis.summary) && (
                <p className="mt-4 text-[13px] text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-200/50 dark:border-zinc-700/50 pt-3.5">
                  {analysis.recommendationReason || analysis.summary}
                </p>
              )}
            </div>

            {/* Added Skill Notification */}
            {addedSkillNotification && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center gap-2.5 animate-fade-in shadow-xs">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 stroke-[2.5]" />
                <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-200">
                  {addedSkillNotification}
                </span>
              </div>
            )}

            {/* ═══ SECTION CARDS ═══ */}
            <div className="space-y-3">
              {/* ── 1. Skills ── */}
              <div className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-3 bg-zinc-50/80 dark:bg-zinc-800/40 border-b border-zinc-100 dark:border-zinc-800/60">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                    Skills
                  </h4>
                  {totalRequired > 0 && (
                    <span className={`ml-auto text-xs font-bold tabular-nums ${getScoreColor(analysis.matchPercentage)}`}>
                      {matchedCount}/{totalRequired}
                    </span>
                  )}
                </div>

                <div className="px-5 py-4 space-y-4">
                  {/* Matched Skills */}
                  {analysis.matchedSkills && analysis.matchedSkills.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[11px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        Skills You Have ({analysis.matchedSkills.length})
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {analysis.matchedSkills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/50 text-xs font-medium"
                          >
                            <Check className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Missing Skills */}
                  {analysis.missingSkills && analysis.missingSkills.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[11px] uppercase font-bold tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                        <X className="w-3.5 h-3.5 stroke-[2.5]" />
                        Skills You&apos;re Missing ({analysis.missingSkills.length})
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {analysis.missingSkills.map((skill, idx) => {
                          const isCurrentlyAdding = addingSkill === skill;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleAddSkill(skill)}
                              disabled={!!addingSkill}
                              title={`Click to add "${skill}" to your skills`}
                              className="group/skill inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border border-amber-200/70 dark:border-amber-800/50 text-xs font-medium hover:bg-amber-100/90 dark:hover:bg-amber-900/50 hover:border-amber-300 dark:hover:border-amber-700 hover:text-amber-950 dark:hover:text-amber-100 transition-all cursor-pointer disabled:opacity-50"
                            >
                              {isCurrentlyAdding ? (
                                <Loader2 className="w-3 h-3 text-amber-600 dark:text-amber-400 animate-spin" />
                              ) : (
                                <>
                                  <X className="w-3 h-3 text-amber-500 dark:text-amber-400 group-hover/skill:hidden" />
                                  <Plus className="w-3 h-3 text-amber-700 dark:text-amber-300 hidden group-hover/skill:inline-block stroke-[2.5]" />
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
              </div>

              {/* ── 2. Requirements & Nice to Have ── */}
              {(analysis.unmetRequirements?.length > 0 ||
                analysis.niceToHave?.length > 0) && (
                <div className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 overflow-hidden">
                  <div className="flex items-center gap-2 px-5 py-3 bg-zinc-50/80 dark:bg-zinc-800/40 border-b border-zinc-100 dark:border-zinc-800/60">
                    <ShieldCheck className="w-4 h-4 text-sky-500" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      Requirements
                    </h4>
                  </div>

                  <div className="px-5 py-4 space-y-4">
                    {/* Unmet Requirements */}
                    {analysis.unmetRequirements &&
                      analysis.unmetRequirements.length > 0 && (
                        <div className="space-y-2.5">
                          <span className="text-[11px] uppercase font-bold tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Requirements You Don&apos;t Meet
                          </span>
                          <ul className="space-y-2">
                            {analysis.unmetRequirements.map((unmet, idx) => (
                              <li
                                key={idx}
                                className="flex items-start gap-3 text-[13px] text-zinc-600 dark:text-zinc-400 leading-relaxed"
                              >
                                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                                <span>{unmet}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                    {/* Nice to Have */}
                    {analysis.niceToHave && analysis.niceToHave.length > 0 && (
                      <div className="space-y-2.5">
                        <span className="text-[11px] uppercase font-bold tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                          <Star className="w-3.5 h-3.5 text-amber-500" />
                          Nice to Have
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {analysis.niceToHave.map((item, idx) => {
                            if (item.hasSkill) {
                              return (
                                <span
                                  key={idx}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40 text-xs font-medium"
                                >
                                  <Check className="w-3 h-3 text-emerald-600" />
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
                                className="group/nice inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/70 dark:border-zinc-700 text-xs font-medium hover:bg-zinc-200/80 dark:hover:bg-zinc-700 transition cursor-pointer disabled:opacity-50"
                              >
                                {isCurrentlyAdding ? (
                                  <Loader2 className="w-3 h-3 text-zinc-500 animate-spin" />
                                ) : (
                                  <Plus className="w-3 h-3 text-zinc-400 group-hover/nice:text-zinc-900 dark:group-hover/nice:text-zinc-100" />
                                )}
                                <span>{item.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── 3. Seniority ── */}
              {analysis.seniorityAssessment && (
                <div className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-3 bg-zinc-50/80 dark:bg-zinc-800/40 border-b border-zinc-100 dark:border-zinc-800/60">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-teal-500" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                        Seniority
                      </h4>
                    </div>
                    {(() => {
                      const senBadge = getSeniorityBadge(analysis.seniorityLevel);
                      const SenIcon = senBadge.icon;
                      return (
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-bold ${senBadge.bg}`}>
                          <SenIcon className="w-3 h-3" />
                          <span>{senBadge.label}</span>
                        </span>
                      );
                    })()}
                  </div>

                  <div className="px-5 py-4">
                    <p className="text-[13px] text-zinc-700 dark:text-zinc-300 leading-relaxed">
                      {analysis.seniorityAssessment}
                    </p>
                  </div>
                </div>
              )}

              {/* ── 4. Assessment (Strengths & Gaps) ── */}
              {(analysis.keyStrengths?.length > 0 ||
                analysis.potentialGaps?.length > 0) && (
                <div className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 overflow-hidden">
                  <div className="flex items-center gap-2 px-5 py-3 bg-zinc-50/80 dark:bg-zinc-800/40 border-b border-zinc-100 dark:border-zinc-800/60">
                    <Target className="w-4 h-4 text-indigo-500" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      Assessment
                    </h4>
                  </div>

                  <div className="px-5 py-4 space-y-4">
                    {/* Key Strengths */}
                    {analysis.keyStrengths && analysis.keyStrengths.length > 0 && (
                      <div className="space-y-2.5">
                        <span className="text-[11px] uppercase font-bold tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                          <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
                          Key Strengths
                        </span>
                        <ul className="space-y-2">
                          {analysis.keyStrengths.map((str, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-3 text-[13px] text-zinc-700 dark:text-zinc-300 leading-relaxed"
                            >
                              <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                              <span>{str}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Potential Gaps */}
                    {analysis.potentialGaps && analysis.potentialGaps.length > 0 && (
                      <div className="space-y-2.5">
                        <span className="text-[11px] uppercase font-bold tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                          Potential Gaps
                        </span>
                        <ul className="space-y-2">
                          {analysis.potentialGaps.map((gap, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-3 text-[13px] text-zinc-600 dark:text-zinc-400 leading-relaxed"
                            >
                              <span className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                              <span>{gap}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ── Footer Timestamp ── */}
            {analysis.analyzedAt && (
              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center text-[11px] text-zinc-400 dark:text-zinc-500">
                <Clock className="w-3.5 h-3.5 mr-1.5" />
                Evaluated on {new Date(analysis.analyzedAt).toLocaleDateString()}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      <HelpMeApplyModal
        isOpen={isHelpMeApplyOpen}
        onClose={() => setIsHelpMeApplyOpen(false)}
        jobId={jobId}
        jobTitle={jobTitle}
        company={company}
        description={description}
        currentStatus={currentStatus}
        initialMaterials={initialMaterials}
        onMarkApplied={onMarkApplied}
        onMaterialsUpdated={onMaterialsUpdated}
      />

      {/* Confirmation Modal for Re-analysis */}
      {showReanalyzeConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-fade-in"
            onClick={() => setShowReanalyzeConfirm(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            className="relative z-10 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl max-w-sm w-full p-6 space-y-4 animate-modal text-center"
          >
            <div className="space-y-1.5 pt-1">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                Re-analyze Job Match?
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                This will recalculate your match score and re-evaluate your updated profile, skills, and projects against this job.
              </p>
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowReanalyzeConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-xs transition cursor-pointer shadow-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowReanalyzeConfirm(false);
                  handleAnalyze();
                }}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-white shadow-[0_4px_20px_rgba(249,115,22,0.45)] text-xs font-bold transition cursor-pointer"
              >
                Re-analyze
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
