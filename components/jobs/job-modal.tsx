"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  AlertCircle,
  Pin,
  Globe,
  Laptop,
  Building2,
  Building,
  Star,
} from "lucide-react";
import {
  JobApplication,
  JobStatus,
  WorkplaceType,
  PLATFORM_OPTIONS,
} from "@/types/job";
import { StatusDropdown } from "./status-dropdown";
import { CustomSelect, CustomSelectOption } from "./custom-select";
import { PlatformIcon } from "./platform-badge";

interface JobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    job: Omit<JobApplication, "id" | "createdAt" | "updatedAt"> & { id?: string }
  ) => void;
  initialJob?: JobApplication | null;
}

const PLATFORM_SELECT_OPTIONS: CustomSelectOption<string>[] = PLATFORM_OPTIONS.map(
  (plat) => ({
    value: plat,
    label: plat,
    icon: <PlatformIcon platform={plat} className="w-3.5 h-3.5" />,
  })
);

const WORKPLACE_SELECT_OPTIONS: CustomSelectOption<WorkplaceType>[] = [
  {
    value: "Remote",
    label: "Remote",
    icon: <Laptop className="w-3.5 h-3.5 text-emerald-600" />,
  },
  {
    value: "Hybrid",
    label: "Hybrid",
    icon: <Building2 className="w-3.5 h-3.5 text-blue-600" />,
  },
  {
    value: "On-site",
    label: "On-site",
    icon: <Building className="w-3.5 h-3.5 text-purple-600" />,
  },
];

const CURRENCY_OPTIONS = [
  { value: "₱", label: "₱ (PHP)" },
  { value: "$", label: "$ (USD)" },
  { value: "£", label: "£ (GBP)" },
  { value: "€", label: "€ (EUR)" },
  { value: "¥", label: "¥ (JPY)" },
  { value: "C$", label: "C$ (CAD)" },
  { value: "A$", label: "A$ (AUD)" },
  { value: "S$", label: "S$ (SGD)" },
];

const PERIOD_OPTIONS = [
  { value: "/mo", label: "/mo" },
  { value: "/hr", label: "/hr" },
  { value: "/yr", label: "/yr" },
  { value: "/wk", label: "/wk" },
];

export function formatSalaryInput(input: string): string {
  if (!input) return "";

  if (input.includes("-")) {
    const parts = input.split("-");
    const minClean = parts[0].replace(/[^\d]/g, "");
    const formattedMin = minClean ? Number(minClean).toLocaleString("en-US") : "";

    if (parts.length > 1) {
      const maxClean = parts[1].replace(/[^\d]/g, "");
      const formattedMax = maxClean ? Number(maxClean).toLocaleString("en-US") : "";

      if (!maxClean) {
        return formattedMin ? `${formattedMin} - ` : "- ";
      }
      return formattedMin ? `${formattedMin} - ${formattedMax}` : `- ${formattedMax}`;
    }
    return formattedMin;
  }

  const clean = input.replace(/[^\d]/g, "");
  if (!clean) return "";
  return Number(clean).toLocaleString("en-US");
}

function parseSalary(rawSalary?: string): {
  currency: string;
  amount: string;
  period: string;
} {
  if (!rawSalary) {
    return { currency: "₱", amount: "", period: "/mo" };
  }

  let text = rawSalary.trim();
  let currency = "₱";
  let period = "/mo";

  for (const c of CURRENCY_OPTIONS) {
    if (text.startsWith(c.value)) {
      currency = c.value;
      text = text.slice(c.value.length).trim();
      break;
    }
  }

  for (const p of PERIOD_OPTIONS) {
    if (text.toLowerCase().endsWith(p.value.toLowerCase())) {
      period = p.value;
      text = text.slice(0, text.length - p.value.length).trim();
      break;
    }
  }

  return { currency, amount: formatSalaryInput(text), period };
}

function JobModalForm({
  initialJob,
  onSave,
  onClose,
}: {
  initialJob?: JobApplication | null;
  onSave: JobModalProps["onSave"];
  onClose: () => void;
}) {
  const [jobTitle, setJobTitle] = useState(initialJob?.jobTitle || "");
  const [company, setCompany] = useState(initialJob?.company || "");
  const [description, setDescription] = useState(initialJob?.description || "");
  const [appliedOn, setAppliedOn] = useState(
    initialJob?.appliedOn || PLATFORM_OPTIONS[0]
  );
  const [jobUrl, setJobUrl] = useState(initialJob?.jobUrl || "");
  const [contactUrl, setContactUrl] = useState(initialJob?.contactUrl || "");
  const [dateApplied, setDateApplied] = useState(
    initialJob?.dateApplied || new Date().toISOString().split("T")[0]
  );
  const [status, setStatus] = useState<JobStatus>(
    initialJob?.status || "applied"
  );
  const [workplaceType, setWorkplaceType] = useState<WorkplaceType>(
    initialJob?.workplaceType || "Remote"
  );
  const initialSalaryParsed = useMemo(
    () => parseSalary(initialJob?.salary),
    [initialJob?.salary]
  );
  const [salaryCurrency, setSalaryCurrency] = useState(initialSalaryParsed.currency);
  const [salaryAmount, setSalaryAmount] = useState(initialSalaryParsed.amount);
  const [salaryPeriod, setSalaryPeriod] = useState(initialSalaryParsed.period);
  const [isPinned, setIsPinned] = useState(initialJob?.isPinned || false);
  const [errors, setErrors] = useState<{
    jobTitle?: string;
    company?: string;
    dateApplied?: string;
  }>({});

  const validate = () => {
    const newErrors: { jobTitle?: string; company?: string; dateApplied?: string } = {};
    if (!jobTitle.trim()) newErrors.jobTitle = "Job title is required";
    if (!company.trim()) newErrors.company = "Company name is required";
    if (!dateApplied) newErrors.dateApplied = "Date applied is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const formattedSalary = salaryAmount.trim()
      ? `${salaryCurrency}${salaryAmount.trim()}${salaryPeriod}`
      : "";

    onSave({
      ...(initialJob ? { id: initialJob.id } : {}),
      jobTitle: jobTitle.trim(),
      company: company.trim(),
      description: description.trim(),
      appliedOn,
      jobUrl: jobUrl.trim(),
      contactUrl: contactUrl.trim(),
      dateApplied,
      status,
      workplaceType,
      salary: formattedSalary,
      isPinned,
    });
    onClose();
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden my-auto">
      {/* Header */}
      <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
        <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
          {initialJob ? "Edit Application" : "Add Job Application"}
        </h2>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* Title & Company */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
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
              className={`w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border ${
                errors.jobTitle ? "border-rose-400" : "border-zinc-200 dark:border-zinc-700"
              } text-xs font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-zinc-400 dark:focus:border-zinc-500 transition`}
            />
            {errors.jobTitle && (
              <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.jobTitle}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
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
              className={`w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border ${
                errors.company ? "border-rose-400" : "border-zinc-200 dark:border-zinc-700"
              } text-xs font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-zinc-400 dark:focus:border-zinc-500 transition`}
            />
            {errors.company && (
              <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.company}
              </p>
            )}
          </div>
        </div>

        {/* Status & Date Applied */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Status
            </label>
            <StatusDropdown
              value={status}
              onChange={(st) => setStatus(st)}
              size="md"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Date Applied <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={dateApplied}
              onChange={(e) => {
                setDateApplied(e.target.value);
                if (errors.dateApplied) setErrors({ ...errors, dateApplied: undefined });
              }}
              className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-900 dark:text-zinc-100 focus:border-zinc-400 dark:focus:border-zinc-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Platform & Workplace */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Applied On
            </label>
            <CustomSelect<string>
              value={appliedOn}
              onChange={(val) => setAppliedOn(val)}
              options={PLATFORM_SELECT_OPTIONS}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Workplace
            </label>
            <CustomSelect<WorkplaceType>
              value={workplaceType}
              onChange={(val) => setWorkplaceType(val)}
              options={WORKPLACE_SELECT_OPTIONS}
              className="w-full"
            />
          </div>
        </div>

        {/* Salary */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
            Salary / Range
          </label>
          <div className="flex items-center rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 focus-within:border-zinc-400 dark:focus-within:border-zinc-500 transition overflow-hidden">
            <select
              value={salaryCurrency}
              onChange={(e) => setSalaryCurrency(e.target.value)}
              className="bg-zinc-100/80 dark:bg-zinc-800 text-xs font-bold text-zinc-800 dark:text-zinc-200 py-2 pl-2.5 pr-1 border-r border-zinc-200 dark:border-zinc-700 cursor-pointer focus:outline-none shrink-0 hover:bg-zinc-200/50 dark:hover:bg-zinc-700 transition"
            >
              {CURRENCY_OPTIONS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="e.g. 50,000 - 80,000"
              value={salaryAmount}
              onChange={(e) => setSalaryAmount(formatSalaryInput(e.target.value))}
              className="flex-1 min-w-0 bg-transparent px-2.5 py-2 text-xs font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
            />
            <select
              value={salaryPeriod}
              onChange={(e) => setSalaryPeriod(e.target.value)}
              className="bg-zinc-100/80 dark:bg-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-300 py-2 pl-1.5 pr-2 border-l border-zinc-200 dark:border-zinc-700 cursor-pointer focus:outline-none shrink-0 hover:bg-zinc-200/50 dark:hover:bg-zinc-700 transition"
            >
              {PERIOD_OPTIONS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Job URL & Contact URL */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Job URL
            </label>
            <input
              type="url"
              placeholder="https://company.com/careers/..."
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-zinc-400 dark:focus:border-zinc-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Contact URL / Link
            </label>
            <input
              type="url"
              placeholder="e.g. LinkedIn message, recruiter profile..."
              value={contactUrl}
              onChange={(e) => setContactUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-zinc-400 dark:focus:border-zinc-500"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
            Description
          </label>
          <textarea
            rows={4}
            placeholder="Job description or notes..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-zinc-400 dark:focus:border-zinc-500 resize-y"
          />
        </div>

        {/* Pin Toggle Checkbox */}
        <div className="pt-1">
          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="w-4 h-4 rounded-md border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 cursor-pointer accent-zinc-900 dark:accent-zinc-100"
            />
            <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Pin className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              Pin this application to top
            </span>
          </label>
        </div>
      </form>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/80 flex items-center justify-end gap-2.5">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-100/70 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-xs transition cursor-pointer shadow-2xs"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="px-5 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 font-semibold text-xs transition cursor-pointer shadow-sm"
        >
          {initialJob ? "Save Changes" : "Create Application"}
        </button>
      </div>
    </div>
  );
}

export function JobModal({
  isOpen,
  onClose,
  onSave,
  initialJob,
}: JobModalProps) {
  const [isRendered, setIsRendered] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      setIsClosing(false);
    } else if (isRendered) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setIsRendered(false);
        setIsClosing(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isRendered]);

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsRendered(false);
      setIsClosing(false);
    }, 200);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isRendered && !isClosing) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isRendered, isClosing]);

  if (!isRendered) return null;

  return (
    <div
      onClick={handleClose}
      className={`fixed inset-0 z-50 overflow-y-auto bg-zinc-950/40 backdrop-blur-xs flex items-center justify-center p-4 ${
        isClosing ? "animate-fade-out" : "animate-fade-in"
      }`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-2xl ${
          isClosing ? "animate-modal-out" : "animate-modal"
        }`}
      >
        <JobModalForm
          key={initialJob?.id || "new-job"}
          initialJob={initialJob}
          onSave={onSave}
          onClose={handleClose}
        />
      </div>
    </div>
  );
}
