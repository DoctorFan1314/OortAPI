import Link from "next/link";
import { ArrowRight } from "lucide-react";

const cards = [
  {
    icon: "💬",
    title: "语言与内容生产",
    subtitle: "小红书爆款笔记、营销文案、视频脚本、标题生成、去AI味优化",
    description: "30秒生成自然流畅、高转化内容，让你的文字更像真人写作",
    href: "/categories/content",
    color: "#00d4ff",
  },
  {
    icon: "🛠️",
    title: "编程与技术任务",
    subtitle: "代码生成、Bug修复、代码审查、重构、API集成",
    description: "让开发效率提升2-5倍，适合开发者、学习者和独立创作者",
    href: "/categories/coding",
    color: "#7c3aed",
  },
  {
    icon: "⚙️",
    title: "思考与工作流",
    subtitle: "周报总结、深度研究、结构化思考、多步任务、决策辅助",
    description: "把复杂思考转化为清晰结构化输出，大幅提升职场与学习效率",
    href: "/categories/thinking",
    color: "#10b981",
  },
];

export function CategoryCards() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">选择你的AI技能方向</h2>
        <p className="text-[#8b949e] max-w-xl mx-auto">三大核心领域，覆盖主流生产力场景</p>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {cards.map((card) => (
          <Link key={card.href} href={card.href}>
            <div className="glass-card glass-card-hover p-6 h-full cursor-pointer group">
              <div className="text-4xl mb-4 transition-transform group-hover:scale-110">{card.icon}</div>
              <h3 className="text-lg font-semibold text-white mb-2">{card.title}</h3>
              <p className="text-sm text-[#8b949e] mb-1">{card.subtitle}</p>
              <p className="text-sm text-[#8b949e]/70 mb-5">{card.description}</p>
              <div className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors group-hover:gap-2.5" style={{ color: card.color }}>
                探索{card.title.slice(0, 2)}技能
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
