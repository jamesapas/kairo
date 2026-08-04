"use client";

import React from "react";
import type { CareerData } from "@/types/database";
import { Sidebar } from "@/components/layout/sidebar";
import { ProfileSection } from "@/components/dashboard/profile-section";
import { ExperienceSection } from "@/components/dashboard/experience-section";
import { EducationSection } from "@/components/dashboard/education-section";
import { SkillsSection } from "@/components/dashboard/skills-section";
import { ProjectsSection } from "@/components/dashboard/projects-section";

interface ProfileViewProps {
  initialData: CareerData;
  userEmail?: string;
}

export function ProfileView({ initialData, userEmail }: ProfileViewProps) {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <Sidebar userEmail={userEmail} />

      <main className="pl-60 min-h-screen flex flex-col">
        <div className="flex-1 p-10 max-w-6xl mx-auto w-full space-y-16">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">My Profile</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Manage your personal information, skills, professional experience, projects, and education.
          </p>
        </div>

        <div className="space-y-16">
          <div id="profile-details">
            <ProfileSection profile={initialData.profile} />
          </div>

          <div id="skills-inventory" className="border-t border-zinc-200/80 pt-12">
            <SkillsSection skills={initialData.skills} />
          </div>

          <div id="work-experience" className="border-t border-zinc-200/80 pt-12">
            <ExperienceSection experiences={initialData.experiences} />
          </div>

          <div id="projects" className="border-t border-zinc-200/80 pt-12">
            <ProjectsSection projects={initialData.projects} />
          </div>

          <div id="education" className="border-t border-zinc-200/80 pt-12">
            <EducationSection educations={initialData.educations} />
          </div>
        </div>
        </div>
      </main>
    </div>
  );
}
