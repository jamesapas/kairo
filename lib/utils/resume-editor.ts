import { JobMatchAnalysis } from "@/types/ai-match";

export interface ParsedProject {
  title: string;
  link?: string;
  bullets: string[];
  type: "key" | "side" | "capstone";
  raw: string;
}

export interface ParsedResumeSkill {
  category: string;
  skills: string[];
}

// Extract recommended skills from job description and match analysis
export function getRecommendedSkillsForJob(
  description?: string,
  matchAnalysis?: JobMatchAnalysis | null,
  currentSkills: string[] = []
): string[] {
  const currentSet = new Set(currentSkills.map((s) => s.toLowerCase().trim()));
  const seen = new Set<string>();
  const recommendations: string[] = [];

  // 1. Missing skills from match analysis
  if (matchAnalysis?.missingSkills) {
    for (const sk of matchAnalysis.missingSkills) {
      const low = sk.toLowerCase().trim();
      if (!currentSet.has(low) && !seen.has(low)) {
        seen.add(low);
        recommendations.push(sk.trim());
      }
    }
  }

  // 2. Nice-to-have / preferred from match analysis
  if (matchAnalysis?.niceToHave) {
    for (const item of matchAnalysis.niceToHave) {
      const name = typeof item === "string" ? item : item.name;
      const low = name.toLowerCase().trim();
      if (!currentSet.has(low) && !seen.has(low)) {
        seen.add(low);
        recommendations.push(name.trim());
      }
    }
  }

  // 3. Keywords from description
  if (description) {
    const descLower = ` ${description.toLowerCase()} `;
    const commonTech = [
      "TypeScript", "JavaScript", "React", "Next.js", "Vue.js", "Tailwind CSS",
      "Node.js", "Express", "PostgreSQL", "MySQL", "MongoDB", "Supabase", "Firebase",
      "GraphQL", "REST APIs", "Git", "GitHub", "Docker", "AWS", "CI/CD",
      "Jest", "Playwright", "Cypress", "Python", "Redux", "Zustand", "Prisma",
      "Lighthouse", "Core Web Vitals", "SEO", "Responsive Design", "Figma"
    ];
    for (const kw of commonTech) {
      const low = kw.toLowerCase();
      if (!currentSet.has(low) && !seen.has(low) && descLower.includes(` ${low} `)) {
        seen.add(low);
        recommendations.push(kw);
      }
    }
  }

  return recommendations;
}

// Update the Professional Summary section in the resume text
export function updateResumeSummary(content: string, newSummary: string): string {
  const normalized = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const summaryRegex = /(PROFESSIONAL\s+SUMMARY\s*\n[-=_]+\s*\n)([\s\S]*?)(?=\n+[A-Z\s/&-]{3,}\s*(?:\n[-=_]+\s*\n|\n|$)|$)/i;

  if (summaryRegex.test(normalized)) {
    return normalized.replace(summaryRegex, `$1${newSummary.trim()}\n`);
  }

  // Fallback: prepend if not found
  return `PROFESSIONAL SUMMARY\n--------------------\n${newSummary.trim()}\n\n${normalized}`;
}

// Update the Position / Role Title in the resume header (Line 2 below Candidate Name)
export function updateResumePositionTitle(
  content: string,
  newPositionTitle: string
): string {
  const normalized = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = normalized.split("\n");

  let nameLineIdx = -1;
  let roleLineIdx = -1;

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (!trimmed) continue;
    if (/^PROFESSIONAL\s+SUMMARY/i.test(trimmed)) break;

    if (nameLineIdx === -1) {
      nameLineIdx = i;
      continue;
    }

    const isContact = trimmed.includes("@") || trimmed.includes("http") || trimmed.includes("|");
    if (!isContact && roleLineIdx === -1) {
      roleLineIdx = i;
      break;
    } else if (isContact) {
      // Line after name is already contact info, so no role line exists yet
      break;
    }
  }

  if (roleLineIdx !== -1) {
    lines[roleLineIdx] = newPositionTitle;
    return lines.join("\n");
  }

  if (nameLineIdx !== -1) {
    lines.splice(nameLineIdx + 1, 0, newPositionTitle);
    return lines.join("\n");
  }

  return `${newPositionTitle}\n\n${content}`;
}

// Add a skill to an existing category or create a new category in TECHNICAL SKILLS
export function addResumeSkill(
  content: string,
  targetCategory: string,
  newSkill: string
): string {
  const skillToAdd = newSkill.trim();
  if (!skillToAdd) return content;

  const normalized = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const skillsSectionRegex = /(TECHNICAL\s+SKILLS\s*\n[-=_]+\s*\n)([\s\S]*?)(?=\n+[A-Z\s/&-]{3,}\s*(?:\n[-=_]+\s*\n|\n|$)|$)/i;
  const match = normalized.match(skillsSectionRegex);

  if (!match) return content;

  const header = match[1];
  const body = match[2];
  const lines = body.split("\n").filter(Boolean);

  let updated = false;
  const newLines = lines.map((line) => {
    const colonMatch = line.match(/^([^:]+):\s*(.*)$/);
    if (!colonMatch) return line;

    const catName = colonMatch[1].trim();
    if (catName.toLowerCase() === targetCategory.toLowerCase()) {
      const skills = colonMatch[2]
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (!skills.some((s) => s.toLowerCase() === skillToAdd.toLowerCase())) {
        skills.push(skillToAdd);
      }
      updated = true;
      return `${catName}: ${skills.join(", ")}`;
    }
    return line;
  });

  // If target category wasn't found, append it to the first category or add new line
  if (!updated) {
    if (newLines.length > 0) {
      const firstLine = newLines[0];
      const colonMatch = firstLine.match(/^([^:]+):\s*(.*)$/);
      if (colonMatch) {
        newLines[0] = `${colonMatch[1]}: ${colonMatch[2].trim()}, ${skillToAdd}`;
      } else {
        newLines.push(`${targetCategory}: ${skillToAdd}`);
      }
    } else {
      newLines.push(`${targetCategory}: ${skillToAdd}`);
    }
  }

  const newBody = newLines.join("\n");
  return normalized.replace(skillsSectionRegex, `${header}${newBody}\n`);
}

// Add a new skill category to TECHNICAL SKILLS
export function addResumeSkillCategory(
  content: string,
  categoryName: string,
  initialSkill?: string
): string {
  const cleanCat = categoryName.trim().replace(/:+$/, "").trim();
  if (!cleanCat) return content;

  const normalized = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const skillsSectionRegex = /(TECHNICAL\s+SKILLS\s*\n[-=_]+\s*\n)([\s\S]*?)(?=\n+[A-Z\s/&-]{3,}\s*(?:\n[-=_]+\s*\n|\n|$)|$)/i;
  const match = normalized.match(skillsSectionRegex);

  if (!match) return content;

  const header = match[1];
  const body = match[2];
  const lines = body.split("\n").filter(Boolean);

  // Check if category already exists (case-insensitive)
  const existingIdx = lines.findIndex((line) => {
    const colonMatch = line.match(/^([^:]+):\s*(.*)$/);
    return colonMatch && colonMatch[1].trim().toLowerCase() === cleanCat.toLowerCase();
  });

  const initSkill = initialSkill?.trim() || "";

  if (existingIdx !== -1) {
    if (initSkill) {
      return addResumeSkill(content, cleanCat, initSkill);
    }
    return content;
  }

  const newLine = initSkill ? `${cleanCat}: ${initSkill}` : `${cleanCat}:`;
  lines.push(newLine);

  const newBody = lines.join("\n");
  return normalized.replace(skillsSectionRegex, `${header}${newBody}\n`);
}

// Remove an entire skill category from TECHNICAL SKILLS
export function removeResumeSkillCategory(
  content: string,
  categoryName: string
): string {
  const cleanCat = categoryName.trim().replace(/:+$/, "").trim().toLowerCase();
  if (!cleanCat) return content;

  const normalized = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const skillsSectionRegex = /(TECHNICAL\s+SKILLS\s*\n[-=_]+\s*\n)([\s\S]*?)(?=\n+[A-Z\s/&-]{3,}\s*(?:\n[-=_]+\s*\n|\n|$)|$)/i;
  const match = normalized.match(skillsSectionRegex);

  if (!match) return content;

  const header = match[1];
  const body = match[2];
  const lines = body.split("\n").filter(Boolean);

  const newLines = lines.filter((line) => {
    const colonMatch = line.match(/^([^:]+):\s*(.*)$/);
    if (!colonMatch) return true;
    return colonMatch[1].trim().toLowerCase() !== cleanCat;
  });

  const newBody = newLines.join("\n");
  return normalized.replace(skillsSectionRegex, `${header}${newBody}\n`);
}

// Remove a skill from TECHNICAL SKILLS
export function removeResumeSkill(
  content: string,
  targetCategory: string,
  skillToRemove: string
): string {
  const normalized = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const skillsSectionRegex = /(TECHNICAL\s+SKILLS\s*\n[-=_]+\s*\n)([\s\S]*?)(?=\n+[A-Z\s/&-]{3,}\s*(?:\n[-=_]+\s*\n|\n|$)|$)/i;
  const match = normalized.match(skillsSectionRegex);

  if (!match) return content;

  const header = match[1];
  const body = match[2];
  const lines = body.split("\n").filter(Boolean);

  const newLines = lines
    .map((line) => {
      const colonMatch = line.match(/^([^:]+):\s*(.*)$/);
      if (!colonMatch) return line;

      const catName = colonMatch[1].trim();
      if (catName.toLowerCase() === targetCategory.toLowerCase()) {
        const skills = colonMatch[2]
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s.toLowerCase() !== skillToRemove.toLowerCase());
        if (skills.length === 0) return `${catName}:`;
        return `${catName}: ${skills.join(", ")}`;
      }
      return line;
    })
    .filter(Boolean);

  const newBody = newLines.join("\n");
  return normalized.replace(skillsSectionRegex, `${header}${newBody}\n`);
}

// Move a skill category to a new position in TECHNICAL SKILLS
export function reorderResumeSkillCategory(
  content: string,
  fromCategory: string,
  toCategory: string
): string {
  const normalized = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const skillsSectionRegex = /(TECHNICAL\s+SKILLS\s*\n[-=_]+\s*\n)([\s\S]*?)(?=\n+[A-Z\s/&-]{3,}\s*(?:\n[-=_]+\s*\n|\n|$)|$)/i;
  const match = normalized.match(skillsSectionRegex);

  if (!match) return content;

  const header = match[1];
  const lines = match[2].split("\n").filter(Boolean);
  const findIdx = (cat: string) =>
    lines.findIndex((line) => line.match(/^([^:]+):/)?.[1].trim().toLowerCase() === cat.toLowerCase());

  const fromIdx = findIdx(fromCategory);
  const toIdx = findIdx(toCategory);
  if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return content;

  const [moved] = lines.splice(fromIdx, 1);
  lines.splice(toIdx, 0, moved);

  return normalized.replace(skillsSectionRegex, `${header}${lines.join("\n")}\n`);
}

// Move a skill to a new position within its category
export function reorderResumeSkill(
  content: string,
  targetCategory: string,
  fromIndex: number,
  toIndex: number
): string {
  if (fromIndex === toIndex) return content;

  const normalized = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const skillsSectionRegex = /(TECHNICAL\s+SKILLS\s*\n[-=_]+\s*\n)([\s\S]*?)(?=\n+[A-Z\s/&-]{3,}\s*(?:\n[-=_]+\s*\n|\n|$)|$)/i;
  const match = normalized.match(skillsSectionRegex);

  if (!match) return content;

  const header = match[1];
  const lines = match[2].split("\n").filter(Boolean);

  const newLines = lines.map((line) => {
    const colonMatch = line.match(/^([^:]+):\s*(.*)$/);
    if (!colonMatch) return line;

    const catName = colonMatch[1].trim();
    if (catName.toLowerCase() !== targetCategory.toLowerCase()) return line;

    const skills = colonMatch[2]
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (fromIndex < 0 || fromIndex >= skills.length || toIndex < 0 || toIndex >= skills.length) return line;

    const [moved] = skills.splice(fromIndex, 1);
    skills.splice(toIndex, 0, moved);
    return `${catName}: ${skills.join(", ")}`;
  });

  return normalized.replace(skillsSectionRegex, `${header}${newLines.join("\n")}\n`);
}

// Rename a skill category in TECHNICAL SKILLS
export function renameResumeSkillCategory(
  content: string,
  oldCategory: string,
  newCategory: string
): string {
  const cleanNew = newCategory.trim().replace(/:+$/, "").trim();
  if (!cleanNew || cleanNew === oldCategory.trim()) return content;

  const normalized = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const skillsSectionRegex = /(TECHNICAL\s+SKILLS\s*\n[-=_]+\s*\n)([\s\S]*?)(?=\n+[A-Z\s/&-]{3,}\s*(?:\n[-=_]+\s*\n|\n|$)|$)/i;
  const match = normalized.match(skillsSectionRegex);

  if (!match) return content;

  const header = match[1];
  const lines = match[2].split("\n").filter(Boolean);

  const newLines = lines.map((line) => {
    const colonMatch = line.match(/^([^:]+):\s*(.*)$/);
    if (!colonMatch || colonMatch[1].trim().toLowerCase() !== oldCategory.trim().toLowerCase()) return line;
    return colonMatch[2].trim() ? `${cleanNew}: ${colonMatch[2].trim()}` : `${cleanNew}:`;
  });

  return normalized.replace(skillsSectionRegex, `${header}${newLines.join("\n")}\n`);
}

// Edit the text of a single skill within its category
export function updateResumeSkill(
  content: string,
  targetCategory: string,
  skillIndex: number,
  newSkill: string
): string {
  const cleanSkill = newSkill.trim().replace(/,/g, "");
  if (!cleanSkill) return content;

  const normalized = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const skillsSectionRegex = /(TECHNICAL\s+SKILLS\s*\n[-=_]+\s*\n)([\s\S]*?)(?=\n+[A-Z\s/&-]{3,}\s*(?:\n[-=_]+\s*\n|\n|$)|$)/i;
  const match = normalized.match(skillsSectionRegex);

  if (!match) return content;

  const header = match[1];
  const lines = match[2].split("\n").filter(Boolean);

  const newLines = lines.map((line) => {
    const colonMatch = line.match(/^([^:]+):\s*(.*)$/);
    if (!colonMatch) return line;

    const catName = colonMatch[1].trim();
    if (catName.toLowerCase() !== targetCategory.toLowerCase()) return line;

    const skills = colonMatch[2]
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (skillIndex < 0 || skillIndex >= skills.length) return line;

    skills[skillIndex] = cleanSkill;
    return `${catName}: ${skills.join(", ")}`;
  });

  return normalized.replace(skillsSectionRegex, `${header}${newLines.join("\n")}\n`);
}

// Parse all projects currently in the resume text
export function parseResumeProjects(content: string): ParsedProject[] {
  const normalized = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = normalized.split("\n");

  const projects: ParsedProject[] = [];
  let currentCategory: "key" | "side" | "capstone" | null = null;
  let currentProject: Partial<ParsedProject> | null = null;
  let currentRawLines: string[] = [];

  const finalizeProject = () => {
    if (currentProject && currentProject.title && currentCategory) {
      projects.push({
        title: currentProject.title,
        link: currentProject.link,
        bullets: currentProject.bullets || [],
        type: currentCategory,
        raw: currentRawLines.join("\n").trim(),
      });
    }
    currentProject = null;
    currentRawLines = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.match(/^KEY\s+PROJECTS?/i)) {
      finalizeProject();
      currentCategory = "key";
      continue;
    } else if (line.match(/^SIDE\s+PROJECTS?/i)) {
      finalizeProject();
      currentCategory = "side";
      continue;
    } else if (line.match(/^CAPSTONE\s+PROJECTS?/i)) {
      finalizeProject();
      currentCategory = "capstone";
      continue;
    } else if (line.match(/PROJECTS?/i) && !line.includes("EXPERIENCE") && !line.includes("EDUCATION")) {
      finalizeProject();
      currentCategory = "key";
      continue;
    } else if (
      line.match(/^[A-Z\s/&-]{3,}$/) &&
      (line.includes("EXPERIENCE") || line.includes("EDUCATION") || line.includes("SKILL") || line.includes("SUMMARY"))
    ) {
      finalizeProject();
      currentCategory = null;
      continue;
    }

    if (!currentCategory) continue;
    if (line.match(/^[-=_]{3,}$/)) continue;
    if (!line) continue;

    // Check if line is project title
    if (!line.startsWith("•") && !line.startsWith("-")) {
      finalizeProject();
      const parts = line.split("|").map((s) => s.trim());
      currentProject = {
        title: parts[0],
        link: parts[1] || undefined,
        bullets: [],
      };
      currentRawLines.push(line);
    } else if (currentProject) {
      const bulletText = line.replace(/^[•-]\s*/, "");
      currentProject.bullets = [...(currentProject.bullets || []), bulletText];
      currentRawLines.push(line);
    }
  }

  finalizeProject();
  return projects;
}

// Change the project type of a specific project and re-render sections in canonical order
export function changeResumeProjectType(
  content: string,
  projectTitle: string,
  newType: "key" | "side" | "capstone"
): string {
  const projects = parseResumeProjects(content);
  const targetLow = projectTitle.toLowerCase().trim();

  const target = projects.find((p) => p.title.toLowerCase().trim() === targetLow);
  if (!target || target.type === newType) return content;

  // Update target project's type
  target.type = newType;

  return reassembleResumeProjects(content, projects);
}

// Hide a project from the resume text
export function hideResumeProject(
  content: string,
  projectTitle: string
): { updatedContent: string; hiddenProject: ParsedProject | null } {
  const projects = parseResumeProjects(content);
  const targetLow = projectTitle.toLowerCase().trim();

  const hidden = projects.find((p) => p.title.toLowerCase().trim() === targetLow) || null;
  const remaining = projects.filter((p) => p.title.toLowerCase().trim() !== targetLow);

  return {
    updatedContent: reassembleResumeProjects(content, remaining),
    hiddenProject: hidden,
  };
}

// Restore a previously hidden project into the resume text
export function restoreResumeProject(
  content: string,
  projectToRestore: ParsedProject
): string {
  const projects = parseResumeProjects(content);
  if (projects.some((p) => p.title.toLowerCase().trim() === projectToRestore.title.toLowerCase().trim())) {
    return content;
  }
  projects.push(projectToRestore);
  return reassembleResumeProjects(content, projects);
}

// Auto-detect project types based on job relevance
export function autoDetectResumeProjectTypes(
  content: string,
  jobTitle?: string,
  description?: string
): string {
  const projects = parseResumeProjects(content);
  if (projects.length === 0) return content;

  const contextText = `${jobTitle || ""} ${description || ""}`.toLowerCase();

  const scored = projects.map((p) => {
    let score = 0;
    const projText = `${p.title} ${p.bullets.join(" ")}`.toLowerCase();
    const words = projText.split(/[^a-zA-Z0-9+#]+/).filter((w) => w.length >= 3);
    for (const w of words) {
      if (contextText.includes(w)) score += 1;
    }
    if (p.link) score += 2;
    return { project: p, score };
  });

  scored.sort((a, b) => b.score - a.score);

  scored.forEach((item, idx) => {
    if (idx === 0) {
      item.project.type = "key";
    } else if (idx === 1 && item.score >= 2) {
      item.project.type = "key";
    } else if (item.project.type === "capstone") {
      item.project.type = "capstone";
    } else {
      item.project.type = "side";
    }
  });

  return reassembleResumeProjects(content, projects);
}

// Helper to rebuild resume with reorganized projects
function reassembleResumeProjects(content: string, projects: ParsedProject[]): string {
  const normalized = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // Regex matching all project sections (KEY PROJECTS, SIDE PROJECTS, CAPSTONE PROJECT, PROJECTS)
  const allProjectsRegex = /(?:\n+(?:KEY\s+PROJECTS?|SIDE\s+PROJECTS?|CAPSTONE\s+PROJECTS?|[A-Z\s/&-]*PROJECTS?)\s*\n[-=_]+\s*\n[\s\S]*?)(?=\n+[A-Z\s/&-]{3,}\s*(?:\n[-=_]+\s*\n|\n|$)|$)/gi;

  const renderProject = (p: ParsedProject) => {
    const titleLine = p.link ? `${p.title} | ${p.link}` : p.title;
    const bullets = p.bullets.map((b) => (b.startsWith("•") ? b : `• ${b}`)).join("\n");
    return [titleLine, bullets].filter(Boolean).join("\n");
  };

  const keyProjects = projects.filter((p) => p.type === "key");
  const sideProjects = projects.filter((p) => p.type === "side");
  const capstoneProjects = projects.filter((p) => p.type === "capstone");

  const newSectionParts: string[] = [];
  if (keyProjects.length > 0) {
    newSectionParts.push(`\n\nKEY PROJECTS\n------------\n${keyProjects.map(renderProject).join("\n\n")}`);
  }
  if (sideProjects.length > 0) {
    newSectionParts.push(`\n\nSIDE PROJECTS\n-------------\n${sideProjects.map(renderProject).join("\n\n")}`);
  }
  if (capstoneProjects.length > 0) {
    const header = capstoneProjects.length > 1 ? "CAPSTONE PROJECTS" : "CAPSTONE PROJECT";
    const underline = "-".repeat(header.length);
    newSectionParts.push(`\n\n${header}\n${underline}\n${capstoneProjects.map(renderProject).join("\n\n")}`);
  }

  const replacement = newSectionParts.join("");

  if (allProjectsRegex.test(normalized)) {
    // Replace existing project sections with newly organized ones
    let replaced = false;
    const result = normalized.replace(allProjectsRegex, () => {
      if (!replaced) {
        replaced = true;
        return replacement;
      }
      return "";
    });
    return result.trim();
  }

  // Fallback: append before EDUCATION or at end
  const eduRegex = /(\n+EDUCATION\s*\n[-=_]+\s*\n)/i;
  if (eduRegex.test(normalized)) {
    return normalized.replace(eduRegex, `${replacement}$1`).trim();
  }

  return `${normalized}${replacement}`.trim();
}
