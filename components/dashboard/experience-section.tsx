"use client";

import React, { useState } from "react";
import type { Experience, ExperienceFormData } from "@/types/database";
import { addExperience, updateExperience, deleteExperience } from "@/lib/actions/career";
import { Briefcase, Plus, Trash2, Edit2, Calendar, MapPin, Loader2, X } from "lucide-react";

interface ExperienceSectionProps {
  experiences: Experience[];
}

export function ExperienceSection({ experiences }: ExperienceSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState<ExperienceFormData>({
    company: "",
    role: "",
    location: "",
    employment_type: "Full-time",
    start_date: "",
    end_date: "",
    is_current: false,
    description: "",
    bullet_points: [],
    display_order: 0,
  });

  const [bulletInput, setBulletInput] = useState("");

  const handleOpenAdd = () => {
    setEditingExperience(null);
    setFormData({
      company: "",
      role: "",
      location: "",
      employment_type: "Full-time",
      start_date: "",
      end_date: "",
      is_current: false,
      description: "",
      bullet_points: [],
      display_order: experiences.length,
    });
    setBulletInput("");
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (exp: Experience) => {
    setEditingExperience(exp);
    setFormData({
      company: exp.company,
      role: exp.role,
      location: exp.location || "",
      employment_type: exp.employment_type || "Full-time",
      start_date: exp.start_date,
      end_date: exp.end_date || "",
      is_current: exp.is_current,
      description: exp.description || "",
      bullet_points: exp.bullet_points || [],
      display_order: exp.display_order,
    });
    setBulletInput("");
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const handleAddBullet = () => {
    if (!bulletInput.trim()) return;
    setFormData({
      ...formData,
      bullet_points: [...formData.bullet_points, bulletInput.trim()],
    });
    setBulletInput("");
  };

  const handleRemoveBullet = (index: number) => {
    setFormData({
      ...formData,
      bullet_points: formData.bullet_points.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      if (editingExperience) {
        await updateExperience(editingExperience.id, formData);
      } else {
        await addExperience(formData);
      }
      setIsModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save experience";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this experience entry?")) return;
    try {
      await deleteExperience(id);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete experience");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-zinc-700" /> Work Experience
          </h2>
          <p className="text-xs text-zinc-500">
            Professional roles, key achievements, and responsibilities.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 text-white font-semibold text-xs shadow-sm hover:bg-zinc-800 transition"
        >
          <Plus className="h-3.5 w-3.5" /> Add Experience
        </button>
      </div>

      {/* List */}
      {experiences.length === 0 ? (
        <div className="p-8 rounded-lg bg-white border border-zinc-200 text-center space-y-2">
          <p className="text-xs text-zinc-500">No work experiences added yet.</p>
          <button
            onClick={handleOpenAdd}
            className="px-3 py-1.5 rounded-lg bg-zinc-100 text-zinc-800 text-xs font-semibold hover:bg-zinc-200 transition"
          >
            Add Experience
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {experiences.map((exp) => (
            <div
              key={exp.id}
              className="bg-white rounded-lg p-5 border border-zinc-200 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-zinc-900">
                      {exp.role}
                    </h3>
                    <span className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 text-[10px] font-semibold">
                      {exp.employment_type || "Full-time"}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-zinc-700">
                    {exp.company}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(exp)}
                    className="p-1 rounded text-zinc-400 hover:text-zinc-900 transition"
                    title="Edit"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(exp.id)}
                    className="p-1 rounded text-zinc-400 hover:text-red-600 transition"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Date & Location */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                  {exp.start_date} - {exp.is_current ? "Present" : exp.end_date || "N/A"}
                </span>
                {exp.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                    {exp.location}
                  </span>
                )}
              </div>

              {exp.description && (
                <p className="text-xs text-zinc-600 leading-relaxed">
                  {exp.description}
                </p>
              )}

              {exp.bullet_points && exp.bullet_points.length > 0 && (
                <ul className="space-y-1 pl-4 text-xs text-zinc-600 list-disc">
                  {exp.bullet_points.map((pt, idx) => (
                    <li key={idx}>{pt}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-lg border border-zinc-200 shadow-lg w-full max-w-xl flex flex-col my-8">
            <div className="flex items-center justify-between p-4 border-b border-zinc-100">
              <h3 className="text-sm font-bold text-zinc-900">
                {editingExperience ? "Edit Experience" : "Add Experience"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto flex-1 text-xs">
              {errorMsg && (
                <div className="p-2.5 rounded bg-red-50 text-red-700 font-medium">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    Role *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="Software Engineer"
                    className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 bg-white text-zinc-900 text-xs focus:ring-1 focus:ring-zinc-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    Company *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Acme Corp"
                    className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 bg-white text-zinc-900 text-xs focus:ring-1 focus:ring-zinc-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location || ""}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Remote / New York"
                    className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 bg-white text-zinc-900 text-xs focus:ring-1 focus:ring-zinc-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    Employment Type
                  </label>
                  <select
                    value={formData.employment_type || "Full-time"}
                    onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 bg-white text-zinc-900 text-xs focus:ring-1 focus:ring-zinc-900"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 bg-white text-zinc-900 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    disabled={formData.is_current}
                    value={formData.end_date || ""}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 bg-white text-zinc-900 text-xs disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_current"
                  checked={formData.is_current}
                  onChange={(e) => setFormData({ ...formData, is_current: e.target.checked })}
                  className="rounded border-zinc-300 text-zinc-900"
                />
                <label htmlFor="is_current" className="font-medium text-zinc-700">
                  Current position
                </label>
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Overview of role..."
                  className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 bg-white text-zinc-900 text-xs"
                />
              </div>

              {/* Bullet Points */}
              <div className="space-y-2">
                <label className="block font-semibold text-zinc-700">
                  Key Accomplishments
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={bulletInput}
                    onChange={(e) => setBulletInput(e.target.value)}
                    placeholder="Reduced latency by 30%..."
                    className="flex-1 px-3 py-1.5 rounded-lg border border-zinc-200 bg-white text-zinc-900 text-xs"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddBullet();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddBullet}
                    className="px-3 py-1.5 rounded-lg bg-zinc-900 text-white text-xs font-medium hover:bg-zinc-800"
                  >
                    Add
                  </button>
                </div>

                <div className="space-y-1 pt-1">
                  {formData.bullet_points.map((pt, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 rounded bg-zinc-50 border border-zinc-200 text-xs"
                    >
                      <span className="flex-1 mr-2 text-zinc-700">{pt}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveBullet(index)}
                        className="text-zinc-400 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-zinc-200 text-zinc-700 font-medium hover:bg-zinc-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-zinc-900 text-white font-medium hover:bg-zinc-800 disabled:opacity-50"
                >
                  {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
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
