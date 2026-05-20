"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Zap, FileText, ArrowRight } from "lucide-react";

export function CTASection({ lang = "zh" }: { lang?: "zh" | "en" }) {
  return (
    <section className="py-20 px-4 border-beam">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
          {lang === "zh" ? "开始使用 OortAPI" : "Get Started with OortAPI"}
        </h2>
        <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
          {lang === "zh"
            ? "注册即送 $10 体验余额，一键接入所有主流 AI 模型"
            : "Get $10 free credit on signup. One API key to access all major AI models."}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/register">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 px-8 h-11 text-sm rounded-lg tracking-wider font-mono uppercase">
              <Zap className="h-4 w-4" />
              {lang === "zh" ? "免费注册" : "Sign Up Free"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/docs">
            <Button variant="outline" size="lg" className="border-border text-foreground hover:bg-secondary gap-2 px-8 h-11 text-sm rounded-lg tracking-wider font-mono uppercase">
              <FileText className="h-4 w-4" />
              {lang === "zh" ? "查看文档" : "Read Docs"}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
