# AI Skills Hub — Agent Skills Marketplace + Prompt Template Platform

> **[中文文档](README_CN.md)**

> Discover executable Agent Skills and high-quality Prompt Templates · One-click install · Give AI real action power

Compatible with ChatGPT · Claude · Grok · DeepSeek · Qwen · LM Studio · Ollama and other mainstream platforms.

---

## Quick Start

### 1. Requirements

| Dependency | Minimum Version |
|------------|-----------------|
| Node.js | >= 18.0 |
| npm | >= 9.0 |

### 2. Install & Run

```bash
# Enter project directory
cd ai-skills-hub

# Install dependencies
npm install

# Start development server
npm run dev
```

Open http://localhost:3000 in your browser.

### 3. Production Build

```bash
# Build
npm run build

# Start production server
npm start
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| UI Library | shadcn/ui (Base UI) |
| Icons | Lucide React |
| Code Highlight | react-syntax-highlighter |
| File Download | JSZip + file-saver |
| Data | Local Mock Data (migratable to Supabase) |
| Deployment | Vercel (recommended) |

---

## Project Structure

```
ai-skills-hub/
├── src/
│   ├── app/                          # Next.js App Router pages
│   │   ├── layout.tsx                # Root layout (fonts, Navbar, Footer, particle bg)
│   │   ├── page.tsx                  # Homepage (Skills-first)
│   │   ├── globals.css               # Global styles + CSS variables + utilities
│   │   ├── skills/                   # Agent Skills marketplace
│   │   │   ├── page.tsx              # Skill list (search, filter, sort)
│   │   │   └── [id]/page.tsx         # Skill detail (intro/files/feedback tabs)
│   │   ├── prompts/                  # Prompt Templates
│   │   │   ├── page.tsx              # Prompt list
│   │   │   └── [id]/page.tsx         # Prompt detail
│   │   ├── categories/
│   │   │   ├── page.tsx              # Category browse (Prompt)
│   │   │   └── [slug]/page.tsx       # Category detail
│   │   ├── trending/page.tsx         # Trending (Prompt)
│   │   ├── tags/                     # Tag cloud (Prompt)
│   │   ├── guide/page.tsx            # Beginner guide
│   │   ├── submit/page.tsx           # Submit prompt template
│   │   ├── login/page.tsx            # Login
│   │   └── register/page.tsx         # Register
│   ├── components/
│   │   ├── ui/                       # shadcn/ui components
│   │   ├── layout/
│   │   │   ├── navbar.tsx            # Top navigation bar
│   │   │   └── footer.tsx            # Footer
│   │   ├── home/
│   │   │   ├── hero.tsx              # Hero section
│   │   │   ├── trust-bar.tsx         # Trust bar
│   │   │   ├── category-cards.tsx    # Six category entry cards
│   │   │   ├── skill-section.tsx     # Prompt skill section
│   │   │   ├── agent-skill-section.tsx # Agent skill section
│   │   │   └── testimonials.tsx      # User testimonials
│   │   ├── agent-skill/
│   │   │   └── agent-skill-card.tsx  # Agent skill marketplace card
│   │   ├── skills/
│   │   │   ├── create-dropdown.tsx   # New button + dropdown menu
│   │   │   ├── create-from-github.tsx # Github import wizard (Skill)
│   │   │   ├── create-from-upload.tsx # Upload form (Skill)
│   │   │   ├── create-from-github-prompt.tsx # Github import wizard (Prompt)
│   │   │   └── create-from-upload-prompt.tsx # Upload form (Prompt)
│   │   └── shared/
│   │       ├── particle-bg.tsx       # Particle background animation
│   │       └── scroll-to-top.tsx     # Scroll-to-top floating button
│   ├── contexts/
│   │   ├── toast-context.tsx         # Toast notification system
│   │   ├── auth-context.tsx          # Auth context (localStorage-based)
│   │   ├── theme-context.tsx         # Theme context (dark/light)
│   │   └── i18n-context.tsx          # i18n context (zh/en)
│   ├── hooks/
│   │   └── use-keyboard-shortcuts.ts # Command palette shortcuts
│   └── lib/
│       ├── types.ts                  # TypeScript type definitions
│       ├── mock-data.ts              # Prompt mock data (28 templates + 10 reviews)
│       ├── mock-agent-skills.ts      # Agent Skills mock data (8 skills)
│       ├── categories.ts             # Prompt category definitions (6 categories)
│       ├── agent-skill-categories.ts  # Agent Skill category definitions (8 categories)
│       ├── i18n/
│       │   ├── types.ts              # Dictionary type
│       │   ├── zh.ts                 # Chinese translations
│       │   └── en.ts                 # English translations
│       ├── theme.ts                  # Color/theme constants
│       └── utils.ts                  # Utility functions
├── public/                           # Static assets
├── package.json
├── tsconfig.json
└── components.json                   # shadcn/ui config
```

---

## Pages

### Homepage `/`
- Hero section: Skills-focused title + inline trust stats + CTA smooth-scrolls to Tab section
- **Featured Section**: Tab switcher ("Agent Skills" | "Prompt Templates") with 6 trending cards per tab
- Six core direction category cards
- User testimonials (6 curated reviews)

### Agent Skills Marketplace `/skills`
- Full-text search (name, title, description, triggers, tags)
- Sort by downloads / stars / newest
- Filter by collection and category
- Marketplace-grade cards: avatar, author, description, tags, stats, install command
- **New Skill** button with dropdown: Quick Create (Github import) or Custom Create (file upload)

### Agent Skill Detail `/skills/[id]`
- **Tab 1 — Skill Intro**: Left 80% README markdown rendering + Right 20% source/install sidebar (install command, download, metadata table)
- **Tab 2 — Skill Files**: File tree sidebar with file sizes, syntax-highlighted code viewer, per-file download, zip download all
- **Tab 3 — Feedback**: Comment input + community reviews with star ratings, likes, and reply support

### Prompt Templates `/prompts`
- Search, filter, sort prompt templates
- Category, difficulty, sort options
- **New Template** button with dropdown: Quick Create (Github import) or Custom Create (manual form)

### Prompt Detail `/prompts/[id]`
- Online/Local prompt versions
- Variable fill form
- Before/After comparison
- Usage instructions

### Other Pages
- `/categories` — Category browse (Prompt)
- `/categories/[slug]` — Category detail
- `/trending` — Trending prompts
- `/tags` — Tag cloud with search filter
- `/guide` — Beginner guide + prompt engineering tips
- `/submit` — Submit prompt template
- `/login` / `/register` — Auth (localStorage-based)

---

## Features

| Feature | Status | Description |
|---------|--------|-------------|
| Agent Skills marketplace | ✅ | Search, filter, sort, marketplace cards |
| Skill detail page | ✅ | 3-tab layout: intro, files, feedback |
| File download | ✅ | Single file + zip bundle download (JSZip) |
| Code highlighting | ✅ | react-syntax-highlighter with dark theme |
| Quick Create (Github) | ✅ | Import skills/templates from Github repo |
| Custom Create (Upload) | ✅ | Upload local files or fill prompt form |
| Prompt templates | ✅ | 28 templates, search, filter, sort |
| One-click prompt copy | ✅ | Online/Local versions, clipboard API |
| Variable fill | ✅ | Real-time prompt template update |
| User auth | ✅ | localStorage-based login/register/logout |
| Like/Bookmark | ✅ | Persisted via localStorage |
| i18n | ✅ | Chinese/English, context-based |
| Dark/Light theme | ✅ | System default + manual toggle |
| SEO | ✅ | Per-page metadata, OG, canonical URLs, sitemap, robots.txt, JSON-LD |
| Responsive design | ✅ | Mobile-first, Sheet drawer nav |
| Loading skeletons | ✅ | Skeleton screens for skills, detail, categories, trending, tags, profile |
| Breadcrumb navigation | ✅ | Reusable breadcrumb on detail pages |
| Native share | ✅ | navigator.share() on mobile, clipboard fallback on desktop |
| Page transitions | ✅ | CSS fade-in animation on route changes |
| Comment reply | ✅ | Reply to comments with @mention and visual indicator |
| Tag cloud search | ✅ | Real-time tag filtering by name with count display |
| Newsletter unsubscribe | ✅ | Manage preferences / unsubscribe from footer newsletter |
| Command palette | ✅ | Keyboard shortcuts with focus restore + animation |

---

## Data Structure

### AgentSkill

```typescript
interface AgentSkill {
  id: string;              // Unique identifier
  name: string;            // Skill name (e.g., "web-scraper")
  title: string;           // Display title
  description: string;     // One-line description
  avatar: string;          // Avatar emoji/icon
  author: string;          // Author name
  developer: string;       // Developer name
  downloads: number;       // Download count
  stars: number;           // Star count
  lastUpdated: string;     // Last update date
  collection: string;      // Collection name
  category: string;        // Category name
  installCommand: string;  // CLI install command
  readme: string;          // Markdown README
  license: string;         // License (MIT, Apache-2.0, etc.)
  version: string;         // Version string
  files: Record<string, string>;  // filename → content
  demoInput: string;       // Demo input
  demoOutput: string;      // Demo output
  triggers: string[];      // Trigger examples
  tags: string[];          // Tags
  featured: boolean;       // Featured flag
  trending: boolean;       // Trending flag
}
```

### Skill (Prompt Template)

```typescript
interface Skill {
  id: string;              // Unique identifier
  title: string;           // Title
  subtitle: string;        // One-line description
  category: string;        // Category name
  difficulty: "beginner" | "intermediate" | "advanced";
  rating: number;          // Rating (0-5)
  usageCount: number;      // Usage count
  promptOnline: string;    // Online prompt
  promptLocal: string;     // Local prompt
  // ... see src/lib/types.ts for all fields
}
```

---

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or connect the GitHub repo to [Vercel](https://vercel.com) for automatic deployment.

---

## License

Licensed under the [Apache License, Version 2.0](LICENSE).

---

## Disclaimer

**AI Skills Hub is a learning and educational project for studying modern web development technologies. It is not a production service, does not provide real commercial functionality, and should not be relied upon for any professional, commercial, or mission-critical use.**

### No Warranty

This software is provided "AS IS", WITHOUT WARRANTY OF ANY KIND, express or implied. See the [Apache License 2.0](LICENSE) for full details including Sections 7 (Disclaimer of Warranty) and 8 (Limitation of Liability).

### Project Nature

This is a **frontend learning project** built to demonstrate how to construct full-stack applications with Next.js, Tailwind CSS, shadcn/ui, and other modern web technologies. All functionality is for demonstration purposes only.

### Mock Data Disclaimer

**All data displayed in this project is entirely fictional and auto-generated.** This includes but is not limited to:

- Prompt templates, agent skills, and their descriptions
- User reviews, testimonials, comments, and ratings
- Download counts, star counts, usage statistics
- Author names, developer names, and avatars
- Collection names and category descriptions
- Demo input/output examples

**None of the above data represents real users, real products, real reviews, or real business metrics.** Any resemblance to actual persons, products, or events is purely coincidental.

### Third-Party Trademarks

The following are registered trademarks of their respective companies. This project has no affiliation, authorization, sponsorship, endorsement, or partnership with any of them. References are for identification and educational purposes only:

- ChatGPT, OpenAI — OpenAI, Inc.
- Claude, Anthropic — Anthropic, PBC
- Grok, xAI — xAI Corp.
- DeepSeek — DeepSeek
- Qwen, Alibaba — Alibaba Group
- Llama, Meta — Meta Platforms, Inc.
- Vercel, Next.js — Vercel Inc.
- GitHub, npm — GitHub, Inc. (Microsoft)

Any brand names, product names, or company names used in mock data (including but not limited to author fields, collection names, install commands, and demo output) are **entirely fictional and do not represent real endorsements or associations**. Mock install commands (e.g., `npx skills add @...`) are non-functional and should not be executed.

### AI Output Disclaimer

- The prompt templates and agent skills provided are **examples for learning purposes only** and do not guarantee accuracy, safety, or suitability of AI model outputs
- AI-generated content may contain errors, bias, or inappropriate information — users should judge independently
- Users bear full responsibility for any consequences from using prompt templates or agent skills

### Third-Party Services

This project may reference or interact with third-party APIs or services. Users should comply with the relevant terms of service. This project is not responsible for the behavior, availability, or accuracy of any third-party services.

### No Data Collection

This project does not collect, transmit, or store any user data on external servers. All user interactions (including login, bookmarks, likes, and newsletter subscriptions) are stored locally in the browser's `localStorage` only and are never sent to any server.

### Limitation of Liability

In no event shall the authors, contributors, or copyright holders be liable for any direct, indirect, incidental, special, exemplary, or consequential damages arising out of the use of this software.

---

> If this project helps you, a Star is appreciated. Nothing more, nothing less — no warranties expressed or implied.

### Acknowledgments

This project was built with the assistance of **MiMo V2.5-pro** model via **Claude Code**.

Special thanks to the **Xiaomi MiMo Orbit — Million Token Creator Incentive Program** for supporting this project. MiMo's strong reasoning capabilities and code generation efficiency provided the core momentum for rapid development.
