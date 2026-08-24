export interface PredefinedSkill {
  name: string;
  icon: string;
}

// User's core suggestions catalog (displayed as quick chips)
export const PREDEFINED_SKILLS: PredefinedSkill[] = [
  // Languages
  { name: "HTML", icon: "logos:html-5" },
  { name: "CSS", icon: "logos:css-3" },
  { name: "JavaScript", icon: "logos:javascript" },
  { name: "TypeScript", icon: "logos:typescript-icon" },
  { name: "PHP", icon: "logos:php" },

  // Frameworks & libraries
  { name: "React", icon: "logos:react" },
  { name: "React Native", icon: "logos:react" },
  { name: "Next.js", icon: "logos:nextjs-icon" },
  { name: "Vue.js", icon: "logos:vue" },
  { name: "Alpine.js", icon: "logos:alpinejs-icon" },
  { name: "Express", icon: "skill-icons:expressjs-dark" },
  { name: "Laravel", icon: "logos:laravel" },
  { name: "Zustand", icon: "logos:react" },
  { name: "Tailwind CSS", icon: "logos:tailwindcss-icon" },
  { name: "Nativewind", icon: "logos:tailwindcss-icon" },
  { name: "Bootstrap", icon: "logos:bootstrap" },
  { name: "Vite", icon: "logos:vitejs" },

  // Backend & APIs
  { name: "Node.js", icon: "logos:nodejs-icon" },
  { name: "Firebase", icon: "logos:firebase" },
  { name: "Supabase", icon: "logos:supabase-icon" },
  { name: "Prisma", icon: "logos:prisma" },
  { name: "MySQL", icon: "logos:mysql-icon" },
  { name: "PostgreSQL", icon: "logos:postgresql" },
  { name: "REST", icon: "lucide:network" },
  { name: "OAuth", icon: "lucide:key" },
  { name: "JWT", icon: "logos:jwt-icon" },
  { name: "NextAuth", icon: "logos:auth0-icon" },
  { name: "Resend", icon: "logos:resend-icon" },

  // AI & LLMs
  { name: "Claude API", icon: "logos:anthropic-icon" },
  { name: "OpenAI API", icon: "logos:openai-icon" },
  { name: "Gemini API", icon: "logos:google-gemini" },
  { name: "Pinecone", icon: "logos:pinecone-icon" },

  // CMS & design
  { name: "WordPress", icon: "logos:wordpress-icon" },
  { name: "Statamic", icon: "logos:statamic-icon" },
  { name: "Hugo", icon: "logos:hugo" },
  { name: "Figma", icon: "logos:figma" },

  // Dev tools
  { name: "Git", icon: "logos:git-icon" },
  { name: "GitHub", icon: "logos:github-icon" },
  { name: "GitHub Actions", icon: "logos:github-actions" },
  { name: "GitLab", icon: "logos:gitlab" },
  { name: "VS Code", icon: "logos:visual-studio-code" },
  { name: "Cursor", icon: "logos:cursor" },
  { name: "Claude Code", icon: "logos:anthropic-icon" },
  { name: "ESLint", icon: "logos:eslint" },
  { name: "Prettier", icon: "logos:prettier" },
  { name: "Iconify", icon: "simple-icons:iconify" },
  { name: "Vercel", icon: "logos:vercel-icon" },
  { name: "Netlify", icon: "logos:netlify-icon" },

  // Collaboration
  { name: "Linear", icon: "logos:linear-icon" },
  { name: "Slack", icon: "logos:slack-icon" },
  { name: "Teams", icon: "logos:microsoft-teams" },
  { name: "Calendly", icon: "logos:calendly" },
];

// Extended comprehensive global tech stack dictionary for search autocomplete recommendations
export const EXTENDED_TECH_DICTIONARY: PredefinedSkill[] = [
  ...PREDEFINED_SKILLS,

  // Additional Languages
  { name: "Swift", icon: "logos:swift" },
  { name: "SwiftUI", icon: "logos:swift" },
  { name: "Kotlin", icon: "logos:kotlin-icon" },
  { name: "Python", icon: "logos:python" },
  { name: "Go", icon: "logos:go" },
  { name: "Rust", icon: "logos:rust" },
  { name: "Java", icon: "logos:java" },
  { name: "C++", icon: "logos:c-plusplus" },
  { name: "C#", icon: "logos:c-sharp" },
  { name: "C", icon: "logos:c" },
  { name: "Ruby", icon: "logos:ruby" },
  { name: "Dart", icon: "logos:dart" },
  { name: "Scala", icon: "logos:scala" },
  { name: "Elixir", icon: "logos:elixir" },
  { name: "R", icon: "logos:r-lang" },
  { name: "Solidity", icon: "logos:solidity" },
  { name: "Lua", icon: "logos:lua" },
  { name: "Haskell", icon: "logos:haskell-icon" },
  { name: "Objective-C", icon: "logos:apple" },
  { name: "Bash", icon: "logos:bash-icon" },
  { name: "SQL", icon: "logos:mysql-icon" },

  // Additional Frameworks & Libraries
  { name: "Flutter", icon: "logos:flutter" },
  { name: "Svelte", icon: "logos:svelte-icon" },
  { name: "SvelteKit", icon: "logos:svelte-icon" },
  { name: "Angular", icon: "logos:angular-icon" },
  { name: "Remix", icon: "logos:remix-icon" },
  { name: "Astro", icon: "logos:astro-icon" },
  { name: "Nuxt.js", icon: "logos:nuxt-icon" },
  { name: "NestJS", icon: "logos:nestjs" },
  { name: "Fastify", icon: "logos:fastify-icon" },
  { name: "Hono", icon: "logos:hono" },
  { name: "Django", icon: "logos:django-icon" },
  { name: "FastAPI", icon: "logos:fastapi-icon" },
  { name: "Flask", icon: "logos:flask" },
  { name: "Spring Boot", icon: "logos:spring-icon" },
  { name: "Ruby on Rails", icon: "logos:rails" },
  { name: "Redux", icon: "logos:redux" },
  { name: "Redux Toolkit", icon: "logos:redux" },
  { name: "TanStack Query", icon: "logos:react-query-icon" },
  { name: "TRPC", icon: "logos:trpc" },
  { name: "GraphQL", icon: "logos:graphql" },
  { name: "Apollo GraphQL", icon: "logos:apollo" },
  { name: "Sass", icon: "logos:sass" },
  { name: "Chakra UI", icon: "logos:chakraui" },
  { name: "MUI (Material-UI)", icon: "logos:material-ui" },
  { name: "shadcn/ui", icon: "logos:react" },
  { name: "Framer Motion", icon: "logos:framer" },
  { name: "Electron", icon: "logos:electron" },
  { name: "Tauri", icon: "logos:tauri" },
  { name: "Capacitor", icon: "logos:capacitorjs-icon" },
  { name: "Ionic", icon: "logos:ionic-icon" },

  // Additional Databases & Cloud & Backend
  { name: "MongoDB", icon: "logos:mongodb-icon" },
  { name: "Redis", icon: "logos:redis" },
  { name: "SQLite", icon: "logos:sqlite" },
  { name: "Drizzle ORM", icon: "logos:drizzle-icon" },
  { name: "TypeORM", icon: "logos:typeorm" },
  { name: "DynamoDB", icon: "logos:aws-dynamodb" },
  { name: "Cassandra", icon: "logos:cassandra" },
  { name: "Neo4j", icon: "logos:neo4j" },
  { name: "Elasticsearch", icon: "logos:elasticsearch" },
  { name: "Kafka", icon: "logos:kafka-icon" },
  { name: "RabbitMQ", icon: "logos:rabbitmq-icon" },
  { name: "Stripe", icon: "logos:stripe" },
  { name: "Twilio", icon: "logos:twilio-icon" },
  { name: "SendGrid", icon: "logos:sendgrid-icon" },
  { name: "Clerk", icon: "logos:clerk" },
  { name: "Auth0", icon: "logos:auth0-icon" },

  // AI & Data Science
  { name: "LangChain", icon: "logos:langchain-icon" },
  { name: "LlamaIndex", icon: "logos:anthropic-icon" },
  { name: "Hugging Face", icon: "logos:hugging-face-icon" },
  { name: "PyTorch", icon: "logos:pytorch-icon" },
  { name: "TensorFlow", icon: "logos:tensorflow" },
  { name: "Scikit-Learn", icon: "logos:scikit-learn" },
  { name: "Pandas", icon: "logos:pandas-icon" },
  { name: "NumPy", icon: "logos:numpy" },
  { name: "ChromaDB", icon: "logos:pinecone-icon" },
  { name: "Weaviate", icon: "logos:pinecone-icon" },
  { name: "Ollama", icon: "logos:ollama" },

  // DevOps & Cloud & Tools
  { name: "Docker", icon: "logos:docker-icon" },
  { name: "Kubernetes", icon: "logos:kubernetes" },
  { name: "AWS", icon: "logos:aws" },
  { name: "Google Cloud (GCP)", icon: "logos:google-cloud" },
  { name: "Microsoft Azure", icon: "logos:azure-icon" },
  { name: "Cloudflare", icon: "logos:cloudflare-icon" },
  { name: "Terraform", icon: "logos:terraform-icon" },
  { name: "Ansible", icon: "logos:ansible" },
  { name: "Linux", icon: "logos:linux-tux" },
  { name: "Nginx", icon: "logos:nginx" },
  { name: "Jest", icon: "logos:jest" },
  { name: "Vitest", icon: "logos:vitest" },
  { name: "Playwright", icon: "logos:playwright" },
  { name: "Cypress", icon: "logos:cypress-icon" },
  { name: "Postman", icon: "logos:postman-icon" },
  { name: "Webpack", icon: "logos:webpack" },
  { name: "Turborepo", icon: "logos:turborepo-icon" },

  // Design & CMS & Collaboration
  { name: "Adobe XD", icon: "logos:adobe-xd" },
  { name: "Adobe Photoshop", icon: "logos:adobe-photoshop" },
  { name: "Adobe Illustrator", icon: "logos:adobe-illustrator" },
  { name: "Blender", icon: "logos:blender" },
  { name: "Framer", icon: "logos:framer" },
  { name: "Storybook", icon: "logos:storybook-icon" },
  { name: "Contentful", icon: "logos:contentful" },
  { name: "Sanity", icon: "logos:sanity" },
  { name: "Strapi", icon: "logos:strapi-icon" },
  { name: "Ghost", icon: "logos:ghost-icon" },
  { name: "Notion", icon: "logos:notion-icon" },
  { name: "Jira", icon: "logos:jira" },
  { name: "Trello", icon: "logos:trello" },
  { name: "Asana", icon: "logos:asana-icon" },
  { name: "Discord", icon: "logos:discord-icon" },
  { name: "Zoom", icon: "logos:zoom-icon" },
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
