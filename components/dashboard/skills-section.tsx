"use client";

import React, { useState } from "react";
import type { Skill } from "@/types/database";
import { addSkill, deleteSkill } from "@/lib/actions/career";
import { Wrench, Plus, X, Loader2 } from "lucide-react";

interface SkillsSectionProps {
  skills: Skill[];
}

export function SkillsSection({ skills }: SkillsSectionProps) {
  const [newSkillName, setNewSkillName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const devSuggestions = [
    "TypeScript", "React", "Next.js", "Node.js", "Tailwind CSS",
    "PostgreSQL", "Git", "Docker", "Python", "AWS"
  ];

  // Filter suggestion chips to show only the ones the user doesn't already have
  const availableSuggestions = devSuggestions.filter(
    (sug) => !skills.some((sk) => sk.name.toLowerCase() === sug.toLowerCase())
  );

  const handleAddSkill = async (name: string) => {
    if (!name.trim()) return;
    setLoading(true);
    setErrorMsg("");
    try {
      await addSkill({
        name: name.trim(),
        category: "General",
        proficiency_level: "Intermediate",
        years_of_experience: null,
        display_order: skills.length,
      });
      setNewSkillName("");
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to add skill");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSkill(id);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete skill");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
          <Wrench className="h-5 w-5 text-zinc-700" /> Skills
        </h2>
        <p className="text-xs text-zinc-500">
          Manage your professional skills and technical capabilities.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-medium">
          {errorMsg}
        </div>
      )}

      {/* Skills Tags List */}
      <div className="flex flex-wrap gap-2">
        {skills.map((sk) => (
          <span
            key={sk.id}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-zinc-100 text-zinc-800 text-xs font-semibold"
          >
            {sk.name}
            <button
              onClick={() => handleDelete(sk.id)}
              className="text-zinc-400 hover:text-red-600 transition cursor-pointer"
              title="Delete skill"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}
        {skills.length === 0 && (
          <p className="text-xs text-zinc-400 font-medium py-1">No skills listed yet.</p>
        )}
      </div>

      {/* Suggestion Chips */}
      {availableSuggestions.length > 0 && (
        <div className="space-y-2 pt-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Suggestions</p>
          <div className="flex flex-wrap gap-2">
            {availableSuggestions.map((sug) => (
              <button
                key={sug}
                onClick={() => handleAddSkill(sug)}
                disabled={loading}
                className="px-3.5 py-1.5 rounded-full border border-zinc-200 hover:border-zinc-300 text-zinc-700 text-xs font-semibold cursor-pointer transition disabled:opacity-50"
              >
                + {sug}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Inline Input Field */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAddSkill(newSkillName);
        }}
        className="flex flex-col sm:flex-row gap-3 pt-2 max-w-xl"
      >
        <input
          type="text"
          value={newSkillName}
          onChange={(e) => setNewSkillName(e.target.value)}
          placeholder="Type a skill and press Enter (e.g. Docker)..."
          className="flex-1 py-3 px-5 rounded-full bg-zinc-100 text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition placeholder-zinc-500"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !newSkillName.trim()}
          className="flex items-center justify-center gap-2 py-3 px-6 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-semibold disabled:opacity-50 transition cursor-pointer shrink-0"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Add Skill
        </button>
      </form>
    </div>
  );
}
