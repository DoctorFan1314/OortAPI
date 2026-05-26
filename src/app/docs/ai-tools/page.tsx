"use client";

import { useI18n } from "@/contexts/i18n-context";
import Link from "next/link";
import { Book, Sparkles } from "lucide-react";


const TOOLS = [
  { name: "OpenAI Codex", slug: "openai-codex", href: "/docs/ai-tools/openai-codex", desc: { zh: "OpenAI 官方 AI 编程 CLI", en: "OpenAI official AI coding CLI" } },
  { name: "OpenCode", slug: "opencode", href: "/docs/ai-tools/opencode", desc: { zh: "开源 AI 编程编辑器，本地优先", en: "Open-source AI coding editor, local-first" } },
  { name: "Claude Code", slug: "claude-code", href: "/docs/ai-tools/claude-code", desc: { zh: "Anthropic 官方 AI 编程 CLI", en: "Anthropic official AI coding CLI" } },
  { name: "Cursor", slug: "cursor", href: "/docs/ai-tools/cursor", desc: { zh: "AI-first 代码编辑器", en: "AI-first code editor" } },
  { name: "OpenClaw", slug: "openclaw", href: "/docs/ai-tools/openclaw", desc: { zh: "轻量 AI 编码 CLI，高效开发", en: "Lightweight AI coding CLI" } },
  { name: "Qwen Code", slug: "qwen-code", href: "/docs/ai-tools/qwen-code", desc: { zh: "通义千问 AI 编程 CLI", en: "Tongyi Qianwen AI coding CLI" } },
  { name: "Hermes", slug: "hermes", href: "/docs/ai-tools/hermes", desc: { zh: "开源自主 AI 智能体", en: "Open-source autonomous AI agent" } },
  { name: "Windsurf", slug: "windsurf", href: "/docs/ai-tools/windsurf", desc: { zh: "AI 编程 IDE，流式交互", en: "AI coding IDE with stream interaction" } },
];

export default function AiToolsOverviewPage() {
  const { lang } = useI18n();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Book className="h-6 w-6" />
        {lang === "zh" ? "AI 工具总览" : "AI Tools Overview"}
      </h1>

      <p className="text-sm text-muted-foreground leading-relaxed">
        {lang === "zh"
          ? "按量付费的 API 与 Token Plan 订阅套餐，均支持在以下主流 AI 编程工具中使用（工具列表持续更新中），点击即可查看对应工具的详细接入与使用指南。"
          : "Both pay-as-you-go API and Token Plan subscriptions are supported in these mainstream AI coding tools (list continuously updated). Click to view detailed integration guides."}
      </p>

      <div className="grid gap-4">
        {TOOLS.map((tool) => (
          <Link key={tool.name} href={tool.href}
            className="flex items-center gap-4 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-5 transition-all hover:border-primary/30 hover:shadow-sm hover:bg-card group"
          >
            <img src={`/logos/${tool.slug}.svg`} alt={tool.name} className="h-10 w-10 rounded-xl shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground text-sm">{tool.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{tool.desc[lang]}</p>
            </div>
            <Sparkles className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary/50 transition-colors shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}
