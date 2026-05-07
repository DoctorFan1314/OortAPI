"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Zap, SlidersHorizontal, X } from "lucide-react";
import { agentSkills, getPublishedSkills } from "@/lib/mock-agent-skills";
import { agentSkillCategories } from "@/lib/agent-skill-categories";
import { AgentSkillCard } from "@/components/agent-skill/agent-skill-card";
import { CreateDropdown } from "@/components/skills/create-dropdown";
import { useI18n } from "@/contexts/i18n-context";

const CreateFromGithub = dynamic(() => import("@/components/skills/create-from-github").then(m => ({ default: m.CreateFromGithub })), { ssr: false, loading: () => <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"><div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div> });
const CreateFromUpload = dynamic(() => import("@/components/skills/create-from-upload").then(m => ({ default: m.CreateFromUpload })), { ssr: false, loading: () => <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"><div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div> });

const PAGE_SIZE = 12;
const ALL_LICENSES = ["MIT", "Apache-2.0", "ISC", "BSD-3-Clause"];
const ALL_KEY = "__all__";

export default function SkillsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useI18n();

  const collections = [t.agentSkills.collectionAll, "Vercel Agent Toolkit", "Anthropic Agent Suite", "Inference.sh Toolkit", t.agentSkills.collectionCommunity, t.agentSkills.collectionDevTools, t.agentSkills.collectionProductivity, t.agentSkills.collectionDataTools];
  const categories = [t.agentSkills.collectionAll, ...agentSkillCategories.map((c) => c.name)];

  // --- State initialized from URL params ---
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [sortBy, setSortBy] = useState<"downloads" | "stars" | "newest">(
    (["downloads", "stars", "newest"].includes(searchParams.get("sort") || "")
      ? searchParams.get("sort")
      : "downloads") as "downloads" | "stars" | "newest",
  );
  const [selectedCollection, setSelectedCollection] = useState(
    searchParams.get("collection") || t.agentSkills.collectionAll,
  );
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || t.agentSkills.collectionAll,
  );
  const [selectedLicense, setSelectedLicense] = useState(
    searchParams.get("license") || ALL_KEY,
  );
  const [showFilters, setShowFilters] = useState(false);
  const [showGithub, setShowGithub] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const allSkills = useMemo(() => [...agentSkills, ...getPublishedSkills()], [refresh]);

  const handleCreated = useCallback(() => setRefresh((r) => r + 1), []);

  // --- URL sync ---
  const updateURL = useCallback(
    (overrides: Record<string, string>) => {
      const params = new URLSearchParams();
      const q = overrides.q ?? query;
      const collection = overrides.collection ?? selectedCollection;
      const category = overrides.category ?? selectedCategory;
      const license = overrides.license ?? selectedLicense;
      const sort = overrides.sort ?? sortBy;

      if (q) params.set("q", q);
      if (collection && collection !== t.agentSkills.collectionAll) params.set("collection", collection);
      if (category && category !== t.agentSkills.collectionAll) params.set("category", category);
      if (license && license !== ALL_KEY) params.set("license", license);
      if (sort && sort !== "downloads") params.set("sort", sort);

      const url = params.toString() ? `/skills?${params.toString()}` : "/skills";
      router.replace(url, { scroll: false });
    },
    [query, selectedCollection, selectedCategory, selectedLicense, sortBy, router, t.agentSkills.collectionAll],
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
  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [selectedCollection, selectedCategory, selectedLicense, sortBy]);

  // --- Cross-filter counts ---
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

      if (!excludeCollection && selectedCollection !== t.agentSkills.collectionAll) {
        result = result.filter((s) => s.collection === selectedCollection);
      }
      if (!excludeCategory && selectedCategory !== t.agentSkills.collectionAll) {
        result = result.filter((s) => s.category === selectedCategory);
      }
      if (!excludeLicense && selectedLicense !== ALL_KEY) {
        result = result.filter((s) => s.license === selectedLicense);
      }
      return result;
    },
    [allSkills, query, selectedCollection, selectedCategory, selectedLicense, t.agentSkills.collectionAll],
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

  // --- Main filtered list ---
  const filtered = useMemo(() => {
    const result = getFilteredSkills();
    result.sort((a, b) => {
      if (sortBy === "downloads") return b.downloads - a.downloads;
      if (sortBy === "stars") return b.stars - a.stars;
      return b.lastUpdated.localeCompare(a.lastUpdated);
    });
    return result;
  }, [getFilteredSkills, sortBy]);

  // --- Active filters ---
  const activeFilters = useMemo(() => {
    const list: { key: string; label: string; clear: () => void }[] = [];
    if (selectedCollection !== t.agentSkills.collectionAll) {
      list.push({
        key: "collection",
        label: `${t.agentSkills.collection}: ${selectedCollection}`,
        clear: () => { setSelectedCollection(t.agentSkills.collectionAll); updateURL({ collection: t.agentSkills.collectionAll }); },
      });
    }
    if (selectedCategory !== t.agentSkills.collectionAll) {
      list.push({
        key: "category",
        label: `${t.agentSkills.category}: ${selectedCategory}`,
        clear: () => { setSelectedCategory(t.agentSkills.collectionAll); updateURL({ category: t.agentSkills.collectionAll }); },
      });
    }
    if (selectedLicense !== ALL_KEY) {
      list.push({
        key: "license",
        label: `${t.agentSkills.license}: ${selectedLicense}`,
        clear: () => { setSelectedLicense(ALL_KEY); updateURL({ license: ALL_KEY }); },
      });
    }
    return list;
  }, [selectedCollection, selectedCategory, selectedLicense, t.agentSkills.collectionAll, t.agentSkills.collection, t.agentSkills.category, t.agentSkills.license, updateURL]);

  const clearAllFilters = useCallback(() => {
    setQuery("");
    setSelectedCollection(t.agentSkills.collectionAll);
    setSelectedCategory(t.agentSkills.collectionAll);
    setSelectedLicense(ALL_KEY);
    setSortBy("downloads");
    router.replace("/skills", { scroll: false });
  }, [router, t.agentSkills.collectionAll]);

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-12 lg:px-8">
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
                onClick={() => { setSortBy(s); updateURL({ sort: s }); }}
                className={`text-xs ${sortBy === s ? "text-foreground" : "text-muted-foreground"}`}
              >
                {s === "downloads" ? t.agentSkills.sortPopular : s === "stars" ? t.agentSkills.sortRating : t.agentSkills.sortNewest}
              </Button>
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
              onClick={clearAllFilters}
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
                    aria-checked={selectedCollection === c}
                    onClick={() => { setSelectedCollection(c); updateURL({ collection: c }); }}
                    className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                      selectedCollection === c
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
                    aria-checked={selectedCategory === c}
                    onClick={() => { setSelectedCategory(c); updateURL({ category: c }); }}
                    className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                      selectedCategory === c
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
                    aria-checked={selectedLicense === lic}
                    onClick={() => { setSelectedLicense(lic); updateURL({ license: lic }); }}
                    className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                      selectedLicense === lic
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
            onClick={clearAllFilters}
            className="px-5 py-2 text-sm rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary hover:border-primary/30 transition-colors"
          >
            {t.common.clearFilters}
          </button>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.slice(0, visibleCount).map((skill) => (
              <AgentSkillCard key={skill.id} skill={skill} />
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
    </div>
  );
}
