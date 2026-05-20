"use client";

import { X, Check, ArrowRight } from "lucide-react";
import { Fragment } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const COMPARISONS = [
  { direct: "多个 API Key 分别管理", oort: "一个 Key 统一管理", good: true },
  { direct: "各自独立计费", oort: "统一余额、统一账单", good: true },
  { direct: "手动切换模型服务商", oort: "智能路由自动分发", good: true },
  { direct: "无故障转移", oort: "自动容错，最多 3 次重试", good: true },
  { direct: "无缓存计费优化", oort: "三级缓存定价，命中减半", good: true },
  { direct: "各自限流策略", oort: "统一速率限制 + IP 限流", good: true },
];

export function WhyOortapi({ lang = "zh" }: { lang?: "zh" | "en" }) {
  return (
    <section className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-4">
            {lang === "zh" ? "为什么选择 OortAPI？" : "Why OortAPI?"}
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {lang === "zh"
              ? "告别分散管理，一个平台搞定所有 AI 接入"
              : "Stop managing multiple API providers — one platform for all AI access"}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-0 rounded-xl border border-border overflow-hidden">
          {/* Header */}
          <div className="p-4 bg-muted/50 text-center text-sm font-medium text-muted-foreground border-b border-border">
            {lang === "zh" ? "直接调用各 API" : "Call APIs Directly"}
          </div>
          <div className="p-4 bg-primary/5 text-center text-sm font-medium text-primary border-b border-border">
            {lang === "zh" ? "OortAPI" : "OortAPI"}
          </div>

          {/* Rows */}
          {COMPARISONS.map((row, i) => (
            <Fragment key={i}>
              <div className="p-4 flex items-center gap-3 border-b border-border/50 bg-muted/20">
                <X className="h-4 w-4 text-red-400 shrink-0" />
                <span className="text-sm text-muted-foreground">{row.direct}</span>
              </div>
              <div className="p-4 flex items-center gap-3 border-b border-border/50 bg-primary/[0.02]">
                <Check className="h-4 w-4 text-green-500 shrink-0" />
                <span className="text-sm text-foreground">{row.oort}</span>
              </div>
            </Fragment>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link href="/register">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
              {lang === "zh" ? "免费开始使用" : "Get Started Free"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
