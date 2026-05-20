"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useI18n } from "@/contexts/i18n-context";
import { BookOpen, ChevronDown, Search, Zap, Key, Code, Activity, Book, Server, DollarSign, AlertTriangle, Gauge, Layout, Menu, X } from "lucide-react";

interface NavItem {
  href: string;
  labelKey: string;
  icon?: typeof BookOpen;
  exact?: boolean;
}

interface NavSection {
  sectionKey: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    sectionKey: "navGettingStarted",
    items: [
      { href: "/docs", labelKey: "navOverview", icon: BookOpen, exact: true },
      { href: "/docs/quickstart", labelKey: "navQuickStart", icon: Zap, exact: true },
      { href: "/docs/authentication", labelKey: "navAuthentication", icon: Key, exact: true },
    ],
  },
  {
    sectionKey: "navApiReference",
    items: [
      { href: "/docs/endpoints", labelKey: "navEndpoints", icon: Code, exact: true },
      { href: "/docs/sdk", labelKey: "navSdk", icon: Activity, exact: true },
      { href: "/docs/streaming", labelKey: "navStreaming", icon: Activity, exact: true },
      { href: "/docs/errors", labelKey: "navErrors", icon: AlertTriangle, exact: true },
      { href: "/docs/rate-limits", labelKey: "navRateLimits", icon: Gauge, exact: true },
      { href: "/docs/api-reference", labelKey: "navInteractiveApi", icon: Layout, exact: true },
    ],
  },
  {
    sectionKey: "navGuides",
    items: [
      { href: "/docs/integrations", labelKey: "navIntegrations", icon: Book, exact: true },
    ],
  },
  {
    sectionKey: "navDeployment",
    items: [
      { href: "/docs/deployment", labelKey: "navDeploymentGuide", icon: Server, exact: true },
    ],
  },
  {
    sectionKey: "navPricing",
    items: [
      { href: "/docs/pricing", labelKey: "navPricingInfo", icon: DollarSign, exact: true },
    ],
  },
];

export function DocsSidebar() {
  const pathname = usePathname();
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(NAV_SECTIONS.map(s => s.sectionKey))
  );

  const toggleSection = (key: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const filteredSections = useMemo(() => {
    if (!searchQuery) return NAV_SECTIONS;
    const q = searchQuery.toLowerCase();
    return NAV_SECTIONS
      .map(section => ({
        ...section,
        items: section.items.filter(item => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const label = ((t.apiDocs as any)[item.labelKey.replace("apiDocs.", "")] || "") as string;
          return label.toLowerCase().includes(q) || item.href.toLowerCase().includes(q);
        }),
      }))
      .filter(s => s.items.length > 0);
  }, [searchQuery, t]);

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href + "/") || pathname === href;
  };

  const sidebarContent = (
    <nav className="space-y-1" role="navigation" aria-label={t.common.navigation}>
      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
        <input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder={(t.apiDocs as Record<string, string>).navDocsSearchPlaceholder || "Search docs..."}
          className="w-full pl-8 pr-3 py-1.5 bg-background rounded-lg text-sm border border-border/50 focus:border-primary focus:outline-none"
        />
      </div>

      {filteredSections.map(section => {
        const sectionLabel = (t.apiDocs as Record<string, string>)[section.sectionKey] || section.sectionKey;
        const isExpanded = expandedSections.has(section.sectionKey);
        return (
          <div key={section.sectionKey}>
            <button
              onClick={() => toggleSection(section.sectionKey)}
              className="flex items-center justify-between w-full px-2 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground rounded-md transition-colors"
            >
              {sectionLabel}
              <ChevronDown className={cn("h-3 w-3 transition-transform", isExpanded && "rotate-180")} />
            </button>
            {isExpanded && (
              <div className="space-y-0.5 ml-1">
                {section.items.map(item => {
                  const active = isActive(item.href, item.exact);
                  const Icon = item.icon;
                  const key = item.labelKey as string;
                  const label = (t.apiDocs as Record<string, string>)[key] || key;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors",
                        active
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted",
                        searchQuery ? "" : ""
                      )}
                    >
                      {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
                      <span>{label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted lg:hidden transition-colors"
        aria-expanded={mobileOpen}
      >
        <span>{(t.apiDocs as Record<string, string>).title || "Docs"}</span>
        {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar panel */}
      <aside className={cn(
        "w-64 shrink-0",
        mobileOpen
          ? "fixed inset-y-0 left-0 z-50 bg-card/80 backdrop-blur-xl border-r border-border p-4 overflow-y-auto lg:relative lg:inset-auto lg:z-auto lg:border-none"
          : "hidden lg:block lg:sticky lg:top-20 lg:h-[calc(100vh-5rem)] lg:overflow-y-auto"
      )}>
        {sidebarContent}
      </aside>
    </>
  );
}
