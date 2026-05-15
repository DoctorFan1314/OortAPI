# OortAPI — Unified AI API Relay Platform

> **[中文文档](README_CN.md)**

> One API key to access OpenAI, Anthropic, Google, Meta, DeepSeek, and more. OpenAI-compatible format, smart routing, per-token billing.

---

## Quick Start

### 1. Requirements

| Dependency | Minimum Version |
|------------|-----------------|
| Node.js | >= 18.0 |
| npm | >= 9.0 |

### 2. Install & Run

```bash
# Clone the repo
git clone https://github.com/yourname/oortapi.git
cd oortapi

# Install dependencies
npm install

# Start development server
npm run dev
```

Open http://localhost:3000 in your browser.

### 3. Production Build

```bash
npm run build
npm start
```

---

## API Usage

All endpoints are OpenAI-compatible. Replace `https://api.openai.com` with your OortAPI base URL and use your OortAPI key.

### Chat Completions (Streaming)

```bash
curl https://your-domain.com/api/v1/chat/completions \
  -H "Authorization: Bearer sk-oort-your-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "Hello!"}],
    "stream": true
  }'
```

### Using with OpenAI SDK (Python)

```python
from openai import OpenAI

client = OpenAI(
    api_key="sk-oort-your-key",
    base_url="https://your-domain.com/api/v1"
)

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Hello!"}]
)
print(response.choices[0].message.content)
```

### Using with OpenAI SDK (Node.js)

```javascript
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "sk-oort-your-key",
  baseURL: "https://your-domain.com/api/v1",
});

const response = await client.chat.completions.create({
  model: "gpt-4o",
  messages: [{ role: "user", content: "Hello!" }],
});
console.log(response.choices[0].message.content);
```

### List Models

```bash
curl https://your-domain.com/api/v1/models \
  -H "Authorization: Bearer sk-oort-your-key"
```

### Check Balance

```bash
curl https://your-domain.com/api/v1/billing/balance \
  -H "Authorization: Bearer sk-oort-your-key"
```

### Anthropic Messages API (Tool Calling)

```bash
curl https://your-domain.com/api/v1/messages \
  -H "x-api-key: sk-oort-your-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-sonnet-4-20250514",
    "max_tokens": 1024,
    "messages": [{"role": "user", "content": "What is the weather in Tokyo?"}],
    "tools": [{"name": "get_weather", "description": "Get weather for a city", "input_schema": {"type": "object", "properties": {"city": {"type": "string"}}}}]
  }'
```

Supports full `tool_use` / `tool_result` conversion between Anthropic and OpenAI formats.

---

## Supported Models

| Provider | Models |
|----------|--------|
| OpenAI | gpt-4o, gpt-4o-mini, gpt-4-turbo, gpt-3.5-turbo |
| Anthropic | claude-3.5-sonnet, claude-3-opus, claude-3-haiku |
| Google | gemini-pro, gemini-pro-vision |
| Meta | llama-3.1-70b, llama-3.1-8b |
| DeepSeek | deepseek-chat, deepseek-coder |

> Model availability depends on configured channels. Admin can add/remove models via the dashboard.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Database | SQLite (better-sqlite3) |
| Auth | JWT + httpOnly cookies |
| Styling | Tailwind CSS v4 |
| UI Library | shadcn/ui (Base UI) |
| Charts | Recharts + ECharts (echarts-for-react) |
| Password Hashing | PBKDF2 |
| Deployment | Vercel / Docker / VPS |

---

## Key Features

- **OpenAI-compatible API** — Drop-in replacement for OpenAI, Anthropic, Google, and more
- **Smart routing** — Weighted channel selection with automatic failover (up to 3 retries)
- **Per-token billing** — 3-tier cache-aware pricing (input, cache read, cache write, output)
- **Token Plan subscriptions** — 4 tiers with prorated upgrades/downgrades
- **Tool calling** — Full `tools`/`tool_choice` passthrough for both OpenAI and Anthropic formats
- **Security** — JWT auth, AES-256-GCM encrypted channel keys, rate limiting, input validation, disabled user blocking, admin audit log
- **Middleware auth** — Dashboard routes protected by Next.js middleware
- **X-Request-Id** — Unique request ID in every response header for tracing
- **Rate limit headers** — `X-RateLimit-Limit/Remaining/Reset` on all v1 API responses
- **Security headers** — HSTS, X-Frame-Options, X-Content-Type-Options, CORS support
- **OpenAPI spec** — `GET /api/v1/openapi` for full API documentation
- **Health check** — `GET /api/health` for monitoring and uptime
- **Real-time stats** — Homepage shows live platform metrics (calls, uptime, latency, models)
- **Smart channel selection** — Latency-aware load balancing, automatically prefers faster channels
- **Subscription auto-renew** — Auto-renews expired subscriptions when balance is sufficient
- **Webhook support** — Admin-configured webhooks with HMAC-signed POST notifications after key events
- **Database backup** — `GET /api/dashboard/backup` generates consistent SQLite backup
- **Session management** — Login tracking, max 10 concurrent sessions, logout cleanup
- **Model aliases & deprecation** — Model alias routing and deprecation warning headers
- **API key permissions** — Parses permissions JSON, enforces model whitelist
- **Rate limiter persistence** — SQLite-persisted rate limit counters, survives restarts
- **Accessibility** — aria-labels on all icon buttons, Dialog replaces native confirm
- **Docker deployment** — One-command `docker compose up -d` with persistent SQLite volume
- **Auto admin** — First registered user automatically becomes admin
- **Delete account** — Users can delete their account with password verification

---

## Project Structure

```
oortapi/
├── src/
│   ├── app/
│   │   ├── api/                        # Backend API routes
│   │   │   ├── v1/
│   │   │   │   ├── chat/completions/   # Chat completions (streaming)
│   │   │   │   ├── messages/           # Anthropic Messages API (tool_use conversion)
│   │   │   │   ├── completions/        # Text completions
│   │   │   │   ├── images/generations/ # Image generation
│   │   │   │   ├── embeddings/         # Text embeddings
│   │   │   │   ├── models/             # Model listing
│   │   │   │   └── billing/            # Balance, usage & redeem
│   │   │   ├── auth/                   # Login, register, profile
│   │   │   ├── dashboard/              # Stats, keys, channels, users, redeem, models, multiplier, settings CRUD
│   │   │   ├── subscribe/              # Subscription API (new/upgrade/downgrade)
│   │   │   ├── plans/                  # Plans listing API
│   │   │   ├── stats/                  # Platform stats (public)
│   │   │   └── docs/                   # OpenAPI spec endpoint
│   │   ├── middleware.ts               # Auth middleware + X-Request-Id
│   │   ├── token-plan/                 # Token Plan subscription page
│   │   ├── models/                     # Model marketplace (standalone page)
│   │   │   └── page.tsx               # Card grid with search, provider filter, currency toggle, 4-price display
│   │   ├── profile/                    # User profile (overview + settings)
│   │   ├── dashboard/                  # User dashboard pages
│   │   │   ├── page.tsx                # Overview (stats + ECharts model analytics)
│   │   │   ├── keys/page.tsx           # API key management
│   │   │   ├── usage/page.tsx          # Usage analytics (with cache columns, currency-aware, timezone-correct)
│   │   │   ├── billing/page.tsx        # Billing, balance & redeem codes
│   │   │   ├── channels/page.tsx       # Channel management (admin)
│   │   │   ├── users/page.tsx          # User management (admin) + password reset
│   │   │   ├── redeem/page.tsx         # Redeem code management (admin)
│   │   │   └── settings/page.tsx       # Account settings
│   │   ├── docs/                       # API documentation (Swagger UI)
│   │   ├── resources/                  # Skills, prompts, categories
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── layout.tsx
│   ├── lib/
│   │   ├── db.ts                       # SQLite connection (lazy singleton)
│   │   ├── schema.sql                  # Database schema (14 tables)
│   │   ├── auth.ts                     # JWT + password hashing + AES-256-GCM encryption
│   │   ├── api-gateway.ts              # Unified gateway logic
│   │   ├── channel-manager.ts          # Smart channel routing
│   │   ├── billing-engine.ts           # Per-token billing (3-tier cache pricing)
│   │   ├── rate-limiter.ts             # Rate limiting
│   ├── components/
│   │   ├── dashboard/                  # Dashboard UI components
│   │   ├── home/                       # Homepage components
│   │   └── ...
│   └── contexts/
│       ├── auth-context.tsx            # JWT-based auth
│       ├── currency-context.tsx        # USD/CNY currency switching
│       └── ...
├── data/                               # SQLite database (gitignored)
├── package.json
└── ...
```

---

## Dashboard

After registering, users get access to a full dashboard:

- **Overview** — Today's calls, success rate, cost, latency, model consumption charts (ECharts: stacked bar, pie, trend line)
- **Token Plan** — Subscription page at `/token-plan` with 4 tiers (Spark/Flare/Pulse/Nova), monthly/yearly toggle, USD/CNY currency switching, prorated upgrade/downgrade
- **Models** — Standalone page at `/models` with card grid, search, provider filter, sort (name/price), USD/CNY toggle, 4-price display
- **API Keys** — Create/manage keys with per-key rate limits
- **Usage** — Detailed call history with token breakdown (input, output, cache hit, cache create), currency-aware cost display, timezone-correct timestamps
- **Billing** — Balance display (USD/CNY), transaction history, redeem codes
- **Channels** — Admin: configure AI provider channels with smart routing, connection testing, model sync, health monitoring (24h success rate, latency, call count)
- **Users** — Admin: user management with role control, balance adjustment, enable/disable, password reset
- **Redeem Codes** — Admin: batch generate codes for balance top-ups
- **Plans** — Admin: manage subscription plans at `/dashboard/admin/plans` with currency toggle and plan-model bindings
- **Multiplier** — Admin: per-model and time-based pricing multiplier rules

---

## Channel Management (Admin)

Admins can configure upstream AI provider channels:

- **Multi-provider support** — Add OpenAI, Anthropic, Google, DeepSeek, Alibaba, etc.
- **Weighted routing** — Set channel weights for load balancing
- **Automatic failover** — Channels with 3 consecutive failures are temporarily disabled; gateway retries up to 3 channels on 5xx errors
- **Model mapping** — Map requested model names to actual provider model names
- **Priority system** — Higher priority channels are preferred
- **Connection testing** — Verify upstream connectivity with latency measurement
- **Model sync** — Copy channel models to the model marketplace with one click
- **Rate limit detection** — Upstream 429 responses are detected and marked as `rate_limited`
- **Health monitoring** — 24h success rate, average latency, and call count per channel
- **Encrypted API keys** — AES-256-GCM encryption at rest for all channel API keys

---

## Billing & Redeem Codes

- **Per-token billing** — Model-specific rates with 3-tier cache-aware pricing (input, cache read, cache write, output)
- **Cache token tracking** — Separate tracking for cache hit and cache creation tokens with configurable rates
- **Currency support** — USD/CNY switching with admin-configurable exchange rate
- **Redeem codes** — Admins generate batch codes, users redeem for instant balance credit
- **Usage analytics** — Full breakdown with cache columns and currency-aware cost display

---

## Environment Variables

```bash
# Optional
DATABASE_PATH=./data/oortapi.db    # SQLite database path
JWT_SECRET=your-secret-key          # JWT signing secret (auto-generated if not set)
ENCRYPTION_KEY=your-encryption-key  # AES-256 key for channel API key encryption
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

---

## Deployment

### Docker (Recommended)

Quick start with pre-built image (no build required):

```bash
curl -O https://raw.githubusercontent.com/DoctorFan1314/OortAPI/main/docker-compose.yml
docker compose up -d
```

Or clone the repo:

```bash
git clone https://github.com/DoctorFan1314/OortAPI.git
cd OortAPI
docker compose up -d
```

Open http://localhost:3000. Image is pulled from GitHub Container Registry automatically.

Common commands:

```bash
docker compose logs -f          # View logs
docker compose down             # Stop
docker compose up -d --build    # Rebuild after code update
```

SQLite data is persisted in `./data` via volume mount. To backup, just copy this directory.

To customize port or site URL, edit `docker-compose.yml`:

```yaml
ports:
  - "8080:3000"        # Change host port
environment:
  - NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### Vercel

> Note: SQLite requires a persistent filesystem. For Vercel, use a VPS or Docker deployment instead.

### VPS (Manual)

```bash
npm ci
npm run build
npm start
```

Use PM2 for production:

```bash
npm install -g pm2
pm2 start npm --name oortapi -- start
pm2 save
pm2 startup
```

See [docs/deploy.md](docs/deploy.md) for full deployment guide (Nginx reverse proxy, environment variables, etc.).

---

## Resource Center

The resource center hub at `/resources/` provides quick access to:

- Agent Skills marketplace
- Prompt Templates
- Categories, Trending, Tags
- Submit Templates

---

## License

Licensed under the [Apache License, Version 2.0](LICENSE).

---

## Disclaimer

**OortAPI is a learning and educational project for studying modern full-stack web development. It is not a production service and should not be relied upon for any commercial or mission-critical use.**

This software is provided "AS IS", WITHOUT WARRANTY OF ANY KIND. See [Apache License 2.0](LICENSE) for full details.
