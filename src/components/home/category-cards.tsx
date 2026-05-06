"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { categories } from "@/lib/categories";
import { agentSkillCategories } from "@/lib/agent-skill-categories";
import { useI18n } from "@/contexts/i18n-context";

export function CategoryCards({ tab }: { tab: "agent" | "prompt" }) {
  const { t } = useI18n();
  const items = tab === "agent" ? agentSkillCategories : categories;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">{t.home.exploreDirections}</h2>
        <p className="text-muted-foreground max-w-xl mx-auto">{t.home.categorySubtitle}</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
        {items.map((card) => (
          <Link key={card.slug} href={tab === "agent" ? `/skills?category=${encodeURIComponent(card.name)}` : `/categories/${card.slug}`}>
            <div className="glass-card glass-card-hover p-5 lg:p-6 h-full cursor-pointer group">
              <div className="text-3xl lg:text-4xl mb-3 lg:mb-4 transition-transform group-hover:scale-110">{card.icon}</div>
              <h3 className="text-base lg:text-lg font-semibold text-foreground mb-1.5 lg:mb-2">{card.name}</h3>
              <p className="text-xs lg:text-sm text-muted-foreground mb-4 lg:mb-5 line-clamp-2">{card.description}</p>
              <div className="inline-flex items-center gap-1.5 text-xs lg:text-sm font-medium transition-colors group-hover:gap-2.5" style={{ color: card.color }}>
                {t.categories.exploreSkill}
                <ArrowRight className="h-3.5 w-3.5 lg:h-4 lg:w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
