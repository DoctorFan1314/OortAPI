"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Server, Search } from "lucide-react";
import { cn } from "@/lib/utils";

/* ---------- helpers ---------- */

function successRateColor(rate: number | null): string {
  if (rate === null) return "text-muted-foreground";
  if (rate >= 99) return "text-green-500";
  if (rate >= 95) return "text-yellow-500";
  return "text-red-500";
}

function successRateBgColor(rate: number | null): string {
  if (rate === null) return "bg-muted/50";
  if (rate >= 99) return "bg-green-500/10";
  if (rate >= 95) return "bg-yellow-500/10";
  return "bg-red-500/10";
}

function latencyColor(ms: number | null): string {
  if (ms === null) return "text-muted-foreground";
  if (ms < 500) return "text-green-500";
  if (ms < 2000) return "text-yellow-500";
  return "text-red-500";
}

function latencyBgColor(ms: number | null): string {
  if (ms === null) return "bg-muted/50";
  if (ms < 500) return "bg-green-500/10";
  if (ms < 2000) return "bg-yellow-500/10";
  return "bg-red-500/10";
}

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

interface ChannelHealthTableProps {
  mergedChannels: MergedChannel[];
  lang: string;
}

export function ChannelHealthTable({ mergedChannels, lang }: ChannelHealthTableProps) {
  const [channelSearch, setChannelSearch] = useState("");
  const [sortField, setSortField] = useState<
    "total_calls_24h" | "success_rate_24h" | "avg_latency_24h" | "weight" | "priority" | ""
  >("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const channelRows = useMemo(() => {
    let rows = mergedChannels.filter(ch => ch.enabled === 1);

    if (channelSearch.trim()) {
      const q = channelSearch.toLowerCase();
      rows = rows.filter(ch => ch.name.toLowerCase().includes(q) || ch.type.toLowerCase().includes(q));
    }

    if (sortField) {
      rows = [...rows].sort((a, b) => {
        const aVal = a[sortField] ?? 0;
        const bVal = b[sortField] ?? 0;
        return sortDir === "asc" ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
      });
    }

    return rows;
  }, [mergedChannels, channelSearch, sortField, sortDir]);

  const toggleSort = (field: "total_calls_24h" | "success_rate_24h" | "avg_latency_24h" | "weight" | "priority") => {
    if (sortField === field) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const sortIndicator = (field: string) => {
    if (sortField !== field) return null;
    return <span className="ml-1">{sortDir === "asc" ? "↑" : "↓"}</span>;
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Server className="h-5 w-5" />
          {lang === "zh" ? "渠道健康概览" : "Channel Health Overview"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative mb-3 w-56">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={channelSearch}
            onChange={e => setChannelSearch(e.target.value)}
            placeholder={lang === "zh" ? "搜索渠道..." : "Search channels..."}
            className="w-full h-8 pl-8 pr-3 rounded-md border border-input bg-background text-xs focus:border-primary focus:outline-none"
          />
        </div>
        {channelRows.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            {lang === "zh" ? "暂无渠道数据" : "No channel data"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th scope="col" className="text-left py-2 px-3 text-muted-foreground font-medium">
                    {lang === "zh" ? "渠道名称" : "Channel Name"}
                  </th>
                  <th scope="col" className="text-left py-2 px-3 text-muted-foreground font-medium">
                    {lang === "zh" ? "类型" : "Provider"}
                  </th>
                  <th scope="col" className="text-center py-2 px-3 text-muted-foreground font-medium">
                    {lang === "zh" ? "状态" : "Status"}
                  </th>
                  <th
                    scope="col"
                    className="text-right py-2 px-3 text-muted-foreground font-medium cursor-pointer hover:text-foreground select-none"
                    onClick={() => toggleSort("success_rate_24h")}
                  >
                    {lang === "zh" ? "成功率 (24h)" : "Success Rate (24h)"}
                    {sortIndicator("success_rate_24h")}
                  </th>
                  <th
                    scope="col"
                    className="text-right py-2 px-3 text-muted-foreground font-medium cursor-pointer hover:text-foreground select-none"
                    onClick={() => toggleSort("avg_latency_24h")}
                  >
                    {lang === "zh" ? "平均延迟 (24h)" : "Avg Latency (24h)"}
                    {sortIndicator("avg_latency_24h")}
                  </th>
                  <th
                    scope="col"
                    className="text-right py-2 px-3 text-muted-foreground font-medium cursor-pointer hover:text-foreground select-none"
                    onClick={() => toggleSort("weight")}
                  >
                    {lang === "zh" ? "权重" : "Weight"}
                    {sortIndicator("weight")}
                  </th>
                  <th
                    scope="col"
                    className="text-right py-2 px-3 text-muted-foreground font-medium cursor-pointer hover:text-foreground select-none"
                    onClick={() => toggleSort("priority")}
                  >
                    {lang === "zh" ? "优先级" : "Priority"}
                    {sortIndicator("priority")}
                  </th>
                  <th
                    scope="col"
                    className="text-right py-2 px-3 text-muted-foreground font-medium cursor-pointer hover:text-foreground select-none"
                    onClick={() => toggleSort("total_calls_24h")}
                  >
                    {lang === "zh" ? "24h 调用" : "24h Calls"}
                    {sortIndicator("total_calls_24h")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {channelRows.map((ch) => (
                  <tr key={ch.id} className="border-b border-border/20 hover:bg-muted/30">
                    <td className="py-2 px-3 font-mono text-xs">{ch.name}</td>
                    <td className="py-2 px-3">
                      <Badge variant="secondary" className="text-[11px] font-mono">
                        {ch.type}
                      </Badge>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <Badge
                        variant={ch.live_status === "online" ? "default" : "destructive"}
                        className={cn(
                          "text-[11px]",
                          ch.live_status === "online"
                            ? "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/20"
                            : "",
                        )}
                      >
                        {ch.live_status === "online"
                          ? (lang === "zh" ? "在线" : "Online")
                          : (lang === "zh" ? "离线" : "Offline")}
                      </Badge>
                    </td>
                    <td className="py-2 px-3 text-right">
                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full font-mono",
                          successRateBgColor(ch.success_rate_24h),
                          successRateColor(ch.success_rate_24h),
                        )}
                      >
                        {ch.success_rate_24h !== null ? `${ch.success_rate_24h.toFixed(1)}%` : "-"}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right">
                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full font-mono",
                          latencyBgColor(ch.avg_latency_24h),
                          latencyColor(ch.avg_latency_24h),
                        )}
                      >
                        {ch.avg_latency_24h !== null ? `${ch.avg_latency_24h}ms` : "-"}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-xs">{ch.weight}</td>
                    <td className="py-2 px-3 text-right font-mono text-xs">{ch.priority}</td>
                    <td className="py-2 px-3 text-right font-mono">{ch.total_calls_24h.toLocaleString()}</td>
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
