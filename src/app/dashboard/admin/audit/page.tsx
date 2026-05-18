"use client";

import { useI18n } from "@/contexts/i18n-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMemo, useState, useEffect } from "react";
import { Shield, Search, Download } from "lucide-react";
import useSWR from "swr";
import { dashboardSWRConfig } from "@/lib/swr-fetcher";

interface AuditLog {
  id: number;
  admin_id: number;
  action: string;
  target_type: string | null;
  target_id: number | null;
  details: string | null;
  ip_address: string | null;
  created_at: string;
  admin_email: string | null;
}

const LABELS = {
  zh: {
    title: "审计日志",
    time: "时间",
    admin: "操作者",
    action: "操作",
    target: "目标",
    details: "详情",
    ip: "IP 地址",
    noLogs: "暂无审计记录",
    filterAction: "按操作筛选",
    filterTarget: "目标类型",
    all: "全部",
    showing: "显示",
    prev: "上一页",
    next: "下一页",
    clearFilters: "清除筛选",
    dateFrom: "开始日期",
    dateTo: "结束日期",
    total: "总记录",
    exportCSV: "导出 CSV",
    search: "搜索",
    searchPlaceholder: "搜索操作或详情...",
  },
  en: {
    title: "Audit Logs",
    time: "Time",
    admin: "Operator",
    action: "Action",
    target: "Target",
    details: "Details",
    ip: "IP Address",
    noLogs: "No audit records yet",
    filterAction: "Filter by action",
    filterTarget: "Target Type",
    all: "All",
    showing: "Showing",
    prev: "Previous",
    next: "Next",
    clearFilters: "Clear filters",
    dateFrom: "From",
    dateTo: "To",
    total: "Total",
    exportCSV: "Export CSV",
    search: "Search",
    searchPlaceholder: "Search actions or details...",
  },
};

const TARGET_TYPES = ["user", "channel", "plan", "redeem", "key", "model", "settings", "webhook"];

export default function AuditPage() {
  const { lang } = useI18n();
  const t = LABELS[lang];
  const [page, setPage] = useState(1);
  const [filterAction, setFilterAction] = useState("");
  const [filterTarget, setFilterTarget] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search query to avoid API calls on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filterParams = [
    `limit=50&offset=${(page - 1) * 50}`,
    filterAction ? `action=${encodeURIComponent(filterAction)}` : "",
    filterTarget ? `target_type=${encodeURIComponent(filterTarget)}` : "",
    filterFrom ? `from=${filterFrom}` : "",
    filterTo ? `to=${filterTo}` : "",
    debouncedSearch ? `search=${encodeURIComponent(debouncedSearch)}` : "",
  ].filter(Boolean).join("&");

  const { data, isLoading } = useSWR<{ logs: AuditLog[]; total: number; has_more: boolean }>(
    `/api/dashboard/audit?${filterParams}`,
    dashboardSWRConfig,
  );

  const logs = data?.logs || [];
  const hasMore = data?.has_more || false;

  const formatTarget = (log: AuditLog) => {
    if (!log.target_type) return "-";
    return log.target_id ? `${log.target_type}#${log.target_id}` : log.target_type;
  };

  const parseDetails = (details: string | null) => {
    if (!details) return "-";
    try {
      const obj = JSON.parse(details);
      return Object.entries(obj).map(([k, v]) => `${k}: ${v}`).join(", ");
    } catch {
      return details;
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Shield className="h-6 w-6" />
        {t.title}
      </h1>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3 p-3 bg-muted/30 rounded-lg">
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs text-muted-foreground block mb-1">{t.search}</label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
              placeholder={t.searchPlaceholder}
              className="w-full pl-8 pr-3 py-1.5 bg-background rounded-lg text-sm border border-border/50 focus:border-primary focus:outline-none"
            />
          </div>
        </div>
        <div className="w-40">
          <label className="text-xs text-muted-foreground block mb-1">{t.filterTarget}</label>
          <select
            value={filterTarget}
            onChange={e => { setFilterTarget(e.target.value); setPage(1); }}
            className="w-full h-8 px-2 rounded-md border border-input bg-background text-sm focus:border-primary focus:outline-none"
          >
            <option value="">{t.all}</option>
            {TARGET_TYPES.map(tp => (
              <option key={tp} value={tp}>{tp}</option>
            ))}
          </select>
        </div>
        <div className="w-36">
          <label className="text-xs text-muted-foreground block mb-1">{t.dateFrom}</label>
          <input
            type="date"
            value={filterFrom}
            onChange={e => { setFilterFrom(e.target.value); setPage(1); }}
            className="w-full h-8 px-2 rounded-md border border-input bg-background text-sm focus:border-primary focus:outline-none"
          />
        </div>
        <div className="w-36">
          <label className="text-xs text-muted-foreground block mb-1">{t.dateTo}</label>
          <input
            type="date"
            value={filterTo}
            onChange={e => { setFilterTo(e.target.value); setPage(1); }}
            className="w-full h-8 px-2 rounded-md border border-input bg-background text-sm focus:border-primary focus:outline-none"
          />
        </div>
        {(searchQuery || filterAction || filterTarget || filterFrom || filterTo) && (
          <button
            onClick={() => { setSearchQuery(""); setFilterAction(""); setFilterTarget(""); setFilterFrom(""); setFilterTo(""); setPage(1); }}
            className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground border border-border/50 rounded-md hover:bg-muted transition-colors"
          >
            {t.clearFilters}
          </button>
        )}
        <button onClick={() => {
          const params = [
            'format=csv',
            filterAction ? `action=${encodeURIComponent(filterAction)}` : "",
            filterTarget ? `target_type=${encodeURIComponent(filterTarget)}` : "",
            filterFrom ? `from=${filterFrom}` : "",
            filterTo ? `to=${filterTo}` : "",
            searchQuery ? `search=${encodeURIComponent(searchQuery)}` : "",
          ].filter(Boolean).join('&');
          window.open(`/api/dashboard/audit?${params}`, '_blank');
        }}
          className="h-8 px-3 text-xs border border-border/50 rounded-md hover:bg-muted transition-colors flex items-center gap-1.5 ml-auto">
          <Download className="h-3.5 w-3.5" />{t.exportCSV}
        </button>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg">{t.title} <span className="text-sm font-normal text-muted-foreground">({data?.total || 0})</span></CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-48 animate-pulse bg-muted rounded-lg" />
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">{t.noLogs}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">{t.time}</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">{t.admin}</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">{t.action}</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium hidden md:table-cell">{t.target}</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium hidden lg:table-cell">{t.details}</th>
                    <th className="text-right py-2 px-3 text-muted-foreground font-medium hidden lg:table-cell">{t.ip}</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b border-border/20 hover:bg-muted/30">
                      <td className="py-2 px-3 text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(log.created_at + "Z").toLocaleString()}
                      </td>
                      <td className="py-2 px-3 text-xs font-mono">{log.admin_email || `#${log.admin_id}`}</td>
                      <td className="py-2 px-3">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-mono">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-xs font-mono hidden md:table-cell">{formatTarget(log)}</td>
                      <td className="py-2 px-3 text-xs text-muted-foreground max-w-[300px] truncate hidden lg:table-cell">
                        {parseDetails(log.details)}
                      </td>
                      <td className="py-2 px-3 text-xs text-muted-foreground text-right font-mono hidden lg:table-cell">
                        {log.ip_address || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {/* Pagination */}
          {(page > 1 || hasMore) && (
            <div className="flex items-center justify-between pt-3 border-t border-border/20">
              <span className="text-xs text-muted-foreground">
                {t.showing} {logs.length} / {data?.total || 0}
              </span>
              <div className="flex gap-2">
                {page > 1 && (
                  <button onClick={() => setPage(p => p - 1)} className="px-3 py-1 text-xs rounded-md bg-muted hover:bg-muted/80">
                    {t.prev}
                  </button>
                )}
                {hasMore && (
                  <button onClick={() => setPage(p => p + 1)} className="px-3 py-1 text-xs rounded-md bg-muted hover:bg-muted/80">
                    {t.next}
                  </button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
