"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownLeft, RefreshCw, Gift, Search, X } from "lucide-react";
import { useCurrency } from "@/contexts/currency-context";
import { dashboardSWRConfig } from "@/lib/swr-fetcher";
import { Input } from "@/components/ui/input";

interface BillingRecord {
  id: number;
  amount: number;
  type: string;
  description: string | null;
  balance_after: number | null;
  created_at: string;
}

const TYPE_CONFIG: Record<string, { icon: typeof ArrowUpRight; color: string; zh: string; en: string }> = {
  recharge: { icon: ArrowDownLeft, color: "text-green-500", zh: "充值", en: "Recharge" },
  deduct: { icon: ArrowUpRight, color: "text-red-500", zh: "扣费", en: "Deduct" },
  refund: { icon: RefreshCw, color: "text-blue-500", zh: "退款", en: "Refund" },
  gift: { icon: Gift, color: "text-yellow-500", zh: "赠送", en: "Gift" },
};

const TYPE_OPTIONS = ["all", "recharge", "deduct", "refund", "gift"];

const LABELS = {
  zh: { title: "账单记录", noRecords: "暂无账单记录", balance: "余额", prev: "上一页", next: "下一页", showing: "显示", search: "搜索描述...", allTypes: "全部类型", type: "类型" },
  en: { title: "Billing History", noRecords: "No billing records yet", balance: "Balance", prev: "Previous", next: "Next", showing: "Showing", search: "Search description...", allTypes: "All types", type: "Type" },
};

export function BillingHistory({ lang = "zh" }: { lang?: "zh" | "en" }) {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const { data, isValidating } = useSWR<{ records: BillingRecord[]; total: number; has_more: boolean }>(
    `/api/dashboard/billing?limit=50&offset=${(page - 1) * 50}`,
    dashboardSWRConfig,
  );
  const { formatPrice } = useCurrency();
  const t = LABELS[lang];

  const filtered = useMemo(() => {
    let list = data?.records || [];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(r => (r.description || "").toLowerCase().includes(q));
    }
    if (typeFilter !== "all") {
      list = list.filter(r => r.type === typeFilter);
    }
    return list;
  }, [data, searchQuery, typeFilter]);

  const hasMore = data?.has_more || false;

  if (!data && isValidating) return <div className="h-48 animate-pulse bg-muted rounded-lg" />;

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-lg">{t.title}</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative w-44">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
              <Input
                placeholder={t.search}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="h-8 pl-7 pr-7 text-xs bg-secondary border-border"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="h-8 px-2 rounded-md border border-border bg-secondary text-xs text-foreground appearance-none cursor-pointer"
              aria-label={t.type}
            >
              <option value="all">{t.allTypes}</option>
              {TYPE_OPTIONS.filter(o => o !== "all").map(type => (
                <option key={type} value={type}>{TYPE_CONFIG[type]?.[lang] || type}</option>
              ))}
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">{t.noRecords}</div>
        ) : (
          <div className="space-y-2">
            {filtered.map((r) => {
              const config = TYPE_CONFIG[r.type] || TYPE_CONFIG.deduct;
              const Icon = config.icon;
              return (
                <div key={r.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <Icon className={`h-4 w-4 ${config.color} shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm">{r.description || config[lang]}</div>
                    <div className="text-xs text-muted-foreground">{new Date(r.created_at + "Z").toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className={`font-mono text-sm ${r.amount > 0 ? "text-green-500" : "text-red-500"}`}>
                      {r.amount > 0 ? "+" : ""}{formatPrice(Math.abs(r.amount))}
                    </div>
                    {r.balance_after !== null && (
                      <div className="text-xs text-muted-foreground">{t.balance}: {formatPrice(r.balance_after)}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {/* Pagination */}
        {(page > 1 || hasMore) && (
          <div className="flex items-center justify-between pt-3 border-t border-border/20">
            <span className="text-xs text-muted-foreground">
              {t.showing} {filtered.length} / {data?.total || 0}
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
  );
}
