"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, Loader2, UserCheck } from "lucide-react";
import { getProfileAction, updateProfileAction } from "@/lib/actions/profile";
import { getExperiencesAction } from "@/lib/actions/experience";
import { getEducationsAction } from "@/lib/actions/education";
import { getProjectsAction } from "@/lib/actions/project";
import { getSkillsAction } from "@/lib/actions/skill";
import { ProfileLink } from "@/types/profile";
import { UserExperience } from "@/types/experience";
import { UserEducation } from "@/types/education";
import { UserProject } from "@/types/project";
import { UserSkill } from "@/types/skill";
import { ResumeCanvasView } from "./resume-canvas-view";

export function SettingsView() {
  // Independent section loading states
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingExp, setLoadingExp] = useState(true);
  const [loadingEdu, setLoadingEdu] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingSkills, setLoadingSkills] = useState(true);

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [careerSummary, setCareerSummary] = useState("");
  const [links, setLinks] = useState<ProfileLink[]>([]);
  const [experiences, setExperiences] = useState<UserExperience[]>([]);
  const [educations, setEducations] = useState<UserEducation[]>([]);
  const [projects, setProjects] = useState<UserProject[]>([]);
  const [skills, setSkills] = useState<UserSkill[]>([]);
  const [totalSkills, setTotalSkills] = useState<number>(0);
  const [skillsPage, setSkillsPage] = useState<number>(1);
  const [hasMoreSkills, setHasMoreSkills] = useState<boolean>(false);
  const [loadingMoreSkills, setLoadingMoreSkills] = useState<boolean>(false);

  const [savedSnapshot, setSavedSnapshot] = useState<string>("");

  useEffect(() => {
    // 1. Fetch Profile independently
    getProfileAction().then((profRes) => {
      if (profRes.success && profRes.data) {
        const initName = profRes.data.name || "";
        const initEmail = profRes.data.email || "";
        const initLocation = profRes.data.location || "";
        const initAvatarUrl = profRes.data.avatarUrl || "";
        const initCareerSummary = profRes.data.careerSummary || "";
        const initLinks = profRes.data.links || [];

        setName(initName);
        setEmail(initEmail);
        setLocation(initLocation);
        setAvatarUrl(initAvatarUrl);
        setCareerSummary(initCareerSummary);
        setLinks(initLinks);

        setSavedSnapshot(
          JSON.stringify({
            name: initName,
            location: initLocation,
            avatarUrl: initAvatarUrl,
            careerSummary: initCareerSummary,
            links: initLinks,
          })
        );
      } else if (profRes.error) {
        setErrorMsg(profRes.error || "Failed to load profile details");
      }
      setLoadingProfile(false);
    });

    // 2. Fetch Experience independently
    getExperiencesAction().then((expRes) => {
      if (expRes.success && expRes.data) {
        setExperiences(expRes.data);
      }
      setLoadingExp(false);
    });

    // 3. Fetch Education independently
    getEducationsAction().then((eduRes) => {
      if (eduRes.success && eduRes.data) {
        setEducations(eduRes.data);
      }
      setLoadingEdu(false);
    });

    // 4. Fetch Projects independently
    getProjectsAction().then((projRes) => {
      if (projRes.success && projRes.data) {
        setProjects(projRes.data);
      }
      setLoadingProjects(false);
    });

    // 5. Fetch Skills independently (initial batch for faster fetching)
    getSkillsAction(1, 20).then((skillRes) => {
      if (skillRes.success && skillRes.data) {
        setSkills(skillRes.data);
        setTotalSkills(skillRes.total ?? skillRes.data.length);
        setHasMoreSkills(skillRes.hasMore ?? false);
      }
      setLoadingSkills(false);
    });
  }, []);

  const handleLoadMoreSkills = async () => {
    if (loadingMoreSkills || !hasMoreSkills) return;
    setLoadingMoreSkills(true);
    const nextPage = skillsPage + 1;
    const skillRes = await getSkillsAction(nextPage, 20);
    if (skillRes.success && skillRes.data) {
      setSkills((prev) => [...prev, ...(skillRes.data || [])]);
      setSkillsPage(nextPage);
      setHasMoreSkills(skillRes.hasMore ?? false);
      if (skillRes.total !== undefined) {
        setTotalSkills(skillRes.total);
      }
    }
    setLoadingMoreSkills(false);
  };

  // Check if current details differ from last saved state
  const isDirty =
    !loadingProfile &&
    savedSnapshot !== "" &&
    savedSnapshot !== JSON.stringify({ name, location, avatarUrl, careerSummary, links });

  // Native browser prompt when refreshing or closing tab with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    const res = await updateProfileAction({
      name,
      location,
      avatarUrl,
      careerSummary,
      links,
    });

    setSaving(false);

    if (!res.success) {
      setErrorMsg(res.error || "Failed to save profile changes");
      return;
    }

    // Update baseline saved snapshot
    setSavedSnapshot(JSON.stringify({ name, location, avatarUrl, careerSummary, links }));
    setSuccessMsg("Profile and career canvas saved successfully");
    setTimeout(() => {
      setSuccessMsg("");
    }, 4000);
  };

  return (
    <main className="flex-1 max-w-[1536px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header & Breadcrumb - Always rendered immediately without skeleton delay */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 dark:text-zinc-500">
          <Link href="/" className="hover:text-zinc-700 dark:hover:text-zinc-300 transition">
            Workspace
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-zinc-800 dark:text-zinc-200">Settings</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-zinc-800 dark:text-zinc-200">Resume & Profile Canvas</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 dark:border-zinc-800 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
              Profile & Career Canvas
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Your candidate profile, work history, tech stack, and background for tailored job applications
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 text-xs font-semibold text-zinc-800 dark:text-zinc-200 shadow-2xs">
              <UserCheck className="w-4 h-4 text-emerald-500" />
              <span>Profile Ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* Render Resume Canvas with granular streaming states */}
      <ResumeCanvasView
        name={name}
        setName={setName}
        email={email}
        location={location}
        setLocation={setLocation}
        avatarUrl={avatarUrl}
        setAvatarUrl={setAvatarUrl}
        careerSummary={careerSummary}
        setCareerSummary={setCareerSummary}
        links={links}
        setLinks={setLinks}
        experiences={experiences}
        setExperiences={setExperiences}
        educations={educations}
        setEducations={setEducations}
        projects={projects}
        setProjects={setProjects}
        skills={skills}
        setSkills={setSkills}
        totalSkills={totalSkills}
        setTotalSkills={setTotalSkills}
        hasMoreSkills={hasMoreSkills}
        loadingMoreSkills={loadingMoreSkills}
        onLoadMoreSkills={handleLoadMoreSkills}
        loadingProfile={loadingProfile}
        loadingExp={loadingExp}
        loadingEdu={loadingEdu}
        loadingProjects={loadingProjects}
        loadingSkills={loadingSkills}
        saving={saving}
        errorMsg={errorMsg}
        successMsg={successMsg}
        isDirty={isDirty}
        onSubmit={handleSubmit}
      />
    </main>
  );
}
