"use client";

import React, { useState } from "react";
import type { Skill, SkillFormData } from "@/types/database";
import { addSkill, deleteSkill, updateSkill } from "@/lib/actions/career";
import { Wrench, Plus, Trash2, Edit2, Loader2, X, Tag } from "lucide-react";

interface SkillsSectionProps {
  skills: Skill[];
}

const PROFICIENCY_COLORS = {
  Beginner: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  Intermediate: "bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300",
  Advanced: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300",
  Expert: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300",
};

export function SkillsSection({ skills }: SkillsSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const [formData, setFormData] = useState<SkillFormData>({
    name: "",
    category: "Languages & Frameworks",
    proficiency_level: "Intermediate",
    years_of_experience: null,
    display_order: 0,
  });

  // Extract unique categories
  const categories = ["All", ...Array.from(new Set(skills.map((s) => s.category || "General")))];

  const filteredSkills =
    activeCategory === "All"
      ? skills
      : skills.filter((s) => (s.category || "General") === activeCategory);

  const handleOpenAdd = () => {
    setEditingSkill(null);
    setFormData({
      name: "",
      category: activeCategory !== "All" ? activeCategory : "Languages & Frameworks",
      proficiency_level: "Intermediate",
      years_of_experience: null,
      display_order: skills.length,
    });
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (skill: Skill) => {
    setEditingSkill(skill);
    setFormData({
      name: skill.name,
      category: skill.category || "General",
      proficiency_level: skill.proficiency_level || "Intermediate",
      years_of_experience: skill.years_of_experience,
      display_order: skill.display_order,
    });
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      if (editingSkill) {
        await updateSkill(editingSkill.id, formData);
      } else {
        await addSkill(formData);
      }
      setIsModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save skill";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this skill?")) return;
    try {
      await deleteSkill(id);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete skill");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Wrench className="h-6 w-6 text-indigo-600" /> Skills Inventory
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Categorized skills, technologies, tools, and competencies.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white font-medium text-sm shadow-md hover:bg-indigo-700 transition"
        >
          <Plus className="h-4 w-4" /> Add Skill
        </button>
      </div>

      {/* Category Filter Tabs */}
      {categories.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                activeCategory === cat
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Skills Grid */}
      {filteredSkills.length === 0 ? (
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <Wrench className="h-10 w-10 text-slate-300 mx-auto" />
          <p className="text-sm text-slate-500">No skills added in this category yet.</p>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold hover:bg-slate-200 transition"
          >
            + Add First Skill
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {filteredSkills.map((sk) => (
            <div
              key={sk.id}
              className="group bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between hover:border-indigo-300 transition"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                    {sk.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <span
                    className={`px-2 py-0.5 rounded-full font-medium ${
                      PROFICIENCY_COLORS[sk.proficiency_level || "Intermediate"]
                    }`}
                  >
                    {sk.proficiency_level}
                  </span>
                  {sk.years_of_experience && (
                    <span className="text-slate-400 font-medium">
                      {sk.years_of_experience} yrs
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleOpenEdit(sk)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
                  title="Edit"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(sk.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
                  title="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {editingSkill ? "Edit Skill" : "Add Skill"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-medium">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Skill / Technology Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. TypeScript, React, PostgreSQL"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <Tag className="h-3.5 w-3.5" /> Category
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g. Frontend, Backend, AI & ML, DevOps"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Proficiency Level
                  </label>
                  <select
                    value={formData.proficiency_level}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        proficiency_level: e.target.value as SkillFormData["proficiency_level"],
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Years of Exp.
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="50"
                    value={formData.years_of_experience ?? ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        years_of_experience: e.target.value ? parseFloat(e.target.value) : null,
                      })
                    }
                    placeholder="e.g. 3.5"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 text-white font-medium text-xs hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Save Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
