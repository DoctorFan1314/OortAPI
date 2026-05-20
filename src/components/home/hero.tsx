"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Zap, ArrowRight, Terminal, Shield, Gauge, Globe, Clock, Check, Copy } from "lucide-react";
import { useI18n } from "@/contexts/i18n-context";
import { useAuth } from "@/contexts/auth-context";
import { useState, useEffect, useRef } from "react";
import useSWR from "swr";
import { dashboardSWRConfig } from "@/lib/swr-fetcher";
import { MockTerminal } from "@/components/home/mock-terminal";

interface StatsData {
  totalCalls: number;
  totalModels: number;
  uptime: string;
  avgLatency: string;
}

function useCountUp(target: number, duration = 1500): number {
  const [value, setValue] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (started.current || target === 0) return;
    started.current = true;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return value;
}

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function Hero() {
  const { lang } = useI18n();
  const { user } = useAuth();
  const { data: stats } = useSWR<StatsData>("/api/stats", { ...dashboardSWRConfig, refreshInterval: 60000 });
  const calls = useCountUp(stats?.totalCalls || 0);
  const models = useCountUp(stats?.totalModels || 0);
  const [baseUrl, setBaseUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const curlCmd = `curl ${baseUrl}/api/v1/chat/completions \\\n  -H "Authorization: Bearer sk-oort-xxxxxxxxxxxx" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "model": "gpt-4o",\n    "messages": [{"role": "user", "content": "Hello!"}]\n  }'`;

  useEffect(() => {
    if (typeof window !== "undefined") setBaseUrl(window.location.origin);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(curlCmd).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <section id="hero-section" className="relative overflow-hidden">
      {/* Radial glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-full max-w-[900px] h-[600px] bg-gradient-to-r from-primary/[0.04] via-primary/[0.06] to-transparent rounded-full blur-[120px] pointer-events-none" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-4 py-16 lg:py-24 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left — Text & CTA */}
          <div className="flex-1 min-w-0 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-6 hero-animate-1">
              <Zap className="h-3.5 w-3.5" />
              <span>{lang === "zh" ? "统一 AI API 网关" : "Unified AI API Gateway"}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-5 hero-animate-2 leading-[1.1]">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-400">
                {lang === "zh" ? "一个 API 接入所有 AI 模型" : "One API for All AI Models"}
              </span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground mb-2 max-w-xl leading-relaxed hero-animate-2">
              {lang === "zh"
                ? "通过统一端点接入 30+ AI 服务商。兼容 OpenAI 标准格式、智能路由、精细计费。"
                : "Connect 30+ AI providers through a single endpoint. OpenAI-compatible, smart routing, fine-grained billing."}
            </p>

            {/* Copy cURL capsule */}
            <div className="flex items-center gap-3 mb-8 hero-animate-2">
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted border border-border text-xs font-mono text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-all duration-300 max-w-full"
              >
                <code className="truncate max-w-[260px] sm:max-w-[340px]">curl {baseUrl}/api/v1/chat/completions -H "Authorization: Bearer sk-oort-…"</code>
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                ) : (
                  <Copy className="h-3.5 w-3.5 shrink-0" />
                )}
              </button>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row items-center lg:items-start gap-3 mb-10 hero-animate-3">
              {user ? (
                <Link href="/dashboard">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium px-8 h-11 text-sm rounded-lg tracking-wider">
                    <Terminal className="h-4 w-4 mr-2" />
                    {lang === "zh" ? "前往控制台" : "Dashboard"}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              ) : (
                <Link href="/register">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium px-8 h-11 text-sm rounded-lg tracking-wider">
                    <Zap className="h-4 w-4 mr-2" />
                    {lang === "zh" ? "免费开始" : "Get Started"}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              )}
              <Link href="/docs">
                <Button variant="outline" size="lg" className="border-border text-foreground hover:bg-secondary px-8 h-11 text-sm rounded-lg tracking-wider">
                  <Terminal className="h-4 w-4 mr-2" />
                  {lang === "zh" ? "API 文档" : "Docs"}
                </Button>
              </Link>
            </div>

            {/* Platform stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-3 max-w-xl hero-animate-4">
              <div>
                <div className="text-xl sm:text-2xl font-bold font-mono text-foreground">{formatCompact(calls)}+</div>
                <div className="text-[11px] text-muted-foreground">{lang === "zh" ? "总调用量" : "Total Calls"}</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold font-mono text-foreground">{formatCompact(models)}+</div>
                <div className="text-[11px] text-muted-foreground">{lang === "zh" ? "在线模型" : "Models"}</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold font-mono text-foreground">{stats?.avgLatency || "<200ms"}</div>
                <div className="text-[11px] text-muted-foreground">{lang === "zh" ? "平均延迟" : "Latency"}</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold font-mono text-foreground">{stats?.uptime || "99.9%"}</div>
                <div className="text-[11px] text-muted-foreground">{lang === "zh" ? "可用率" : "Uptime"}</div>
              </div>
            </div>
          </div>

          {/* Right — Mock Terminal */}
          <div className="w-full lg:w-[55%] max-w-2xl hero-animate-3">
            <MockTerminal />
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="mt-16 animate-bounce text-center" aria-hidden="true">
          <div className="h-5 w-5 text-muted-foreground/30 mx-auto" style={{ clipPath: "polygon(50% 100%, 0 0, 100% 0)" }} />
        </div>
      </div>
    </section>
  );
}
