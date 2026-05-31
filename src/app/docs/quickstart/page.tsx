"use client";

import Link from "next/link";
import { useI18n } from "@/contexts/i18n-context";
import { BaseUrlDisplay } from "@/components/docs/base-url-display";
import { CodeBlock } from "@/components/docs/code-block";
import { CrossLinks } from "@/components/docs/cross-links";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bot, Sparkles, Globe, MessageSquare, Cpu, Terminal, AlertTriangle, CheckCircle } from "lucide-react";

interface AppCard {
  name: string;
  icon: typeof Bot;
  descKey: string;
  config: string;
  isAnthropic?: boolean;
}

const APPS: AppCard[] = [
  {
    name: "ChatBox",
    icon: Bot,
    descKey: "chatboxDesc",
    config: `Base URL: https://your-domain.com/api/v1\nAPI Key: sk-oort-xxx\nModel: gpt-4o`,
  },
  {
    name: "Cherry Studio",
    icon: Sparkles,
    descKey: "cherryDesc",
    config: `Base URL: https://your-domain.com/api/v1\nAPI Key: sk-oort-xxx\nModel: gpt-4o`,
  },
  {
    name: "Open WebUI",
    icon: Globe,
    descKey: "openwebuiDesc",
    config: `Base URL: https://your-domain.com/api/v1\nAPI Key: sk-oort-xxx`,
  },
  {
    name: "NextChat",
    icon: MessageSquare,
    descKey: "nextchatDesc",
    config: `Base URL: https://your-domain.com/api/v1\nAPI Key: sk-oort-xxx`,
  },
  {
    name: "LobeChat",
    icon: Cpu,
    descKey: "lobechatDesc",
    config: `Base URL: https://your-domain.com/api/v1\nAPI Key: sk-oort-xxx`,
  },
  {
    name: "Claude Code",
    icon: Terminal,
    descKey: "claudeCodeDesc",
    isAnthropic: true,
    config: `ANTHROPIC_BASE_URL=https://your-domain.com/api\nANTHROPIC_API_KEY=sk-oort-xxx`,
  },
];

const APP_DESC: Record<string, { en: string; zh: string }> = {
  chatboxDesc: { en: "Desktop AI chat client with multi-model support", zh: "桌面 AI 聊天客户端，支持多模型切换" },
  cherryDesc: { en: "Multi-platform AI assistant with rich features", zh: "跨平台 AI 助手，功能丰富" },
  openwebuiDesc: { en: "Self-hosted web interface for AI chat", zh: "自托管 Web AI 聊天界面" },
  nextchatDesc: { en: "Cross-platform ChatGPT UI with sync", zh: "跨平台 ChatGPT 界面，支持云同步" },
  lobechatDesc: { en: "Modern AI chat framework with plugin system", zh: "现代化 AI 聊天框架，支持插件系统" },
  claudeCodeDesc: { en: "CLI coding agent by Anthropic", zh: "Anthropic 官方 CLI 编程工具" },
};

export default function QuickStartPage() {
  const { lang, t } = useI18n();
  const L = t.apiDocs;

  const responseExample = `{
  "id": "chatcmpl-xxx",
  "object": "chat.completion",
  "model": "gpt-4o",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Hello! How can I help you today?"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 12,
    "completion_tokens": 9,
    "total_tokens": 21
  }
}`;

  const errorExample = `import openai

client = openai.OpenAI(
    base_url="https://your-domain.com/api/v1",
    api_key="sk-oort-your-key"
)

try:
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": "Hello!"}]
    )
    print(response.choices[0].message.content)
except openai.AuthenticationError:
    print("Invalid API key — check Dashboard → API Keys")
except openai.RateLimitError:
    print("Rate limited — retry with backoff")
except openai.APIError as e:
    print(f"API error: {e.status_code}")`;

  return (
    <div className="space-y-10">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold">
          {lang === "zh" ? "快速开始" : "Quick Start"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {lang === "zh"
            ? "3 分钟内发送你的第一个 API 请求"
            : "Send your first API request in under 3 minutes"}
        </p>
      </div>

      {/* Steps with connector line */}
      <div className="space-y-8">
          {/* Step 1: Get API Key */}
          <section className="space-y-3 relative">
            {/* Connector line to step 2 */}
            <div className="absolute left-[13px] top-10 bottom-[-2rem] w-px bg-primary/15 hidden sm:block" />
            <h2 className="text-lg font-bold flex items-center gap-3">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0 relative z-10 bg-[var(--background)]">
                1
              </span>
              {L.step1Title}
            </h2>
            <p className="text-sm text-muted-foreground relative z-10">
              {L.step1Desc}{" "}
              <Link href="/dashboard/keys" className="text-primary hover:underline font-medium">
                {L.step1Mid}
              </Link>{" "}
              {L.step1End}
            </p>
            <p className="text-sm text-muted-foreground relative z-10">
              {lang === "zh"
                ? "你的 API Key 以 "
                : "Your API Key starts with "}
              <code className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono text-foreground">
                sk-oort-
              </code>
              {lang === "zh" ? " 开头，请妥善保管。" : " — save it securely."}
            </p>
          </section>

          {/* Step 2: Configure Base URL */}
          <section className="space-y-3 relative">
            {/* Connector line to step 3 */}
            <div className="absolute left-[13px] top-10 bottom-[-2rem] w-px bg-primary/15 hidden sm:block" />
            <h2 className="text-lg font-bold flex items-center gap-3">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0 relative z-10 bg-[var(--background)]">
                2
              </span>
              {L.step2Title}
            </h2>
            <p className="text-sm text-muted-foreground">{L.step2Desc}</p>
            <BaseUrlDisplay />

            {/* Tip block */}
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 text-sm space-y-1.5">
              <p className="font-medium text-amber-600 dark:text-amber-400 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                {L.tip}
              </p>
              <p className="text-muted-foreground">
                {L.tipOai} <strong>{L.tipOaiBold}</strong>. {L.tipAnt} {L.tipAntDesc} {L.tipEnd}
              </p>
              <p className="text-muted-foreground">{L.tipSameKey}</p>
            </div>
          </section>

          {/* Step 3: Start Using */}
          <section className="space-y-3 relative">
            <h2 className="text-lg font-bold flex items-center gap-3">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0 relative z-10">
                3
              </span>
              {L.step3Title}
            </h2>
            <p className="text-sm text-muted-foreground">{L.step3Desc}</p>
            <div className="mt-4">
              <CodeBlock examples={[
                { label: "cURL", code: `curl ${process.env.NEXT_PUBLIC_SITE_URL || "https://api.oortapi.com"}/api/v1/chat/completions \\\n  -H "Content-Type: application/json" \\\n  -H "Authorization: Bearer sk-oort-your-key" \\\n  -d '{\n    "model": "gpt-4o",\n    "messages": [{"role": "user", "content": "Hello!"}]\n  }'` },
                { label: "Python", code: `import openai\nclient = openai.OpenAI(\n  base_url="${process.env.NEXT_PUBLIC_SITE_URL || "https://api.oortapi.com"}/api/v1",\n  api_key="sk-oort-your-key"\n)\nresponse = client.chat.completions.create(\n  model="gpt-4o",\n  messages=[{"role": "user", "content": "Hello!"}]\n)\nprint(response.choices[0].message.content)` },
                { label: "Node.js", code: `import OpenAI from "openai";\nconst client = new OpenAI({\n  baseURL: "${process.env.NEXT_PUBLIC_SITE_URL || "https://api.oortapi.com"}/api/v1",\n  apiKey: "sk-oort-your-key",\n});\nconst response = await client.chat.completions.create({\n  model: "gpt-4o",\n  messages: [{ role: "user", content: "Hello!" }],\n});\nconsole.log(response.choices[0].message.content);` },
              ]} />
            </div>
          </section>
      </div>

      {/* Success Response */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-emerald-500" />
          {lang === "zh" ? "成功响应示例" : "Success Response Example"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {lang === "zh"
            ? "正常情况下，API 返回如下 JSON 响应："
            : "On success, the API returns the following JSON:"}
        </p>
        <CodeBlock code={responseExample} language="json" />
      </section>

      {/* Error Handling */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          {lang === "zh" ? "错误处理" : "Error Handling"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {lang === "zh"
            ? "建议在代码中添加异常处理，以应对认证失败、速率限制等情况："
            : "Add exception handling for authentication failures, rate limits, and other errors:"}
        </p>
        <CodeBlock code={errorExample} language="python" />
      </section>

      {/* AI App Integration */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold">{L.appsTitle}</h2>
        <p className="text-sm text-muted-foreground">{L.appsDesc}</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {APPS.map((app) => {
            const desc =
              APP_DESC[app.descKey]?.[lang as "en" | "zh"] ||
              APP_DESC[app.descKey]?.en ||
              "";
            const Icon = app.icon;
            return (
              <Card key={app.name} className="glass-card">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm">{app.name}</CardTitle>
                    {app.isAnthropic && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 font-medium">
                        Anthropic
                      </span>
                    )}
                  </div>
                  <CardDescription className="text-xs">{desc}</CardDescription>
                </CardHeader>
                <CardContent>
                  <CodeBlock code={app.config} />
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Cross Links */}
      <CrossLinks links={[
        { title: lang === "zh" ? "SDK 集成" : "SDK Integration", href: "/docs/sdk", description: lang === "zh" ? "使用 Python/Node.js SDK 接入" : "Use Python/Node.js SDKs" },
        { title: lang === "zh" ? "认证方式" : "Authentication", href: "/docs/authentication", description: lang === "zh" ? "了解 OpenAI 和 Anthropic 认证" : "Learn about auth methods" },
        { title: lang === "zh" ? "常见问题" : "FAQ", href: "/docs/faq", description: lang === "zh" ? "查看常见问题解答" : "Common questions answered" },
      ]} />
    </div>
  );
}
