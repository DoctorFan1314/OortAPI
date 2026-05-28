"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n } from "@/contexts/i18n-context";
import { Zap, Code, Key, Activity, Server, DollarSign, AlertTriangle, Gauge, Book, Layout, ArrowRight, Search, Sparkles } from "lucide-react";

interface DocCard {
  href: string;
  icon: typeof Zap;
  labelKey: string;
  descKey: string;
  group: "getting-started" | "api-reference" | "advanced-guides";
}

const GROUPS = [
  { key: "getting-started" as const, icon: Zap, i18nKey: "groupGettingStarted" },
  { key: "api-reference" as const, icon: Code, i18nKey: "groupApiReference" },
  { key: "advanced-guides" as const, icon: Book, i18nKey: "groupAdvancedGuides" },
];

const cards: DocCard[] = [
  { href: "/docs/quickstart", icon: Zap, labelKey: "navQuickStart", descKey: "quickStart", group: "getting-started" },
  { href: "/docs/authentication", icon: Key, labelKey: "navAuthentication", descKey: "authentication", group: "getting-started" },
  { href: "/docs/endpoints", icon: Code, labelKey: "navEndpoints", descKey: "endpointsTitle", group: "getting-started" },
  { href: "/docs/sdk", icon: Activity, labelKey: "navSdk", descKey: "sdkSupport", group: "api-reference" },
  { href: "/docs/streaming", icon: Activity, labelKey: "navStreaming", descKey: "streamTitle", group: "api-reference" },
  { href: "/docs/pricing", icon: DollarSign, labelKey: "navPricing", descKey: "pricing", group: "api-reference" },
  { href: "/docs/errors", icon: AlertTriangle, labelKey: "navErrors", descKey: "errorCodes", group: "api-reference" },
  { href: "/docs/rate-limits", icon: Gauge, labelKey: "navRateLimits", descKey: "rateLimiting", group: "api-reference" },
  { href: "/docs/integrations", icon: Book, labelKey: "navIntegrations", descKey: "appsTitle", group: "advanced-guides" },
  { href: "/docs/deployment", icon: Server, labelKey: "navDeployment", descKey: "deployTitle", group: "advanced-guides" },
  { href: "/docs/api-reference", icon: Layout, labelKey: "navInteractiveApi", descKey: "openapiSpec", group: "advanced-guides" },
];

function DocCard({ href, icon: Icon, label, desc }: { href: string; icon: typeof Zap; label: string; desc: string }) {
  return (
    <Link href={href} className="glass-card backdrop-blur-sm p-5 rounded-xl border border-border/50 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 hover:bg-muted/30 transition-all duration-300 group">
      <Icon className="h-5 w-5 text-primary mb-3" />
      <h3 className="font-semibold text-sm mb-1">{label}</h3>
      <p className="text-xs text-muted-foreground">{desc}</p>
      <ArrowRight className="h-3.5 w-3.5 mt-3 text-muted-foreground group-hover:text-primary transition-colors" />
    </Link>
  );
}

export default function DocsLandingPage() {
  const { lang, t } = useI18n();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const L = t.apiDocs;
  const Lr = L as Record<string, string>;

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl glass-card p-8 lg:p-12 mb-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-purple-500/10 pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, var(--foreground) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-6">
            <Sparkles className="h-3 w-3" />
            {lang === "zh" ? "OpenAI + Anthropic 双协议兼容 · 一个 Key 聚合所有 AI 服务" : "OpenAI + Anthropic Dual Protocol · One Key for All AI Services"}
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-3">{L.title}</h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-6">{L.subtitle}</p>
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && searchQuery.trim()) { router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`); } }}
              placeholder={Lr.navDocsSearchPlaceholder || "Search docs..."}
              aria-label="Search documentation"
              className="w-full pl-10 pr-4 py-2 bg-background rounded-lg text-sm border border-border/50 focus:border-primary focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Data-driven card groups */}
      <div className="space-y-12">
        {GROUPS.map(group => {
          const groupCards = cards.filter(c => c.group === group.key);
          const GroupIcon = group.icon;
          return (
            <div key={group.key}>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <GroupIcon className="h-5 w-5 text-primary" />
                {Lr[group.i18nKey] || group.i18nKey}
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {groupCards.map(card => (
                  <DocCard
                    key={card.href}
                    href={card.href}
                    icon={card.icon}
                    label={Lr[card.labelKey] || card.labelKey}
                    desc={Lr[card.descKey] || card.descKey}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
