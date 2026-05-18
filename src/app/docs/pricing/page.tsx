"use client";

import Link from "next/link";
import { useI18n } from "@/contexts/i18n-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Info } from "lucide-react";

export default function PricingPage() {
  const { t } = useI18n();
  const L = t.apiDocs;

  const tiers = [
    {
      key: "inputToken",
      icon: "→",
      color: "text-sky-400",
      border: "border-sky-500/20",
      bg: "bg-sky-500/5",
    },
    {
      key: "completionToken",
      icon: "←",
      color: "text-emerald-400",
      border: "border-emerald-500/20",
      bg: "bg-emerald-500/5",
    },
    {
      key: "cacheRead",
      icon: "✓",
      color: "text-amber-400",
      border: "border-amber-500/20",
      bg: "bg-amber-500/5",
    },
    {
      key: "cacheCreate",
      icon: "+",
      color: "text-violet-400",
      border: "border-violet-500/20",
      bg: "bg-violet-500/5",
    },
  ];

  const details = [
    { key: "pricingAutoDeduction" },
    { key: "pricingCacheFormat" },
    { key: "pricingPerModel" },
    { key: "pricingMultiplier" },
    { key: "pricingCurrency" },
    { key: "pricing402" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">{L.pricing}</h1>
        <p className="text-muted-foreground">{L.pricingDesc}</p>
      </div>

      {/* Tier cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tiers.map(tier => {
          const title = (L as Record<string, string>)[tier.key] || tier.key;
          const desc = (L as Record<string, string>)[`${tier.key}Desc`] || "";
          return (
            <Card key={tier.key} className={`${tier.border} ${tier.bg}`}>
              <CardHeader className="pb-3">
                <CardTitle className={`text-lg font-mono ${tier.color}`}>
                  {tier.icon}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-sm font-semibold">{title}</div>
                <div className="text-xs text-muted-foreground">{desc}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Description list */}
      <div className="rounded-xl border border-border/50 divide-y divide-border/20">
        {details.map(detail => (
          <div key={detail.key} className="flex items-start gap-3 px-5 py-3.5">
            <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <span className="text-sm text-muted-foreground">
              {(L as Record<string, string>)[detail.key] || detail.key}
            </span>
          </div>
        ))}
      </div>

      {/* Model marketplace link */}
      <div className="flex justify-center">
        <Link
          href="/models"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-muted/30 text-sm font-medium transition-all group"
        >
          {L.pricingViewModels}
          <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
