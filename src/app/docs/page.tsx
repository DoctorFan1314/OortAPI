"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n } from "@/contexts/i18n-context";
import { Zap, Code, Key, Activity, Server, DollarSign, AlertTriangle, Gauge, Book, Layout, ArrowRight, Search } from "lucide-react";

interface DocCard {
  href: string;
  icon: typeof Zap;
  labelKey: string;
  descKey: string;
}

function DocCard({ href, icon: Icon, label, desc }: { href: string; icon: typeof Zap; label: string; desc: string }) {
  return (
    <Link href={href} className="glass-card p-5 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-muted/30 transition-all group">
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

  const cards: DocCard[] = [
    { href: "/docs/quickstart", icon: Zap, labelKey: "navQuickStart", descKey: "quickStart" },
    { href: "/docs/authentication", icon: Key, labelKey: "navAuthentication", descKey: "authentication" },
    { href: "/docs/endpoints", icon: Code, labelKey: "navEndpoints", descKey: "endpointsTitle" },
    { href: "/docs/sdk", icon: Activity, labelKey: "navSdk", descKey: "sdkSupport" },
    { href: "/docs/streaming", icon: Activity, labelKey: "navStreaming", descKey: "streamTitle" },
    { href: "/docs/pricing", icon: DollarSign, labelKey: "navPricing", descKey: "pricing" },
    { href: "/docs/errors", icon: AlertTriangle, labelKey: "navErrors", descKey: "errorCodes" },
    { href: "/docs/rate-limits", icon: Gauge, labelKey: "navRateLimits", descKey: "rateLimiting" },
    { href: "/docs/integrations", icon: Book, labelKey: "navIntegrations", descKey: "appsTitle" },
    { href: "/docs/deployment", icon: Server, labelKey: "navDeployment", descKey: "deployTitle" },
    { href: "/docs/api-reference", icon: Layout, labelKey: "navInteractiveApi", descKey: "openapiSpec" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="border-b border-border bg-gradient-to-b from-background via-background to-muted/20">
        <div className="max-w-5xl mx-auto px-4 lg:px-0 py-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-6">
            <Zap className="h-3 w-3" />
            {lang === "zh" ? "OpenAI + Anthropic 双协议兼容 · 一个 Key 聚合所有 AI 服务" : "OpenAI + Anthropic Dual Protocol · One Key for All AI Services"}
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-3">{L.title}</h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-6">
            {L.subtitle}
          </p>
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && searchQuery.trim()) { router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`); } }}
              placeholder={(L as Record<string, string>).navDocsSearchPlaceholder || "Search docs..."}
              aria-label="Search documentation"
              className="w-full pl-10 pr-4 py-2 bg-background rounded-lg text-sm border border-border/50 focus:border-primary focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Section links */}
      <div className="max-w-5xl mx-auto px-4 lg:px-0 py-10 space-y-12">
        {/* Getting Started */}
        <div>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            {L.navGettingStarted}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {cards.slice(0, 3).map(card => (
              <DocCard key={card.href} href={card.href} icon={card.icon}
                label={(L as Record<string, string>)[card.labelKey] || card.labelKey}
                desc={(L as Record<string, string>)[card.descKey] || card.descKey} />
            ))}
          </div>
        </div>

        {/* API Reference */}
        <div>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Code className="h-5 w-5 text-primary" />
            {L.navApiReference}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {cards.slice(3, 8).map(card => (
              <DocCard key={card.href} href={card.href} icon={card.icon}
                label={(L as Record<string, string>)[card.labelKey] || card.labelKey}
                desc={(L as Record<string, string>)[card.descKey] || card.descKey} />
            ))}
          </div>
        </div>

        {/* Guides + Deployment + Pricing */}
        <div>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Book className="h-5 w-5 text-primary" />
            {L.navGuides}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {cards.slice(8, 11).map(card => (
              <DocCard key={card.href} href={card.href} icon={card.icon}
                label={(L as Record<string, string>)[card.labelKey] || card.labelKey}
                desc={(L as Record<string, string>)[card.descKey] || card.descKey} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
