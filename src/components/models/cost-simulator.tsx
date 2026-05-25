"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/contexts/i18n-context";
import { Calculator, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModelPrice {
  model_name: string;
  input_rate: number;
  output_rate: number;
  cache_rate: number;
  credit_rate: number;
  display_name: string | null;
}

interface CostSimulatorProps {
  models: ModelPrice[];
  exchangeRate: number;
  currency: "USD" | "CNY";
}

function fmt(v: number, curr: string, rate: number): string {
  const val = curr === "CNY" ? v * rate : v;
  if (val < 0.0001) return `${curr === "CNY" ? "¥" : "$"}${val.toFixed(8)}`;
  if (val < 0.01) return `${curr === "CNY" ? "¥" : "$"}${val.toFixed(6)}`;
  return `${curr === "CNY" ? "¥" : "$"}${val.toFixed(4)}`;
}

export function CostSimulator({ models, exchangeRate, currency }: CostSimulatorProps) {
  const { lang } = useI18n();
  const [open, setOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState("");
  const [inputTokens, setInputTokens] = useState(800);
  const [cacheTokens, setCacheTokens] = useState(200);
  const [outputTokens, setOutputTokens] = useState(500);
  const [dailyReqs, setDailyReqs] = useState(100);

  const model = useMemo(() => models.find((m) => m.model_name === selectedModel), [models, selectedModel]);

  const costs = useMemo(() => {
    if (!model) return null;
    const perCall = (inputTokens * model.input_rate + cacheTokens * model.cache_rate + outputTokens * model.output_rate) / 1000000;
    const daily = perCall * dailyReqs;
    const cr = model.credit_rate ?? 1.0;
    const totalTokens = inputTokens + cacheTokens + outputTokens;
    const creditsPerCall = totalTokens * cr;
    return {
      perCall,
      inputCost: (inputTokens * model.input_rate) / 1000000,
      cacheCost: (cacheTokens * model.cache_rate) / 1000000,
      outputCost: (outputTokens * model.output_rate) / 1000000,
      daily, monthly: daily * 30, yearly: daily * 365,
      creditsPerCall, creditsDaily: creditsPerCall * dailyReqs,
      creditsMonthly: creditsPerCall * dailyReqs * 30,
      creditsYearly: creditsPerCall * dailyReqs * 365,
    };
  }, [model, inputTokens, cacheTokens, outputTokens, dailyReqs]);

  return (
    <Card className={cn("glass-card overflow-hidden transition-all", open ? "border-primary/20" : "border-border/50")}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/20"
      >
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center shrink-0">
          <Calculator className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium">{lang === "zh" ? "Token 计算器" : "Token Calculator"}</div>
          <div className="text-xs text-muted-foreground">{lang === "zh" ? "估算调用成本" : "Estimate API costs"}</div>
        </div>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform shrink-0", open && "rotate-180")} />
      </button>
      {open && (
        <CardContent className="px-4 pb-4 pt-0 border-t border-border/50">
          <div className="space-y-4 pt-4">
            {model && (
              <>
                {/* Model + rate cards */}
                <div className="flex gap-3">
                  <div className="w-1/3">
                    <label className="text-xs text-muted-foreground mb-1 block">{lang === "zh" ? "选择模型" : "Model"}</label>
                    <select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm font-mono"
                    >
                      <option value="">{lang === "zh" ? "-- 选择模型 --" : "-- Select --"}</option>
                      {models.map((m) => (
                        <option key={m.model_name} value={m.model_name}>{m.display_name || m.model_name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="w-2/3 grid grid-cols-3 gap-2">
                    <div className="rounded-lg bg-blue-500/5 border border-blue-500/15 px-3 py-2.5">
                      <div className="text-[11px] text-blue-400 font-medium">{lang === "zh" ? "输入(未命中缓存)" : "Input(non-cached)"}</div>
                      <div className="text-sm font-mono font-semibold text-foreground mt-0.5">{fmt(model.input_rate, currency, exchangeRate)}<span className="text-xs text-muted-foreground">/1M</span></div>
                    </div>
                    <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/15 px-3 py-2.5">
                      <div className="text-[11px] text-emerald-400 font-medium">{lang === "zh" ? "输入(命中缓存)" : "Input(cached)"}</div>
                      <div className="text-sm font-mono font-semibold text-foreground mt-0.5">{fmt(model.cache_rate, currency, exchangeRate)}<span className="text-xs text-muted-foreground">/1M</span></div>
                    </div>
                    <div className="rounded-lg bg-amber-500/5 border border-amber-500/15 px-3 py-2.5">
                      <div className="text-[11px] text-amber-400 font-medium">{lang === "zh" ? "输出" : "Output"}</div>
                      <div className="text-sm font-mono font-semibold text-foreground mt-0.5">{fmt(model.output_rate, currency, exchangeRate)}<span className="text-xs text-muted-foreground">/1M</span></div>
                    </div>
                  </div>
                </div>

                {/* Inputs: 4 columns */}
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className="text-[11px] text-muted-foreground mb-1 block">{lang === "zh" ? "输入(未命中缓存)" : "Input(non-cached)"}</label>
                    <input type="number" min={0} step={100} value={inputTokens} onChange={(e) => setInputTokens(Math.max(0, parseInt(e.target.value) || 0))} className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm font-mono" />
                  </div>
                  <div>
                    <label className="text-[11px] text-muted-foreground mb-1 block">{lang === "zh" ? "输入(命中缓存)" : "Input(cached)"}</label>
                    <input type="number" min={0} step={100} value={cacheTokens} onChange={(e) => setCacheTokens(Math.max(0, parseInt(e.target.value) || 0))} className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm font-mono" />
                  </div>
                  <div>
                    <label className="text-[11px] text-muted-foreground mb-1 block">{lang === "zh" ? "输出" : "Output"}</label>
                    <input type="number" min={0} step={100} value={outputTokens} onChange={(e) => setOutputTokens(Math.max(0, parseInt(e.target.value) || 0))} className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm font-mono" />
                  </div>
                  <div>
                    <label className="text-[11px] text-muted-foreground mb-1 block">{lang === "zh" ? "每日请求数" : "Daily Reqs"}</label>
                    <input type="number" min={0} step={10} value={dailyReqs} onChange={(e) => setDailyReqs(Math.max(0, parseInt(e.target.value) || 0))} className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm font-mono" />
                  </div>
                </div>

                {/* Results */}
                {costs && (
                  <div className="space-y-2">
                    <div className="flex gap-3">
                      <div className="w-2/5 rounded-xl bg-gradient-to-br from-primary/[0.05] to-transparent border border-primary/15 px-4 py-3">
                        <div className="text-xs text-muted-foreground">{lang === "zh" ? "每次请求" : "Per Call"}</div>
                        <div className="text-2xl font-bold font-mono text-primary mt-1">{fmt(costs.perCall, currency, exchangeRate)}</div>
                        <div className="text-xs text-muted-foreground/70 mt-1 font-mono">
                          {lang === "zh" ? "输入(未缓存)" : "In(non-cached)"}: {fmt(costs.inputCost, currency, exchangeRate)} · {lang === "zh" ? "输入(缓存)" : "In(cached)"}: {fmt(costs.cacheCost, currency, exchangeRate)} · {lang === "zh" ? "输出" : "Out"}: {fmt(costs.outputCost, currency, exchangeRate)}
                        </div>
                      </div>
                      <div className="w-1/5 rounded-lg bg-blue-500/5 border border-blue-500/15 px-3 py-3 text-center">
                        <div className="text-xs text-blue-400 font-semibold">{lang === "zh" ? "每日" : "Daily"}</div>
                        <div className="text-base font-bold font-mono text-foreground mt-1">{fmt(costs.daily, currency, exchangeRate)}</div>
                        <div className="text-xs text-muted-foreground mt-1">{dailyReqs}{lang === "zh" ? "次" : "r"}</div>
                      </div>
                      <div className="w-1/5 rounded-lg bg-emerald-500/5 border border-emerald-500/15 px-3 py-3 text-center">
                        <div className="text-xs text-emerald-400 font-semibold">{lang === "zh" ? "每月" : "Monthly"}</div>
                        <div className="text-base font-bold font-mono text-foreground mt-1">{fmt(costs.monthly, currency, exchangeRate)}</div>
                        <div className="text-xs text-muted-foreground mt-1">30d</div>
                      </div>
                      <div className="w-1/5 rounded-lg bg-purple-500/5 border border-purple-500/15 px-3 py-3 text-center">
                        <div className="text-xs text-purple-400 font-semibold">{lang === "zh" ? "每年" : "Yearly"}</div>
                        <div className="text-base font-bold font-mono text-foreground mt-1">{fmt(costs.yearly, currency, exchangeRate)}</div>
                        <div className="text-xs text-muted-foreground mt-1">365d</div>
                      </div>
                    </div>
                    {/* Credits row */}
                    <div className="flex gap-3">
                      <div className="w-2/5 flex items-center rounded-lg bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20 px-4 py-3">
                        <span className="text-xs text-amber-500/80 leading-relaxed">
                          {lang === "zh" ? "订阅用户每次请求消耗 " : "Subscribers: "}
                          <span className="font-semibold text-amber-400">{Math.round(costs.creditsPerCall).toLocaleString()} Credits</span>
                          {lang === "zh" ? "，按月重置额度" : " deducted per request (monthly reset)"}
                        </span>
                      </div>
                      <div className="w-1/5 rounded-lg bg-amber-500/10 border border-amber-500/15 px-3 py-3 text-center backdrop-blur-sm">
                        <div className="text-xs text-amber-500/60 font-medium uppercase tracking-wider">{lang === "zh" ? "每日" : "Daily"}</div>
                        <div className="text-base font-bold font-mono text-amber-400 mt-1">{Math.round(costs.creditsDaily).toLocaleString()}</div>
                        <div className="text-[10px] text-amber-500/50 mt-0.5">Credits</div>
                      </div>
                      <div className="w-1/5 rounded-lg bg-amber-500/10 border border-amber-500/15 px-3 py-3 text-center backdrop-blur-sm">
                        <div className="text-xs text-amber-500/60 font-medium uppercase tracking-wider">{lang === "zh" ? "每月" : "Monthly"}</div>
                        <div className="text-base font-bold font-mono text-amber-400 mt-1">{Math.round(costs.creditsMonthly).toLocaleString()}</div>
                        <div className="text-[10px] text-amber-500/50 mt-0.5">Credits</div>
                      </div>
                      <div className="w-1/5 rounded-lg bg-amber-500/10 border border-amber-500/15 px-3 py-3 text-center backdrop-blur-sm">
                        <div className="text-xs text-amber-500/60 font-medium uppercase tracking-wider">{lang === "zh" ? "每年" : "Yearly"}</div>
                        <div className="text-base font-bold font-mono text-amber-400 mt-1">{Math.round(costs.creditsYearly).toLocaleString()}</div>
                        <div className="text-[10px] text-amber-500/50 mt-0.5">Credits</div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {!model && (
              <div className="space-y-3">
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm font-mono"
                >
                  <option value="">{lang === "zh" ? "-- 选择模型 --" : "-- Select Model --"}</option>
                  {models.map((m) => (
                    <option key={m.model_name} value={m.model_name}>{m.display_name || m.model_name}</option>
                  ))}
                </select>
                <div className="text-center py-6 text-sm text-muted-foreground">
                  {lang === "zh" ? "选择一个模型开始估算费用" : "Select a model to begin"}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
