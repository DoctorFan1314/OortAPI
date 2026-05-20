"use client";

import { useState, useEffect } from "react";

interface ModelInfo {
  id: string;
  owned_by?: string;
  display_name?: string;
}

export function ModelWall({ lang = "zh" }: { lang?: "zh" | "en" }) {
  const [providers, setProviders] = useState<{ name: string; models: string[] }[]>([]);

  useEffect(() => {
    fetch("/api/v1/models")
      .then((r) => r.json())
      .then((data) => {
        const models: ModelInfo[] = data.data || [];
        // Group models by provider
        const grouped: Record<string, string[]> = {};
        for (const m of models) {
          const provider = m.owned_by || "unknown";
          if (!grouped[provider]) grouped[provider] = [];
          const label = m.display_name || m.id;
          if (!grouped[provider].includes(label)) grouped[provider].push(label);
        }
        const list = Object.entries(grouped).map(([name, modelList]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          models: modelList.slice(0, 4), // Show top 4 models per provider
        }));
        if (list.length > 0) setProviders(list);
      })
      .catch(() => {});
  }, []);

  if (providers.length === 0) return null;

  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">
            {lang === "zh" ? "支持的 AI 服务" : "Supported AI Services"}
          </h2>
          <p className="text-muted-foreground">
            {lang === "zh"
              ? `一个端点接入 ${providers.length}+ 主流 AI 模型服务`
              : `Access ${providers.length}+ mainstream AI model services through one endpoint`
            }
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {providers.map((p) => (
            <div key={p.name} className="glass-card p-4 rounded-xl text-center hover:border-primary/30 transition-colors">
              <div className="text-lg font-bold mb-1">{p.name}</div>
              <div className="text-xs text-muted-foreground truncate">{p.models.join(", ")}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
