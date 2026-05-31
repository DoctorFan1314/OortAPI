"use client";

import { useI18n } from "@/contexts/i18n-context";
import { CodeBlock } from "@/components/docs/code-block";
import { Shield, Eye, FileText, CheckCircle } from "lucide-react";

export default function SecurityPage() {
  const { lang } = useI18n();

  const envExample = `# Environment variable (never commit this)
OPENAI_API_KEY=sk-oort-xxxxxxxxxxxxxxxx

# .env.example (safe to commit — placeholder only)
OPENAI_API_KEY=sk-oort-your-key-here`;

  const requestIdExample = `curl -i https://your-domain.com/api/v1/chat/completions \\
  -H "Authorization: Bearer sk-oort-your-key" \\
  -H "Content-Type: application/json" \\
  -d '{"model":"gpt-4o","messages":[{"role":"user","content":"Hello"}]}'

# Response headers include:
# X-Request-Id: req_a1b2c3d4e5f6
# X-RateLimit-Limit: 60
# X-RateLimit-Remaining: 59`;

  return (
    <div className="space-y-10">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="h-6 w-6" />
          {lang === "zh" ? "安全" : "Security"}
        </h1>
        <p className="text-muted-foreground mt-2">
          {lang === "zh"
            ? "OortAPI 重视安全性和数据隐私。本页介绍安全最佳实践和数据处理方式。"
            : "OortAPI takes security and data privacy seriously. This page covers security best practices and how data is handled."}
        </p>
      </div>

      {/* API Key Security */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Shield className="h-4 w-4 text-emerald-500" />
          {lang === "zh" ? "API Key 安全" : "API Key Security"}
        </h2>
        <ul className="text-sm text-muted-foreground space-y-2.5 list-none pl-0">
          {[
            lang === "zh"
              ? "永远不要将 API Key 提交到版本控制系统"
              : "Never commit API keys to version control",
            lang === "zh"
              ? "使用环境变量存储 Key：OPENAI_API_KEY=sk-oort-xxx"
              : "Use environment variables: OPENAI_API_KEY=sk-oort-xxx",
            lang === "zh"
              ? "定期轮换 Key（控制台 → API Keys → 删除 → 创建）"
              : "Rotate keys periodically (Dashboard → API Keys → Delete → Create)",
            lang === "zh"
              ? "为不同环境使用不同的 Key（dev/staging/prod）"
              : "Use separate keys for different environments (dev/staging/prod)",
            lang === "zh"
              ? "为每个 Key 设置速率限制以缩小影响范围"
              : "Set per-key rate limits to limit blast radius",
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
        <CodeBlock code={envExample} language="bash" />
      </section>

      {/* Data Privacy */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Eye className="h-4 w-4 text-sky-500" />
          {lang === "zh" ? "数据隐私" : "Data Privacy"}
        </h2>
        <ul className="text-sm text-muted-foreground space-y-2.5 list-none pl-0">
          {[
            lang === "zh"
              ? "OortAPI 作为透明中继，不永久存储请求/响应正文"
              : "OortAPI acts as a transparent relay — request/response bodies are not stored permanently",
            lang === "zh"
              ? "使用日志仅记录：时间戳、模型、Token 数、延迟、状态码（不记录消息内容）"
              : "Usage logs record: timestamp, model, token count, latency, status code (NOT message content)",
            lang === "zh"
              ? "你可以在控制台 → 设置中关闭使用日志"
              : "You can disable usage logging in Dashboard → Settings",
            lang === "zh"
              ? "不会使用你的数据进行模型训练"
              : "No data is used for model training",
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-2 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* Request Logging */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="h-4 w-4 text-amber-500" />
          {lang === "zh" ? "请求日志" : "Request Logging"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {lang === "zh"
            ? "每个请求都会获得一个唯一的 X-Request-Id 头用于追踪。在联系技术支持时请提供此 ID。"
            : "Each request gets a unique X-Request-Id header for tracing. Use this ID when contacting support about errors."}
        </p>
        <CodeBlock code={requestIdExample} language="bash" />
        <div className="rounded-lg border border-border/50 p-4 text-sm">
          <p className="text-muted-foreground">
            {lang === "zh"
              ? "服务端日志保留 7 天用于调试。"
              : "Server-side logs are retained for 7 days for debugging."}
          </p>
        </div>
      </section>

      {/* Best Practices */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-violet-500" />
          {lang === "zh" ? "最佳实践" : "Best Practices"}
        </h2>
        <ul className="text-sm text-muted-foreground space-y-2.5 list-none pl-0">
          {[
            lang === "zh"
              ? "所有 API 调用使用 HTTPS（生产环境中继强制 HTTPS）"
              : "Use HTTPS for all API calls (the relay enforces this in production)",
            lang === "zh"
              ? "处理敏感数据时实现请求签名"
              : "Implement request signing if handling sensitive data",
            lang === "zh"
              ? "在控制台 → 使用量中监控 API Key 使用情况，发现异常"
              : "Monitor your API key usage for anomalies in Dashboard → Usage",
            lang === "zh"
              ? "设置 Webhook 通知以接收异常活动提醒（控制台 → Webhooks）"
              : "Set up webhook notifications for unusual activity (Dashboard → Webhooks)",
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-2 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
