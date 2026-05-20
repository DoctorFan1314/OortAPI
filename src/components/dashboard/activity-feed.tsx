"use client";

import useSWR from "swr";
import { dashboardSWRConfig } from "@/lib/swr-fetcher";
import Link from "next/link";
import { Activity, Cpu, ArrowRight } from "lucide-react";

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

export function ActivityFeed({ lang = "zh" }: { lang?: "zh" | "en" }) {
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
          <h3 className="text-sm font-semibold">{lang === "zh" ? "最近调用" : "Recent Calls"}</h3>
        </div>
        <p className="text-xs text-muted-foreground text-center py-8">
          {lang === "zh" ? "暂无调用记录" : "No calls yet"}
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Cpu className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">{lang === "zh" ? "最近调用" : "Recent Calls"}</h3>
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
                <div className={`w-[22px] h-[22px] rounded-full flex items-center justify-center ${isFirst ? "bg-primary/15" : "bg-muted"}`}>
                  <Cpu className="h-3 w-3 text-muted-foreground" />
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
                  {lang === "zh" ? "输入(未缓存)" : "Input(nc)"}: {fmt(nonCached)}
                </div>

                {/* Line 3: input cache + badge right */}
                <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                  <span className="flex items-center gap-1">
                    <span className="inline-block w-1.5 h-1.5 rounded bg-emerald-400 shrink-0" />
                    {lang === "zh" ? "输入(缓存)" : "Input(cache)"}: {fmt(entry.tokens_in_cache)}
                  </span>
                  {cacheRate !== null ? (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                      Number(cacheRate) > 50
                        ? "text-emerald-500 bg-emerald-500/10"
                        : Number(cacheRate) > 20
                          ? "text-yellow-500 bg-yellow-500/10"
                          : "text-muted-foreground bg-muted"
                    }`}>
                      {cacheRate}%
                    </span>
                  ) : <span />}
                </div>

                {/* Line 4: output + time right */}
                <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                  <span className="flex items-center gap-1">
                    <span className="inline-block w-1.5 h-1.5 rounded bg-orange-400 shrink-0" />
                    {lang === "zh" ? "输出" : "Out"}: {fmt(entry.tokens_out)}
                  </span>
                  <span className="text-muted-foreground/60">{time}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Link href="/dashboard/usage" className="flex items-center justify-center gap-1 mt-3 pt-3 border-t border-border/30 text-[11px] text-muted-foreground hover:text-foreground transition-colors font-medium">
        {lang === "zh" ? "查看全部" : "View All"}
        <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}
