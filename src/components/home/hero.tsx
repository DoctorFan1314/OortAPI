"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Zap, ArrowRight, Terminal, Shield, Gauge, Globe, ChevronDown, Activity, CheckCircle, Clock } from "lucide-react";
import { useI18n } from "@/contexts/i18n-context";
import { useAuth } from "@/contexts/auth-context";
import { useState, useEffect, useRef } from "react";
import useSWR from "swr";
import { dashboardSWRConfig } from "@/lib/swr-fetcher";

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
      // Ease-out cubic
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

  return (
    <section id="hero-section" aria-labelledby="hero-heading" className="relative overflow-hidden">
      <div className="relative mx-auto max-w-7xl px-4 py-20 lg:py-32 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-8 hero-animate-1">
            <Zap className="h-3.5 w-3.5" />
            <span>{lang === "zh" ? "统一 AI API 网关" : "Unified AI API Gateway"}</span>
          </div>
          <h1 id="hero-heading" className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight mb-6 hero-animate-2">
            <span className="gradient-text">
              {lang === "zh" ? "一个 API 接入所有 AI 模型" : "One API for All AI Models"}
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-4 max-w-2xl mx-auto leading-relaxed hero-animate-2">
            {lang === "zh"
              ? "通过统一端点接入 OpenAI、Anthropic、Gemini、DeepSeek 等 30+ AI 服务商。兼容 OpenAI 标准格式、智能路由、精细计费。"
              : "Connect OpenAI, Anthropic, Gemini, DeepSeek and 30+ AI providers through a single unified endpoint. OpenAI-compatible format, smart routing, fine-grained billing."
            }
          </p>
          <p className="text-sm text-muted-foreground/60 mb-10 hero-animate-2">
            OpenAI · Anthropic · Google Gemini · DeepSeek · Qwen · Midjourney · Suno
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 hero-animate-3">
            {user ? (
              <Link href="/dashboard">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium px-8 h-12 text-base">
                  <Terminal className="h-4 w-4 mr-2" />
                  {lang === "zh" ? "前往控制台" : "Go to Dashboard"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            ) : (
              <Link href="/register">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium px-8 h-12 text-base">
                  <Zap className="h-4 w-4 mr-2" />
                  {lang === "zh" ? "免费开始" : "Get Started Free"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            )}
            <Link href="/docs">
              <Button variant="outline" size="lg" className="border-border text-foreground hover:bg-secondary px-8 h-12 text-base">
                <Terminal className="h-4 w-4 mr-2" />
                {lang === "zh" ? "API 文档" : "API Documentation"}
              </Button>
            </Link>
          </div>

          {/* Live platform stats — real-time with count-up animation */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto hero-animate-4">
            <div className="text-center">
              <Activity className="h-5 w-5 text-primary mx-auto mb-2" />
              <div className="text-2xl sm:text-3xl font-bold font-mono text-foreground">
                {formatCompact(calls)}+
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {lang === "zh" ? "总调用量" : "Total Calls"}
              </div>
            </div>
            <div className="text-center">
              <Globe className="h-5 w-5 text-primary mx-auto mb-2" />
              <div className="text-2xl sm:text-3xl font-bold font-mono text-foreground">
                {formatCompact(models)}+
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {lang === "zh" ? "在线模型" : "Available Models"}
              </div>
            </div>
            <div className="text-center">
              <Clock className="h-5 w-5 text-primary mx-auto mb-2" />
              <div className="text-2xl sm:text-3xl font-bold font-mono text-foreground">
                {stats?.avgLatency || "<200ms"}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {lang === "zh" ? "平均延迟" : "Avg Latency"}
              </div>
            </div>
            <div className="text-center">
              <Shield className="h-5 w-5 text-primary mx-auto mb-2" />
              <div className="text-2xl sm:text-3xl font-bold font-mono text-foreground">
                {stats?.uptime || "99.9%"}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {lang === "zh" ? "可用率" : "Uptime"}
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="mt-12 animate-bounce" aria-hidden="true">
            <ChevronDown className="h-5 w-5 text-muted-foreground/30 mx-auto" />
          </div>
        </div>
      </div>
    </section>
  );
}
