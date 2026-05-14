"use client";

import { useState } from "react";
import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownLeft, RefreshCw, Gift } from "lucide-react";
import { useCurrency } from "@/contexts/currency-context";
import { dashboardSWRConfig } from "@/lib/swr-fetcher";

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

const LABELS = {
  zh: { title: "账单记录", noRecords: "暂无账单记录", balance: "余额", prev: "上一页", next: "下一页", showing: "显示" },
  en: { title: "Billing History", noRecords: "No billing records yet", balance: "Balance", prev: "Previous", next: "Next", showing: "Showing" },
};

export function BillingHistory({ lang = "zh" }: { lang?: "zh" | "en" }) {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useSWR<{ records: BillingRecord[]; total: number; has_more: boolean }>(
    `/api/dashboard/billing?limit=20&offset=${(page - 1) * 20}`,
    dashboardSWRConfig,
  );
  const records = data?.records || [];
  const hasMore = data?.has_more || false;
  const { formatPrice } = useCurrency();
  const t = LABELS[lang];

  if (isLoading) return <div className="h-48 animate-pulse bg-muted rounded-lg" />;

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg">{t.title}</CardTitle>
      </CardHeader>
      <CardContent>
        {records.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">{t.noRecords}</div>
        ) : (
          <div className="space-y-2">
            {records.map((r) => {
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
              {t.showing} {records.length} / {data?.total || 0}
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
