"use client";

import React, { useState } from "react";
import type { CareerData } from "@/types/database";
import { Sidebar, SectionType } from "@/components/layout/sidebar";
import { OverviewSection } from "@/components/dashboard/overview-section";
import { ProfileSection } from "@/components/dashboard/profile-section";
import { ExperienceSection } from "@/components/dashboard/experience-section";
import { EducationSection } from "@/components/dashboard/education-section";
import { SkillsSection } from "@/components/dashboard/skills-section";
import { ProjectsSection } from "@/components/dashboard/projects-section";

interface DashboardViewProps {
  initialData: CareerData;
  userEmail?: string;
}

export function DashboardView({ initialData, userEmail }: DashboardViewProps) {
  const [activeSection, setActiveSection] = useState<SectionType>("overview");

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100">
      <Sidebar
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        userEmail={userEmail}
      />

      <main className="flex-1 p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        {activeSection === "overview" && (
          <OverviewSection data={initialData} onNavigate={setActiveSection} />
        )}
        {activeSection === "profile" && <ProfileSection profile={initialData.profile} />}
        {activeSection === "experiences" && (
          <ExperienceSection experiences={initialData.experiences} />
        )}
        {activeSection === "educations" && (
          <EducationSection educations={initialData.educations} />
        )}
        {activeSection === "skills" && <SkillsSection skills={initialData.skills} />}
        {activeSection === "projects" && <ProjectsSection projects={initialData.projects} />}
      </main>
    </div>
  );
}
