"use client";

import React, { useState } from "react";
import type { Project, ProjectFormData } from "@/types/database";
import { addProject, updateProject, deleteProject } from "@/lib/actions/career";
import { FolderGit2, Plus, Trash2, Edit2, Star, Link as LinkIcon, Loader2, X, Check } from "lucide-react";

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

interface ProjectsSectionProps {
  projects: Project[];
}

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState<ProjectFormData>({
    title: "",
    subtitle: "",
    description: "",
    highlights: [],
    technologies: [],
    project_url: "",
    github_url: "",
    is_featured: false,
    display_order: 0,
  });

  const [techInput, setTechInput] = useState("");
  const [highlightInput, setHighlightInput] = useState("");

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      title: "",
      subtitle: "",
      description: "",
      highlights: [],
      technologies: [],
      project_url: "",
      github_url: "",
      is_featured: false,
      display_order: projects.length,
    });
    setTechInput("");
    setHighlightInput("");
    setErrorMsg("");
    setIsAdding(true);
  };

  const handleOpenEdit = (proj: Project) => {
    setIsAdding(false);
    setEditingId(proj.id);
    setFormData({
      title: proj.title,
      subtitle: proj.subtitle || "",
      description: proj.description || "",
      highlights: proj.highlights || [],
      technologies: proj.technologies || [],
      project_url: proj.project_url || "",
      github_url: proj.github_url || "",
      is_featured: proj.is_featured,
      display_order: proj.display_order,
    });
    setTechInput("");
    setHighlightInput("");
    setErrorMsg("");
  };

  const handleAddTech = () => {
    if (!techInput.trim()) return;
    if (formData.technologies.includes(techInput.trim())) return;
    setFormData((prev) => ({
      ...prev,
      technologies: [...prev.technologies, techInput.trim()],
    }));
    setTechInput("");
  };

  const handleRemoveTech = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      technologies: prev.technologies.filter((_, i) => i !== index),
    }));
  };

  const handleAddHighlight = () => {
    if (!highlightInput.trim()) return;
    setFormData((prev) => ({
      ...prev,
      highlights: [...prev.highlights, highlightInput.trim()],
    }));
    setHighlightInput("");
  };

  const handleRemoveHighlight = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      if (editingId) {
        await updateProject(editingId, formData);
        setEditingId(null);
      } else {
        await addProject(formData);
        setIsAdding(false);
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to save project");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this project?")) return;
    try {
      await deleteProject(id);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete project");
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
          <label className="block font-semibold text-zinc-700 mb-1">Title *</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Project Title"
            className="w-full px-5 py-3 rounded-full bg-zinc-100 text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition placeholder-zinc-500"
          />
        </div>

        <div>
          <label className="block font-semibold text-zinc-700 mb-1">Subtitle</label>
          <input
            type="text"
            value={formData.subtitle || ""}
            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
            placeholder="Short description"
            className="w-full px-5 py-3 rounded-full bg-zinc-100 text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition placeholder-zinc-500"
          />
        </div>
      </div>

      <div>
        <label className="block font-semibold text-zinc-700 mb-1">Description</label>
        <textarea
          rows={3}
          value={formData.description || ""}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Detailed overview..."
          className="w-full px-5 py-3 rounded-2xl bg-zinc-100 text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition placeholder-zinc-500 resize-none"
        />
      </div>

      {/* Tech Stack Tag Input */}
      <div className="space-y-1.5">
        <label className="block font-semibold text-zinc-700">Tech Stack</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={techInput}
            onChange={(e) => setTechInput(e.target.value)}
            placeholder="Next.js"
            className="flex-1 px-5 py-3 rounded-full bg-zinc-100 text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition placeholder-zinc-500"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddTech();
              }
            }}
          />
          <button
            type="button"
            onClick={handleAddTech}
            className="px-6 py-3 rounded-full bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 cursor-pointer transition"
          >
            Add
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {formData.technologies.map((tech, index) => (
            <span key={index} className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 text-xs font-medium">
              {tech}
              <button
                type="button"
                onClick={() => handleRemoveTech(index)}
                className="hover:text-red-600 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Highlights */}
      <div className="space-y-1.5">
        <label className="block font-semibold text-zinc-700">Highlights</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={highlightInput}
            onChange={(e) => setHighlightInput(e.target.value)}
            placeholder="Achieved 99.9% uptime..."
            className="flex-1 px-5 py-3 rounded-full bg-zinc-100 text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition placeholder-zinc-500"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddHighlight();
              }
            }}
          />
          <button
            type="button"
            onClick={handleAddHighlight}
            className="px-6 py-3 rounded-full bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 cursor-pointer transition"
          >
            Add
          </button>
        </div>

        <div className="space-y-1.5 pt-1">
          {formData.highlights.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 border border-zinc-100 text-xs">
              <span className="flex-1 mr-2 text-zinc-700">{item}</span>
              <button
                type="button"
                onClick={() => handleRemoveHighlight(index)}
                className="text-zinc-400 hover:text-red-600 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block font-semibold text-zinc-700 mb-1">Live Demo URL</label>
          <input
            type="url"
            value={formData.project_url || ""}
            onChange={(e) => setFormData({ ...formData, project_url: e.target.value })}
            placeholder="https://myproject.com"
            className="w-full px-5 py-3 rounded-full bg-zinc-100 text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition placeholder-zinc-500"
          />
        </div>

        <div>
          <label className="block font-semibold text-zinc-700 mb-1">GitHub URL</label>
          <input
            type="url"
            value={formData.github_url || ""}
            onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
            placeholder="https://github.com/user/repo"
            className="w-full px-5 py-3 rounded-full bg-zinc-100 text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition placeholder-zinc-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <input
          type="checkbox"
          id="is_featured_proj"
          checked={formData.is_featured}
          onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
          className="rounded border-zinc-300 text-zinc-900 cursor-pointer h-4 w-4"
        />
        <label htmlFor="is_featured_proj" className="font-semibold text-zinc-700 cursor-pointer">
          Feature this project
        </label>
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
            <FolderGit2 className="h-5 w-5 text-zinc-700" /> Projects
          </h2>
          <p className="text-xs text-zinc-500">
            Showcase key projects, technical accomplishments, and repositories.
          </p>
        </div>

        {!isAdding && !editingId && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-zinc-900 text-white font-semibold text-xs hover:bg-zinc-800 transition cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" /> Add Project
          </button>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((proj) => {
          if (editingId === proj.id) {
            return (
              <div key={proj.id} className="md:col-span-2 pt-2">
                {renderForm("Edit Project Details", () => setEditingId(null))}
              </div>
            );
          }

          return (
            <div
              key={proj.id}
              className="bg-white rounded-2xl p-6 border border-zinc-100 flex flex-col justify-between space-y-4 hover:border-zinc-200 transition"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-zinc-900">{proj.title}</h3>
                      {proj.is_featured && (
                        <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 text-[10px] font-semibold">
                          Featured
                        </span>
                      )}
                    </div>
                    {proj.subtitle && <p className="text-xs text-zinc-500">{proj.subtitle}</p>}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(proj)}
                      className="p-1 rounded text-zinc-400 hover:text-zinc-900 cursor-pointer"
                      title="Edit"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(proj.id)}
                      className="p-1 rounded text-zinc-400 hover:text-red-600 cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {proj.description && (
                  <p className="text-xs text-zinc-600 leading-relaxed">{proj.description}</p>
                )}

                {/* Highlights list */}
                {proj.highlights && proj.highlights.length > 0 && (
                  <ul className="list-disc list-inside space-y-0.5 text-xs text-zinc-500 pl-1">
                    {proj.highlights.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                )}

                {/* Tech tags */}
                {proj.technologies && proj.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1.5">
                    {proj.technologies.map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-600 text-[10px] font-semibold"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Links */}
              {(proj.project_url || proj.github_url) && (
                <div className="flex items-center gap-3 pt-3 border-t border-zinc-50">
                  {proj.project_url && (
                    <a
                      href={proj.project_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-800 hover:text-zinc-600"
                    >
                      <LinkIcon className="h-3 w-3" /> Live Demo
                    </a>
                  )}
                  {proj.github_url && (
                    <a
                      href={proj.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-800 hover:text-zinc-600"
                    >
                      <GithubIcon className="h-3 w-3" /> GitHub
                    </a>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {projects.length === 0 && !isAdding && (
          <div className="md:col-span-2 p-8 rounded-2xl bg-white border border-zinc-100 text-center">
            <p className="text-xs text-zinc-500 font-medium">No projects added yet.</p>
          </div>
        )}

        {isAdding && (
          <div className="md:col-span-2 pt-2 border-t border-zinc-100 mt-4">
            {renderForm("Add New Project", () => setIsAdding(false))}
          </div>
        )}
      </div>
    </div>
  );
}
