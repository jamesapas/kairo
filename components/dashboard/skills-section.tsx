"use client";

import React, { useState } from "react";
import type { Skill, SkillFormData } from "@/types/database";
import { addSkill, deleteSkill, updateSkill } from "@/lib/actions/career";
import { Wrench, Plus, Trash2, Edit2, Loader2, X } from "lucide-react";

interface SkillsSectionProps {
  skills: Skill[];
}

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
    if (!confirm("Delete this skill?")) return;
    try {
      await deleteSkill(id);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete skill");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
            <Wrench className="h-5 w-5 text-zinc-700" /> Skills Inventory
          </h2>
          <p className="text-xs text-zinc-500">
            Categorized skills, technologies, and competencies.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-zinc-900 text-white font-semibold text-xs hover:bg-zinc-800 transition cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" /> Add Skill
        </button>
      </div>

      {/* Category Tabs */}
      {categories.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-zinc-100">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                activeCategory === cat
                  ? "bg-zinc-900 text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Skills Grid */}
      {filteredSkills.length === 0 ? (
        <div className="p-8 rounded-2xl bg-white border border-zinc-100 text-center space-y-2">
          <p className="text-xs text-zinc-500">No skills listed yet.</p>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-full bg-zinc-100 text-zinc-800 text-xs font-semibold hover:bg-zinc-200 transition cursor-pointer"
          >
            Add Skill
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {filteredSkills.map((sk) => (
            <div
              key={sk.id}
              className="group bg-white rounded-2xl p-4 border border-zinc-100 flex items-center justify-between transition hover:border-zinc-200"
            >
              <div className="space-y-0.5">
                <span className="font-semibold text-xs text-zinc-900">
                  {sk.name}
                </span>
                <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                  <span>{sk.proficiency_level}</span>
                  {sk.years_of_experience && (
                    <span>• {sk.years_of_experience} yrs</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleOpenEdit(sk)}
                  className="p-1 rounded text-zinc-400 hover:text-zinc-900 cursor-pointer"
                  title="Edit"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(sk.id)}
                  className="p-1 rounded text-zinc-400 hover:text-red-600 cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-xl w-full max-w-sm flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-zinc-100">
              <h3 className="text-sm font-bold text-zinc-900">
                {editingSkill ? "Edit Skill" : "Add Skill"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 p-1 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 text-red-700 font-medium">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">
                  Skill Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="TypeScript"
                  className="w-full px-5 py-3 rounded-full bg-zinc-100 text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition placeholder-zinc-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Frontend / Backend"
                  className="w-full px-5 py-3 rounded-full bg-zinc-100 text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition placeholder-zinc-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    Proficiency
                  </label>
                  <select
                    value={formData.proficiency_level}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        proficiency_level: e.target.value as SkillFormData["proficiency_level"],
                      })
                    }
                    className="w-full px-5 py-3 rounded-full bg-zinc-100 text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition cursor-pointer appearance-none"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    Years Exp.
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
                    placeholder="3"
                    className="w-full px-5 py-3 rounded-full bg-zinc-100 text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition placeholder-zinc-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold cursor-pointer transition text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center gap-2 py-3 px-6 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-semibold disabled:opacity-50 transition cursor-pointer"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
