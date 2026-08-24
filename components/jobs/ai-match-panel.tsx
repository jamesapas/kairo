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
  TrendingUp,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  FileText,
  Clock,
  ExternalLink,
} from "lucide-react";
import { JobMatchAnalysis, MatchRecommendation } from "@/types/ai-match";

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
  const [analysis, setAnalysis] = useState<JobMatchAnalysis | null>(initialAnalysis || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [loadingStep, setLoadingStep] = useState(0);

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
      "Reading candidate profile & skills...",
      "Parsing job requirements & role scope...",
      "Benchmarking seniority & experience fit...",
      "Generating match assessment...",
    ];
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev + 1) % steps.length);
    }, 1600);
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

  const getRecommendationConfig = (rec: MatchRecommendation) => {
    switch (rec) {
      case "apply":
        return {
          label: "Strong Fit — Recommended to Apply",
          shortLabel: "Apply",
          bg: "bg-emerald-50 dark:bg-emerald-950/40",
          text: "text-emerald-700 dark:text-emerald-300",
          border: "border-emerald-200 dark:border-emerald-800/60",
          icon: CheckCircle2,
        };
      case "maybe":
        return {
          label: "Moderate Fit — Stretch Opportunity",
          shortLabel: "Maybe",
          bg: "bg-amber-50 dark:bg-amber-950/40",
          text: "text-amber-700 dark:text-amber-300",
          border: "border-amber-200 dark:border-amber-800/60",
          icon: AlertTriangle,
        };
      case "skip":
        return {
          label: "Low Fit — Significant Gaps",
          shortLabel: "Skip",
          bg: "bg-rose-50 dark:bg-rose-950/40",
          text: "text-rose-700 dark:text-rose-300",
          border: "border-rose-200 dark:border-rose-800/60",
          icon: XCircle,
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
    "Reading candidate profile & skills...",
    "Parsing job requirements & role scope...",
    "Benchmarking seniority & experience fit...",
    "Generating match assessment...",
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
              Kairo will benchmark your career summary, technical skills, past experience, and education against this posting to calculate an objective match score.
            </p>
          </div>

          <button
            onClick={handleAnalyze}
            className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-zinc-900 via-indigo-950 to-zinc-900 hover:from-zinc-800 hover:to-zinc-800 dark:from-zinc-100 dark:via-indigo-100 dark:dark:to-zinc-100 text-white dark:text-zinc-900 text-xs font-bold tracking-wide shadow-sm hover:shadow transition flex items-center justify-center gap-2 cursor-pointer group"
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
            {/* Spinning pulse ring */}
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
          {/* Main Score & Recommendation Card */}
          <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-50/80 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800">
            {/* Circular Gauge */}
            <div className="relative w-18 h-18 flex items-center justify-center shrink-0">
              <svg className="w-18 h-18 -rotate-90" viewBox="0 0 76 76">
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
                <span className={`text-base font-extrabold tracking-tight ${getScoreColor(analysis.matchPercentage)}`}>
                  {analysis.matchPercentage}%
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                  Match
                </span>
              </div>
            </div>

            {/* Recommendation summary tag */}
            {(() => {
              const recConfig = getRecommendationConfig(analysis.recommendation);
              const RecIcon = recConfig.icon;
              return (
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold ${recConfig.bg} ${recConfig.text} ${recConfig.border}`}
                  >
                    <RecIcon className="w-3.5 h-3.5 shrink-0" />
                    <span>{recConfig.shortLabel}</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium leading-snug">
                    {recConfig.label}
                  </p>
                </div>
              );
            })()}
          </div>

          {/* Collapsible Details */}
          {isExpanded && (
            <div className="space-y-4 pt-1 text-xs">
              {/* Executive Summary */}
              {analysis.summary && (
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 dark:text-zinc-500">
                    Summary Assessment
                  </span>
                  <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed font-normal bg-zinc-50/50 dark:bg-zinc-800/20 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800/80">
                    {analysis.summary}
                  </p>
                </div>
              )}

              {/* Seniority Alignment */}
              {analysis.seniorityAssessment && (
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 dark:text-zinc-500">
                    Seniority Fit
                  </span>
                  <div className="flex items-start gap-2 p-2.5 rounded-xl bg-zinc-50/50 dark:bg-zinc-800/20 border border-zinc-100 dark:border-zinc-800/80">
                    <Briefcase className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-zinc-700 dark:text-zinc-300 leading-normal font-medium">
                      {analysis.seniorityAssessment}
                    </p>
                  </div>
                </div>
              )}

              {/* Matched Skills */}
              {analysis.matchedSkills && analysis.matchedSkills.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Check className="w-3 h-3 stroke-[2.5]" />
                      Skills You Have ({analysis.matchedSkills.length})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.matchedSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/50 text-[11px] font-medium"
                      >
                        <Check className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing Skills */}
              {analysis.missingSkills && analysis.missingSkills.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <X className="w-3 h-3 stroke-[2.5]" />
                      Skills You&apos;re Missing ({analysis.missingSkills.length})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.missingSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border border-amber-200/70 dark:border-amber-800/50 text-[11px] font-medium"
                      >
                        <X className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" />
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Relevant Experience Points */}
              {analysis.relevantExperience && analysis.relevantExperience.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 dark:text-zinc-500">
                    Relevant Experience
                  </span>
                  <ul className="space-y-1.5">
                    {analysis.relevantExperience.map((exp, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-[11px] text-zinc-700 dark:text-zinc-300 leading-snug"
                      >
                        <Award className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                        <span>{exp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Requirements You Don't Meet */}
              {analysis.unmetRequirements && analysis.unmetRequirements.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 dark:text-zinc-500">
                    Requirements You Don&apos;t Meet
                  </span>
                  <ul className="space-y-1.5">
                    {analysis.unmetRequirements.map((unmet, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-[11px] text-zinc-600 dark:text-zinc-400 leading-snug"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                        <span>{unmet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

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
