"use client";

import { useI18n } from "@/contexts/i18n-context";
import { useCurrency } from "@/contexts/currency-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Fragment, useMemo, useState } from "react";
import { Activity, Coins, DollarSign, X } from "lucide-react";
import useSWR from "swr";
import { dashboardSWRConfig } from "@/lib/swr-fetcher";

interface UsageLog {
  id: number;
  model: string;
  tokens_in: number;
  tokens_out: number;
  tokens_in_cache: number;
  tokens_cache_creation: number;
  cost: number;
  credits_used: number;
  deduction_source: string;
  credit_rate: number | null;
  latency_ms: number | null;
  success: number;
  cached: number;
  created_at: string;
  multiplier: number | null;
  channel_name: string | null;
  input_rate: number | null;
  output_rate: number | null;
  cache_rate: number | null;
  cache_creation_rate: number | null;
}

const LABELS = {
  zh: {
    title: "调用日志",
    model: "模型",
    channel: "渠道",
    tokensIn: "输入 Tokens",
    tokensOut: "输出 Tokens",
    tokensInCache: "缓存命中",
    tokensCacheCreate: "缓存创建",
    tokens: "总 Tokens",
    cost: "费用",
    latency: "延迟",
    status: "状态",
    success: "成功",
    failed: "失败",
    multiplier: "倍率",
    details: "详情",
    noLogs: "暂无调用记录",
    time: "时间",
    totalCalls: "总调用次数",
    totalTokens: "总 Tokens",
    totalCost: "总花费",
    inputCost: "输入费用",
    outputCost: "输出费用",
    cacheReadCost: "缓存读取费用",
    cacheWriteCost: "缓存创建费用",
    costBreakdown: "费用明细",
    noChannel: "无渠道",
    formula: "计算公式",
    nonCachedTokens: "非缓存输入",
    total: "合计",
    noRateData: "未找到模型费率，使用默认费率",
    notes: "备注",
    subUser: "套餐用户",
    balanceUser: "余额扣费",
    showing: "显示",
    prev: "上一页",
    next: "下一页",
  },
  en: {
    title: "Call Logs",
    model: "Model",
    channel: "Channel",
    tokensIn: "Input Tokens",
    tokensOut: "Output Tokens",
    tokensInCache: "Cache Hit",
    tokensCacheCreate: "Cache Create",
    tokens: "Total Tokens",
    cost: "Cost",
    latency: "Latency",
    status: "Status",
    success: "Success",
    failed: "Failed",
    multiplier: "Multiplier",
    details: "Details",
    noLogs: "No usage logs yet",
    time: "Time",
    totalCalls: "Total Calls",
    totalTokens: "Total Tokens",
    totalCost: "Total Cost",
    inputCost: "Input Cost",
    outputCost: "Output Cost",
    cacheReadCost: "Cache Read Cost",
    cacheWriteCost: "Cache Write Cost",
    costBreakdown: "Cost Breakdown",
    noChannel: "No channel",
    formula: "Formula",
    nonCachedTokens: "Non-cached Input",
    total: "Total",
    noRateData: "Model rate not found, using default rate",
    notes: "Notes",
    subUser: "Subscription",
    balanceUser: "Balance",
    showing: "Showing",
    prev: "Previous",
    next: "Next",
  },
};

function formatRate(rate: number | null | undefined): string {
  if (rate == null || rate === 0) return "-";
  return `$${rate.toFixed(4)}/1K`;
}

export default function UsagePage() {
  const { lang } = useI18n();
  const { currency, exchangeRate, formatPrice, symbol } = useCurrency();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const t = LABELS[lang];

  const { data, isLoading } = useSWR<{ data: UsageLog[]; total: number; has_more: boolean }>(
    `/api/v1/billing/usage?limit=50&offset=${(page - 1) * 50}`,
    dashboardSWRConfig,
  );

  const logs = data?.data || [];
  const hasMore = data?.has_more || false;
  const summary = useMemo(() => {
    const totalTokens = logs.reduce((s, l) => s + l.tokens_in + l.tokens_out + l.tokens_in_cache + l.tokens_cache_creation, 0);
    const totalCost = logs.reduce((s, l) => s + l.cost, 0);
    return { total_calls: logs.length, total_tokens: totalTokens, total_cost: totalCost };
  }, [logs]);

  const formatTokens = (n: number) => {
    return n.toLocaleString();
  };

  // Format cost in the current currency (small amounts use USD precision then convert)
  const formatCostDisplay = (usd: number) => {
    if (currency === "CNY") {
      return `¥${(usd * exchangeRate).toFixed(4)}`;
    }
    return `$${usd.toFixed(6)}`;
  };

  // Render detailed cost breakdown for a log entry
  const renderBreakdown = (log: UsageLog) => {
    const isCredits = log.deduction_source === 'credits';
    const inputRate = log.input_rate ?? 0.001;
    const outputRate = log.output_rate ?? 0.002;
    const cacheRate = log.cache_rate ?? 0;
    const cacheCreationRate = log.cache_creation_rate && log.cache_creation_rate > 0
      ? log.cache_creation_rate
      : inputRate * 1.25;
    const creditRate = log.credit_rate ?? 1.0;
    const mult = log.multiplier ?? 1.0;
    const totalTokens = log.tokens_in + log.tokens_out;

    if (isCredits) {
      // Subscription user — show credits breakdown
      const creditsUsed = log.credits_used || Math.ceil(totalTokens * creditRate);
      return (
        <div className="text-xs space-y-3 font-mono">
          <p className="font-semibold text-sm">{lang === "zh" ? "额度明细" : "Credits Breakdown"}</p>
          <div className="text-muted-foreground space-y-0.5">
            <p>{lang === "zh" ? "Credit 倍率" : "Credit Rate"}: 1 token = {creditRate} credits</p>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">{lang === "zh" ? "输入 Tokens" : "Input Tokens"}: {log.tokens_in.toLocaleString()} × {creditRate}</span>
              <span>= {(log.tokens_in * creditRate).toLocaleString()} credits</span>
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
    const nonCachedIn = Math.max(0, log.tokens_in - log.tokens_in_cache - log.tokens_cache_creation);
    const inputCost = nonCachedIn * inputRate / 1000;
    const cacheHitCost = log.tokens_in_cache * cacheRate / 1000;
    const cacheCreationCost = log.tokens_cache_creation * cacheCreationRate / 1000;
    const outputCost = log.tokens_out * outputRate / 1000;
    const baseCost = inputCost + cacheHitCost + cacheCreationCost + outputCost;
    const finalCost = baseCost * mult;
    const rateSource = log.input_rate != null ? "" : ` (${t.noRateData})`;

    return (
      <div className="text-xs space-y-3 font-mono">
        <p className="font-semibold text-sm">{t.costBreakdown}</p>
        <div className="text-muted-foreground space-y-0.5">
          <p>{lang === "zh" ? "模型费率" : "Model Rates"}{rateSource}:</p>
          <p className="pl-3">input = {formatRate(inputRate)}, output = {formatRate(outputRate)}</p>
          <p className="pl-3">cache_read = {formatRate(cacheRate)}, cache_create = {formatRate(cacheCreationRate)}</p>
        </div>
        <div className="space-y-1">
          {nonCachedIn > 0 && (
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">{t.inputCost}: {nonCachedIn.toLocaleString()} × {inputRate.toFixed(4)} / 1000</span>
              <span>= {formatCostDisplay(inputCost)}</span>
            </div>
          )}
          {log.tokens_in_cache > 0 && (
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">{t.cacheReadCost}: {log.tokens_in_cache.toLocaleString()} × {cacheRate.toFixed(4)} / 1000</span>
              <span>= {formatCostDisplay(cacheHitCost)}</span>
            </div>
          )}
          {log.tokens_cache_creation > 0 && (
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">{t.cacheWriteCost}: {log.tokens_cache_creation.toLocaleString()} × {cacheCreationRate.toFixed(4)} / 1000</span>
              <span>= {formatCostDisplay(cacheCreationCost)}</span>
            </div>
          )}
          {log.tokens_out > 0 && (
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">{t.outputCost}: {log.tokens_out.toLocaleString()} × {outputRate.toFixed(4)} / 1000</span>
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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t.title}</h1>

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-md bg-blue-500/10">
              <Activity className="h-4 w-4 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t.totalCalls}</p>
              <p className="text-xl font-bold font-mono">{summary.total_calls.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-md bg-green-500/10">
              <Coins className="h-4 w-4 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t.totalTokens}</p>
              <p className="text-xl font-bold font-mono">{formatTokens(summary.total_tokens)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-md bg-red-500/10">
              <DollarSign className="h-4 w-4 text-red-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t.totalCost}</p>
              <p className="text-xl font-bold font-mono">{formatPrice(summary.total_cost)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg">{t.title}</CardTitle>
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
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">{t.model}</th>
                    <th className="text-right py-2 px-3 text-muted-foreground font-medium hidden md:table-cell">{t.tokensIn}</th>
                    <th className="text-right py-2 px-3 text-muted-foreground font-medium hidden md:table-cell">{t.tokensOut}</th>
                    <th className="text-right py-2 px-3 text-muted-foreground font-medium hidden lg:table-cell">{t.tokensInCache}</th>
                    <th className="text-right py-2 px-3 text-muted-foreground font-medium hidden lg:table-cell">{t.tokensCacheCreate}</th>
                    <th className="text-right py-2 px-3 text-muted-foreground font-medium">{t.tokens}</th>
                    <th className="text-center py-2 px-3 text-muted-foreground font-medium hidden md:table-cell">{t.multiplier}</th>
                    <th className="text-right py-2 px-3 text-muted-foreground font-medium">{t.cost}</th>
                    <th className="text-center py-2 px-3 text-muted-foreground font-medium hidden md:table-cell">{t.details}</th>
                    <th className="text-center py-2 px-3 text-muted-foreground font-medium hidden lg:table-cell">{t.notes}</th>
                    <th className="text-right py-2 px-3 text-muted-foreground font-medium hidden lg:table-cell">{t.latency}</th>
                    <th className="text-center py-2 px-3 text-muted-foreground font-medium">{t.status}</th>
                    <th className="text-right py-2 px-3 text-muted-foreground font-medium">{t.time}</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <Fragment key={log.id}>
                    <tr className="border-b border-border/20 hover:bg-muted/30">
                      <td className="py-2 px-3">
                        <div className="font-mono text-xs">{log.model}</div>
                        <div className="text-xs text-muted-foreground md:hidden">{log.channel_name || t.noChannel}</div>
                      </td>
                      <td className="py-2 px-3 text-right font-mono hidden md:table-cell">{log.tokens_in.toLocaleString()}</td>
                      <td className="py-2 px-3 text-right font-mono hidden md:table-cell">{log.tokens_out.toLocaleString()}</td>
                      <td className="py-2 px-3 text-right font-mono hidden lg:table-cell">{log.tokens_in_cache > 0 ? log.tokens_in_cache.toLocaleString() : "0"}</td>
                      <td className="py-2 px-3 text-right font-mono hidden lg:table-cell">{log.tokens_cache_creation > 0 ? log.tokens_cache_creation.toLocaleString() : "0"}</td>
                      <td className="py-2 px-3 text-right font-mono">{(log.tokens_in + log.tokens_out + log.tokens_in_cache + log.tokens_cache_creation).toLocaleString()}</td>
                      <td className="py-2 px-3 text-center hidden md:table-cell">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted font-mono">
                          {(log.multiplier ?? 1.0).toFixed(2)}x
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right font-mono">
                        {log.deduction_source === 'credits' ? (
                          <span className="text-emerald-500">$0.00</span>
                        ) : (
                          formatCostDisplay(log.cost)
                        )}
                      </td>
                      <td className="py-2 px-3 text-center hidden md:table-cell">
                        <button
                          onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                          className="text-xs text-primary hover:underline"
                        >
                          {t.details}
                        </button>
                      </td>
                      <td className="py-2 px-3 text-center hidden lg:table-cell">
                        {log.deduction_source === 'credits' ? (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400">{t.subUser}</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">{t.balanceUser}</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right font-mono hidden lg:table-cell">{log.latency_ms ? `${log.latency_ms}ms` : "-"}</td>
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
                            <button
                              onClick={() => setExpandedId(null)}
                              className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted transition-colors"
                              aria-label={lang === "zh" ? "关闭" : "Close"}
                            >
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
          )}
          {/* Pagination */}
          {(page > 1 || hasMore) && (
            <div className="flex items-center justify-between pt-3 border-t border-border/20">
              <span className="text-xs text-muted-foreground">
                {t.showing || "Showing"} {logs.length} / {data?.total || 0}
              </span>
              <div className="flex gap-2">
                {page > 1 && (
                  <button onClick={() => setPage(p => p - 1)} className="px-3 py-1 text-xs rounded-md bg-muted hover:bg-muted/80">
                    {t.prev || "Previous"}
                  </button>
                )}
                {hasMore && (
                  <button onClick={() => setPage(p => p + 1)} className="px-3 py-1 text-xs rounded-md bg-muted hover:bg-muted/80">
                    {t.next || "Next"}
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
