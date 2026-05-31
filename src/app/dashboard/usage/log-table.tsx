"use client";

import { useI18n } from "@/contexts/i18n-context";
import { useCurrency } from "@/contexts/currency-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Fragment } from "react";
import { X } from "lucide-react";
import { UsageLog, LABELS, formatRate } from "./usage-types";

interface LogTableProps {
  logs: UsageLog[];
  total: number;
  page: number;
  sortField: string;
  sortDir: "asc" | "desc";
  onSort: (field: string) => void;
  expandedId: number | null;
  onToggleExpand: (id: number) => void;
  onPageChange: (page: number) => void;
  loading: boolean;
  error: string | null;
  hasActiveFilters: boolean;
  onRetry: () => void;
}

export function LogTable({
  logs,
  total,
  page,
  sortField,
  sortDir,
  onSort,
  expandedId,
  onToggleExpand,
  onPageChange,
  loading,
  error,
  hasActiveFilters,
  onRetry,
}: LogTableProps) {
  const { lang } = useI18n();
  const { formatPrice, symbol, exchangeRate } = useCurrency();
  const t = LABELS[lang as keyof typeof LABELS];

  const formatCostDisplay = (usd: number) => formatPrice(usd, 4);

  // Sort logs
  const sortedLogs = [...logs].sort((a, b) => {
    if (sortField === "total") {
      const aTotal = a.tokens_in + a.tokens_out;
      const bTotal = b.tokens_in + b.tokens_out;
      return sortDir === "asc" ? aTotal - bTotal : bTotal - aTotal;
    }
    if (sortField === "created_at") {
      const aDate = new Date(a.created_at + "Z").getTime();
      const bDate = new Date(b.created_at + "Z").getTime();
      return sortDir === "asc" ? aDate - bDate : bDate - aDate;
    }
    const aVal = a[sortField as keyof UsageLog];
    const bVal = b[sortField as keyof UsageLog];
    if (aVal == null) return 1;
    if (bVal == null) return -1;
    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortDir === "asc" ? aVal - bVal : bVal - aVal;
    }
    return 0;
  });

  // Render detailed cost breakdown for a log entry
  const renderBreakdown = (log: UsageLog) => {
    const isCredits = log.deduction_source === "credits";
    const inputRate = log.input_rate ?? 0.0001;
    const outputRate = log.output_rate ?? 0.0002;
    const cacheRate = log.cache_rate ?? 0;
    const creditRate = log.credit_rate ?? 1.0;
    const mult = log.multiplier ?? 1.0;

    if (isCredits) {
      const CACHE_DISCOUNT = 0.5;
      const creditsUsed = Math.ceil(
        Math.max(0, log.tokens_in - log.tokens_in_cache + log.tokens_in_cache * CACHE_DISCOUNT + log.tokens_out) * creditRate
      );
      return (
        <div className="text-xs space-y-3 font-mono">
          <p className="font-semibold text-sm">{lang === "zh" ? "额度明细" : "Credits Breakdown"}</p>
          <div className="text-muted-foreground space-y-0.5">
            <p>{lang === "zh" ? "Credit 倍率" : "Credit Rate"}: 1 token = {creditRate} credits</p>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">{lang === "zh" ? "输入(未命中缓存)Tokens" : "Input(non-cached)Tokens"}: {(log.tokens_in - log.tokens_in_cache).toLocaleString()} × {creditRate}</span>
              <span>= {((log.tokens_in - log.tokens_in_cache) * creditRate).toLocaleString()} credits</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">{lang === "zh" ? "输入(命中缓存)Tokens" : "Input(cache hit)Tokens"}: {log.tokens_in_cache.toLocaleString()} × {creditRate} × {CACHE_DISCOUNT}</span>
              <span>= {(log.tokens_in_cache * creditRate * CACHE_DISCOUNT).toLocaleString()} credits</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">{lang === "zh" ? "输出 Tokens" : "Output Tokens"}: {log.tokens_out.toLocaleString()} × {creditRate}</span>
              <span>= {(log.tokens_out * creditRate).toLocaleString()} credits</span>
            </div>
          </div>
          <div className="border-t border-border/30 pt-1">
            <div className="flex justify-between gap-4 font-semibold text-sm">
              <span>{lang === "zh" ? "总计消耗" : "Total Credits Used"}</span>
              <span className="text-amber-400">{creditsUsed.toLocaleString()} credits</span>
            </div>
            <p className="text-emerald-500 text-[11px] mt-1">{lang === "zh" ? "套餐用户，不扣余额" : "Subscription user — no balance charged"}</p>
          </div>
        </div>
      );
    }

    // Non-subscription user — show dollar breakdown
    const nonCachedIn = Math.max(0, log.tokens_in - log.tokens_in_cache);
    const inputCost = (nonCachedIn * inputRate) / 1000000;
    const cacheHitCost = (log.tokens_in_cache * cacheRate) / 1000000;
    const outputCost = (log.tokens_out * outputRate) / 1000000;
    const baseCost = inputCost + cacheHitCost + outputCost;
    const finalCost = baseCost * mult;
    const rateSource = log.input_rate != null ? "" : ` (${t.noRateData})`;

    return (
      <div className="text-xs space-y-3 font-mono">
        <p className="font-semibold text-sm">{t.costBreakdown}</p>
        <div className="text-muted-foreground space-y-0.5">
          <p>{lang === "zh" ? "模型费率" : "Model Rates"}{rateSource}:</p>
          <p className="pl-3">{lang === "zh" ? "输入(未命中缓存)" : "Input(non-cached)"} = {formatRate(inputRate, symbol, exchangeRate)}</p>
          <p className="pl-3">{lang === "zh" ? "输入(命中缓存)" : "Input(cache hit)"} = {formatRate(cacheRate, symbol, exchangeRate)}</p>
          <p className="pl-3">{lang === "zh" ? "输出" : "Output"} = {formatRate(outputRate, symbol, exchangeRate)}</p>
        </div>
        <div className="space-y-1">
          {nonCachedIn > 0 && (
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">{t.inputCost}: {nonCachedIn.toLocaleString()} × {(symbol === "¥" ? inputRate * exchangeRate : inputRate).toFixed(4)} / 1M</span>
              <span>= {formatCostDisplay(inputCost)}</span>
            </div>
          )}
          {log.tokens_in_cache > 0 && (
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">{t.cacheReadCost}: {log.tokens_in_cache.toLocaleString()} × {(symbol === "¥" ? cacheRate * exchangeRate : cacheRate).toFixed(4)} / 1M</span>
              <span>= {formatCostDisplay(cacheHitCost)}</span>
            </div>
          )}
          {log.tokens_out > 0 && (
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">{t.outputCost}: {log.tokens_out.toLocaleString()} × {(symbol === "¥" ? outputRate * exchangeRate : outputRate).toFixed(4)} / 1M</span>
              <span>= {formatCostDisplay(outputCost)}</span>
            </div>
          )}
        </div>
        <div className="border-t border-border/30 pt-1 space-y-1">
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">{lang === "zh" ? "小计 (base cost)" : "Subtotal (base cost)"}</span>
            <span>= {formatCostDisplay(baseCost)}</span>
          </div>
          {mult !== 1.0 && (
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">× {lang === "zh" ? "倍率" : "Multiplier"}: {mult.toFixed(2)}x</span>
              <span></span>
            </div>
          )}
          <div className="flex justify-between gap-4 font-semibold text-sm">
            <span>{t.total}</span>
            <span>= {formatCostDisplay(finalCost)}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg">{t.title}</CardTitle>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="text-center py-8">
            <p className="text-red-500 text-sm mb-2">{error}</p>
            <button onClick={onRetry} className="text-xs text-primary hover:underline">{lang === "zh" ? "重试" : "Retry"}</button>
          </div>
        ) : loading && logs.length === 0 ? (
          <div className="animate-pulse space-y-2 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="h-4 bg-muted rounded w-16" />
                <div className="h-4 bg-muted rounded w-32" />
                <div className="h-4 bg-muted rounded w-20" />
                <div className="h-4 bg-muted rounded w-12" />
                <div className="h-4 bg-muted rounded w-20" />
                <div className="h-4 bg-muted rounded w-16" />
                <div className="h-4 bg-muted rounded w-24" />
                <div className="h-4 bg-muted rounded w-16" />
                <div className="h-4 bg-muted rounded w-16" />
                <div className="h-4 bg-muted rounded w-12" />
              </div>
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">{hasActiveFilters ? (lang === "zh" ? "无匹配记录，请调整筛选条件" : "No matching records. Adjust your filters.") : t.noLogs}</div>
        ) : (
          <>
            {loading && logs.length > 0 && <div className="h-1 bg-primary/20 rounded-full overflow-hidden mb-2"><div className="h-full bg-primary animate-pulse rounded-full" style={{ width: "30%" }} /></div>}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th scope="col" className="text-left py-2 px-3 text-muted-foreground font-medium sticky left-0 bg-background z-10">{t.channel}</th>
                    <th scope="col" className="text-left py-2 px-3 text-muted-foreground font-medium">{t.model}</th>
                    <th scope="col" className="text-right py-2 px-3 text-muted-foreground font-medium cursor-pointer hover:text-foreground select-none"
                      onClick={() => onSort("tokens_in")}>
                      {t.tokensIn}{sortField === "tokens_in" ? (sortDir === "asc" ? " ↑" : " ↓") : ""}
                    </th>
                    <th scope="col" className="text-right py-2 px-3 text-muted-foreground font-medium cursor-pointer hover:text-foreground select-none"
                      onClick={() => onSort("tokens_in_cache")}>
                      {t.tokensInCache}{sortField === "tokens_in_cache" ? (sortDir === "asc" ? " ↑" : " ↓") : ""}
                    </th>
                    <th scope="col" className="text-right py-2 px-3 text-muted-foreground font-medium cursor-pointer hover:text-foreground select-none"
                      onClick={() => onSort("tokens_out")}>
                      {t.tokensOut}{sortField === "tokens_out" ? (sortDir === "asc" ? " ↑" : " ↓") : ""}
                    </th>
                    <th scope="col" className="text-right py-2 px-3 text-muted-foreground font-medium cursor-pointer hover:text-foreground select-none"
                      onClick={() => onSort("total")}>
                      {t.tokens}{sortField === "total" ? (sortDir === "asc" ? " ↑" : " ↓") : ""}
                    </th>
                    <th scope="col" className="text-center py-2 px-3 text-muted-foreground font-medium">{t.multiplier}</th>
                    <th scope="col" className="text-right py-2 px-3 text-muted-foreground font-medium cursor-pointer hover:text-foreground select-none"
                      onClick={() => onSort("cost")}>
                      {t.cost}{sortField === "cost" ? (sortDir === "asc" ? " ↑" : " ↓") : ""}
                    </th>
                    <th scope="col" className="text-center py-2 px-3 text-muted-foreground font-medium">{t.details}</th>
                    <th scope="col" className="text-center py-2 px-3 text-muted-foreground font-medium">{t.notes}</th>
                    <th scope="col" className="text-right py-2 px-3 text-muted-foreground font-medium cursor-pointer hover:text-foreground select-none"
                      onClick={() => onSort("latency_ms")}>
                      {t.latency}{sortField === "latency_ms" ? (sortDir === "asc" ? " ↑" : " ↓") : ""}
                    </th>
                    <th scope="col" className="text-center py-2 px-3 text-muted-foreground font-medium">{t.status}</th>
                    <th scope="col" className="text-right py-2 px-3 text-muted-foreground font-medium cursor-pointer hover:text-foreground select-none"
                      onClick={() => onSort("created_at")}>
                      {t.time}{sortField === "created_at" ? (sortDir === "asc" ? " ↑" : " ↓") : ""}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedLogs.map((log) => (
                    <Fragment key={log.id}>
                      <tr className="border-b border-border/20 hover:bg-muted/30">
                        <td className="py-2 px-3 text-xs text-muted-foreground sticky left-0 bg-card z-10">{log.channel_name || t.noChannel}</td>
                        <td className="py-2 px-3 font-mono text-xs">{log.model}</td>
                        <td className="py-2 px-3 text-right font-mono">{Math.max(0, log.tokens_in - log.tokens_in_cache).toLocaleString()}</td>
                        <td className="py-2 px-3 text-right font-mono">{log.tokens_in_cache > 0 ? log.tokens_in_cache.toLocaleString() : "0"}</td>
                        <td className="py-2 px-3 text-right font-mono">{log.tokens_out.toLocaleString()}</td>
                        <td className="py-2 px-3 text-right font-mono">{(log.tokens_in + log.tokens_out).toLocaleString()}</td>
                        <td className="py-2 px-3 text-center">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-muted font-mono">
                            {(log.multiplier ?? 1.0).toFixed(2)}x
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right font-mono">
                          {log.deduction_source === "credits" ? (
                            <span className="text-emerald-500">$0.00</span>
                          ) : (
                            formatCostDisplay(log.cost)
                          )}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <button
                            onClick={() => onToggleExpand(log.id)}
                            className="text-xs text-primary hover:underline"
                          >
                            {t.details}
                          </button>
                        </td>
                        <td className="py-2 px-3 text-center">
                          {log.deduction_source === "credits" ? (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400">{t.subUser}</span>
                          ) : (
                            <span className="text-xs text-muted-foreground">{t.balanceUser}</span>
                          )}
                        </td>
                        <td className={`py-2 px-3 text-right font-mono ${log.latency_ms ? (log.latency_ms < 1000 ? "text-green-500" : log.latency_ms < 5000 ? "text-yellow-500" : "text-red-500") : ""}`}>{log.latency_ms ? `${log.latency_ms}ms` : "-"}</td>
                        <td className="py-2 px-3 text-center">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${log.success ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
                            {log.success ? t.success : t.failed}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right text-xs text-muted-foreground">{new Date(log.created_at + "Z").toLocaleString()}</td>
                      </tr>
                      {expandedId === log.id && (
                        <tr className="border-b border-border/20 bg-muted/20">
                          <td colSpan={13} className="px-6 py-4">
                            <div className="flex justify-end mb-2">
                              <button onClick={() => onToggleExpand(log.id)}
                                className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted transition-colors"
                                aria-label={lang === "zh" ? "关闭" : "Close"}>
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                            {renderBreakdown(log)}
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
        {/* Pagination */}
        {(page > 1 || total > 50) && (
          <div className="flex items-center justify-between pt-3 border-t border-border/20">
            <span className="text-xs text-muted-foreground">
              {t.showing} {logs.length} / {total}
            </span>
            <div className="flex items-center gap-2">
              {page > 1 && (
                <button onClick={() => onPageChange(page - 1)} className="px-3 py-1 text-xs rounded-md bg-muted hover:bg-muted/80">
                  {t.prev}
                </button>
              )}
              {page * 50 < total && (
                <button onClick={() => onPageChange(page + 1)} className="px-3 py-1 text-xs rounded-md bg-muted hover:bg-muted/80">
                  {t.next}
                </button>
              )}
              <span className="text-xs text-muted-foreground mx-1">|</span>
              <label className="flex items-center gap-1 text-xs text-muted-foreground">
                {lang === "zh" ? "跳转" : "Go to"}
                <input type="number" min={1} max={Math.ceil(total / 50) || 1}
                  onKeyDown={e => {
                    if (e.key === "Enter") {
                      const max = Math.ceil(total / 50) || 1;
                      const v = Math.min(Math.max(1, parseInt((e.target as HTMLInputElement).value) || 1), max);
                      onPageChange(v);
                    }
                  }}
                  className="w-12 h-7 px-1 rounded border border-border/50 bg-background text-xs text-center focus:border-primary focus:outline-none"
                />
              </label>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
