"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Zap, ArrowRight, Terminal, Check, Copy } from "lucide-react";
import { useI18n } from "@/contexts/i18n-context";
import { useAuth } from "@/contexts/auth-context";
import { useState, useEffect, useRef, type ReactNode } from "react";
import useSWR from "swr";
import { dashboardSWRConfig } from "@/lib/swr-fetcher";

// ─── Types ─────────────────────────────────────────────────

interface StatsData {
  totalCalls: number;
  totalModels: number;
  uptime: string;
  avgLatency: string;
}

// ─── Hooks ─────────────────────────────────────────────────

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

// ─── Terminal Animation Constants ──────────────────────────

const CURL_CMD = `curl https://api.oortapi.com/v1/chat/completions \\`;
const AUTH_HEADER = `  -H "Authorization: Bearer sk-oort-xxxxxxxxxxxx"`;

const JSON_LINES: ReactNode[] = [
  <span key="j0">{'{'}</span>,
  <span key="j1">  <span className="dark:text-sky-300 text-sky-600">"id"</span>: <span className="dark:text-amber-200 text-amber-700">"chatcmpl-oort99"</span>,</span>,
  <span key="j2">  <span className="dark:text-sky-300 text-sky-600">"object"</span>: <span className="dark:text-amber-200 text-amber-700">"chat.completion.chunk"</span>,</span>,
  <span key="j3">  <span className="dark:text-sky-300 text-sky-600">"model"</span>: <span className="dark:text-amber-200 text-amber-700">"deepseek-r1"</span>,</span>,
  <span key="j4">  <span className="dark:text-sky-300 text-sky-600">"choices"</span>: [{'{'}</span>,
  <span key="j5">    <span className="dark:text-sky-300 text-sky-600">"delta"</span>: {'{'}<span className="dark:text-sky-300 text-sky-600">"content"</span>: <span className="dark:text-amber-200 text-amber-700">"Hello! I am OortAPI..."</span>{'}'},</span>,
  <span key="j6">    <span className="dark:text-sky-300 text-sky-600">"index"</span>: <span className="dark:text-emerald-300 text-emerald-600">0</span></span>,
  <span key="j7">  {'}]'}</span>,
  <span key="j8">{'}'}</span>,
];

// ─── TerminalMock (inline) ─────────────────────────────────

function TerminalMock() {
  const [displayChars, setDisplayChars] = useState("");
  const [streamed, setStreamed] = useState<ReactNode[]>([]);
  const [phase, setPhase] = useState(0);
  const [loopKey, setLoopKey] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearAll = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  useEffect(() => {
    setDisplayChars("");
    setStreamed([]);
    setPhase(1);

    const pending: ReturnType<typeof setTimeout>[] = [];
    const schedule = (fn: () => void, ms: number) => {
      const id = setTimeout(fn, ms);
      pending.push(id);
      return id;
    };

    // ── Phase 1: type curl command char by char (0s → ~3s) ──
    for (let i = 0; i < CURL_CMD.length; i++) {
      schedule(() => {
        setDisplayChars(prev => prev + CURL_CMD[i]);
      }, i * 57);
    }

    // ── Phase 2: type auth header (~3s → ~4s) ──
    const p2Start = CURL_CMD.length * 57 + 50;
    for (let i = 0; i < AUTH_HEADER.length; i++) {
      schedule(() => {
        setDisplayChars(prev => prev + AUTH_HEADER[i]);
      }, p2Start + i * 20);
    }

    // ── Phase 3: stream colour-coded JSON (~4s → ~8s) ──
    const p3Start = p2Start + AUTH_HEADER.length * 20 + 100;
    for (let i = 0; i < JSON_LINES.length; i++) {
      schedule(() => {
        setPhase(3);
        setStreamed(prev => [...prev, JSON_LINES[i]]);
      }, p3Start + i * 420);
    }

    // ── Phase 4: cursor blink then restart (~8s → ~11s) ──
    const p4Start = p3Start + JSON_LINES.length * 420 + 200;
    schedule(() => setPhase(4), p4Start);
    schedule(() => {
      clearAll();
      setLoopKey(k => k + 1);
    }, p4Start + 3000);

    timers.current = pending;

    return () => {
      pending.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loopKey]);

  return (
    <div className="h-[450px] dark:bg-zinc-900 bg-white/90 backdrop-blur-xl flex flex-col overflow-hidden rounded-xl border dark:border-zinc-700/60 border-zinc-200 dark:shadow-[0_0_60px_rgba(0,212,255,0.07)] shadow-2xl">
      {/* macOS-style title bar */}
      <div className="flex items-center justify-between px-4 py-2.5 dark:bg-black/30 bg-zinc-100 border-b dark:border-zinc-700/40 border-zinc-200 shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full dark:bg-red-500/80 bg-red-400" />
          <span className="w-3 h-3 rounded-full dark:bg-yellow-500/80 bg-yellow-400" />
          <span className="w-3 h-3 rounded-full dark:bg-green-500/80 bg-green-400" />
        </div>
        <span className="text-[11px] font-mono dark:text-zinc-400 text-zinc-500 tracking-wide">api-playground.sh</span>
        <div className="w-14" />
      </div>

      {/* Terminal output */}
      <pre className="flex-1 p-4 text-xs font-mono leading-relaxed overflow-y-auto scrollbar-hide dark:text-zinc-200 text-zinc-800 whitespace-pre-wrap m-0">
        <span className="dark:text-zinc-400 text-zinc-500">~</span>
        {displayChars}
        {(phase === 1 || phase === 2) && (
          <span className="animate-pulse dark:text-white text-black">█</span>
        )}
        {phase >= 3 && streamed.length > 0 && (
          <>
            {"\n\n"}
            {streamed.map((line, i) => (
              <div key={i} className="leading-6">{line}</div>
            ))}
          </>
        )}
        {phase === 4 && (
          <span className="ml-0.5 animate-pulse dark:text-white text-black">█</span>
        )}
      </pre>
    </div>
  );
}

// ─── Hero ───────────────────────────────────────────────────

export function Hero() {
  const { lang } = useI18n();
  const { user } = useAuth();
  const { data: stats } = useSWR<StatsData>("/api/stats", {
    ...dashboardSWRConfig,
    refreshInterval: 60000,
  });
  const calls = useCountUp(stats?.totalCalls || 0);
  const models = useCountUp(stats?.totalModels || 0);
  const [baseUrl, setBaseUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setBaseUrl(window.location.origin);
    }
  }, []);

  const curlCmd = `curl ${baseUrl}/api/v1/chat/completions \\\n  -H "Authorization: Bearer sk-oort-xxxxxxxxxxxx" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "model": "gpt-4o",\n    "messages": [{"role": "user", "content": "Hello!"}]\n  }'`;

  const handleCopy = () => {
    navigator.clipboard.writeText(curlCmd).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <section id="hero-section" className="relative overflow-hidden">
      {/* Radial glow */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-full max-w-[900px] h-[600px] bg-gradient-to-r from-primary/[0.04] via-primary/[0.06] to-transparent rounded-full blur-[120px] pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 py-16 lg:py-20 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* ═══ Left Column ═══ */}
          <div className="lg:col-span-6 text-left min-w-0">
            {/* Main heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tighter text-foreground leading-none mb-6 font-sans">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-400">
                {lang === "zh" ? "一个 API 接入所有 AI 模型" : "One API for All AI Models"}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-muted-foreground mb-6 max-w-xl leading-relaxed">
              {lang === "zh"
                ? "通过统一端点接入 30+ AI 服务商。兼容 OpenAI 标准格式、智能路由、精细计费。"
                : "Connect 30+ AI providers through a single endpoint. OpenAI-compatible, smart routing, fine-grained billing."}
            </p>

            {/* Copy cURL capsule */}
            <div className="flex items-center gap-3 mb-8">
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted border border-border text-xs font-mono text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-all duration-300 max-w-full"
              >
                <code className="truncate max-w-[260px] sm:max-w-[340px]">
                  curl {baseUrl}/api/v1/chat/completions -H "Authorization: Bearer sk-oort-..."
                </code>
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                ) : (
                  <Copy className="h-3.5 w-3.5 shrink-0" />
                )}
              </button>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row items-start gap-3 mb-10">
              {user ? (
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium px-8 h-11 text-sm rounded-lg tracking-wider"
                  >
                    <Terminal className="h-4 w-4 mr-2" />
                    {lang === "zh" ? "前往控制台" : "Dashboard"}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              ) : (
                <Link href="/register">
                  <Button
                    size="lg"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium px-8 h-11 text-sm rounded-lg tracking-wider"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    {lang === "zh" ? "免费开始" : "Get Started"}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              )}
              <Link href="/docs">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-border text-foreground hover:bg-secondary px-8 h-11 text-sm rounded-lg tracking-wider"
                >
                  <Terminal className="h-4 w-4 mr-2" />
                  {lang === "zh" ? "API 文档" : "Docs"}
                </Button>
              </Link>
            </div>

            {/* Compact stats dashboard */}
            <div className="pt-8 border-t border-border grid grid-cols-2 gap-4">
              <div>
                <div className="font-mono-force tabular-nums text-2xl font-bold text-foreground tracking-tight">
                  {formatCompact(calls)}+
                </div>
                <div className="text-[10px] tracking-wider text-muted-foreground uppercase">
                  {lang === "zh" ? "总调用量" : "Total Calls"}
                </div>
              </div>
              <div>
                <div className="font-mono-force tabular-nums text-2xl font-bold text-foreground tracking-tight">
                  {formatCompact(models)}+
                </div>
                <div className="text-[10px] tracking-wider text-muted-foreground uppercase">
                  {lang === "zh" ? "在线模型" : "Models"}
                </div>
              </div>
              <div>
                <div className="font-mono-force tabular-nums text-2xl font-bold text-foreground tracking-tight">
                  {stats?.avgLatency || "<200ms"}
                </div>
                <div className="text-[10px] tracking-wider text-muted-foreground uppercase">
                  {lang === "zh" ? "平均延迟" : "Latency"}
                </div>
              </div>
              <div>
                <div className="font-mono-force tabular-nums text-2xl font-bold text-foreground tracking-tight">
                  {stats?.uptime || "99.9%"}
                </div>
                <div className="text-[10px] tracking-wider text-muted-foreground uppercase">
                  {lang === "zh" ? "可用率" : "Uptime"}
                </div>
              </div>
            </div>
          </div>

          {/* ═══ Right Column ═══ */}
          <div className="lg:col-span-6 w-full max-w-2xl mx-auto lg:mx-0">
            <TerminalMock />
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="mt-16 animate-bounce text-center" aria-hidden="true">
          <div
            className="h-5 w-5 text-muted-foreground/30 mx-auto"
            style={{ clipPath: "polygon(50% 100%, 0 0, 100% 0)" }}
          />
        </div>
      </div>
    </section>
  );
}
