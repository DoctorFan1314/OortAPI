"use client";

import Link from "next/link";
import { useI18n } from "@/contexts/i18n-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, GitCommit, Sparkles, Wrench } from "lucide-react";

const LOGS = (locale: string) => [
  { date: "2026-05-25", version: "v3.3.4.19", icon: Sparkles, items: locale === "zh" ? [
    "新增键盘快捷键帮助面板（按 ? 查看）",
    "导航栏持久搜索输入框，支持 Ctrl+K",
    "搜索页增加分类筛选标签（模型/文档/错误码）",
    "Playground 高级参数可折叠，对话支持导出 Markdown",
    "注册成功增加庆祝动画",
    "页面切换增加顶部加载进度条",
    "按钮新增渐变变体用于主要 CTA",
  ] : [
    "Added keyboard shortcut help panel (press ?)",
    "Persistent search bar in navbar with Ctrl+K",
    "Search page category filter tabs (Models/Docs/Errors)",
    "Playground collapsible advanced params, conversation export as Markdown",
    "Registration celebration animation",
    "Navigation loading progress bar",
    "New gradient button variant for primary CTAs",
  ]},
  { date: "2026-05-22", version: "v3.3.4.18", icon: Sparkles, items: locale === "zh" ? [
    "全站审计修复 30+ Bug",
    "Playground LaTeX 公式渲染、思考过程独立气泡",
    "模型能力配置、URL 抓取、MCP 风格工具面板",
    "修正 Image 命名冲突与图片上传压缩覆盖问题",
  ] : [
    "Full-site audit — 30+ bug fixes",
    "Playground LaTeX rendering, independent reasoning bubbles",
    "Model capability config, URL scraper, MCP-style tool panel",
    "Fixed Image naming conflict and upload compression overwrite",
  ]},
  { date: "2026-05-21", version: "v3.3.4.17", icon: Wrench, items: locale === "zh" ? [
    "Playground 四分栏工作台布局",
    "多会话管理、流式截断修复、节流渲染优化",
    "CJK 智能 Token 估算、并发测试抽屉",
  ] : [
    "Playground 4-column workspace layout",
    "Multi-session management, stream truncation fix, throttled rendering",
    "CJK-aware token estimation, concurrency test drawer",
  ]},
  { date: "2026-05-21", version: "v3.3.4.16", icon: Sparkles, items: locale === "zh" ? [
    "暗黑工业风首页重构、内联终端打字机动画",
    "玻璃拟态设计系统、全站鼠标聚光灯效果",
    "Dashboard Sparkline 趋势图与堆叠面积图",
  ] : [
    "Dark industrial homepage redesign, inline terminal animation",
    "Glassmorphism design system, global mouse spotlight",
    "Dashboard sparklines and stacked area charts",
  ]},
];

export default function ApiChangelogPage() {
  const { lang } = useI18n();
  const locale = lang || "en";

  return (
    <div className="max-w-3xl">
      <Link href="/docs" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" />{locale === "zh" ? "返回文档首页" : "Back to Docs"}
      </Link>
      <h1 className="text-2xl font-bold text-foreground mb-2">{locale === "zh" ? "API 更新日志" : "API Changelog"}</h1>
      <p className="text-sm text-muted-foreground mb-8">{locale === "zh" ? "OortAPI API 的所有重要变更记录" : "All notable changes to the OortAPI API"}</p>

      <div className="space-y-6">
        {LOGS(locale).map((log) => {
          const Icon = log.icon;
          return (
            <Card key={log.version} className="glass-card">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-primary" />
                  <CardTitle className="text-sm font-semibold">{log.version}</CardTitle>
                  <span className="text-xs text-muted-foreground font-mono">{log.date}</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1.5">
                  {log.items.map((item, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                      <span className="text-primary/60 mt-0.5 shrink-0">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
