"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GitBranch, Search } from "lucide-react";
import { cn } from "@/lib/utils";

/* ---------- types ---------- */

interface MergedChannel {
  id: number;
  name: string;
  type: string;
  weight: number;
  enabled: number;
  models: string;
  status: string;
  priority: number;
  fail_count: number;
  last_fail_at: string | null;
  modelsParsed: string[];
  total_calls_24h: number;
  success_rate_24h: number | null;
  avg_latency_24h: number | null;
  total_cost_24h: number;
  live_status: string;
}

interface ModelItem {
  id: string;
  owned_by: string;
  display_name: string;
}

interface ModelChannelEntry {
  channels: { name: string; priority: number; weight: number; status: string }[];
  provider: string;
}

interface ModelChannelMapProps {
  modelChannelMap: Map<string, ModelChannelEntry>;
  lang: string;
}

export function ModelChannelMap({ modelChannelMap, lang }: ModelChannelMapProps) {
  const [modelSearch, setModelSearch] = useState("");

  const modelRows = useMemo(() => {
    let rows = [...modelChannelMap.entries()].map(([modelId, entry]) => ({
      modelId,
      provider: entry.provider,
      channels: entry.channels,
      channelCount: entry.channels.length,
    }));

    if (modelSearch.trim()) {
      const q = modelSearch.toLowerCase();
      rows = rows.filter(r => r.modelId.toLowerCase().includes(q) || r.provider.toLowerCase().includes(q));
    }

    return rows.sort((a, b) => b.channelCount - a.channelCount);
  }, [modelChannelMap, modelSearch]);

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <GitBranch className="h-5 w-5" />
          {lang === "zh" ? "模型 → 渠道路由" : "Model → Channel Routing"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative mb-3 w-56">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={modelSearch}
            onChange={e => setModelSearch(e.target.value)}
            placeholder={lang === "zh" ? "搜索模型..." : "Search models..."}
            className="w-full h-8 pl-8 pr-3 rounded-md border border-input bg-background text-xs focus:border-primary focus:outline-none"
          />
        </div>
        {modelRows.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            {lang === "zh" ? "暂无模型数据" : "No model data"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th scope="col" className="text-left py-2 px-3 text-muted-foreground font-medium">
                    {lang === "zh" ? "模型" : "Model"}
                  </th>
                  <th scope="col" className="text-left py-2 px-3 text-muted-foreground font-medium">
                    {lang === "zh" ? "提供商" : "Provider"}
                  </th>
                  <th scope="col" className="text-center py-2 px-3 text-muted-foreground font-medium">
                    {lang === "zh" ? "可用渠道" : "Channels"}
                  </th>
                  <th scope="col" className="text-left py-2 px-3 text-muted-foreground font-medium">
                    {lang === "zh" ? "渠道路由 (优先级 → 权重)" : "Channel Routing (Priority → Weight)"}
                  </th>
                </tr>
              </thead>
              <tbody>
                {modelRows.map((row) => (
                  <tr key={row.modelId} className="border-b border-border/20 hover:bg-muted/30">
                    <td className="py-2 px-3 font-mono text-xs max-w-[260px] truncate" title={row.modelId}>
                      {row.modelId}
                    </td>
                    <td className="py-2 px-3">
                      <Badge variant="secondary" className="text-[11px]">
                        {row.provider}
                      </Badge>
                    </td>
                    <td className="py-2 px-3 text-center font-mono">{row.channelCount}</td>
                    <td className="py-2 px-3">
                      <div className="flex flex-wrap gap-1.5">
                        {row.channels.map((ch) => (
                          <span
                            key={ch.name}
                            className={cn(
                              "inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border font-mono",
                              ch.status === "online"
                                ? "border-green-500/30 bg-green-500/5 text-green-600 dark:text-green-400"
                                : "border-red-500/30 bg-red-500/5 text-red-600 dark:text-red-400",
                            )}
                            title={`Priority: ${ch.priority}, Weight: ${ch.weight}`}
                          >
                            {ch.name}
                            <span className="text-muted-foreground">
                              P{ch.priority}/{ch.weight}
                            </span>
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
