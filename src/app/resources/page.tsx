"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Puzzle, BookOpen, Server, LayoutGrid, TrendingUp, Tags, ArrowRight, Search, X, Cloud, Rocket, Copy, Sparkles, Wrench, Check } from "lucide-react";
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

// ── Quick-link sections — all use i18n keys ──
const SECTIONS = [
  { href: "/skills", icon: Puzzle, i18nKey: "sectionSkills" as const, countKey: "skills" as const },
  { href: "/prompts", icon: BookOpen, i18nKey: "sectionPrompts" as const, countKey: "prompts" as const },
  { href: "/resources/mcp", icon: Server, i18nKey: "mcpEcosystem" as const },
  { href: "/categories", icon: LayoutGrid, i18nKey: "sectionCategories" as const },
  { href: "/trending", icon: TrendingUp, i18nKey: "sectionTrending" as const },
  { href: "/tags", icon: Tags, i18nKey: "sectionTags" as const },
];

// ── Badge color maps ──
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

export default function ResourcesPage() {
  const { lang, t, tFormat } = useI18n();
  const { toast } = useToast();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data: counts } = useSWR<CountsData>("/api/stats", dashboardSWRConfig);

  // ── Compute stats ──
  const mcpCount = useMemo(() => getResourcesByType("mcp").length, []);
  const totalTools = useMemo(() =>
    RESOURCE_ITEMS.reduce((sum, item) => sum + (item.requiredTools?.length ?? 0), 0), []);

  // ── Filtered resources ──
  const filtered = useMemo(() => {
    let items = RESOURCE_ITEMS;
    if (activeTab !== "all") items = items.filter(i => i.type === activeTab);
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(i => {
      const name = lang === "zh" ? i.nameZh : i.name;
      const desc = lang === "zh" ? i.descriptionZh : i.description;
      return name.toLowerCase().includes(q) || desc.toLowerCase().includes(q) || i.tags.some(tag => tag.toLowerCase().includes(q));
    });
  }, [searchQuery, lang, activeTab]);

  // ── Quick links filter ──
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return SECTIONS;
    const q = searchQuery.toLowerCase();
    return SECTIONS.filter(s => {
      const label = t.resourceHub[s.i18nKey];
      const descKey = `${s.i18nKey}Desc` as keyof typeof t.resourceHub;
      const desc = t.resourceHub[descKey];
      return label.toLowerCase().includes(q) || desc.toLowerCase().includes(q);
    });
  }, [searchQuery, lang, t]);

  const handleLaunch = (item: ResourceItem) => {
    router.push(`/dashboard/playground?source=hub&type=${item.type}&id=${item.id}`);
  };

  const handleCopy = useCallback(async (item: ResourceItem) => {
    if (!item.clientConfigJson) return;
    try {
      await navigator.clipboard.writeText(item.clientConfigJson);
      setCopiedId(item.id);
      toast(t.resourceHub.copiedSuccess, "success");
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast("Copy failed", "error");
    }
  }, [toast, t]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* ── Hero Banner ── */}
      <div className="relative overflow-hidden rounded-2xl glass-card p-8 mb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, var(--foreground) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{t.resourceHub.title}</h1>
              <p className="text-muted-foreground mt-1">{t.resourceHub.subtitle}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mt-4">
            <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Cloud className="h-3 w-3" />
              {tFormat(t.resourceHub.heroStatMcp, { count: mcpCount })}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Wrench className="h-3 w-3" />
              {tFormat(t.resourceHub.heroStatTools, { count: totalTools })}
            </span>
          </div>
        </div>
      </div>

      {/* ── Search ── */}
      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder={t.resourceHub.searchPlaceholder}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="pl-10 pr-9 bg-secondary border-border text-foreground"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* ── Tab Navigation (controlled) ── */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList variant="line">
          <TabsTrigger value="all">{t.resourceHub.tabAll}</TabsTrigger>
          <TabsTrigger value="mcp">{t.resourceHub.tabMcp}</TabsTrigger>
          <TabsTrigger value="client-skill">{t.resourceHub.tabClientSkill}</TabsTrigger>
          <TabsTrigger value="prompt-template">{t.resourceHub.tabPrompt}</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* ── Resource Cards ── */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-sm">{t.resourceHub.noResults}</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {filtered.map((item) => (
            <div key={item.id} className="glass-card glass-card-hover p-5 h-full group flex flex-col relative">
              {/* Type badge */}
              <div className="flex items-center gap-2 mb-3">
                <Badge className={`${BADGE_STYLES[item.type]} border text-[10px] font-medium`}>
                  {t.resourceHub[BADGE_I18N[item.type]]}
                </Badge>
                {item.featured && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    ★
                  </span>
                )}
              </div>

              {/* Title + description */}
              <h3 className="text-sm font-semibold mb-1.5 line-clamp-1">
                {lang === "zh" ? item.nameZh : item.name}
              </h3>
              <p className="text-xs text-muted-foreground mb-3 line-clamp-2 flex-1">
                {lang === "zh" ? item.descriptionZh : item.description}
              </p>

              {/* MCP micro-tags (tool names) */}
              {item.type === "mcp" && item.requiredTools && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {item.requiredTools.map(tool => (
                    <span key={tool.function.name} className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono text-muted-foreground">
                      {tool.function.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-3">
                {item.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary text-secondary-foreground border border-border">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Pricing */}
              <p className="text-[10px] text-muted-foreground mb-3">
                {t.resourceHub[item.pricing]}
              </p>

              {/* Action button */}
              <div className="mt-auto">
                {(item.type === "mcp" || item.type === "prompt-template") ? (
                  <Button
                    size="sm"
                    className="w-full bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
                    onClick={() => handleLaunch(item)}
                  >
                    <Rocket className="h-3.5 w-3.5 mr-1.5" />
                    {t.resourceHub.launchPlayground}
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-full border border-border"
                    onClick={() => handleCopy(item)}
                  >
                    {copiedId === item.id ? (
                      <><Check className="h-3.5 w-3.5 mr-1.5 text-green-500" />{t.resourceHub.copiedSuccess}</>
                    ) : (
                      <><Copy className="h-3.5 w-3.5 mr-1.5" />{t.resourceHub.copyConfig}</>
                    )}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Quick Links ── */}
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
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <s.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold">{label}</h3>
                    {"countKey" in s && counts && (counts as Record<string, number | undefined>)[s.countKey!] != null && (counts as Record<string, number>)[s.countKey!] > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-mono">
                        {(counts as Record<string, number>)[s.countKey!]}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{desc}</p>
                  <span className="text-primary text-sm flex items-center gap-1 group-hover:underline">
                    {lang === "zh" ? "前往" : "Go"} <ArrowRight className="h-3 w-3" />
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
