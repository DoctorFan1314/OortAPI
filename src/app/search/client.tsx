"use client";

import { useState, useEffect, useRef, useCallback, useMemo, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search,
  X,
  Zap,
  FileText,
  Tag,
  Clock,
  Trash2,
  ArrowRight,
  SearchX,
} from "lucide-react";
import { agentSkills, getPublishedSkills } from "@/lib/mock-agent-skills";
import { skills, getPublishedPrompts } from "@/lib/mock-data";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { AgentSkillCard } from "@/components/agent-skill/agent-skill-card";
import { SkillCard } from "@/components/skill/skill-card";
import { useI18n } from "@/contexts/i18n-context";
import { formatNumber } from "@/lib/utils";

interface Suggestion {
  type: "skill" | "prompt" | "tag";
  label: string;
  href: string;
}

function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.recentSearches);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRecentSearches(searches: string[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.recentSearches, JSON.stringify(searches));
  } catch {
    /* ignore */
  }
}

function addRecentSearch(query: string): string[] | undefined {
  const trimmed = query.trim();
  if (!trimmed) return;
  const existing = getRecentSearches().filter((s) => s !== trimmed);
  const updated = [trimmed, ...existing].slice(0, 8);
  saveRecentSearches(updated);
  return updated;
}

function removeRecentSearch(query: string): string[] {
  const updated = getRecentSearches().filter((s) => s !== query);
  saveRecentSearches(updated);
  return updated;
}

export default function SearchClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useI18n();

  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [inputFocused, setInputFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [highlightIdx, setHighlightIdx] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Load recent searches on mount
  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  // All data
  const allAgentSkills = useMemo(
    () => [...agentSkills, ...getPublishedSkills()],
    [],
  );
  const allPrompts = useMemo(
    () => [...skills, ...getPublishedPrompts()],
    [],
  );

  // Search results
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { agentSkills: [], prompts: [] };

    const matchedAgentSkills = allAgentSkills.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.tags.some((tag) => tag.toLowerCase().includes(q)) ||
        s.triggers.some((tr) => tr.toLowerCase().includes(q)) ||
        s.category.toLowerCase().includes(q),
    );

    const matchedPrompts = allPrompts.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.subtitle.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.tags.some((tag) => tag.toLowerCase().includes(q)) ||
        s.category.toLowerCase().includes(q),
    );

    return { agentSkills: matchedAgentSkills, prompts: matchedPrompts };
  }, [query, allAgentSkills, allPrompts]);

  const totalResults =
    searchResults.agentSkills.length + searchResults.prompts.length;

  // Generate suggestions from data (debounced)
  const generateSuggestions = useCallback(
    (q: string) => {
      if (!q.trim()) {
        setSuggestions([]);
        return;
      }
      const lower = q.toLowerCase();
      const result: Suggestion[] = [];

      // Skill name matches
      for (const s of allAgentSkills) {
        if (s.name.toLowerCase().includes(lower) || s.title.toLowerCase().includes(lower)) {
          result.push({
            type: "skill",
            label: s.name,
            href: `/skills/${s.id}`,
          });
        }
        if (result.length >= 6) break;
      }

      // Prompt title matches
      if (result.length < 6) {
        for (const s of allPrompts) {
          if (s.title.toLowerCase().includes(lower)) {
            result.push({
              type: "prompt",
              label: s.title,
              href: `/prompts/${s.id}`,
            });
          }
          if (result.length >= 6) break;
        }
      }

      // Tag matches
      if (result.length < 6) {
        const allTags = new Set<string>();
        allAgentSkills.forEach((s) => s.tags.forEach((t) => allTags.add(t)));
        allPrompts.forEach((s) => s.tags.forEach((t) => allTags.add(t)));

        for (const tag of allTags) {
          if (tag.toLowerCase().includes(lower)) {
            result.push({
              type: "tag",
              label: tag,
              href: `/tags/${encodeURIComponent(tag)}`,
            });
          }
          if (result.length >= 6) break;
        }
      }

      setSuggestions(result.slice(0, 6));
    },
    [allAgentSkills, allPrompts],
  );

  // Debounced input change
  const handleInputChange = useCallback(
    (value: string) => {
      setQuery(value);
      setHighlightIdx(-1);

      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        generateSuggestions(value);
      }, 300);

      // Update URL
      const params = new URLSearchParams();
      if (value.trim()) params.set("q", value.trim());
      const url = params.toString() ? `/search?${params}` : "/search";
      router.replace(url, { scroll: false });
    },
    [generateSuggestions, router],
  );

  // On initial load, sync query from URL and generate suggestions
  useEffect(() => {
    if (initialQuery) {
      generateSuggestions(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => () => clearTimeout(debounceRef.current), []);

  // Handle search submit (Enter)
  const handleSearch = useCallback(() => {
    const q = query.trim();
    if (!q) return;
    const updated = addRecentSearch(q);
    if (updated) setRecentSearches(updated);
    setSuggestions([]);
    inputRef.current?.blur();
  }, [query]);

  // Keyboard navigation for suggestions
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const showSugg = inputFocused && query.trim() && suggestions.length > 0;

      if (e.key === "ArrowDown") {
        if (showSugg) {
          e.preventDefault();
          setHighlightIdx((prev) => Math.min(prev + 1, suggestions.length - 1));
        }
      } else if (e.key === "ArrowUp") {
        if (showSugg) {
          e.preventDefault();
          setHighlightIdx((prev) => Math.max(prev - 1, -1));
        }
      } else if (e.key === "Enter") {
        if (showSugg && highlightIdx >= 0 && suggestions[highlightIdx]) {
          e.preventDefault();
          const s = suggestions[highlightIdx];
          const updated = addRecentSearch(query);
          if (updated) setRecentSearches(updated);
          setSuggestions([]);
          setInputFocused(false);
          router.push(s.href);
        } else {
          handleSearch();
        }
      } else if (e.key === "Escape") {
        setSuggestions([]);
        setInputFocused(false);
        inputRef.current?.blur();
      }
    },
    [inputFocused, query, suggestions, highlightIdx, handleSearch, router],
  );

  // Click a suggestion
  const handleSuggestionClick = useCallback(
    (suggestion: Suggestion) => {
      const updated = addRecentSearch(query || suggestion.label);
      if (updated) setRecentSearches(updated);
      setSuggestions([]);
      setInputFocused(false);
      router.push(suggestion.href);
    },
    [query, router],
  );

  // Click a recent search
  const handleRecentClick = useCallback(
    (term: string) => {
      setQuery(term);
      const updated = addRecentSearch(term);
      if (updated) setRecentSearches(updated);
      setInputFocused(false);
      router.push(`/search?q=${encodeURIComponent(term)}`, { scroll: false });
      generateSuggestions(term);
    },
    [router, generateSuggestions],
  );

  // Remove a single recent search
  const handleRemoveRecent = useCallback((term: string) => {
    const updated = removeRecentSearch(term);
    setRecentSearches(updated);
  }, []);

  // Clear all recent searches
  const handleClearAllRecent = useCallback(() => {
    saveRecentSearches([]);
    setRecentSearches([]);
  }, []);

  const showDropdown = inputFocused && (suggestions.length > 0 || (!query.trim() && recentSearches.length > 0));
  const activeDescendant =
    highlightIdx >= 0 ? `search-suggestion-${highlightIdx}` : undefined;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Search className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">{t.search.title}</h1>
        </div>
        <p className="text-muted-foreground">{t.search.subtitle}</p>
      </div>

      {/* Search Input */}
      <div className="relative max-w-2xl mb-10">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => setInputFocused(true)}
            onBlur={() => {
              // Delay to allow click on dropdown items
              setTimeout(() => setInputFocused(false), 200);
            }}
            onKeyDown={handleKeyDown}
            placeholder={t.search.placeholder}
            aria-label={t.search.placeholder}
            role="combobox"
            aria-expanded={showDropdown}
            aria-controls="search-listbox"
            aria-activedescendant={activeDescendant}
            aria-autocomplete="list"
            className="w-full h-14 pl-12 pr-12 text-base bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
          />
          {query && (
            <button
              onClick={() => {
                handleInputChange("");
                inputRef.current?.focus();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={t.common.closeSearch}
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Dropdown: suggestions or recent searches */}
        {showDropdown && (
          <div
            id="search-listbox"
            role="listbox"
            aria-label={
              query.trim() ? t.search.suggestions : t.search.recentSearches
            }
            className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50 animate-[fadeIn_0.1s_ease-out]"
          >
            {/* Recent searches (when input is empty and focused) */}
            {!query.trim() && recentSearches.length > 0 && (
              <div>
                <div className="flex items-center justify-between px-4 pt-3 pb-1">
                  <span className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wider">
                    {t.search.recentSearches}
                  </span>
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleClearAllRecent();
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="h-3 w-3" />
                    {t.search.clearRecent}
                  </button>
                </div>
                <div className="px-2 pb-2">
                  {recentSearches.map((term) => (
                    <div
                      key={term}
                      role="option"
                      className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-secondary transition-colors group cursor-pointer"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleRecentClick(term);
                      }}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Clock className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                        <span className="text-sm text-foreground truncate">
                          {term}
                        </span>
                      </div>
                      <button
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleRemoveRecent(term);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-all p-1"
                        aria-label={`${t.search.removeRecent} ${term}`}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Autocomplete suggestions */}
            {query.trim() && suggestions.length > 0 && (
              <div className="px-2 py-2">
                {suggestions.map((suggestion, idx) => (
                  <div
                    key={`${suggestion.type}-${suggestion.label}`}
                    id={`search-suggestion-${idx}`}
                    role="option"
                    aria-selected={idx === highlightIdx}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                      idx === highlightIdx
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-secondary"
                    }`}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSuggestionClick(suggestion);
                    }}
                    onMouseEnter={() => setHighlightIdx(idx)}
                  >
                    {suggestion.type === "skill" && (
                      <Zap className="h-4 w-4 text-primary shrink-0" />
                    )}
                    {suggestion.type === "prompt" && (
                      <FileText className="h-4 w-4 text-blue-400 shrink-0" />
                    )}
                    {suggestion.type === "tag" && (
                      <Tag className="h-4 w-4 text-green-400 shrink-0" />
                    )}
                    <span className="text-sm truncate">{suggestion.label}</span>
                    {idx === highlightIdx && (
                      <ArrowRight className="h-3.5 w-3.5 shrink-0 ml-auto" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      {query.trim() ? (
        totalResults > 0 ? (
          <div className="space-y-12">
            {/* Agent Skills Section */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  {t.search.agentSkills}
                  <span className="text-sm font-normal text-muted-foreground">
                    ({formatNumber(searchResults.agentSkills.length)})
                  </span>
                </h2>
                {searchResults.agentSkills.length > 0 && (
                  <Link
                    href={`/skills?q=${encodeURIComponent(query.trim())}`}
                    className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                  >
                    {t.search.viewAllSkills}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
              {searchResults.agentSkills.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {searchResults.agentSkills.slice(0, 8).map((skill) => (
                    <AgentSkillCard key={skill.id} skill={skill} />
                  ))}
                </div>
              ) : (
                <div className="glass-card p-8 text-center">
                  <p className="text-muted-foreground text-sm">
                    {t.common.noResults}
                  </p>
                </div>
              )}
            </section>

            {/* Prompt Templates Section */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-400" />
                  {t.search.promptTemplates}
                  <span className="text-sm font-normal text-muted-foreground">
                    ({formatNumber(searchResults.prompts.length)})
                  </span>
                </h2>
                {searchResults.prompts.length > 0 && (
                  <Link
                    href={`/prompts?q=${encodeURIComponent(query.trim())}`}
                    className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                  >
                    {t.search.viewAllPrompts}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
              {searchResults.prompts.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {searchResults.prompts.slice(0, 8).map((skill) => (
                    <SkillCard key={skill.id} skill={skill} />
                  ))}
                </div>
              ) : (
                <div className="glass-card p-8 text-center">
                  <p className="text-muted-foreground text-sm">
                    {t.common.noResults}
                  </p>
                </div>
              )}
            </section>
          </div>
        ) : (
          /* Empty state with illustration */
          <div className="text-center py-20">
            <div className="mx-auto w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-6">
              <SearchX className="h-10 w-10 text-muted-foreground/40" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {t.search.noResults}
            </h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto mb-8">
              {t.search.noResultsDesc}
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                href="/skills"
                className="px-5 py-2.5 text-sm rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary hover:border-primary/30 transition-colors"
              >
                {t.common.skills}
              </Link>
              <Link
                href="/prompts"
                className="px-5 py-2.5 text-sm rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary hover:border-primary/30 transition-colors"
              >
                {t.common.prompts}
              </Link>
            </div>
          </div>
        )
      ) : (
        /* No query state - show recent searches as tags if any */
        <div className="text-center py-16">
          {recentSearches.length > 0 ? (
            <div className="max-w-xl mx-auto text-left">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  {t.search.recentSearches}
                </h2>
                <button
                  onClick={handleClearAllRecent}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {t.search.clearRecent}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term) => (
                  <div
                    key={term}
                    className="glass-card flex items-center gap-2 px-4 py-2.5 rounded-lg cursor-pointer hover:border-primary/30 transition-colors group"
                    onClick={() => handleRecentClick(term)}
                  >
                    <Clock className="h-3.5 w-3.5 text-muted-foreground/50" />
                    <span className="text-sm text-foreground">{term}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveRecent(term);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-all ml-1"
                      aria-label={`${t.search.removeRecent} ${term}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              <Search className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">
                {t.search.placeholder}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
