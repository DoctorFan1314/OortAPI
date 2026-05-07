"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Zap, SlidersHorizontal } from "lucide-react";
import { agentSkills, getPublishedSkills } from "@/lib/mock-agent-skills";
import { agentSkillCategories } from "@/lib/agent-skill-categories";
import { AgentSkillCard } from "@/components/agent-skill/agent-skill-card";
import { CreateDropdown } from "@/components/skills/create-dropdown";
import { useI18n } from "@/contexts/i18n-context";

const CreateFromGithub = dynamic(() => import("@/components/skills/create-from-github").then(m => ({ default: m.CreateFromGithub })), { ssr: false });
const CreateFromUpload = dynamic(() => import("@/components/skills/create-from-upload").then(m => ({ default: m.CreateFromUpload })), { ssr: false });

const PAGE_SIZE = 12;

export default function SkillsClient() {
  const { t } = useI18n();
  const collections = [t.agentSkills.collectionAll, "Vercel Agent Toolkit", "Anthropic Agent Suite", "Inference.sh Toolkit", t.agentSkills.collectionCommunity, t.agentSkills.collectionDevTools, t.agentSkills.collectionProductivity, t.agentSkills.collectionDataTools];
  const categories = [t.agentSkills.collectionAll, ...agentSkillCategories.map((c) => c.name)];
  const searchParams = useSearchParams();
  const urlCategory = searchParams.get("category");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<"downloads" | "stars" | "newest">("downloads");
  const [selectedCollection, setSelectedCollection] = useState(t.agentSkills.collectionAll);
  const [selectedCategory, setSelectedCategory] = useState(
    urlCategory && categories.includes(urlCategory) ? urlCategory : t.agentSkills.collectionAll
  );
  const [showFilters, setShowFilters] = useState(false);
  const [showGithub, setShowGithub] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const allSkills = useMemo(() => [...agentSkills, ...getPublishedSkills()], [refresh]);

  const handleCreated = useCallback(() => setRefresh((r) => r + 1), []);

  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [selectedCollection, selectedCategory, sortBy]);

  let filtered = query.trim()
    ? allSkills.filter(
        (s) =>
          s.name.toLowerCase().includes(query.toLowerCase()) ||
          s.title.toLowerCase().includes(query.toLowerCase()) ||
          s.description.toLowerCase().includes(query.toLowerCase()) ||
          s.triggers.some((tr) => tr.toLowerCase().includes(query.toLowerCase())) ||
          s.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()))
      )
    : [...allSkills];

  if (selectedCollection !== t.agentSkills.collectionAll) {
    filtered = filtered.filter((s) => s.collection === selectedCollection);
  }
  if (selectedCategory !== t.agentSkills.collectionAll) {
    filtered = filtered.filter((s) => s.category === selectedCategory);
  }

  filtered.sort((a, b) => {
    if (sortBy === "downloads") return b.downloads - a.downloads;
    if (sortBy === "stars") return b.stars - a.stars;
    return b.lastUpdated.localeCompare(a.lastUpdated);
  });

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
              value={query}
              onChange={(e) => setQuery(e.target.value)}
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
          <div className="hidden sm:flex items-center gap-1">
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
        </div>

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
                    onClick={() => setSelectedCollection(c)}
                    className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                      selectedCollection === c
                        ? "bg-primary/10 text-primary border-primary/30"
                        : "bg-secondary text-muted-foreground border-border hover:border-primary/20"
                    }`}
                  >
                    {c}
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
                    onClick={() => setSelectedCategory(c)}
                    className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                      selectedCategory === c
                        ? "bg-primary/10 text-primary border-primary/30"
                        : "bg-secondary text-muted-foreground border-border hover:border-primary/20"
                    }`}
                  >
                    {c}
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
          <p className="text-muted-foreground text-lg mb-2">{t.agentSkills.emptySearch}</p>
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
                {t.common.more}（{filtered.length - visibleCount}）
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
