export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  full_name: string;
  headline: string | null;
  summary: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  website_url: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  created_at: string;
  updated_at: string;
}

export type ProfileFormData = Omit<Profile, "id" | "created_at" | "updated_at">;

export interface Experience {
  id: string;
  company: string;
  role: string;
  location: string | null;
  employment_type: string | null;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  description: string | null;
  bullet_points: string[];
  display_order: number;
  created_at: string;
  updated_at: string;
}

export type ExperienceFormData = Omit<Experience, "id" | "created_at" | "updated_at">;

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field_of_study: string | null;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  description: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export type EducationFormData = Omit<Education, "id" | "created_at" | "updated_at">;

export interface Skill {
  id: string;
  name: string;
  category: string;
  proficiency_level: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  years_of_experience: number | null;
  display_order: number;
  created_at: string;
}

export type SkillFormData = Omit<Skill, "id" | "created_at">;

export interface Project {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  highlights: string[];
  technologies: string[];
  project_url: string | null;
  github_url: string | null;
  is_featured: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export type ProjectFormData = Omit<Project, "id" | "created_at" | "updated_at">;

export interface CareerData {
  profile: Profile | null;
  experiences: Experience[];
  educations: Education[];
  skills: Skill[];
  projects: Project[];
}
