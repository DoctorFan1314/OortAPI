"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Puzzle, BookOpen, Server, LayoutGrid, TrendingUp, Tags, ArrowRight, Search, X, Cloud, Rocket, Copy, Sparkles, Wrench, Check, BarChart3, Users } from "lucide-react";
import { useI18n } from "@/contexts/i18n-context";
import { useToast } from "@/contexts/toast-context";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState, useMemo, useCallback } from "react";
import useSWR from "swr";
import { dashboardSWRConfig } from "@/lib/swr-fetcher";
import { RESOURCE_ITEMS, getResourcesByType, type ResourceItem, type ResourceType } from "@/lib/resource-registry";

interface CountsData {
  skills?: number;
  prompts?: number;
}

const SECTIONS = [
  { href: "/skills", icon: Puzzle, i18nKey: "sectionSkills" as const, countKey: "skills" as const },
  { href: "/prompts", icon: BookOpen, i18nKey: "sectionPrompts" as const, countKey: "prompts" as const },
  { href: "/resources/mcp", icon: Server, i18nKey: "mcpEcosystem" as const },
  { href: "/categories", icon: LayoutGrid, i18nKey: "sectionCategories" as const },
  { href: "/trending", icon: TrendingUp, i18nKey: "sectionTrending" as const },
  { href: "/tags", icon: Tags, i18nKey: "sectionTags" as const },
];

const BADGE_STYLES: Record<ResourceType, string> = {
  mcp: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  "client-skill": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "prompt-template": "bg-green-500/10 text-green-400 border-green-500/20",
};

const BADGE_I18N: Record<ResourceType, "badgeMcp" | "badgeClientSkill" | "badgePrompt"> = {
  mcp: "badgeMcp",
  "client-skill": "badgeClientSkill",
  "prompt-template": "badgePrompt",
};

const OVERVIEW_SECTIONS: { type: ResourceType; tabKey: string; i18nKey: "tabMcp" | "tabPrompt" | "tabClientSkill" }[] = [
  { type: "mcp", tabKey: "mcp", i18nKey: "tabMcp" },
  { type: "prompt-template", tabKey: "prompt-template", i18nKey: "tabPrompt" },
  { type: "client-skill", tabKey: "client-skill", i18nKey: "tabClientSkill" },
];

const DEFAULT_VISIBLE = 9;
const OVERVIEW_PER_TYPE = 3;

function getDetailHref(item: ResourceItem): string | null {
  if (item.type === "prompt-template") return `/prompts/${item.id.replace(/^prompt-/, "")}`;
  if (item.type === "client-skill") return `/skills/${item.id.replace(/^skill-/, "")}`;
  if (item.type === "mcp") return `/resources/mcp/${item.id}`;
  return null;
}

function ResourceCard({ item, copiedId, onLaunch, onCopy, t, lang }: { item: ResourceItem; copiedId: string | null; onLaunch: (i: ResourceItem) => void; onCopy: (i: ResourceItem) => void; t: ReturnType<typeof useI18n>["t"]; lang: string }) {
  const detailHref = getDetailHref(item);
  return (
    <div className="glass-card glass-card-hover p-5 h-full group flex flex-col relative">
      <div className="flex items-center gap-2 mb-3">
        <Badge className={`${BADGE_STYLES[item.type]} border text-[10px] font-medium`}>
          {t.resourceHub[BADGE_I18N[item.type]]}
        </Badge>
        {item.featured && (
          <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 border text-[10px]">★ Featured</Badge>
        )}
      </div>
      <h3 className="text-sm font-semibold mb-1.5 line-clamp-1">{lang === "zh" ? item.nameZh : item.name}</h3>
      <p className="text-xs text-muted-foreground mb-2 line-clamp-2 flex-1">{lang === "zh" ? item.descriptionZh : item.description}</p>
      {/* Stats row (M2) */}
      {(item.mcpUsageCount || item.mcpUserCount) && (
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground mb-2">
          {item.mcpUsageCount && <span className="flex items-center gap-1"><BarChart3 className="h-3 w-3" />{item.mcpUsageCount}</span>}
          {item.mcpUserCount && <span className="flex items-center gap-1"><Users className="h-3 w-3" />{item.mcpUserCount}</span>}
        </div>
      )}
      {item.type === "mcp" && item.requiredTools && (
        <div className="flex flex-wrap gap-1 mb-3">
          {item.requiredTools.map(tool => (
            <span key={tool.function.name} className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono text-muted-foreground">{tool.function.name}</span>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-1 mb-3">
        {item.tags.slice(0, 3).map(tag => (
          <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary text-secondary-foreground border border-border">{tag}</span>
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground mb-3">{t.resourceHub[item.pricing]}</p>
      <div className="flex flex-col gap-2 mt-auto">
        {/* Row 1: Detail link */}
        {detailHref && (
          <Link href={detailHref} className="flex items-center justify-center gap-1 px-3 py-1.5 text-xs rounded-md border border-border bg-secondary text-secondary-foreground hover:bg-muted transition-colors">
            {t.resourceHub.viewDetail}
          </Link>
        )}
        {/* Row 2: Action button */}
        {(item.type === "mcp" || item.type === "prompt-template") ? (
          <Button size="sm" className="w-full bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20" onClick={() => onLaunch(item)}>
            <Rocket className="h-3.5 w-3.5 mr-1.5" />{t.resourceHub.launchPlayground}
          </Button>
        ) : (
          <Button size="sm" variant="secondary" className="w-full border border-border" onClick={() => onCopy(item)}>
            {copiedId === item.id ? <><Check className="h-3.5 w-3.5 mr-1.5 text-green-500" />{t.resourceHub.copiedSuccess}</> : <><Copy className="h-3.5 w-3.5 mr-1.5" />{t.resourceHub.copyConfig}</>}
          </Button>
        )}
      </div>
    </div>
  );
}

export default function ResourcesPage() {
  const { lang, t, tFormat } = useI18n();
  const { toast } = useToast();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [visibleCounts, setVisibleCounts] = useState<Record<string, number>>({});

  const { data: counts } = useSWR<CountsData>("/api/stats", dashboardSWRConfig);

  const mcpCount = useMemo(() => getResourcesByType("mcp").length, []);
  const totalTools = useMemo(() => RESOURCE_ITEMS.reduce((sum, item) => sum + (item.requiredTools?.length ?? 0), 0), []);

  const searchFilter = useCallback((items: ResourceItem[]) => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(i => {
      const name = lang === "zh" ? i.nameZh : i.name;
      const desc = lang === "zh" ? i.descriptionZh : i.description;
      return name.toLowerCase().includes(q) || desc.toLowerCase().includes(q) || i.tags.some(tag => tag.toLowerCase().includes(q));
    });
  }, [searchQuery, lang]);

  // "全部" tab: show OVERVIEW_PER_TYPE per type
  const overviewSections = useMemo(() => {
    return OVERVIEW_SECTIONS.map(sec => {
      const filtered = searchFilter(getResourcesByType(sec.type));
      return { ...sec, items: filtered.slice(0, OVERVIEW_PER_TYPE), total: filtered.length };
    });
  }, [searchFilter]);

  // Specific tab: filtered + paginated
  const tabFiltered = useMemo(() => {
    if (activeTab === "all") return [];
    return searchFilter(RESOURCE_ITEMS.filter(i => i.type === activeTab));
  }, [activeTab, searchFilter]);

  const currentVisible = visibleCounts[activeTab] ?? DEFAULT_VISIBLE;
  const visibleItems = tabFiltered.slice(0, currentVisible);
  const hasMore = tabFiltered.length > currentVisible;

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return SECTIONS;
    const q = searchQuery.toLowerCase();
    return SECTIONS.filter(s => {
      const label = t.resourceHub[s.i18nKey];
      const descKey = `${s.i18nKey}Desc` as keyof typeof t.resourceHub;
      const desc = t.resourceHub[descKey];
      return label.toLowerCase().includes(q) || desc.toLowerCase().includes(q);
    });
  }, [searchQuery, t]);

  const handleLaunch = (item: ResourceItem) => router.push(`/dashboard/playground?source=hub&type=${item.type}&id=${item.id}`);

  const handleCopy = useCallback(async (item: ResourceItem) => {
    if (!item.clientConfigJson) return;
    try {
      await navigator.clipboard.writeText(item.clientConfigJson);
      setCopiedId(item.id);
      toast(t.resourceHub.copiedSuccess, "success");
      setTimeout(() => setCopiedId(null), 2000);
    } catch { toast(t.resourceHub.mcpCopyFailed, "error"); }
  }, [toast, t]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl glass-card p-8 mb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, var(--foreground) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"><Sparkles className="h-6 w-6 text-primary" /></div>
            <div>
              <h1 className="text-3xl font-bold">{t.resourceHub.title}</h1>
              <p className="text-muted-foreground mt-1">{t.resourceHub.subtitle}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mt-4">
            <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20"><Cloud className="h-3 w-3" />{tFormat(t.resourceHub.heroStatMcp, { count: mcpCount })}</span>
            <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><Wrench className="h-3 w-3" />{tFormat(t.resourceHub.heroStatTools, { count: totalTools })}</span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input placeholder={t.resourceHub.searchPlaceholder} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 pr-9 bg-secondary border-border text-foreground" />
        {searchQuery && <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList variant="line">
          <TabsTrigger value="all">{t.resourceHub.tabAll}</TabsTrigger>
          <TabsTrigger value="mcp">{t.resourceHub.tabMcp}</TabsTrigger>
          <TabsTrigger value="prompt-template">{t.resourceHub.tabPrompt}</TabsTrigger>
          <TabsTrigger value="client-skill">{t.resourceHub.tabClientSkill}</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Content */}
      {activeTab === "all" ? (
        /* ── Overview: 3 per type with section headers ── */
        <div className="space-y-10 mb-12">
          {overviewSections.map(sec => (
            <div key={sec.type}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${sec.type === "mcp" ? "bg-purple-400" : sec.type === "prompt-template" ? "bg-green-400" : "bg-blue-400"}`} />
                  {t.resourceHub[sec.i18nKey]}
                  <span className="text-xs font-normal text-muted-foreground">({sec.total})</span>
                </h2>
                {sec.total > OVERVIEW_PER_TYPE && (
                  <button onClick={() => setActiveTab(sec.tabKey)} className="text-xs text-primary hover:underline flex items-center gap-1">
                    {t.resourceHub.viewMore} <ArrowRight className="h-3 w-3" />
                  </button>
                )}
              </div>
              {sec.items.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6">{t.resourceHub.noResults}</p>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sec.items.map(item => <ResourceCard key={item.id} item={item} copiedId={copiedId} onLaunch={handleLaunch} onCopy={handleCopy} t={t} lang={lang} />)}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* ── Specific tab: paginated grid ── */
        <>
          {tabFiltered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground"><p className="text-sm">{t.resourceHub.noResults}</p></div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {visibleItems.map(item => <ResourceCard key={item.id} item={item} copiedId={copiedId} onLaunch={handleLaunch} onCopy={handleCopy} t={t} lang={lang} />)}
              </div>
              {hasMore && (
                <div className="text-center mb-12">
                  <Button variant="secondary" className="border border-border" onClick={() => setVisibleCounts(prev => ({ ...prev, [activeTab]: (prev[activeTab] ?? DEFAULT_VISIBLE) + DEFAULT_VISIBLE }))}>
                    {t.resourceHub.viewMore} ({tabFiltered.length - currentVisible})
                  </Button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Quick Links */}
      <div className="border-t border-border pt-8">
        <h2 className="text-lg font-semibold mb-4">{t.resourceHub.quickLinks}</h2>
        {filteredSections.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">{t.resourceHub.noResults}</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSections.map((s) => {
              const label = t.resourceHub[s.i18nKey];
              const descKey = `${s.i18nKey}Desc` as keyof typeof t.resourceHub;
              const desc = t.resourceHub[descKey];
              return (
                <Link key={s.href} href={s.href} className="glass-card glass-card-hover p-6 rounded-xl group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><s.icon className="h-5 w-5 text-primary" /></div>
                    <h3 className="font-semibold">{label}</h3>
                    {"countKey" in s && counts && (counts as Record<string, number | undefined>)[s.countKey!] != null && (counts as Record<string, number>)[s.countKey!] > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-mono">{(counts as Record<string, number>)[s.countKey!]}</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{desc}</p>
                  <span className="text-primary text-sm flex items-center gap-1 group-hover:underline">{t.resourceHub.mcpGo} <ArrowRight className="h-3 w-3" /></span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
