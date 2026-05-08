# Changelog

> **[中文版本](CHANGELOG_CN.md)**

All notable changes to this project will be documented in this file.

---

## [v2.1.1] — 2026-05-08

### Critical Bug Fixes
- **Dark mode broken** — `:root body` light gradient had same specificity as `.dark body` and appeared later in cascade, always overriding dark styles. Fixed by using `:root:not(.dark)` for all light-mode-only selectors (`:root`, `:root .glass-card`, `:root .glass-card-hover:hover`, `:root body`)
- **Onboarding tooltip empty box** — Step 2/3 showed an invisible box because `positionTooltip` silently returned when target element IDs were off-screen. Added `scrollIntoView` + `requestAnimationFrame` for reliable positioning, and a center-screen fallback when elements not found
- **Toast hardcoded colors** — Replaced `#00d4ff`, `#8b949e`, `text-white` with theme tokens (`text-primary`, `text-muted-foreground`, `text-foreground`) so toasts are readable in both themes

### Bug Fixes
- **Avatar crop dialog** — `getContext("2d")!` non-null assertion could cause promise to hang forever if canvas unavailable. Added proper null check with reject. Added error logging instead of silent catch
- **Navbar keyboard nav** — Arrow key navigation in "more" dropdown could crash with `% 0` modulo when menu items list was empty. Added `items.length === 0` guard
- **Notification bell focus** — `activeIdx` could exceed `items.length` after notifications were deleted while menu was open. Added bounds check

---

## [v2.1.0] — 2026-05-08

### Bug Fixes
- **`error.tsx` deprecated API** — `unstable_retry` replaced with `reset()` (Next.js 16 breaking change)
- **Auth password migration** — Old passwords no longer stored as plaintext in `passwordHash`; migration now hashes immediately via `hashPassword()`
- **Notification `unreadCount` sync** — Removed `setUnreadCount` calls inside `setNotifications` updater (anti-pattern in concurrent mode); now derived via `useEffect`
- **Prompt Playground `{var}` fix** — `buildPrompt` now replaces both `{{var}}` and `{var}` formats; previously `{var}` variables were detected but never substituted
- **Sitemap agent categories** — Added agent skill category entries (`/skills?category=...`) to sitemap generation

### Features
- **Homepage RSC** — Removed `"use client"` from `page.tsx`; tab state moved to new `HomeContent` client component; `ParticleBackground` lazy-loaded via `dynamic({ ssr: false })`, reducing initial JS bundle
- **Mobile search in Sheet** — Navbar mobile drawer now includes a search input at the top, routing to `/search?q=...`
- **Search pagination** — Search results now show 8 items initially with "Load More" button; resets on query change
- **Fuzzy search** — Search page now splits query into words and matches all tokens (AND logic), providing typo tolerance
- **Infinite scroll prep** — Skills page "Load More" button with Intersection Observer pattern
- **Prompts active filters** — Prompt list page now shows removable filter tags above results, matching the skills page pattern
- **Comment "edited" mark** — Edited comments display `(edited)` badge next to the timestamp
- **Comment activity sync** — Deleting a comment now also removes the corresponding activity record
- **Comment pagination** — Comments section shows 10 initially with "Load More" button
- **Guide code copy** — Code examples on the guide page now have a one-click copy button in the top-right corner
- **Login forgot password toast** — "Forgot password" span now shows a "Coming soon" toast on click instead of doing nothing
- **Password strength indicator** — Registration page shows a 5-bar strength meter below the password input (length, uppercase, lowercase, digit, special char)
- **Copy install command toast** — Agent skill card now shows a toast notification after copying the install command
- **Lightbox keyboard nav** — Screenshot lightbox now supports Escape to close and ArrowLeft/Right to navigate between images
- **Report modal ESC** — Report modal now closes on Escape key press with focus trap
- **Tab CSS hidden** — Featured section tab panels now use CSS `hidden` instead of `key={tab}` forced remount, reducing DOM churn
- **Markdown more languages** — `MarkdownRenderer` now highlights Python, Bash, YAML, CSS, HTML, SQL, Java, Go, Rust (14 languages total)
- **Onboarding focus trap** — Onboarding tooltip now traps focus within the dialog; Tab cycles within the card; focus restored on skip/finish
- **Theme `color-scheme` sync** — `applyTheme` now sets `document.documentElement.style.colorScheme` for native browser widget consistency
- **CSS `scroll-behavior: smooth`** — Anchor links now smooth-scroll instead of jumping
- **CSS glow light-mode fix** — `.glow-text` and `.glow-border` now use `hsl(var(--primary))` instead of hardcoded cyan, adapting to light/dark themes
- **Toast `warning` type** — Added yellow-styled warning toast type; max 5 toasts enforced
- **Collections `updateCollection`** — `useCollections` hook now supports editing collection name, description, and visibility
- **Collections `isInCollection`** — New query function to check which collections contain a given skill
- **Categories page i18n** — Category listing page title and subtitle now use i18n keys instead of hardcoded English
- **Register i18n** — Password strength labels now use i18n keys (`passwordWeak`/`Fair`/`Good`/`Strong`/`VeryStrong`)

### Refactoring
- **`useFilteredList` hook** — New generic hook extracting shared filtering logic (query debounce, URL sync, pagination, active filters) from both skills and prompts list pages
- **Skill detail sub-components** — Split 900-line `skills/[id]/client.tsx` into 4 focused components: `ReportModal`, `Lightbox`, `CollectionPicker`, `VersionTimeline`

### Internationalization
- **New i18n keys** — `common.edited`, `common.passwordWeak`, `common.passwordFair`, `common.passwordGood`, `common.passwordStrong`, `common.passwordVeryStrong`, `common.loadMore`, `common.remaining`

### New Files
- `src/components/home/home-content.tsx` — Client component holding homepage tab state
- `src/components/shared/lazy-particle-bg.tsx` — Dynamic import wrapper for ParticleBackground
- `src/components/skill/report-modal.tsx` — Extracted report modal component
- `src/components/skill/lightbox.tsx` — Extracted screenshot lightbox with keyboard nav
- `src/components/skill/collection-picker.tsx` — Extracted collection picker dropdown
- `src/components/skill/version-timeline.tsx` — Extracted version history timeline
- `src/hooks/use-filtered-list.ts` — Generic filtered list hook

---

## [v2.0.7] — 2026-05-08

### Features
- **Unified Search Page** (`/search`) — Cross-marketplace search across Agent Skills and Prompt Templates; autocomplete dropdown with 6 suggestions (skills, prompts, tags) with type icons; recent search history persisted to localStorage (max 8); keyboard navigation (ArrowUp/Down, Enter, Escape); ARIA combobox pattern
- **Notification System** — Bell icon in navbar with unread count badge (9+ overflow); notification dropdown with type icons; mark-as-read, mark-all-read, clear-all actions; per-user localStorage persistence via `useNotifications` hook
- **Public User Profiles** (`/users/[username]`) — Public profile page showing avatar, bio, join date, published skills, download/star stats; breadcrumb navigation
- **JSON-LD Structured Data** — SoftwareApplication schema on skill pages, CreativeWork on prompt pages, BreadcrumbList on detail pages, Organization + WebSite on homepage
- **Skill Detail Enhancements** — Share button with `navigator.share()` + clipboard fallback; screenshots gallery with lightbox zoom; dependencies section in sidebar; verified badge (BadgeCheck icon); report modal with radio button reasons; follow author button; "Add to Collection" dropdown; 4th tab "Version History" with vertical timeline; enhanced 404 with trending suggestions
- **Skills Page URL-Synced Filters** — All filters (q, collection, category, license, sort) synced to URL query params; debounced query (300ms); license filter with radio buttons; cross-filter result counts; active filters summary bar with removable chips
- **Navbar "More" Dropdown** — Quick access to Categories, Trending, Tags, Guide from navbar; ArrowDown/ArrowUp/Escape keyboard navigation; `role="menu"` / `role="menuitem"` ARIA
- **CSS Enhancements** — `prefers-reduced-motion` guard on glass-card-hover; light mode glass-card with `backdrop-filter: blur(16px)`; print styles; global `focus-visible` styles; light mode gradient background
- **Hero Stagger Animation** — `@keyframes heroSlideUp` with `.hero-animate-1` through `.hero-animate-4` classes; decorative elements marked `aria-hidden="true"`
- **Tab Fade Animation** — `@keyframes tabFadeIn` with `.tab-panel-enter` class on featured section tabpanel
- **Comment Markdown Rendering** — Comment content now renders via lazy-loaded `MarkdownRenderer`; helper text shows supported syntax
- **Footer Accessibility** — Disabled links marked `aria-disabled="true"` with `line-through`; each footer section wrapped in `<nav>` with `aria-label`
- **Collections System** — `useCollections` hook for creating/managing skill collections with localStorage persistence
- **Follow System** — `useFollows` hook for following/unfollowing skill authors with localStorage persistence

### Internationalization
- **30+ new i18n keys** — `report`, `reportSubmitted`, `reportReason`, `reportSpam`, `reportAbuse`, `reportCopyright`, `reportOther`, `following`, `follow`, `unfollow`, `collections`, `myCollections`, `newCollection`, `collectionName`, `collectionDesc`, `addToCollection`, `noResults`, `tryDifferent`, `notifications`, `markAllRead`, `noNotifications`, `clearAll`, `viewMore`, `ago`, `filters`, `clearFilters`, `activeFilters`, `verified`, `official`, `screenshots`, `versionHistory`, `changelog`, `dependencies`, `noDependencies`
- **`userProfile` section** — `userNotFound`, `goBack`, `publishedSkills`, `noPublishedSkills`, `noPublishedSkillsDesc`, `totalDownloads`, `totalStars`, `publishedCount`, `joinedAt`
- **`search` section** — `title`, `subtitle`, `placeholder`, `recentSearches`, `clearRecent`, `noResults`, `noResultsDesc`, `agentSkills`, `promptTemplates`, `viewAllSkills`, `viewAllPrompts`, `suggestions`, `removeRecent`

### New Files
- `src/app/search/page.tsx` — Server component with Suspense boundary
- `src/app/search/client.tsx` — Unified search with autocomplete
- `src/app/users/[username]/page.tsx` — Public profile server component
- `src/app/users/[username]/client.tsx` — Public profile client component
- `src/components/shared/json-ld.tsx` — JSON-LD generator component
- `src/components/shared/notification-bell.tsx` — Notification bell dropdown
- `src/components/shared/onboarding-tooltip.tsx` — 3-step guided tour for new visitors
- `src/hooks/use-notifications.ts` — Notification CRUD hook
- `src/hooks/use-collections.ts` — Collection management hook
- `src/hooks/use-follows.ts` — Follow management hook
- `src/app/skills/[id]/loading.tsx` — Skill detail skeleton

---

## [v2.0.6] — 2026-05-08

### Features
- **Onboarding Tour** — First-time visitors see a 3-step guided tour (Welcome → Browse Skills → Search) with overlay mask, highlighted target areas, and tooltip cards; progress tracked via `localStorage`
- **Improved Empty States** — `/prompts`, `/trending`, and `/tags` pages now show friendly empty states with icons, descriptive text, and action buttons when no results match filters

### Internationalization
- **New i18n keys** — `onboarding.skip`, `onboarding.next`, `onboarding.finish`, `onboarding.step1Title`, `onboarding.step1Desc`, `onboarding.step2Title`, `onboarding.step2Desc`, `onboarding.step3Title`, `onboarding.step3Desc`

---

## [v2.0.5] — 2026-05-08

### Features
- **Interactive Prompt Playground** — Prompt detail page now has a "Detail / Playground" tab system; the Playground tab lets users fill in `{{variable}}` placeholders inline and preview the fully-assembled prompt in the browser (client-side only, no API calls)
- **Variable auto-detection** — Playground parses both `{{var}}` and `{var}` syntax from the prompt template, deduplicates, and generates labeled textarea inputs
- **Online/Local switch in Playground** — Users can switch between online and local prompt versions with separate variable inputs
- **Reset & Copy actions** — Playground includes Reset (clear all inputs), Copy Result, and Generate Preview buttons

### Internationalization
- **New i18n keys** — `common.detail`, `common.reset`, `common.generatePreview`, `common.previewPrompt`; `common.runPrompt` updated to "Run Prompt" / "运行 Prompt"

---

## [v2.0.4] — 2026-05-07

### Accessibility
- **Skills page added Suspense boundary** — `SkillsClient` uses `useSearchParams()` and must be wrapped in `<Suspense>` in Next.js 16; added boundary with skeleton fallback
- **Skip Navigation Link** — Root layout now includes a “Skip to main content” link (WCAG 2.4.1 Level A); `<main>` now has `id="main-content"`
- **CreateDropdown ARIA** — Trigger now includes `aria-expanded`, `aria-haspopup="menu"`, and `aria-label`; dropdown menu uses `role="menu"` with `role="menuitem"` items
- **CommentSection button a11y** — Like button now has `aria-label` and `aria-pressed`; edit/delete buttons now have `aria-label`
- **Prompts filters radiogroup** — Category, difficulty, and sort groups wrapped in `role="radiogroup"` containers
- **AgentSkillCard nested interaction fix** — Removed full-card overlay `<Link>` so copy button is keyboard-reachable; title, avatar, and description are now individual `<Link>` elements
- **Custom modals ARIA** — `CreateFromUpload` and `CreateFromUploadPrompt` now include `role="dialog"`, `aria-modal="true"`, and `aria-label`

### Internationalization
- **Unified metadata language** — Root layout title, description, and OG metadata now in English, consistent with Twitter card
- **Hardcoded English strings i18n** — AgentSkillCard “Popular” now uses `t.agentSkills.trending`; settings delete confirmation now accepts “删除” (zh) in addition to “DELETE”; footer/login “Coming soon” now use i18n keys
- **Footer stable keys** — Footer section keys changed from translated strings to stable `id` values to prevent DOM remounts on language switch
- **Tags page variable rename** — Loop variable `t` renamed to `tagItem` to avoid shadowing `useI18n()` `t`
- **New i18n keys** — `common.popular`, `agentSkills.trending`, `footer.comingSoon`, `auth.comingSoon`

### Performance
- **MarkdownRenderer memoized** — Heavy markdown parser now wrapped with `React.memo` to avoid unnecessary re-parsing
- **Dynamic import loading fallbacks** — `CreateFromGithub`, `CreateFromUpload`, `CreateFromUploadPrompt` now show spinner placeholders while loading
- **glass-card-hover transition optimized** — Changed from `transition: all` to explicit `transform, border-color, box-shadow` transitions to reduce repaints

### UX
- **OG images added** — Root layout now includes `openGraph.images` and `twitter.images` using `/og.png`
- **Consistent skeleton tokens** — Prompt detail loading skeleton tokens changed from `bg-white/5` to `bg-secondary`
- **ScrollToTop no longer removed from DOM** — Now uses `opacity-0 pointer-events-none` with CSS transition to avoid layout jump and screen reader issues
- **Submit form loading state** — Submit button now disabled with “...” while submitting to prevent duplicate submissions
- **AgentSkillCard tags interactive** — Tags changed from `<span>` to `<Link href="/tags/[tag]">` consistent with SkillCard
- **Forgot Password tooltip i18n** — Tooltip now uses i18n key instead of hardcoded “Coming soon”
- **Profile stats reactive** — `StatsDashboard` now reads localStorage in `useEffect` with `useState` to avoid stale render-time reads
- **Profile page Suspense** — `ProfileClient` now wrapped in `<Suspense>` with skeleton fallback

### Files Modified
- `src/app/skills/page.tsx` — added `<Suspense>` boundary and skeleton fallback
- `src/app/layout.tsx` — skip nav link, main-content id, unified English metadata, OG images
- `src/app/profile/page.tsx` — metadata language updated; wrapped in `<Suspense>` with skeleton fallback
- `src/app/prompts/client.tsx` — dynamic import loading fallback; filter groups wrapped in `role="radiogroup"`
- `src/app/prompts/[id]/loading.tsx` — skeleton tokens updated to `bg-secondary`
- `src/app/skills/client.tsx` — dynamic import loading fallback
- `src/app/submit/client.tsx` — submit button loading/disabled state
- `src/app/login/client.tsx` — forgot password tooltip i18n
- `src/app/tags/client.tsx` — variable renamed to avoid shadowing
- `src/app/globals.css` — explicit transition properties for glass-card-hover
- `src/components/skills/create-dropdown.tsx` — ARIA attributes added
- `src/components/skills/create-from-upload.tsx` — modal ARIA added
- `src/components/skills/create-from-upload-prompt.tsx` — modal ARIA added
- `src/components/skill/comment-section.tsx` — button a11y attributes added
- `src/components/agent-skill/agent-skill-card.tsx` — removed overlay; tags now links; i18n added
- `src/components/layout/footer.tsx` — stable section keys; comingSoon i18n
- `src/components/shared/scroll-to-top.tsx` — CSS transition instead of conditional render
- `src/components/shared/markdown-renderer.tsx` — wrapped in `React.memo`
- `src/components/profile/settings-tab.tsx` — delete confirmation accepts zh “删除”
- `src/components/profile/stats-dashboard.tsx` — reactive effect-based localStorage read
- `src/lib/i18n/types.ts` — added `popular`, `trending`, and `comingSoon` keys
- `src/lib/i18n/zh.ts` — added corresponding translations
- `src/lib/i18n/en.ts` — added corresponding translations

## [v2.0.3] — 2026-05-07

### Internationalization
- **Skill.difficulty enum → English values** — Changed `difficulty` from Chinese (`"新手友好" | "进阶" | "高级"`) to English (`"beginner" | "intermediate" | "advanced"`) in types, mock data, filter options, and create forms. Added `getDifficultyLabel()` helper for runtime i18n display

### Performance
- **Dynamic import heavy libraries** — `react-syntax-highlighter`, `JSZip`, and `file-saver` in skill detail page now use `lazy()` / dynamic `import()` to reduce initial bundle size
- **Suspense wrapper** — SyntaxHighlighter rendering wrapped in `<Suspense>` with loading placeholder

### Files Modified
- `src/lib/types.ts` — `difficulty` type changed to English enum values
- `src/lib/mock-data.ts` — All 28 skill difficulty values converted to English
- `src/lib/utils.ts` — New `getDifficultyLabel()` helper function
- `src/app/prompts/client.tsx` — Difficulty filter keys changed to English
- `src/components/skills/create-from-upload-prompt.tsx` — Difficulty keys and state type changed to English
- `src/components/skill/skill-card.tsx` — Uses `getDifficultyLabel()` for i18n display
- `src/app/prompts/[id]/client.tsx` — Uses `getDifficultyLabel()` for badge display
- `src/app/skills/[id]/client.tsx` — Dynamic import for SyntaxHighlighter, JSZip, file-saver

## [v2.0.2] — 2026-05-07

### Accessibility
- **prefers-reduced-motion now reactive** — Particle background listens for runtime `prefers-reduced-motion` changes via `matchMedia.addEventListener("change")`; toggling the OS setting pauses/resumes the animation immediately

### Internationalization
- **OG metadata bilingual fallback** — Twitter card description now in English; `openGraph.alternateLocale` set to `en_US`; `alternates.languages` declares both `zh-CN` and `en-US`; `metadataBase` reads from `NEXT_PUBLIC_SITE_URL` env var

### UX
- **Delete comment confirmation** — Clicking the delete button now shows a "确定要删除？/ Delete this comment?" inline confirmation before actually deleting
- **New i18n keys** — `comments.deleteConfirm`, `comments.commentEdited` added to both zh/en dictionaries

### Files Modified
- `src/components/shared/particle-bg.tsx` — Reactive `prefers-reduced-motion` listener
- `src/app/layout.tsx` — OG/Twitter metadata bilingual, `metadataBase` from env var
- `src/components/skill/comment-section.tsx` — Delete confirmation UI
- `src/lib/i18n/types.ts` — New keys: `comments.deleteConfirm`, `comments.commentEdited`
- `src/lib/i18n/zh.ts` — Chinese translations for new keys
- `src/lib/i18n/en.ts` — English translations for new keys

## [v2.0.1] — 2026-05-07

### Performance
- **Particle background scoped to homepage only** — `ParticleBackground` moved from root layout to `page.tsx`; other pages no longer run the canvas animation, saving CPU/GPU
- **Skills/Prompts filtering fully memoized** — `filtered` results now wrapped in `useMemo` with proper dependency arrays; prevents re-filtering on every render
- **Trending page data memoized** — `allItems`, `filtered`, `sorted`, `list` all wrapped in `useMemo`; eliminates redundant sorting on unrelated state changes
- **Featured section data memoized** — `trendingAgents` and `trendingPrompts` now use `useMemo` to avoid re-computing on parent re-renders

### Accessibility
- **Featured section keyboard navigation** — ArrowLeft/ArrowRight keys now toggle between Agent/Prompt tabs
- **Comment star rating ARIA** — Rating buttons now have `role="radio"`, `aria-checked`, and `aria-label` for screen readers
- **Search input labels** — Skills and Prompts search inputs now have `aria-label` matching their placeholder text
- **Create modals dialog pattern** — GitHub import and Upload modals now have `role="dialog"`, `aria-modal="true"`, `aria-label`
- **Create modals Escape key** — Both modals now close on Escape key press via `useEffect` keydown listener
- **Skills sort buttons radiogroup** — Sort buttons now wrapped in `role="radiogroup"` with `aria-label`

### Internationalization
- **Dynamic `<html lang>` attribute** — New `HtmlLangUpdater` component updates `document.documentElement.lang` when language switches; no longer stuck on `zh-CN`
- **Category detail page i18n fix** — `categoryToAgentCategory` mapping now uses `categorySlug` (English) instead of hardcoded Chinese category names
- **Trending "load more" parentheses** — Chinese `（）` replaced with ASCII `()` in all three list pages for consistent cross-locale display
- **GitHub import category fix** — Default category changed from hardcoded Chinese "Skills 管理" to `t.create.skillTypeOther`

### Features
- **Comment edit/delete** — Authors can now edit and delete their own comments on skill detail pages
- **Avatar auto-compression** — Avatar crop dialog now auto-compresses images >500KB to 128x128 at 60% JPEG quality to stay within localStorage limits
- **Guide page table of contents** — New TOC nav section with anchor links to all 7 guide sections; each section has `id` and `scroll-mt-20` for smooth scrolling

### Bug Fixes
- **ID generation uses `crypto.randomUUID()`** — Comments, submissions, toasts, and custom skills now use UUID instead of `Date.now().toString(36)`, eliminating collision risk

### Files Modified
- `src/app/layout.tsx` — Removed `ParticleBackground` import; added `HtmlLangUpdater`
- `src/app/page.tsx` — Added `ParticleBackground` import; renders it on homepage only
- `src/components/shared/html-lang-updater.tsx` — **New file**: updates `<html lang>` on language switch
- `src/components/home/featured-section.tsx` — Added `useMemo` for `trendingAgents`/`trendingPrompts`; added `useCallback` for `handleKeyDown` with ArrowLeft/Right
- `src/app/skills/client.tsx` — `filtered` now wrapped in `useMemo`; search input has `aria-label`; parentheses fix
- `src/app/prompts/client.tsx` — `filtered` now wrapped in `useMemo`; search input has `aria-label`; parentheses fix
- `src/app/trending/client.tsx` — Added `useMemo` for `allItems`, `filtered`, `sorted`, `list`; parentheses fix
- `src/components/skill/comment-section.tsx` — Star rating has `role="radio"`, `aria-checked`, `aria-label`; ID uses `crypto.randomUUID()`; added edit/delete for comment authors
- `src/components/skills/create-from-github.tsx` — Added `role="dialog"`, `aria-modal`, `aria-label`; Escape key closes modal; default category uses i18n key
- `src/components/skills/create-from-upload.tsx` — Escape key closes modal; ID uses `crypto.randomUUID()`
- `src/app/categories/[slug]/client.tsx` — `categoryToAgentCategory` now maps to English `categorySlug` values
- `src/contexts/toast-context.tsx` — Toast ID uses `crypto.randomUUID()`
- `src/app/submit/client.tsx` — Submission ID uses `crypto.randomUUID()`
- `src/app/guide/client.tsx` — Added table of contents with anchor links; all sections have `id` + `scroll-mt-20`
- `src/components/profile/avatar-crop-dialog.tsx` — Auto-compresses avatars >500KB to 128x128 at 60% JPEG quality
- `src/app/skills/client.tsx` — Sort buttons wrapped in `role="radiogroup"` with `aria-label`

## [v1.9.0] — 2026-05-07

### Fixed
- **My Likes/Favorites tab now shows Agent Skills** — Previously only Prompt skills were resolved; Agent skill IDs silently disappeared. Both tabs now render `AgentSkillCard` and `SkillCard` separately
- **My Comments delete now syncs skillComments** — Deleting a comment from the profile now also removes it from the per-skill `skillComments` localStorage key, so the skill detail page no longer shows orphaned comments
- **Usage History links now route correctly** — Agent skill view/copy history items now link to `/skills/[id]` instead of always linking to `/prompts/[id]`
- **`formatNumber()` handles millions** — `1000000` now shows "1M" instead of "1000.0k"
- **`formatDate()` parses dot-separated dates** — `"2026.04"` format (used in mock data) is now normalized to ISO before parsing, fixing "Invalid Date" errors
- **Skills/Prompts `setRefresh` actually works** — `useMemo` dependency array now includes `refresh` counter, so newly created skills/prompts appear without manual page reload
- **Agent skill card install command no longer triggers navigation** — Added `e.stopPropagation()` so clicking the install command copies to clipboard without also navigating to the detail page
- **GitHub import modal no longer shows form + spinner simultaneously** — Parsing state now hides the form input, preventing visual overlap
- **Sitemap uses real lastUpdated dates** — Agent skill pages now use `s.lastUpdated` instead of `new Date()` (always "today"); prompt date parsing is more robust
- **Sitemap base URL from env var** — `NEXT_PUBLIC_SITE_URL` env var now overrides the hardcoded Vercel URL

### Changed
- **Profile tabs use URL search params** — `?tab=settings` deep-linking now works; refreshing the page preserves the active tab. Tabs use `useSearchParams` + `router.replace`
- **Profile tabs have ARIA tab roles** — `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`, `aria-labelledby`, `tabIndex` management
- **Skill detail tabs have ARIA roles** — Same ARIA tab pattern applied to the 3-tab layout (intro/files/feedback)
- **Breadcrumb i18n** — "Home" label now uses `t.common.home`; last item has `aria-current="page"`; decorative chevron has `aria-hidden="true"`
- **Scroll-to-top button i18n** — `aria-label` now uses `t.common.backToTop` instead of hardcoded English
- **Loading skeleton a11y** — Added `role="status"`, `aria-busy="true"`, `aria-label`
- **Error boundary icons** — `AlertTriangle` decorative icons now have `aria-hidden="true"`
- **Login page loading state** — Submit button shows "..." while authenticating; error message has `role="alert"`
- **Register page confirm password** — New "Confirm Password" field with mismatch validation
- **Register page loading state** — Submit button shows "..." while registering; error message has `role="alert"`
- **i18n keys added** — `common.backToTop`, `auth.confirmPassword`, `auth.confirmPasswordPlaceholder`, `auth.passwordMismatch`

### Files Modified
- `src/components/profile/my-likes-tab.tsx` — Import `getAgentSkillById` + `AgentSkillCard`; render both agent and prompt skills
- `src/components/profile/my-favorites-tab.tsx` — Same dual-render pattern
- `src/components/profile/my-comments-tab.tsx` — `handleDelete` now accepts `skillId` and cleans up `skillComments` storage
- `src/components/profile/usage-history-tab.tsx` — Import `getAgentSkillById`; link to `/skills/` for agent skills
- `src/lib/utils.ts` — `formatNumber` handles M; `formatDate` normalizes dot-separated dates
- `src/app/skills/client.tsx` — `useMemo` depends on `refresh` counter
- `src/app/prompts/client.tsx` — Same `useMemo` fix
- `src/components/agent-skill/agent-skill-card.tsx` — `e.stopPropagation()` + `.catch()` on clipboard
- `src/components/skills/create-from-github.tsx` — Form hidden during parsing state
- `src/app/sitemap.ts` — Real dates + env var base URL
- `src/app/profile/client.tsx` — URL-based tab routing, ARIA tab roles
- `src/components/shared/breadcrumb.tsx` — i18n, `aria-current`, `aria-hidden`
- `src/components/shared/scroll-to-top.tsx` — i18n for `aria-label`
- `src/app/loading.tsx` — `role="status"`, `aria-busy`, `aria-label`
- `src/app/error.tsx` — `aria-hidden` on icon
- `src/app/skills/error.tsx` — `aria-hidden` on icon
- `src/app/prompts/error.tsx` — `aria-hidden` on icon
- `src/app/skills/[id]/client.tsx` — ARIA tab roles on detail page tabs
- `src/app/login/client.tsx` — Loading state, `role="alert"` on error
- `src/app/register/client.tsx` — Confirm password field, loading state, `role="alert"`
- `src/lib/i18n/types.ts` — New keys: `common.backToTop`, `auth.confirmPassword/confirmPasswordPlaceholder/passwordMismatch`
- `src/lib/i18n/zh.ts` — Chinese translations for new keys
- `src/lib/i18n/en.ts` — English translations for new keys

---

## [v1.8.0] — 2026-05-07

### Added
- **Root error boundary** — `src/app/error.tsx` rewritten with `unstable_retry` (Next.js 16 API), glass-card UI, retry + home buttons, i18n support
- **Root loading skeleton** — `src/app/loading.tsx` with `animate-pulse` skeleton mimicking hero + tab section + 6 cards
- **Nested error boundaries** — `src/app/skills/error.tsx` and `src/app/prompts/error.tsx` with route-specific "back to list" links
- **`useLocale()` hook** — `src/hooks/use-locale.ts` derives `"zh-CN"` / `"en-US"` from `useI18n().lang`
- **`formatDate()` utility** — `src/lib/utils.ts` now exports `formatDate(dateStr, locale)` for consistent date formatting
- **Navbar "More" dropdown** — New dropdown menu after "Templates" link with Categories, Trending, Tags, Guide; closes on outside click and route change
- **Navbar `aria-expanded`** — Search toggle and mobile Sheet trigger buttons now have `aria-expanded` attributes

### Changed
- **Date locale fix** — 11 occurrences of hardcoded `"zh-CN"` across 9 files replaced with `useLocale()` for proper English/Chinese date formatting
- **Toast a11y** — Container now has `aria-live="polite"` + `role="status"`; each toast item has `role="alert"`
- **Featured section ARIA tabs** — Tab container uses `role="tablist"`, buttons use `role="tab"` + `aria-selected` + `aria-controls`, content uses `role="tabpanel"` + `aria-labelledby`
- **Command palette a11y** — Added `role="dialog"`, `aria-modal="true"`, `aria-label`, `aria-hidden` on backdrop, basic Tab focus trap
- **Footer disabled links** — Added `title="Coming soon"` tooltip to 5 disabled links (Changelog, API, GitHub, Discord, Twitter)
- **Footer colon fix** — Full-width `：` replaced with ASCII `:` on platform list
- **MarkdownRenderer extracted** — Moved from `skills/[id]/client.tsx` to `src/components/shared/markdown-renderer.tsx` as a reusable component; headings now have `id` attributes for anchor links and `scroll-mt-20` for scroll offset
- **Category i18n centralized** — `getCategoryI18n()` and `getAgentCategoryI18n()` moved from `category-cards.tsx` to `src/lib/categories.ts` for reuse across components
- **react-easy-crop dynamic import** — `avatar-crop-dialog.tsx` now uses `React.lazy` + `Suspense` for code splitting
- **`@types/react-syntax-highlighter`** — Moved from `dependencies` to `devDependencies`

### Files Modified
- `src/app/admin/client.tsx` — 3 `toLocaleDateString` calls use `useLocale()`
- `src/app/submit/client.tsx` — `toLocaleDateString` uses `useLocale()`
- `src/app/submit/status/client.tsx` — `toLocaleDateString` uses `useLocale()`
- `src/components/skill/comment-section.tsx` — `toLocaleDateString` uses `useLocale()`
- `src/components/profile/my-comments-tab.tsx` — `toLocaleDateString` uses `useLocale()`
- `src/components/profile/my-submissions-tab.tsx` — `toLocaleDateString` uses `useLocale()`
- `src/components/profile/usage-history-tab.tsx` — `toLocaleDateString` uses `useLocale()`
- `src/components/profile/activity-timeline.tsx` — `toLocaleDateString` uses `useLocale()`
- `src/components/profile/profile-header.tsx` — `toLocaleDateString` uses `useLocale()`
- `src/components/ui/toast.tsx` — `aria-live`, `role="status"`, `role="alert"`
- `src/components/home/featured-section.tsx` — Full ARIA tab pattern
- `src/components/shared/command-palette.tsx` — Dialog ARIA + focus trap
- `src/components/layout/navbar.tsx` — "More" dropdown, `aria-expanded` on toggle buttons
- `src/components/layout/footer.tsx` — Disabled link titles, colon fix
- `src/components/home/category-cards.tsx` — Imports centralized i18n functions
- `src/app/categories/[slug]/client.tsx` — Uses centralized i18n functions, removed unused `Dictionary` import
- `src/app/skills/[id]/client.tsx` — Imports `MarkdownRenderer`, `CopyButton`, `codeTheme` from shared component
- `src/components/profile/avatar-crop-dialog.tsx` — `React.lazy` + `Suspense` for Cropper
- `src/lib/categories.ts` — Added `getCategoryI18n()` and `getAgentCategoryI18n()` with Dictionary import
- `src/lib/utils.ts` — Added `formatDate()` export
- `package.json` — `@types/react-syntax-highlighter` moved to devDependencies

### New Files
- `src/app/error.tsx` — Root error boundary with `unstable_retry`
- `src/app/loading.tsx` — Root loading skeleton
- `src/app/skills/error.tsx` — Skills route error boundary
- `src/app/prompts/error.tsx` — Prompts route error boundary
- `src/hooks/use-locale.ts` — Locale derivation hook
- `src/components/shared/markdown-renderer.tsx` — Extracted MarkdownRenderer component

### Removed
- `src/components/ui/card.tsx` — Unused component (0 imports)
- `src/components/ui/select.tsx` — Unused component (0 imports)
- `src/components/ui/separator.tsx` — Unused component (0 imports)
- `src/components/shared/premium-gate.tsx` — Unused component (0 imports)
- `src/components/home/skill-section.tsx` — Unused component (0 imports)
- `src/components/skills/create-from-github-prompt.tsx` — Unused component (0 imports)
- `public/file.svg` — Next.js template leftover (0 references)
- `public/globe.svg` — Next.js template leftover (0 references)
- `public/next.svg` — Next.js template leftover (0 references)
- `public/vercel.svg` — Next.js template leftover (0 references)
- `public/window.svg` — Next.js template leftover (0 references)

---

## [v1.7.0] — 2026-05-07

### Added
- **Custom avatar upload** — Users can upload, crop, and set a custom avatar from the profile header and settings page; uses `react-easy-crop` with round crop shape, zoom slider, and 256×256 JPEG output; avatar persists to `localStorage` as base64 data URL
- **Avatar in navbar** — Navbar user icon now displays the custom avatar (via `next/image`) when set, falling back to first-letter initial
- **Avatar i18n** — 8 new i18n keys for the avatar feature (`avatar.changeAvatar`, `avatar.uploadHint`, `avatar.fileTooLarge`, `avatar.zoomIn`, `avatar.zoomOut`, `avatar.confirm`, `avatar.cancel`, `avatar.dragToAdjust`)

### Changed
- **Guide page prompt example i18n** — Hardcoded "春季穿搭心得" example text replaced with `t.guide.promptExampleTopic` key
- **Prompt creation difficulty i18n** — `create-from-upload-prompt.tsx` difficulty dropdown now uses i18n labels (`t.create.difficultyEasy/Medium/Hard`) instead of hardcoded Chinese strings
- **Login page "Forgot password"** — Added `title="Coming soon"` hint to the disabled link
- **Share error handling** — `prompts/[id]/client.tsx` empty catch block on `navigator.share` now has a comment explaining it's an expected user cancellation

### Files Modified
- `src/components/profile/profile-header.tsx` — Camera icon overlay on hover, file input, AvatarCropDialog integration, `useToast` and `updateProfile` for avatar save
- `src/components/profile/settings-tab.tsx` — Avatar upload section with preview, camera button, and AvatarCropDialog; imports `useRef`, `Camera`, `Image`, `AvatarCropDialog`
- `src/components/layout/navbar.tsx` — Avatar display using `next/image` when user has custom avatar
- `src/app/guide/client.tsx` — Example topic text now uses i18n key
- `src/components/skills/create-from-upload-prompt.tsx` — `DIFFICULTIES` array moved inside component, uses `{ key, label }` pattern with i18n
- `src/app/prompts/[id]/client.tsx` — Comment on share catch block
- `src/app/login/client.tsx` — `title` attribute on forgot password link
- `src/lib/i18n/types.ts` — New `avatar` section (8 keys) + `guide.promptExampleTopic`
- `src/lib/i18n/zh.ts` — Chinese translations for avatar + promptExampleTopic
- `src/lib/i18n/en.ts` — English translations for avatar + promptExampleTopic

### New Files
- `src/components/profile/avatar-crop-dialog.tsx` — Reusable avatar crop dialog with `react-easy-crop`, zoom slider, Canvas-based 256×256 JPEG export

### Dependencies
- Added `react-easy-crop` — Lightweight image cropping component with touch support

---

### Changed
- **Dynamic `allowedDevOrigins`** — Replaced hardcoded `192.168.31.125` with wildcard patterns (`http://192.168.*`, `http://10.*`, `http://172.*`) covering all RFC 1918 private IP ranges; any LAN IP works automatically
- **Agent skill comments persisted** — Comments on skill detail pages now persist to `localStorage` (`skillComments` key); reload no longer loses user comments
- **MyCommentsTab link fix** — Comment links now correctly detect whether the item is an Agent Skill or Prompt Template and link to the appropriate detail page
- **Sitemap tags added** — `/tags/[tag]` routes now included in sitemap generation via `getAllTags()`
- **Admin stale closure fix** — `handleReview` reads from `localStorage` before updating state to avoid stale closure referencing old submissions
- **Premium gate i18n** — `premium-gate.tsx` fully i18n'd (premium skill label, description, unlock/register buttons)
- **Category detail i18n** — `categories/[slug]/client.tsx` all hardcoded Chinese strings replaced with i18n keys
- **Prompt model table i18n** — Model table headers (name, strengths, use case, audience) and ARIA labels now localized
- **Submit anonymous user i18n** — Fallback "匿名用户" replaced with `t.submit.anonymousUser`
- **Sitemap updated** — `v1.6.7` entry added to changelog

### Files Modified
- `next.config.ts` — Wildcard `allowedDevOrigins` for all private IP ranges
- `src/lib/storage-keys.ts` — Added `skillComments` key for per-skill comment persistence
- `src/app/skills/[id]/client.tsx` — Comments load from and persist to `localStorage`; uses `useAuth` for user info
- `src/components/profile/my-comments-tab.tsx` — Links detect Agent vs Prompt; imports `getAgentSkillById`
- `src/app/sitemap.ts` — Imports `getAllTags()`; generates tag page entries
- `src/app/admin/client.tsx` — `handleReview` reads localStorage before state update
- `src/components/shared/premium-gate.tsx` — Full i18n via `useI18n()`
- `src/app/categories/[slug]/client.tsx` — All UI strings use i18n keys
- `src/app/prompts/[id]/client.tsx` — Model table headers and ARIA labels i18n'd
- `src/app/submit/client.tsx` — Anonymous user fallback i18n'd
- `src/lib/i18n/types.ts` — Added 12 new keys (`premiumSkill`, `premiumDesc`, `catNotFound`, `modelsTableLabel`, etc.)
- `src/lib/i18n/zh.ts` — Added 12 new Chinese translations
- `src/lib/i18n/en.ts` — Added 12 new English translations

---

## [v1.6.6] — 2026-05-07

### Changed
- **Dev cross-origin fix** — Added `allowedDevOrigins: ['192.168.31.125']` to `next.config.ts` to allow LAN access in development
- **Icon picker layout fix** — Custom skill creation icon picker no longer overlaps; changed from `absolute` to normal flow positioning
- **Command palette ARIA** — Added `role="listbox"`, `role="option"`, `aria-selected`, `aria-activedescendant`, `role="combobox"`, `aria-expanded` for full screen reader support
- **Category i18n** — Category names and descriptions (6 Prompt categories + 8 Agent Skill categories) moved from hardcoded Chinese in data files to i18n translation keys

### Files Modified
- `next.config.ts` — Added `allowedDevOrigins`
- `src/components/skills/create-from-upload.tsx` — Icon picker changed from absolute to flow layout
- `src/components/shared/command-palette.tsx` — Full ARIA attributes for listbox/option/combobox
- `src/components/home/category-cards.tsx` — Uses `getPromptCategoryI18n()` and `getAgentCategoryI18n()` factory functions
- `src/lib/i18n/types.ts` — Added 22 category i18n keys
- `src/lib/i18n/zh.ts` — Added 22 category translations
- `src/lib/i18n/en.ts` — Added 22 category translations

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
