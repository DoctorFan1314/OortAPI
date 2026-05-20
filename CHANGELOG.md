# Changelog

> **[中文版本](CHANGELOG_CN.md)**

All notable changes to this project will be documented in this file.

---

## [v3.3.4.15] — 2026-05-20

### Beautification & UX
- **Error boundaries** — Added error.tsx fallbacks for all dashboard sub-routes
- **Loading states** — Added loading.tsx skeletons for billing, keys, playground, settings pages
- **Shared components** — Extracted DeltaBadge component; added spinner to ConfirmDialog
- **Accessibility** — Sidebar now includes `aria-current="page"` on active links
- **Channel management** — Replaced raw Dialogs with reusable ConfirmDialog
- **Profile fix** — Fixed missing `await` in handleSaveProfile (could not catch save errors)
- **Password toggle** — Added show/hide password buttons on login and register forms
- **Logout redirect** — Auth context now redirects to home after logout
- **Usage validation** — Client-side date validation (from must be before to)
- **Model market** — Custom sort dropdown replaces native `<select>`; added list/compact view toggle
- **Playground** — AI responses now render Markdown instead of plain `<pre>` text
- **Theme default** — Default theme respects `prefers-color-scheme` instead of hardcoded "dark"
- **Recharge button** — Updated tooltip text on disabled recharge button

### Billing & Analytics
- **Billing history** — Added search by description and type filter (recharge/deduct/refund/gift)
- **Spend forecast** — New "Projected Monthly Spend" card with progress bar
- **Monthly trend** — New "Month-to-Date Spend" card with vs-last-month DeltaBadge
- **Cost by model** — New ECharts pie chart on usage page showing cost distribution by model
- **CSV export** — Changed from window.open to fetch+blob with success/error toast feedback
- **Monitor table** — Admin monitor provider table now supports column sorting and text search

### New Features
- **EmptyState component** — New reusable empty-state component for consistent UI across pages
- **Proxy (Middleware)** — Added Next.js 16 proxy.ts for server-side route protection (dashboard/profile)
- **Error retry limit** — Error page now limits retry to 3 attempts, then disables button

### Phase 2 — Additional Enhancements
- **Playground export** — Conversation export to Markdown file; refresh button for model/key lists
- **Sidebar badges** — API Keys menu item shows active key count badge
- **Budget fix** — Fixed double-fire budget exceeded notification in StrictMode
- **404 page** — Dynamic content loading with fallback to hardcoded data
- **Resources page** — Added search filter and live section counts
- **Docs** — Added "Edit this page" link and "Last updated" date to documentation
- **Homepage** — Integrated FeaturedSection (skills/prompts tabs) and Testimonials; new PricingSection with 3 tiers; scroll indicator on Hero
- **Proxy fix** — Fixed cookie name mismatch (token → oortapi_token)

### Bug Fixes & Polish
- **Model pie charts** — Now use full-period API aggregation (not current page); distinct warm/cool color palettes; scrollable legends; credits vs cost correctly separated
- **Filter bar** — Model filter changed from text input to dropdown (syncs with model market); layout uses justify-between to fill row width
- **API SQL fix** — Fixed ambiguous column error (created_at missing u. prefix)
- **Default date range** — Usage page defaults to last 30 days; clear resets to 30-day range
- **API 60-day cap** — Daily trend limited to 60 most recent days; warning banner when range exceeds 60 days
- **Docs ToC** — New table of contents sidebar on doc pages (xl+ screens) with scroll tracking

---

## [v3.3.4.14] — 2026-05-19

### Analytics & Statistics
- **Period comparison** — Stats API returns yesterday/last-month data; dashboard cards show delta badges (↑↓%)
- **Analytics API** — Previous period comparison (7d vs prev 7d); cache hit rate stats
- **Key analytics** — Custom time range support (from/to params); per-model breakdown per key
- **Model latency** — New latency comparison bars (per-model average, horizontal bars)
- **Error rate** — New per-model error rate cards with color-coded thresholds
- **Cache hit rate** — New card showing period cache hit % with hit/miss counts
- **Cost trend chart** — New dual-axis bar+line chart (daily cost + calls overlay)
- **Model consumption** — Stacked bar chart now shows input/output split in tooltips

### Billing
- **Bill search** — Billing records API now supports type/from/to filtering
- **CSV export** — Billing records CSV export (up to 10,000 rows)
- **Monthly trend** — 12-month cost trend data returned from billing API
- **Webhook events** — `subscription.cancelled` dispatched on cancel; `balance.low` when balance < $1; `renewal.failed` on auto-renew failure

### UX
- **Usage table** — First column (channel) is now sticky; latency values color-coded (green/yellow/red)
- **Table skeleton** — Loading state shows 5-row table structure instead of single pulse bar
- **Login page** — Email field auto-focuses on mount
- **Page titles** — Dashboard sub-pages set document.title dynamically
- **Timezone selector** — Expanded from 6 to 15 timezone options with UTC offset labels
- **Navbar** — User dropdown shows current balance
- **API Keys** — Batch select/delete with checkboxes, select-all, and count feedback
- **Channel batch** — Batch enable/disable/delete already existed in ChannelCard
- **Avatar upload** — Drag-and-drop support added to avatar area

---

## [v3.3.4.13] — 2026-05-18

### Beautification
- **Dashboard layout** — Replaced outer `<div>` with semantic `<main>` tag
- **Dashboard** — `lastUpdated` timestamp shows date in addition to time
- **Playground messages** — Removed `font-mono` for readable AI response rendering; each message has copy button
- **Playground params** — Added slide-down animation when toggling parameter panel
- **Channels health** — Changed illegible `text-[10px]` to `text-xs`
- **Billing cards** — Added actionable "View Plans" / "Subscribe" / "Contact Us" links
- **System Monitor** — Added pulsing green dot indicator for live auto-refresh
- **Audit logs** — Added action type filter dropdown; details column has title tooltip

---

## [v3.3.4.12] — 2026-05-18

### Beautification & UX Polish
- **Animation classes** — Standardized all inline arbitrary animations to reusable utility classes
- **Token Plan page** — Enhanced hero with gradient background, decorative orbs, staggered entry animation
- **Comparison table** — Plan-colored gradient headers with star markers, row hover highlights, better typography
- **FAQ section** — Upgraded to interactive accordion (expand/collapse) with smooth rotation indicators
- **Subscription cards** — Replaced hardcoded hex colors with CSS variables (theme-aware), added hover scale/shadow
- **Onboarding cards** — Upgraded to `glass-card` styling with hover effects matching dashboard theme
- **StatusBadge** — Dark-mode-aware color contrast fix, added `transition-colors` animation
- **Copy button** — Added `group-focus-within` for touch device visibility

### UX Improvements
- **API Key delete** — Replaced raw Dialog with shared ConfirmDialog (consistent styling site-wide)
- **Cancel subscription** — Replaced raw Dialog with shared ConfirmDialog
- **Settings: window.confirm** — Replaced native confirm with custom ConfirmDialog for exchange rate changes
- **Settings: form validation** — Added min/max constraints for exchange rate and budget inputs
- **Settings: error feedback** — Replaced silent `.catch()` with toast notifications on save failures
- **Settings: budget stability** — Budget progress bar persists even when input is cleared (saved value fallback)
- **API Key creation** — Added name validation (required), date min attribute (no past dates)
- **API Key status** — Unified with shared StatusBadge component
- **Recharge tooltip** — Disabled button now shows hover tooltip explaining "Coming soon"
- **Redeem codes** — Added hint text that codes auto-capitalize
- **Playground** — Chat history, model/key selections, params, system prompt now persist via localStorage

---

## [v3.3.4.11] — 2026-05-18

### Token Category System Overhaul
- **3-category model** — Replaced confusing 4-category system (input/cache_hit/cache_create/output) with standard 3: Input(non-cached), Input(cache hit), Output
- **calculateCost** — Removed `cached` boolean and `tokensCacheCreation` parameters, simplified to 3-part formula
- **calculateCredits** — Cache-hit tokens now consume credits at reduced rate (proportional to cache_rate/input_rate ratio)
- **deductCreditsOrBalance** — Removed `tokensCacheCreation` parameter, simplified signature
- **Local prompt cache** — Extracted to `lib/prompt-cache.ts`, shared between routes
- **Messages route** — Now uses local prompt cache for providers without cache stats
- **Usage API** — Aggregate and daily trend queries now include token breakdown fields
- **Analytics API** — Queries updated to 3-category model

### Display Updates
- **Usage table** — Columns reordered: Input(non-cached) → Input(cache hit) → Output → Total
- **Usage summary cards** — Token card now shows detailed 3-way breakdown
- **Stats cards** — Token breakdown updated to 3-category labels
- **Model analytics** — Tooltip and summary use 3-category display
- **Model market** — Pricing cards show: Input(non-cached), Input(cache hit), Output
- **Model detail** — Updated pricing labels to match
- **All pages** — Standardized labels: 输入(未命中缓存), 输入(命中缓存), 输出

---

## [v3.3.4.10] — 2026-05-18

### Data Consistency
- **Cost precision unified** — All pages now use `formatPrice` from currency context with consistent decimal places
- **Currency system unified** — Models page now uses shared `useCurrency()` context instead of local state
- **Token rate unit** — All pages now show `/1M tokens` consistently
- **Date timezone** — Fixed missing "+Z" suffix on redeem codes and API keys expiry dates
- **Search labels** — Aligned with rest of site ("Input"/"Output" instead of "in"/"out")
- **Profile stats** — Now uses server-side aggregates instead of last 10 logs

### Admin Panel UX
- **Delete confirmations** — Now show the actual name/code/URL of the item being deleted
- **updated_at displayed** — Webhooks and Plans now show last modified date
- **Settings confirm** — Exchange rate changes now prompt for confirmation
- **Dialog autoFocus** — All create/edit dialogs now auto-focus the first input
- **URL tooltip** — Truncated webhook URLs show full URL on hover
- **total_calls formatted** — API key list now uses locale formatting
- **Channel test results** — Each channel now has independent test result state
- **Count badges** — API Keys and Redeem codes now show total count

### Shared Components
- **StatCard** — Reusable stat card component (8 color variants)
- **StatusBadge** — Reusable status badge (success/error/warning/info/muted)
- **ConfirmDialog** — Reusable confirmation dialog with danger variant
- **LoadingSkeleton** — Reusable loading skeleton

---

## [v3.3.4.9] — 2026-05-18

### Dashboard
- **Token breakdown** — Stats card now splits monthly tokens into non-cached input, cache hit, cache creation, and output
- **Login/register validation** — Client-side email format, password length, and required field checks with inline errors
- **Page jump** — Usage pagination now has "Go to page" input
- **Curl fix** — Placeholder changed to `sk-oort-xxxxxxxxxxxx`, no longer renders before hydration

### Accessibility
- **aria-labels** — Added to model links, sort dropdowns, key toggle/delete buttons (10+ fixes)
- **scope="col"** — Added to all data table headers
- **focus states** — Hover-only buttons now also visible on focus (keyboard/touch)

### SEO
- **Sitemap** — Added /docs, /models, /changelog, /faq, /token-plan, /resources, /search and all doc sub-pages
- **JSON-LD** — Fixed brand name from "AI Skills Hub" to "OortAPI"
- **Doc metadata** — Expanded layout description for all doc pages

### Visual & Interaction
- **FAQ animation** — Smooth expand/collapse transition
- **Monitor icons** — Fixed PhoneCall → Activity for call volume
- **Chart color** — Cost metric changed from red to purple
- **Subscription redirect** — Uses `router.replace` instead of `push`
- **Theme aria-label** — Dynamic "Switch to light/dark mode"
- **Disabled links** — Added tabIndex={-1} to prevent focus
- **Channel URL validation** — Validates http/https format
- **Audit search** — 300ms debounce to prevent excessive API calls
- **Changelog** — 10s timeout + retry on fetch failure

---

## [v3.3.4.8] — 2026-05-18

### New Features
- **Password reset** — Forgot password flow at `/forgot-password` + `/reset-password` pages
- **Remember me** — Login page checkbox for persistent sessions
- **API Key expiration** — Optional expiry date per key with countdown and expired state
- **Create plan UI** — Admin can now create subscription plans from the dashboard
- **Plan comparison table** — Token Plan page now shows a feature comparison table across all plans

### UX Improvements
- **Playground** — Multi-turn conversation history, configurable parameters (temperature/max_tokens/top_p), system prompt input, copy button on responses
- **Usage table** — Sortable columns (click headers to sort by tokens, cost, latency, date)
- **Model detail** — CTA buttons for unauthenticated users ("Sign Up") and logged-in users ("Test in Playground")
- **Model market** — "Load More" pagination (20 per batch)
- **API Key search** — Search/filter keys by name or key value, delete dialog shows key name
- **Channel key visibility** — Eye toggle on API key password field in channel form
- **Channel cost stats** — 24h cost displayed per channel in health data
- **Webhook delivery status** — Last triggered timestamp and status code shown
- **User CSV export** — Admin can export user list as CSV
- **Redeem code search** — Search codes by value, copy button per row
- **SDK docs** — Dynamic base URLs (no more hardcoded localhost)
- **Docs search** — Search input on docs landing page
- **Keyboard shortcut** — Ctrl+K now opens search (was non-functional)

### Dashboard Enhancements
- **Overview** — Error state handling with retry, manual refresh button, last-updated timestamp
- **Monitor** — Auto-refresh every 30s, manual refresh, last-updated, hourly trend chart (ECharts)
- **Billing** — Balance refresh button
- **Settings** — Budget exceeded toast notification

### Other
- **GitHub link activated** — Footer GitHub link now points to the actual repo
- **Ctrl+K shortcut** — Now functional, opens search
- **Register page** — Shows "More sign-in options coming soon" instead of empty space

---

## [v3.3.4.7] — 2026-05-18

### Major — Documentation Overhaul
- **Multi-page docs** — Monolithic single-page `/docs` split into 10 sub-pages with persistent sidebar navigation: Quick Start, Authentication, API Endpoints, SDK Integration, Streaming, Pricing, Error Codes, Rate Limits, Deployment, and Integration Guides
- **Docs sidebar** — Grouped, collapsible navigation sidebar with client-side search filtering, mobile responsive
- **Docs landing page** — Navigation hub with categorized card grid replacing the 920-line single page
- **Shared components** — Extracted `CodeBlock`, `BaseUrlDisplay`, `EndpointRow`, and `DocsSidebar` as reusable components
- **i18n expansion** — Extended `apiDocs` namespace from ~20 to ~90 keys for full bilingual support

### New Pages
- **Changelog** — `/changelog` renders CHANGELOG.md from GitHub with version history
- **FAQ** — `/faq` with 10 expandable common questions (bilingual)
- **Rate Limits** — `/docs/rate-limits` with retry code examples (Python/Node.js)
- **Integration Guides** — `/docs/integrations` with per-app configuration guides

### Improvements
- **Footer** — Added FAQ link, system status indicator (polls `/api/health`)
- **Navbar** — Removed changelog/FAQ from navbar (footer only)
- **Build** — Project now generates 181 static pages (up from 169)

---

## [v3.3.4.6] — 2026-05-18

### New Features
- **Usage trend chart** — ECharts bar chart above usage logs, toggle between cost/tokens/calls dimensions, linked to filters
- **Usage aggregate stats** — Summary cards now show full-filter totals (not just current page), plus daily trend data
- **Usage API Key filter** — Filter usage logs by API Key with a dropdown selector
- **API Key rate limit** — Display and inline-edit RPM rate limit per API Key
- **Per-Key analytics** — Expandable 7-day stats per key: calls, cost, tokens, avg latency, error rate
- **Budget management** — Settings page monthly budget limit with progress bar and threshold alerts
- **System monitor** — Admin dashboard at `/dashboard/admin/monitor`: QPS, error rate, P50/P95 latency, per-provider health (auto-refresh)
- **API Playground** — Interactive page at `/dashboard/playground`: select model + API Key, send messages, streaming response display
- **Channel search & filter** — Search channels by name, filter by status (online/offline/enabled/disabled) and provider type
- **Channel batch operations** — Multi-select channels with checkboxes, batch enable/disable/delete
- **Channel routing matrix** — Toggle view showing model-to-channel mapping with priority and weight
- **Multiplier effective price** — Table shows effective input/output price (base rate × multiplier), plus batch edit
- **Audit log export** — CSV export button and full-text search across action and details fields
- **User activity timeline** — Admin user detail page shows last 20 calls with model, tokens, cost, latency

### Improvements
- **Model detail exchange rate** — Uses system exchange rate setting instead of hardcoded 7.3
- **Search result links** — Search results now link to model detail pages (`/models/{id}`) instead of models list
- **Homepage providers** — ModelWall fetches actual providers from API instead of hardcoded list
- **Billing button UX** — Recharge button shows visible hint text to use redeem codes
- **Toast position** — Moved to bottom-20 to avoid overlap with scroll-to-top button

---

## [v3.3.4.5] — 2026-05-15

### New Features
- **Fetch models from upstream** — Channel management now has a "Fetch Models" button that calls the upstream `/v1/models` endpoint, displays available models in a dialog with checkboxes, and lets you select which models to add. Works in both create and edit mode.

---

## [v3.3.4.4] — 2026-05-15

### Fixes — Site-wide Flickering & UX Overhaul (16 items)
- **Theme FOUC** — Removed hardcoded `dark` class from `<html>`, using synchronous inline script to prevent light-mode flash
- **Double applyTheme** — Fixed theme toggle causing two DOM mutations + overlapping transitions
- **Initial mount transition** — Fixed ThemeProvider playing transition animation on first load
- **UsageChart loading logic** — Fixed "No data" shown before skeleton during load (check order inverted)
- **AuthGuard blank flash** — Fixed skeleton → null → redirect triple-state jump for unauthenticated users
- **use-collections race condition** — Fixed skipPersistRef race causing localStorage cross-contamination on user switch
- **use-follows race condition** — Same fix as above
- **Hooks depending on user object ref** — Fixed use-notifications/use-collections/use-follows depending on full user object causing cascading re-renders
- **Navbar skeleton** — Removed animate-pulse from skeleton, using static placeholder to reduce visual noise
- **Dashboard SWR staggered refresh** — Added `keepPreviousData: true` to prevent skeleton flash on tab switch
- **Pagination skeleton flash** — Usage/Billing pages now keep stale data while revalidating, no more full-table skeleton
- **glass-card skeleton** — Skeletons no longer use backdrop-filter, reducing GPU compositor thrashing
- **Navbar backdrop-blur** — Reduced blur-xl to blur-md, lowering GPU cost on scroll
- **ScrollToTop throttle** — Added rAF throttle + hysteresis threshold (400/300px) to prevent button flickering near threshold
- **Search blur timeout** — Stored blur timeout in ref, clear on focus to prevent dropdown flicker
- **reduced-motion** — Added global catch-all to cover all inline animations (`animate-[fadeIn_...]`)

### Fixes — Business Logic
- **Total tokens double-counting** — Fixed total tokens including cache_hit twice (tokens_in already contains tokens_in_cache)
- **Credit rate calculation** — Fixed credits breakdown total not multiplied by credit_rate; always recalculates with current rate
- **System default currency not applied** — CurrencyProvider now reads system default currency from server
- **Settings page currency sync** — Admin currency changes now sync to localStorage immediately, other pages pick up in real-time

---

## [v3.3.4.3] — 2026-05-15

### New Features
- **Docker one-click deployment** — Added `Dockerfile` (multi-stage build) and `docker-compose.yml` for one-command deployment with persistent SQLite storage
- **First user auto-admin** — First registered user automatically becomes admin; admin can promote others in user management
- **Delete account** — Profile page now supports account deletion with password verification and typed "DELETE" confirmation dialog
- **Change password in profile** — Moved change password from dashboard settings to profile settings tab for better UX

### Fixes
- **Usage page SQL error** — Fixed COUNT query alias mismatch (`u.user_id` → `user_id`) that caused empty usage logs
- **Usage page filter bar** — Added manual filter button; filters only apply on click, not on page load
- **Date range filter** — Fixed "to" date to include all records on that date (`created_at < date(?, '+1 day')`)
- **Docker schema.sql** — Fixed `schema.sql` not being copied into Docker image, causing registration to fail

### Changed
- **Dashboard settings cleanup** — Removed account settings (username/bio) and change password from dashboard settings (now in profile); dashboard settings only shows API endpoint + system settings (admin)

---

## [v3.3.4.2] — 2026-05-14

### Critical Fixes
- **Channel latency stats bug** — Fixed SQL query referencing wrong column `api_key_id` → `channel_id` in latency statistics
- **Login brute-force protection** — Added IP-based rate limiting (5 attempts/60s window, 15min lockout on exceeded)
- **API Key hash storage** — API keys now stored as SHA-256 hashes instead of plaintext; legacy keys auto-migrated on first use

### New Features — Developer Experience
- **Usage log filters** — Added model search, status filter, and date range picker to call logs page
- **CSV export** — Usage logs can now be exported as CSV with `?format=csv` endpoint and download button in UI
- **Model detail pages** — Each model now has a dedicated page showing pricing, 7-day stats, and available channels (`/models/[model]`)
- **Model tags** — Models support categorization tags (e.g., `vision`, `reasoning`); filterable on models page
- **OpenAPI spec unification** — Single unified OpenAPI spec at `/api/v1/openapi` and `/api/docs/openapi.json`

### New Features — Platform Capabilities
- **Audit log UI** — Full audit trail page at `/dashboard/admin/audit` with filtering by action, target type, date range
- **Webhook management** — CRUD webhook management at `/dashboard/admin/webhooks` with event config and test delivery
- **Channel health dashboard** — Channels page now shows 24h success rate, avg latency, and status overview cards
- **Channel health history** — New `channel_health_log` table tracking status changes over time with 7-day trends
- **User activity stats** — User detail page at `/dashboard/users/[id]` showing total calls, tokens, cost, top models, 7-day trend
- **Plan analytics** — Admin plans page now shows per-plan subscriber count, monthly revenue, and credit usage rate
- **Config export/import** — Settings page supports exporting full config (settings + channels + models + plans) as JSON and importing back
- **Redeem code batch operations** — Select multiple codes with checkboxes for batch enable/disable/delete
- **User batch operations** — Select multiple users for batch enable/disable and bulk balance grants
- **Real-time usage logs** — Call logs page now polls every 30s with live indicator, pause button, and new row highlighting
- **Plan upgrade/downgrade** — Users can switch plans with prorated credits carried over to the new plan
- **Subscription expiry reminder** — Dashboard shows warning banner when subscription expires within 3 days (auto-renew off)

### Database Migrations
- `model_rates.tags` — Added TEXT column for model categorization tags
- `usage_logs.is_stream` — Added INTEGER column tracking streaming requests
- `usage_logs.request_size_bytes` — Added INTEGER column tracking request payload size
- `channel_health_log` — New table for channel health history tracking

---

## [v3.3.4.1] — 2026-05-14

### Critical Fixes
- **Onboarding link** — Fixed broken link `/dashboard/api-keys` → `/dashboard/keys`
- **API Key creation toast** — Fixed wrong message (showed "Copied" instead of "API Key created")
- **Channel PATCH existence check** — Updating non-existent channel now returns 404 instead of silent 200
- **Channel API key mask** — Channels list now shows `••••••••abcd` instead of leaking first 10 chars

### UX Improvements
- **Usage chart currency** — Tooltip now uses currency context instead of hardcoded `$`
- **Billing redeem toast** — Redeem success message now uses dynamic currency symbol
- **Stats cards label** — "Total Spent" renamed to "Monthly Cost" to match actual data
- **API Key last_used** — Now shows relative time ("3h ago") instead of raw ISO string
- **Usage expanded row** — Added close (X) button for collapsing detail rows
- **Multiplier delete confirmation** — Delete now requires confirmation dialog
- **Users page confirmations** — Cancel subscription, gift, and add credits now require confirmation
- **Users search debounce** — Search input now debounces 300ms instead of firing on every keystroke
- **Redeem form validation** — Empty/invalid amounts now show error instead of submitting
- **Billing history pagination** — Now paginated (20 per page) instead of loading all records
- **Billing API pagination** — `/api/dashboard/billing` now supports `limit` and `offset` params

### Internationalization
- **Hero stats** — "30+ AI Models", "< 200ms Latency", "99.9% Uptime" now bilingual
- **Docs CopyButton** — Copy button title changed from hardcoded "复制" to bilingual
- **Dashboard Quick Start** — Code block now has a copy button (hover to reveal)

### UI/Interaction
- **Sidebar active state** — Fixed overly broad matching (e.g., `/dashboard/settings` no longer highlights for `/dashboard/setting`)
- **Footer pricing link** — Fixed "Pricing" link pointing to `/models` instead of `/token-plan`
- **Navbar dashboard link** — Dashboard link hidden for unauthenticated users
- **Mobile sheet toggles** — Mobile navigation sheet now includes language and theme toggles
- **Dashboard breadcrumbs** — Auto-generated breadcrumb navigation from URL path segments
- **Usage chart skeleton** — Loading state now shows animated card skeletons instead of blank
- **Sidebar mobile collapse** — Navigation menu on mobile is now collapsible with chevron toggle
- **Native select styling** — All `<select>` elements (settings, multiplier) now use consistent form input styling

### Internationalization (Batch 2)
- **Docs page full i18n** — All section headers, endpoint descriptions, error codes, pricing tiers, and auth descriptions now bilingual via comprehensive DOCS_LABELS

### Backend/Security
- **Email validation** — Registration now validates email format server-side
- **Channel PATCH** — Returns 400 if no fields provided, 404 if channel not found
- **Username length** — Profile update username limit aligned to 2-32 characters (was 2-50)

---

## [v3.3.4] — 2026-05-14

### User Experience & Product Improvements

#### New User Onboarding
- **Dashboard onboarding** — New users (no API keys + no subscription) now see a 3-step guide: Create Key → Choose Plan → Start Calling

#### Mobile Responsiveness
- **Usage table responsive** — 14-column usage table now hides secondary columns on mobile (cache tokens, multiplier, latency, notes), showing only core info (model, total, cost, status, time)

#### Error Feedback
- **Admin page error toasts** — All CRUD operations in multiplier, channel-card, and admin/plans now show success/error toast notifications (previously silently swallowed errors)

#### Documentation
- **Code block copy buttons** — All code blocks on the docs page now have a copy button in the top-right corner (visible on hover)

#### Forms & Interaction
- **Register password hint** — Password field shows "At least 8 characters" helper text below (visible before typing)
- **Recharge button** — Recharge button now disabled with tooltip "Coming soon, use redeem codes" (previously showed toast on click)

#### Internationalization
- **Hero badge** — Homepage "Unified AI API Gateway" badge now supports Chinese/English switching
- **Auth error boundary** — Error fallback UI now shows both Chinese and English text

#### Button Consistency
- **Delete dialog buttons** — All delete confirmation dialogs now use consistent `bg-red-600` styling (previously mixed with `variant="destructive"`)

---

## [v3.3.3] — 2026-05-14

### Security Fixes, Race Condition Patches, Rate Limit Headers, Audit Log & Performance

#### Critical Security Fixes
- **Disabled user blocking** — Login now returns 403 for disabled accounts; `/api/auth/me` and cookie validation check `enabled = 1`
- **Redeem race condition** — Atomic `UPDATE ... WHERE current_uses < max_uses` prevents double-spend on redeem codes
- **Credits race condition** — Atomic `UPDATE ... WHERE credits_remaining >= ?` prevents TOCTOU on subscription credit deduction
- **Error message sanitization** — Gateway no longer leaks upstream error details to clients

#### Gateway Improvements
- **Upstream fetch timeout** — Added 180s `AbortSignal.timeout` to upstream fetch; returns 504 on timeout instead of hanging
- **Rate limit headers** — All v1 API responses now include `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` headers
- **Input validation** — Chat completions now validates `temperature` (0-2), `max_tokens` (1-1M), and non-empty messages array

#### Security Headers & CORS
- **Security headers** — Middleware now sets `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, and `HSTS` (production)
- **CORS configuration** — API routes support configurable origins via `CORS_ORIGINS` env var; preflight OPTIONS handled

#### Admin Audit Log
- **Audit log system** — New `audit_log` table tracks all admin actions (user/channel/model/redeem management)
- **Audit log API** — `GET /api/dashboard/audit` returns paginated audit trail for admins
- **Audit logging** — User updates/deletes, channel CRUD, model rate CRUD, redeem code CRUD all logged

#### New Endpoints
- **Health check** — `GET /api/health` returns service status, DB latency, channel count, active users

#### Data Integrity
- **Plan seed no longer overwrites admin config** — Changed `ON CONFLICT DO UPDATE` to `ON CONFLICT DO NOTHING` for subscription plans; `plan_models` seed uses `INSERT OR IGNORE` instead of `DELETE + INSERT`

#### Performance
- **New DB indexes** — Added `model_rates(model_name)`, `user_subscriptions(user_id, status, current_period_end)`, `channels(enabled, priority)`, `usage_logs(api_key_id)`, `audit_log(admin_id, created_at)`

#### UI Fixes
- **Balance display precision** — All balance/price displays now use `formatPrice()` from currency context (consistent USD/CNY formatting)
- **Billing history auto-refresh** — Billing history component now uses SWR instead of manual `useState` + `useEffect`
- **Usage log pagination** — Usage page now has Previous/Next pagination (50 per page)

#### Middleware
- **Request body size limit** — API routes now reject requests with `Content-Length > 10MB` (returns 413)

#### v3.3.3 Additions

#### Confirm Dialogs & Accessibility
- **Confirm dialog replacement** — Native `confirm()` in `api-key-table.tsx` and `token-plan/page.tsx` replaced with UI Dialog components
- **aria-label accessibility** — Added `aria-label` to all icon-only interactive buttons (7 files, 15 instances)

#### Smart Channel Selection
- **Latency-aware load balancing** — Channel selection now dynamically adjusts weights based on recent average latency, preferring faster channels

#### Subscription Auto-Renew
- **Auto-renew logic** — `processAutoRenewals()` automatically renews expired subscriptions when balance is sufficient
- **Maintenance endpoint** — `POST /api/dashboard/maintenance` supports `action=auto_renew` for manual renewal trigger

#### Webhook Support
- **Webhooks table** — New `webhooks` table stores URL, secret, and event subscriptions
- **Webhook API** — `GET/POST/PATCH/DELETE /api/dashboard/webhooks` for webhook management
- **Webhook dispatch** — `dispatchWebhook()` sends HMAC-signed POST requests after key events

#### Graceful Degradation
- **503 + Retry-After** — Returns 503 status with `Retry-After: 5` header when all channels fail
- **Header forwarding** — Gateway response headers (e.g. `Retry-After`) now correctly propagated to clients

#### OpenAPI Spec Expansion
- **New endpoint docs** — Added OpenAPI definitions for `/v1/messages`, `/v1/billing/redeem`, `/api/dashboard/models`, `/api/dashboard/users`, `/api/dashboard/audit`, `/api/dashboard/webhooks`, `/api/health`, `/api/plans`

#### Session Management
- **Session tracking** — Login creates session record, max 10 concurrent sessions per user
- **Logout cleanup** — `DELETE /api/auth/me` deletes current session

#### Database Backup & Maintenance
- **Backup endpoint** — `GET /api/dashboard/backup` uses `VACUUM INTO` for consistent SQLite backup
- **Maintenance endpoint** — `POST /api/dashboard/maintenance` supports log cleanup and VACUUM

#### Model Aliases & Deprecation
- **Model aliases** — `model_rates` table supports `alias_for` field; requests auto-route to alias target
- **Deprecation warning** — Deprecated models return `X-Deprecation-Warning` header

#### API Key Permissions
- **Permission enforcement** — Gateway now parses API Key `permissions` JSON and enforces model whitelist

#### Rate Limiter Persistence
- **SQLite persistence** — Rate limiter uses `rate_limit_counters` table; survives restarts
- **In-memory cache** — Memory cache with periodic DB sync (every 5 increments)

---

## [v3.3.2] — 2026-05-14

### Security Hardening, Gateway Failover, Middleware Auth & Feature Upgrades

#### Security Fixes
- **Auth validation** — Added explicit API key validation in completions and images routes before processing
- **Settings access control** — Regular users can only read public settings (currency, exchange_rate, timezone); admin-only keys are filtered
- **Balance race condition** — `addBalance` now uses atomic SQL (`balance = balance + ?`) to prevent TOCTOU on concurrent recharges
- **Decrypt failure** — `decrypt()` now throws on failure instead of silently returning ciphertext
- **Error message sanitization** — Redeem route no longer leaks internal error details to clients

#### Gateway Improvements
- **Channel failover retry** — Gateway automatically retries up to 3 channels on 5xx upstream errors
- **Stream health reporting** — `reportChannelSuccess` deferred to stream completion, not stream start
- **JSON parse error handling** — Non-JSON upstream responses are caught and return 502 instead of crashing
- **Tool call passthrough** — `tools`, `tool_choice`, `functions`, `function_call` and other OpenAI params are now forwarded to upstream providers
- **Overnight multiplier fix** — Time-based multiplier now correctly handles overnight ranges (e.g., 22:00-06:00)
- **Rate limiter fix** — Denied requests no longer increment the counter (check before increment)

#### New Features
- **X-Request-Id** — Middleware generates a unique request ID for every request, added to response headers for tracing
- **Dashboard auth middleware** — `/dashboard/*` routes are now protected by middleware; unauthenticated users redirect to login
- **OpenAPI 3.0 spec** — `GET /api/v1/openapi` returns the full API specification for all endpoints
- **Model sorting** — Model marketplace now has a sort dropdown (name A-Z/Z-A, input price, output price)
- **Dynamic homepage stats** — Platform stats (total calls, uptime, latency, model count) are now fetched from real data via `/api/stats`

#### Code Quality
- **estimateTokens deduplication** — Removed duplicate function from 3 files, exported from `api-gateway.ts`
- **React anti-pattern fix** — `api-key-table.tsx` changed `useState` initializer to `useEffect` for data fetching
- **alert() → toast** — Replaced all `alert()` calls with toast notifications in users and redeem pages
- **Profile input validation** — Username (2-50 chars), avatar (max 1MB), bio (max 500 chars) validation on PATCH
- **API key bounds** — `rate_limit` clamped to 1-10000 on create/update
- **Multiplier try/catch** — POST/DELETE handlers wrapped in try/catch for malformed JSON
- **Schema safety** — `schema.sql` uses `INSERT OR IGNORE` instead of `DELETE FROM` to preserve existing data
- **Plan dedup fix** — Added UNIQUE constraint on plan name; seed code uses ON CONFLICT to upsert instead of DELETE+INSERT (foreign key constraint was silently blocking DELETE)

#### Navigation & UI Fixes
- **Resources center hub** — `/resources` page now serves as a proper hub showing all resource sections (Agent Skills, Prompt Templates, Categories, Trending, Tags, Submit)
- **Navbar link fix** — "Resources" nav link now points to `/resources` hub instead of directly to `/skills`
- **Footer cleanup** — Removed "Guide" link from footer (guide page was deleted); resources section now lists Agent Skills, Prompt Templates, Categories
- **Swagger UI fix** — Added missing CSS imports and Tailwind preflight resets for `/docs/api-reference` page
- **Navbar cleanup** — Removed duplicate "Dashboard" menu item; search now redirects to `/search`
- **Profile plan display** — Recent calls now shows credits used instead of dollar cost for subscription users
- **Search rewrite** — Search page now queries AI models and documentation instead of Agent Skills and Prompt Templates
- **Subscription credits bug** — Upgrading a plan now correctly carries over consumed credits instead of resetting to full
- **Auto-refresh with SWR** — Dashboard stats, usage logs, API keys, model analytics, and profile now auto-refresh every 30s and on tab focus

---

## [v3.3.1] — 2026-05-13

### Token Plan Subscription System, Currency Toggle, VIP Card Effects & Number Format Fix

#### New Features
- **Token Plan Subscription System** — New `/token-plan` page with 4 subscription tiers (Spark/Flare/Pulse/Nova), supporting monthly/yearly billing toggle and USD/CNY currency switching
- **Subscription Logic** — Supports new subscriptions, upgrades (prorated by remaining period), and downgrades (blocks if consumed credits exceed target plan's monthly limit)
- **SubscriptionCard Component** — 4-tier themed designs (spark blue-purple, flare green, pulse orange, nova purple) with CSS box-shadow glow effects and decorative background circles
- **Admin Plans Management** — `/dashboard/admin/plans` page with unified currency toggle, enlarged edit dialog (`max-w-4xl`)
- **Timezone Configuration** — System settings now include timezone option (default Asia/Shanghai), configurable by admin in settings page
- **System Settings API** — `timezone` added to `ALLOWED_KEYS`

#### UI Improvements
- **Number Format Fix** — All token counts now use `toLocaleString()` with thousand separators (e.g., 473,600), replacing K/M abbreviations
- **Subscription Dashboard Card** — My subscription uses compact SubscriptionCard, removed concurrency and credits details display
- **Token Plan Page** — Homepage shows 4 themed subscription cards, buttons adapt to current subscription status (current plan/upgrade/switch/subscribe)
- **Downgrade Protection** — Blocks downgrade when consumed credits exceed target plan's monthly credits limit, returns 409 error

#### Bug Fixes
- **Yearly Billing Toggle Unresponsive** — Token Plan page yearly button not responding, fixed billingCycle prop passing
- **Edit Dialog Credits Truncation** — Credits field showing "7000" instead of "70000000", enlarged dialog and reorganized layout

---

## [v3.3.0] — 2026-05-12

### Analytics Charts, Tool Calling Fix, Profile Redesign & UX Improvements

#### New Features
- **Model Analytics with ECharts** — New model consumption analytics embedded in overview page: stacked bar chart (per-model **token usage** by day/hour), pie chart (call distribution), and trend line chart (call count). All charts share per-model color mapping
- **Standalone Model Marketplace** — Models page moved from `/dashboard/models` to `/models` as a standalone page (no sidebar). Top navbar now shows: Home → Dashboard → Models → Docs → Resources
- **Complete Docs Rewrite** — `/docs` page rewritten with clear sections: Quick Start (3-step with Base URL), AI App Integration (ChatBox, Cherry Studio, Open WebUI, etc.), SDK Integration, cURL Examples, Streaming, API Endpoints, Pricing, Error Codes
- **Profile Page Redesign** — Rewrote profile page for OortAPI: overview tab (balance, total calls, total tokens, total cost stats + quick links to dashboard + recent usage table) and settings tab (profile editing, theme preference)
- **Anthropic Messages API** — New `/api/v1/messages` endpoint supporting Anthropic native format with full tool_use/tool_result conversion between OpenAI and Anthropic formats
- **Multiplier Rules** — New `/api/dashboard/multiplier` endpoint for per-model and time-based pricing multipliers

#### Critical Bug Fixes
- **Tool Calling Passthrough** — Fixed gateway not forwarding `tools`, `tool_choice`, `functions`, `function_call`, `response_format`, `stop`, `seed`, `presence_penalty`, `frequency_penalty` to upstream providers. Models were outputting raw `<tool_code>` text instead of proper tool calls
- **Timestamp Timezone Fix** — SQLite stores UTC via `CURRENT_TIMESTAMP` but frontend displayed UTC time without conversion. All `new Date(timestamp)` calls now append `"Z"` suffix so JavaScript correctly interprets UTC and converts to user's local timezone
- **Model Price Edit Bug** — Edit form in model marketplace displayed CNY values but labeled as USD, and saved CNY prices as USD. Fixed to correctly convert between currencies on display and save

#### UI Improvements
- **Dashboard Layout Widened** — Changed `max-w-7xl` to `max-w-[1600px]` across dashboard and models pages for better large-screen experience
- **OortAPI Footer** — Replaced old "AI Skills Hub" footer with OortAPI-branded footer: Product, Features, Resources, Community sections with platform list (OpenAI, Anthropic, Google, DeepSeek, Qwen)
- **Resource Hub Update** — Updated from 2 cards (Prompts + Skills) to 3 cards (Agent Skills + Prompt Templates + API Docs)
- **Usage Page Currency** — Cost column and cost breakdown now follow currency setting (USD/CNY) instead of hardcoded `$`

#### Analytics Controls
- **Time Dimension Rework** — "By Day" mode: range buttons (7/14/30) control X-axis date range. "By Hour" mode: X-axis shows fixed 24h slots (00:00~23:00), range buttons hidden
- **Complete X-axis** — All date/hour slots always shown even when no data exists for that period, ensuring the selected range is always visually represented
- **Button Highlight Fix** — Selected range and granularity buttons now use `bg-primary text-primary-foreground` for clear active state
- **Y-axis Unit Label** — Stacked bar chart Y-axis shows "tokens" unit, trend chart shows "calls" unit (previously both showed the same metric)
- **Pie Chart Fix** — Legend moved to horizontal bottom with leader lines, eliminating label overlap

#### Navigation Restructure
- **Top Navbar** — New order: Home, Dashboard, Models (→ /models), Docs, Resources
- **Dashboard Sidebar** — Models removed from sidebar (now a top-level page). Sidebar keeps: Overview, API Keys, Usage, Billing, Channels, Users, Redeem, Settings
- **Old Route Redirect** — `/dashboard/models` redirects to `/models`

#### Bug Fixes
- **crypto.randomUUID** — Replaced with `Math.random()` + `Date.now()` for non-secure contexts (HTTP LAN access)

#### Documentation
- **Docs Page** — Structured sections: Quick Start (Base URL + 3-step), AI App Integration (ChatBox, Cherry Studio, Open WebUI, NextChat, LobeChat), SDK, cURL, Streaming, Endpoints, Pricing, Errors
- **README / README_CN** — Updated project structure (models at `/models`), updated dashboard descriptions
- **CHANGELOG / CHANGELOG_CN** — Added v3.3.0 entry

---

## [v3.2.0] — 2026-05-12

### UI Redesign, Security & Billing Enhancements

#### New Features
- **Recharts Usage Charts** — Replaced CSS bar charts with real interactive charts (BarChart for calls + LineChart for cost trend) using Recharts
- **Cache Creation Pricing** — Added `cache_creation_rate` to model_rates table, enabling separate pricing for cache write operations (previously hardcoded at 1.25x input_rate). Full CRUD support in models API
- **Currency Switching (USD/CNY)** — Users can toggle between USD ($) and CNY (¥) on models, usage, and billing pages. Exchange rate is admin-configurable via system settings (default 7.3). Preference saved in localStorage
- **System Settings API** — New `GET/PATCH /api/dashboard/settings` endpoint for admin to manage site-wide settings (currency, exchange_rate, etc.)
- **Admin Password Reset** — Admins can reset any user's password from the user management page. Generates a secure 12-character random password shown once with copy-to-clipboard
- **Channel API Key Encryption** — All channel API keys are now encrypted at rest using AES-256-GCM. Legacy plaintext keys are transparently decrypted for backward compatibility. Dashboard shows masked keys (first 10 chars + "...")

#### Model Marketplace Redesign
- **Card Grid Layout** — Replaced table list with responsive card grid (1-3 columns) with provider filter buttons and search
- **4-Price Display** — Each model card shows: Input, Output, Cache Read, Cache Write prices
- **Currency Toggle** — Switch between USD/CNY directly on the marketplace page
- **Sidebar Reorder** — Models moved to position 2 (Overview → Models → API Keys → Usage → ...)

#### Channel Health Monitoring
- **Health API** — `GET /api/dashboard/channels?action=health` returns per-channel 24h stats: success rate, average latency, call count
- **Inline Health Metrics** — Channel cards now display 24h success rate (color-coded: green ≥95%, yellow ≥80%, red <80%), average latency, and call count

#### Bug Fixes
- **Usage Log Cache Columns** — Fixed `/api/v1/billing/usage` SELECT missing `tokens_in_cache` and `tokens_cache_creation`, causing "-" in the dashboard table

#### Database
- **New column** `model_rates.cache_creation_rate` — REAL DEFAULT 0 (migration-safe)
- **New settings** in `system_settings`: `currency` (default USD), `exchange_rate` (default 7.3)

#### Security
- **AES-256-GCM Encryption** — Channel API keys encrypted with derived key from `ENCRYPTION_KEY` env variable. Graceful fallback for legacy plaintext keys
- **Masked API Key Display** — GET /api/dashboard/channels returns masked keys (first 10 chars) instead of full encrypted values

---

## [v3.1.0] — 2026-05-11

### Admin & Billing Enhancements

#### New Features
- **User Management** (`/dashboard/users`) — Admin-only page to list, search, filter users; edit roles (user/admin); credit/deduct balance; enable/disable users; delete users with cascade cleanup
- **Redeem Code System** — Admin creates batch redeem codes (`RC-XXXXXXXX`), users redeem via billing page for instant balance credit. Supports max uses, expiration, enable/disable toggle
- **Model Marketplace** (`/dashboard/models`) — Admin pricing management with per-model input/output/cache rates; sync models from channels
- **API Documentation** (`/docs`) — Swagger UI with full OpenAPI 3.0 spec covering all 18+ endpoints

#### Streaming & Token Tracking
- **Cache Token Tracking** — Tracks `cached_tokens` and `cache_creation_input_tokens` separately in usage logs and billing (3-tier pricing: normal input, cache read at cache_rate, cache write at 1.25x input_rate)
- **Streaming Token Counting** — Parses SSE chunks for accurate input/output/cache token counts from upstream `stream_options.include_usage`
- **Usage Page Cache Columns** — New "Cache Hit" and "Cache Create" columns in usage logs table

#### Channel Management (Phase 1)
- **Inline Edit** — Edit channel name, type, API key, base_url, weight, priority, models
- **Connection Test** — `GET /v1/models` test against upstream with latency measurement
- **Model Mapping** — Key-value UI for mapping requested model names to upstream names
- **Sync Models** — Copy channel models to model_rates table with one click
- **Delete Confirmation** — Dialog before destructive delete
- **Rate Limited Status** — Upstream 429 now sets `rate_limited` instead of `offline`

#### Security
- **JWT Secret Enforcement** — Production builds throw if JWT_SECRET is the default value
- **Anthropic Auth Fix** — Correct `x-api-key` + `anthropic-version` headers; routes to `/v1/messages` endpoint
- **Removed Insecure Reset Password** — Deleted `/api/auth/reset-password` (required no auth). Users must log in and use change-password
- **Removed Legacy Admin** — Deleted `/admin` pages (localStorage-based, from AI Skills Hub era). All admin functionality now in `/dashboard` with role-based access

#### Database
- **New table** `redeem_codes` — code, amount, enabled, max_uses, current_uses, created_by, expires_at
- **New column** `users.enabled` — INTEGER DEFAULT 1 (migration-safe)

#### OpenAPI Spec
- **New endpoints in spec**: `/api/dashboard/users`, `/api/dashboard/redeem`, `/api/v1/billing/redeem`, `/api/dashboard/models`
- **Updated schemas**: UsageLog includes `tokens_in_cache` and `tokens_cache_creation`; Channel includes `rate_limited` status

#### API Routes (22 endpoints total)
- New: `GET/PATCH/DELETE /api/dashboard/users`, `GET/POST/PATCH/DELETE /api/dashboard/redeem`, `POST /api/v1/billing/redeem`, `GET/POST/PATCH/DELETE /api/dashboard/models`
- Removed: `POST /api/auth/reset-password`

---

## [v3.0.0] — 2026-05-11

### Strategic Transformation: AI API Relay Platform

**OortAPI** (formerly AI Skills Hub) is now a full-stack AI API relay platform. The resource aggregation features (skills, prompts, categories) remain available under `/resources/`.

#### Backend (New)
- **SQLite Database** — `better-sqlite3` with 7 tables: users, api_keys, channels, model_rates, usage_logs, billing_records, system_settings
- **JWT Authentication** — Server-side auth with httpOnly cookies, PBKDF2 password hashing (replacing localStorage-based auth)
- **Unified API Gateway** — OpenAI-compatible endpoints at `/api/v1/`:
  - `POST /api/v1/chat/completions` — Chat completions with streaming support
  - `POST /api/v1/completions` — Text completions
  - `POST /api/v1/images/generations` — Image generation
  - `POST /api/v1/embeddings` — Text embeddings
  - `GET /api/v1/models` — Available models with pricing
  - `GET /api/v1/billing/balance` — Check account balance
  - `GET /api/v1/billing/usage` — Usage history with pagination
- **Smart Channel Routing** — Weighted random selection with automatic failover (3 consecutive failures → 5min cooldown)
- **Per-Token Billing** — Model-specific rates, prepaid balance system, automatic deduction after each call
- **Rate Limiting** — In-memory sliding window (default 60 req/min per API key)
- **API Key Management** — `sk-oort-` prefixed keys with per-key rate limits and permissions

#### Dashboard (New)
- **Overview** (`/dashboard`) — Today's stats (calls, success rate, cost, latency), monthly summary, 7-day usage chart, top models
- **API Keys** (`/dashboard/keys`) — Create, toggle, delete API keys with copy-to-clipboard
- **Usage Analytics** (`/dashboard/usage`) — Detailed usage data with pagination
- **Billing** (`/dashboard/billing`) — Balance display and billing history
- **Channels** (`/dashboard/channels`) — Admin-only channel CRUD with connection testing
- **Settings** (`/dashboard/settings`) — Profile editing and password change

#### API Routes (16 endpoints)
- Auth: `/api/auth/login`, `/api/auth/register`, `/api/auth/me`, `/api/auth/profile`, `/api/auth/reset-password`, `/api/auth/change-password`
- Dashboard: `/api/dashboard/stats`, `/api/dashboard/keys` (CRUD), `/api/dashboard/channels` (CRUD)
- API v1: `/api/v1/chat/completions`, `/api/v1/completions`, `/api/v1/images/generations`, `/api/v1/embeddings`, `/api/v1/models`, `/api/v1/billing/balance`, `/api/v1/billing/usage`

#### Homepage Redesign
- New hero section focused on API relay value proposition
- Core feature cards (unified interface, smart routing, fine-grained billing, security)
- AI provider logo wall (OpenAI, Anthropic, Google, Meta, DeepSeek, etc.)
- Platform real-time stats
- Resource hub entry point (secondary positioning)

#### Infrastructure
- **Project rename** — ai-skills-hub → OortAPI, version 3.0.0
- **Database** — SQLite via better-sqlite3 with lazy singleton Proxy pattern
- **Auth migration** — localStorage → JWT + httpOnly cookie
- **Password hashing** — SHA-256 → PBKDF2
- **Resource migration** — Existing pages moved to `/resources/` prefix
- **i18n** — New `dashboard`, `apiDocs`, `resources` translation sections (~130 new keys)
- **Dependencies** — Added better-sqlite3, nanoid, zod, recharts

---

## [v2.8.1] — 2026-05-11

### Feature: Navbar Avatar Dropdown Menu

- **Avatar dropdown** — Replaced direct link with dropdown menu containing: User Center, Settings, Admin Panel (admin-only), and Logout
- **Keyboard navigation** — ArrowUp/Down/Escape support with `role="menu"` and `role="menuitem"` ARIA attributes
- **Outside-click dismissal** — Click outside closes the dropdown
- **Visual indicator** — ChevronDown arrow next to avatar rotates on open
- **i18n** — Uses existing keys (`t.common.profile`, `t.profile.settings`, `t.admin.title`, `t.common.logout`)

---

## [v2.8.0] — 2026-05-10

### Full-Site Audit — 30 Bug Fixes

#### Critical (4)
- **Missing Suspense in submit/status** — `useSearchParams()` component not wrapped in `<Suspense>`, causing production runtime error
- **prompt-versions.ts SSR crash** — `localStorage` called without SSR guard, throwing during server-side rendering
- **use-notifications.ts stale closure** — `markAsRead`/`markAllRead`/`clearAll`/`addNotification` captured stale `user` reference; now uses `userEmailRef`
- **use-follows.ts persist race condition** — `skipPersistRef` reset to `false` before persist effect ran, writing intermediate state to localStorage; now uses `requestAnimationFrame`

#### Memory Leaks & Resource Cleanup (3)
- **Avatar crop Object URL leak** — `URL.createObjectURL()` never revoked; added `URL.revokeObjectURL()` after image load
- **GitHub import timeout leak** — 1500ms `setTimeout` not cleaned up on dialog close; added `useRef` + `useEffect` cleanup
- **Lightbox setTimeout leak** — Focus timeout could fire after rapid screenshot navigation

#### Data Integrity (4)
- **Comment activity cleanup ID mismatch** — Activity created with `crypto.randomUUID()`, delete matched on `commentId`; added `commentId` field to activity entries
- **settings-tab incomplete data clearing** — `handleClearData` missed `likes`, `bookmarks`, `submissions`, `comments`, `activity` user-scoped keys
- **Date.now() ID collision** — 4 files using `Date.now()` for IDs replaced with `crypto.randomUUID()`: `create-from-github.tsx`, `create-from-upload-prompt.tsx`, `skills/[id]/client.tsx`, `prompts/[id]/client.tsx`
- **Clipboard API no error handling** — `navigator.clipboard.writeText()` not awaited/caught; now uses `.then().catch()`

#### Hydration Mismatches (4)
- **tags/loading.tsx `Math.random()`** — Skeleton width differed between SSR and client; changed to deterministic `40 + ((i * 17) % 60)`
- **theme-context.tsx initial state** — `useState` initializer read localStorage, producing different value from SSR
- **use-user-local-storage.ts SSR crash** — `crypto.randomUUID()` may not exist during SSR; added `typeof window` guard
- **use-user-storage.ts guest key mismatch** — SSR returned `"ssr-guest"`, client returned real UUID; added SSR guard

#### Accessibility (6)
- **notification-tab.tsx div no keyboard support** — Notification items used `<div onClick>` without `role="button"`, `tabIndex`, or `onKeyDown`
- **notification-bell.tsx missing aria-labels** — `markAllRead` and `clearAll` buttons only had `title`; changed to `aria-label`
- **Admin delete button no aria-label** — Comment delete button had only icon; added `aria-label`
- **command-palette.tsx Ctrl+K captures input fields** — Global shortcut didn't check `e.target`; now skips INPUT/TEXTAREA/contentEditable
- **comment-section delete confirm no aria-live** — Added `role="alert"` and `aria-live="polite"`
- **notification-bell handleKeyDown stale closure** — `handleNotificationClick` missing from `useCallback` deps

#### Style & UI (2)
- **tag-chip.tsx `inline-block` + `flex` conflict** — `flex` overrides `inline-block`; changed to `inline-flex`
- **markdown-renderer.tsx sanitize inconsistency** — Server used regex, client used DOMPurify producing different output; unified to regex, removed DOMPurify dependency

#### useEffect Dependencies (4)
- **my-comments-tab.tsx** — `useEffect` depended on `user` object (new ref each render); changed to `user?.email`
- **activity-timeline.tsx** — Same fix
- **usage-history-tab.tsx** — Same fix
- **stats-dashboard.tsx** — Same fix

#### Dead Code Cleanup (2)
- **use-keyboard-shortcuts.ts** — Empty file with no exports; deleted
- **theme-context.tsx `isInitialRef`** — Set but never read; removed

#### Hardcoded Strings (1)
- **notification-tab.tsx "unread"** — Hardcoded English; changed to locale-aware display

---

## [v2.7.1] — 2026-05-10

### Agent Skills Cleanup
- **Removed 21 non-skill entries** — LangChain, CrewAI, FastAPI, etc. without SKILL.md removed from skills marketplace (29→8)
- **Added SKILL.md** — All 8 remaining skills now include a SKILL.md in their files object with trigger conditions and feature descriptions
- **Fixed mock-agent-skills.ts** — Cleaned up orphaned code from failed edits, restored file validity
- **Updated docs** — README/README_CN skill count reverted to 8

---

## [v2.7.0] — 2026-05-09

### Agent Skills Marketplace (21 new skills)
- **21 new real-world open-source skills** added (8→29 total), all MIT/Apache-2.0 licensed:
  - **AI Frameworks**: LangChain, CrewAI, LlamaIndex, Semantic Kernel, Pydantic AI, Guidance, Haystack, Letta
  - **Data Tools**: Vanna, Plotly Dash, Chroma, Qdrant
  - **ML Tools**: HuggingFace Transformers, Mem0, Gradio, Streamlit
  - **Research Tools**: GPT Researcher, Jina Reader
  - **Web Frameworks**: FastAPI, Screenshot-to-Code
  - **Developer Tools**: Aider
- Each skill includes: full README, file templates, install commands, demo I/O, tags, license info
- Categories: Research, Data Analysis, Productivity, Web Development, DevOps, Design, Content Creation
- Collections: AI Frameworks, Data Tools, Research Tools, ML Tools, ML Models, Web Frameworks, AI Infrastructure, Enterprise SDKs, Developer Tools, Content Tools

### Hooks Reliability (4 fixes)
- **useUserLocalStorage SSR fix** — `crypto.randomUUID()` lazy-initialized to avoid SSR crash
- **useCollections persist fix** — localStorage writes moved from setState updaters to `useEffect` watchers
- **useFollows persist fix** — Same pattern + cross-tab sync guard via `skipPersistRef`
- **useUserLocalStorage deserialize** — Wrapped in `useRef`, removed from useEffect deps

### Rules of Hooks (2 fixes)
- **prompts/[id] hooks order** — All hooks moved before `if (!skill) return` early exit
- **skills/[id] hooks order** — Same fix, plus replaced fake mockVersions fallback with "No version history available"

### UX (5 fixes)
- **not-found page real IDs** — Replaced broken POPULAR_SKILLS/PROMPTS with real IDs from mock data
- **CommentSection replyMap** — `useMemo` Map replaces triple filter for O(1) reply lookups
- **CommentSection locale colon** — `：` → locale-aware `:` via `locale.startsWith("zh")`
- **SkillCard React.memo** — Wrapped with `React.memo()` for grid rendering performance
- **AgentSkillCard React.memo** — Same optimization for agent skill grid

### Performance (4 fixes)
- **SkillCard memoization** — `React.memo()` prevents unnecessary re-renders in grid
- **AgentSkillCard memoization** — Same optimization
- **CommentSection replyMap** — Pre-computed `Map<parentId, Comment[]>` via `useMemo`
- **FeaturedSection tabIndex** — Both tabpanel divs now focusable for keyboard users

### Accessibility (6 fixes)
- **Lightbox focus trap** — Proper cycling through close/prev/next button refs
- **CopyButton timeout cleanup** — useRef + useEffect cleanup prevents memory leaks
- **SettingsTab clear data** — Also clears notificationPrefs, follows, collections, notifications
- **SettingsTab focus-visible** — Ring added to notification toggle switches
- **Navbar aria-current** — Active nav links marked with `aria-current="page"`
- **Navbar theme icons** — Pure CSS `dark:block`/`dark:hidden` instead of JS ternary (avoids hydration mismatch)

### i18n (2 fixes)
- **formatRelativeTime locale** — Accepts `locale` param, uses `Intl.RelativeTimeFormat`
- **AgentSkillCard locale** — Passes `locale` from `useLocale()` to `formatRelativeTime`

### Infrastructure
- **template.tsx deleted** — Was `"use client"` causing 1-2s black screen on first navigation; removed entirely
- **proxy.ts rename** — `middleware.ts` → `proxy.ts` per Next.js 16 convention
- **layout.tsx scroll** — `data-scroll-behavior="smooth"` on `<html>` instead of CSS property
- **categories mapping extracted** — `categoryToAgentCategorySlugs` moved to `src/lib/categories.ts`
- **users/[username] siteUrl** — Replaced hardcoded URL with `getSiteUrl()`

---

## [v2.6.0] — 2026-05-09

### Security
- **Plaintext password fallback removed** — Auth now uses hash-only comparison; plaintext fallback from pre-migration accounts removed
- **Security headers** — Added X-Frame-Options, X-Content-Type-Options, Referrer-Policy to `next.config.ts`
- **Middleware route protection** — `src/middleware.ts` created for admin/profile route cache-control headers
- **Open redirect fix** — Login and register pages now validate `returnUrl` via `safeReturnUrl()` to prevent open redirect via `://` in query params (enhanced from v2.5.1)
- **Admin variable shadowing fix** — Renamed `.map((t)=>` to `.map((tabItem)=>` to avoid shadowing the `t` i18n function (enhanced from v2.5.1)
- **Admin localStorage error feedback** — Error banner instead of silent swallow on localStorage load failures (enhanced from v2.5.1)

### Accessibility (22 fixes)
- **Install command keyboard support** — `role="button"`, `tabIndex`, `onKeyDown` for Enter/Space activation
- **Mobile file tabs ARIA** — `role="tab"`, `aria-selected`, active visual indicator
- **Variable inputs label association** — `htmlFor` + `id` connections between labels and inputs
- **Version history expand state** — `aria-expanded` on version history button
- **Tags search input** — `role="searchbox"` + `aria-label`
- **Guide copy button focus** — `focus:opacity-100` for touch device keyboard focus
- **Search clear button** — Correct `aria-label`
- **StarRating keyboard navigation** — ArrowLeft/ArrowRight navigation, focus-visible ring, hover scale
- **CollectionPicker a11y** — Outside-click close, Escape key, Input component
- **Lightbox improvements** — 44px touch targets, body scroll lock, i18n labels via props
- **SettingsTab label connections** — `htmlFor` on labels, `aria-pressed` on theme buttons
- **CreateFromUpload a11y** — Icon picker `aria-label`, public/private `role="radiogroup"`/`role="radio"`
- **Navbar search** — `<form role="search">` wrapper, avatar `role="img"`
- **Hero landmark** — `aria-labelledby` on hero landmark
- **Footer disabled links** — Visible "(Coming soon)" text on disabled links
- **AgentSkillCard button** — Changed from `<div role="button">` to semantic `<button>`
- **CreateDropdown touch fix** — Removed `onMouseEnter` handler (touch incompatible)
- **NotificationBell auto-close** — Auto-close dropdown on route change
- **ScrollToTop animation** — Slide-in animation with `translate-y`

### i18n (15 fixes)
- **ErrorFallback full i18n** — All error text uses `t.error.*` keys
- **NotificationTab i18n** — Filter labels, timeAgo with locale params, empty states
- **MySubmissionsTab delete confirmation** — i18n confirmation dialog
- **CommentSection markdown hint** — i18n hint text, removed `setTick` anti-pattern
- **Lightbox i18n labels** — Labels passed via props for full localization
- **Categories slug "View all"** — i18n "View all" string
- **Admin fallback strings** — Always use i18n instead of hardcoded fallbacks
- **Skills detail version changelog** — Version changelog text i18n
- **Chinese colon fix** — `：` → `: ` in skill developer labels
- **Chinese parentheses fix** — `（）` → `()` in prompts and tags pages
- **Agent skill categories i18n** — Added `nameI18nKey`/`descI18nKey` fields
- **tFormat optimization** — Replaced `new RegExp()` with `replaceAll()`, added dev-mode warning for unresolved vars
- **New i18n keys** — 17+ new keys including `clearSearch`, `viewAllItems`, `comingSoon`, `notFound`, `backToList`, `skillNotFound`, `promptNotFound`, `markdownHint`, `notificationFilters.*`, `currentVersion`, `initialRelease`, `deleteSubmissionConfirm`

### UX (20 fixes)
- **Skills/Prompts not-found messages** — Bilingual message + back link instead of `return null`
- **Compare page error specificity** — Shows which specific skill IDs are missing
- **Install command theme-aware color** — `bg-zinc-900 dark:bg-zinc-950`
- **Mobile file tabs active indicator** — Underline indicator on active tab
- **Submit success link** — Link to `/submit/status`
- **NotificationBell auto-close** — Dropdown closes on route change
- **SkillCard formatNumber** — Usage count uses `formatNumber()` for large numbers
- **AgentSkillCard relative time** — Shows relative time ("3 months ago")
- **FeaturedSection conditional rendering** — Conditional render instead of `hidden` class (halves inactive tab DOM)
- **CommandPalette useMemo** — Memoized command items
- **Profile tabs localStorage** — Moved to `useEffect`+`useState` (no sync I/O in render)
- **StatsDashboard transitions** — Animation on value changes
- **MarkdownRenderer blockquote + links** — Blockquote support, link `[text](url)` rendering
- **Skeleton deterministic widths** — No `Math.random()` (avoids hydration mismatch)
- **Not-found page bundle reduction** — Inline arrays instead of mock imports
- **Trending hover optimization** — `will-change-transform` on hover items
- **Profile cache protection** — `Cache-Control: no-store` via middleware
- **useCopyToClipboard cleanup** — Timeout cleanup on unmount
- **useLocalStorage initialValue** — Wrapped in `useRef` to prevent re-subscriptions
- **useNotifications stale closure** — `userEmailRef` avoids stale closure

### Hooks (8 fixes)
- **useCopyToClipboard timeout cleanup** — Timer cleared on component unmount
- **useLocalStorage useRef** — `initialValue` wrapped in `useRef` to avoid re-subscriptions
- **useUserLocalStorage improvements** — Per-session guest ID (no collision), `set()` returns boolean
- **useCollections loaded state** — Added `loaded` state for tracking initialization
- **useFollows cross-tab sync** — Sync via `storage` event across browser tabs
- **useNotifications closure fix** — `userEmailRef` to avoid stale closure in callbacks

### Performance
- **FeaturedSection conditional rendering** — Halves inactive tab DOM by conditionally rendering
- **CommandPalette useMemo** — Memoized command items for faster re-renders
- **Profile tab localStorage** — Reads moved to `useEffect` (no sync I/O in render)
- **LazySyntaxHighlighter deduplication** — Code theme imported from markdown-renderer
- **globals.css fixes** — `::selection` fixed (hex-compatible), `animate-pulse` in reduced-motion

### Config
- **Dependency cleanup** — `@types/dompurify` and `shadcn` moved to `devDependencies`
- **tsconfig target upgrade** — `ES2017` → `ES2022`
- **Middleware cache headers** — `src/middleware.ts` for admin/profile routes
- **.env.example created** — Environment variable template file
- **Security headers** — Added to `next.config.ts`

### SEO
- **Search/compare noindex** — `/search` and `/skills/compare`: `robots: { index: false }`
- **Prompts OG truncation** — `/prompts/[id]`: OG description truncated to 160 chars
- **Users canonical URL** — `/users/[username]`: canonical URL added
- **Trending JSON-LD** — `/trending`: ItemList structured data
- **Removed alternates.languages** — Was mapping both locales to same URL

---

## [v2.5.1] — 2026-05-09

### Security
- **Open redirect fix** — Login and register pages now sanitize `returnUrl` to prevent open redirect via `://` in query params
- **Admin variable shadowing** — Renamed `.map((t) => ...)` to `.map((tabItem) => ...)` to avoid shadowing the `t` i18n function
- **Admin error feedback** — localStorage load failures now surface error messages instead of being silently swallowed

### Accessibility
- **Install command keyboard support** — Skill detail install command area now supports Enter/Space key activation with `role="button"`, `tabIndex`, and `onKeyDown`
- **Mobile file tabs ARIA** — Skill detail mobile file tabs now use `role="tab"`, `aria-selected`, with active indicator styling
- **Variable labels linked** — Prompt detail variable inputs now have `htmlFor`/`id` associations between labels and inputs
- **Version history expand state** — Prompt detail version history button now has `aria-expanded` attribute
- **Tags search input** — Added `role="searchbox"` and `aria-label` to tags page search input
- **Guide copy button focus** — Copy button in guide page now visible on keyboard focus via `focus:opacity-100`

### i18n
- **Chinese colon fix (skills)** — Changed `：` to `: ` in skill detail developer label
- **Chinese parentheses fix (prompts)** — Changed `（）` to `()` in prompt detail models heading
- **Chinese parentheses fix (tags)** — Changed `（）` to `()` in tag detail load-more button

### UX
- **Not-found messages** — Skill and prompt detail pages now show bilingual "not found" messages instead of returning null
- **Hardcoded color removal** — Install command background changed from `bg-[#0d1117]` to `bg-zinc-900 dark:bg-zinc-950` for theme support
- **Compare error specificity** — Skill comparison page now shows which specific skill IDs are missing instead of a generic error
- **Submit status link** — Submit success page now includes a link to `/submit/status`

### SEO
- **Search page noindex** — Added `robots: { index: false }` to prevent indexing of search results page
- **Compare page noindex** — Added `robots: { index: false }` to prevent indexing of comparison page
- **Prompts OG description truncation** — Prompt detail OG descriptions now capped at 160 characters
- **Users canonical URL** — User profile pages now include canonical URLs via `alternates`
- **Trending JSON-LD** — Trending page now includes ItemList structured data for rich search results

### Performance
- **Deterministic skeleton widths** — Loading skeleton bars now use deterministic widths instead of `Math.random()` to avoid hydration mismatch
- **Not-found page bundle** — Replaced `mock-data` and `mock-agent-skills` imports with inline arrays to reduce bundle size
- **Trending hover optimization** — Added `will-change-transform` to trending list items for smoother hover animations

### Bug Fixes
- **agent-skill-card closing tag** — Fixed `</div>` that should have been `</button>` (mismatched closing tag)
- **Error page backHref removed** — All error.tsx files no longer pass non-existent `backHref` prop to `<ErrorFallback>`

---

## [v2.5.0] — 2026-05-09

### Features
- **Recently Viewed section** — Profile activity timeline now shows last 10 viewed skills/prompts with links
- **"Most Liked" sort on prompts** — New sort option by like count on the prompts listing page
- **Toast auto-dismiss** — Toasts auto-dismiss after 3s (success/info) or 5s (error); tracks timeout IDs, cleans up on unmount
- **Toast entry animation** — Toast items now animate in with fade-in + slide-up
- **i18n interpolation (tFormat)** — New `tFormat(key, {count: 5})` helper for placeholder replacement
- **Shared ErrorFallback component** — All 10 error.tsx files now use a single reusable `<ErrorFallback>` component
- **Shared CopyButton component** — Unified clipboard copy button with i18n aria-labels
- **Password reset rate limiting** — 60-second cooldown between reset attempts
- **Password reset confirmation step** — Reset flow now has email → confirm → new password 3-step UI
- **Compare same-skill warning** — Shows i18n warning when both comparison slots have the same skill
- **Prompt sort by "Most Liked"** — New sort option `mostLiked` on prompts page
- **Admin delete comment dialog** — Replaced `window.confirm()` with styled `<Dialog>` component
- **Loading spinners on all buttons** — Login, register, and submit buttons now show `<Loader2>` spinners instead of "..."
- **useUserLocalStorage hook** — New generic hook combining user-scoped localStorage with cross-tab sync
- **Viewport export** — Root layout now exports `viewport` per Next.js 16 API (theme-color for light/dark)
- **Dark mode scrollbar styling** — Custom thin scrollbars matching the dark theme
- **Z-index CSS variables** — `--z-dropdown: 50`, `--z-overlay: 100`, `--z-toast: 110`, `--z-command: 120`
- **Light mode syntax highlighting** — Code blocks now adapt to light/dark theme instead of always using dark
- **StarRating hover preview** — Interactive star rating shows hover preview before clicking

### Security
- **Password reset verification** — Reset flow now requires confirming email ownership before allowing new password
- **Admin check hardened** — Admin page redirects non-admin users; `ADMIN_EMAILS` is a named constant

### SEO
- **Centralized site URL** — New `getSiteUrl()` helper replaces hardcoded `https://ai-skills-hub.vercel.app` across 8+ files
- **Viewport meta** — Added separate `viewport` export with `themeColor` for light/dark modes
- **Robots.txt blocks /admin** — Admin and API routes now disallowed for crawlers
- **Sitemap cleanup** — Removed `/submit/status` (requires auth) from sitemap
- **JSON-LD uses env var** — Organization and WebSite structured data use `getSiteUrl()`

### Bug Fixes
- **useLocalStorage quota error** — `QuotaExceededError` now logs warning instead of silently creating state/localStorage mismatch
- **useLocalStorage cross-tab deletion** — Deleting a key in another tab now resets to `initialValue`
- **useLocalStorage SSR guard** — Added `typeof window !== "undefined"` check to prevent SSR flash
- **useUserStorage guest isolation** — Guest users now get session-scoped keys via sessionStorage, not a shared global key
- **useCollections clears on logout** — Collections state resets when user logs out
- **useFollows clears on logout** — Following state resets when user logs out
- **useNotifications closure fix** — `addNotification` now uses ref for `isTypeEnabled` to avoid stale closure
- **useNotifications user-scoped prefs** — Notification preferences now stored per-user
- **useFilteredList initial values** — No longer frozen with `useMemo([], [])`; updates when URL changes
- **formatDate invalid dates** — Returns raw string instead of "Invalid Date" for malformed dates
- **rate limit keys namespaced** — Now prefixed with `"ai-skills-hub-rate-"` instead of bare `"rate_limit_"`
- **STORAGE_KEYS null guard** — User-scoped key functions handle null/undefined email gracefully
- **theme.ts category fallback** — Unknown category slugs now get a default color instead of undefined
- **template.tsx hash check** — Route changes with hash no longer scroll to top
- **categories slug mapping** — `categoryToAgentCategory` now uses slug-based matching from agent-skill-categories.ts
- **Non-null assertions removed** — Skill/prompt detail pages now guard against null with early return
- **Storage keys in mock files** — `mock-agent-skills.ts` and `mock-data.ts` use `STORAGE_KEYS` instead of hardcoded strings
- **i18n `<html lang>` update** — Language switch now updates `document.documentElement.lang`
- **Theme SSR mismatch fix** — Initial theme state uses lazy initializer from localStorage to avoid hydration mismatch
- **Theme no transition on initial load** — CSS transition only applied on user-initiated theme changes

### Accessibility
- **TagChip touch target** — Increased to 44px minimum height for mobile accessibility
- **NotificationBell "just now"** — Shows localized "just now"/"刚刚" instead of bare "ago" for < 60s
- **ScrollToTop hidden state** — Adds `aria-hidden` and `tabIndex={-1}` when hidden to prevent screen reader access
- **ParticleBackground aria-hidden** — Decorative canvas marked `aria-hidden="true"`
- **Newsletter error alert** — Error messages now have `role="alert"` for screen readers
- **Avatar fallback aria-label** — Letter-initial avatars now have `aria-label={username}`
- **Mobile Sheet nav aria-label** — Mobile navigation `<nav>` has `aria-label`
- **Footer aria-label fix** — Removed misleading "Browse:" prefix from footer nav labels
- **Category card focus styles** — Inner div now propagates focus-visible ring
- **Trending page ARIA tabs** — Content type and sort buttons now use `role="tablist"`/`role="tab"`/`aria-selected`
- **Lightbox a11y** — Added `role="dialog"`, `aria-modal`, focus trap, Escape close, descriptive alt text
- **Comment usernames linked** — Comment author names now link to `/users/[username]`
- **Toast aria-live fix** — Removed `role="alert"` from items (conflicts with container's `aria-live="polite"`)
- **NotificationBell focus trap** — Tab/Shift+Tab now cycles within dropdown menu items

### Performance
- **Provider memoization** — All 4 context providers (auth, i18n, toast, theme) now memoize their value with `useMemo`
- **unreadCount as useMemo** — Replaced `useState` + `useEffect` with `useMemo` in useNotifications
- **Dead useCommandPalette hook removed** — Unused hook deleted from use-keyboard-shortcuts.ts
- **getCommandItems moved to lib/commands.ts** — Separated from hooks file

### UI Improvements
- **Toast uses design tokens** — `text-red-400` → `text-destructive`, colors adapt to light/dark theme
- **Button default variant hover** — All buttons now have hover feedback (not just those inside `<a>` tags)
- **Dialog closeLabel prop** — Close button text is now configurable (default "Close")
- **Testimonials use StarRating** — Replaced manual star rendering with reusable component
- **Version timeline i18n** — "Latest" and "by" strings now use i18n keys
- **CSS ::selection styling** — Custom selection highlight using primary color
- **CSS scroll-padding-top** — Anchors no longer land under the fixed navbar
- **Consolidated reduced-motion** — Merged 3 separate `@media (prefers-reduced-motion)` blocks into one
- **glass-card blur consistency** — Light and dark mode now both use `blur(16px)`
- **i18n keys for error states** — `error.somethingWentWrong`, `error.tryAgain`, `error.backToHome`
- **Suspense wrappers** — Categories, trending, tags pages now wrapped in Suspense with skeletons

---

## [v2.4.0] — 2026-05-08

### Features
- **Login/Register return URL** — After login or registration, redirects back to the original page via `returnUrl` query param (falls back to `/`)
- **Tab keyboard navigation** — Skill detail page tabs now support ArrowLeft/Right/Home/End keys (matching Profile page behavior)
- **Admin panel ARIA tabs** — Admin page tabs now have `role="tablist"`, `role="tab"`, `aria-selected`, and full keyboard navigation
- **Submit category radio semantics** — Category selection buttons now use `role="radiogroup"` + `role="radio"` + `aria-checked` + arrow key support
- **Reusable StarRating component** — Extracted `<StarRating>` with interactive and readonly modes, used in comment section
- **Reusable TagChip component** — Unified `<TagChip>` for tag rendering across skill cards and agent skill cards
- **Reusable useCopyToClipboard hook** — Consolidated clipboard+toast+copied-state pattern into a single hook
- **AgentSkill difficulty badge** — All 8 skills now have difficulty levels (beginner/intermediate/advanced) with color-coded badges
- **Category dropdown in upload form** — Skill creation now uses a proper `<select>` from predefined categories instead of free text
- **Collection visual identifiers** — `UserCollection` type now supports `coverImage` and `color` fields
- **Auth session expiry** — Login sessions expire after 30 days; expired sessions are cleared automatically
- **Unsaved changes guard** — Settings form tracks dirty state and warns before navigating away

### SEO
- **Categories page metadata** — Added `generateMetadata` with title, description, OG, Twitter card, and canonical URL
- **Compare page metadata** — Added metadata export with title and description
- **Tags detail OG tags** — Added `openGraph`, `twitter`, and `alternates.canonical` to tag detail pages
- **Categories detail JSON-LD** — Added BreadcrumbList structured data to category detail pages
- **Unified English metadata** — All 8 pages with Chinese-only metadata (login, register, submit, admin, tags, trending, guide, etc.) now use English titles

### Bug Fixes
- **Stale memo in trending** — `allItems` dependency array now includes `agentSkills.length` and `skills.length`
- **Stale memo in search** — `allAgentSkills` and `allPrompts` dependency arrays now include data length
- **Nested interactive ARIA** — Recent search items no longer nest `<button>` inside `role="option"` (changed to `role="listitem"`)
- **Dead code removal** — Removed unreachable client-side not-found branches in skill detail and prompt detail pages
- **Comment.editedAt type** — Added `editedAt?: string` to Comment interface; removed type casts in comment-section
- **categorySlug matching** — Upload form now uses predefined slugs from `agent-skill-categories.ts` instead of generating from free text
- **Notification prefs user-scoped** — Preferences now stored per-user key instead of global key
- **useLocalStorage cross-tab sync** — Added `storage` event listener so changes in other tabs are reflected
- **useFollows stale closure** — `isFollowing` now reads from localStorage directly instead of depending on state
- **useFilteredList stale on items change** — Resets when source data identity changes
- **Focus ring overflow fix** — Added `box-shadow` fallback alongside `outline` for `overflow-hidden` containers
- **Toast dedup too aggressive** — Allows duplicate messages after 500ms instead of suppressing permanently
- **CollectionPicker empty state** — Shows FolderOpen icon and "Create your first collection" CTA when no collections exist

### Accessibility
- **Login forgot-password error** — Added `role="alert"` to forgot-password error message
- **prefers-reduced-motion: page transitions** — `animate-page-fade-in` respects reduced-motion preference
- **prefers-reduced-motion: command palette** — `slideDown` and `fadeIn` animations respect reduced-motion
- **prefers-reduced-motion: scrollTo** — Route change scroll respects reduced-motion (instant vs smooth)

### UI Improvements
- **Theme switch smooth transition** — Background and text colors now transition smoothly (0.3s) when toggling themes
- **Prose dark mode overrides** — Markdown in comments uses project design tokens (`--foreground`, `--primary`, etc.)
- **Prompt page better skeleton** — Prompts listing Suspense fallback now shows full card grid skeleton (matching skills page)
- **Dead code cleanup** — Removed unused `Search` imports from detail pages

### Infrastructure
- **7 new error.tsx routes** — categories, trending, tags, search, profile, guide, users now have error boundaries
- **3 new loading.tsx routes** — prompts, categories, tags/[tag] now have loading skeletons
- **16 new i18n keys** — loading, copy, copied, noResults, install, unsavedChanges, loginRedirect, sessionExpired, collection management, notification preferences
- **Metadata language standardization** — All pages now use consistent English metadata

---

## [v2.3.0] — 2026-05-08

### Features
- **Comment reply / threading** — Reply to any comment; replies nest under parents with indentation and @mention prefix
- **Notification Tab** — Profile page new "Notifications" tab with type filters (All/Comments/Skills/Submissions/System), mark-all-read, and pagination
- **Submission edit/delete** — Delete pending submissions with confirmation; edit pending submissions via link to submit page
- **Admin comment pagination** — Admin panel shows 20 comments initially with "Load More"
- **Admin delete confirmation** — Delete comment now requires confirmation dialog
- **Report modal a11y** — Added `role="dialog"`, `aria-modal`, focus trap, Escape close, backdrop click close
- **Navbar keyboard hint** — `Ctrl+K` badge shown next to search toggle (desktop only)
- **Scroll to top on navigation** — Route changes now scroll to top automatically
- **Onboarding guard** — Onboarding tooltip no longer mounts if already completed
- **Compare mode card click fix** — Entire card is clickable in compare mode, not just the checkbox button

### Performance
- **Lazy SyntaxHighlighter** — SyntaxHighlighter + 12 language modules now dynamically imported, reducing initial bundle by ~150KB
- **Avatar auto-compress** — Cropped avatars exceeding 200KB are recompressed to 128×128 at 60% JPEG quality
- **Search input debounce** — URL update debounced by 500ms to prevent excessive history replacements

### Bug Fixes
- **Error boundary API unified** — skills/prompts `unstable_retry` → standard `reset()`, compatible with Next.js 16 stable
- **Nested `<main>` on homepage** — Removed duplicate `<main>` tag in page.tsx (layout.tsx already provides one)
- **Skill not-found hardcoded strings** — "Trending Skills" and "Search" button text now use i18n keys
- **Prompt detail full-width colon** — `：0.7` → `:0.7` for English locale consistency
- **Search page "Load more" hardcoded** — Replaced with `t.common.loadMore` i18n key
- **Compare mode click not working** — Inner `<Link>` elements were intercepting clicks; now prevented in compare mode

### UI Improvements
- **Prompt not-found page enhanced** — Added search icon, dual buttons (back + search), glass-card styling
- **Prompt page button consistency** — Raw `<button>` replaced with `<Button>` component
- **Share clipboard fallback** — Prompt detail share now falls back to clipboard copy on failure
- **OAuth buttons removed** — Removed non-functional Google/GitHub buttons from login/register pages
- **User profile avatar optimization** — `<img>` → Next.js `<Image>` component
- **Dropdown focus-visible fix** — Removed `outline-none`, restored global `focus-visible` styles
- **Star rating keyboard focus** — Added `.star-rating-btn:focus-visible` CSS rule

---

## [v2.2.0] — 2026-05-08

### Features
- **Forgot password** — Login page "Forgot Password" opens a dialog to reset password inline (email lookup + new password form). Uses per-user salt for new password hash
- **Data import** — Settings tab now has "Import Data" button alongside Export. Parses JSON backup, validates structure, merges with deduplication
- **Password hashing (per-user salt)** — `hashPassword` now accepts a per-user random 16-byte hex salt. Old users with static salt are auto-migrated on login. Plaintext password fallback preserved for pre-migration accounts
- **Admin panel security** — Admin access now requires both email match AND `role === "admin"`. Added security note about server-side verification in production
- **`<html lang>` init script** — Added inline `<script>` in `<head>` that reads stored language preference from localStorage before first paint, eliminating flash of wrong language for English users
- **XSS sanitization** — `MarkdownRenderer` now sanitizes HTML output via DOMPurify (client-side) or regex fallback (SSR), preventing script injection in comments, bios, and README content
- **Rate limiting** — Client-side cooldowns: 3s on comments, 10s on submissions, 5s on reports. Shows i18n toast on violation
- **Profile Tab keyboard navigation** — Tab list now supports ArrowLeft/Right and Home/End keys following WAI-ARIA Tabs pattern
- **Profile pagination** — Activity timeline, usage history, my comments, and my favorites all have "Load More" buttons (10-20 items per page)
- **Clear data confirmation** — "Clear Data" in Settings now shows a confirmation dialog before wiping localStorage
- **Premium / Preview Limit** — 4 advanced skills marked as premium with `previewLimit: 100`. Premium prompts show truncated content with blurred overlay and lock icon
- **Skill comparison** — New "Compare Mode" toggle on skills list lets users select 2 skills for side-by-side comparison at `/skills/compare`
- **Notification preferences** — Settings tab now has toggle switches for each of the 6 notification types. Disabled types are filtered before adding
- **Mobile Sheet avatar + notifications** — Mobile navigation drawer now shows user avatar + username and notification bell when logged in
- **Comment system unified** — Agent skill detail page replaced its inline comment system with the shared `<CommentSection>` component. Comments now appear in "My Comments" profile tab and support all shared features (edit, delete, markdown, avatar, pagination)
- **Detail page skeletons** — Comment section Suspense fallback changed from raw text to animated skeleton

### Bug Fixes
- **Footer dead links** — Removed strikethrough styling from disabled footer links. Changelog now links to `#`. Remaining links show "Coming soon" tooltip
- **Profile Tab keyboard nav** — Tab container now supports ArrowLeft/Right/Home/End per WAI-ARIA pattern

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
