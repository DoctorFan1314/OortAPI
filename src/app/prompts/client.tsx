"use client";

import { useState, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Zap, Plus, X } from "lucide-react";
import { skills, getPublishedPrompts } from "@/lib/mock-data";
import { SkillCard } from "@/components/skill/skill-card";
import { categories } from "@/lib/categories";
import { useI18n } from "@/contexts/i18n-context";
import { useFilteredList } from "@/hooks/use-filtered-list";

const CreateFromUploadPrompt = dynamic(() => import("@/components/skills/create-from-upload-prompt").then(m => ({ default: m.CreateFromUploadPrompt })), { ssr: false, loading: () => <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"><div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div> });

const PAGE_SIZE = 12;

export default function PromptsClient() {
  const { t } = useI18n();

  const difficultyOptions = [
    { key: "__all__", label: t.prompts.filterAll },
    { key: "beginner", label: t.prompts.difficultyEasy },
    { key: "intermediate", label: t.prompts.difficultyMedium },
    { key: "advanced", label: t.prompts.difficultyHard },
  ];

  const [showUpload, setShowUpload] = useState(false);
  const [refresh, setRefresh] = useState(0);

  const allPrompts = useMemo(() => [...skills, ...getPublishedPrompts()], [refresh]);

  const handleCreated = useCallback(() => setRefresh((r) => r + 1), []);

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
    items: allPrompts,
    filters: [
      { key: "cat", defaultValue: t.common.all, allValue: t.common.all, label: t.common.categories },
      { key: "diff", defaultValue: "__all__", allValue: "__all__", label: t.prompts.difficulty },
    ],
    defaultSort: "trending",
    validSorts: ["trending", "rating", "newest", "liked"],
    basePath: "/prompts",
    pageSize: PAGE_SIZE,
    filterFn: (item, q, filters) => {
      if (q) {
        const qLower = q.toLowerCase();
        if (
          !item.title.toLowerCase().includes(qLower) &&
          !item.description.toLowerCase().includes(qLower) &&
          !item.tags.some((tag: string) => tag.toLowerCase().includes(qLower))
        ) return false;
      }
      if (filters.cat && filters.cat !== t.common.all) {
        if (item.categorySlug !== filters.cat) return false;
      }
      if (filters.diff && filters.diff !== "__all__") {
        if (item.difficulty !== filters.diff) return false;
      }
      return true;
    },
    sortFn: (a, b, sort) => {
      if (sort === "rating") return b.rating - a.rating;
      if (sort === "newest") return b.lastUpdated.localeCompare(a.lastUpdated);
      if (sort === "liked") return (b.likes || 0) - (a.likes || 0);
      return b.usageCount - a.usageCount;
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Zap className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">{t.prompts.title}</h1>
          </div>
          <p className="text-muted-foreground">{t.prompts.subtitle} · {allPrompts.length}+</p>
        </div>
        <Button
          onClick={() => setShowUpload(true)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          {t.create.newPrompt}
        </Button>
      </div>

      <div className="space-y-4 mb-8">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t.prompts.searchPlaceholder}
            aria-label={t.prompts.searchPlaceholder}
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            className="pl-10 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-3 md:space-y-0 md:flex md:flex-wrap md:gap-4 md:items-center">
          <div className="flex flex-wrap items-center gap-2" role="radiogroup" aria-label={t.common.categories}>
            <span className="text-sm text-muted-foreground">{t.common.categories}:</span>
            <button role="radio" aria-checked={filterValues.cat === t.common.all} onClick={() => setFilter("cat", t.common.all)} className={`px-3 py-1 text-sm rounded-md transition-colors ${filterValues.cat === t.common.all ? "bg-primary/10 text-primary border border-primary/30" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
              {t.common.all}
            </button>
            {categories.map((c) => (
              <button key={c.slug} role="radio" aria-checked={filterValues.cat === c.slug} onClick={() => setFilter("cat", c.slug)} className={`px-3 py-1 text-sm rounded-md transition-colors ${filterValues.cat === c.slug ? "bg-primary/10 text-primary border border-primary/30" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
                {c.icon} {c.name}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2" role="radiogroup" aria-label={t.prompts.difficulty}>
            <span className="text-sm text-muted-foreground">{t.prompts.difficulty}:</span>
            {difficultyOptions.map((d) => (
              <button key={d.key} role="radio" aria-checked={filterValues.diff === d.key} onClick={() => setFilter("diff", d.key)} className={`px-3 py-1 text-sm rounded-md transition-colors ${filterValues.diff === d.key ? "bg-primary/10 text-primary border border-primary/30" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
                {d.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2 md:ml-auto" role="radiogroup" aria-label={t.prompts.sortBy}>
            <span className="text-sm text-muted-foreground">{t.prompts.sortBy}：</span>
            {([{ key: "trending" as const, label: t.prompts.sortPopular }, { key: "rating" as const, label: t.prompts.sortRating }, { key: "newest" as const, label: t.prompts.sortNewest }, { key: "liked" as const, label: t.prompts.sortMostLiked }]).map((s) => (
              <button key={s.key} role="radio" aria-checked={sortBy === s.key} onClick={() => setSortBy(s.key)} className={`px-3 py-1 text-sm rounded-md transition-colors ${sortBy === s.key ? "bg-primary/10 text-primary border border-primary/30" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
                {s.label}
              </button>
            ))}
          </div>
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
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <Search className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
          <p className="text-muted-foreground text-lg mb-1">{t.prompts.emptySearch}</p>
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
              <SkillCard key={skill.id} skill={skill} />
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

      {/* Modal */}
      <CreateFromUploadPrompt open={showUpload} onClose={() => setShowUpload(false)} onCreated={handleCreated} />
    </div>
  );
}
