import {
  NiceToHaveSkill,
  RelevantProject,
  SeniorityMatchLevel,
} from "@/types/ai-match";

/**
 * Deterministic Skill Normalization and Matching Engine
 * Uses structured candidate profile as source of truth.
 */

// Normalized synonym dictionary mapping canonical tech keys to equivalent aliases and ecosystem members
const SYNONYM_MAP: Record<string, string[]> = {
  php: ["php", "php7", "php8", "laravel", "symfony", "codeigniter", "wordpress", "drupal", "lamp"],
  nodejs: ["node", "node.js", "nodejs", "node js", "express", "express.js", "expressjs", "nest.js", "nestjs", "fastify", "koa"],
  python: ["python", "python3", "python 3", "django", "flask", "fastapi", "pandas", "numpy", "pytorch"],
  graphql: ["graphql", "apollo", "apollo graphql", "apollo client", "relay", "subgraph"],
  redux: ["redux", "redux toolkit", "react-redux", "react redux", "rtk", "redux-thunk", "redux saga"],
  react: ["react", "react.js", "reactjs", "react native", "reactnative", "next.js", "nextjs"],
  typescript: ["typescript", "ts"],
  javascript: ["javascript", "js", "es6", "es6+", "es2015", "esnext", "ecmascript"],
  postgresql: ["postgresql", "postgres", "psql", "pg", "postgre"],
  mysql: ["mysql", "mariadb", "sql", "rdbms"],
  tailwindcss: ["tailwind", "tailwind css", "tailwindcss", "nativewind"],
  nextjs: ["next", "next.js", "nextjs"],
  vuejs: ["vue", "vue.js", "vuejs", "nuxt", "nuxt.js", "nuxtjs"],
  alpinejs: ["alpine", "alpine.js", "alpinejs"],
  rest: ["rest", "rest api", "rest apis", "restful", "restful api", "restful apis", "rest-api", "web apis"],
  git: ["git", "github", "gitlab", "bitbucket", "version control"],
  webpack: ["webpack", "vite", "turbopack", "rollup", "bundler", "grunt", "yarn", "npm"],
  vite: ["vite", "vitejs"],
  supabase: ["supabase", "firebase", "baas"],
  firebase: ["firebase", "firestore"],
  prisma: ["prisma", "prisma orm", "drizzle", "drizzle orm", "typeorm"],
  docker: ["docker", "docker-compose", "containers", "containerization"],
  aws: ["aws", "amazon web services", "s3", "ec2", "lambda", "cloudfront"],
  gcp: ["gcp", "google cloud", "google cloud platform"],
  html: ["html", "html5"],
  css: ["css", "css3", "sass", "scss", "less"],
  seo: ["seo", "seo best practices", "search engine optimization"],
  webperf: ["lighthouse", "web vitals", "performance optimization", "performance optimization tools like lighthouse or web vitals"],
  zustand: ["zustand", "redux", "state management"],
  figma: ["figma", "ui/ux", "ui design", "ux design", "product design"],
  jest: ["jest", "vitest", "unit testing", "testing"],
  playwright: ["playwright", "cypress", "e2e testing"],
};

/**
 * Standardize text by lowercasing and stripping non-alphanumeric separators
 */
export function normalizeSkill(skill: string): string {
  return skill
    .toLowerCase()
    .trim()
    .replace(/[._\-/\\]+/g, "")
    .replace(/\s+/g, "");
}

/**
 * Get all known synonyms and normalized variations for a given skill string
 */
export function getSynonymsForSkill(skill: string): Set<string> {
  const norm = normalizeSkill(skill);
  const result = new Set<string>();
  result.add(norm);
  result.add(skill.toLowerCase().trim());

  // Check synonym map keys and arrays
  for (const [key, aliases] of Object.entries(SYNONYM_MAP)) {
    const normalizedKey = normalizeSkill(key);
    const normalizedAliases = aliases.map(normalizeSkill);

    if (norm === normalizedKey || normalizedAliases.includes(norm)) {
      result.add(normalizedKey);
      for (const a of aliases) {
        result.add(a.toLowerCase().trim());
        result.add(normalizeSkill(a));
      }
    }
  }

  return result;
}

/**
 * Check whether a candidate possesses a given required skill (deterministic matching)
 */
export function candidateMatchesSkill(
  requiredSkill: string,
  candidateSkills: string[]
): boolean {
  if (!requiredSkill || !candidateSkills || candidateSkills.length === 0) return false;

  const reqNorm = normalizeSkill(requiredSkill);
  const reqLower = requiredSkill.toLowerCase().trim();
  const reqSynonyms = getSynonymsForSkill(requiredSkill);

  for (const cand of candidateSkills) {
    const candNorm = normalizeSkill(cand);
    const candLower = cand.toLowerCase().trim();

    // 1. Direct exact or normalized match
    if (reqNorm === candNorm || reqLower === candLower) return true;

    // 2. Synonym / Alias set intersection
    const candSynonyms = getSynonymsForSkill(cand);
    for (const syn of reqSynonyms) {
      if (candSynonyms.has(syn)) return true;
    }

    // 3. Substring inclusion (e.g. "React" in "React.js", "Tailwind" in "Tailwind CSS")
    if (
      (candLower.length >= 3 && reqLower.includes(candLower)) ||
      (reqLower.length >= 3 && candLower.includes(reqLower))
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Check if an unmet requirement string is contradictory (i.e. mentions skills the candidate actually has)
 */
export function isUnmetRequirementContradictory(
  requirementText: string,
  candidateSkills: string[]
): boolean {
  if (!requirementText || !candidateSkills || candidateSkills.length === 0) return false;

  const lower = ` ${requirementText.toLowerCase().replace(/[,/|;:()[\]{}]+/g, " ")} `;

  // Look for any candidate skill mentioned in this requirement
  for (const skill of candidateSkills) {
    const synonyms = getSynonymsForSkill(skill);
    for (const syn of synonyms) {
      if (syn.length < 2) continue;

      // Word boundary match
      const escaped = syn.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, "i");

      if (regex.test(lower)) {
        return true; // Candidate has this skill, so requirement is fulfilled!
      }
    }
  }

  return false;
}

export interface ReconcileOptions {
  candidateSkills: string[];
  rawMatchedSkills: string[];
  rawMissingSkills: string[];
  rawUnmetRequirements: string[];
  rawNiceToHave: (string | NiceToHaveSkill)[];
  rawMatchingExperience?: string[];
  rawExperienceGaps?: string[];
  rawRelevantProjects?: (RelevantProject | any)[];
  rawSeniorityLevel?: string;
  rawSeniorityAssessment?: string;
  rawKeyStrengths: string[];
  rawPotentialGaps: string[];
  rawMatchPercentage: number;
}

export interface ReconciledResult {
  matchedSkills: string[];
  missingSkills: string[];
  unmetRequirements: string[];
  niceToHave: NiceToHaveSkill[];
  matchingExperience?: string[];
  experienceGaps?: string[];
  relevantProjects?: RelevantProject[];
  seniorityLevel: SeniorityMatchLevel;
  seniorityAssessment: string;
  keyStrengths: string[];
  potentialGaps: string[];
  matchPercentage: number;
  matchLabel: string;
  recommendation: "apply" | "maybe" | "skip";
}

export function reconcileJobMatch(options: ReconcileOptions): ReconciledResult {
  const {
    candidateSkills,
    rawMatchedSkills,
    rawMissingSkills,
    rawUnmetRequirements,
    rawNiceToHave,
    rawMatchingExperience = [],
    rawExperienceGaps = [],
    rawRelevantProjects = [],
    rawSeniorityLevel,
    rawSeniorityAssessment,
    rawKeyStrengths,
    rawPotentialGaps,
    rawMatchPercentage,
  } = options;

  const matchedSet = new Set<string>();
  const missingSet = new Set<string>();

  // 1. Process rawMatchedSkills: ensure formatted properly
  for (const sk of rawMatchedSkills) {
    const trimmed = sk.trim();
    if (trimmed) matchedSet.add(trimmed);
  }

  // 2. Process rawMissingSkills: check against DB truth
  for (const sk of rawMissingSkills) {
    const trimmed = sk.trim();
    if (!trimmed) continue;

    if (candidateMatchesSkill(trimmed, candidateSkills)) {
      // User actually has this skill! Move to matched
      matchedSet.add(trimmed);
    } else {
      missingSet.add(trimmed);
    }
  }

  // 3. Ensure candidate skills that match the job description aren't missing
  for (const cand of candidateSkills) {
    for (const miss of Array.from(missingSet)) {
      if (candidateMatchesSkill(miss, [cand])) {
        missingSet.delete(miss);
        matchedSet.add(miss);
      }
    }
  }

  // 4. Invariant: Disjoint sets (matchedSkills and missingSkills must NOT overlap)
  for (const m of Array.from(matchedSet)) {
    for (const miss of Array.from(missingSet)) {
      if (normalizeSkill(m) === normalizeSkill(miss) || candidateMatchesSkill(miss, [m])) {
        missingSet.delete(miss);
      }
    }
  }

  // 5. Process Nice to Have skills
  const reconciledNiceToHave: NiceToHaveSkill[] = [];
  const seenNice = new Set<string>();

  for (const item of rawNiceToHave) {
    const name = typeof item === "string" ? item.trim() : item?.name?.trim();
    if (!name) continue;

    const norm = normalizeSkill(name);
    if (seenNice.has(norm)) continue;
    seenNice.add(norm);

    // If nice-to-have was in missingSkills, remove it from missingSkills (keep under niceToHave!)
    missingSet.delete(name);

    const hasSkill = candidateMatchesSkill(name, candidateSkills);
    reconciledNiceToHave.push({ name, hasSkill });
  }

  // 6. Process Relevant Projects
  const sanitizedProjects: RelevantProject[] = [];
  if (Array.isArray(rawRelevantProjects)) {
    for (const proj of rawRelevantProjects) {
      if (!proj) continue;
      if (typeof proj === "string" && proj.trim()) {
        sanitizedProjects.push({
          projectTitle: proj.trim(),
          relevanceNote: "Directly demonstrates technologies and architectural patterns required for this position.",
        });
      } else if (typeof proj === "object" && proj.projectTitle) {
        sanitizedProjects.push({
          projectTitle: String(proj.projectTitle).trim(),
          relevanceNote: proj.relevanceNote
            ? String(proj.relevanceNote).trim()
            : "Demonstrates practical hands-on capability relevant to the job requirements.",
        });
      }
    }
  }

  // 7. Reconcile unmet requirements: strip out any requirement mentioning candidate's skills
  const verifiedUnmetRequirements = rawUnmetRequirements
    .map((r) => r.trim())
    .filter(Boolean)
    .filter((req) => !isUnmetRequirementContradictory(req, candidateSkills));

  // 8. Seniority Level Normalization
  let seniorityLevel: SeniorityMatchLevel = "Good Match";
  const rawSeniorityLower = (rawSeniorityLevel || "").toLowerCase();
  if (rawSeniorityLower.includes("significant") || rawSeniorityLower.includes("high gap") || rawSeniorityLower.includes("major")) {
    seniorityLevel = "Significant Gap";
  } else if (rawSeniorityLower.includes("slight") || rawSeniorityLower.includes("moderate") || rawSeniorityLower.includes("minor")) {
    seniorityLevel = "Slight Gap";
  }

  // 9. Recalculate match percentage deterministically
  const matchedList = Array.from(matchedSet);
  const missingList = Array.from(missingSet);

  const totalRequiredSkills = matchedList.length + missingList.length;
  let calculatedPercentage = Math.max(0, Math.min(100, Math.round(rawMatchPercentage || 0)));

  if (totalRequiredSkills > 0) {
    const skillRatio = matchedList.length / totalRequiredSkills;
    const baseScore = Math.round(skillRatio * 80);

    // Add bonus for nice-to-have skills candidate has (max +6%)
    const niceToHaveMatchedCount = reconciledNiceToHave.filter((n) => n.hasSkill).length;
    const niceBonus = Math.min(6, niceToHaveMatchedCount * 2);

    // Add bonus for strong matching experiences (max +6%)
    const expBonus = (rawMatchingExperience?.length || 0) >= 2 ? 6 : (rawMatchingExperience?.length || 0) * 3;

    // Add bonus for verified relevant projects directly demonstrating capability (max +8%)
    const projBonus = Math.min(8, (sanitizedProjects?.length || 0) * 3);

    if (missingList.length === 0 && verifiedUnmetRequirements.length === 0) {
      calculatedPercentage = Math.max(90, baseScore + niceBonus + expBonus + projBonus);
    } else if (missingList.length <= 1 && verifiedUnmetRequirements.length === 0) {
      calculatedPercentage = Math.max(85, baseScore + niceBonus + expBonus + projBonus);
    } else {
      calculatedPercentage = Math.max(baseScore + niceBonus + expBonus + projBonus, calculatedPercentage);
    }
  }

  // Penalize for genuine unmet hard requirements (e.g. lack of required years, degree, or clearance)
  if (verifiedUnmetRequirements.length > 0) {
    calculatedPercentage = Math.max(
      35,
      calculatedPercentage - verifiedUnmetRequirements.length * 10
    );
  }

  // Slight adjustment for seniority mismatch
  if (seniorityLevel === "Significant Gap") {
    calculatedPercentage = Math.min(calculatedPercentage, 65);
  } else if (seniorityLevel === "Slight Gap") {
    calculatedPercentage = Math.min(calculatedPercentage, 85);
  }

  calculatedPercentage = Math.max(0, Math.min(98, calculatedPercentage));

  // Determine Match Label
  let matchLabel = "Strong Match";
  if (calculatedPercentage >= 80) matchLabel = "Strong Match";
  else if (calculatedPercentage >= 65) matchLabel = "Good Match";
  else if (calculatedPercentage >= 50) matchLabel = "Moderate Match";
  else matchLabel = "Low Fit";

  // Determine Recommendation
  let recommendation: "apply" | "maybe" | "skip" = "maybe";
  if (calculatedPercentage >= 75) recommendation = "apply";
  else if (calculatedPercentage >= 50) recommendation = "maybe";
  else recommendation = "skip";

  return {
    matchedSkills: matchedList,
    missingSkills: missingList,
    unmetRequirements: verifiedUnmetRequirements,
    niceToHave: reconciledNiceToHave,
    matchingExperience: rawMatchingExperience.filter(Boolean),
    experienceGaps: rawExperienceGaps.filter(Boolean),
    relevantProjects: sanitizedProjects,
    seniorityLevel,
    seniorityAssessment: rawSeniorityAssessment || "Seniority aligns with target role.",
    keyStrengths: rawKeyStrengths.filter(Boolean),
    potentialGaps: rawPotentialGaps.filter(Boolean),
    matchPercentage: calculatedPercentage,
    matchLabel,
    recommendation,
  };
}
