"use client";

import { useState, useEffect, useMemo } from "react";
import { getModelColor, isDefaultColor, formatProviderName } from "@/lib/provider-colors";

interface ModelInfo {
  id: string;
  owned_by?: string;
  display_name?: string;
}

const RANDOM_COLORS = [
  { text: "text-rose-600 dark:text-rose-400",     bg: "bg-rose-500/10",     border: "border-rose-500/30" },
  { text: "text-fuchsia-600 dark:text-fuchsia-400", bg: "bg-fuchsia-500/10", border: "border-fuchsia-500/30" },
  { text: "text-teal-600 dark:text-teal-400",       bg: "bg-teal-500/10",    border: "border-teal-500/30" },
  { text: "text-lime-600 dark:text-lime-400",       bg: "bg-lime-500/10",    border: "border-lime-500/30" },
  { text: "text-yellow-600 dark:text-yellow-400",   bg: "bg-yellow-500/10",  border: "border-yellow-500/30" },
  { text: "text-red-600 dark:text-red-400",         bg: "bg-red-500/10",     border: "border-red-500/30" },
  { text: "text-purple-600 dark:text-purple-400",   bg: "bg-purple-500/10",  border: "border-purple-500/30" },
  { text: "text-blue-600 dark:text-blue-400",       bg: "bg-blue-500/10",    border: "border-blue-500/30" },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getColor(modelName: string, seed: number) {
  const matched = getModelColor(modelName);
  if (isDefaultColor(matched)) {
    return RANDOM_COLORS[Math.abs(seed) % RANDOM_COLORS.length];
  }
  return matched;
}

export function ModelWall({ lang = "zh" }: { lang?: "zh" | "en" }) {
  const [models, setModels] = useState<ModelInfo[]>([]);

  useEffect(() => {
    fetch("/api/v1/models")
      .then((r) => r.json())
      .then((data) => {
        const list: ModelInfo[] = data.data || [];
        if (list.length > 0) setModels(list);
      })
      .catch(() => {});
  }, []);

  // Generate 4 rows with independently shuffled items, expanded to fill at least 20 per row
  const rows = useMemo(() => {
    if (models.length === 0) return [];
    const minPerRow = 20;
    const needed = minPerRow * 4;
    let pool: ModelInfo[];
    if (models.length >= needed) {
      pool = models.slice(0, needed);
    } else {
      // Repeat models randomly until we have enough
      pool = [];
      while (pool.length < needed) {
        const shuffled = shuffle(models);
        pool.push(...shuffled);
      }
      pool = pool.slice(0, needed);
    }
    return [
      shuffle(pool.slice(0, minPerRow)),
      shuffle(pool.slice(minPerRow, minPerRow * 2)),
      shuffle(pool.slice(minPerRow * 2, minPerRow * 3)),
      shuffle(pool.slice(minPerRow * 3)),
    ];
  }, [models]);

  if (rows.length === 0) return null;

  return (
    <section className="py-16 px-4 overflow-hidden">
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

        {/* 4 rows of marquee */}
        <div className="space-y-3">
          {rows.map((row, ri) => {
            // Triple each row for seamless scroll; alternate direction
            const items = [...row, ...row, ...row];
            const animClass = ri % 2 === 0 ? "marquee-animate" : "marquee-animate-reverse";
            return (
              <div key={ri} className="overflow-hidden">
                <div
                  className={`flex gap-3 ${animClass} hover:[animation-play-state:paused]`}
                  style={{ width: "max-content" }}
                >
                  {items.map((m, i) => {
                    const label = m.display_name || m.id;
                    const color = getColor(label, ri * 1000 + i);
                    return (
                      <div
                        key={`${m.id}-${ri}-${i}`}
                        className="glass-card px-4 py-2.5 rounded-xl shrink-0 hover:border-primary/30 transition-colors"
                        style={{ minWidth: 130 }}
                      >
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${color.text} ${color.bg} ${color.border} border`}>
                          {label.length > 22 ? label.slice(0, 20) + "…" : label}
                        </span>
                        <span className="text-[11px] text-muted-foreground ml-2">
                          {formatProviderName(m.owned_by || "")}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
