"use client";

import { useState, useEffect } from "react";

interface ModelInfo {
  id: string;
  owned_by?: string;
  display_name?: string;
}

const PROVIDER_META: Record<string, { zh: string; models: string }> = {
  openai: { zh: "OpenAI", models: "GPT-4o, GPT-4 Turbo, GPT-3.5" },
  anthropic: { zh: "Anthropic", models: "Claude 4 Sonnet, Claude 4 Opus" },
  google: { zh: "Google", models: "Gemini 2.0 Flash, Gemini 1.5 Pro" },
  deepseek: { zh: "DeepSeek", models: "DeepSeek Chat, DeepSeek Reasoner" },
  alibaba: { zh: "Alibaba", models: "Qwen Max, Qwen Plus" },
  midjourney: { zh: "Midjourney", models: "MJ v6, Niji v6" },
  suno: { zh: "Suno", models: "Music generation" },
  cohere: { zh: "Cohere", models: "Command R+, Embed" },
};

export function ModelWall({ lang = "zh" }: { lang?: "zh" | "en" }) {
  const [providers, setProviders] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/v1/models")
      .then((r) => r.json())
      .then((data) => {
        const models: ModelInfo[] = data.data || [];
        const unique = [...new Set(models.map((m) => m.owned_by).filter(Boolean))] as string[];
        if (unique.length > 0) setProviders(unique);
      })
      .catch(() => {});
  }, []);

  const displayProviders = providers.length > 0
    ? providers.map((id) => ({
        id,
        name: id.charAt(0).toUpperCase() + id.slice(1),
        models: PROVIDER_META[id]?.models || "",
      }))
    : Object.entries(PROVIDER_META).map(([id, meta]) => ({
        id,
        name: meta.zh,
        models: meta.models,
      }));

  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">
            {lang === "zh" ? "支持的 AI 服务" : "Supported AI Services"}
          </h2>
          <p className="text-muted-foreground">
            {lang === "zh"
              ? `一个端点接入 ${displayProviders.length}+ 主流 AI 模型服务`
              : `Access ${displayProviders.length}+ mainstream AI model services through one endpoint`
            }
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {displayProviders.map((p) => (
            <div key={p.id} className="glass-card p-4 rounded-xl text-center hover:border-primary/30 transition-colors">
              <div className="text-lg font-bold mb-1">{p.name}</div>
              <div className="text-xs text-muted-foreground">{p.models}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
