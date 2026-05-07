"use client";

import Link from "next/link";
import { categories } from "@/lib/categories";
import { getSkillsByCategory } from "@/lib/mock-data";
import { agentSkills } from "@/lib/mock-agent-skills";
import { SkillCard } from "@/components/skill/skill-card";
import { AgentSkillCard } from "@/components/agent-skill/agent-skill-card";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { useI18n } from "@/contexts/i18n-context";
import { getCategoryI18n, getAgentCategoryI18n } from "@/lib/categories";

const categoryToAgentCategory: Record<string, string[]> = {
  content: ["通讯协作", "文件处理"],
  coding: ["Web 开发", "代码执行"],
  thinking: ["Skills 管理"],
  data: ["数据分析"],
  productivity: ["Web 搜索", "多平台交互"],
  creative: ["文件处理"],
};

export default function CategoryDetailClient({ slug }: { slug: string }) {
  const { t } = useI18n();
  const category = categories.find((c) => c.slug === slug);
  const catSkills = getSkillsByCategory(slug);

  const agentCats = categoryToAgentCategory[slug] || [];
  const catAgentSkills = agentSkills.filter((s) => agentCats.includes(s.category));

  if (!category) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <p className="text-muted-foreground text-lg">{t.categories.catNotFound}</p>
        <Link href="/categories" className="text-primary mt-4 inline-block hover:underline">{t.categories.catBackToBrowse}</Link>
      </div>
    );
  }

  const catI18n = getCategoryI18n(slug, t);
  const displayName = catI18n.name || category.name;
  const displayDesc = catI18n.description || category.description;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
      <Breadcrumb items={[{ label: t.common.categories, href: "/categories" }, { label: displayName }]} />
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl">{category.icon}</span>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{displayName}</h1>
            <p className="text-muted-foreground">{displayDesc}</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground/60">{catSkills.length} {t.categories.catPromptTemplates} · {catAgentSkills.length} {t.categories.catAgentSkills}</p>
      </div>

      {catAgentSkills.length > 0 && (
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-foreground mb-4">{t.home.tabAgent}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {catAgentSkills.map((skill) => (<AgentSkillCard key={skill.id} skill={skill} />))}
          </div>
        </div>
      )}

      {catSkills.length === 0 && catAgentSkills.length === 0 ? (
        <div className="text-center py-20"><p className="text-muted-foreground">{t.categories.catNoContent}</p></div>
      ) : catSkills.length > 0 ? (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">{t.home.tabPrompt}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {catSkills.map((skill) => (<SkillCard key={skill.id} skill={skill} />))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
