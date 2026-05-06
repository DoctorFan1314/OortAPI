"use client";

import Link from "next/link";
import { Zap, FileText, ArrowRight } from "lucide-react";
import { agentSkills } from "@/lib/mock-agent-skills";
import { getTrendingSkills } from "@/lib/mock-data";
import { AgentSkillCard } from "@/components/agent-skill/agent-skill-card";
import { SkillCard } from "@/components/skill/skill-card";
import { useI18n } from "@/contexts/i18n-context";

export function FeaturedSection({ tab, onTabChange }: { tab: "agent" | "prompt"; onTabChange: (tab: "agent" | "prompt") => void }) {
  const { t } = useI18n();

  const trendingAgents = agentSkills.filter((s) => s.trending).slice(0, 6);
  const trendingPrompts = getTrendingSkills().slice(0, 6);

  return (
    <section id="featured-section" className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
      {/* Title */}
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
          {t.home.featuredTitle}
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          {t.home.featuredSubtitle}
        </p>
      </div>

      {/* Tab buttons */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex rounded-xl bg-secondary p-1 gap-1">
          <button
            onClick={() => onTabChange("agent")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              tab === "agent"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Zap className="h-4 w-4" />
            {t.home.tabAgent}
          </button>
          <button
            onClick={() => onTabChange("prompt")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              tab === "prompt"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileText className="h-4 w-4" />
            {t.home.tabPrompt}
          </button>
        </div>
      </div>

      {/* Tab content */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tab === "agent"
          ? trendingAgents.map((s) => <AgentSkillCard key={s.id} skill={s} />)
          : trendingPrompts.map((s) => <SkillCard key={s.id} skill={s} />)}
      </div>

      {/* View all */}
      <div className="text-center mt-8">
        <Link
          href={tab === "agent" ? "/skills" : "/prompts"}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          {t.common.viewAll}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </section>
  );
}
