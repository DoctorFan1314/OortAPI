"use client";

import { useI18n } from "@/contexts/i18n-context";
import { BaseUrlDisplay } from "@/components/docs/base-url-display";
import { Terminal, Wrench, AlertTriangle } from "lucide-react";
import Link from "next/link";

interface ToolConfigProps {
  name: string;
  protocol: "openai" | "anthropic";
  installSteps?: { zh: string; en: string }[];
  configSteps?: { zh: string; en: string }[];
  notes?: { zh: string; en: string }[];
}

export function ToolConfigTemplate({ name, protocol, installSteps, configSteps, notes }: ToolConfigProps) {
  const { lang } = useI18n();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Terminal className="h-6 w-6" />
        {name}{lang === "zh" ? " 配置" : " Configuration"}
      </h1>

      <p className="text-sm text-muted-foreground">
        {lang === "zh"
          ? `按量付费的 OortAPI 和 Token Plan 均支持 ${name}，可参考本文进行配置与使用。`
          : `Both OortAPI pay-as-you-go and Token Plan support ${name}. Follow this guide to configure and use.`}
      </p>

      {/* Credentials */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold flex items-center gap-2">
          <Wrench className="h-4 w-4" />
          {lang === "zh" ? "前置工作：获取凭证" : "Prerequisites: Get Credentials"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {lang === "zh" ? "支持两种使用方式，获取对应的凭证：" : "Two usage modes, each requires its own credentials:"}
        </p>
        <BaseUrlDisplay />
      </section>

      {/* Install */}
      {installSteps && installSteps.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-semibold">{lang === "zh" ? "安装" : "Installation"}</h2>
          <div className="space-y-2">
            {installSteps.map((step, i) => (
              <p key={i} className="text-sm text-muted-foreground">{i + 1}. {step[lang]}</p>
            ))}
          </div>
        </section>
      )}

      {/* Config */}
      {configSteps && configSteps.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-semibold">{lang === "zh" ? "配置" : "Configuration"}</h2>
          <div className="space-y-2">
            {configSteps.map((step, i) => (
              <p key={i} className="text-sm text-muted-foreground">{i + 1}. {step[lang]}</p>
            ))}
          </div>
        </section>
      )}

      {/* Notes */}
      {notes && notes.length > 0 && (
        <div className="space-y-2 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-500/80">
            <AlertTriangle className="h-3.5 w-3.5" />
            {lang === "zh" ? "注意事项" : "Notes"}
          </div>
          {notes.map((note, i) => (
            <p key={i} className="text-xs text-muted-foreground">• {note[lang]}</p>
          ))}
        </div>
      )}

      <div className="text-xs text-muted-foreground/60 pt-4 border-t border-border/30">
        {lang === "zh" ? "详细配置步骤持续更新中。" : "Detailed configuration steps are continuously updated."}
        {" "}
        <Link href="/docs/ai-tools" className="text-primary hover:underline">
          {lang === "zh" ? "← 返回 AI 工具总览" : "← Back to AI Tools Overview"}
        </Link>
      </div>
    </div>
  );
}
