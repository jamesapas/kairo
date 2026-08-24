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
} from "lucide-react";
import {
  JobMatchAnalysis,
  MatchRecommendation,
  SeniorityMatchLevel,
} from "@/types/ai-match";
import { createSkillAction } from "@/lib/actions/skill";

interface AIMatchPanelProps {
  jobId: string;
  jobTitle?: string;
  company?: string;
  description?: string;
  initialAnalysis?: JobMatchAnalysis | null;
  onOpenEditModal?: () => void;
}

export function AIMatchPanel({
  jobId,
  jobTitle,
  company,
  description,
  initialAnalysis,
  onOpenEditModal,
}: AIMatchPanelProps) {
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
    } catch {
      // Ignore cache read errors
    }
  }, [initialAnalysis, storageKey]);

  // Loading step animation loop
  useEffect(() => {
    if (!isLoading) {
      setLoadingStep(0);
      return;
    }
    const steps = [
      "Reading candidate profile & verified skills...",
      "Extracting required vs nice-to-have technologies...",
      "Evaluating experience, seniority & requirements...",
      "Finalizing structured match assessment...",
    ];
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev + 1) % steps.length);
    }, 1500);
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
      } catch {
        // Ignore cache write errors
      }
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
    if (score >= 50) return "text-amber-500 dark:text-amber-400";
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
          label: "Apply",
          bg: "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60",
          dot: "bg-emerald-500",
          icon: CheckCircle2,
        };
      case "maybe":
        return {
          label: "Maybe",
          bg: "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/60",
          dot: "bg-amber-500",
          icon: AlertTriangle,
        };
      case "skip":
        return {
          label: "Skip",
          bg: "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/60",
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
    "Reading candidate profile & verified skills...",
    "Extracting required vs nice-to-have technologies...",
    "Evaluating experience, seniority & requirements...",
    "Finalizing structured match assessment...",
  ];

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200/90 dark:border-zinc-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-5 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-2xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs uppercase font-bold tracking-wider text-zinc-900 dark:text-zinc-100">
              AI Job Match
            </h3>
          </div>
        </div>

        {analysis && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleAnalyze}
              disabled={isLoading}
              title="Re-analyze match"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
            >
              {isExpanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        )}
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
        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/70 dark:border-zinc-800 text-center space-y-3">
          <FileText className="w-6 h-6 text-zinc-400 mx-auto" />
          <div className="space-y-1">
            <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
              No Job Description Provided
            </p>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Add the role description to enable AI matching against your profile.
            </p>
          </div>
          {onOpenEditModal && (
            <button
              onClick={onOpenEditModal}
              className="px-3 py-1.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-white transition cursor-pointer"
            >
              + Add Description
            </button>
          )}
        </div>
      )}

      {/* State 2: Initial prompt to analyze */}
      {hasDescription && !analysis && !isLoading && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/50 via-purple-50/30 to-zinc-50 dark:from-indigo-950/20 dark:via-purple-950/10 dark:to-zinc-900 border border-indigo-100/80 dark:border-indigo-900/30 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-950 dark:text-indigo-200">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Evaluate Match Signal</span>
            </div>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Kairo will benchmark your technical skills, matching experience, requirements, and seniority against this posting to calculate an objective match assessment.
            </p>
          </div>

          <button
            onClick={handleAnalyze}
            className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-zinc-900 via-indigo-950 to-zinc-900 hover:from-zinc-800 hover:to-zinc-800 dark:from-zinc-100 dark:via-indigo-100 dark:to-zinc-100 text-white dark:text-zinc-900 text-xs font-bold tracking-wide shadow-sm hover:shadow transition flex items-center justify-center gap-2 cursor-pointer group"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-300 dark:text-indigo-600 group-hover:rotate-12 transition-transform" />
            <span>Analyze Job Match</span>
          </button>
        </div>
      )}

      {/* State 3: Loading Skeleton */}
      {isLoading && (
        <div className="space-y-4 py-2">
          <div className="flex items-center justify-center gap-4">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full border-4 border-zinc-100 dark:border-zinc-800 border-t-indigo-500 dark:border-t-indigo-400 animate-spin" />
              <Sparkles className="w-5 h-5 text-indigo-500 absolute animate-pulse" />
            </div>

            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                <span>Analyzing Fit</span>
                <span className="flex space-x-1">
                  <span className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce" />
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                {loadingStepsText[loadingStep]}
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg animate-pulse" />
            <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg animate-pulse w-5/6" />
            <div className="h-10 bg-zinc-100 dark:bg-zinc-800 rounded-xl animate-pulse mt-3" />
          </div>
        </div>
      )}

      {/* State 4: Analysis Results */}
      {analysis && !isLoading && (
        <div className="space-y-5">
          {/* Main Score & Status Ribbon */}
          <div className="p-4 rounded-2xl bg-zinc-50/80 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              {/* Circular Gauge */}
              <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 76 76">
                  <circle
                    cx="38"
                    cy="38"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="6"
                    className="text-zinc-200 dark:text-zinc-700"
                    fill="transparent"
                  />
                  <circle
                    cx="38"
                    cy="38"
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
                    {analysis.matchPercentage}% MATCH
                  </h4>
                </div>
                <p className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
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
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold ${badge.bg}`}
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
            <div className="space-y-5 pt-1 text-xs">
              {/* =========================================================================
                  1. SKILLS GROUP
                  ========================================================================= */}
              <div className="space-y-3 p-3.5 rounded-2xl bg-zinc-50/50 dark:bg-zinc-800/20 border border-zinc-100 dark:border-zinc-800/80">
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
                <div className="space-y-3 p-3.5 rounded-2xl bg-zinc-50/50 dark:bg-zinc-800/20 border border-zinc-100 dark:border-zinc-800/80">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                    <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
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
                              <Award className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
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
                <div className="space-y-3 p-3.5 rounded-2xl bg-zinc-50/50 dark:bg-zinc-800/20 border border-zinc-100 dark:border-zinc-800/80">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-500" />
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
                <div className="space-y-2 p-3.5 rounded-2xl bg-zinc-50/50 dark:bg-zinc-800/20 border border-zinc-100 dark:border-zinc-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-indigo-500" />
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
                  5. KAIRO'S ASSESSMENT (KEY STRENGTHS & POTENTIAL GAPS)
                  ========================================================================= */}
              {(analysis.keyStrengths?.length > 0 ||
                analysis.potentialGaps?.length > 0) && (
                <div className="space-y-3 p-3.5 rounded-2xl bg-zinc-50/50 dark:bg-zinc-800/20 border border-zinc-100 dark:border-zinc-800/80">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                    <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                    <span>Kairo&apos;s Assessment</span>
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
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
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
                    Evaluated {new Date(analysis.analyzedAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={handleAnalyze}
                    className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    Re-evaluate
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
