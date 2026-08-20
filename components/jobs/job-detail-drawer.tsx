"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Building2,
  Calendar,
  DollarSign,
  Briefcase,
  ExternalLink,
  Edit3,
  Trash2,
  Copy,
  Check,
  Globe,
  Star,
  Pin,
} from "lucide-react";
import {
  JobApplication,
  JobStatus,
  JobMatch,
  JOB_STATUS_CONFIG,
  MATCH_CONFIG,
  formatRelativeDate,
} from "@/types/job";
import { StatusIcon } from "./status-dropdown";

interface JobDetailDrawerProps {
  job: JobApplication | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (job: JobApplication) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, newStatus: JobStatus) => void;
  onTogglePin: (id: string) => void;
}

function MatchBadge({ match }: { match?: JobMatch }) {
  const m = match || "good";
  const config = MATCH_CONFIG[m] || MATCH_CONFIG.good;

  return (
    <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full border ${config.bg} ${config.text} ${config.border}`}>
      {m === "good" && <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />}
      {m === "mid" && <Star className="w-3.5 h-3.5 text-amber-500 stroke-[2]" />}
      {m === "far" && <Star className="w-3.5 h-3.5 text-zinc-400 stroke-[2]" />}
      <span className="text-[10px] font-bold">{config.label}</span>
    </div>
  );
}

export function JobDetailDrawer({
  job,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onStatusChange,
  onTogglePin,
}: JobDetailDrawerProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedContactLink, setCopiedContactLink] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !job) return null;

  const currentStatusConfig = JOB_STATUS_CONFIG[job.status] || JOB_STATUS_CONFIG.applied;

  const handleCopyLink = () => {
    if (job.jobUrl) {
      navigator.clipboard.writeText(job.jobUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleCopyContactLink = () => {
    if (job.contactUrl) {
      navigator.clipboard.writeText(job.contactUrl);
      setCopiedContactLink(true);
      setTimeout(() => setCopiedContactLink(false), 2000);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 overflow-hidden bg-zinc-950/40 backdrop-blur-xs flex justify-end animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between border-l border-zinc-200 animate-slide-in"
      >
        {/* Header */}
        <div className="p-6 border-b border-zinc-100 flex items-start justify-between bg-zinc-50/50">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <MatchBadge match={job.match} />
              {/* Neutral status badge with colored icon on the left */}
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white border border-zinc-200 text-zinc-800 shadow-2xs">
                <StatusIcon status={job.status} className="w-3.5 h-3.5" />
                {currentStatusConfig.label}
              </span>
            </div>
            <h2 className="text-lg font-extrabold text-zinc-900 leading-tight pt-1">
              {job.jobTitle}
            </h2>
            <p className="text-sm font-semibold text-zinc-600 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-zinc-400" />
              {job.company}
            </p>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onTogglePin(job.id)}
              title={job.isPinned ? "Unpin job" : "Pin job to top"}
              className={`p-2 rounded-xl transition cursor-pointer ${
                job.isPinned
                  ? "bg-rose-50 text-rose-600 hover:bg-rose-100"
                  : "hover:bg-zinc-100 text-zinc-400 hover:text-zinc-900"
              }`}
            >
              <Pin className={`w-4 h-4 ${job.isPinned ? "fill-rose-500 text-rose-500" : ""}`} />
            </button>
            <button
              onClick={() => onEdit(job)}
              title="Edit Application"
              className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(job.id)}
              title="Delete Application"
              className="p-2 rounded-xl hover:bg-rose-50 text-zinc-400 hover:text-rose-600 transition cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-400 hover:text-zinc-900 transition cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {/* Quick Status Pipeline */}
          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-2">
            <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">
              Update Status
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {(Object.keys(JOB_STATUS_CONFIG) as JobStatus[]).map((st) => {
                const config = JOB_STATUS_CONFIG[st];
                const isCurrent = job.status === st;
                return (
                  <button
                    key={st}
                    onClick={() => onStatusChange(job.id, st)}
                    className={`px-2.5 py-2 rounded-xl font-semibold text-[11px] transition flex items-center justify-center gap-1.5 border cursor-pointer ${
                      isCurrent
                        ? "bg-zinc-900 text-white border-zinc-900 shadow-2xs font-bold"
                        : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100 hover:text-zinc-900"
                    }`}
                  >
                    <StatusIcon status={st} className="w-3 h-3" />
                    <span>{config.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Key Facts */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-white border border-zinc-200">
              <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block mb-1">
                Date Applied
              </span>
              <div className="flex items-center gap-2 font-semibold text-zinc-800">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                <span>{job.dateApplied}</span>
                <span className="text-[11px] text-zinc-400 font-normal">
                  ({formatRelativeDate(job.dateApplied)})
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-zinc-200">
              <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block mb-1">
                Platform
              </span>
              <div className="flex items-center gap-2 font-semibold text-zinc-800">
                <Globe className="w-3.5 h-3.5 text-zinc-400" />
                {job.appliedOn}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-zinc-200">
              <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block mb-1">
                Workplace
              </span>
              <div className="flex items-center gap-2 font-semibold text-zinc-800">
                <Briefcase className="w-3.5 h-3.5 text-zinc-400" />
                {job.workplaceType}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-zinc-200">
              <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block mb-1">
                Salary
              </span>
              <div className="flex items-center gap-2 font-semibold text-zinc-800">
                <DollarSign className="w-3.5 h-3.5 text-zinc-400" />
                {job.salary || "Not specified"}
              </div>
            </div>
          </div>

          {/* Job URL Link */}
          {job.jobUrl && (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-100/70 border border-zinc-200">
              <div className="truncate mr-3">
                <p className="text-[10px] uppercase font-bold text-zinc-500">Job URL</p>
                <a
                  href={job.jobUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline truncate block font-medium"
                >
                  {job.jobUrl}
                </a>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 rounded-xl bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 font-semibold text-xs flex items-center gap-1 cursor-pointer transition"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedLink ? "Copied" : "Copy"}
                </button>
                <a
                  href={job.jobUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 font-semibold text-xs flex items-center gap-1 cursor-pointer transition"
                >
                  Visit <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}

          {/* Contact URL Link */}
          {job.contactUrl && (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-100/70 border border-zinc-200">
              <div className="truncate mr-3">
                <p className="text-[10px] uppercase font-bold text-zinc-500">Contact / Outreach Link</p>
                <a
                  href={job.contactUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline truncate block font-medium"
                >
                  {job.contactUrl}
                </a>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={handleCopyContactLink}
                  className="px-3 py-1.5 rounded-xl bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 font-semibold text-xs flex items-center gap-1 cursor-pointer transition"
                >
                  {copiedContactLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedContactLink ? "Copied" : "Copy"}
                </button>
                <a
                  href={job.contactUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 font-semibold text-xs flex items-center gap-1 cursor-pointer transition"
                >
                  Visit <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}

          {/* Description */}
          {job.description && (
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 mb-2">
                Job Description
              </p>
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-700 leading-relaxed whitespace-pre-line font-normal">
                {job.description}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-100 bg-zinc-50/50 flex items-center justify-between text-[11px] text-zinc-400">
          <span>
            Tracked on {job.dateApplied} ({formatRelativeDate(job.dateApplied)})
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-zinc-900 text-white font-semibold hover:bg-zinc-800 transition cursor-pointer text-xs shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
