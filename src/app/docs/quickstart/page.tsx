"use client";

import Link from "next/link";
import { useI18n } from "@/contexts/i18n-context";
import { BaseUrlDisplay } from "@/components/docs/base-url-display";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bot, Sparkles, Globe, MessageSquare, Cpu, Terminal } from "lucide-react";

interface AppCard {
  name: string;
  icon: typeof Bot;
  descKey: string;
  config: string;
  isAnthropic?: boolean;
}

const APPS: AppCard[] = [
  {
    name: "ChatBox",
    icon: Bot,
    descKey: "chatboxDesc",
    config: `Base URL: https://your-domain.com/api/v1\nAPI Key: sk-oort-xxx\nModel: gpt-4o`,
  },
  {
    name: "Cherry Studio",
    icon: Sparkles,
    descKey: "cherryDesc",
    config: `Base URL: https://your-domain.com/api/v1\nAPI Key: sk-oort-xxx\nModel: gpt-4o`,
  },
  {
    name: "Open WebUI",
    icon: Globe,
    descKey: "openwebuiDesc",
    config: `Base URL: https://your-domain.com/api/v1\nAPI Key: sk-oort-xxx`,
  },
  {
    name: "NextChat",
    icon: MessageSquare,
    descKey: "nextchatDesc",
    config: `Base URL: https://your-domain.com/api/v1\nAPI Key: sk-oort-xxx`,
  },
  {
    name: "LobeChat",
    icon: Cpu,
    descKey: "lobechatDesc",
    config: `Base URL: https://your-domain.com/api/v1\nAPI Key: sk-oort-xxx`,
  },
  {
    name: "Claude Code",
    icon: Terminal,
    descKey: "claudeCodeDesc",
    isAnthropic: true,
    config: `CLAUDE_BASE_URL=https://your-domain.com/api\nANTHROPIC_API_KEY=sk-oort-xxx`,
  },
];

const APP_DESC: Record<string, { en: string; zh: string }> = {
  chatboxDesc: { en: "Desktop AI chat client with multi-model support", zh: "桌面 AI 聊天客户端，支持多模型切换" },
  cherryDesc: { en: "Multi-platform AI assistant with rich features", zh: "跨平台 AI 助手，功能丰富" },
  openwebuiDesc: { en: "Self-hosted web interface for AI chat", zh: "自托管 Web AI 聊天界面" },
  nextchatDesc: { en: "Cross-platform ChatGPT UI with sync", zh: "跨平台 ChatGPT 界面，支持云同步" },
  lobechatDesc: { en: "Modern AI chat framework with plugin system", zh: "现代化 AI 聊天框架，支持插件系统" },
  claudeCodeDesc: { en: "CLI coding agent by Anthropic", zh: "Anthropic 官方 CLI 编程工具" },
};

export default function QuickStartPage() {
  const { lang, t } = useI18n();
  const L = t.apiDocs;

  return (
    <div className="space-y-10">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold">
          {lang === "zh" ? "快速开始 — OortAPI 文档" : "Quick Start — OortAPI Docs"}
        </h1>
      </div>

      {/* Step 1: Get API Key */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold flex items-center gap-3">
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
            1
          </span>
          {L.step1Title}
        </h2>
        <p className="text-sm text-muted-foreground">
          {L.step1Desc}{" "}
          <Link href="/dashboard/keys" className="text-primary hover:underline font-medium">
            {L.step1Mid}
          </Link>{" "}
          {L.step1End}
        </p>
        <p className="text-sm text-muted-foreground">
          {lang === "zh"
            ? "你的 API Key 以 "
            : "Your API Key starts with "}
          <code className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono text-foreground">
            sk-oort-
          </code>
          {lang === "zh" ? " 开头，请妥善保管。" : " — save it securely."}
        </p>
      </section>

      {/* Step 2: Configure Base URL */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold flex items-center gap-3">
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
            2
          </span>
          {L.step2Title}
        </h2>
        <p className="text-sm text-muted-foreground">{L.step2Desc}</p>
        <BaseUrlDisplay />

        {/* Tip block */}
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 text-sm space-y-1.5">
          <p className="font-medium text-amber-600 dark:text-amber-400">{L.tip}</p>
          <p className="text-muted-foreground">
            {L.tipOai} <strong>{L.tipOaiBold}</strong>. {L.tipAnt} {L.tipAntDesc} {L.tipEnd}
          </p>
          <p className="text-muted-foreground">{L.tipSameKey}</p>
        </div>
      </section>

      {/* Step 3: Start Using */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold flex items-center gap-3">
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
            3
          </span>
          {L.step3Title}
        </h2>
        <p className="text-sm text-muted-foreground">{L.step3Desc}</p>
      </section>

      {/* AI App Integration */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold">{L.appsTitle}</h2>
        <p className="text-sm text-muted-foreground">{L.appsDesc}</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {APPS.map((app) => {
            const desc =
              APP_DESC[app.descKey]?.[lang as "en" | "zh"] ||
              APP_DESC[app.descKey]?.en ||
              "";
            const Icon = app.icon;
            return (
              <Card key={app.name} className="glass-card">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm">{app.name}</CardTitle>
                    {app.isAnthropic && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 font-medium">
                        Anthropic
                      </span>
                    )}
                  </div>
                  <CardDescription className="text-xs">{desc}</CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="text-[11px] font-mono whitespace-pre leading-relaxed text-muted-foreground bg-muted/30 rounded-lg p-3 border border-border/30">
                    {app.config}
                  </pre>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
