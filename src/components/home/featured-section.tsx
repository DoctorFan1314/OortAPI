"use client";

import Link from "next/link";
import { Zap, FileText, ArrowRight } from "lucide-react";
import { useMemo, useCallback } from "react";
import { agentSkills } from "@/lib/mock-agent-skills";
import { getTrendingSkills } from "@/lib/mock-data";
import { AgentSkillCard } from "@/components/agent-skill/agent-skill-card";
import { SkillCard } from "@/components/skill/skill-card";
import { useI18n } from "@/contexts/i18n-context";

export function FeaturedSection({ tab, onTabChange }: { tab: "agent" | "prompt"; onTabChange: (tab: "agent" | "prompt") => void }) {
  const { t } = useI18n();

  const trendingAgents = useMemo(() => agentSkills.filter((s) => s.trending).slice(0, 6), []);
  const trendingPrompts = useMemo(() => getTrendingSkills().slice(0, 6), []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      onTabChange(tab === "agent" ? "prompt" : "agent");
    }
    if (e.key === "Home") {
      e.preventDefault();
      onTabChange("agent");
    }
    if (e.key === "End") {
      e.preventDefault();
      onTabChange("prompt");
    }
  }, [tab, onTabChange]);

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
        <div className="inline-flex rounded-xl bg-secondary p-1 gap-1" role="tablist" onKeyDown={handleKeyDown}>
          <button
            role="tab"
            aria-selected={tab === "agent"}
            id="tab-agent"
            aria-controls="tabpanel-agent"
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
            role="tab"
            aria-selected={tab === "prompt"}
            id="tab-prompt"
            aria-controls="tabpanel-prompt"
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

      {/* Tab content - only render active tab to reduce DOM nodes */}
      {tab === "agent" ? (
        <div
          role="tabpanel"
          id="tabpanel-agent"
          aria-labelledby="tab-agent"
          tabIndex={0}
          className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 tab-panel-enter"
        >
          {trendingAgents.map((s) => <AgentSkillCard key={s.id} skill={s} />)}
        </div>
      ) : (
        <div
          role="tabpanel"
          id="tabpanel-prompt"
          aria-labelledby="tab-prompt"
          tabIndex={0}
          className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 tab-panel-enter"
        >
          {trendingPrompts.map((s) => <SkillCard key={s.id} skill={s} />)}
        </div>
      )}

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
