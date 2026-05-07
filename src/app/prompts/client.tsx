"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search, Zap, Plus } from "lucide-react";
import { skills, getPublishedPrompts } from "@/lib/mock-data";
import { SkillCard } from "@/components/skill/skill-card";
import { categories } from "@/lib/categories";
import { useI18n } from "@/contexts/i18n-context";

const CreateFromUploadPrompt = dynamic(() => import("@/components/skills/create-from-upload-prompt").then(m => ({ default: m.CreateFromUploadPrompt })), { ssr: false });

const PAGE_SIZE = 12;

export default function PromptsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useI18n();

  const difficultyOptions = [
    { key: "__all__", label: t.prompts.filterAll },
    { key: "新手友好", label: t.prompts.difficultyEasy },
    { key: "进阶", label: t.prompts.difficultyMedium },
    { key: "高级", label: t.prompts.difficultyHard },
  ];

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState(searchParams.get("cat") || t.common.all);
  const [difficulty, setDifficulty] = useState(searchParams.get("diff") || "__all__");
  const [sortBy, setSortBy] = useState<"trending" | "rating" | "newest">(
    (["trending", "rating", "newest"].includes(searchParams.get("sort") || "")
      ? searchParams.get("sort")
      : "trending") as "trending" | "rating" | "newest",
  );
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [showUpload, setShowUpload] = useState(false);
  const [refresh, setRefresh] = useState(0);

  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const allPrompts = useMemo(() => [...skills, ...getPublishedPrompts()], [refresh]);

  const updateURL = useCallback(
    (overrides: Record<string, string>) => {
      const params = new URLSearchParams();
      const q = overrides.q ?? query;
      const cat = overrides.cat ?? category;
      const diff = overrides.diff ?? difficulty;
      const sort = overrides.sort ?? sortBy;

      if (q) params.set("q", q);
      if (cat && cat !== t.common.all) params.set("cat", cat);
      if (diff && diff !== "__all__") params.set("diff", diff);
      if (sort && sort !== "trending") params.set("sort", sort);

      const url = params.toString() ? `/prompts?${params.toString()}` : "/prompts";
      router.replace(url, { scroll: false });
    },
    [query, category, difficulty, sortBy, router, t.common.all],
  );

  const handleQueryChange = useCallback(
    (val: string) => {
      setQuery(val);
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => updateURL({ q: val }), 300);
    },
    [updateURL],
  );

  useEffect(() => () => clearTimeout(debounceRef.current), []);
  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [category, difficulty, sortBy]);

  const handleCreated = useCallback(() => setRefresh((r) => r + 1), []);

  const filtered = useMemo(() => {
    let result = [...allPrompts];
    if (query) {
      const q = query.toLowerCase();
      result = result.filter(
        (s) => s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q) || s.tags.some((tag) => tag.toLowerCase().includes(q)),
      );
    }
    if (category !== t.common.all) result = result.filter((s) => s.categorySlug === category);
    if (difficulty !== "__all__") result = result.filter((s) => s.difficulty === difficulty);
    if (sortBy === "rating") result.sort((a, b) => b.rating - a.rating);
    else if (sortBy === "newest") result.sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated));
    else result.sort((a, b) => b.usageCount - a.usageCount);
    return result;
  }, [allPrompts, query, category, difficulty, sortBy, t.common.all]);

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
        <button
          onClick={() => setShowUpload(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors"
        >
          <Plus className="h-4 w-4" />
          {t.create.newPrompt}
        </button>
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
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">{t.common.categories}：</span>
            <button role="radio" aria-checked={category === t.common.all} onClick={() => { setCategory(t.common.all); updateURL({ cat: t.common.all }); }} className={`px-3 py-1 text-sm rounded-md transition-colors ${category === t.common.all ? "bg-primary/10 text-primary border border-primary/30" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
              {t.common.all}
            </button>
            {categories.map((c) => (
              <button key={c.slug} role="radio" aria-checked={category === c.slug} onClick={() => { setCategory(c.slug); updateURL({ cat: c.slug }); }} className={`px-3 py-1 text-sm rounded-md transition-colors ${category === c.slug ? "bg-primary/10 text-primary border border-primary/30" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
                {c.icon} {c.name}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">{t.prompts.difficulty}：</span>
            {difficultyOptions.map((d) => (
              <button key={d.key} role="radio" aria-checked={difficulty === d.key} onClick={() => { setDifficulty(d.key); updateURL({ diff: d.key }); }} className={`px-3 py-1 text-sm rounded-md transition-colors ${difficulty === d.key ? "bg-primary/10 text-primary border border-primary/30" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
                {d.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2 md:ml-auto">
            <span className="text-sm text-muted-foreground">{t.prompts.sortBy}：</span>
            {([{ key: "trending" as const, label: t.prompts.sortPopular }, { key: "rating" as const, label: t.prompts.sortRating }, { key: "newest" as const, label: t.prompts.sortNewest }]).map((s) => (
              <button key={s.key} role="radio" aria-checked={sortBy === s.key} onClick={() => { setSortBy(s.key); updateURL({ sort: s.key }); }} className={`px-3 py-1 text-sm rounded-md transition-colors ${sortBy === s.key ? "bg-primary/10 text-primary border border-primary/30" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg mb-2">{t.prompts.emptySearch}</p>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.slice(0, visibleCount).map((skill) => (
              <SkillCard key={skill.id} skill={skill} />
            ))}
          </div>
          {filtered.length > visibleCount && (
            <div className="text-center mt-10">
              <button
                onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
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
