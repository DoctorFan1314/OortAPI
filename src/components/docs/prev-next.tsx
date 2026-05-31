"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useI18n } from "@/contexts/i18n-context";

const PAGE_ORDER = [
  { href: "/docs", labelKey: "navOverview" },
  { href: "/docs/quickstart", labelKey: "navQuickStart" },
  { href: "/docs/authentication", labelKey: "navAuthentication" },
  { href: "/docs/endpoints", labelKey: "navEndpoints" },
  { href: "/docs/sdk", labelKey: "navSdk" },
  { href: "/docs/streaming", labelKey: "navStreaming" },
  { href: "/docs/errors", labelKey: "navErrors" },
  { href: "/docs/rate-limits", labelKey: "navRateLimits" },
  { href: "/docs/features", labelKey: "navFeatures" },
  { href: "/docs/models-pricing", labelKey: "navModelsPricing" },
  { href: "/docs/integrations", labelKey: "navIntegrations" },
  { href: "/docs/ai-tools", labelKey: "navAiTools" },
  { href: "/docs/deployment", labelKey: "navDeployment" },
  { href: "/docs/security", labelKey: "navSecurity" },
  { href: "/docs/faq", labelKey: "navFaq" },
  { href: "/docs/pricing", labelKey: "navPricing" },
  { href: "/docs/changelog", labelKey: "navChangelog" },
];

export function PrevNext() {
  const pathname = usePathname();
  const { t } = useI18n();
  const Lr = t.apiDocs as Record<string, string>;

  const idx = PAGE_ORDER.findIndex(p => p.href === pathname);
  if (idx === -1) return null;

  const prev = idx > 0 ? PAGE_ORDER[idx - 1] : null;
  const next = idx < PAGE_ORDER.length - 1 ? PAGE_ORDER[idx + 1] : null;

  if (!prev && !next) return null;

  return (
    <div className="flex items-center justify-between gap-4 mt-8 pt-6 border-t border-border">
      {prev ? (
        <Link
          href={prev.href}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ChevronLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          <div>
            <div className="text-xs text-muted-foreground/60">
              {Lr.navPrev || "Previous"}
            </div>
            <div className="font-medium">{Lr[prev.labelKey] || prev.labelKey}</div>
          </div>
        </Link>
      ) : <div />}
      {next ? (
        <Link
          href={next.href}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group text-right"
        >
          <div>
            <div className="text-xs text-muted-foreground/60">
              {Lr.navNext || "Next"}
            </div>
            <div className="font-medium">{Lr[next.labelKey] || next.labelKey}</div>
          </div>
          <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      ) : <div />}
    </div>
  );
}
