"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/contexts/i18n-context";
import { useAuth } from "@/contexts/auth-context";
import { useCurrency } from "@/contexts/currency-context";
import { Pencil, Save, X, RefreshCw, Search, Cpu, Check, Zap, ArrowUpDown, ExternalLink } from "lucide-react";
import Link from "next/link";

interface ChannelModel {
  model_name: string;
  provider: string;
  channel_name: string;
  channel_id: number;
  enabled: number;
  input_rate: number;
  output_rate: number;
  cache_rate: number;
  cache_creation_rate: number;
  credit_rate: number;
  rate_id: number | null;
  display_name: string | null;
  tags: string[];
}

type Currency = "USD" | "CNY";

const PROVIDER_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  openai:    { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
  anthropic: { bg: "bg-amber-500/10",   text: "text-amber-400",   border: "border-amber-500/20" },
  deepseek:  { bg: "bg-sky-500/10",     text: "text-sky-400",     border: "border-sky-500/20" },
  google:    { bg: "bg-red-500/10",     text: "text-red-400",     border: "border-red-500/20" },
  alibaba:   { bg: "bg-violet-500/10",  text: "text-violet-400",  border: "border-violet-500/20" },
  meta:      { bg: "bg-blue-500/10",    text: "text-blue-400",    border: "border-blue-500/20" },
  unknown:   { bg: "bg-zinc-500/10",    text: "text-zinc-400",    border: "border-zinc-500/20" },
};

const LABELS = {
  zh: {
    title: "模型市场",
    subtitle: "浏览所有可用的 AI 模型及其定价",
    inputPrice: "输入(未命中缓存)",
    outputPrice: "输出",
    cacheRead: "输入(命中缓存)",
    channel: "渠道",
    available: "可用",
    unavailable: "不可用",
    edit: "编辑",
    save: "保存",
    cancel: "取消",
    noModels: "暂无模型，请先在渠道管理中配置",
    perMillion: "/1M tokens",
    syncing: "同步中...",
    syncAll: "同步渠道",
    search: "搜索模型名称、供应商...",
    all: "全部",
    displayName: "显示名称",
    creditRate: "Credit 倍率",
    creditRateHint: "1 token = N credits",
    modelsCount: "个模型",
    sortBy: "排序",
    sortName: "名称 A-Z",
    sortNameDesc: "名称 Z-A",
    sortInputAsc: "输入价格 ↑",
    sortInputDesc: "输入价格 ↓",
    sortOutputAsc: "补全价格 ↑",
    sortOutputDesc: "补全价格 ↓",
  },
  en: {
    title: "Model Marketplace",
    subtitle: "Browse all available AI models and their pricing",
    inputPrice: "Input(non-cached)",
    outputPrice: "Output",
    cacheRead: "Input(cache hit)",
    channel: "Channel",
    available: "Available",
    unavailable: "Unavailable",
    edit: "Edit",
    save: "Save",
    cancel: "Cancel",
    noModels: "No models available. Configure channels first.",
    perMillion: "/1M tokens",
    syncing: "Syncing...",
    syncAll: "Sync Channels",
    search: "Search models, providers...",
    all: "All",
    displayName: "Display Name",
    creditRate: "Credit Rate",
    creditRateHint: "1 token = N credits",
    modelsCount: "models",
    sortBy: "Sort",
    sortName: "Name A-Z",
    sortNameDesc: "Name Z-A",
    sortInputAsc: "Input price ↑",
    sortInputDesc: "Input price ↓",
    sortOutputAsc: "Output price ↑",
    sortOutputDesc: "Output price ↓",
  },
};

export default function ModelsPage() {
  const { lang } = useI18n();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const t = LABELS[lang];

  const [models, setModels] = useState<ChannelModel[]>([]);
  const [loading, setLoading] = useState(true);
  const { currency, setCurrency, exchangeRate, formatPrice } = useCurrency();
  const [editingModel, setEditingModel] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ input_rate: 0, output_rate: 0, cache_rate: 0, cache_creation_rate: 0, credit_rate: 1.0, display_name: "" });
  const [search, setSearch] = useState("");
  const [providerFilter, setProviderFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [syncing, setSyncing] = useState(false);
  const [visibleCount, setVisibleCount] = useState(20);

  const fetchModels = () => {
    fetch("/api/dashboard/models?source=channels", { credentials: "include" })
      .then((res) => res.json())
      .then((d) => { setModels(d.models || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchModels(); }, []);

  const syncAllChannels = async () => {
    setSyncing(true);
    try {
      const chRes = await fetch("/api/dashboard/channels", { credentials: "include" });
      const chData = await chRes.json();
      const channels = (chData.channels || []).filter((ch: { enabled: number }) => ch.enabled);
      await Promise.allSettled(
        channels.map((ch: { id: number }) =>
          fetch("/api/dashboard/channels", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ action: "sync-models", id: ch.id }),
          })
        )
      );
    } catch { /* ignore */ }
    setSyncing(false);
    fetchModels();
  };

  const startEdit = (m: ChannelModel) => {
    setEditingModel(m.model_name);
    setEditForm({
      input_rate: m.input_rate,
      output_rate: m.output_rate,
      cache_rate: m.cache_rate,
      cache_creation_rate: m.cache_creation_rate,
      credit_rate: m.credit_rate ?? 1.0,
      display_name: m.display_name || m.model_name,
    });
  };

  const savePrice = async (modelName: string) => {
    await fetch("/api/dashboard/models", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ model_name: modelName, ...editForm }),
    });
    setEditingModel(null);
    fetchModels();
  };

  const filtered = useMemo(() => {
    const result = models.filter((m) => {
      const q = search.toLowerCase();
      const matchesSearch = !q ||
        m.model_name.toLowerCase().includes(q) ||
        (m.display_name || "").toLowerCase().includes(q) ||
        m.provider.toLowerCase().includes(q) ||
        m.channel_name.toLowerCase().includes(q);
      const matchesProvider = providerFilter === "all" || m.provider === providerFilter;
      const matchesTag = tagFilter === "all" || (m.tags && m.tags.includes(tagFilter));
      return matchesSearch && matchesProvider && matchesTag;
    });

    // Apply sorting
    const sorted = [...result];
    switch (sortBy) {
      case "name": sorted.sort((a, b) => (a.display_name || a.model_name).localeCompare(b.display_name || b.model_name)); break;
      case "name_desc": sorted.sort((a, b) => (b.display_name || b.model_name).localeCompare(a.display_name || a.model_name)); break;
      case "input_asc": sorted.sort((a, b) => a.input_rate - b.input_rate); break;
      case "input_desc": sorted.sort((a, b) => b.input_rate - a.input_rate); break;
      case "output_asc": sorted.sort((a, b) => a.output_rate - b.output_rate); break;
      case "output_desc": sorted.sort((a, b) => b.output_rate - a.output_rate); break;
    }
    return sorted;
  }, [models, search, providerFilter, tagFilter, sortBy]);

  const providers = useMemo(() => [...new Set(models.map(m => m.provider))].sort(), [models]);
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    for (const m of models) {
      if (m.tags) m.tags.forEach((t: string) => tagSet.add(t));
    }
    return [...tagSet].sort();
  }, [models]);

  const fmtPrice = (rate: number) => {
    if (rate <= 0) return "-";
    return formatPrice(rate, 6);
  };

  const pc = (provider: string) => PROVIDER_COLORS[provider] || PROVIDER_COLORS.unknown;

  return (
    <div className="min-h-screen">
      {/* Hero header */}
      <div className="border-b border-border bg-gradient-to-b from-background to-muted/30">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
              <p className="text-muted-foreground mt-1">{t.subtitle}</p>
              {!loading && (
                <p className="text-xs text-muted-foreground mt-2">
                  {filtered.length} {t.modelsCount}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {/* Currency toggle */}
              <div className="flex bg-muted rounded-lg p-0.5 text-xs font-medium">
                <button
                  onClick={() => setCurrency("USD")}
                  className={`px-3 py-1.5 rounded-md transition-all ${
                    currency === "USD"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  $ USD
                </button>
                <button
                  onClick={() => setCurrency("CNY")}
                  className={`px-3 py-1.5 rounded-md transition-all ${
                    currency === "CNY"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  ¥ CNY
                </button>
              </div>
              {isAdmin && (
                <Button size="sm" variant="outline" onClick={syncAllChannels} disabled={syncing}>
                  <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${syncing ? "animate-spin" : ""}`} />
                  {syncing ? t.syncing : t.syncAll}
                </Button>
              )}
            </div>
          </div>

          {/* Search + Filter bar */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t.search}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 bg-background"
             />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              <button
                onClick={() => setProviderFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                  providerFilter === "all"
                    ? "bg-primary/10 text-primary border-primary/30"
                    : "bg-transparent text-muted-foreground border-border hover:text-foreground hover:border-foreground/20"
                }`}
              >
                {t.all}
              </button>
              {providers.map((p) => {
                const c = pc(p);
                return (
                  <button
                    key={p}
                    onClick={() => setProviderFilter(p)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                      providerFilter === p
                        ? `${c.bg} ${c.text} ${c.border}`
                        : "bg-transparent text-muted-foreground border-border hover:text-foreground hover:border-foreground/20"
                    }`}
                  >
                    {p.toUpperCase()}
                  </button>
                );
              })}
            </div>
            {/* Tag filter */}
            {allTags.length > 0 && (
              <div className="flex gap-1.5 flex-wrap">
                <button
                  onClick={() => setTagFilter("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                    tagFilter === "all"
                      ? "bg-primary/10 text-primary border-primary/30"
                      : "bg-transparent text-muted-foreground border-border hover:text-foreground hover:border-foreground/20"
                  }`}
                >
                  {t.all}
                </button>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setTagFilter(tag)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                      tagFilter === tag
                        ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                        : "bg-transparent text-muted-foreground border-border hover:text-foreground hover:border-foreground/20"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
            {/* Sort dropdown */}
            <div className="relative">
              <ArrowUpDown className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort models"
                className="h-9 pl-8 pr-3 rounded-lg text-xs font-medium border border-border bg-background text-foreground appearance-none cursor-pointer"
              >
                <option value="name">{t.sortName}</option>
                <option value="name_desc">{t.sortNameDesc}</option>
                <option value="input_asc">{t.sortInputAsc}</option>
                <option value="input_desc">{t.sortInputDesc}</option>
                <option value="output_asc">{t.sortOutputAsc}</option>
                <option value="output_desc">{t.sortOutputDesc}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Model Grid */}
      <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="glass-card animate-pulse">
                <CardContent className="p-5">
                  <div className="h-4 bg-muted rounded w-20 mb-3" />
                  <div className="h-5 bg-muted rounded w-48 mb-4" />
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-12 bg-muted rounded" />
                    <div className="h-12 bg-muted rounded" />
                    <div className="h-12 bg-muted rounded" />
                    <div className="h-12 bg-muted rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Cpu className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">{t.noModels}</p>
          </div>
        ) : (
          <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.slice(0, visibleCount).map((m) => {
              const c = pc(m.provider);
              const isEditing = editingModel === m.model_name && isAdmin;
              return (
                <Card
                  key={`${m.model_name}-${m.channel_id}`}
                  className={`glass-card overflow-hidden transition-all hover:shadow-lg hover:border-foreground/10 group ${!m.enabled ? "opacity-50" : ""}`}
                >
                  <CardContent className="p-0">
                    {isEditing ? (
                      /* Edit mode */
                      <div className="p-5 space-y-3">
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">{t.displayName}</label>
                          <Input
                            value={editForm.display_name}
                            onChange={(e) => setEditForm((f) => ({ ...f, display_name: e.target.value }))}
                            className="h-8 text-xs"
                         />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { key: "input_rate" as const, label: t.inputPrice },
                            { key: "output_rate" as const, label: t.outputPrice },
                            { key: "cache_rate" as const, label: t.cacheRead },
                          ].map(({ key, label }) => (
                            <div key={key}>
                              <label className="text-xs text-muted-foreground mb-1 block">{label} ({currency === "CNY" ? "¥" : "$"}/1M)</label>
                              <Input
                                type="number"
                                step="0.0001"
                                value={currency === "CNY" ? (editForm[key] * exchangeRate).toFixed(2) : editForm[key]}
                                onChange={(e) => {
                                  const raw = Number(e.target.value);
                                  const usdValue = currency === "CNY" ? raw / exchangeRate : raw;
                                  setEditForm((f) => ({ ...f, [key]: usdValue }));
                                }}
                                className="h-8 text-xs"
                             />
                            </div>
                          ))}
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">{t.creditRate}</label>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground whitespace-nowrap">1 token =</span>
                            <Input
                              type="number"
                              step="0.1"
                              min="0"
                              value={editForm.credit_rate}
                              onChange={(e) => setEditForm((f) => ({ ...f, credit_rate: parseFloat(e.target.value) || 1.0 }))}
                              className="h-8 text-xs w-24"
                           />
                            <span className="text-xs text-muted-foreground whitespace-nowrap">credits</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-1">{t.creditRateHint}</p>
                        </div>
                        <div className="flex gap-2 pt-1">
                          <Button size="sm" onClick={() => savePrice(m.model_name)} className="h-7 text-xs">
                            <Save className="h-3 w-3 mr-1" />{t.save}
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingModel(null)} className="h-7 text-xs">
                            <X className="h-3 w-3 mr-1" />{t.cancel}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      /* View mode */
                      <>
                        {/* Top bar: provider + status + tags */}
                        <div className="px-5 pt-4 pb-3 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-semibold border ${c.bg} ${c.text} ${c.border}`}>
                              {m.provider}
                            </span>
                            {m.tags && m.tags.length > 0 && m.tags.map((tag: string) => (
                              <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                {tag}
                              </span>
                            ))}
                          </div>
                          <span className={`flex items-center gap-1 text-[10px] font-medium ${m.enabled ? "text-emerald-400" : "text-red-400"}`}>
                            {m.enabled ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                            {m.enabled ? t.available : t.unavailable}
                          </span>
                        </div>

                        {/* Model name */}
                        <div className="px-5 pb-3">
                          <h3 className="font-semibold text-sm leading-tight truncate" title={m.model_name}>
                            {m.display_name && m.display_name !== m.model_name ? m.display_name : m.model_name}
                          </h3>
                          {m.display_name && m.display_name !== m.model_name && (
                            <p className="text-[11px] text-muted-foreground font-mono mt-0.5 truncate">{m.model_name}</p>
                          )}
                        </div>

                        {/* Price table */}
                        {m.rate_id ? (
                          <div className="mx-5 mb-3 rounded-lg border border-border/50 overflow-hidden">
                            <div className="grid grid-cols-2 divide-x divide-y divide-border/50">
                              <PriceCell label={t.inputPrice} value={fmtPrice(m.input_rate)} />
                              <PriceCell label={t.outputPrice} value={fmtPrice(m.output_rate)} />
                              <PriceCell label={t.cacheRead} value={fmtPrice(m.cache_rate)} />
                            </div>
                            <div className="px-3 py-1.5 border-t border-border/50 bg-muted/30">
                              <span className="text-[10px] text-muted-foreground">{t.creditRate}: 1 token = {m.credit_rate ?? 1.0} credits</span>
                            </div>
                          </div>
                        ) : (
                          <div className="mx-5 mb-3">
                            <span className="text-[11px] text-amber-400 bg-amber-400/10 px-2 py-1 rounded font-medium">
                              {t.perMillion} —
                            </span>
                          </div>
                        )}

                        {/* Footer */}
                        <div className="px-5 py-3 flex items-center justify-between border-t border-border/30 bg-muted/20">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Zap className="h-3 w-3" />
                            {m.channel_name}
                          </div>
                          <div className="flex items-center gap-2">
                            <Link href={`/models/${encodeURIComponent(m.model_name)}`} aria-label={`View ${m.display_name || m.model_name} details`} className="text-muted-foreground hover:text-primary transition-colors" title={lang === "zh" ? "查看详情" : "View details"}>
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Link>
                            {isAdmin && (
                              <button
                                onClick={() => startEdit(m)}
                                className="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 text-muted-foreground hover:text-primary transition-all"
                                title={t.edit}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
          {visibleCount < filtered.length && (
            <div className="flex justify-center mt-6">
              <button
                onClick={() => setVisibleCount((prev) => prev + 20)}
                className="text-sm text-primary hover:underline focus:outline-none"
              >
                {lang === "zh" ? "加载更多" : "Load More"} ({filtered.length - visibleCount})
              </button>
            </div>
          )}
          </>
        )}
      </div>
    </div>
  );
}

function PriceCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-3 py-2">
      <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">{label}</div>
      <div className="text-xs font-mono font-semibold">
        {value === "-" ? (
          <span className="text-muted-foreground/40">—</span>
        ) : (
          value
        )}
      </div>
    </div>
  );
}
