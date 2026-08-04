"use client";

import React, { useState } from "react";
import type { Education, EducationFormData } from "@/types/database";
import { addEducation, updateEducation, deleteEducation } from "@/lib/actions/career";
import { GraduationCap, Plus, Trash2, Edit2, Calendar, Loader2 } from "lucide-react";

interface EducationSectionProps {
  educations: Education[];
}

export function EducationSection({ educations }: EducationSectionProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState<EducationFormData>({
    degree: "",
    institution: "",
    field_of_study: "",
    start_date: "",
    end_date: "",
    is_current: false,
    description: "",
    display_order: 0,
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      degree: "",
      institution: "",
      field_of_study: "",
      start_date: "",
      end_date: "",
      is_current: false,
      description: "",
      display_order: educations.length,
    });
    setErrorMsg("");
    setIsAdding(true);
  };

  const handleOpenEdit = (edu: Education) => {
    setIsAdding(false);
    setEditingId(edu.id);
    setFormData({
      degree: edu.degree,
      institution: edu.institution,
      field_of_study: edu.field_of_study || "",
      start_date: edu.start_date || "",
      end_date: edu.end_date || "",
      is_current: edu.is_current,
      description: edu.description || "",
      display_order: edu.display_order,
    });
    setErrorMsg("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      if (editingId) {
        await updateEducation(editingId, formData);
        setEditingId(null);
      } else {
        await addEducation(formData);
        setIsAdding(false);
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to save education record");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this education entry?")) return;
    try {
      await deleteEducation(id);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete education entry");
    }
  };

  const renderForm = (titleLabel: string, onCancel: () => void) => (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-zinc-200 space-y-4 text-xs">
      <h3 className="text-sm font-bold text-zinc-900 border-b border-zinc-100 pb-2">{titleLabel}</h3>
      {errorMsg && (
        <div className="p-3 rounded-xl bg-red-50 text-red-700 font-medium">{errorMsg}</div>
      )}

      <div>
        <label className="block font-semibold text-zinc-700 mb-1">Degree *</label>
        <input
          type="text"
          required
          value={formData.degree}
          onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
          placeholder="Bachelor of Science"
          className="w-full px-5 py-3 rounded-full bg-zinc-100 text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition placeholder-zinc-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block font-semibold text-zinc-700 mb-1">Institution *</label>
          <input
            type="text"
            required
            value={formData.institution}
            onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
            placeholder="University name"
            className="w-full px-5 py-3 rounded-full bg-zinc-100 text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition placeholder-zinc-500"
          />
        </div>

        <div>
          <label className="block font-semibold text-zinc-700 mb-1">Field of Study</label>
          <input
            type="text"
            value={formData.field_of_study || ""}
            onChange={(e) => setFormData({ ...formData, field_of_study: e.target.value })}
            placeholder="Computer Science"
            className="w-full px-5 py-3 rounded-full bg-zinc-100 text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition placeholder-zinc-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block font-semibold text-zinc-700 mb-1">Start Date</label>
          <input
            type="date"
            value={formData.start_date || ""}
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

      <div>
        <label className="block font-semibold text-zinc-700 mb-1">Description</label>
        <textarea
          rows={3}
          value={formData.description || ""}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Highlights or honors..."
          className="w-full px-5 py-3 rounded-2xl bg-zinc-100 text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition placeholder-zinc-500 resize-none"
        />
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
            <GraduationCap className="h-5 w-5 text-zinc-700" /> Education
          </h2>
          <p className="text-xs text-zinc-500">
            Academic records, fields of study, and qualifications.
          </p>
        </div>

        {!isAdding && !editingId && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-zinc-900 text-white font-semibold text-xs hover:bg-zinc-800 transition cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" /> Add Education
          </button>
        )}
      </div>

      {/* List */}
      <div className="space-y-4">
        {educations.map((edu) => {
          if (editingId === edu.id) {
            return (
              <div key={edu.id} className="pt-2">
                {renderForm("Edit Education Entry", () => setEditingId(null))}
              </div>
            );
          }

          return (
            <div
              key={edu.id}
              className="bg-white rounded-2xl p-6 border border-zinc-100 space-y-3 hover:border-zinc-200 transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">{edu.degree}</h3>
                  <p className="text-xs font-semibold text-zinc-700 mt-0.5">
                    {edu.institution} {edu.field_of_study && `• ${edu.field_of_study}`}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(edu)}
                    className="p-1 rounded text-zinc-400 hover:text-zinc-900 cursor-pointer"
                    title="Edit"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(edu.id)}
                    className="p-1 rounded text-zinc-400 hover:text-red-600 cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {(edu.start_date || edu.end_date || edu.is_current) && (
                <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                  <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                  <span>
                    {edu.start_date || "N/A"} - {edu.is_current ? "Present" : edu.end_date || "N/A"}
                  </span>
                </div>
              )}

              {edu.description && (
                <p className="text-xs text-zinc-600 leading-relaxed">{edu.description}</p>
              )}
            </div>
          );
        })}

        {educations.length === 0 && !isAdding && (
          <div className="p-8 rounded-2xl bg-white border border-zinc-100 text-center">
            <p className="text-xs text-zinc-500 font-medium">No education entries added yet.</p>
          </div>
        )}

        {isAdding && (
          <div className="pt-2 border-t border-zinc-100 mt-4">
            {renderForm("Add New Education Record", () => setIsAdding(false))}
          </div>
        )}
      </div>
    </div>
  );
}
