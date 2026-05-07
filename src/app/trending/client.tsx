"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { skills } from "@/lib/mock-data";
import { agentSkills } from "@/lib/mock-agent-skills";
import { Badge } from "@/components/ui/badge";
import { Star, TrendingUp, Clock, Award, ThumbsUp, Zap, FileText } from "lucide-react";
import { useI18n } from "@/contexts/i18n-context";

type TabKey = "hot" | "new" | "featured" | "liked";
type ContentTab = "all" | "agent" | "prompt";

function getTabs(t: ReturnType<typeof useI18n>["t"]): { key: TabKey; label: string; icon: React.ReactNode }[] {
  return [
    { key: "hot", label: t.trending.hot, icon: <TrendingUp className="h-4 w-4" /> },
    { key: "new", label: t.trending.newest, icon: <Clock className="h-4 w-4" /> },
    { key: "featured", label: t.trending.featured, icon: <Award className="h-4 w-4" /> },
    { key: "liked", label: t.trending.mostLiked, icon: <ThumbsUp className="h-4 w-4" /> },
  ];
}

function getRankColor(rank: number) {
  if (rank === 1) return "from-yellow-500/20 to-yellow-600/5 border-yellow-500/30";
  if (rank === 2) return "from-gray-400/20 to-gray-500/5 border-gray-400/30";
  if (rank === 3) return "from-orange-700/20 to-orange-800/5 border-orange-700/30";
  return "";
}

function getRankBadge(rank: number) {
  if (rank === 1) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
  if (rank === 2) return "bg-gray-400/20 text-gray-300 border-gray-400/30";
  if (rank === 3) return "bg-orange-700/20 text-orange-400 border-orange-700/30";
  return "";
}

const PAGE_SIZE = 15;

interface UnifiedItem {
  id: string;
  title: string;
  subtitle: string;
  rating: number;
  usageCount: number;
  likes: number;
  featured: boolean;
  lastUpdated: string;
  type: "agent" | "prompt";
}

export default function TrendingClient() {
  const { t } = useI18n();
  const [tab, setTab] = useState<TabKey>("hot");
  const [contentTab, setContentTab] = useState<ContentTab>("all");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const TABS = getTabs(t);

  const allItems: UnifiedItem[] = useMemo(() => [
    ...agentSkills.map((s) => ({
      id: s.id, title: s.title || s.name, subtitle: s.description,
      rating: s.stars / 20, usageCount: s.downloads, likes: s.stars,
      featured: s.featured, lastUpdated: s.lastUpdated, type: "agent" as const,
    })),
    ...skills.map((s) => ({
      id: s.id, title: s.title, subtitle: s.subtitle,
      rating: s.rating, usageCount: s.usageCount, likes: s.likes,
      featured: s.featured, lastUpdated: s.lastUpdated, type: "prompt" as const,
    })),
  ], []);

  const filtered = useMemo(() =>
    contentTab === "all" ? allItems : allItems.filter((s) => s.type === contentTab),
    [contentTab, allItems]
  );

  const sorted = useMemo(() => {
    const s = [...filtered].sort((a, b) => {
      if (tab === "hot") return b.usageCount - a.usageCount;
      if (tab === "new") return b.lastUpdated.localeCompare(a.lastUpdated);
      if (tab === "featured") return (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || b.rating - a.rating;
      return b.likes - a.likes;
    });
    return s;
  }, [filtered, tab]);

  const list = useMemo(() =>
    tab === "featured" ? sorted.filter((s) => s.featured) : sorted,
    [tab, sorted]
  );

  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [tab, contentTab]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 lg:px-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-foreground mb-2">{t.trending.title}</h1>
        <p className="text-muted-foreground">{t.trending.subtitle}</p>
      </div>

      {/* Content type filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        {([
          { key: "all" as ContentTab, label: t.agentSkills.filterAll, icon: null },
          { key: "agent" as ContentTab, label: t.home.tabAgent, icon: <Zap className="h-3.5 w-3.5" /> },
          { key: "prompt" as ContentTab, label: t.home.tabPrompt, icon: <FileText className="h-3.5 w-3.5" /> },
        ]).map((ct) => (
          <button
            key={ct.key}
            onClick={() => setContentTab(ct.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
              contentTab === ct.key
                ? "bg-primary/10 text-primary border-primary/30"
                : "bg-secondary text-muted-foreground border-border hover:text-foreground"
            }`}
          >
            {ct.icon}{ct.label}
          </button>
        ))}
      </div>

      {/* Sort tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {TABS.map((tabItem) => (
          <button
            key={tabItem.key}
            onClick={() => setTab(tabItem.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
              tab === tabItem.key
                ? "bg-primary/10 text-primary border-primary/30"
                : "bg-secondary text-muted-foreground border-border hover:text-foreground"
            }`}
          >
            {tabItem.icon}{tabItem.label}
          </button>
        ))}
      </div>

      {/* List */}
      {list.length === 0 ? (
        <div className="text-center py-20">
          <TrendingUp className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
          <p className="text-muted-foreground text-lg mb-1">{t.common.noResults}</p>
          <p className="text-muted-foreground text-sm mb-6">{t.common.tryDifferent}</p>
          <Link
            href="/skills"
            className="inline-block px-5 py-2 text-sm rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary hover:border-primary/30 transition-colors"
          >
            {t.agentSkills.heroCta}
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {list.slice(0, visibleCount).map((item, i) => {
          const rank = i + 1;
          return (
            <Link
              key={`${item.type}-${item.id}`}
              href={item.type === "agent" ? `/skills/${item.id}` : `/prompts/${item.id}`}
              className={`block glass-card p-5 transition-all hover:scale-[1.01] ${rank <= 3 ? `bg-gradient-to-r ${getRankColor(rank)} border` : ""}`}
            >
              <div className="flex items-center gap-4">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${rank <= 3 ? getRankBadge(rank) + " border" : "bg-secondary text-muted-foreground border border-border"}`}>
                  {rank}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-foreground font-semibold truncate">{item.title}</h3>
                    <Badge variant="secondary" className={`text-[10px] ${item.type === "agent" ? "bg-primary/10 text-primary border-primary/20" : "bg-purple-500/10 text-purple-400 border-purple-500/20"}`}>
                      {item.type === "agent" ? t.home.tabAgent : t.home.tabPrompt}
                    </Badge>
                    {rank <= 3 && (
                      <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
                        {rank === 1 ? t.trending.gold : rank === 2 ? t.trending.silver : t.trending.bronze}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{item.subtitle}</p>
                </div>
                <div className="flex-shrink-0 flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />{item.rating.toFixed(1)}</span>
                  <span>{item.usageCount}+</span>
                </div>
              </div>
            </Link>
          );
        })}
          </div>
          {list.length > visibleCount && (
            <div className="text-center mt-10">
              <button
                onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                className="px-6 py-2.5 text-sm rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary hover:border-primary/30 transition-colors"
              >
                {t.common.more} ({list.length - visibleCount})
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
