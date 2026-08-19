"use client";

import React, { useState } from "react";
import { X, AlertCircle, Pin } from "lucide-react";
import {
  JobApplication,
  JobMatch,
  JobStatus,
  WorkplaceType,
  JOB_STATUS_CONFIG,
  PLATFORM_OPTIONS,
} from "@/types/job";

interface JobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (job: Omit<JobApplication, "id" | "createdAt" | "updatedAt"> & { id?: string }) => void;
  initialJob?: JobApplication | null;
}

interface FormInnerProps {
  initialJob?: JobApplication | null;
  onClose: () => void;
  onSave: (job: Omit<JobApplication, "id" | "createdAt" | "updatedAt"> & { id?: string }) => void;
}

function JobModalForm({ initialJob, onClose, onSave }: FormInnerProps) {
  const [jobTitle, setJobTitle] = useState(initialJob?.jobTitle || "");
  const [company, setCompany] = useState(initialJob?.company || "");
  const [description, setDescription] = useState(initialJob?.description || "");
  const [appliedOn, setAppliedOn] = useState(initialJob?.appliedOn || "LinkedIn");
  const [jobUrl, setJobUrl] = useState(initialJob?.jobUrl || "");
  const [dateApplied, setDateApplied] = useState(
    initialJob?.dateApplied || new Date().toISOString().split("T")[0]
  );
  const [status, setStatus] = useState<JobStatus>(initialJob?.status || "applied");
  const [workplaceType, setWorkplaceType] = useState<WorkplaceType>(
    initialJob?.workplaceType || "Remote"
  );
  const [salary, setSalary] = useState(initialJob?.salary || "");
  const [match, setMatch] = useState<JobMatch>(initialJob?.match || "good");
  const [isPinned, setIsPinned] = useState(initialJob?.isPinned || false);
  const [errors, setErrors] = useState<{ jobTitle?: string; company?: string; dateApplied?: string }>({});

  const validate = () => {
    const newErrors: { jobTitle?: string; company?: string; dateApplied?: string } = {};
    if (!jobTitle.trim()) newErrors.jobTitle = "Job title is required";
    if (!company.trim()) newErrors.company = "Company is required";
    if (!dateApplied.trim()) newErrors.dateApplied = "Date is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      ...(initialJob ? { id: initialJob.id } : {}),
      jobTitle: jobTitle.trim(),
      company: company.trim(),
      description: description.trim(),
      appliedOn,
      jobUrl: jobUrl.trim(),
      dateApplied,
      status,
      workplaceType,
      salary: salary.trim(),
      match,
      isPinned,
    });
    onClose();
  };

  return (
    <div className="bg-white rounded-3xl border border-zinc-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden my-auto">
      {/* Header */}
      <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
        <h2 className="text-base font-bold text-zinc-900">
          {initialJob ? "Edit Application" : "Add Job Application"}
        </h2>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-500 hover:text-zinc-800 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* Title & Company */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Job Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Software Engineer"
              value={jobTitle}
              onChange={(e) => {
                setJobTitle(e.target.value);
                if (errors.jobTitle) setErrors({ ...errors, jobTitle: undefined });
              }}
              className={`w-full px-3 py-2 rounded-xl bg-zinc-50 border ${
                errors.jobTitle ? "border-rose-400" : "border-zinc-200"
              } text-xs font-medium text-zinc-900 focus:border-zinc-400 transition`}
            />
            {errors.jobTitle && (
              <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.jobTitle}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Company <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Acme Corp"
              value={company}
              onChange={(e) => {
                setCompany(e.target.value);
                if (errors.company) setErrors({ ...errors, company: undefined });
              }}
              className={`w-full px-3 py-2 rounded-xl bg-zinc-50 border ${
                errors.company ? "border-rose-400" : "border-zinc-200"
              } text-xs font-medium text-zinc-900 focus:border-zinc-400 transition`}
            />
            {errors.company && (
              <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.company}
              </p>
            )}
          </div>
        </div>

        {/* Status, Date, Match */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as JobStatus)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-semibold text-zinc-900 focus:border-zinc-400 cursor-pointer"
            >
              {Object.entries(JOB_STATUS_CONFIG).map(([key, val]) => (
                <option key={key} value={key}>
                  {val.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Date Applied <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={dateApplied}
              onChange={(e) => {
                setDateApplied(e.target.value);
                if (errors.dateApplied) setErrors({ ...errors, dateApplied: undefined });
              }}
              className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-medium text-zinc-900 focus:border-zinc-400 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Match
            </label>
            <select
              value={match}
              onChange={(e) => setMatch(e.target.value as JobMatch)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-semibold text-zinc-900 focus:border-zinc-400 cursor-pointer"
            >
              <option value="good">⭐ Good Match</option>
              <option value="mid">☆ Mid Match</option>
              <option value="far">✩ Far Match</option>
            </select>
          </div>
        </div>

        {/* Platform & Workplace */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Applied On
            </label>
            <select
              value={appliedOn}
              onChange={(e) => setAppliedOn(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-semibold text-zinc-900 focus:border-zinc-400 cursor-pointer"
            >
              {PLATFORM_OPTIONS.map((plat) => (
                <option key={plat} value={plat}>
                  {plat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Workplace
            </label>
            <select
              value={workplaceType}
              onChange={(e) => setWorkplaceType(e.target.value as WorkplaceType)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-semibold text-zinc-900 focus:border-zinc-400 cursor-pointer"
            >
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="On-site">On-site</option>
            </select>
          </div>
        </div>

        {/* Salary & Job URL */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Salary / Range
            </label>
            <input
              type="text"
              placeholder="e.g. $120k - $140k"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-medium text-zinc-900 focus:border-zinc-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Job URL
            </label>
            <input
              type="url"
              placeholder="https://..."
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-medium text-zinc-900 focus:border-zinc-400"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1">
            Description
          </label>
          <textarea
            rows={4}
            placeholder="Job description or notes..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:border-zinc-400 resize-y"
          />
        </div>

        {/* Pin Toggle Checkbox */}
        <div className="pt-1">
          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="w-4 h-4 rounded-md border-zinc-300 text-zinc-900 cursor-pointer accent-zinc-900"
            />
            <span className="text-xs font-medium text-zinc-700 flex items-center gap-1.5">
              <Pin className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              Pin this application to top
            </span>
          </label>
        </div>
      </form>

      {/* Footer */}
      <div className="px-6 py-3.5 border-t border-zinc-100 bg-zinc-50/50 flex items-center justify-end gap-2.5">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-full border border-zinc-200 bg-white text-zinc-700 text-xs font-semibold hover:bg-zinc-100 transition cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="px-5 py-2 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold transition cursor-pointer"
        >
          {initialJob ? "Save Changes" : "Add Application"}
        </button>
      </div>
    </div>
  );
}

export function JobModal({ isOpen, onClose, onSave, initialJob }: JobModalProps) {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs overflow-y-auto animate-fade-in"
    >
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-2xl animate-modal">
        <JobModalForm
          key={initialJob ? initialJob.id : "new-job"}
          initialJob={initialJob}
          onClose={onClose}
          onSave={onSave}
        />
      </div>
    </div>
  );
}
