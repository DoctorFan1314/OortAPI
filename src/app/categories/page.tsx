import type { Metadata } from "next";
import Link from "next/link";
import { categories } from "@/lib/categories";
import { getSkillsByCategory } from "@/lib/mock-data";
import { SkillCard } from "@/components/skill/skill-card";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "分类浏览 — AI Skills Hub",
  description: "按领域探索最适合你的 AI 技能模板，覆盖内容创作、编程开发、职场工作",
};

export default function CategoriesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">分类浏览</h1>
        <p className="text-[#8b949e]">按领域探索最适合你的AI技能模板</p>
      </div>
      <div className="space-y-12">
        {categories.map((cat) => {
          const catSkills = getSkillsByCategory(cat.slug);
          return (
            <section key={cat.slug}>
              <Link href={`/categories/${cat.slug}`} className="group flex items-center gap-3 mb-6">
                <span className="text-3xl">{cat.icon}</span>
                <div>
                  <h2 className="text-xl font-semibold text-white group-hover:text-[#00d4ff] transition-colors flex items-center gap-2">
                    {cat.name}
                    <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h2>
                  <p className="text-sm text-[#8b949e]">{cat.description}</p>
                </div>
              </Link>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {catSkills.slice(0, 4).map((skill) => (
                  <SkillCard key={skill.id} skill={skill} />
                ))}
              </div>
              {catSkills.length > 4 && (
                <Link href={`/categories/${cat.slug}`} className="inline-flex items-center gap-1.5 text-sm text-[#00d4ff] mt-4 hover:underline">
                  查看全部 {catSkills.length} 个技能 <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
