"use client";

import React, { useState } from "react";
import type { Project, ProjectFormData } from "@/types/database";
import { addProject, updateProject, deleteProject } from "@/lib/actions/career";
import { FolderGit2, Plus, Trash2, Edit2, ExternalLink, Star, Loader2, X } from "lucide-react";
import { GithubIcon } from "@/components/ui/icons";

interface ProjectsSectionProps {
  projects: Project[];
}

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
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
    setEditingProject(null);
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
    setIsModalOpen(true);
  };

  const handleOpenEdit = (proj: Project) => {
    setEditingProject(proj);
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
    setIsModalOpen(true);
  };

  const handleAddTech = () => {
    if (!techInput.trim()) return;
    setFormData({
      ...formData,
      technologies: [...formData.technologies, techInput.trim()],
    });
    setTechInput("");
  };

  const handleRemoveTech = (index: number) => {
    setFormData({
      ...formData,
      technologies: formData.technologies.filter((_, i) => i !== index),
    });
  };

  const handleAddHighlight = () => {
    if (!highlightInput.trim()) return;
    setFormData({
      ...formData,
      highlights: [...formData.highlights, highlightInput.trim()],
    });
    setHighlightInput("");
  };

  const handleRemoveHighlight = (index: number) => {
    setFormData({
      ...formData,
      highlights: formData.highlights.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      if (editingProject) {
        await updateProject(editingProject.id, formData);
      } else {
        await addProject(formData);
      }
      setIsModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save project";
      setErrorMsg(msg);
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

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
            <FolderGit2 className="h-5 w-5 text-zinc-700" /> Projects Portfolio
          </h2>
          <p className="text-xs text-zinc-500">
            Showcase key projects, technical accomplishments, and repositories.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 text-white font-semibold text-xs shadow-sm hover:bg-zinc-800 transition"
        >
          <Plus className="h-3.5 w-3.5" /> Add Project
        </button>
      </div>

      {/* Grid */}
      {projects.length === 0 ? (
        <div className="p-8 rounded-lg bg-white border border-zinc-200 text-center space-y-2">
          <p className="text-xs text-zinc-500">No projects added yet.</p>
          <button
            onClick={handleOpenAdd}
            className="px-3 py-1.5 rounded-lg bg-zinc-100 text-zinc-800 text-xs font-semibold hover:bg-zinc-200 transition"
          >
            Add Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="bg-white rounded-lg p-5 border border-zinc-200 shadow-sm flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-zinc-900">
                        {proj.title}
                      </h3>
                      {proj.is_featured && (
                        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-700 text-[10px] font-semibold">
                          <Star className="h-3 w-3 fill-zinc-400 text-zinc-400" /> Featured
                        </span>
                      )}
                    </div>
                    {proj.subtitle && (
                      <p className="text-xs text-zinc-500">{proj.subtitle}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(proj)}
                      className="p-1 rounded text-zinc-400 hover:text-zinc-900"
                      title="Edit"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(proj.id)}
                      className="p-1 rounded text-zinc-400 hover:text-red-600"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {proj.description && (
                  <p className="text-xs text-zinc-600 leading-relaxed line-clamp-3">
                    {proj.description}
                  </p>
                )}

                {/* Tech tags */}
                {proj.technologies && proj.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {proj.technologies.map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 text-[10px] font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Links */}
              <div className="flex items-center gap-3 pt-2 border-t border-zinc-100 text-xs">
                {proj.project_url && (
                  <a
                    href={proj.project_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-zinc-900 font-medium hover:underline"
                  >
                    <ExternalLink className="h-3.5 w-3.5 text-zinc-500" /> Live Demo
                  </a>
                )}
                {proj.github_url && (
                  <a
                    href={proj.github_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-zinc-600 font-medium hover:underline"
                  >
                    <GithubIcon className="h-3.5 w-3.5 text-zinc-500" /> Code Repo
                  </a>
                )}
              </div>
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
                {editingProject ? "Edit Project" : "Add Project"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-3 overflow-y-auto flex-1 text-xs">
              {errorMsg && (
                <div className="p-2.5 rounded bg-red-50 text-red-700 font-medium">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Project Title"
                    className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 bg-white text-zinc-900 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    value={formData.subtitle || ""}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="Short description"
                    className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 bg-white text-zinc-900 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed overview..."
                  className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 bg-white text-zinc-900 text-xs"
                />
              </div>

              {/* Technologies Tag Input */}
              <div className="space-y-1.5">
                <label className="block font-semibold text-zinc-700">
                  Tech Stack
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    placeholder="Next.js"
                    className="flex-1 px-3 py-1.5 rounded-lg border border-zinc-200 bg-white text-zinc-900 text-xs"
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
                    className="px-3 py-1.5 rounded-lg bg-zinc-900 text-white text-xs font-medium hover:bg-zinc-800"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1 pt-1">
                  {formData.technologies.map((tech, index) => (
                    <span
                      key={index}
                      className="flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 text-xs"
                    >
                      {tech}
                      <button
                        type="button"
                        onClick={() => handleRemoveTech(index)}
                        className="hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Key Highlights */}
              <div className="space-y-1.5">
                <label className="block font-semibold text-zinc-700">
                  Highlights
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={highlightInput}
                    onChange={(e) => setHighlightInput(e.target.value)}
                    placeholder="Achieved 99.9% uptime..."
                    className="flex-1 px-3 py-1.5 rounded-lg border border-zinc-200 bg-white text-zinc-900 text-xs"
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
                    className="px-3 py-1.5 rounded-lg bg-zinc-900 text-white text-xs font-medium hover:bg-zinc-800"
                  >
                    Add
                  </button>
                </div>

                <div className="space-y-1 pt-1">
                  {formData.highlights.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 rounded bg-zinc-50 border border-zinc-200 text-xs"
                    >
                      <span className="flex-1 mr-2 text-zinc-700">{item}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveHighlight(index)}
                        className="text-zinc-400 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Links */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    Live Demo URL
                  </label>
                  <input
                    type="url"
                    value={formData.project_url || ""}
                    onChange={(e) => setFormData({ ...formData, project_url: e.target.value })}
                    placeholder="https://myproject.com"
                    className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 bg-white text-zinc-900 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    GitHub URL
                  </label>
                  <input
                    type="url"
                    value={formData.github_url || ""}
                    onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                    placeholder="https://github.com/user/repo"
                    className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 bg-white text-zinc-900 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="is_featured"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="rounded border-zinc-300 text-zinc-900"
                />
                <label htmlFor="is_featured" className="font-medium text-zinc-700">
                  Feature this project on overview
                </label>
              </div>

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
