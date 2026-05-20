"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, Zap, Infinity, Shield } from "lucide-react";

const TIERS = [
  { icon: Zap, nameZh: "Spark 火花", nameEn: "Spark", priceZh: "¥9", priceEn: "$9", period: "/mo", descZh: "尝鲜入门，适合个人开发者", descEn: "For individual developers", color: "text-blue-500", bgColor: "bg-blue-500/10" },
  { icon: Sparkles, nameZh: "Flare 烈焰", nameEn: "Flare", priceZh: "¥29", priceEn: "$29", period: "/mo", descZh: "进阶选择，适合专业用户", descEn: "For professional users", color: "text-purple-500", bgColor: "bg-purple-500/10", popular: true },
  { icon: Infinity, nameZh: "Nova 新星", nameEn: "Nova", priceZh: "¥199", priceEn: "$199", period: "/mo", descZh: "极致性能，适合团队使用", descEn: "For teams and enterprises", color: "text-amber-500", bgColor: "bg-amber-500/10" },
];

export function PricingSection({ lang = "zh" }: { lang?: "zh" | "en" }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
          {lang === "zh" ? "灵活定价" : "Flexible Pricing"}
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          {lang === "zh"
            ? "从个人到企业，找到适合你的方案"
            : "From individual to enterprise, find the plan that fits you"}
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
        {TIERS.map((tier) => (
          <div key={tier.nameEn} className={`glass-card p-6 rounded-xl flex flex-col ${tier.popular ? "border-primary/50 ring-1 ring-primary/20" : ""}`}>
            {tier.popular && (
              <span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full self-start mb-3">
                {lang === "zh" ? "最受欢迎" : "Most Popular"}
              </span>
            )}
            <div className={`w-10 h-10 rounded-lg ${tier.bgColor} flex items-center justify-center mb-3`}>
              <tier.icon className={`h-5 w-5 ${tier.color}`} />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">{lang === "zh" ? tier.nameZh : tier.nameEn}</h3>
            <p className="text-sm text-muted-foreground mb-4 flex-1">{lang === "zh" ? tier.descZh : tier.descEn}</p>
            <div className="mb-5">
              <span className="text-3xl font-bold text-foreground">{lang === "zh" ? tier.priceZh : tier.priceEn}</span>
              <span className="text-sm text-muted-foreground">{tier.period}</span>
            </div>
            <Link href="/token-plan">
              <Button variant={tier.popular ? "default" : "outline"} className="w-full">
                {lang === "zh" ? "查看详情" : "View Details"}
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
