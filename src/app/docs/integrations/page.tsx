"use client";

import { useI18n } from "@/contexts/i18n-context";
import { BaseUrlDisplay } from "@/components/docs/base-url-display";
import { Book, AppWindow, Terminal, Monitor, Smartphone, Globe, Cpu } from "lucide-react";

const APPS = [
  {
    name: "ChatBox",
    icon: AppWindow,
    platforms: ["macOS", "Windows", "iOS", "Android", "Web"],
    config: { zh: "设置 → 模型提供方 → OpenAI\nAPI 域名: 你的 Base URL\nAPI Key: 你的 Key", en: "Settings → Model Provider → OpenAI\nAPI Domain: Your Base URL\nAPI Key: Your Key" },
    type: "openai",
  },
  {
    name: "Cherry Studio",
    icon: Monitor,
    platforms: ["macOS", "Windows"],
    config: { zh: "设置 → 模型服务商 → 添加\nAPI 地址: 你的 Base URL\nAPI Key: 你的 Key", en: "Settings → Model Provider → Add\nAPI Address: Your Base URL\nAPI Key: Your Key" },
    type: "openai",
  },
  {
    name: "Open WebUI",
    icon: Globe,
    platforms: ["Web (Self-hosted)"],
    config: { zh: "Settings → Connections\nOpenAI API Base URL: 你的 Base URL\nAPI Key: 你的 Key", en: "Settings → Connections\nOpenAI API Base URL: Your Base URL\nAPI Key: Your Key" },
    type: "openai",
  },
  {
    name: "NextChat",
    icon: Cpu,
    platforms: ["Web", "Vercel"],
    config: { zh: "设置 → OpenAI API 代理地址\n填入: 你的 Base URL\nAPI Key: 你的 Key", en: "Settings → OpenAI API Proxy\nEnter: Your Base URL\nAPI Key: Your Key" },
    type: "openai",
  },
  {
    name: "LobeChat",
    icon: Smartphone,
    platforms: ["Web", "Desktop"],
    config: { zh: "设置 → 语言模型 → OpenAI\nAPI 代理地址: 你的 Base URL\nAPI Key: 你的 Key", en: "Settings → Language Model → OpenAI\nAPI Proxy: Your Base URL\nAPI Key: Your Key" },
    type: "openai",
  },
  {
    name: "Claude Code",
    icon: Terminal,
    platforms: ["macOS", "Linux"],
    config: { zh: "export ANTHROPIC_BASE_URL=你的 Base URL\nexport ANTHROPIC_API_KEY=你的 Key\nclaude", en: "export ANTHROPIC_BASE_URL=Your Base URL\nexport ANTHROPIC_API_KEY=Your Key\nclaude" },
    type: "anthropic",
  },
];

export default function IntegrationsPage() {
  const { lang } = useI18n();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Book className="h-6 w-6" />
        {lang === "zh" ? "集成指南" : "Integration Guides"}
      </h1>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">
          {lang === "zh" ? "通用配置" : "General Configuration"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {lang === "zh"
            ? "大多数 AI 客户端支持 OpenAI 兼容接口。配置时只需填写以下 Base URL 和你的 API Key："
            : "Most AI clients support OpenAI-compatible interfaces. Just fill in the Base URL and your API Key:"}
        </p>
        <BaseUrlDisplay />
        <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 text-xs text-muted-foreground">
          <strong className="text-foreground">{lang === "zh" ? "提示：" : "Tip:"}</strong>{" "}
          {lang === "zh"
            ? "大多数客户端默认使用 OpenAI 协议。只有 Claude Code 等少数工具使用 Anthropic 协议。"
            : "Most clients use the OpenAI protocol by default. Only a few tools like Claude Code use the Anthropic protocol."}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">
          {lang === "zh" ? "支持的客户端" : "Supported Clients"}
        </h2>
        <div className="grid gap-4">
          {APPS.map((app) => (
            <div key={app.name} className="rounded-xl border border-border/50 p-5 hover:border-foreground/20 transition-colors">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-muted shrink-0">
                  <app.icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{app.name}</h3>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${app.type === "openai" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
                      {app.type === "openai" ? "OpenAI" : "Anthropic"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {app.platforms.map((p) => (
                      <span key={p} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{p}</span>
                    ))}
                  </div>
                </div>
              </div>
              <pre className="text-xs text-muted-foreground font-mono whitespace-pre-wrap leading-relaxed bg-muted/20 rounded-lg p-3 mt-3">
                {app.config[lang]}
              </pre>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">
          {lang === "zh" ? "SDK 集成" : "SDK Integration"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {lang === "zh"
            ? "所有兼容 OpenAI SDK 或 Anthropic SDK 的工具和框架均可直接使用，只需修改 base_url 和 api_key。详细代码示例请查看"
            : "All tools and frameworks compatible with the OpenAI or Anthropic SDKs work directly — just change the base_url and api_key. See"}
          {" "}<a href="/docs/sdk" className="text-primary hover:underline">{lang === "zh" ? "SDK 集成" : "SDK Integration"}</a>{lang === "zh" ? "页面。" : "page for code examples."}
        </p>
      </section>
    </div>
  );
}
