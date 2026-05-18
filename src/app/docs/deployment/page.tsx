"use client";

import { useI18n } from "@/contexts/i18n-context";
import { CodeBlock } from "@/components/docs/code-block";
import { Server, Container, Globe, FileCode } from "lucide-react";

const dockerComposeYml = `version: "3.8"

services:
  oortapi:
    image: ghcr.io/your-org/oortapi:latest
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=file:./data/oortapi.db
      - JWT_SECRET=your-secret-key
    volumes:
      - ./data:/app/data
    restart: unless-stopped`;

const envVars = [
  { name: "DATABASE_URL", desc: "Database connection string (SQLite or PostgreSQL)" },
  { name: "JWT_SECRET", desc: "JWT signing secret for auth tokens" },
  { name: "NEXT_PUBLIC_SITE_URL", desc: "Public-facing site URL" },
  { name: "SMTP_HOST", desc: "SMTP server host for emails" },
  { name: "SMTP_PORT", desc: "SMTP server port" },
  { name: "SMTP_USER", desc: "SMTP username" },
  { name: "SMTP_PASS", desc: "SMTP password" },
  { name: "UPSTREAM_BASE_URL", desc: "Upstream AI provider base URL" },
  { name: "UPSTREAM_API_KEY", desc: "Upstream AI provider API key" },
  { name: "RATE_LIMIT_MAX", desc: "Max requests per minute (default: 60)" },
];

const envRow = "flex items-start gap-4 px-5 py-3 border-b border-border/20 last:border-b-0";

export default function DeploymentPage() {
  const { t } = useI18n();
  const L = t.apiDocs;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">{L.deployTitle}</h1>
        <p className="text-muted-foreground">{L.deployDesc}</p>
      </div>

      {/* Docker */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Container className="h-5 w-5 text-sky-400" />
          {L.dockerTitle}
        </h2>
        <p className="text-sm text-muted-foreground">{L.dockerDesc}</p>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">1. Clone &amp; Deploy</h3>
            <CodeBlock code={`git clone https://github.com/your-org/oortapi.git
cd oortapi
docker compose up -d`} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">2. {L.dockerCompose}</h3>
            <p className="text-xs text-muted-foreground mb-2">{L.dockerComposeDesc}</p>
            <CodeBlock code={dockerComposeYml} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">3. {L.commonCommands}</h3>
            <CodeBlock code={`# Start services
docker compose up -d

# View logs
docker compose logs -f

# Restart services
docker compose restart

# Stop services
docker compose down

# Update to latest version
docker compose pull
docker compose up -d`} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">4. {L.dataBackup}</h3>
            <p className="text-xs text-muted-foreground mb-2">{L.dataBackupDesc}</p>
            <CodeBlock code={`# Backup data directory
cp -r ./data ./data-backup-$(date +%Y%m%d)

# Restore from backup
cp -r ./data-backup-20250518/* ./data/`} />
          </div>
        </div>
      </section>

      {/* VPS */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Server className="h-5 w-5 text-emerald-400" />
          {L.vpsTitle}
        </h2>
        <p className="text-sm text-muted-foreground">{L.vpsDesc}</p>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">1. Install &amp; Build</h3>
            <CodeBlock code={`git clone https://github.com/your-org/oortapi.git
cd oortapi
npm ci
npm run build`} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">2. {L.pm2Commands}</h3>
            <CodeBlock code={`# Install PM2 globally
npm install -g pm2

# Start with PM2
pm2 start npm --name "oortapi" -- start

# Save process list
pm2 save

# View logs
pm2 logs oortapi

# Restart
pm2 restart oortapi

# Monitor
pm2 monit`} />
          </div>
        </div>
      </section>

      {/* Nginx */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Globe className="h-5 w-5 text-amber-400" />
          {L.nginxTitle}
        </h2>
        <CodeBlock code={`server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}`} />
      </section>

      {/* Environment Variables */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <FileCode className="h-5 w-5 text-violet-400" />
          {L.envVarTitle}
        </h2>
        <p className="text-sm text-muted-foreground">{L.envVarDesc}</p>
        <div className="rounded-xl border border-border/50 overflow-hidden">
          <div className="grid grid-cols-[12rem_1fr] gap-4 px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/20 bg-muted/10">
            <span>Variable</span>
            <span>Description</span>
          </div>
          {envVars.map(env => (
            <div key={env.name} className={envRow}>
              <code className="text-xs font-mono text-foreground break-all">{env.name}</code>
              <span className="text-xs text-muted-foreground">{env.desc}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
