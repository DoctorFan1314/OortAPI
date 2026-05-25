"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, Puzzle, ArrowRight, Cpu, Zap, FileCode } from "lucide-react";

export function ResourceHub({ lang = "zh" }: { lang?: "zh" | "en" }) {
  return (
    <section className="py-16 lg:py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">
            {lang === "zh" ? "资源中心" : "Resource Hub"}
          </h2>
          <p className="text-muted-foreground">
            {lang === "zh"
              ? "Agent 技能、Prompt 模板和 API 文档，帮助你高效使用 AI"
              : "Agent skills, Prompt templates and API docs to help you get more from AI"
            }
          </p>
        </div>
        <div className="grid sm:grid-cols-3 gap-6">
          <Link href="/skills" className="glass-card glass-card-hover p-8 rounded-xl text-center group">
            <Puzzle className="h-10 w-10 text-primary mx-auto mb-4" />
            <h3 className="font-semibold text-xl mb-2">
              {lang === "zh" ? "Agent 技能" : "Agent Skills"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {lang === "zh" ? "可执行的 AI 技能，一键安装赋予 AI 行动力" : "Executable AI skills — install and give AI real action power"}
            </p>
            <span className="text-primary text-sm group-hover:underline flex items-center justify-center gap-1">
              {lang === "zh" ? "浏览技能" : "Browse Skills"} <ArrowRight className="h-3 w-3" />
            </span>
          </Link>
          <Link href="/prompts" className="glass-card glass-card-hover p-8 rounded-xl text-center group">
            <FileCode className="h-10 w-10 text-primary mx-auto mb-4" />
            <h3 className="font-semibold text-xl mb-2">
              {lang === "zh" ? "Prompt 模板" : "Prompt Templates"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {lang === "zh" ? "28+ 高质量模板，覆盖编程、写作、分析等场景" : "28+ quality templates for coding, writing, analysis and more"}
            </p>
            <span className="text-primary text-sm group-hover:underline flex items-center justify-center gap-1">
              {lang === "zh" ? "浏览模板" : "Browse Templates"} <ArrowRight className="h-3 w-3" />
            </span>
          </Link>
          <Link href="/docs" className="glass-card glass-card-hover p-8 rounded-xl text-center group">
            <Zap className="h-10 w-10 text-primary mx-auto mb-4" />
            <h3 className="font-semibold text-xl mb-2">
              {lang === "zh" ? "API 文档" : "API Docs"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {lang === "zh" ? "一个接口接入 OpenAI、Anthropic 等 30+ 模型" : "One endpoint for OpenAI, Anthropic and 30+ models"}
            </p>
            <span className="text-primary text-sm group-hover:underline flex items-center justify-center gap-1">
              {lang === "zh" ? "查看文档" : "View Docs"} <ArrowRight className="h-3 w-3" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
