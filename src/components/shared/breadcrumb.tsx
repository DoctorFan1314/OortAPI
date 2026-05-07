"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useI18n } from "@/contexts/i18n-context";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  const { t } = useI18n();
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-muted-foreground mb-6">
      <Link href="/" className="hover:text-foreground transition-colors">{t.common.home}</Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          {item.href ? (
            <Link href={item.href} className="hover:text-foreground transition-colors">{item.label}</Link>
          ) : (
            <span className="text-foreground" aria-current="page">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
