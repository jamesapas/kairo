"use client";

import React, { useState } from "react";
import type { Profile, ProfileFormData } from "@/types/database";
import { updateProfile } from "@/lib/actions/career";
import { User, Mail, Phone, MapPin, Globe, Save, Loader2, CheckCircle2 } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/ui/icons";

interface ProfileSectionProps {
  profile: Profile | null;
}

export function ProfileSection({ profile }: ProfileSectionProps) {
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: profile?.full_name || "",
    headline: profile?.headline || "",
    summary: profile?.summary || "",
    email: profile?.email || "",
    phone: profile?.phone || "",
    location: profile?.location || "",
    website_url: profile?.website_url || "",
    github_url: profile?.github_url || "",
    linkedin_url: profile?.linkedin_url || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      await updateProfile(formData);
      setSuccessMsg("Profile saved successfully.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update profile";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
          <User className="h-5 w-5 text-zinc-700" /> Profile Details
        </h2>
        <p className="text-xs text-zinc-500">
          Personal details, contact information, and professional profiles.
        </p>
      </div>

      {successMsg && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2 font-medium">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Personal Details */}
        <div className="bg-white rounded-lg p-6 border border-zinc-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-zinc-900 border-b border-zinc-100 pb-3">
            Basic Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Alex Morgan"
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 bg-white text-zinc-900 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Headline
              </label>
              <input
                type="text"
                value={formData.headline || ""}
                onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                placeholder="Software Engineer"
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 bg-white text-zinc-900 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Summary / Bio
            </label>
            <textarea
              rows={4}
              value={formData.summary || ""}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              placeholder="Brief overview of background and goals..."
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 bg-white text-zinc-900 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-900"
            />
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-lg p-6 border border-zinc-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-zinc-900 border-b border-zinc-100 pb-3">
            Contact Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-zinc-400" /> Email
              </label>
              <input
                type="email"
                value={formData.email || ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="alex@example.com"
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 bg-white text-zinc-900 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-zinc-400" /> Phone Number
              </label>
              <input
                type="text"
                value={formData.phone || ""}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 555-0100"
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 bg-white text-zinc-900 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-zinc-400" /> Location
              </label>
              <input
                type="text"
                value={formData.location || ""}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="San Francisco, CA"
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 bg-white text-zinc-900 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-900"
              />
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="bg-white rounded-lg p-6 border border-zinc-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-zinc-900 border-b border-zinc-100 pb-3">
            Links & Profiles
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1 flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-zinc-400" /> Website
              </label>
              <input
                type="url"
                value={formData.website_url || ""}
                onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                placeholder="https://alex.dev"
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 bg-white text-zinc-900 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1 flex items-center gap-1.5">
                <GithubIcon className="h-3.5 w-3.5 text-zinc-400" /> GitHub URL
              </label>
              <input
                type="url"
                value={formData.github_url || ""}
                onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                placeholder="https://github.com/alex"
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 bg-white text-zinc-900 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1 flex items-center gap-1.5">
                <LinkedinIcon className="h-3.5 w-3.5 text-zinc-400" /> LinkedIn URL
              </label>
              <input
                type="url"
                value={formData.linkedin_url || ""}
                onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                placeholder="https://linkedin.com/in/alex"
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 bg-white text-zinc-900 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-900"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 text-white font-semibold text-xs shadow-sm hover:bg-zinc-800 disabled:opacity-50 transition"
          >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Save Profile
          </button>
        </div>
      </form>
    </div>
  );
}
