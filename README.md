# Kairo

> **AI Job Tracker & Career Copilot** — Track applications, analyze role compatibility with deterministic scoring, and generate tailored, ATS-ready resumes and cover letters grounded in your verified experience.

[![Live Demo](https://img.shields.io/badge/Demo-jobkairo.vercel.app-blue?style=for-the-badge&logo=vercel)](https://jobkairo.vercel.app/)
[![GitHub](https://img.shields.io/badge/GitHub-jamesapas%2Fkairo-181717?style=for-the-badge&logo=github)](https://github.com/jamesapas/kairo)

---

## Overview

**Kairo** is an intelligent career copilot and application tracking system built for modern job seekers. Instead of relying on disconnected spreadsheets or generic AI tools that hallucinate qualifications, Kairo serves as a single source of truth for your professional background. 

It pairs an 8-stage dual-view application dashboard (Kanban & Table) with an OpenAI-powered evaluation engine that matches your background against any job description. Kairo automatically generates role-tailored ATS resumes, executive cover letters, and recruiter outreach notes—with live editing controls and instant client-side PDF export.

---

## Key Features

### 1. Dual-View Application Dashboard
- **Kanban Board**: Drag-and-drop or move cards across 8 application stages: *Saved*, *Applied*, *Interviewing*, *Offer*, *Declined*, *No Response*, *Rejected*, and *Withdrawn*.
- **Data Table View**: Dense, sortable, and searchable table with multi-platform tags (`LinkedIn`, `Indeed`, `JobStreet`, `OnlineJobs.ph`, `Upwork`, etc.), workplace filters (`Remote`, `Hybrid`, `On-site`), and pinned jobs.
- **Pipeline Analytics & Streaks**: Real-time breakdown of active applications, interview rates, response metrics, and daily application streaks.
- **Guest Mode**: Full interactive preview allowing users to test features and inspect sample jobs before signing in.

### 2. AI Job Match Analysis (Grounded & Reconciled)
- **Objective Fit Scoring**: Generates a 0–100% compatibility rating with clear recommendations (*Apply*, *Maybe*, or *Skip*).
- **Skill Breakdown**: Distinguishes between matched skills, strictly missing skills, and nice-to-have requirements.
- **Deterministic Reconciliation**: Cross-references AI outputs against verified database records to eliminate hallucinations.
- **Seniority & Risk Assessment**: Analyzes experience alignment and highlights candidate strengths alongside potential interview risks.

### 3. Application Materials Generator
- **Single-Column ATS Resume**: Formats role-aligned headers, targeted professional summaries, and smartly grouped technical skills (cleanly separating languages, frameworks, backend, and developer tools).
- **Executive Cover Letters**: Produces structured, formal 4-paragraph cover letters with candidate headers, recipient blocks, and verified accomplishments.
- **Recruiter Outreach Notes**: Generates punchy 100–140 word messages tailored for LinkedIn messages or quick portal notes.

### 4. Interactive Resume Canvas & PDF Export
- **Live Customization**: Edit summaries, toggle recommended job-specific skills, and adjust project classifications (`Key Projects`, `Side Projects`, `Capstone Projects`) in real time.
- **Client-Side PDF Generation**: One-click download of print-ready ATS resumes and cover letters using `jsPDF`.

### 5. Career Profile (Source of Truth)
- Centralized management of career summaries, verified work history, projects, education, and skills.
- Custom avatar uploading powered by Supabase Storage.

---

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Server Actions, Route Handlers)
- **Library**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL, Row Level Security, Google OAuth, Storage)
- **AI / LLM**: [OpenAI API](https://openai.com/) (`gpt-4o-mini`)
- **Document Generation**: [jsPDF](https://github.com/parallax/jsPDF)
- **Icons & UI**: [Lucide React](https://lucide.dev/), [Iconify](https://iconify.design/), [nextjs-toploader](https://github.com/apal21/nextjs-toploader)
- **Deployment**: [Vercel](https://vercel.com/)

---

## Project Structure

```text
kairo/
├── app/
│   ├── (workspace)/          # Authenticated & guest workspace routes
│   │   ├── jobs/             # Job detail pages & drawer routes
│   │   ├── settings/         # Resume canvas & profile management
│   │   └── page.tsx          # Main dashboard (Kanban & Table)
│   ├── api/ai/               # AI endpoints (match analysis & materials generation)
│   │   ├── apply/route.ts
│   │   └── match/route.ts
│   └── layout.tsx            # Root layout with providers & themes
├── components/
│   ├── auth/                 # Auth modals & Google OAuth dialogs
│   ├── jobs/                 # Kanban, Table, Match Panel, Apply Materials Panel
│   ├── settings/             # Resume Canvas & profile editors
│   └── ui/                   # Reusable UI primitives
├── lib/
│   ├── actions/              # Next.js Server Actions (jobs, profile, experiences, etc.)
│   ├── supabase/             # Supabase browser, server, and middleware clients
│   └── utils/                # PDF generation, skill matcher, and resume helpers
├── supabase/
│   └── migrations/           # PostgreSQL migrations & RLS policies
└── types/                    # TypeScript interfaces for jobs, profile, and AI payloads
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer recommended)
- [npm](https://www.npmjs.com/), [pnpm](https://pnpm.io/), or [yarn](https://yarnpkg.com/)
- A [Supabase](https://supabase.com/) project
- An [OpenAI API](https://platform.openai.com/) key

### 1. Clone the Repository

```bash
git clone https://github.com/jamesapas/kairo.git
cd kairo
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
OPENAI_API_KEY=your-openai-api-key
```

### 4. Database Setup

Apply the SQL migrations located in `supabase/migrations/` to your Supabase PostgreSQL instance (via Supabase CLI or SQL Editor in the Supabase Dashboard).

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Scripts

- `npm run dev`: Starts the Next.js development server.
- `npm run build`: Builds the production bundle.
- `npm run start`: Starts the Next.js production server.
- `npm run lint`: Runs ESLint checks.

---

## License

This project is open-source and available under the [MIT License](LICENSE).
