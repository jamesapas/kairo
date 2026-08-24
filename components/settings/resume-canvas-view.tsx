"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Icon } from "@iconify/react";
import {
  User,
  Mail,
  Globe,
  Plus,
  Trash2,
  Briefcase,
  GraduationCap,
  Wrench,
  Camera,
  Check,
  ExternalLink,
  ShieldCheck,
  Building2,
  Building,
  Laptop,
  Save,
  Loader2,
  X,
  Code2,
  CheckCircle2,
  AlertCircle,
  Link2,
  Search,
  Sparkles,
  Pencil,
  MapPin,
  Calendar,
  Award,
} from "lucide-react";
import { ProfileLink } from "@/types/profile";
import { UserExperience, WorkplaceType } from "@/types/experience";
import { UserEducation } from "@/types/education";
import { uploadAvatarAction } from "@/lib/actions/profile";
import {
  createExperienceAction,
  updateExperienceAction,
  deleteExperienceAction,
} from "@/lib/actions/experience";
import {
  createEducationAction,
  updateEducationAction,
  deleteEducationAction,
} from "@/lib/actions/education";
import { CustomSelect, CustomSelectOption } from "@/components/jobs/custom-select";

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  location: string;
  period: string;
  isCurrent?: boolean;
  description: string;
}

export interface SkillItem {
  id: string;
  name: string;
  icon?: string;
  category?: string;
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  period: string;
  location: string;
}

export interface PlatformDefinition {
  id: string;
  name: string;
  icon: string;
  color?: string;
  domainMatch: string[];
  placeholder: string;
}

export const PLATFORM_REGISTRY: PlatformDefinition[] = [
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: "simple-icons:linkedin",
    color: "#0A66C2",
    domainMatch: ["linkedin.com"],
    placeholder: "https://linkedin.com/in/username",
  },
  {
    id: "github",
    name: "GitHub",
    icon: "simple-icons:github",
    domainMatch: ["github.com"],
    placeholder: "https://github.com/username",
  },
  {
    id: "website",
    name: "Portfolio / Website",
    icon: "lucide:globe",
    domainMatch: [],
    placeholder: "https://yourportfolio.dev",
  },
  {
    id: "x",
    name: "X (Twitter)",
    icon: "simple-icons:x",
    domainMatch: ["twitter.com", "x.com"],
    placeholder: "https://x.com/username",
  },
  {
    id: "figma",
    name: "Figma",
    icon: "simple-icons:figma",
    domainMatch: ["figma.com"],
    placeholder: "https://figma.com/@username",
  },
  {
    id: "dribbble",
    name: "Dribbble",
    icon: "simple-icons:dribbble",
    color: "#EA4C89",
    domainMatch: ["dribbble.com"],
    placeholder: "https://dribbble.com/username",
  },
  {
    id: "behance",
    name: "Behance",
    icon: "simple-icons:behance",
    color: "#1769FF",
    domainMatch: ["behance.net"],
    placeholder: "https://behance.net/username",
  },
  {
    id: "youtube",
    name: "YouTube",
    icon: "simple-icons:youtube",
    color: "#FF0000",
    domainMatch: ["youtube.com", "youtu.be"],
    placeholder: "https://youtube.com/@channel",
  },
  {
    id: "substack",
    name: "Substack",
    icon: "simple-icons:substack",
    color: "#FF6719",
    domainMatch: ["substack.com"],
    placeholder: "https://username.substack.com",
  },
  {
    id: "medium",
    name: "Medium",
    icon: "simple-icons:medium",
    domainMatch: ["medium.com"],
    placeholder: "https://medium.com/@username",
  },
  {
    id: "devdotto",
    name: "Dev.to",
    icon: "simple-icons:devdotto",
    domainMatch: ["dev.to"],
    placeholder: "https://dev.to/username",
  },
  {
    id: "stackoverflow",
    name: "Stack Overflow",
    icon: "simple-icons:stackoverflow",
    color: "#F58025",
    domainMatch: ["stackoverflow.com"],
    placeholder: "https://stackoverflow.com/users/...",
  },
  {
    id: "gitlab",
    name: "GitLab",
    icon: "simple-icons:gitlab",
    color: "#FC6D26",
    domainMatch: ["gitlab.com"],
    placeholder: "https://gitlab.com/username",
  },
  {
    id: "kaggle",
    name: "Kaggle",
    icon: "simple-icons:kaggle",
    color: "#20BEFF",
    domainMatch: ["kaggle.com"],
    placeholder: "https://kaggle.com/username",
  },
  {
    id: "huggingface",
    name: "Hugging Face",
    icon: "simple-icons:huggingface",
    color: "#FFD21E",
    domainMatch: ["huggingface.co"],
    placeholder: "https://huggingface.co/username",
  },
  {
    id: "discord",
    name: "Discord",
    icon: "simple-icons:discord",
    color: "#5865F2",
    domainMatch: ["discord.gg", "discord.com"],
    placeholder: "https://discord.gg/...",
  },
  {
    id: "twitch",
    name: "Twitch",
    icon: "simple-icons:twitch",
    color: "#9146FF",
    domainMatch: ["twitch.tv"],
    placeholder: "https://twitch.tv/username",
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: "simple-icons:instagram",
    color: "#E4405F",
    domainMatch: ["instagram.com"],
    placeholder: "https://instagram.com/username",
  },
  {
    id: "tiktok",
    name: "TikTok",
    icon: "simple-icons:tiktok",
    domainMatch: ["tiktok.com"],
    placeholder: "https://tiktok.com/@username",
  },
  {
    id: "threads",
    name: "Threads",
    icon: "simple-icons:threads",
    domainMatch: ["threads.net"],
    placeholder: "https://threads.net/@username",
  },
  {
    id: "other",
    name: "Other / Custom Link",
    icon: "lucide:link-2",
    domainMatch: [],
    placeholder: "https://...",
  },
];

export function detectPlatform(url: string): PlatformDefinition {
  const lower = url.toLowerCase().trim();
  for (const p of PLATFORM_REGISTRY) {
    if (p.domainMatch.some((d) => lower.includes(d))) {
      return p;
    }
  }
  return PLATFORM_REGISTRY.find((p) => p.id === "website") || PLATFORM_REGISTRY[0];
}

export function getPlatformDef(platformId: string): PlatformDefinition {
  return (
    PLATFORM_REGISTRY.find((p) => p.id.toLowerCase() === platformId.toLowerCase()) ||
    PLATFORM_REGISTRY.find((p) => p.id === "website") ||
    PLATFORM_REGISTRY[0]
  );
}

// Icon mapper for tech stack using Iconify skill-icons / logos
export function getSkillIcon(name: string): string {
  const lower = name.toLowerCase().trim();
  if (lower.includes("typescript") || lower === "ts") return "skill-icons:typescript";
  if (lower.includes("javascript") || lower === "js") return "skill-icons:javascript";
  if (lower.includes("next") || lower.includes("nextjs") || lower.includes("next.js")) return "skill-icons:nextjs-dark";
  if (lower.includes("react")) return "skill-icons:react-dark";
  if (lower.includes("vue")) return "skill-icons:vuejs-dark";
  if (lower.includes("svelte")) return "skill-icons:svelte";
  if (lower.includes("angular")) return "skill-icons:angular-dark";
  if (lower.includes("node") || lower.includes("nodejs")) return "skill-icons:nodejs-dark";
  if (lower.includes("python")) return "skill-icons:python-dark";
  if (lower.includes("golang") || lower === "go") return "skill-icons:golang";
  if (lower.includes("rust")) return "skill-icons:rust";
  if (lower.includes("java") && !lower.includes("script")) return "skill-icons:java-dark";
  if (lower.includes("c++") || lower === "cpp") return "skill-icons:cpp";
  if (lower.includes("c#") || lower === "csharp" || lower === "cs") return "skill-icons:cs";
  if (lower.includes("php")) return "skill-icons:php-dark";
  if (lower.includes("ruby") || lower.includes("rails")) return "skill-icons:ruby";
  if (lower.includes("postgres") || lower.includes("postgresql")) return "skill-icons:postgresql-dark";
  if (lower.includes("mysql")) return "skill-icons:mysql-dark";
  if (lower.includes("mongo") || lower.includes("mongodb")) return "skill-icons:mongodb";
  if (lower.includes("redis")) return "skill-icons:redis-dark";
  if (lower.includes("supabase")) return "skill-icons:supabase-dark";
  if (lower.includes("firebase")) return "skill-icons:firebase-dark";
  if (lower.includes("prisma")) return "skill-icons:prisma";
  if (lower.includes("graphql")) return "skill-icons:graphql-dark";
  if (lower.includes("tailwind")) return "skill-icons:tailwindcss-dark";
  if (lower.includes("sass") || lower.includes("scss")) return "skill-icons:sass";
  if (lower.includes("css")) return "skill-icons:css";
  if (lower.includes("html")) return "skill-icons:html";
  if (lower.includes("docker")) return "skill-icons:docker";
  if (lower.includes("kubernetes") || lower === "k8s") return "skill-icons:kubernetes";
  if (lower.includes("aws") || lower.includes("amazon web services")) return "skill-icons:aws-dark";
  if (lower.includes("gcp") || lower.includes("google cloud")) return "skill-icons:gcp-dark";
  if (lower.includes("azure")) return "skill-icons:azure-dark";
  if (lower.includes("vercel")) return "skill-icons:vercel-dark";
  if (lower.includes("git") && !lower.includes("hub")) return "skill-icons:git";
  if (lower.includes("github")) return "skill-icons:github-dark";
  if (lower.includes("figma")) return "skill-icons:figma-dark";
  if (lower.includes("linux")) return "skill-icons:linux-dark";
  if (lower.includes("jest")) return "skill-icons:jest";
  if (lower.includes("vitest")) return "skill-icons:vitest-dark";
  if (lower.includes("cypress")) return "skill-icons:cypress-dark";
  if (lower.includes("terraform")) return "skill-icons:terraform-dark";
  if (lower.includes("kafka")) return "skill-icons:kafka";
  if (lower.includes("fastapi")) return "skill-icons:fastapi";
  if (lower.includes("django")) return "skill-icons:django";
  if (lower.includes("flutter")) return "skill-icons:flutter-dark";
  if (lower.includes("swift")) return "skill-icons:swift";
  if (lower.includes("kotlin")) return "skill-icons:kotlin-dark";

  return "lucide:sparkles";
}

const POPULAR_SKILL_SUGGESTIONS = [
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "Python",
  "PostgreSQL",
  "Tailwind CSS",
  "Docker",
  "AWS",
  "GraphQL",
  "Supabase",
  "Git",
  "Figma",
  "Redis",
];

const WORKPLACE_SELECT_OPTIONS: CustomSelectOption<WorkplaceType>[] = [
  {
    value: "Remote",
    label: "Remote",
    icon: <Laptop className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />,
  },
  {
    value: "Hybrid",
    label: "Hybrid",
    icon: <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />,
  },
  {
    value: "On-site",
    label: "On-site",
    icon: <Building className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />,
  },
];

const MONTH_OPTIONS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 45 }, (_, i) => String(CURRENT_YEAR - i));

function WorkplaceBadge({ type }: { type: WorkplaceType }) {
  if (type === "Remote") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
        <Laptop className="w-3 h-3" />
        Remote
      </span>
    );
  }
  if (type === "Hybrid") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60">
        <Building2 className="w-3 h-3" />
        Hybrid
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 border border-purple-200/60 dark:border-purple-800/60">
      <Building className="w-3 h-3" />
      On-site
    </span>
  );
}

const DEFAULT_SKILLS: SkillItem[] = [
  { id: "sk-1", name: "TypeScript" },
  { id: "sk-2", name: "React" },
  { id: "sk-3", name: "Next.js" },
  { id: "sk-4", name: "Node.js" },
  { id: "sk-5", name: "PostgreSQL" },
  { id: "sk-6", name: "Tailwind CSS" },
  { id: "sk-7", name: "Docker" },
  { id: "sk-8", name: "AWS" },
  { id: "sk-9", name: "Supabase" },
  { id: "sk-10", name: "GraphQL" },
  { id: "sk-11", name: "Python" },
  { id: "sk-12", name: "Git" },
];

interface ResumeCanvasViewProps {
  name: string;
  setName: (v: string) => void;
  email: string;
  avatarUrl: string;
  setAvatarUrl: (v: string) => void;
  links: ProfileLink[];
  setLinks: (links: ProfileLink[]) => void;
  experiences: UserExperience[];
  setExperiences: React.Dispatch<React.SetStateAction<UserExperience[]>>;
  educations: UserEducation[];
  setEducations: React.Dispatch<React.SetStateAction<UserEducation[]>>;
  saving: boolean;
  errorMsg: string;
  successMsg: string;
  isDirty?: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function ResumeCanvasView({
  name,
  setName,
  email,
  avatarUrl,
  setAvatarUrl,
  links,
  setLinks,
  experiences,
  setExperiences,
  educations,
  setEducations,
  saving,
  errorMsg,
  successMsg,
  isDirty,
  onSubmit,
}: ResumeCanvasViewProps) {
  const [skills, setSkills] = useState<SkillItem[]>(DEFAULT_SKILLS);
  const [newSkillInput, setNewSkillInput] = useState("");

  // Link input state
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [selectedPlatformId, setSelectedPlatformId] = useState<string>("linkedin");
  const [customTitle, setCustomTitle] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");

  const handleAddLink = () => {
    if (!newLinkUrl.trim()) return;
    const platformDef = getPlatformDef(selectedPlatformId);
    const label =
      selectedPlatformId === "other"
        ? customTitle.trim() || "Custom Link"
        : platformDef.name;
    setLinks([
      ...links,
      {
        id: `link-${Date.now()}`,
        platform: selectedPlatformId,
        label: label,
        url: newLinkUrl.trim(),
      },
    ]);
    setNewLinkUrl("");
    if (selectedPlatformId === "other") setCustomTitle("");
    setIsAddingLink(false);
  };

  const handleUpdateLinkUrl = (id: string, newUrl: string) => {
    const detected = detectPlatform(newUrl);
    setLinks(
      links.map((l) =>
        l.id === id
          ? {
              ...l,
              url: newUrl,
              platform: l.platform === "custom" || l.platform === "website" ? detected.id : l.platform,
            }
          : l
      )
    );
  };

  const handleRemoveLink = (id: string) => {
    setLinks(links.filter((l) => l.id !== id));
  };

  // Experience Form State
  const [isAddingExp, setIsAddingExp] = useState(false);
  const [editingExpId, setEditingExpId] = useState<string | null>(null);
  const [expJobTitle, setExpJobTitle] = useState("");
  const [expCompanyName, setExpCompanyName] = useState("");
  const [expWorkplaceType, setExpWorkplaceType] = useState<WorkplaceType>("Remote");
  const [expLocation, setExpLocation] = useState("");
  const [expStartMonth, setExpStartMonth] = useState("Jan");
  const [expStartYear, setExpStartYear] = useState(String(CURRENT_YEAR));
  const [expEndMonth, setExpEndMonth] = useState("Dec");
  const [expEndYear, setExpEndYear] = useState(String(CURRENT_YEAR));
  const [expIsCurrent, setExpIsCurrent] = useState(true);
  const [expBullets, setExpBullets] = useState<string[]>([]);
  const [newBulletInput, setNewBulletInput] = useState("");
  const [savingExp, setSavingExp] = useState(false);

  const handleStartAddExperience = () => {
    setEditingExpId(null);
    setExpJobTitle("");
    setExpCompanyName("");
    setExpWorkplaceType("Remote");
    setExpLocation("");
    setExpStartMonth("Jan");
    setExpStartYear(String(CURRENT_YEAR));
    setExpEndMonth("Dec");
    setExpEndYear(String(CURRENT_YEAR));
    setExpIsCurrent(true);
    setExpBullets([]);
    setNewBulletInput("");
    setIsAddingExp(true);
  };

  const handleStartEditExperience = (exp: UserExperience) => {
    setEditingExpId(exp.id);
    setExpJobTitle(exp.jobTitle);
    setExpCompanyName(exp.companyName);
    setExpWorkplaceType(exp.workplaceType || "Remote");
    setExpLocation(exp.location || "");
    setExpStartMonth(exp.startMonth || "Jan");
    setExpStartYear(exp.startYear || String(CURRENT_YEAR));
    setExpEndMonth(exp.endMonth || "Dec");
    setExpEndYear(exp.endYear || String(CURRENT_YEAR));
    setExpIsCurrent(exp.isCurrent);
    setExpBullets(Array.isArray(exp.bullets) ? [...exp.bullets] : []);
    setNewBulletInput("");
    setIsAddingExp(true);
  };

  const handleAddBullet = () => {
    const trimmed = newBulletInput.trim();
    if (!trimmed) return;
    setExpBullets((prev) => [...prev, trimmed]);
    setNewBulletInput("");
  };

  const handleRemoveBullet = (index: number) => {
    setExpBullets((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expJobTitle.trim() || !expCompanyName.trim()) return;

    setSavingExp(true);

    const payload = {
      jobTitle: expJobTitle.trim(),
      companyName: expCompanyName.trim(),
      workplaceType: expWorkplaceType,
      location: expLocation.trim() || undefined,
      startMonth: expStartMonth,
      startYear: expStartYear,
      endMonth: expIsCurrent ? undefined : expEndMonth,
      endYear: expIsCurrent ? undefined : expEndYear,
      isCurrent: expIsCurrent,
      bullets: expBullets,
    };

    if (editingExpId) {
      const res = await updateExperienceAction(editingExpId, payload);
      if (res.success && res.data) {
        setExperiences((prev) =>
          prev.map((item) => (item.id === editingExpId ? res.data! : item))
        );
        setIsAddingExp(false);
        setEditingExpId(null);
      }
    } else {
      const res = await createExperienceAction(payload);
      if (res.success && res.data) {
        setExperiences((prev) => [res.data!, ...prev]);
        setIsAddingExp(false);
        setEditingExpId(null);
      }
    }
    setSavingExp(false);
  };

  const handleDeleteExperience = async (id: string) => {
    setExperiences((prev) => prev.filter((item) => item.id !== id));
    await deleteExperienceAction(id);
  };

  // Education Form State
  const [isAddingEdu, setIsAddingEdu] = useState(false);
  const [editingEduId, setEditingEduId] = useState<string | null>(null);
  const [eduSchool, setEduSchool] = useState("");
  const [eduDegree, setEduDegree] = useState("");
  const [eduLocation, setEduLocation] = useState("");
  const [eduHonors, setEduHonors] = useState("");
  const [eduStartMonth, setEduStartMonth] = useState("Aug");
  const [eduStartYear, setEduStartYear] = useState("2020");
  const [eduEndMonth, setEduEndMonth] = useState("Jun");
  const [eduEndYear, setEduEndYear] = useState("2024");
  const [eduIsCurrent, setEduIsCurrent] = useState(false);
  const [savingEdu, setSavingEdu] = useState(false);

  const handleStartAddEducation = () => {
    setEditingEduId(null);
    setEduSchool("");
    setEduDegree("");
    setEduLocation("");
    setEduHonors("");
    setEduStartMonth("Aug");
    setEduStartYear("2020");
    setEduEndMonth("Jun");
    setEduEndYear("2024");
    setEduIsCurrent(false);
    setIsAddingEdu(true);
  };

  const handleStartEditEducation = (edu: UserEducation) => {
    setEditingEduId(edu.id);
    setEduSchool(edu.school);
    setEduDegree(edu.degree);
    setEduLocation(edu.location || "");
    setEduHonors(edu.honors || "");
    setEduStartMonth(edu.startMonth || "Aug");
    setEduStartYear(edu.startYear || "2020");
    setEduEndMonth(edu.endMonth || "Jun");
    setEduEndYear(edu.endYear || "2024");
    setEduIsCurrent(edu.isCurrent);
    setIsAddingEdu(true);
  };

  const handleSaveEducation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eduSchool.trim() || !eduDegree.trim()) return;

    setSavingEdu(true);

    const payload = {
      school: eduSchool.trim(),
      degree: eduDegree.trim(),
      location: eduLocation.trim() || undefined,
      honors: eduHonors.trim() || undefined,
      startMonth: eduStartMonth,
      startYear: eduStartYear,
      endMonth: eduIsCurrent ? undefined : eduEndMonth,
      endYear: eduIsCurrent ? undefined : eduEndYear,
      isCurrent: eduIsCurrent,
    };

    if (editingEduId) {
      const res = await updateEducationAction(editingEduId, payload);
      if (res.success && res.data) {
        setEducations((prev) =>
          prev.map((item) => (item.id === editingEduId ? res.data! : item))
        );
        setIsAddingEdu(false);
        setEditingEduId(null);
      }
    } else {
      const res = await createEducationAction(payload);
      if (res.success && res.data) {
        setEducations((prev) => [res.data!, ...prev]);
        setIsAddingEdu(false);
        setEditingEduId(null);
      }
    }
    setSavingEdu(false);
  };

  const handleDeleteEducation = async (id: string) => {
    setEducations((prev) => prev.filter((item) => item.id !== id));
    await deleteEducationAction(id);
  };

  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Instant local preview
    const previewUrl = URL.createObjectURL(file);
    setAvatarUrl(previewUrl);
    setUploadingAvatar(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await uploadAvatarAction(formData);
      if (res.success && res.publicUrl) {
        setAvatarUrl(res.publicUrl);
      } else {
        console.error("Avatar upload error:", res.error);
      }
    } catch (err) {
      console.error("Failed to upload avatar:", err);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleAddSkill = (skillName: string) => {
    const trimmed = skillName.trim();
    if (!trimmed) return;
    if (skills.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) {
      setNewSkillInput("");
      return;
    }
    setSkills((prev) => [...prev, { id: `sk-${Date.now()}`, name: trimmed }]);
    setNewSkillInput("");
  };

  return (
    <form onSubmit={onSubmit} className="space-y-8 max-w-7xl mx-auto">
      {/* Top Notifications */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5 animate-fade-in shadow-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2.5 animate-fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      {/* =========================================================================
          SECTION 1: CANDIDATE IDENTITY & DYNAMIC LINKS CARD
          ========================================================================= */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 shadow-xs overflow-hidden">
        {/* Header Ribbon */}
        <div className="px-6 sm:px-8 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 flex items-center justify-center">
              <User className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                Profile
              </h2>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Left: Bigger Avatar with Hover-Only Controls */}
            <div className="shrink-0">
              <div className="relative group w-48 h-48 sm:w-52 sm:h-52 rounded-3xl bg-zinc-50 dark:bg-zinc-800/80 border-2 border-zinc-200 dark:border-zinc-700 shadow-xs overflow-hidden">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt="Avatar"
                    width={208}
                    height={208}
                    unoptimized
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-300 dark:text-zinc-600">
                    <User className="w-20 h-20" />
                  </div>
                )}

                {/* Hover-Only Action Overlay */}
                <div
                  className={`absolute inset-0 bg-black/60 ${
                    uploadingAvatar ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  } transition-opacity flex flex-col items-center justify-center gap-2 p-2 backdrop-blur-2xs`}
                >
                  {uploadingAvatar ? (
                    <div className="flex flex-col items-center gap-1.5 text-white">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="text-[11px] font-semibold">Uploading...</span>
                    </div>
                  ) : (
                    <>
                      <label
                        htmlFor="canvas-avatar-input"
                        className="px-3 py-1.5 rounded-xl bg-white/90 text-zinc-900 hover:bg-white text-xs font-bold cursor-pointer transition flex items-center gap-1.5 shadow-xs active:scale-[0.98]"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Change Photo</span>
                        <input
                          id="canvas-avatar-input"
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarFile}
                          className="hidden"
                        />
                      </label>
                      {avatarUrl && (
                        <button
                          type="button"
                          onClick={() => setAvatarUrl("")}
                          className="text-xs font-medium text-rose-300 hover:text-rose-100 transition cursor-pointer hover:underline"
                        >
                          Remove Photo
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Cols-1 Full Name, Email, and Links */}
            <div className="flex-1 w-full space-y-4">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-zinc-400" />
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:bg-white dark:focus:bg-zinc-800 focus:border-zinc-400 dark:focus:border-zinc-500 transition shadow-2xs"
                />
              </div>

              {/* Email Address */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-zinc-400" />
                    Account Email
                  </label>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200/60">
                    <ShieldCheck className="w-3 h-3" />
                    Synced
                  </span>
                </div>
                <input
                  type="email"
                  value={email}
                  disabled
                  readOnly
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-100/70 dark:bg-zinc-800/40 border border-zinc-200/70 dark:border-zinc-800 text-xs font-medium text-zinc-500 select-all cursor-not-allowed"
                />
              </div>

              {/* Links Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                      <Link2 className="w-3.5 h-3.5 text-zinc-400" />
                      Links
                    </label>
                    {links.length > 0 && (
                      <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full border border-zinc-200/70 dark:border-zinc-700">
                        {links.length}
                      </span>
                    )}
                  </div>

                  {!isAddingLink && (
                    <button
                      type="button"
                      onClick={() => setIsAddingLink(true)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700/80 text-[11px] font-semibold transition cursor-pointer active:scale-[0.98]"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Link</span>
                    </button>
                  )}
                </div>

                {/* Active Links List (List Mode) */}
                {links.length > 0 && (
                  <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 divide-y divide-zinc-200/60 dark:divide-zinc-800 overflow-hidden shadow-2xs">
                    {links.map((link) => {
                      const platformDef = getPlatformDef(link.platform);
                      return (
                        <div
                          key={link.id}
                          className="p-3 sm:px-4 flex items-center justify-between gap-3 hover:bg-white dark:hover:bg-zinc-850/60 transition group"
                        >
                          {/* Platform Badge & Title */}
                          <div className="flex items-center gap-2.5 min-w-[120px] sm:min-w-[160px] shrink-0">
                            <div className="w-7 h-7 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 flex items-center justify-center shrink-0 shadow-2xs">
                              <Icon icon={platformDef.icon} className="w-3.5 h-3.5 text-zinc-800 dark:text-zinc-200" />
                            </div>
                            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                              {link.label || platformDef.name}
                            </span>
                          </div>

                          {/* Editable URL Input in Center */}
                          <div className="flex-1 min-w-0">
                            <input
                              type="text"
                              value={link.url}
                              onChange={(e) => handleUpdateLinkUrl(link.id, e.target.value)}
                              placeholder="https://..."
                              className="w-full px-2.5 py-1 rounded-lg bg-transparent hover:bg-white dark:hover:bg-zinc-800 focus:bg-white dark:focus:bg-zinc-800 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 focus:border-zinc-300 dark:focus:border-zinc-600 text-xs text-zinc-700 dark:text-zinc-300 font-medium transition"
                            />
                          </div>

                          {/* Right Action Buttons */}
                          <div className="flex items-center gap-1 shrink-0">
                            {link.url && link.url.includes(".") && (
                              <a
                                href={link.url.startsWith("http") ? link.url : `https://${link.url}`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition flex items-center gap-1"
                              >
                                <span>Visit</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveLink(link.id)}
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                              title="Remove Link"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Empty State when no links and not adding */}
                {links.length === 0 && !isAddingLink && (
                  <button
                    type="button"
                    onClick={() => setIsAddingLink(true)}
                    className="w-full py-3.5 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/40 dark:bg-zinc-850/20 text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add a Social or Portfolio Link</span>
                  </button>
                )}

                {/* Inline Link Adder at the Bottom of Links */}
                {isAddingLink && (
                  <div className="p-3 rounded-2xl bg-zinc-50/90 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-2.5 animate-in fade-in">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                      {/* Platform Selector Dropdown */}
                      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shrink-0">
                        <Icon
                          icon={getPlatformDef(selectedPlatformId).icon}
                          className="w-4 h-4 text-zinc-800 dark:text-zinc-200 shrink-0"
                        />
                        <select
                          value={selectedPlatformId}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSelectedPlatformId(val);
                            const p = getPlatformDef(val);
                            if (p.id !== "other") {
                              setCustomTitle(p.name);
                            } else {
                              setCustomTitle("");
                            }
                          }}
                          className="bg-transparent text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none cursor-pointer pr-1"
                        >
                          {PLATFORM_REGISTRY.map((p) => (
                            <option
                              key={p.id}
                              value={p.id}
                              className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 py-1"
                            >
                              {p.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Optional Custom Title input when 'other' is chosen */}
                      {selectedPlatformId === "other" && (
                        <input
                          type="text"
                          value={customTitle}
                          onChange={(e) => setCustomTitle(e.target.value)}
                          placeholder="Title (e.g. My Blog)"
                          className="w-full sm:w-40 px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:border-zinc-400 transition shrink-0"
                        />
                      )}

                      {/* URL Input */}
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={newLinkUrl}
                          onChange={(e) => {
                            const val = e.target.value;
                            setNewLinkUrl(val);
                            const detected = detectPlatform(val);
                            if (
                              detected.id !== "website" &&
                              detected.id !== "other" &&
                              selectedPlatformId === "linkedin" &&
                              val.includes(detected.id)
                            ) {
                              setSelectedPlatformId(detected.id);
                              setCustomTitle(detected.name);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddLink();
                            }
                          }}
                          placeholder={getPlatformDef(selectedPlatformId).placeholder}
                          className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:border-zinc-400 transition"
                        />
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={handleAddLink}
                          disabled={!newLinkUrl.trim()}
                          className="px-4 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-bold transition disabled:opacity-50 cursor-pointer shadow-2xs active:scale-[0.98]"
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingLink(false);
                            setNewLinkUrl("");
                            if (selectedPlatformId === "other") setCustomTitle("");
                          }}
                          className="p-2 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition cursor-pointer"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 2: WORK EXPERIENCE TIMELINE CARD
          ========================================================================= */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 shadow-xs overflow-hidden">
        <div className="px-6 sm:px-8 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 flex items-center justify-center">
              <Briefcase className="w-3.5 h-3.5" />
            </div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                Experience
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/70 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300">
                {experiences.length}
              </span>
            </div>
          </div>

          {!isAddingExp && (
            <button
              type="button"
              onClick={handleStartAddExperience}
              className="px-3.5 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-200/80 dark:border-zinc-700 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-[0.98]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Experience</span>
            </button>
          )}
        </div>

        <div className="p-6 sm:p-8 space-y-4">
          {/* Add / Edit Experience Inline Form */}
          {isAddingExp && (
            <div className="p-5 sm:p-6 rounded-2xl bg-zinc-50/90 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-4 animate-in fade-in shadow-xs">
              <div className="flex items-center justify-between border-b border-zinc-200/60 dark:border-zinc-700/60 pb-3">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                    {editingExpId ? "Edit Work Experience" : "Add Work Experience"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingExp(false);
                    setEditingExpId(null);
                  }}
                  className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-700 transition cursor-pointer"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Row 1: Job Title & Company Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
                      Job Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={expJobTitle}
                      onChange={(e) => setExpJobTitle(e.target.value)}
                      placeholder="e.g. Senior Frontend Engineer"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:border-zinc-400 transition"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
                      Company Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={expCompanyName}
                      onChange={(e) => setExpCompanyName(e.target.value)}
                      placeholder="e.g. Stripe, OpenAI"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:border-zinc-400 transition"
                    />
                  </div>
                </div>

                {/* Row 2: Workplace & Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                      Workplace
                    </label>
                    <CustomSelect<WorkplaceType>
                      value={expWorkplaceType}
                      onChange={(val) => setExpWorkplaceType(val)}
                      options={WORKPLACE_SELECT_OPTIONS}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                      Location
                    </label>
                    <input
                      type="text"
                      value={expLocation}
                      onChange={(e) => setExpLocation(e.target.value)}
                      placeholder="e.g. Cebu, Philippines"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:border-zinc-400 transition"
                    />
                  </div>
                </div>

                {/* Row 3: Start Date & End Date */}
                <div className="space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Start Date */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                        Start Date
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={expStartMonth}
                          onChange={(e) => setExpStartMonth(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:border-zinc-400 cursor-pointer"
                        >
                          {MONTH_OPTIONS.map((m) => (
                            <option key={m} value={m} className="bg-white dark:bg-zinc-900">
                              {m}
                            </option>
                          ))}
                        </select>
                        <select
                          value={expStartYear}
                          onChange={(e) => setExpStartYear(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:border-zinc-400 cursor-pointer"
                        >
                          {YEAR_OPTIONS.map((y) => (
                            <option key={y} value={y} className="bg-white dark:bg-zinc-900">
                              {y}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* End Date */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                          End Date
                        </label>
                        <label className="inline-flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 select-none">
                          <input
                            type="checkbox"
                            checked={expIsCurrent}
                            onChange={(e) => setExpIsCurrent(e.target.checked)}
                            className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500 cursor-pointer w-3.5 h-3.5"
                          />
                          <span>I currently work here</span>
                        </label>
                      </div>

                      {expIsCurrent ? (
                        <div className="px-3.5 py-2 rounded-xl bg-zinc-100/80 dark:bg-zinc-800/40 border border-zinc-200/70 dark:border-zinc-800 text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 h-[38px]">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Present</span>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          <select
                            value={expEndMonth}
                            onChange={(e) => setExpEndMonth(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:border-zinc-400 cursor-pointer"
                          >
                            {MONTH_OPTIONS.map((m) => (
                              <option key={m} value={m} className="bg-white dark:bg-zinc-900">
                                {m}
                              </option>
                            ))}
                          </select>
                          <select
                            value={expEndYear}
                            onChange={(e) => setExpEndYear(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:border-zinc-400 cursor-pointer"
                          >
                            {YEAR_OPTIONS.map((y) => (
                              <option key={y} value={y} className="bg-white dark:bg-zinc-900">
                                {y}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Row 4: Key Accomplishments */}
                <div className="space-y-2 pt-1 border-t border-zinc-200/60 dark:border-zinc-700/60">
                  <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    Key Accomplishments
                  </label>

                  {/* Bullets List */}
                  {expBullets.length > 0 && (
                    <div className="space-y-1.5">
                      {expBullets.map((bullet, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-700/80 text-xs shadow-2xs group"
                        >
                          <span className="text-zinc-400 font-bold mt-0.5">•</span>
                          <span className="flex-1 text-zinc-800 dark:text-zinc-200 leading-relaxed font-medium">
                            {bullet}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveBullet(idx)}
                            className="p-1 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                            title="Remove"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Bullet Input */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newBulletInput}
                      onChange={(e) => setNewBulletInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddBullet();
                        }
                      }}
                      placeholder="Add an accomplishment or responsibility..."
                      className="flex-1 px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:border-zinc-400 transition"
                    />
                    <button
                      type="button"
                      onClick={handleAddBullet}
                      disabled={!newBulletInput.trim()}
                      className="px-3.5 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 text-xs font-bold transition disabled:opacity-50 cursor-pointer shadow-2xs active:scale-[0.98] shrink-0"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex justify-end items-center gap-2 pt-2 border-t border-zinc-200/60 dark:border-zinc-700/60">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingExp(false);
                    setEditingExpId(null);
                  }}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveExperience}
                  disabled={savingExp || !expJobTitle.trim() || !expCompanyName.trim()}
                  className="px-5 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-bold transition disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-2xs active:scale-[0.98]"
                >
                  {savingExp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{savingExp ? "Saving..." : editingExpId ? "Update Experience" : "Save Experience"}</span>
                </button>
              </div>
            </div>
          )}

          {/* List of Experience Timeline Cards */}
          {experiences.length > 0 ? (
            <div className="space-y-3.5">
              {experiences.map((exp) => (
                <div
                  key={exp.id}
                  className="p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-850/40 hover:border-zinc-300 dark:hover:border-zinc-700 transition flex flex-col sm:flex-row sm:items-start justify-between gap-4 group shadow-2xs"
                >
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-700 dark:text-zinc-300 shrink-0 font-bold text-xs mt-0.5">
                      {exp.workplaceType === "Remote" ? (
                        <Laptop className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      ) : exp.workplaceType === "Hybrid" ? (
                        <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <Building className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      )}
                    </div>

                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                          {exp.jobTitle}
                        </h3>
                        <span className="text-zinc-300 dark:text-zinc-700">•</span>
                        <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                          {exp.companyName}
                        </span>
                        <WorkplaceBadge type={exp.workplaceType} />
                        {exp.isCurrent && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60">
                            Current
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 font-medium">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                          <span>
                            {exp.startMonth} {exp.startYear} —{" "}
                            {exp.isCurrent ? "Present" : `${exp.endMonth || ""} ${exp.endYear || ""}`}
                          </span>
                        </div>
                        {exp.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                            <span>{exp.location}</span>
                          </div>
                        )}
                      </div>

                      {/* Bullets List */}
                      {exp.bullets && exp.bullets.length > 0 && (
                        <ul className="pt-2 space-y-1.5">
                          {exp.bullets.map((bullet, i) => (
                            <li
                              key={i}
                              className="text-xs text-zinc-600 dark:text-zinc-400 flex items-start gap-2 leading-relaxed"
                            >
                              <span className="text-zinc-400 font-bold mt-0.5 shrink-0">•</span>
                              <span>{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 self-end sm:self-start opacity-80 group-hover:opacity-100 transition shrink-0">
                    <button
                      type="button"
                      onClick={() => handleStartEditExperience(exp)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                      title="Edit Experience"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteExperience(exp.id)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                      title="Delete Experience"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            !isAddingExp && (
              <button
                type="button"
                onClick={handleStartAddExperience}
                className="w-full py-6 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/40 dark:bg-zinc-850/20 text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition flex flex-col items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <div className="w-8 h-8 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-400">
                  <Briefcase className="w-4 h-4" />
                </div>
                <span>+ Add your first work experience</span>
              </button>
            )
          )}
        </div>
      </div>

      {/* =========================================================================
          SECTION 3: SKILLS & TECH STACK (CLEAN LIGHT PILLS WITH ICONIFY)
          ========================================================================= */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 shadow-xs overflow-hidden">
        <div className="px-6 sm:px-8 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 flex items-center justify-center">
              <Wrench className="w-3.5 h-3.5" />
            </div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                Skills
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/70 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300">
                {skills.length}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Skill Adder Input */}
          <div className="flex items-center gap-2.5">
            <div className="relative flex-1">
              <input
                type="text"
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSkill(newSkillInput);
                  }
                }}
                placeholder="Add a technology or skill (e.g. TypeScript, React, Docker, Python)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-800 focus:border-zinc-400 transition"
              />
              <Code2 className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
            </div>

            <button
              type="button"
              onClick={() => handleAddSkill(newSkillInput)}
              disabled={!newSkillInput.trim()}
              className="px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 text-xs font-bold transition disabled:opacity-50 cursor-pointer shadow-2xs active:scale-[0.98]"
            >
              Add Skill
            </button>
          </div>

          {/* Quick Suggestions Chips */}
          <div className="space-y-1.5">
            <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">
              Quick Suggestions:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_SKILL_SUGGESTIONS.map((sug) => {
                const isSelected = skills.some((s) => s.name.toLowerCase() === sug.toLowerCase());
                return (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setSkills((prev) => prev.filter((s) => s.name.toLowerCase() !== sug.toLowerCase()));
                      } else {
                        handleAddSkill(sug);
                      }
                    }}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition cursor-pointer ${
                      isSelected
                        ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 shadow-2xs font-semibold"
                        : "bg-zinc-50/90 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 border-zinc-200/80 dark:border-zinc-700/80 hover:border-zinc-300 dark:hover:border-zinc-600"
                    }`}
                  >
                    <Icon icon={getSkillIcon(sug)} className="w-3.5 h-3.5 shrink-0" />
                    <span>{sug}</span>
                    {isSelected && <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Skills Cloud with Clean Light Badges */}
          <div className="pt-2">
            <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 mb-2.5">
              Your Tech Stack:
            </p>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <div
                  key={skill.id}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-50/80 dark:bg-zinc-800/70 text-zinc-800 dark:text-zinc-200 text-xs font-semibold border border-zinc-200/90 dark:border-zinc-700/80 shadow-2xs group hover:border-zinc-300 dark:hover:border-zinc-600 transition"
                >
                  <Icon icon={getSkillIcon(skill.name)} className="w-4 h-4 shrink-0" />
                  <span>{skill.name}</span>
                  <button
                    type="button"
                    onClick={() => setSkills((prev) => prev.filter((s) => s.id !== skill.id))}
                    className="text-zinc-400 hover:text-rose-500 transition ml-0.5 p-0.5 rounded-md hover:bg-zinc-200/60 dark:hover:bg-zinc-700"
                    title="Remove Skill"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 4: EDUCATION HISTORY CARD
          ========================================================================= */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 shadow-xs overflow-hidden">
        <div className="px-6 sm:px-8 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 flex items-center justify-center">
              <GraduationCap className="w-3.5 h-3.5" />
            </div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                Education
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/70 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300">
                {educations.length}
              </span>
            </div>
          </div>

          {!isAddingEdu && (
            <button
              type="button"
              onClick={handleStartAddEducation}
              className="px-3.5 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-200/80 dark:border-zinc-700 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-[0.98]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Education</span>
            </button>
          )}
        </div>

        <div className="p-6 sm:p-8 space-y-4">
          {/* Add / Edit Education Inline Form */}
          {isAddingEdu && (
            <div className="p-5 sm:p-6 rounded-2xl bg-zinc-50/90 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-4 animate-in fade-in shadow-xs">
              <div className="flex items-center justify-between border-b border-zinc-200/60 dark:border-zinc-700/60 pb-3">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                    {editingEduId ? "Edit Education" : "Add Education"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingEdu(false);
                    setEditingEduId(null);
                  }}
                  className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-700 transition cursor-pointer"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Row 1: School & Degree */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
                      School / University <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={eduSchool}
                      onChange={(e) => setEduSchool(e.target.value)}
                      placeholder="e.g. Cebu Technological University"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:border-zinc-400 transition"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
                      Degree / Major <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={eduDegree}
                      onChange={(e) => setEduDegree(e.target.value)}
                      placeholder="e.g. Bachelor of Science in Information Technology"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:border-zinc-400 transition"
                    />
                  </div>
                </div>

                {/* Row 2: Location & Honors Received */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                      Location
                    </label>
                    <input
                      type="text"
                      value={eduLocation}
                      onChange={(e) => setEduLocation(e.target.value)}
                      placeholder="e.g. Cebu, Philippines"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:border-zinc-400 transition"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                      Honors Received
                    </label>
                    <input
                      type="text"
                      value={eduHonors}
                      onChange={(e) => setEduHonors(e.target.value)}
                      placeholder="e.g. Magna Cum Laude"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:border-zinc-400 transition"
                    />
                  </div>
                </div>

                {/* Row 3: Start Date & Graduation Date */}
                <div className="space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Start Date */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                        Start Date
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={eduStartMonth}
                          onChange={(e) => setEduStartMonth(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:border-zinc-400 cursor-pointer"
                        >
                          {MONTH_OPTIONS.map((m) => (
                            <option key={m} value={m} className="bg-white dark:bg-zinc-900">
                              {m}
                            </option>
                          ))}
                        </select>
                        <select
                          value={eduStartYear}
                          onChange={(e) => setEduStartYear(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:border-zinc-400 cursor-pointer"
                        >
                          {YEAR_OPTIONS.map((y) => (
                            <option key={y} value={y} className="bg-white dark:bg-zinc-900">
                              {y}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Graduation / End Date */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                          Graduation Date
                        </label>
                        <label className="inline-flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 select-none">
                          <input
                            type="checkbox"
                            checked={eduIsCurrent}
                            onChange={(e) => setEduIsCurrent(e.target.checked)}
                            className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500 cursor-pointer w-3.5 h-3.5"
                          />
                          <span>I currently study here</span>
                        </label>
                      </div>

                      {eduIsCurrent ? (
                        <div className="px-3.5 py-2 rounded-xl bg-zinc-100/80 dark:bg-zinc-800/40 border border-zinc-200/70 dark:border-zinc-800 text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 h-[38px]">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Present</span>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          <select
                            value={eduEndMonth}
                            onChange={(e) => setEduEndMonth(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:border-zinc-400 cursor-pointer"
                          >
                            {MONTH_OPTIONS.map((m) => (
                              <option key={m} value={m} className="bg-white dark:bg-zinc-900">
                                {m}
                              </option>
                            ))}
                          </select>
                          <select
                            value={eduEndYear}
                            onChange={(e) => setEduEndYear(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:border-zinc-400 cursor-pointer"
                          >
                            {YEAR_OPTIONS.map((y) => (
                              <option key={y} value={y} className="bg-white dark:bg-zinc-900">
                                {y}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex justify-end items-center gap-2 pt-2 border-t border-zinc-200/60 dark:border-zinc-700/60">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingEdu(false);
                    setEditingEduId(null);
                  }}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEducation}
                  disabled={savingEdu || !eduSchool.trim() || !eduDegree.trim()}
                  className="px-5 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-bold transition disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-2xs active:scale-[0.98]"
                >
                  {savingEdu ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{savingEdu ? "Saving..." : editingEduId ? "Update Education" : "Save Education"}</span>
                </button>
              </div>
            </div>
          )}

          {/* List of Education Timeline Cards */}
          {educations.length > 0 ? (
            <div className="space-y-3.5">
              {educations.map((edu) => (
                <div
                  key={edu.id}
                  className="p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-850/40 hover:border-zinc-300 dark:hover:border-zinc-700 transition flex flex-col sm:flex-row sm:items-start justify-between gap-4 group shadow-2xs"
                >
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-700 dark:text-zinc-300 shrink-0 font-bold text-xs mt-0.5">
                      <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>

                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                          {edu.school}
                        </h3>
                        {edu.isCurrent && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60">
                            Current Student
                          </span>
                        )}
                      </div>

                      <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        {edu.degree}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 font-medium">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                          <span>
                            {edu.startMonth} {edu.startYear} —{" "}
                            {edu.isCurrent ? "Present" : `${edu.endMonth || ""} ${edu.endYear || ""}`}
                          </span>
                        </div>
                        {edu.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                            <span>{edu.location}</span>
                          </div>
                        )}
                      </div>

                      {/* Honors Badge */}
                      {edu.honors && (
                        <div className="pt-1.5 flex items-center">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/70 dark:border-amber-800/60 shadow-2xs">
                            <Award className="w-3.5 h-3.5 text-amber-500" />
                            <span>{edu.honors}</span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 self-end sm:self-start opacity-80 group-hover:opacity-100 transition shrink-0">
                    <button
                      type="button"
                      onClick={() => handleStartEditEducation(edu)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                      title="Edit Education"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteEducation(edu.id)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                      title="Delete Education"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            !isAddingEdu && (
              <button
                type="button"
                onClick={handleStartAddEducation}
                className="w-full py-6 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/40 dark:bg-zinc-850/20 text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition flex flex-col items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <div className="w-8 h-8 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-400">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <span>+ Add your education history</span>
              </button>
            )
          )}
        </div>
      </div>

      {/* =========================================================================
          STICKY SAVE ACTION BAR (CLEAN LIGHT GLASSMORPHIC BAR)
          ========================================================================= */}
      <div className="sticky bottom-6 z-20 flex items-center justify-between p-4 rounded-2xl bg-white/90 dark:bg-zinc-900/90 text-zinc-900 dark:text-zinc-100 backdrop-blur-md shadow-xl border border-zinc-200/90 dark:border-zinc-800">
        <div className="flex items-center gap-2 text-xs font-medium pl-2">
          {isDirty ? (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-amber-600 dark:text-amber-400 font-bold">Unsaved Changes Pending</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span className="text-zinc-700 dark:text-zinc-300">Resume & Candidate Profile Canvas</span>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={saving}
          className={`px-6 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-sm active:scale-[0.98] disabled:opacity-50 ${
            isDirty
              ? "bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 ring-2 ring-emerald-500/30 dark:ring-emerald-400/30"
              : "bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900"
          }`}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{saving ? "Saving Changes..." : "Save Canvas Profile"}</span>
        </button>
      </div>
    </form>
  );
}
