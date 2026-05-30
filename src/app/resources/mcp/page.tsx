"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useMemo } from "react";
import { Cloud, Server, Rocket, Copy, Check, Search, X, ExternalLink, ChevronDown } from "lucide-react";
import { useI18n } from "@/contexts/i18n-context";
import { useToast } from "@/contexts/toast-context";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getMcpNodesByCategory, MCP_CATEGORIES, type McpCategory, type ResourceItem } from "@/lib/resource-registry";
import { Breadcrumb } from "@/components/shared/breadcrumb";

export default function McpEcosystemPage() {
  const { lang, t, tFormat } = useI18n();
  const { toast } = useToast();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<McpCategory | "all">("all");
  const [deploymentFilter, setDeploymentFilter] = useState<"all" | "hosted" | "local">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(9);

  const filteredNodes = useMemo(() => {
    let items = getMcpNodesByCategory(activeCategory);
    if (deploymentFilter !== "all") {
      items = items.filter(i => i.mcpDeployment === deploymentFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(i => {
        const name = lang === "zh" ? i.nameZh : i.name;
        const desc = lang === "zh" ? i.descriptionZh : i.description;
        return name.toLowerCase().includes(q) || desc.toLowerCase().includes(q) || i.tags.some(tag => tag.toLowerCase().includes(q));
      });
    }
    // Reset pagination when filters change
    setVisibleCount(9);
    return items;
  }, [activeCategory, deploymentFilter, searchQuery, lang]);

  const handleActivate = (item: ResourceItem) => {
    router.push(`/dashboard/playground?source=hub&type=mcp&id=${item.id}`);
  };

  const handleCopy = async (item: ResourceItem) => {
    if (!item.requiredTools) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(item.requiredTools, null, 2));
      setCopiedId(item.id);
      toast(t.resourceHub.copiedSuccess, "success");
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast(t.resourceHub.mcpCopyFailed, "error");
    }
  };

  const hostedCount = useMemo(() => getMcpNodesByCategory("all").filter(n => n.mcpDeployment === "hosted").length, []);
  const localCount = useMemo(() => getMcpNodesByCategory("all").filter(n => n.mcpDeployment === "local").length, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Breadcrumb items={[{ label: t.resourceHub.title, href: "/resources" }, { label: t.resourceHub.mcpPageTitle }]} />
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl glass-card p-8 mb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-primary/5 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Server className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{t.resourceHub.mcpPageTitle}</h1>
              <p className="text-muted-foreground text-sm mt-1">{t.resourceHub.mcpPageSubtitle}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="text-xs px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
              {tFormat(t.resourceHub.mcpNodeCount, { count: hostedCount + localCount })}
            </span>
            <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {t.resourceHub.mcpHosted}: {hostedCount}
            </span>
            <span className="text-xs px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {t.resourceHub.mcpLocal}: {localCount}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar filters — collapsible on mobile */}
        <aside className="lg:w-56 shrink-0 lg:sticky lg:top-20 lg:self-start">
          <details open className="lg:open space-y-4 group">
            <summary className="flex items-center justify-between px-1 py-2 text-sm font-medium text-muted-foreground cursor-pointer lg:cursor-default lg:pointer-events-none list-none lg:hidden">
              <span>{lang === "zh" ? "筛选条件" : "Filters"}</span>
              <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
            </summary>
            <div className="space-y-4">
          {/* Deployment filter */}
          <div className="glass-card p-4 rounded-xl">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">{t.resourceHub.mcpServiceType}</h3>
            <div className="space-y-1">
              {(["all", "hosted", "local"] as const).map(v => (
                <button key={v} onClick={() => setDeploymentFilter(v)} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${deploymentFilter === v ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
                  {v === "all" ? t.resourceHub.mcpFilterAll : v === "hosted" ? t.resourceHub.mcpFilterHosted : t.resourceHub.mcpFilterLocal}
                </button>
              ))}
            </div>
          </div>

          {/* Category filter */}
          <div className="glass-card p-4 rounded-xl">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">{t.resourceHub.mcpCategoryLabel}</h3>
            <div className="space-y-1">
              {MCP_CATEGORIES.map(cat => (
                <button key={cat.key} onClick={() => setActiveCategory(cat.key)} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${activeCategory === cat.key ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
                  {t.resourceHub[cat.i18nKey as keyof typeof t.resourceHub]}
                </button>
              ))}
            </div>
          </div>
            </div>
          </details>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Search */}
          <div className="relative mb-6">
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

          {/* Results count */}
          <p className="text-xs text-muted-foreground mb-4">
            {tFormat(t.resourceHub.mcpNodeCount, { count: filteredNodes.length })}
          </p>

          {/* Cards grid with pagination */}
          {filteredNodes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-2xl bg-muted/30 flex items-center justify-center mb-3">
                <Cloud className="h-7 w-7 text-muted-foreground/30" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">{t.resourceHub.noResults}</p>
              <p className="text-xs text-muted-foreground/70">{lang === "zh" ? "尝试调整筛选条件" : "Try adjusting your filters"}</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredNodes.slice(0, visibleCount).map(item => (
                <div key={item.id} className="glass-card glass-card-hover p-5 h-full group flex flex-col">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                        <Cloud className="h-4 w-4 text-purple-400" />
                      </div>
                      <h3 className="text-sm font-semibold truncate">{lang === "zh" ? item.nameZh : item.name}</h3>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {item.featured && <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 border text-[10px]">★</Badge>}
                      <Badge className={`border text-[10px] ${item.mcpDeployment === "local" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-purple-500/10 text-purple-400 border-purple-500/20"}`}>
                        {item.mcpDeployment === "local" ? t.resourceHub.mcpLocal : t.resourceHub.mcpHosted}
                      </Badge>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2 flex-1">
                    {lang === "zh" ? item.descriptionZh : item.description}
                  </p>

                  {/* Tool micro-tags */}
                  {item.requiredTools && (
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

                  {/* Actions — 2 rows: detail on top, activate + copy below */}
                  <div className="flex flex-col gap-2 mt-auto">
                    <Link href={`/resources/mcp/${item.id}`} className="flex items-center justify-center gap-1 px-3 py-1.5 text-xs rounded-md border border-border bg-secondary text-secondary-foreground hover:bg-muted transition-colors">
                      {t.resourceHub.viewDetail}
                    </Link>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20" onClick={() => handleActivate(item)}>
                        <Rocket className="h-3.5 w-3.5 mr-1" />
                        {t.resourceHub.mcpActivate}
                      </Button>
                      <Button size="sm" variant="secondary" className="border border-border" onClick={() => handleCopy(item)}>
                        {copiedId === item.id ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* Load More */}
          {filteredNodes.length > visibleCount && (
            <div className="text-center mt-6">
              <Button variant="secondary" className="border border-border" onClick={() => setVisibleCount(prev => prev + 9)}>
                {t.resourceHub.viewMore} ({filteredNodes.length - visibleCount})
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
