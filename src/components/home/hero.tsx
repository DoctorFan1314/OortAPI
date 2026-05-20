"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Zap, ArrowRight, Terminal, Shield, Gauge, Globe, ChevronDown } from "lucide-react";
import { useI18n } from "@/contexts/i18n-context";
import { useAuth } from "@/contexts/auth-context";

export function Hero() {
  const { lang } = useI18n();
  const { user } = useAuth();

  return (
    <section id="hero-section" aria-labelledby="hero-heading" className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/8 via-primary/3 to-transparent pointer-events-none" aria-hidden="true" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" aria-hidden="true" />
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
          {/* Trust stats */}
          <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground/60 hero-animate-4" aria-label="Platform stats">
            <li className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary/60" />
              {lang === "zh" ? "30+ AI 模型" : "30+ AI Models"}
            </li>
            <li className="hidden sm:block text-muted-foreground/20" aria-hidden="true">·</li>
            <li className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-primary/60" />
              {lang === "zh" ? "< 200ms 延迟" : "< 200ms Latency"}
            </li>
            <li className="hidden sm:block text-muted-foreground/20" aria-hidden="true">·</li>
            <li className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary/60" />
              {lang === "zh" ? "99.9% 可用率" : "99.9% Uptime"}
            </li>
          </ul>

          {/* Scroll indicator */}
          <div className="mt-12 animate-bounce" aria-hidden="true">
            <ChevronDown className="h-5 w-5 text-muted-foreground/30 mx-auto" />
          </div>
        </div>
      </div>
    </section>
  );
}
