"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { FileText, Sparkles, History, ArrowRight, Download, Check } from "lucide-react";

interface ResumeGeneratorProps {
  userEmail?: string;
}

export function ResumeGenerator({ userEmail }: ResumeGeneratorProps) {
  const [jobDescription, setJobDescription] = useState("");
  const [format, setFormat] = useState("ats");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobDescription.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1500);
  };

  const sampleResumes = [
    { title: "Senior Software Engineer Resume", target: "Google Application", date: "Aug 02, 2026", format: "ATS-Optimized" },
    { title: "Frontend Developer Resume", target: "Stripe Application", date: "Jul 28, 2026", format: "Standard PDF" },
    { title: "Fullstack Architect Resume", target: "Vercel Application", date: "Jul 15, 2026", format: "ATS-Optimized" },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <Sidebar userEmail={userEmail} />

      <main className="pl-60 min-h-screen flex flex-col">
        <div className="flex-1 p-10 max-w-6xl mx-auto w-full space-y-10">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Resume Tailoring Engine</p>
              <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 mt-1">Generate Custom Resume</h1>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-zinc-500 whitespace-nowrap">Format Template:</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="py-2.5 px-4 rounded-full bg-zinc-100 text-zinc-900 text-xs font-semibold border-0 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition cursor-pointer appearance-none"
              >
                <option value="ats">ATS-Optimized PDF</option>
                <option value="standard">Standard Professional</option>
                <option value="creative">Modern Creative</option>
              </select>
            </div>
          </div>

          {/* Main Input Area */}
          <div className="bg-white rounded-2xl p-8 border border-zinc-100 space-y-6">
            <form onSubmit={handleGenerate} className="space-y-5">
              <div className="relative">
                <textarea
                  required
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the target job description details here to tailor your resume..."
                  rows={14}
                  className="w-full p-6 rounded-2xl bg-zinc-100 text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition placeholder-zinc-400 resize-none min-h-[320px]"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2 border-t border-zinc-50">
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Profile connected: Ready to tailor</span>
                </div>

                <button
                  type="submit"
                  disabled={loading || !jobDescription.trim()}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-8 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-semibold disabled:opacity-50 transition cursor-pointer"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Tailoring Resume...
                    </span>
                  ) : (
                    <>
                      <span>Generate Resume</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {success && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-sm flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-emerald-600 shrink-0" />
                  <span>Custom resume tailored successfully based on your profile items.</span>
                </div>
                <button className="flex items-center gap-1.5 py-2 px-4 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition cursor-pointer">
                  <Download className="h-3.5 w-3.5" />
                  Download PDF
                </button>
              </div>
            )}
          </div>

          {/* Recent History Grid */}
          <div className="space-y-5 pt-4">
            <div className="flex items-center gap-2">
              <History className="h-4.5 w-4.5 text-zinc-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Recently Generated Resumes</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {sampleResumes.map((resume, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-6 border border-zinc-100 flex flex-col justify-between gap-4 hover:border-zinc-200 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-bold text-zinc-900 leading-snug">{resume.title}</h3>
                      <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-500 text-[9px] font-semibold tracking-wide whitespace-nowrap">
                        {resume.format}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 font-medium">{resume.target}</p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-zinc-50 text-[10px] font-semibold text-zinc-400">
                    <span>{resume.date}</span>
                    <button className="flex items-center gap-1 text-zinc-900 hover:text-zinc-600 cursor-pointer">
                      <Download className="h-3.5 w-3.5" />
                      PDF
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
