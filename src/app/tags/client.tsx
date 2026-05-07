"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { getTagCloud } from "@/lib/tag-utils";
import { useI18n } from "@/contexts/i18n-context";

export default function TagsClient() {
  const { t } = useI18n();
  const tags = getTagCloud();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTags = useMemo(() => {
    if (!searchQuery.trim()) return tags;
    const query = searchQuery.toLowerCase();
    return tags.filter((tag) => tag.tag.toLowerCase().includes(query));
  }, [tags, searchQuery]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 lg:px-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-foreground mb-2">{t.tags.title}</h1>
        <p className="text-muted-foreground">{t.tags.subtitle}</p>
      </div>

      {/* Search input and tag count */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.tags.searchPlaceholder}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {t.tags.tagCount.replace("{count}", String(filteredTags.length))}
        </span>
      </div>

      <div className="glass-card p-8 flex flex-wrap items-center justify-center gap-3">
        {filteredTags.length > 0 ? (
          filteredTags.map((tagItem) => (
            <Link
              key={tagItem.tag}
              href={`/tags/${encodeURIComponent(tagItem.tag)}`}
              className="inline-block px-3 py-1.5 rounded-full bg-secondary border border-border text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors"
              style={{ fontSize: `${Math.round(0.75 + tagItem.weight * 1.2)}rem` }}
            >
              {tagItem.tag}
              <span className="ml-1 text-xs text-muted-foreground/50">{tagItem.count}</span>
            </Link>
          ))
        ) : (
          <div className="text-center py-8 w-full">
            <Search className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-3">{t.common.noResults}</p>
            <button
              onClick={() => setSearchQuery("")}
              className="px-4 py-1.5 text-xs rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary hover:border-primary/30 transition-colors"
            >
              {t.common.clearFilters}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
