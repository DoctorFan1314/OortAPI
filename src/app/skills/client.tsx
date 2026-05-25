"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Zap, SlidersHorizontal, X, GitCompare } from "lucide-react";
import { agentSkills, getPublishedSkills } from "@/lib/mock-agent-skills";
import { agentSkillCategories } from "@/lib/agent-skill-categories";
import { AgentSkillCard } from "@/components/agent-skill/agent-skill-card";
import { CreateDropdown } from "@/components/skills/create-dropdown";
import { useI18n } from "@/contexts/i18n-context";
import { useFilteredList } from "@/hooks/use-filtered-list";

const CreateFromGithub = dynamic(() => import("@/components/skills/create-from-github").then(m => ({ default: m.CreateFromGithub })), { ssr: false, loading: () => <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"><div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div> });
const CreateFromUpload = dynamic(() => import("@/components/skills/create-from-upload").then(m => ({ default: m.CreateFromUpload })), { ssr: false, loading: () => <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"><div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div> });

const PAGE_SIZE = 12;
const ALL_LICENSES = ["MIT", "Apache-2.0", "ISC", "BSD-3-Clause"];
const ALL_KEY = "__all__";

export default function SkillsClient() {
  const { t } = useI18n();
  const router = useRouter();

  const collections = [t.agentSkills.collectionAll, "Vercel Agent Toolkit", "Anthropic Agent Suite", "Inference.sh Toolkit", t.agentSkills.collectionCommunity, t.agentSkills.collectionDevTools, t.agentSkills.collectionProductivity, t.agentSkills.collectionDataTools];
  const categories = [t.agentSkills.collectionAll, ...agentSkillCategories.map((c) => c.name)];

  const [showFilters, setShowFilters] = useState(false);
  const [showGithub, setShowGithub] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

  const allSkills = useMemo(() => [...agentSkills, ...getPublishedSkills()], [refresh]);

  const handleCreated = useCallback(() => setRefresh((r) => r + 1), []);

  const toggleCompareSelect = useCallback((id: string) => {
    setSelectedForCompare((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  }, []);

  const {
    query,
    handleQueryChange,
    sortBy,
    setSortBy,
    filterValues,
    setFilter,
    filtered,
    visibleList,
    visibleCount,
    loadMore,
    clearFilters,
    activeFilters,
  } = useFilteredList({
    items: allSkills,
    filters: [
      { key: "collection", defaultValue: t.agentSkills.collectionAll, allValue: t.agentSkills.collectionAll, label: t.agentSkills.collection },
      { key: "category", defaultValue: t.agentSkills.collectionAll, allValue: t.agentSkills.collectionAll, label: t.agentSkills.category },
      { key: "license", defaultValue: ALL_KEY, allValue: ALL_KEY, label: t.agentSkills.license },
    ],
    defaultSort: "downloads",
    validSorts: ["downloads", "stars", "newest"],
    basePath: "/skills",
    pageSize: PAGE_SIZE,
    filterFn: (item, q, filters) => {
      if (q.trim()) {
        const queryLower = q.toLowerCase();
        if (
          !item.name.toLowerCase().includes(queryLower) &&
          !item.title.toLowerCase().includes(queryLower) &&
          !item.description.toLowerCase().includes(queryLower) &&
          !item.triggers.some((tr: string) => tr.toLowerCase().includes(queryLower)) &&
          !item.tags.some((tag: string) => tag.toLowerCase().includes(queryLower))
        ) return false;
      }
      if (filters.collection && filters.collection !== t.agentSkills.collectionAll) {
        if (item.collection !== filters.collection) return false;
      }
      if (filters.category && filters.category !== t.agentSkills.collectionAll) {
        if (item.category !== filters.category) return false;
      }
      if (filters.license && filters.license !== ALL_KEY) {
        if (item.license !== filters.license) return false;
      }
      return true;
    },
    sortFn: (a, b, sort) => {
      if (sort === "downloads") return b.downloads - a.downloads;
      if (sort === "stars") return b.stars - a.stars;
      return b.lastUpdated.localeCompare(a.lastUpdated);
    },
  });

  // --- Cross-filter counts (specific to this page) ---
  const getFilteredSkills = useCallback(
    (excludeCollection?: boolean, excludeCategory?: boolean, excludeLicense?: boolean) => {
      let result = query.trim()
        ? allSkills.filter(
            (s) =>
              s.name.toLowerCase().includes(query.toLowerCase()) ||
              s.title.toLowerCase().includes(query.toLowerCase()) ||
              s.description.toLowerCase().includes(query.toLowerCase()) ||
              s.triggers.some((tr) => tr.toLowerCase().includes(query.toLowerCase())) ||
              s.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase())),
          )
        : [...allSkills];

      if (!excludeCollection && filterValues.collection !== t.agentSkills.collectionAll) {
        result = result.filter((s) => s.collection === filterValues.collection);
      }
      if (!excludeCategory && filterValues.category !== t.agentSkills.collectionAll) {
        result = result.filter((s) => s.category === filterValues.category);
      }
      if (!excludeLicense && filterValues.license !== ALL_KEY) {
        result = result.filter((s) => s.license === filterValues.license);
      }
      return result;
    },
    [allSkills, query, filterValues, t.agentSkills.collectionAll],
  );

  const collectionCounts = useMemo(() => {
    const base = getFilteredSkills(true, false, false);
    const counts: Record<string, number> = {};
    for (const c of collections) {
      counts[c] = c === t.agentSkills.collectionAll ? base.length : base.filter((s) => s.collection === c).length;
    }
    return counts;
  }, [getFilteredSkills, collections, t.agentSkills.collectionAll]);

  const categoryCounts = useMemo(() => {
    const base = getFilteredSkills(false, true, false);
    const counts: Record<string, number> = {};
    for (const c of categories) {
      counts[c] = c === t.agentSkills.collectionAll ? base.length : base.filter((s) => s.category === c).length;
    }
    return counts;
  }, [getFilteredSkills, categories, t.agentSkills.collectionAll]);

  const licenseCounts = useMemo(() => {
    const base = getFilteredSkills(false, false, true);
    const counts: Record<string, number> = {};
    counts[ALL_KEY] = base.length;
    for (const lic of ALL_LICENSES) {
      counts[lic] = base.filter((s) => s.license === lic).length;
    }
    return counts;
  }, [getFilteredSkills]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Zap className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">{t.agentSkills.title}</h1>
          </div>
          <p className="text-muted-foreground">{t.agentSkills.subtitle}</p>
        </div>
        <CreateDropdown
          label={t.create.newSkill}
          onSelectGithub={() => setShowGithub(true)}
          onSelectUpload={() => setShowUpload(true)}
        />
      </div>

      {/* Search + Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t.agentSkills.searchPlaceholder}
              aria-label={t.agentSkills.searchPlaceholder}
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              className="pl-10 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="border-border text-muted-foreground hover:text-foreground"
          >
            <SlidersHorizontal className="h-4 w-4 mr-1.5" />
            {t.agentSkills.sortBy}
          </Button>
          <div className="hidden sm:flex items-center gap-1" role="radiogroup" aria-label={t.agentSkills.sortBy}>
            {(["downloads", "stars", "newest"] as const).map((s) => (
              <Button
                key={s}
                role="radio"
                aria-checked={sortBy === s}
                variant={sortBy === s ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setSortBy(s)}
                className={`text-xs ${sortBy === s ? "text-foreground" : "text-muted-foreground"}`}
              >
                {s === "downloads" ? t.agentSkills.sortPopular : s === "stars" ? t.agentSkills.sortRating : t.agentSkills.sortNewest}
              </Button>
            ))}
          </div>
          <Button
            variant={compareMode ? "secondary" : "outline"}
            size="sm"
            onClick={() => { setCompareMode(!compareMode); if (compareMode) setSelectedForCompare([]); }}
            className={`border-border ${compareMode ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            <GitCompare className="h-4 w-4 mr-1.5" />
            {t.compare.toggleCompare}
          </Button>
        </div>

        {/* Active Filters Summary */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium">{t.common.activeFilters}:</span>
            {activeFilters.map((f) => (
              <span
                key={f.key}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full bg-primary/10 text-primary border border-primary/20"
              >
                {f.label}
                <button onClick={f.clear} className="hover:text-primary/70 transition-colors" aria-label={`Remove ${f.key} filter`}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            <button
              onClick={clearFilters}
              className="text-xs text-muted-foreground hover:text-foreground underline transition-colors"
            >
              {t.common.clearFilters}
            </button>
          </div>
        )}

        {showFilters && (
          <div className="space-y-3 p-4 rounded-lg bg-secondary/50 border border-border">
            <div>
              <p className="text-xs text-muted-foreground mb-2 font-medium">{t.agentSkills.collections}</p>
              <div className="flex flex-wrap gap-2">
                {collections.map((c) => (
                  <button
                    key={c}
                    role="radio"
                    aria-checked={filterValues.collection === c}
                    onClick={() => setFilter("collection", c)}
                    className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                      filterValues.collection === c
                        ? "bg-primary/10 text-primary border-primary/30"
                        : "bg-secondary text-muted-foreground border-border hover:border-primary/20"
                    }`}
                  >
                    {c} ({collectionCounts[c] ?? 0})
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2 font-medium">{t.agentSkills.categories}</p>
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => (
                  <button
                    key={c}
                    role="radio"
                    aria-checked={filterValues.category === c}
                    onClick={() => setFilter("category", c)}
                    className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                      filterValues.category === c
                        ? "bg-primary/10 text-primary border-primary/30"
                        : "bg-secondary text-muted-foreground border-border hover:border-primary/20"
                    }`}
                  >
                    {c} ({categoryCounts[c] ?? 0})
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2 font-medium">{t.agentSkills.license}</p>
              <div className="flex flex-wrap gap-2">
                {[ALL_KEY, ...ALL_LICENSES].map((lic) => (
                  <button
                    key={lic}
                    role="radio"
                    aria-checked={filterValues.license === lic}
                    onClick={() => setFilter("license", lic)}
                    className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                      filterValues.license === lic
                        ? "bg-primary/10 text-primary border-primary/30"
                        : "bg-secondary text-muted-foreground border-border hover:border-primary/20"
                    }`}
                  >
                    {lic === ALL_KEY ? t.agentSkills.collectionAll : lic} ({licenseCounts[lic] ?? 0})
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateFromGithub open={showGithub} onClose={() => setShowGithub(false)} onCreated={handleCreated} />
      <CreateFromUpload open={showUpload} onClose={() => setShowUpload(false)} onCreated={handleCreated} />

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <Search className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
          <p className="text-muted-foreground text-lg mb-1">{t.common.noResults}</p>
          <p className="text-muted-foreground text-sm mb-6">{t.common.tryDifferent}</p>
          <button
            onClick={clearFilters}
            className="px-5 py-2 text-sm rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary hover:border-primary/30 transition-colors"
          >
            {t.common.clearFilters}
          </button>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {visibleList.map((skill) => (
              <AgentSkillCard
                key={skill.id}
                skill={skill}
                compareMode={compareMode}
                selected={selectedForCompare.includes(skill.id)}
                onToggleSelect={toggleCompareSelect}
              />
            ))}
          </div>
          {filtered.length > visibleCount && (
            <div className="text-center mt-10">
              <button
                onClick={loadMore}
                className="px-6 py-2.5 text-sm rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary hover:border-primary/30 transition-colors"
              >
                {t.common.more} ({filtered.length - visibleCount})
              </button>
            </div>
          )}
        </>
      )}

      {/* Floating Compare Button */}
      {compareMode && selectedForCompare.length === 2 && (
        <button
          onClick={() => router.push(`/skills/compare?ids=${selectedForCompare[0]},${selectedForCompare[1]}`)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-full bg-primary text-primary-foreground font-medium text-sm shadow-lg hover:bg-primary/90 transition-colors"
        >
          <GitCompare className="h-4 w-4" />
          {t.compare.compareCount.replace("{count}", "2")}
        </button>
      )}
    </div>
  );
}
