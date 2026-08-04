"use client";

import React, { useState } from "react";
import type { Experience, ExperienceFormData } from "@/types/database";
import { addExperience, updateExperience, deleteExperience } from "@/lib/actions/career";
import { Briefcase, Plus, Trash2, Edit2, Calendar, MapPin, Loader2, X, Check } from "lucide-react";

interface ExperienceSectionProps {
  experiences: Experience[];
}

export function ExperienceSection({ experiences }: ExperienceSectionProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Single source of form data state for adding/editing
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
    setEditingId(null);
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
    setIsAdding(true);
  };

  const handleOpenEdit = (exp: Experience) => {
    setIsAdding(false);
    setEditingId(exp.id);
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
  };

  const handleAddBullet = () => {
    if (!bulletInput.trim()) return;
    setFormData((prev) => ({
      ...prev,
      bullet_points: [...prev.bullet_points, bulletInput.trim()],
    }));
    setBulletInput("");
  };

  const handleRemoveBullet = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      bullet_points: prev.bullet_points.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      if (editingId) {
        await updateExperience(editingId, formData);
        setEditingId(null);
      } else {
        await addExperience(formData);
        setIsAdding(false);
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to save experience");
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

  const renderForm = (titleLabel: string, onCancel: () => void) => (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-zinc-200 space-y-4 text-xs">
      <h3 className="text-sm font-bold text-zinc-900 border-b border-zinc-100 pb-2">{titleLabel}</h3>
      {errorMsg && (
        <div className="p-3 rounded-xl bg-red-50 text-red-700 font-medium">{errorMsg}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block font-semibold text-zinc-700 mb-1">Role *</label>
          <input
            type="text"
            required
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            placeholder="Software Engineer"
            className="w-full px-5 py-3 rounded-full bg-zinc-100 text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition placeholder-zinc-500"
          />
        </div>

        <div>
          <label className="block font-semibold text-zinc-700 mb-1">Company *</label>
          <input
            type="text"
            required
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            placeholder="Acme Corp"
            className="w-full px-5 py-3 rounded-full bg-zinc-100 text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition placeholder-zinc-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block font-semibold text-zinc-700 mb-1">Location</label>
          <input
            type="text"
            value={formData.location || ""}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="Remote / New York"
            className="w-full px-5 py-3 rounded-full bg-zinc-100 text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition placeholder-zinc-500"
          />
        </div>

        <div>
          <label className="block font-semibold text-zinc-700 mb-1">Employment Type</label>
          <select
            value={formData.employment_type || "Full-time"}
            onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
            className="w-full px-5 py-3 rounded-full bg-zinc-100 text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition cursor-pointer appearance-none"
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
          <label className="block font-semibold text-zinc-700 mb-1">Start Date *</label>
          <input
            type="date"
            required
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            className="w-full px-5 py-3 rounded-full bg-zinc-100 text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition cursor-pointer"
          />
        </div>

        <div>
          <label className="block font-semibold text-zinc-700 mb-1">End Date</label>
          <input
            type="date"
            disabled={formData.is_current}
            value={formData.end_date || ""}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            className="w-full px-5 py-3 rounded-full bg-zinc-100 text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition cursor-pointer disabled:opacity-50"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 py-1">
        <input
          type="checkbox"
          id="is_current_exp"
          checked={formData.is_current}
          onChange={(e) => setFormData({ ...formData, is_current: e.target.checked })}
          className="rounded border-zinc-300 text-zinc-900 cursor-pointer h-4 w-4"
        />
        <label htmlFor="is_current_exp" className="font-semibold text-zinc-700 cursor-pointer">
          Current position
        </label>
      </div>

      <div>
        <label className="block font-semibold text-zinc-700 mb-1">Description</label>
        <textarea
          rows={3}
          value={formData.description || ""}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Overview of role..."
          className="w-full px-5 py-3 rounded-2xl bg-zinc-100 text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition placeholder-zinc-500 resize-none"
        />
      </div>

      {/* Bullet Points */}
      <div className="space-y-2">
        <label className="block font-semibold text-zinc-700">Key Accomplishments</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={bulletInput}
            onChange={(e) => setBulletInput(e.target.value)}
            placeholder="Reduced latency by 30%..."
            className="flex-1 px-5 py-3 rounded-full bg-zinc-100 text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition placeholder-zinc-500"
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
            className="px-6 py-3 rounded-full bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 cursor-pointer transition"
          >
            Add
          </button>
        </div>

        <div className="space-y-1.5 pt-1">
          {formData.bullet_points.map((pt, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 border border-zinc-100 text-xs">
              <span className="flex-1 mr-2 text-zinc-700">{pt}</span>
              <button
                type="button"
                onClick={() => handleRemoveBullet(index)}
                className="text-zinc-400 hover:text-red-600 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100">
        <button
          type="button"
          onClick={onCancel}
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
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-zinc-700" /> Experience
          </h2>
          <p className="text-xs text-zinc-500">
            Professional roles, key achievements, and responsibilities.
          </p>
        </div>

        {!isAdding && !editingId && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-zinc-900 text-white font-semibold text-xs hover:bg-zinc-800 transition cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" /> Add Experience
          </button>
        )}
      </div>

      {/* List */}
      <div className="space-y-4">
        {experiences.map((exp) => {
          if (editingId === exp.id) {
            return (
              <div key={exp.id} className="pt-2">
                {renderForm("Edit Experience Entry", () => setEditingId(null))}
              </div>
            );
          }

          return (
            <div
              key={exp.id}
              className="bg-white rounded-2xl p-6 border border-zinc-100 space-y-3 hover:border-zinc-200 transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-zinc-900">{exp.role}</h3>
                    <span className="text-[10px] text-zinc-400 font-semibold">• {exp.employment_type}</span>
                  </div>
                  <p className="text-xs font-semibold text-zinc-700 mt-0.5">{exp.company}</p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(exp)}
                    className="p-1 rounded text-zinc-400 hover:text-zinc-900 transition cursor-pointer"
                    title="Edit"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(exp.id)}
                    className="p-1 rounded text-zinc-400 hover:text-red-600 transition cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-xs text-zinc-500">
                {(exp.start_date || exp.end_date || exp.is_current) && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                    <span>
                      {exp.start_date} - {exp.is_current ? "Present" : exp.end_date || "N/A"}
                    </span>
                  </div>
                )}
                {exp.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                    <span>{exp.location}</span>
                  </div>
                )}
              </div>

              {exp.description && (
                <p className="text-xs text-zinc-600 leading-relaxed">{exp.description}</p>
              )}

              {exp.bullet_points && exp.bullet_points.length > 0 && (
                <ul className="list-disc list-inside space-y-1 text-xs text-zinc-600 pl-2">
                  {exp.bullet_points.map((pt, idx) => (
                    <li key={idx} className="leading-relaxed">{pt}</li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}

        {experiences.length === 0 && !isAdding && (
          <div className="p-8 rounded-2xl bg-white border border-zinc-100 text-center">
            <p className="text-xs text-zinc-500 font-medium">No work experiences added yet.</p>
          </div>
        )}

        {isAdding && (
          <div className="pt-2 border-t border-zinc-100 mt-4">
            {renderForm("Add New Experience", () => setIsAdding(false))}
          </div>
        )}
      </div>
    </div>
  );
}
