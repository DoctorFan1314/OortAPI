"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search,
  X,
  Cpu,
  FileText,
  Clock,
  Trash2,
  ArrowRight,
  SearchX,
  BookOpen,
  DollarSign,
  Key,
  Terminal,
} from "lucide-react";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { useI18n } from "@/contexts/i18n-context";

interface Model {
  id: string;
  display_name?: string;
  owned_by?: string;
  pricing?: { input?: number; output?: number };
}

interface DocSection {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  href: string;
  icon: React.ElementType;
}

const DOC_SECTIONS: DocSection[] = [
  { id: "quickstart", title: "快速开始", titleEn: "Quick Start", description: "3 步接入 OortAPI", descriptionEn: "3 steps to get started", href: "/docs#quick-start", icon: BookOpen },
  { id: "sdk", title: "SDK 集成", titleEn: "SDK Integration", description: "OpenAI / Anthropic SDK 接入指南", descriptionEn: "OpenAI / Anthropic SDK guide", href: "/docs#sdk-integration", icon: Terminal },
  { id: "pricing", title: "定价说明", titleEn: "Pricing", description: "四层缓存感知定价", descriptionEn: "Cache-aware pricing tiers", href: "/docs#pricing", icon: DollarSign },
  { id: "auth", title: "认证方式", titleEn: "Authentication", description: "Bearer Token 与 Cookie 认证", descriptionEn: "Bearer token & cookie auth", href: "/docs#authentication", icon: Key },
  { id: "api-reference", title: "API 在线调试", titleEn: "API Reference", description: "Swagger UI 交互式文档", descriptionEn: "Interactive Swagger UI", href: "/docs/api-reference", icon: FileText },
  { id: "errors", title: "错误码", titleEn: "Error Codes", description: "HTTP 状态码说明", descriptionEn: "HTTP status codes", href: "/docs#error-codes", icon: FileText },
];

interface Suggestion {
  type: "model" | "doc";
  label: string;
  href: string;
}

function fuzzyMatch(query: string, text: string): boolean {
  const words = query.trim().split(/\s+/);
  return words.every((word) => text.includes(word));
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
  const { lang, t } = useI18n();

  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [inputFocused, setInputFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const [models, setModels] = useState<Model[]>([]);
  const [modelsLoading, setModelsLoading] = useState(true);

  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const urlDebounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Load models on mount
  useEffect(() => {
    fetch("/api/v1/models")
      .then((res) => res.json())
      .then((d) => {
        setModels(d.data || []);
        setModelsLoading(false);
      })
      .catch(() => setModelsLoading(false));
  }, []);

  // Load recent searches on mount
  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  // Search results
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { models: [], docs: [] };

    const matchedModels = models.filter(
      (m) =>
        fuzzyMatch(q, m.id.toLowerCase()) ||
        fuzzyMatch(q, (m.display_name || "").toLowerCase()) ||
        fuzzyMatch(q, (m.owned_by || "").toLowerCase()),
    );

    const matchedDocs = DOC_SECTIONS.filter(
      (d) =>
        fuzzyMatch(q, d.title.toLowerCase()) ||
        fuzzyMatch(q, d.titleEn.toLowerCase()) ||
        fuzzyMatch(q, d.description.toLowerCase()) ||
        fuzzyMatch(q, d.descriptionEn.toLowerCase()),
    );

    return { models: matchedModels, docs: matchedDocs };
  }, [query, models]);

  const totalResults = searchResults.models.length + searchResults.docs.length;

  // Generate suggestions (debounced)
  const generateSuggestions = useCallback(
    (q: string) => {
      if (!q.trim()) {
        setSuggestions([]);
        return;
      }
      const lower = q.toLowerCase();
      const result: Suggestion[] = [];

      // Model matches
      for (const m of models) {
        if (
          m.id.toLowerCase().includes(lower) ||
          (m.display_name || "").toLowerCase().includes(lower) ||
          (m.owned_by || "").toLowerCase().includes(lower)
        ) {
          result.push({
            type: "model",
            label: m.display_name || m.id,
            href: `/models?q=${encodeURIComponent(m.id)}`,
          });
        }
        if (result.length >= 6) break;
      }

      // Doc matches
      if (result.length < 6) {
        for (const d of DOC_SECTIONS) {
          const title = lang === "zh" ? d.title : d.titleEn;
          const desc = lang === "zh" ? d.description : d.descriptionEn;
          if (
            title.toLowerCase().includes(lower) ||
            desc.toLowerCase().includes(lower)
          ) {
            result.push({ type: "doc", label: title, href: d.href });
          }
          if (result.length >= 6) break;
        }
      }

      setSuggestions(result.slice(0, 6));
    },
    [models, lang],
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

      if (urlDebounceRef.current) clearTimeout(urlDebounceRef.current);
      urlDebounceRef.current = setTimeout(() => {
        const params = new URLSearchParams();
        if (value.trim()) params.set("q", value.trim());
        const url = params.toString() ? `/search?${params}` : "/search";
        router.replace(url, { scroll: false });
      }, 500);
    },
    [generateSuggestions, router],
  );

  // On initial load
  useEffect(() => {
    if (initialQuery) {
      generateSuggestions(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup
  useEffect(() => () => { clearTimeout(debounceRef.current); clearTimeout(urlDebounceRef.current); }, []);

  // Handle search submit
  const handleSearch = useCallback(() => {
    const q = query.trim();
    if (!q) return;
    const updated = addRecentSearch(q);
    if (updated) setRecentSearches(updated);
    setSuggestions([]);
    inputRef.current?.blur();
  }, [query]);

  // Keyboard navigation
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

  const handleRemoveRecent = useCallback((term: string) => {
    const updated = removeRecentSearch(term);
    setRecentSearches(updated);
  }, []);

  const handleClearAllRecent = useCallback(() => {
    saveRecentSearches([]);
    setRecentSearches([]);
  }, []);

  const showDropdown = inputFocused && (suggestions.length > 0 || (!query.trim() && recentSearches.length > 0));
  const activeDescendant = highlightIdx >= 0 ? `search-suggestion-${highlightIdx}` : undefined;

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
            onBlur={() => { setTimeout(() => setInputFocused(false), 200); }}
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
              onClick={() => { handleInputChange(""); inputRef.current?.focus(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Dropdown */}
        {showDropdown && (
          <div
            id="search-listbox"
            role="listbox"
            aria-label={query.trim() ? t.search.suggestions : t.search.recentSearches}
            className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50 animate-[fadeIn_0.1s_ease-out]"
          >
            {/* Recent searches */}
            {!query.trim() && recentSearches.length > 0 && (
              <div>
                <div className="flex items-center justify-between px-4 pt-3 pb-1">
                  <span className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wider">{t.search.recentSearches}</span>
                  <button
                    onMouseDown={(e) => { e.preventDefault(); handleClearAllRecent(); }}
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
                      role="listitem"
                      className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-secondary transition-colors group cursor-pointer"
                      onMouseDown={(e) => { e.preventDefault(); handleRecentClick(term); }}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Clock className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                        <span className="text-sm text-foreground truncate">{term}</span>
                      </div>
                      <button
                        onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); handleRemoveRecent(term); }}
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

            {/* Suggestions */}
            {query.trim() && suggestions.length > 0 && (
              <div className="px-2 py-2">
                {suggestions.map((suggestion, idx) => (
                  <div
                    key={`${suggestion.type}-${suggestion.label}`}
                    id={`search-suggestion-${idx}`}
                    role="option"
                    aria-selected={idx === highlightIdx}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                      idx === highlightIdx ? "bg-primary/10 text-primary" : "text-foreground hover:bg-secondary"
                    }`}
                    onMouseDown={(e) => { e.preventDefault(); handleSuggestionClick(suggestion); }}
                    onMouseEnter={() => setHighlightIdx(idx)}
                  >
                    {suggestion.type === "model" && <Cpu className="h-4 w-4 text-primary shrink-0" />}
                    {suggestion.type === "doc" && <FileText className="h-4 w-4 text-blue-400 shrink-0" />}
                    <span className="text-sm truncate">{suggestion.label}</span>
                    {idx === highlightIdx && <ArrowRight className="h-3.5 w-3.5 shrink-0 ml-auto" />}
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
            {/* Models Section */}
            {searchResults.models.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                    <Cpu className="h-5 w-5 text-primary" />
                    {t.search.models}
                    <span className="text-sm font-normal text-muted-foreground">({searchResults.models.length})</span>
                  </h2>
                  <Link href="/models" className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
                    {t.search.viewAllModels}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {searchResults.models.slice(0, 12).map((m) => (
                    <Link key={m.id} href="/models" className="glass-card glass-card-hover p-4 rounded-xl group">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono">{m.owned_by || "unknown"}</span>
                      </div>
                      <p className="font-medium text-foreground text-sm truncate">{m.display_name || m.id}</p>
                      <p className="text-xs text-muted-foreground font-mono truncate">{m.id}</p>
                      {m.pricing && (
                        <div className="mt-2 flex gap-3 text-xs text-muted-foreground">
                          <span>${m.pricing.input ?? "—"}/1M in</span>
                          <span>${m.pricing.output ?? "—"}/1M out</span>
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Documentation Section */}
            {searchResults.docs.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-400" />
                    {t.search.documentation}
                    <span className="text-sm font-normal text-muted-foreground">({searchResults.docs.length})</span>
                  </h2>
                  <Link href="/docs" className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
                    {t.search.viewDocs}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {searchResults.docs.map((d) => {
                    const Icon = d.icon;
                    return (
                      <Link key={d.id} href={d.href} className="glass-card glass-card-hover p-4 rounded-xl group">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            <Icon className="h-4 w-4 text-blue-400" />
                          </div>
                          <h3 className="font-medium text-foreground text-sm">{lang === "zh" ? d.title : d.titleEn}</h3>
                        </div>
                        <p className="text-xs text-muted-foreground">{lang === "zh" ? d.description : d.descriptionEn}</p>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        ) : (
          /* No results */
          <div className="text-center py-20">
            <div className="mx-auto w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-6">
              <SearchX className="h-10 w-10 text-muted-foreground/40" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">{t.search.noResults}</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto mb-8">{t.search.noResultsDesc}</p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/models" className="px-5 py-2.5 text-sm rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary hover:border-primary/30 transition-colors">
                {lang === "zh" ? "模型市场" : "Models"}
              </Link>
              <Link href="/docs" className="px-5 py-2.5 text-sm rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary hover:border-primary/30 transition-colors">
                {lang === "zh" ? "文档" : "Docs"}
              </Link>
            </div>
          </div>
        )
      ) : (
        /* No query state */
        <div className="text-center py-16">
          {recentSearches.length > 0 ? (
            <div className="max-w-xl mx-auto text-left">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  {t.search.recentSearches}
                </h2>
                <button onClick={handleClearAllRecent} className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
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
                      onClick={(e) => { e.stopPropagation(); handleRemoveRecent(term); }}
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
              <p className="text-lg text-muted-foreground">{t.search.placeholder}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
