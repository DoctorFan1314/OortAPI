"use client";

import { useState, useEffect } from "react";
import { getModelColor, formatProviderName } from "@/lib/provider-colors";

interface ModelInfo {
  id: string;
  owned_by?: string;
  display_name?: string;
}

export function ModelWall({ lang = "zh" }: { lang?: "zh" | "en" }) {
  const [models, setModels] = useState<ModelInfo[]>([]);

  useEffect(() => {
    fetch("/api/v1/models")
      .then((r) => r.json())
      .then((data) => {
        const list: ModelInfo[] = (data.data || []).slice(0, 30); // show up to 30
        if (list.length > 0) setModels(list);
      })
      .catch(() => {});
  }, []);

  if (models.length === 0) return null;

  // Triple for seamless scroll
  const marqueeItems = [...models, ...models, ...models];

  return (
    <section className="py-20 px-4 border-t border-border/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">
            {lang === "zh" ? "支持的 AI 模型" : "Supported AI Models"}
          </h2>
          <p className="text-muted-foreground">
            {lang === "zh"
              ? `接入 ${models.length}+ 主流 AI 模型，一个端点统一调用`
              : `${models.length}+ mainstream AI models, one unified endpoint`
            }
          </p>
        </div>

        {/* Individual model cards in marquee */}
        <div className="overflow-hidden">
          <div
            className="flex gap-3 marquee-animate hover:[animation-play-state:paused]"
            style={{ width: "max-content" }}
          >
            {marqueeItems.map((m, i) => {
              const label = m.display_name || m.id;
              const color = getModelColor(label);
              return (
                <div
                  key={`${m.id}-${i}`}
                  className="glass-card px-4 py-3 rounded-xl shrink-0 hover:border-primary/30 transition-colors"
                  style={{ minWidth: 140 }}
                >
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${color.text} ${color.bg} ${color.border} border`}>
                    {label.length > 20 ? label.slice(0, 18) + "…" : label}
                  </span>
                  <div className="text-[11px] text-muted-foreground mt-1.5">
                    {formatProviderName(m.owned_by || "")}
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
