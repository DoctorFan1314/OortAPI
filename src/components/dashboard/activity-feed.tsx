"use client";

import useSWR from "swr";
import { dashboardSWRConfig } from "@/lib/swr-fetcher";
import Link from "next/link";
import { Activity, Cpu, ArrowRight } from "lucide-react";
import { useI18n } from "@/contexts/i18n-context";

interface UsageEntry {
  id: number;
  model: string;
  tokens_in: number;
  tokens_out: number;
  tokens_in_cache: number;
  tokens_cache_creation: number;
  created_at: string;
}

interface UsageResponse {
  data: UsageEntry[];
}

function fmt(n: number): string {
  return n.toLocaleString();
}

function getProviderColor(model: string): { dot: string; icon: string } {
  const m = model.toLowerCase();
  if (m.startsWith("gpt") || m.startsWith("o1") || m.startsWith("o3") || m.includes("openai")) return { dot: "bg-emerald-500/15", icon: "text-emerald-400" };
  if (m.startsWith("claude") || m.includes("anthropic")) return { dot: "bg-amber-500/15", icon: "text-amber-400" };
  if (m.startsWith("gemini") || m.includes("google")) return { dot: "bg-blue-500/15", icon: "text-blue-400" };
  if (m.startsWith("deepseek")) return { dot: "bg-sky-500/15", icon: "text-sky-400" };
  if (m.startsWith("qwen") || m.includes("alibaba")) return { dot: "bg-violet-500/15", icon: "text-violet-400" };
  if (m.startsWith("llama") || m.includes("meta")) return { dot: "bg-blue-500/15", icon: "text-blue-400" };
  return { dot: "bg-muted", icon: "text-muted-foreground" };
}

export function ActivityFeed({ lang = "zh" }: { lang?: "zh" | "en" }) {
  const { t } = useI18n();
  const { data } = useSWR<UsageResponse>(
    "/api/v1/billing/usage?limit=10",
    dashboardSWRConfig,
  );

  const logs = data?.data || [];

  if (logs.length === 0) {
    return (
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">{t.dashboard.recentCalls}</h3>
        </div>
        <p className="text-xs text-muted-foreground text-center py-8">
          {t.dashboard.noCallsYet}
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Cpu className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">{t.dashboard.recentCalls}</h3>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground">{logs.length}</span>
      </div>

      <div className="space-y-0">
        {logs.map((entry, idx) => {
          const nonCached = entry.tokens_in - entry.tokens_in_cache;
          const cacheRate = entry.tokens_in > 0
            ? ((entry.tokens_in_cache / entry.tokens_in) * 100).toFixed(0)
            : null;
          const total = entry.tokens_in + entry.tokens_out;
          const time = new Date(entry.created_at + "Z").toLocaleString();
          const isFirst = idx === 0;

          return (
            <div key={entry.id} className="relative flex gap-3 py-2.5">
              {/* Timeline line */}
              {idx < logs.length - 1 && (
                <div className="absolute left-[11px] top-7 bottom-0 w-px bg-border/40" />
              )}

              {/* Timeline dot */}
              <div className={`relative mt-0.5 shrink-0 ${isFirst ? "ring-2 ring-primary/20 rounded-full" : ""}`}>
                <div className={`w-[22px] h-[22px] rounded-full flex items-center justify-center ${getProviderColor(entry.model).dot}`}>
                  <Cpu className={`h-3 w-3 ${getProviderColor(entry.model).icon}`} />
                </div>
              </div>

              {/* Content — 4 lines */}
              <div className="flex-1 min-w-0 space-y-1 pt-0.5">
                {/* Line 1: model + total tokens */}
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-foreground truncate min-w-0">
                    {entry.model.length > 16 ? entry.model.slice(0, 14) + "…" : entry.model}
                  </span>
                  <span className="font-mono text-xs text-foreground tabular-nums shrink-0">
                    {fmt(total)} tokens
                  </span>
                </div>

                {/* Line 2: input non-cached */}
                <div className="text-[11px] text-muted-foreground font-mono flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded bg-blue-400 shrink-0" />
                  {t.dashboard.inputNonCachedLabel}: {fmt(nonCached)}
                </div>

                {/* Line 3: input cache + badge right */}
                <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                  <span className="flex items-center gap-1">
                    <span className="inline-block w-1.5 h-1.5 rounded bg-emerald-400 shrink-0" />
                    {t.dashboard.inputCachedLabel}: {fmt(entry.tokens_in_cache)}
                  </span>
                  {cacheRate !== null ? (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                      Number(cacheRate) > 50
                        ? "text-emerald-500 bg-emerald-500/10"
                        : Number(cacheRate) > 20
                          ? "text-yellow-500 bg-yellow-500/10"
                          : "text-muted-foreground bg-muted"
                    }`}>
                      {t.dashboard.cacheHitLabel} {cacheRate}%
                    </span>
                  ) : <span />}
                </div>

                {/* Line 4: output + time right */}
                <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                  <span className="flex items-center gap-1">
                    <span className="inline-block w-1.5 h-1.5 rounded bg-orange-400 shrink-0" />
                    {t.dashboard.outputLabel}: {fmt(entry.tokens_out)}
                  </span>
                  <span className="text-muted-foreground/60">{time}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Link href="/dashboard/usage" className="flex items-center justify-center gap-1 mt-3 pt-3 border-t border-border/30 text-[11px] text-muted-foreground hover:text-foreground transition-colors font-medium">
        {t.common.viewAll}
        <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}
