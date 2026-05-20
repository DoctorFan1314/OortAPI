"use client";

import { useState, useEffect, useRef } from "react";
import { getProviderColor } from "@/lib/provider-colors";

interface ModelInfo {
  id: string;
  owned_by?: string;
  display_name?: string;
}

export function ModelWall({ lang = "zh" }: { lang?: "zh" | "en" }) {
  const [providers, setProviders] = useState<{ name: string; models: string[] }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/v1/models")
      .then((r) => r.json())
      .then((data) => {
        const models: ModelInfo[] = data.data || [];
        const grouped: Record<string, string[]> = {};
        for (const m of models) {
          const provider = m.owned_by || "unknown";
          if (!grouped[provider]) grouped[provider] = [];
          const label = m.display_name || m.id;
          if (!grouped[provider].includes(label) && grouped[provider].length < 4) {
            grouped[provider].push(label);
          }
        }
        const list = Object.entries(grouped).map(([name, modelList]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          models: modelList,
        }));
        if (list.length > 0) setProviders(list);
      })
      .catch(() => {});
  }, []);

  if (providers.length === 0) return null;

  // Duplicate providers for seamless marquee
  const marqueeItems = [...providers, ...providers];

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

        {/* Marquee scroll — pauses on hover */}
        <div className="overflow-hidden" ref={scrollRef}>
          <div
            className="flex gap-4 marquee-animate hover:[animation-play-state:paused]"
            style={{ width: "max-content" }}
          >
            {marqueeItems.map((p, i) => {
              const c = getProviderColor(p.name);
              return (
                <div
                  key={`${p.name}-${i}`}
                  className="glass-card p-4 rounded-xl shrink-0 w-48 hover:border-primary/30 transition-colors"
                >
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${c.text} ${c.bg} ${c.border} border mb-2`}>
                    {p.name}
                  </span>
                  <div className="text-xs text-muted-foreground truncate mt-1">
                    {p.models.join(", ")}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
