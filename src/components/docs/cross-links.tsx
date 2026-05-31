"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/contexts/i18n-context";

interface CrossLink {
  title: string;
  href: string;
  description: string;
}

interface CrossLinksProps {
  links: CrossLink[];
  title?: string;
  className?: string;
}

export function CrossLinks({ links, title, className }: CrossLinksProps) {
  const { lang } = useI18n();
  const heading = title ?? (lang === "zh" ? "相关文档" : "See Also");

  if (links.length === 0) return null;

  return (
    <section className={cn("space-y-4", className)}>
      <h2 className="text-lg font-bold">{heading}</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="glass-card glass-card-hover backdrop-blur-sm p-5 rounded-xl border border-border/50 hover:border-primary/40 transition-all duration-300 group"
          >
            <h3 className="font-semibold text-sm mb-1">{link.title}</h3>
            <p className="text-xs text-muted-foreground">{link.description}</p>
            <ArrowRight className="h-3.5 w-3.5 mt-3 text-muted-foreground group-hover:text-primary transition-colors" />
          </Link>
        ))}
      </div>
    </section>
  );
}
