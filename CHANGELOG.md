# Changelog

> **[中文版本](CHANGELOG_CN.md)**

All notable changes to this project will be documented in this file.

---

## [v1.6.5] — 2026-05-07

### Changed
- **Accessibility: filter buttons** — Added `role="radio"` + `aria-checked` to all filter buttons in skills page (collection, category, sort) and prompts page (category, difficulty, sort)
- **Accessibility: agent skill card** — Install command button now has `role="button"`, `tabIndex={0}`, `aria-label` (dynamic: shows "Copied" or "Copy install command for {name}"), and keyboard support (`Enter`/`Space`)
- **404 page enhanced** — Added search box (routes to `/skills?q=`), hot skills (3 AgentSkills), hot prompts (3 Templates), and browse buttons for skills/prompts
- **Delete account confirmation** — Danger zone now requires typing "DELETE" in an input field before the delete button activates; mismatch shows error toast

### Files Modified
- `src/app/skills/client.tsx` — `role="radio"` + `aria-checked` on collection, category, sort buttons
- `src/app/prompts/client.tsx` — `role="radio"` + `aria-checked` on category, difficulty, sort buttons
- `src/components/agent-skill/agent-skill-card.tsx` — Install command button a11y: `role`, `tabIndex`, `aria-label`, `onKeyDown`
- `src/app/not-found.tsx` — Full rewrite: search box, hot skills/prompts, browse buttons
- `src/components/profile/settings-tab.tsx` — DELETE confirmation input before account deletion
- `src/lib/i18n/types.ts` — `notFound.*` (5 new keys), `settings.deleteConfirmPrompt`, `settings.deleteConfirmMismatch`
- `src/lib/i18n/zh.ts` — 7 new translation keys
- `src/lib/i18n/en.ts` — 7 new translation keys

---

## [v1.6.4] — 2026-05-06

### Changed
- **Extended i18n coverage** — Additional 12 components now use `useI18n()`: submit page, submit/status page, activity timeline, my-comments/likes/favorites/submissions/usage-history tabs, toast component, footer trademark disclaimer
- **i18n keys expanded** — Added ~50 new translation keys across `submit`, `profile`, `footer`, `common`, `settings`, `comments`, `prompts`, `agentSkills` sections for complete bilingual support
- **Skill card badge overlap fix** — `AgentSkillCard`: name row now reserves `pr-20` right padding to prevent `Official` badge from overlapping with the `Popular` badge in the top-right corner
- **Comment section full i18n** — All hardcoded strings in `CommentSection` replaced with `t.comments.*` keys (toast messages, section header, placeholder, button, empty state)
- **Skills page collection i18n** — Collection names ("全部", "社区精选", "开发者工具", etc.) now use `t.agentSkills.collection*` keys
- **Prompts page difficulty i18n** — Difficulty filter labels ("新手友好", "进阶", "高级") now use `t.prompts.difficultyEasy/Medium/Hard` keys with stable `__all__` sentinel
- **Dead code removal** — Removed unused `agent-skill-section.tsx` and `trust-bar.tsx` files
- **Particle background accessibility** — `ParticleBackground` now detects `prefers-reduced-motion: reduce` and skips animation

### Files Modified
- `src/app/submit/client.tsx` — Full i18n for form, validation messages, success state
- `src/app/submit/status/client.tsx` — i18n for status labels, buttons, empty states
- `src/components/profile/activity-timeline.tsx` — Activity type labels via `getTypeConfig(t)` factory
- `src/components/profile/my-comments-tab.tsx` — Empty state text
- `src/components/profile/my-likes-tab.tsx` — Empty state text
- `src/components/profile/my-favorites-tab.tsx` — Empty state text
- `src/components/profile/my-submissions-tab.tsx` — Status labels via `getStatusConfig(t)` factory
- `src/components/profile/usage-history-tab.tsx` — Activity labels, empty state
- `src/components/ui/toast.tsx` — Localized `aria-label` for close button
- `src/components/layout/footer.tsx` — Trademark disclaimer via i18n
- `src/components/agent-skill/agent-skill-card.tsx` — Badge overlap fix
- `src/components/skill/comment-section.tsx` — Full i18n for all UI strings
- `src/components/shared/particle-bg.tsx` — prefers-reduced-motion detection
- `src/app/skills/client.tsx` — Collection filter labels i18n
- `src/app/prompts/client.tsx` — Difficulty filter labels i18n, stable key sentinel
- `src/lib/i18n/types.ts` — Added ~50 new keys across multiple sections
- `src/lib/i18n/zh.ts` — Added ~50 new keys
- `src/lib/i18n/en.ts` — Added ~50 new keys

### Removed
- `src/components/home/trust-bar.tsx` — Unused dead code
- `src/components/home/agent-skill-section.tsx` — Unused dead code

---

## [v1.6.3] — 2026-05-06

### Changed
- **Comprehensive i18n fix** — All 14 components with hardcoded Chinese strings now use `useI18n()` hook for full English/Chinese support. Affects: login, register, not-found, error, profile (tabs/header/stats/settings), admin dashboard, guide page, newsletter form, command palette, navbar aria-labels, create-from-upload skill types, and keyboard shortcuts command items
- **Guide page split** — `guide/page.tsx` converted from server component to `page.tsx` (server, metadata only) + `client.tsx` (client, i18n-aware rendering)
- **Accessibility: aria-labels** — Navbar search, theme toggle, language switch, mobile menu buttons now have localized `aria-label` attributes
- **Command palette i18n** — Navigation items and category labels now localized; `getCommandItems()` accepts `t` dictionary parameter

### Files Modified
- `src/app/login/client.tsx` — i18n for form labels and validation messages
- `src/app/register/client.tsx` — i18n for form labels and validation messages
- `src/app/not-found.tsx` — Added `"use client"` + i18n
- `src/app/error.tsx` — i18n for title/description/retry
- `src/app/profile/client.tsx` — Tab labels via `useI18n()`
- `src/components/profile/profile-header.tsx` — Join date, role labels
- `src/components/profile/stats-dashboard.tsx` — Stat labels
- `src/components/profile/settings-tab.tsx` — All 32 UI strings
- `src/app/admin/client.tsx` — All admin UI strings
- `src/app/guide/page.tsx` — Server component, metadata only
- `src/app/guide/client.tsx` — **New** — Client component with full i18n guide content
- `src/components/shared/newsletter-form.tsx` — Error messages, button labels
- `src/components/shared/command-palette.tsx` — Search placeholder, hints
- `src/components/layout/navbar.tsx` — 6 aria-labels + SheetTitle
- `src/components/skills/create-from-upload.tsx` — SKILL_TYPES array now uses i18n
- `src/hooks/use-keyboard-shortcuts.ts` — `getCommandItems()` accepts `t` param, localized labels
- `src/lib/i18n/types.ts` — Added `create.skillType*` keys
- `src/lib/i18n/zh.ts` — Added 7 skill type translations
- `src/lib/i18n/en.ts` — Added 7 skill type translations

---

## [v1.6.2] — 2026-05-06

### Changed
- **License switched to Apache-2.0** — from MIT; provides explicit patent grant protection
- **Disclaimer sections rewritten** — removed "learning project only" framing; added clear no-warranty statement linked to Apache 2.0; separated mock data notice, AI output disclaimer, and trademark notice
- **Layout widened to 1440px** — skill list and featured section now use `max-w-[1440px]` instead of `max-w-7xl` (1280px), reducing excessive side whitespace on large screens
- **4-column grid on xl screens** — skill cards, featured section, and homepage category cards now show 4 columns on 1440px+ screens (`xl:grid-cols-4`)
- **Table hydration fix** — MarkdownRenderer table rows now wrapped in `<thead>` and `<tbody>` to match browser DOM tree, eliminating React hydration warning
- **MarkdownRenderer rewrite** — Skill detail page README now renders properly: table separator rows (`|---|`) are skipped, tables render as `<table>` with header distinction, inline `**bold**` and `` `code` `` formatting processed in bullet points and numbered lists, not just in paragraphs
- **Agent Skill category system** — New `agent-skill-categories.ts` with 8 independent categories (Skills管理, Web开发, Web搜索, 多平台交互, 代码执行, 文件处理, 通讯协作, 数据分析); `skills/client.tsx` now uses the centralized category definitions instead of a hardcoded array
- **Homepage dual-category** — `CategoryCards` now dynamically shows Agent Skill categories or Prompt categories based on the active Tab; grid adapts to 4 columns for Agent (8 categories) vs 3 for Prompt (6 categories)
- **Tab state lifted** — `FeaturedSection` and `CategoryCards` now share tab state via `page.tsx`, so switching tabs updates both the card grid and the category section simultaneously
- **URL category filter** — `/skills?category=Web开发` now auto-selects the matching category filter on page load

### Files Modified
- `src/app/skills/[id]/client.tsx` — Full MarkdownRenderer rewrite: `InlineMarkdown` helper, `isTableSeparator` detection, table flush/render with `<table>` element
- `src/app/skills/client.tsx` — Uses `agentSkillCategories` from shared file, reads `category` query param via `useSearchParams()`
- `src/app/page.tsx` — Lifts `tab` state, passes to `FeaturedSection` and `CategoryCards`
- `src/components/home/featured-section.tsx` — Accepts `tab`/`onTabChange` props instead of managing own state
- `src/components/home/category-cards.tsx` — Accepts `tab` prop, renders `agentSkillCategories` or `categories` accordingly, uses 4-col grid on lg for Agent

### New Files
- `src/lib/agent-skill-categories.ts` — Centralized Agent Skill category definitions (8 categories)

---

## [v1.6.1] — 2026-05-06

### Changed
- **Guide page rewritten** — Now covers both Agent Skills and Prompt Templates with separate explanations, two-track quickstart, and dual CTA buttons
- **Trending page** — Now shows both Agent Skills and Prompt Templates with content type filter tabs (All / Agent / Prompt); items link to correct detail pages
- **Tag system** — `tag-utils.ts` now indexes Agent Skill tags alongside Prompt tags; tag detail page renders both `AgentSkillCard` and `SkillCard` in separate sections
- **Category detail pages** — Show both Agent Skills and Prompt Templates per category using a category mapping
- **Category listing page** — Shows preview cards from both content types
- **Footer** — Reorganized into 4 groups: Agent Skills + Prompts (top-level), Browse (categories/trending/tags), Resources, Community
- **Submit page** — Updated metadata to note Agent Skill submission is via the Skills page

### Files Modified
- `src/app/guide/page.tsx` — Full rewrite with dual-content sections
- `src/app/trending/client.tsx` — Unified Agent + Prompt data, content type filter tabs
- `src/app/categories/[slug]/client.tsx` — Added Agent Skill display per category
- `src/app/categories/page.tsx` — Shows both content types per category
- `src/app/tags/[tag]/page.tsx` — Updated to pass both prompts and agents
- `src/app/tags/[tag]/client.tsx` — Renders AgentSkillCard and SkillCard separately
- `src/app/submit/page.tsx` — Updated metadata
- `src/lib/tag-utils.ts` — Now indexes Agent Skills tags
- `src/lib/i18n/types.ts` — Added `browse` key to footer section
- `src/lib/i18n/zh.ts` — Added `browse` translation
- `src/lib/i18n/en.ts` — Added `browse` translation
- `src/components/layout/footer.tsx` — Reorganized link groups

---

## [v1.6.0] — 2026-05-06

### Changed
- **Homepage redesign** — Replaced 6 fragmented sections + 4 dividers with a cohesive 4-section layout:
  1. **Hero** — Inlined trust stats (skill count, template count, platform compatibility); primary CTA now smooth-scrolls to the Tab section instead of navigating away
  2. **Featured Section** — New Tab switcher ("Agent Skills" | "Prompt Templates") with pill-style buttons; shows 6 trending cards per tab with a "View All" link; replaces both `AgentSkillSection` and dual `SkillSection` blocks
  3. **Category Cards** — Title changed to "Explore Core Directions"; removed hardcoded per-slug marketing descriptions (uses `category.description` directly)
  4. **Testimonials** — Trimmed from 10 to 6 items for a tighter layout
- **TrustBar** removed from homepage (stats moved inline to Hero); file kept but no longer rendered
- **i18n** — Added `featuredTitle`, `featuredSubtitle`, `tabAgent`, `tabPrompt`, `exploreDirections` to `home` section

### Files Modified
- `src/app/page.tsx` — Rewritten: 4 sections instead of 6 + 4 dividers
- `src/components/home/hero.tsx` — Inline trust stats, CTA uses `scrollIntoView` for smooth scroll to `#featured-section`
- `src/components/home/category-cards.tsx` — Removed hardcoded `descriptions` record, changed title to `t.home.exploreDirections`
- `src/components/home/testimonials.tsx` — `.slice(0, 6)` to show 6 items
- `src/lib/i18n/types.ts` — Added 5 new keys to `home` section
- `src/lib/i18n/zh.ts` — Chinese translations for new keys
- `src/lib/i18n/en.ts` — English translations for new keys

### New Files
- `src/components/home/featured-section.tsx` — Tab switch component with Agent/Prompt toggle, 6-card grid, fade transition

---

## [v1.5.2] — 2026-05-06

### Added
- **Comment reply** — Reply button on each comment in skill detail page; clicking sets `replyTo` state, pre-fills `@username` in input, shows visual "replying to" indicator, and cancel button to clear reply state
- **Tag cloud search** — Real-time search input at the top of `/tags` page filters tags by name; tag count display shows filtered results
- **Newsletter unsubscribe** — "Manage Preferences" link appears after subscribing in the footer; clicking shows unsubscribe/cancel options; unsubscribed state persists via localStorage
- **Breadcrumb navigation** — Reusable `Breadcrumb` component; replaces back-links on skill detail, category detail, and tag detail pages
- **Native share on mobile** — Prompt detail page share button uses `navigator.share()` on mobile, falls back to clipboard copy on desktop
- **Command palette improvements** — Focus restoration on close, fade-in/slide-down animation
- **Page transitions** — Subtle 200ms opacity fade-in on route changes via `src/app/template.tsx`
- **OG images + canonical URLs** — Added `openGraph`, `twitter`, and `alternates.canonical` to root layout and all detail pages (skills, prompts, categories)
- **Loading skeletons** — Loading states for skills, skill detail, categories, trending, tags, and profile pages

### Changed
- **Particle background optimization** — Cached `getComputedStyle` with `MutationObserver` invalidation; halved particle count on mobile (15 vs 30); no longer re-reads CSS variables every frame
- **Profile avatar** — Replaced `<img>` with `next/image` `Image` component for optimized loading

### Files Modified
- `src/app/skills/[id]/client.tsx` — added reply functionality
- `src/app/tags/client.tsx` — added search input and tag count
- `src/components/shared/newsletter-form.tsx` — added manage preferences / unsubscribe flow
- `src/components/shared/particle-bg.tsx` — cached CSS variable read, mobile particle reduction, MutationObserver cleanup
- `src/components/profile/profile-header.tsx` — `<img>` → `<Image>` from next/image
- `src/app/layout.tsx` — added `metadataBase`, `openGraph`, `twitter`, `alternates`
- `src/app/skills/[id]/page.tsx` — added OG, twitter, canonical
- `src/app/prompts/[id]/page.tsx` — added OG, twitter, canonical
- `src/app/categories/[slug]/page.tsx` — added OG, twitter, canonical
- `src/lib/i18n/types.ts` — added `reply`, `cancelReply`, `replyingTo` to `comments`; added `searchPlaceholder`, `tagCount` to `tags`; added `unsubscribe`, `unsubscribeDesc`, `managePreferences` to `footer`
- `src/lib/i18n/zh.ts` — Chinese translations for new keys
- `src/lib/i18n/en.ts` — English translations for new keys
- `README.md` / `README_CN.md` — updated features table

### New Files
- `src/app/template.tsx` — page transition wrapper (CSS fade-in)
- `src/components/shared/breadcrumb.tsx` — reusable breadcrumb navigation
- `src/app/skills/loading.tsx` — skills list skeleton
- `src/app/skills/[id]/loading.tsx` — skill detail skeleton
- `src/app/categories/[slug]/loading.tsx` — category detail skeleton
- `src/app/trending/loading.tsx` — trending skeleton
- `src/app/tags/loading.tsx` — tags skeleton
- `src/app/profile/loading.tsx` — profile skeleton

---

## [v1.5.1] — 2026-05-06

### Added
- **Scroll-to-top button** — floating button appears after scrolling 400px, smooth-scrolls to top
- **Context-aware navbar search** — search now routes to `/skills?q=...` when on a skills page, `/prompts?q=...` otherwise (uses `usePathname()`)

### Files Modified
- `src/app/layout.tsx` — imported and rendered `<ScrollToTop />`
- `src/components/layout/navbar.tsx` — added `usePathname()`, search routes based on current path

### New Files
- `src/components/shared/scroll-to-top.tsx` — scroll-to-top floating button component

---

## [v1.5.0] — 2026-05-06

### Added
- **"New Skill" button** on Agent Skills page — dropdown with two create flows:
  - **Quick Create (Github Import)**: 3-step wizard — enter Github URL → mock parse skills → select and confirm. Saves `AgentSkill` to localStorage
  - **Custom Create (Local Upload)**: form with fields (English name, display name, source URL, owner, visibility, description, skill type, tags, icon picker, file upload). Saves `AgentSkill` to localStorage
- **"New Template" button** on Prompt Templates page — dropdown with two Prompt-specific create flows:
  - **Quick Create (Github Import)**: 3-step wizard parsing Github repos into `Skill` templates. Saves to `publishedPrompts` localStorage
  - **Custom Create (Manual Form)**: form with Prompt-specific fields (title, subtitle, description, category, difficulty, online/local prompts, version, tags). Saves `Skill` to `publishedPrompts` localStorage
- `publishedPrompts` storage key in `storage-keys.ts`
- `getPublishedPrompts()` helper in `mock-data.ts`
- Prompt-specific i18n keys for template creation (templateTitle, templateSubtitle, templateCategory, templateDifficulty, promptOnline, promptLocal, etc.)
- Reusable `CreateDropdown` component for both pages

### Changed
- **Removed `/publish` page** — standalone publish page deleted, replaced by in-page create buttons
- **Navigation back to 3 items** — removed "发布技能" from navbar
- **Footer** — removed "发布技能" link
- **Sitemap** — removed `/publish` route
- **Keyboard shortcuts** — removed "发布技能" command
- **Skill detail intro tab layout** — changed from `[280px_1fr]` to `[1fr_280px]`: README on left (80%), source/install sidebar on right (20%)
- **i18n** — `publish` section replaced with `create` section, added Prompt-specific create keys
- **README.md & README_CN.md** — updated project structure, pages, and features

### Files Modified
- `src/app/skills/client.tsx` — new header layout with create button, modal rendering
- `src/app/prompts/client.tsx` — new header with create button, merged published prompts
- `src/app/skills/[id]/client.tsx` — intro tab layout flipped (left README, right sidebar)
- `src/components/layout/navbar.tsx` — removed 4th nav link
- `src/components/layout/footer.tsx` — removed "发布技能" link
- `src/app/sitemap.ts` — removed `/publish`
- `src/hooks/use-keyboard-shortcuts.ts` — removed "发布技能" command
- `src/lib/i18n/types.ts` — `publish` → `create`, added Prompt-specific keys
- `src/lib/i18n/zh.ts` — updated translations
- `src/lib/i18n/en.ts` — updated translations
- `src/lib/storage-keys.ts` — added `publishedPrompts`
- `src/lib/mock-data.ts` — added `getPublishedPrompts()`
- `README.md` — updated structure, pages, features
- `README_CN.md` — updated structure, pages, features

### New Files
- `src/components/skills/create-dropdown.tsx` — reusable new button + dropdown
- `src/components/skills/create-from-github.tsx` — Github import wizard (Agent Skill)
- `src/components/skills/create-from-upload.tsx` — upload form (Agent Skill)
- `src/components/skills/create-from-github-prompt.tsx` — Github import wizard (Prompt)
- `src/components/skills/create-from-upload-prompt.tsx` — upload form (Prompt)

### Removed
- `src/app/publish/page.tsx` — standalone publish page
- `src/app/publish/client.tsx` — publish form component

---

## [v1.4.0] — 2026-05-05

### Added
- **Publish Skill Page** (`/publish`) — full form for publishing Agent Skills with: name, title, description, category, developer, install command, version, license, README editor (Markdown), dynamic file list (add/remove/toggle), demo input/output, tags
- Published skills saved to localStorage, viewable on skill detail page and skills list
- `getPublishedSkills()` and `getAllAgentSkills()` helper functions in `mock-agent-skills.ts`
- `publishedSkills` storage key in `storage-keys.ts`
- **Footer Reorganized** — 4 sections: Agent Skills (with /publish link), Prompt Templates (with categories/trending/tags), Resources, Community
- **Navbar** — "发布技能" added as 4th navigation link
- `/publish` route in sitemap and keyboard command palette
- i18n `publish` section with full Chinese/English translations

### Changed
- **README.md & README_CN.md** — rewritten to reflect dual-content architecture (Agent Skills marketplace + Prompt Template platform)
- Footer grid updated from 4 to 5 columns
- `getAgentSkillById` now checks both mock data and localStorage for user-published skills
- Skills list page includes user-published skills via `getPublishedSkills()`

### Files Modified
- `README.md` — full rewrite for dual-content architecture
- `README_CN.md` — full rewrite for dual-content architecture
- `src/components/layout/navbar.tsx` — added "发布技能" nav link
- `src/components/layout/footer.tsx` — reorganized link groups, 5-column grid
- `src/lib/i18n/types.ts` — added `publish` section to Dictionary
- `src/lib/i18n/zh.ts` — added `publish` Chinese translations
- `src/lib/i18n/en.ts` — added `publish` English translations
- `src/lib/mock-agent-skills.ts` — added `getPublishedSkills()`, `getAllAgentSkills()`, updated `getAgentSkillById`
- `src/lib/storage-keys.ts` — added `publishedSkills` key
- `src/app/skills/client.tsx` — includes published skills in list
- `src/app/sitemap.ts` — added `/publish` route
- `src/hooks/use-keyboard-shortcuts.ts` — added "发布技能" command

### New Files
- `src/app/publish/page.tsx` — server component with metadata
- `src/app/publish/client.tsx` — publish skill form component

---

## [v1.3.0] — 2026-05-05

### Added
- **3 New Categories** — Data Analysis (📊), Productivity (⚡), Creative Writing (✍️), expanding from 3 to 6 total categories
- **18 New Skill Templates** — 28 total skills covering SQL optimization, data cleaning, chart recommendations, data insights, meeting summaries, task planning, email batch generation, workflow automation, daily planning, story outlining, character building, worldbuilding, dialogue polishing, SEO blog optimization, social media strategy, React component generation, incident response, SWOT analysis
- **4 New Testimonials** — from data analysts, novelists, project managers, and educators
- **Pagination** — load-more button (12 per page) on skills marketplace
- **Prompt Engineering Guide** — new section on guide page covering Chain-of-Thought, Few-Shot, Role Prompting, Structured Output, and Self-Critique techniques
- **Better Results Tips** — practical before/after examples for improving AI outputs

### Changed
- **Category Cards** — dynamically rendered from data instead of hardcoded 3 cards; now shows all 6 categories in responsive grid
- **Hero Tagline** — updated to mention six core domains
- **Global Metadata** — description updated to cover all six categories
- **Skill Detail Like/Bookmark** — now properly persisted via localStorage (was reset on refresh)
- **CONTRIBUTING.md** — translated to English

### Files Modified
- `src/lib/theme.ts` — added 3 new category colors (amber, red, pink)
- `src/lib/categories.ts` — added 3 new category definitions
- `src/lib/mock-data.ts` — added 18 skills + 4 testimonials (~1800 new lines)
- `src/components/home/category-cards.tsx` — dynamic rendering from categories data
- `src/components/home/hero.tsx` — updated tagline
- `src/app/layout.tsx` — updated metadata description
- `src/app/skills/client.tsx` — added pagination
- `src/app/skills/[id]/client.tsx` — fixed like/bookmark persistence
- `src/app/guide/page.tsx` — added prompt engineering techniques section
- `README.md` — updated for 28 skills, 6 categories
- `README_CN.md` — updated for 28 skills, 6 categories
- `CONTRIBUTING.md` — translated to English

---

## [v1.2.0] — 2026-05-05

### Added
- **User Auth System** — localStorage-based login/register/logout with session persistence
- **Toast Notification System** — auto-dismiss notifications with deduplication logic
- **Like/Bookmark Persistence** — skill likes and bookmarks saved to localStorage, survive page refresh
- **Submit Form Validation & Persistence** — required field validation, min-length checks, submissions saved to localStorage with history list
- **URL-Synced Filters** — skill marketplace filters (category, difficulty, sort, query) synced to URL query params; shareable, supports browser back/forward
- **Navbar Auth State** — shows username + logout when logged in, login/register buttons when logged out; mobile Sheet menu synced
- **OAuth "Coming Soon" Toast** — Google/GitHub login buttons show toast notification
- **Proper 404 Handling** — `notFound()` for missing skills (`/skills/[id]`) and categories (`/categories/[slug]`)

### Fixed
- **Data Inconsistency** — removed hardcoded `skillCount` (15/12/13) from categories; hero badge and trust bar now show dynamic `skills.length` instead of "1284+"
- **Dead Links** — footer "Terms of Service" and "Privacy Policy" links now greyed out and non-interactive; login "Forgot password?" link disabled
- **Toast Deduplication** — rapid button clicks no longer stack duplicate toast notifications

### New Files
- `src/hooks/use-local-storage.ts` — generic localStorage hook with SSR-safe loading state
- `src/contexts/toast-context.tsx` — ToastProvider + useToast hook
- `src/contexts/auth-context.tsx` — AuthProvider + useAuth hook
- `src/components/ui/toast.tsx` — Toaster floating component

---

## [v1.1.0] — 2026-05-04

### Added
- **Custom 404 Page** — matches site dark theme with "return home" button
- **Sitemap** (`/sitemap.xml`) — auto-generated covering static pages, all skills, and categories
- **Robots.txt** (`/robots.txt`) — search engine crawling rules
- **Per-page Metadata** — `generateMetadata` for `/skills/[id]`, `/categories/[slug]`, `/guide`, `/login`, `/register`, `/submit`
- **JSON-LD Structured Data** — Article schema with AggregateRating on skill detail pages
- **Accessibility Improvements** — `role="radio"` + `aria-checked` on filter buttons, `aria-label` on icon buttons, `<caption>` on model table
- **Clipboard Error Handling** — try/catch on all `navigator.clipboard.writeText` calls
- **Loading Skeleton** — skill detail page loading state
- **Error Boundary** — global `error.tsx` with retry button

### Changed
- **Particle Animation Optimization** — `visibilitychange` listener pauses animation when tab hidden; particles reduced from 50 to 30; squared-distance optimization for connection lines
- **Navbar Search** — functional Enter-to-search with `aria-label` on buttons
- **Color Constants** — centralized in `src/lib/theme.ts`
- **Responsive Filter Bar** — mobile-first stacking with `md:` breakpoints
- **Before/After Section** — cyan gradient background for visual contrast
- **Skill Card Tags** — shows up to 3 tags as pills below subtitle
- **Homepage "View All" Link** — skill sections link to `/skills`
- **Trust Bar Stats** — highlighted values with semantic labels
- **Category Card Hover** — emoji icon scales on hover
- **Skill Detail Table** — `min-w-[600px]` prevents column compression on narrow viewports

### Fixed
- **Type Safety** — removed `as string` type assertions in page params
- **CSS Duplicates** — merged duplicate `body` rules in globals.css
- **Dead Code** — removed unused `searchSkills` function from mock-data

---

## [v1.0.0] — 2026-05-03

### Added
- Initial release
- Homepage with hero, trust bar, category cards, skill sections, testimonials
- Skill marketplace with search, category/difficulty filters, sort
- Skill detail page with one-click copy, variable fill, before/after comparison, usage steps, recommended models
- Category browse and detail pages
- Beginner guide page
- Submit template page
- Login and register pages (UI only)
- Particle background animation
- Responsive design (mobile-first)
- shadcn/ui component library integration
- 10 mock skill templates across 3 categories
- 6 mock user testimonials
