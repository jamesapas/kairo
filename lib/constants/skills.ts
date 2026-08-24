import { SkillCategory } from "@/types/skill";

export interface PredefinedSkill {
  name: string;
  category: SkillCategory;
  icon: string;
}

// User's core suggestions catalog (displayed as quick chips)
export const PREDEFINED_SKILLS: PredefinedSkill[] = [
  // Languages
  { name: "HTML", category: "Languages", icon: "logos:html-5" },
  { name: "CSS", category: "Languages", icon: "logos:css-3" },
  { name: "JavaScript", category: "Languages", icon: "logos:javascript" },
  { name: "TypeScript", category: "Languages", icon: "logos:typescript-icon" },
  { name: "PHP", category: "Languages", icon: "logos:php" },

  // Frameworks & libraries
  { name: "React", category: "Frameworks & Libraries", icon: "logos:react" },
  { name: "React Native", category: "Frameworks & Libraries", icon: "logos:react" },
  { name: "Next.js", category: "Frameworks & Libraries", icon: "logos:nextjs-icon" },
  { name: "Vue.js", category: "Frameworks & Libraries", icon: "logos:vue" },
  { name: "Alpine.js", category: "Frameworks & Libraries", icon: "logos:alpinejs-icon" },
  { name: "Express", category: "Frameworks & Libraries", icon: "skill-icons:expressjs-dark" },
  { name: "Laravel", category: "Frameworks & Libraries", icon: "logos:laravel" },
  { name: "Zustand", category: "Frameworks & Libraries", icon: "logos:react" },
  { name: "Tailwind CSS", category: "Frameworks & Libraries", icon: "logos:tailwindcss-icon" },
  { name: "Nativewind", category: "Frameworks & Libraries", icon: "logos:tailwindcss-icon" },
  { name: "Bootstrap", category: "Frameworks & Libraries", icon: "logos:bootstrap" },
  { name: "Vite", category: "Frameworks & Libraries", icon: "logos:vitejs" },

  // Backend & APIs
  { name: "Node.js", category: "Backend & APIs", icon: "logos:nodejs-icon" },
  { name: "Firebase", category: "Backend & APIs", icon: "logos:firebase" },
  { name: "Supabase", category: "Backend & APIs", icon: "logos:supabase-icon" },
  { name: "Prisma", category: "Backend & APIs", icon: "logos:prisma" },
  { name: "MySQL", category: "Backend & APIs", icon: "logos:mysql-icon" },
  { name: "PostgreSQL", category: "Backend & APIs", icon: "logos:postgresql" },
  { name: "REST", category: "Backend & APIs", icon: "lucide:network" },
  { name: "OAuth", category: "Backend & APIs", icon: "lucide:key" },
  { name: "JWT", category: "Backend & APIs", icon: "logos:jwt-icon" },
  { name: "NextAuth", category: "Backend & APIs", icon: "logos:auth0-icon" },
  { name: "Resend", category: "Backend & APIs", icon: "logos:resend-icon" },

  // AI & LLMs
  { name: "Claude API", category: "AI & LLMs", icon: "logos:anthropic-icon" },
  { name: "OpenAI API", category: "AI & LLMs", icon: "logos:openai-icon" },
  { name: "Gemini API", category: "AI & LLMs", icon: "logos:google-gemini" },
  { name: "Pinecone", category: "AI & LLMs", icon: "logos:pinecone-icon" },

  // CMS & design
  { name: "WordPress", category: "CMS & Design", icon: "logos:wordpress-icon" },
  { name: "Statamic", category: "CMS & Design", icon: "logos:statamic-icon" },
  { name: "Hugo", category: "CMS & Design", icon: "logos:hugo" },
  { name: "Figma", category: "CMS & Design", icon: "logos:figma" },

  // Dev tools
  { name: "Git", category: "Dev Tools", icon: "logos:git-icon" },
  { name: "GitHub", category: "Dev Tools", icon: "logos:github-icon" },
  { name: "GitHub Actions", category: "Dev Tools", icon: "logos:github-actions" },
  { name: "GitLab", category: "Dev Tools", icon: "logos:gitlab" },
  { name: "VS Code", category: "Dev Tools", icon: "logos:visual-studio-code" },
  { name: "Cursor", category: "Dev Tools", icon: "logos:cursor" },
  { name: "Claude Code", category: "Dev Tools", icon: "logos:anthropic-icon" },
  { name: "ESLint", category: "Dev Tools", icon: "logos:eslint" },
  { name: "Prettier", category: "Dev Tools", icon: "logos:prettier" },
  { name: "Iconify", category: "Dev Tools", icon: "simple-icons:iconify" },
  { name: "Vercel", category: "Dev Tools", icon: "logos:vercel-icon" },
  { name: "Netlify", category: "Dev Tools", icon: "logos:netlify-icon" },

  // Collaboration
  { name: "Linear", category: "Collaboration", icon: "logos:linear-icon" },
  { name: "Slack", category: "Collaboration", icon: "logos:slack-icon" },
  { name: "Teams", category: "Collaboration", icon: "logos:microsoft-teams" },
  { name: "Calendly", category: "Collaboration", icon: "logos:calendly" },
];

// Extended comprehensive global tech stack dictionary for search autocomplete recommendations
export const EXTENDED_TECH_DICTIONARY: PredefinedSkill[] = [
  ...PREDEFINED_SKILLS,

  // Additional Languages
  { name: "Swift", category: "Languages", icon: "logos:swift" },
  { name: "SwiftUI", category: "Frameworks & Libraries", icon: "logos:swift" },
  { name: "Kotlin", category: "Languages", icon: "logos:kotlin-icon" },
  { name: "Python", category: "Languages", icon: "logos:python" },
  { name: "Go", category: "Languages", icon: "logos:go" },
  { name: "Rust", category: "Languages", icon: "logos:rust" },
  { name: "Java", category: "Languages", icon: "logos:java" },
  { name: "C++", category: "Languages", icon: "logos:c-plusplus" },
  { name: "C#", category: "Languages", icon: "logos:c-sharp" },
  { name: "C", category: "Languages", icon: "logos:c" },
  { name: "Ruby", category: "Languages", icon: "logos:ruby" },
  { name: "Dart", category: "Languages", icon: "logos:dart" },
  { name: "Scala", category: "Languages", icon: "logos:scala" },
  { name: "Elixir", category: "Languages", icon: "logos:elixir" },
  { name: "R", category: "Languages", icon: "logos:r-lang" },
  { name: "Solidity", category: "Languages", icon: "logos:solidity" },
  { name: "Lua", category: "Languages", icon: "logos:lua" },
  { name: "Haskell", category: "Languages", icon: "logos:haskell-icon" },
  { name: "Objective-C", category: "Languages", icon: "logos:apple" },
  { name: "Bash", category: "Languages", icon: "logos:bash-icon" },
  { name: "SQL", category: "Languages", icon: "logos:mysql-icon" },

  // Additional Frameworks & Libraries
  { name: "Flutter", category: "Frameworks & Libraries", icon: "logos:flutter" },
  { name: "Svelte", category: "Frameworks & Libraries", icon: "logos:svelte-icon" },
  { name: "SvelteKit", category: "Frameworks & Libraries", icon: "logos:svelte-icon" },
  { name: "Angular", category: "Frameworks & Libraries", icon: "logos:angular-icon" },
  { name: "Remix", category: "Frameworks & Libraries", icon: "logos:remix-icon" },
  { name: "Astro", category: "Frameworks & Libraries", icon: "logos:astro-icon" },
  { name: "Nuxt.js", category: "Frameworks & Libraries", icon: "logos:nuxt-icon" },
  { name: "NestJS", category: "Frameworks & Libraries", icon: "logos:nestjs" },
  { name: "Fastify", category: "Frameworks & Libraries", icon: "logos:fastify-icon" },
  { name: "Hono", category: "Frameworks & Libraries", icon: "logos:hono" },
  { name: "Django", category: "Frameworks & Libraries", icon: "logos:django-icon" },
  { name: "FastAPI", category: "Frameworks & Libraries", icon: "logos:fastapi-icon" },
  { name: "Flask", category: "Frameworks & Libraries", icon: "logos:flask" },
  { name: "Spring Boot", category: "Frameworks & Libraries", icon: "logos:spring-icon" },
  { name: "Ruby on Rails", category: "Frameworks & Libraries", icon: "logos:rails" },
  { name: "Redux", category: "Frameworks & Libraries", icon: "logos:redux" },
  { name: "Redux Toolkit", category: "Frameworks & Libraries", icon: "logos:redux" },
  { name: "TanStack Query", category: "Frameworks & Libraries", icon: "logos:react-query-icon" },
  { name: "TRPC", category: "Frameworks & Libraries", icon: "logos:trpc" },
  { name: "GraphQL", category: "Frameworks & Libraries", icon: "logos:graphql" },
  { name: "Apollo GraphQL", category: "Frameworks & Libraries", icon: "logos:apollo" },
  { name: "Sass", category: "Frameworks & Libraries", icon: "logos:sass" },
  { name: "Chakra UI", category: "Frameworks & Libraries", icon: "logos:chakraui" },
  { name: "MUI (Material-UI)", category: "Frameworks & Libraries", icon: "logos:material-ui" },
  { name: "shadcn/ui", category: "Frameworks & Libraries", icon: "logos:react" },
  { name: "Framer Motion", category: "Frameworks & Libraries", icon: "logos:framer" },
  { name: "Electron", category: "Frameworks & Libraries", icon: "logos:electron" },
  { name: "Tauri", category: "Frameworks & Libraries", icon: "logos:tauri" },
  { name: "Capacitor", category: "Frameworks & Libraries", icon: "logos:capacitorjs-icon" },
  { name: "Ionic", category: "Frameworks & Libraries", icon: "logos:ionic-icon" },

  // Additional Databases & Cloud & Backend
  { name: "MongoDB", category: "Backend & APIs", icon: "logos:mongodb-icon" },
  { name: "Redis", category: "Backend & APIs", icon: "logos:redis" },
  { name: "SQLite", category: "Backend & APIs", icon: "logos:sqlite" },
  { name: "Drizzle ORM", category: "Backend & APIs", icon: "logos:drizzle-icon" },
  { name: "TypeORM", category: "Backend & APIs", icon: "logos:typeorm" },
  { name: "DynamoDB", category: "Backend & APIs", icon: "logos:aws-dynamodb" },
  { name: "Cassandra", category: "Backend & APIs", icon: "logos:cassandra" },
  { name: "Neo4j", category: "Backend & APIs", icon: "logos:neo4j" },
  { name: "Elasticsearch", category: "Backend & APIs", icon: "logos:elasticsearch" },
  { name: "Kafka", category: "Backend & APIs", icon: "logos:kafka-icon" },
  { name: "RabbitMQ", category: "Backend & APIs", icon: "logos:rabbitmq-icon" },
  { name: "Stripe", category: "Backend & APIs", icon: "logos:stripe" },
  { name: "Twilio", category: "Backend & APIs", icon: "logos:twilio-icon" },
  { name: "SendGrid", category: "Backend & APIs", icon: "logos:sendgrid-icon" },
  { name: "Clerk", category: "Backend & APIs", icon: "logos:clerk" },
  { name: "Auth0", category: "Backend & APIs", icon: "logos:auth0-icon" },

  // AI & Data Science
  { name: "LangChain", category: "AI & LLMs", icon: "logos:langchain-icon" },
  { name: "LlamaIndex", category: "AI & LLMs", icon: "logos:anthropic-icon" },
  { name: "Hugging Face", category: "AI & LLMs", icon: "logos:hugging-face-icon" },
  { name: "PyTorch", category: "AI & LLMs", icon: "logos:pytorch-icon" },
  { name: "TensorFlow", category: "AI & LLMs", icon: "logos:tensorflow" },
  { name: "Scikit-Learn", category: "AI & LLMs", icon: "logos:scikit-learn" },
  { name: "Pandas", category: "AI & LLMs", icon: "logos:pandas-icon" },
  { name: "NumPy", category: "AI & LLMs", icon: "logos:numpy" },
  { name: "ChromaDB", category: "AI & LLMs", icon: "logos:pinecone-icon" },
  { name: "Weaviate", category: "AI & LLMs", icon: "logos:pinecone-icon" },
  { name: "Ollama", category: "AI & LLMs", icon: "logos:ollama" },

  // DevOps & Cloud & Tools
  { name: "Docker", category: "Dev Tools", icon: "logos:docker-icon" },
  { name: "Kubernetes", category: "Dev Tools", icon: "logos:kubernetes" },
  { name: "AWS", category: "Dev Tools", icon: "logos:aws" },
  { name: "Google Cloud (GCP)", category: "Dev Tools", icon: "logos:google-cloud" },
  { name: "Microsoft Azure", category: "Dev Tools", icon: "logos:azure-icon" },
  { name: "Cloudflare", category: "Dev Tools", icon: "logos:cloudflare-icon" },
  { name: "Terraform", category: "Dev Tools", icon: "logos:terraform-icon" },
  { name: "Ansible", category: "Dev Tools", icon: "logos:ansible" },
  { name: "Linux", category: "Dev Tools", icon: "logos:linux-tux" },
  { name: "Nginx", category: "Dev Tools", icon: "logos:nginx" },
  { name: "Jest", category: "Dev Tools", icon: "logos:jest" },
  { name: "Vitest", category: "Dev Tools", icon: "logos:vitest" },
  { name: "Playwright", category: "Dev Tools", icon: "logos:playwright" },
  { name: "Cypress", category: "Dev Tools", icon: "logos:cypress-icon" },
  { name: "Postman", category: "Dev Tools", icon: "logos:postman-icon" },
  { name: "Webpack", category: "Dev Tools", icon: "logos:webpack" },
  { name: "Turborepo", category: "Dev Tools", icon: "logos:turborepo-icon" },

  // Design & CMS & Collaboration
  { name: "Adobe XD", category: "CMS & Design", icon: "logos:adobe-xd" },
  { name: "Adobe Photoshop", category: "CMS & Design", icon: "logos:adobe-photoshop" },
  { name: "Adobe Illustrator", category: "CMS & Design", icon: "logos:adobe-illustrator" },
  { name: "Blender", category: "CMS & Design", icon: "logos:blender" },
  { name: "Framer", category: "CMS & Design", icon: "logos:framer" },
  { name: "Storybook", category: "CMS & Design", icon: "logos:storybook-icon" },
  { name: "Contentful", category: "CMS & Design", icon: "logos:contentful" },
  { name: "Sanity", category: "CMS & Design", icon: "logos:sanity" },
  { name: "Strapi", category: "CMS & Design", icon: "logos:strapi-icon" },
  { name: "Ghost", category: "CMS & Design", icon: "logos:ghost-icon" },
  { name: "Notion", category: "Collaboration", icon: "logos:notion-icon" },
  { name: "Jira", category: "Collaboration", icon: "logos:jira" },
  { name: "Trello", category: "Collaboration", icon: "logos:trello" },
  { name: "Asana", category: "Collaboration", icon: "logos:asana-icon" },
  { name: "Discord", category: "Collaboration", icon: "logos:discord-icon" },
  { name: "Zoom", category: "Collaboration", icon: "logos:zoom-icon" },
];

export function searchSkillSuggestions(
  query: string,
  existingSkillNames: string[] = [],
  limit = 8
): PredefinedSkill[] {
  const clean = query.toLowerCase().trim();
  if (!clean) return [];

  const existingSet = new Set(existingSkillNames.map((s) => s.toLowerCase()));

  // Deduplicate dictionary entries by name
  const seen = new Set<string>();
  const results: PredefinedSkill[] = [];

  // 1. Exact prefix matches first (e.g. "swi" -> "Swift", "SwiftUI")
  for (const item of EXTENDED_TECH_DICTIONARY) {
    const lower = item.name.toLowerCase();
    if (seen.has(lower) || existingSet.has(lower)) continue;

    if (lower.startsWith(clean)) {
      seen.add(lower);
      results.push(item);
      if (results.length >= limit) return results;
    }
  }

  // 2. Substring matches second
  for (const item of EXTENDED_TECH_DICTIONARY) {
    const lower = item.name.toLowerCase();
    if (seen.has(lower) || existingSet.has(lower)) continue;

    if (lower.includes(clean)) {
      seen.add(lower);
      results.push(item);
      if (results.length >= limit) return results;
    }
  }

  return results;
}

export function detectSkillCategory(name: string): SkillCategory {
  const lower = name.toLowerCase().trim();
  const match = EXTENDED_TECH_DICTIONARY.find(
    (s) => s.name.toLowerCase() === lower || lower.includes(s.name.toLowerCase())
  );
  if (match) return match.category;

  if (lower.includes("api") || lower.includes("llm") || lower.includes("gpt") || lower.includes("claude") || lower.includes("ai")) {
    return "AI & LLMs";
  }
  if (lower.includes("css") || lower.includes("js") || lower.includes("script") || lower.includes("lang") || lower === "sql") {
    return "Languages";
  }
  if (lower.includes("db") || lower.includes("sql") || lower.includes("auth") || lower.includes("server") || lower.includes("backend")) {
    return "Backend & APIs";
  }
  if (lower.includes("ui") || lower.includes("design") || lower.includes("cms")) {
    return "CMS & Design";
  }
  if (lower.includes("tool") || lower.includes("ci") || lower.includes("cd") || lower.includes("lint") || lower.includes("cloud")) {
    return "Dev Tools";
  }
  if (lower.includes("chat") || lower.includes("meet") || lower.includes("collab") || lower.includes("task")) {
    return "Collaboration";
  }

  return "Frameworks & Libraries";
}

export function getSkillIcon(name: string): string {
  const lower = name.toLowerCase().trim();
  const match = EXTENDED_TECH_DICTIONARY.find(
    (s) => s.name.toLowerCase() === lower || lower === s.name.toLowerCase()
  );
  if (match) return match.icon;

  // Fallback pattern matching
  if (lower.includes("swift")) return "logos:swift";
  if (lower.includes("kotlin")) return "logos:kotlin-icon";
  if (lower.includes("flutter")) return "logos:flutter";
  if (lower.includes("typescript") || lower === "ts") return "logos:typescript-icon";
  if (lower.includes("javascript") || lower === "js") return "logos:javascript";
  if (lower.includes("next")) return "logos:nextjs-icon";
  if (lower.includes("react")) return "logos:react";
  if (lower.includes("vue")) return "logos:vue";
  if (lower.includes("svelte")) return "logos:svelte-icon";
  if (lower.includes("alpine")) return "logos:alpinejs-icon";
  if (lower.includes("node")) return "logos:nodejs-icon";
  if (lower.includes("python")) return "logos:python";
  if (lower.includes("php")) return "logos:php";
  if (lower.includes("rust")) return "logos:rust";
  if (lower.includes("golang") || lower === "go") return "logos:go";
  if (lower.includes("java") && !lower.includes("script")) return "logos:java";
  if (lower.includes("c++") || lower === "cpp") return "logos:c-plusplus";
  if (lower.includes("c#") || lower === "csharp" || lower === "cs") return "logos:c-sharp";
  if (lower.includes("ruby")) return "logos:ruby";
  if (lower.includes("html")) return "logos:html-5";
  if (lower.includes("css")) return "logos:css-3";
  if (lower.includes("tailwind")) return "logos:tailwindcss-icon";
  if (lower.includes("supabase")) return "logos:supabase-icon";
  if (lower.includes("firebase")) return "logos:firebase";
  if (lower.includes("postgres")) return "logos:postgresql";
  if (lower.includes("mysql")) return "logos:mysql-icon";
  if (lower.includes("prisma")) return "logos:prisma";
  if (lower.includes("docker")) return "logos:docker-icon";
  if (lower.includes("kubernetes") || lower === "k8s") return "logos:kubernetes";
  if (lower.includes("aws")) return "logos:aws";
  if (lower.includes("claude") || lower.includes("anthropic")) return "logos:anthropic-icon";
  if (lower.includes("openai") || lower.includes("gpt")) return "logos:openai-icon";
  if (lower.includes("gemini")) return "logos:google-gemini";
  if (lower.includes("pinecone")) return "logos:pinecone-icon";
  if (lower.includes("wordpress")) return "logos:wordpress-icon";
  if (lower.includes("statamic")) return "logos:statamic-icon";
  if (lower.includes("hugo")) return "logos:hugo";
  if (lower.includes("figma")) return "logos:figma";
  if (lower.includes("git")) return "logos:git-icon";
  if (lower.includes("github")) return "logos:github-icon";
  if (lower.includes("gitlab")) return "logos:gitlab";
  if (lower.includes("vscode") || lower.includes("vs code")) return "logos:visual-studio-code";
  if (lower.includes("cursor")) return "logos:cursor";
  if (lower.includes("eslint")) return "logos:eslint";
  if (lower.includes("prettier")) return "logos:prettier";
  if (lower.includes("iconify")) return "simple-icons:iconify";
  if (lower.includes("vercel")) return "logos:vercel-icon";
  if (lower.includes("netlify")) return "logos:netlify-icon";
  if (lower.includes("linear")) return "logos:linear-icon";
  if (lower.includes("slack")) return "logos:slack-icon";
  if (lower.includes("teams")) return "logos:microsoft-teams";
  if (lower.includes("calendly")) return "logos:calendly";

  return "lucide:sparkles";
}
