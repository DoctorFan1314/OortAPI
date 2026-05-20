"use client";

import useSWR from "swr";
import { dashboardSWRConfig } from "@/lib/swr-fetcher";
import { Activity, AlertTriangle, CheckCircle, XCircle, Info } from "lucide-react";

interface AuditEntry {
  id: number;
  action: string;
  target_type: string | null;
  details: string | null;
  created_at: string;
}

const ACTION_ICONS: Record<string, typeof Activity> = {
  create: CheckCircle,
  update: Activity,
  delete: XCircle,
  login: Info,
  test: Activity,
};

const ACTION_COLORS: Record<string, string> = {
  create: "text-green-500",
  update: "text-blue-500",
  delete: "text-red-500",
  login: "text-purple-500",
  test: "text-cyan-500",
};

export function ActivityFeed({ lang = "zh" }: { lang?: "zh" | "en" }) {
  const { data } = useSWR<{ logs: AuditEntry[] }>(
    "/api/dashboard/audit?limit=10",
    dashboardSWRConfig,
  );

  const logs = data?.logs || [];

  if (logs.length === 0) {
    return (
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">{lang === "zh" ? "最近活动" : "Recent Activity"}</h3>
        </div>
        <p className="text-xs text-muted-foreground text-center py-8">
          {lang === "zh" ? "暂无活动记录" : "No activity yet"}
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">{lang === "zh" ? "最近活动" : "Recent Activity"}</h3>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground">{logs.length} items</span>
      </div>

      <div className="space-y-0">
        {logs.map((entry, i) => {
          const action = entry.action?.toLowerCase() || "";
          const Icon = ACTION_ICONS[action] || Activity;
          const color = ACTION_COLORS[action] || "text-muted-foreground";
          const isFirst = i === 0;

          return (
            <div key={entry.id} className="flex gap-3 py-2.5 relative">
              {/* Timeline line */}
              {i < logs.length - 1 && (
                <div className="absolute left-[11px] top-8 bottom-0 w-px bg-border/50" />
              )}

              {/* Dot */}
              <div className={`relative mt-0.5 shrink-0 ${isFirst ? "ring-2 ring-primary/20 rounded-full" : ""}`}>
                <div className={`w-[18px] h-[18px] rounded-full flex items-center justify-center ${isFirst ? "bg-primary/20" : "bg-muted"}`}>
                  <Icon className={`h-2.5 w-2.5 ${color}`} />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className={`text-xs leading-tight ${isFirst ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                  {entry.details || entry.action}
                </p>
                <p className="text-[10px] text-muted-foreground/60 mt-0.5 font-mono">
                  {new Date(entry.created_at + "Z").toLocaleString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
