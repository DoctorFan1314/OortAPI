"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Zap, BookOpen } from "lucide-react";
import { agentSkills } from "@/lib/mock-agent-skills";
import { skills } from "@/lib/mock-data";
import { useI18n } from "@/contexts/i18n-context";

export function Hero() {
  const { t } = useI18n();

  function scrollToFeatured() {
    document.getElementById("featured-section")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <section id="hero-section" className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-purple-500/8 via-primary/3 to-transparent pointer-events-none" aria-hidden="true" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-4 py-20 lg:py-32 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm mb-8 hero-animate-1">
            <Zap className="h-3.5 w-3.5" />
            <span>{agentSkills.length}+ {t.home.heroBadge}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight mb-6 hero-animate-2">
            <span className="gradient-text">{t.agentSkills.heroTitle}</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-4 max-w-2xl mx-auto leading-relaxed hero-animate-2">
            {t.agentSkills.heroSubtitle}
          </p>
          <p className="text-sm text-muted-foreground/60 mb-10 hero-animate-2">
            {t.home.heroPlatforms}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10 hero-animate-3">
            <Button
              size="lg"
              onClick={scrollToFeatured}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium px-8 h-12 text-base cursor-pointer"
            >
              <Zap className="h-4 w-4 mr-2" />
              {t.agentSkills.heroCta}
            </Button>
            <Link href="/guide">
              <Button variant="outline" size="lg" className="border-border text-foreground hover:bg-secondary px-8 h-12 text-base">
                <BookOpen className="h-4 w-4 mr-2" />
                {t.home.heroCtaGuide}
              </Button>
            </Link>
          </div>
          {/* Inline trust stats */}
          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground/50 hero-animate-4" aria-label={t.home.heroTrust}>
            <li>{agentSkills.length}+ {t.agentSkills.title}</li>
            <li className="hidden sm:inline text-muted-foreground/20" aria-hidden="true">·</li>
            <li>{skills.length}+ {t.prompts.title}</li>
            <li className="hidden sm:inline text-muted-foreground/20" aria-hidden="true">·</li>
            <li>{t.home.heroPlatforms}</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
