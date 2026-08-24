"use client";

import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import {
  User,
  MapPin,
  Mail,
  Globe,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Save,
} from "lucide-react";
import { UserProfile } from "@/types/profile";
import { getProfileAction, updateProfileAction } from "@/lib/actions/profile";
import { AvatarUploader } from "./avatar-uploader";

interface BasicInfoSectionProps {
  onProfileUpdated?: (profile: UserProfile) => void;
}

export function BasicInfoSection({ onProfileUpdated }: BasicInfoSectionProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Form states
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");

  useEffect(() => {
    getProfileAction().then((res) => {
      if (res.success && res.data) {
        setProfile(res.data);
        setName(res.data.name || "");
        setLocation(res.data.location || "");
        setEmail(res.data.email || "");
        setAvatarUrl(res.data.avatarUrl || "");
        setLinkedinUrl(res.data.linkedinUrl || "");
        setGithubUrl(res.data.githubUrl || "");
        setPortfolioUrl(res.data.portfolioUrl || "");
      } else {
        setErrorMsg(res.error || "Failed to load profile details");
      }
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    const res = await updateProfileAction({
      name,
      location,
      avatarUrl,
      linkedinUrl,
      githubUrl,
      portfolioUrl,
    });

    setSaving(false);

    if (!res.success) {
      setErrorMsg(res.error || "Failed to save profile changes");
      return;
    }

    if (res.data) {
      setProfile(res.data);
      onProfileUpdated?.(res.data);
      setSuccessMsg("Profile information saved successfully");
      setTimeout(() => {
        setSuccessMsg("");
      }, 4000);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 p-12 flex flex-col items-center justify-center space-y-3 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
        <p className="text-xs text-zinc-500 font-medium">Loading profile details...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Status Notifications */}
      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5 animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2.5 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 1. Avatar Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 p-6 sm:p-7 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-4">
        <div>
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Profile Photo
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            This photo will be displayed on your profile and workspace navigation
          </p>
        </div>

        <AvatarUploader
          avatarUrl={avatarUrl}
          name={name || profile?.name}
          onAvatarChange={(newUrl) => setAvatarUrl(newUrl)}
        />
      </div>

      {/* 2. Personal Information Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 p-6 sm:p-7 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-5">
        <div>
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Personal Information
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Basic details used to identify you and personalize your workspace
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Full Name */}
          <div className="space-y-1.5 sm:col-span-1">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-zinc-400" />
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Rivera"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:bg-white dark:focus:bg-zinc-800 focus:border-zinc-400 dark:focus:border-zinc-500 transition"
            />
          </div>

          {/* Location */}
          <div className="space-y-1.5 sm:col-span-1">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-zinc-400" />
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. San Francisco, CA or Remote"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:bg-white dark:focus:bg-zinc-800 focus:border-zinc-400 dark:focus:border-zinc-500 transition"
            />
          </div>

          {/* Email Address */}
          <div className="space-y-1.5 sm:col-span-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-zinc-400" />
                Account Email
              </label>
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-800/60">
                Primary
              </span>
            </div>
            <input
              type="email"
              value={email}
              disabled
              readOnly
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-100/80 dark:bg-zinc-800/40 border border-zinc-200/70 dark:border-zinc-800 text-xs font-medium text-zinc-500 dark:text-zinc-400 cursor-not-allowed select-all"
            />
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
              Synced with your authentication account
            </p>
          </div>
        </div>
      </div>

      {/* 3. Professional Links Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 p-6 sm:p-7 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-5">
        <div>
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Professional & Social Links
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Connect your portfolios and developer profiles for quick reference
          </p>
        </div>

        <div className="space-y-4">
          {/* LinkedIn URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Icon icon="simple-icons:linkedin" className="w-3.5 h-3.5 text-[#0A66C2] inline-block" />
                LinkedIn Profile
              </span>
              {linkedinUrl && (
                <a
                  href={linkedinUrl.startsWith("http") ? linkedinUrl : `https://${linkedinUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
                >
                  Visit Profile <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </label>
            <input
              type="text"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="https://linkedin.com/in/username"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:bg-white dark:focus:bg-zinc-800 focus:border-zinc-400 dark:focus:border-zinc-500 transition"
            />
          </div>

          {/* GitHub URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Icon icon="simple-icons:github" className="w-3.5 h-3.5 text-zinc-800 dark:text-zinc-200 inline-block" />
                GitHub Profile
              </span>
              {githubUrl && (
                <a
                  href={githubUrl.startsWith("http") ? githubUrl : `https://${githubUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
                >
                  Visit Profile <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </label>
            <input
              type="text"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/username"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:bg-white dark:focus:bg-zinc-800 focus:border-zinc-400 dark:focus:border-zinc-500 transition"
            />
          </div>

          {/* Portfolio URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Portfolio Website
              </span>
              {portfolioUrl && (
                <a
                  href={portfolioUrl.startsWith("http") ? portfolioUrl : `https://${portfolioUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
                >
                  Visit Website <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </label>
            <input
              type="text"
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
              placeholder="https://yourportfolio.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:bg-white dark:focus:bg-zinc-800 focus:border-zinc-400 dark:focus:border-zinc-500 transition"
            />
          </div>
        </div>
      </div>

      {/* Save Button Bar */}
      <div className="flex items-center justify-end pt-2">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 rounded-2xl bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-md hover:shadow-lg active:scale-[0.98] disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{saving ? "Saving Changes..." : "Save Changes"}</span>
        </button>
      </div>
    </form>
  );
}
