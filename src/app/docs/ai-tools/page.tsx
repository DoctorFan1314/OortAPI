"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useI18n } from "@/contexts/i18n-context";
import { CopyButton } from "@/components/shared/copy-button";
import { BaseUrlDisplay } from "@/components/docs/base-url-display";
import { CodeBlock } from "@/components/docs/code-block";
import { Sparkles, CheckCircle, FileCode, Zap } from "lucide-react";

interface AiTool {
  name: string;
  slug: string;
  protocol: "openai" | "anthropic";
  desc: { zh: string; en: string };
  steps: { zh: string; en: string }[];
  installSteps?: { zh: string; en: string }[];
  notes?: { zh: string; en: string }[];
  configCode?: string;
  configLanguage?: string;
}

const TOOLS: AiTool[] = [
  {
    name: "OpenAI Codex", slug: "openai-codex", protocol: "openai",
    desc: { zh: "OpenAI 官方 AI 编程 CLI", en: "OpenAI official AI coding CLI" },
    steps: [
      { zh: "获取 OortAPI 的 Base URL 和 API Key", en: "Get OortAPI Base URL and API Key" },
      { zh: "在 OpenAI Codex 中设置自定义 API 端点", en: "Set custom API endpoint in Codex" },
      { zh: "填入你的 API Key 并选择模型", en: "Enter your API Key and select a model" },
    ],
    configCode: `export OPENAI_BASE_URL=https://api.oortapi.com/v1
export OPENAI_API_KEY=sk-oort-your-key`,
    configLanguage: "bash",
  },
  {
    name: "OpenCode", slug: "opencode", protocol: "openai",
    desc: { zh: "开源 AI 编程编辑器，本地优先", en: "Open-source AI coding editor, local-first" },
    installSteps: [
      { zh: "确保已安装 Node.js 18+", en: "Ensure Node.js 18+ is installed" },
      { zh: "执行 npm install -g opencode-ai", en: "Run: npm install -g opencode-ai" },
      { zh: "运行 opencode -v 验证安装", en: "Verify with: opencode -v" },
    ],
    steps: [
      { zh: "创建配置文件 ~/.config/opencode/opencode.json", en: "Create ~/.config/opencode/opencode.json" },
      { zh: "设置 baseURL 为 OortAPI 的 OpenAI 兼容地址", en: "Set baseURL to OortAPI OpenAI-compatible endpoint" },
      { zh: "填入你的 API Key", en: "Fill in your API Key" },
    ],
    configCode: `{
  "provider": "openai",
  "baseURL": "https://api.oortapi.com/v1",
  "apiKey": "sk-oort-your-key",
  "model": "gpt-4o"
}`,
    configLanguage: "json",
  },
  {
    name: "Claude Code", slug: "claude-code", protocol: "anthropic",
    desc: { zh: "Anthropic 官方 AI 编程 CLI", en: "Anthropic official AI coding CLI" },
    steps: [
      { zh: "获取 OortAPI 的 Base URL 和 API Key", en: "Get OortAPI Base URL and API Key" },
      { zh: "在工具设置中填入 Base URL 和 API Key", en: "Enter Base URL and API Key in tool settings" },
      { zh: "选择支持的模型后开始使用", en: "Select a supported model and start using" },
    ],
    configCode: `export ANTHROPIC_BASE_URL=https://api.oortapi.com/api
export ANTHROPIC_API_KEY=sk-oort-your-key`,
    configLanguage: "bash",
  },
  {
    name: "Cursor", slug: "cursor", protocol: "openai",
    desc: { zh: "AI-first 代码编辑器", en: "AI-first code editor" },
    steps: [
      { zh: "获取 OortAPI 的 Base URL 和 API Key", en: "Get OortAPI Base URL and API Key" },
      { zh: "在工具设置中填入 Base URL 和 API Key", en: "Enter Base URL and API Key in tool settings" },
      { zh: "选择支持的模型后开始使用", en: "Select a supported model and start using" },
    ],
    configCode: `{
  "openai.apiKey": "sk-oort-your-key",
  "openai.baseUrl": "https://api.oortapi.com/v1"
}`,
    configLanguage: "json",
  },
  {
    name: "OpenClaw", slug: "openclaw", protocol: "openai",
    desc: { zh: "轻量 AI 编码 CLI，高效开发", en: "Lightweight AI coding CLI" },
    steps: [
      { zh: "获取 OortAPI 的 Base URL 和 API Key", en: "Get OortAPI Base URL and API Key" },
      { zh: "在工具设置中填入 Base URL 和 API Key", en: "Enter Base URL and API Key in tool settings" },
      { zh: "选择支持的模型后开始使用", en: "Select a supported model and start using" },
    ],
    configCode: `export OPENAI_BASE_URL=https://api.oortapi.com/v1
export OPENAI_API_KEY=sk-oort-your-key`,
    configLanguage: "bash",
  },
  {
    name: "Qwen Code", slug: "qwen-code", protocol: "openai",
    desc: { zh: "通义千问 AI 编程 CLI", en: "Tongyi Qianwen AI coding CLI" },
    steps: [
      { zh: "获取 OortAPI 的 Base URL 和 API Key", en: "Get OortAPI Base URL and API Key" },
      { zh: "在工具设置中填入 Base URL 和 API Key", en: "Enter Base URL and API Key in tool settings" },
      { zh: "选择支持的模型后开始使用", en: "Select a supported model and start using" },
    ],
    configCode: `export OPENAI_BASE_URL=https://api.oortapi.com/v1
export OPENAI_API_KEY=sk-oort-your-key`,
    configLanguage: "bash",
  },
  {
    name: "Hermes", slug: "hermes", protocol: "openai",
    desc: { zh: "开源自主 AI 智能体", en: "Open-source autonomous AI agent" },
    steps: [
      { zh: "获取 OortAPI 的 Base URL 和 API Key", en: "Get OortAPI Base URL and API Key" },
      { zh: "在工具设置中填入 Base URL 和 API Key", en: "Enter Base URL and API Key in tool settings" },
      { zh: "选择支持的模型后开始使用", en: "Select a supported model and start using" },
    ],
    configCode: `export OPENAI_BASE_URL=https://api.oortapi.com/v1
export OPENAI_API_KEY=sk-oort-your-key`,
    configLanguage: "bash",
  },
  {
    name: "Windsurf", slug: "windsurf", protocol: "openai",
    desc: { zh: "AI 编程 IDE，流式交互", en: "AI coding IDE with stream interaction" },
    steps: [
      { zh: "获取 OortAPI 的 Base URL 和 API Key", en: "Get OortAPI Base URL and API Key" },
      { zh: "在工具设置中填入 Base URL 和 API Key", en: "Enter Base URL and API Key in tool settings" },
      { zh: "选择支持的模型后开始使用", en: "Select a supported model and start using" },
    ],
    configCode: `{
  "openai.apiKey": "sk-oort-your-key",
  "openai.baseUrl": "https://api.oortapi.com/v1"
}`,
    configLanguage: "json",
  },
];

function AiToolsContent() {
  const { lang, t } = useI18n();
  const searchParams = useSearchParams();
  const router = useRouter();
  const L = t.apiDocs;

  const [selectedSlug, setSelectedSlug] = useState(searchParams.get("tool") || TOOLS[0].slug);

  const selectTool = (slug: string) => {
    setSelectedSlug(slug);
    router.replace(`/docs/ai-tools?tool=${slug}`, { scroll: false });
  };

  useEffect(() => {
    const urlSlug = searchParams.get("tool");
    if (urlSlug && TOOLS.some(t => t.slug === urlSlug)) setSelectedSlug(urlSlug);
  }, [searchParams]);

  const selectedTool = TOOLS.find(t => t.slug === selectedSlug) || TOOLS[0];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          {L.aiToolsTitle}
        </h1>
        <p className="text-sm text-muted-foreground mt-2">{L.aiToolsSubtitle}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Tool selector */}
        <aside className="lg:w-56 shrink-0">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">{L.aiToolSelectTool}</h3>
          <div className="space-y-1.5">
            {TOOLS.map(tool => (
              <button
                key={tool.slug}
                onClick={() => selectTool(tool.slug)}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-left transition-all ${
                  selectedSlug === tool.slug
                    ? "bg-primary/10 border border-primary/30 text-primary"
                    : "border border-transparent text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <img src={`/logos/${tool.slug}.svg`} alt={tool.name} className="h-7 w-7 rounded-md shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{tool.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{tool.desc[lang]}</p>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Right: Config sandbox */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Step 1: Architecture */}
          <section className="glass-card p-5 rounded-xl border border-border/50">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
              </div>
              <div>
                <h2 className="text-sm font-semibold">{L.aiToolStep1}</h2>
                <p className="text-[11px] text-muted-foreground">{L.aiToolStep1Desc}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/30">
              <img src={`/logos/${selectedTool.slug}.svg`} alt={selectedTool.name} className="h-10 w-10 rounded-lg" />
              <div>
                <p className="text-sm font-semibold">{selectedTool.name}</p>
                <p className="text-xs text-muted-foreground">{selectedTool.desc[lang]}</p>
                <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full ${selectedTool.protocol === "anthropic" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"}`}>
                  {selectedTool.protocol === "anthropic" ? "Anthropic" : "OpenAI"} Protocol
                </span>
              </div>
            </div>
            {selectedTool.installSteps && (
              <div className="mt-3 space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">{L.aiToolInstallation}</p>
                {selectedTool.installSteps.map((step, i) => (
                  <p key={i} className="text-xs text-muted-foreground">{i + 1}. {step[lang]}</p>
                ))}
              </div>
            )}
          </section>

          {/* Step 2: API Integration */}
          <section className="glass-card p-5 rounded-xl border border-border/50">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                <Zap className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h2 className="text-sm font-semibold">{L.aiToolStep2}</h2>
                <p className="text-[11px] text-muted-foreground">{L.aiToolStep2Desc}</p>
              </div>
            </div>
            <BaseUrlDisplay />
            <div className="space-y-1.5 mt-3">
              {selectedTool.steps.map((step, i) => (
                <p key={i} className="text-xs text-muted-foreground">{i + 1}. {step[lang]}</p>
              ))}
            </div>
          </section>

          {/* Step 3: Advanced Config */}
          {selectedTool.configCode && (
            <section className="glass-card p-5 rounded-xl border border-border/50">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <FileCode className="h-4 w-4 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold">{L.aiToolStep3}</h2>
                  <p className="text-[11px] text-muted-foreground">{L.aiToolStep3Desc}</p>
                </div>
              </div>
              <CodeBlock code={selectedTool.configCode} language={selectedTool.configLanguage || "bash"} />
            </section>
          )}

          {/* Notes */}
          {selectedTool.notes && selectedTool.notes.length > 0 && (
            <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
              <p className="text-xs font-semibold text-amber-500/80 mb-1">{L.aiToolNotes}</p>
              {selectedTool.notes.map((note, i) => (
                <p key={i} className="text-xs text-muted-foreground">• {note[lang]}</p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AiToolsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-muted-foreground text-sm">Loading...</div>}>
      <AiToolsContent />
    </Suspense>
  );
}
