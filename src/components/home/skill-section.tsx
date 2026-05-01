import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SkillCard } from "@/components/skill/skill-card";
import type { Skill } from "@/lib/types";

export function SkillSection({ title, subtitle, skills }: { title: string; subtitle?: string; skills: Skill[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">{title}</h2>
          {subtitle && <p className="text-sm text-[#8b949e]">{subtitle}</p>}
        </div>
        <Link href="/skills" className="hidden sm:inline-flex items-center gap-1 text-sm text-[#00d4ff] hover:underline shrink-0">
          查看全部 <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {skills.map((skill) => (
          <SkillCard key={skill.id} skill={skill} />
        ))}
      </div>
    </section>
  );
}
