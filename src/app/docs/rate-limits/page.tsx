"use client";

import { useI18n } from "@/contexts/i18n-context";
import { CodeBlock } from "@/components/docs/code-block";
import { Gauge, AlertTriangle, Info, Coins } from "lucide-react";

const TIER_TABLE = [
  { tier: "Default", rpm: "60", note: "All new keys" },
  { tier: "Standard", rpm: "200", note: "Verified users" },
  { tier: "Pro", rpm: "1,000", note: "Subscription plans" },
  { tier: "Enterprise", rpm: "10,000", note: "Custom agreement" },
];

export default function RateLimitsPage() {
  const { lang } = useI18n();

  const pythonRetry = `import time
import requests

def api_call_with_retry(url, headers, data, max_retries=5):
    for attempt in range(max_retries):
        resp = requests.post(url, headers=headers, json=data)
        if resp.status_code == 429:
            # Exponential backoff: 1s, 2s, 4s, 8s, 16s
            wait = min(2 ** attempt, 30)
            remaining = resp.headers.get("X-RateLimit-Reset")
            if remaining:
                import time as t
                wait_from_header = max(int(remaining) - int(t.time()), 1)
                wait = min(wait_from_header, 30)
            time.sleep(wait)
            continue
        return resp
    raise Exception("Max retries exceeded")`;

  const nodeRetry = `async function apiCallWithRetry(url, options, maxRetries = 5) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const resp = await fetch(url, options);
    if (resp.status === 429) {
      // Exponential backoff: 1s, 2s, 4s, 8s, 16s
      let wait = Math.min(Math.pow(2, attempt) * 1000, 30000);
      const resetHeader = resp.headers.get("X-RateLimit-Reset");
      if (resetHeader) {
        const waitFromHeader = (parseInt(resetHeader) - Date.now() / 1000) * 1000;
        wait = Math.min(Math.max(waitFromHeader, 1000), 30000);
      }
      await new Promise(r => setTimeout(r, wait));
      continue;
    }
    return resp;
  }
  throw new Error("Max retries exceeded");
}`;

  const checkHeaders = `curl -I https://your-domain.com/api/v1/chat/completions \\
  -H "Authorization: Bearer sk-oort-your-key"

# Response headers:
# X-RateLimit-Limit: 60
# X-RateLimit-Remaining: 42
# X-RateLimit-Reset: 1700000000
# X-RateLimit-Tokens-Remaining: 150000
# X-RateLimit-Tokens-Reset: 1700000000`;

  const tpmExample = `curl https://your-domain.com/api/v1/chat/completions \\
  -H "Authorization: Bearer sk-oort-your-key" \\
  -H "Content-Type: application/json" \\
  -d '{"model":"gpt-4o","messages":[{"role":"user","content":"Hello"}]}'

# Response headers:
# X-RateLimit-Tokens-Remaining: 148500
# X-RateLimit-Tokens-Reset: 1700000060`;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Gauge className="h-6 w-6" />
          {lang === "zh" ? "速率限制" : "Rate Limits"}
        </h1>
        <p className="text-muted-foreground mt-2">
          {lang === "zh"
            ? "速率限制保护服务稳定性和公平使用。每个 API Key 有独立的请求频率限制。"
            : "Rate limits protect service stability and fair usage. Each API Key has its own request frequency limit."}
        </p>
      </div>

      {/* Default Limits */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">{lang === "zh" ? "默认限制" : "Default Limits"}</h2>
        <div className="rounded-lg border border-border/50 p-4 text-sm space-y-2">
          <p className="text-muted-foreground">
            {lang === "zh"
              ? "每个 API Key 默认每分钟最多 60 次请求（60 RPM）。你可以在控制台 API Keys 页面为每个 Key 单独调整限制（1-10000 RPM）。"
              : "Each API Key has a default limit of 60 requests per minute (60 RPM). You can adjust this per key in Dashboard → API Keys (1-10000 RPM)."}
          </p>
        </div>
      </section>

      {/* TPM (Tokens Per Minute) */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Coins className="h-4 w-4 text-amber-500" />
          {lang === "zh" ? "TPM（每分钟 Token 数）" : "TPM (Tokens Per Minute)"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {lang === "zh"
            ? "除了 RPM 限制，部分模型还有每分钟 Token 数（TPM）限制。TPM 统计 1 分钟窗口内所有请求的总 Token 数（输入 + 输出）。"
            : "In addition to RPM, some models have token-per-minute (TPM) limits. TPM counts total tokens (input + output) across all requests in a 1-minute window."}
        </p>
        <ul className="text-sm text-muted-foreground space-y-2.5 list-none pl-0">
          {[
            lang === "zh"
              ? "当 TPM 超限时，API 返回 429 并提示 Token 限制信息"
              : "When TPM is exceeded, the API returns 429 with a message about token limits",
            lang === "zh"
              ? "检查 X-RateLimit-Tokens-Remaining 和 X-RateLimit-Tokens-Reset 响应头"
              : "Check X-RateLimit-Tokens-Remaining and X-RateLimit-Tokens-Reset headers",
            lang === "zh"
              ? "TPM 使用量较高时，使用流式输出（streaming）以在完整响应生成前开始获取输出 Token"
              : "High TPM usage: use streaming to start getting output tokens before the full response is generated",
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
        <CodeBlock code={tpmExample} language="bash" />
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { header: "X-RateLimit-Tokens-Remaining", desc: lang === "zh" ? "剩余可用 Token 数" : "Remaining tokens available" },
            { header: "X-RateLimit-Tokens-Reset", desc: lang === "zh" ? "Token 限制重置时间（Unix 时间戳）" : "Token limit reset time (Unix timestamp)" },
          ].map((item) => (
            <div key={item.header} className="rounded-lg border border-border/30 p-3">
              <code className="text-xs font-mono text-primary">{item.header}</code>
              <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tier Comparison */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">{lang === "zh" ? "限流等级" : "Rate Limit Tiers"}</h2>
        <div className="rounded-xl border border-border/50 overflow-hidden">
          <div className="grid grid-cols-3 gap-4 px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/20 bg-muted/10">
            <span>{lang === "zh" ? "等级" : "Tier"}</span>
            <span>{lang === "zh" ? "请求/分钟" : "Requests/Min"}</span>
            <span>{lang === "zh" ? "说明" : "Notes"}</span>
          </div>
          {TIER_TABLE.map((row) => (
            <div key={row.tier} className="grid grid-cols-3 gap-4 px-5 py-3 border-b border-border/20 last:border-b-0 text-sm">
              <span className="font-medium">{row.tier}</span>
              <span className="font-mono text-primary">{row.rpm} RPM</span>
              <span className="text-muted-foreground text-xs">{row.note}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Check Your Limits */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">{lang === "zh" ? "查看当前限制" : "Check Your Current Limits"}</h2>
        <p className="text-sm text-muted-foreground">
          {lang === "zh"
            ? "所有 API 响应头中会包含当前限流状态。你也可以用 HEAD 请求快速查看："
            : "All API responses include rate limit headers. You can also use a HEAD request to check quickly:"}
        </p>
        <CodeBlock code={checkHeaders} />
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { header: "X-RateLimit-Limit", desc: lang === "zh" ? "当前 Key 的最大请求数" : "Max requests for this key" },
            { header: "X-RateLimit-Remaining", desc: lang === "zh" ? "剩余可用请求数" : "Remaining requests available" },
            { header: "X-RateLimit-Reset", desc: lang === "zh" ? "限制重置时间（Unix 时间戳）" : "Limit reset time (Unix timestamp)" },
          ].map((item) => (
            <div key={item.header} className="rounded-lg border border-border/30 p-3">
              <code className="text-xs font-mono text-primary">{item.header}</code>
              <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Rate Limit Response */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">{lang === "zh" ? "超限响应" : "Rate Limit Response"}</h2>
        <p className="text-sm text-muted-foreground">
          {lang === "zh"
            ? "当请求频率超过限制时，API 返回 429 状态码："
            : "When the rate limit is exceeded, the API returns HTTP 429:"}
        </p>
        <CodeBlock code={`HTTP/1.1 429 Too Many Requests
Content-Type: application/json
Retry-After: 30

{
  "error": {
    "message": "Rate limit exceeded. Please try again later.",
    "type": "rate_limit_error"
  }
}`} />
      </section>

      {/* Retry Strategy */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">{lang === "zh" ? "推荐的重试策略" : "Recommended Retry Strategy"}</h2>
        <p className="text-sm text-muted-foreground">
          {lang === "zh"
            ? "使用指数退避（Exponential Backoff）策略处理 429 响应。以下是完整示例："
            : "Use exponential backoff to handle 429 responses. Here are complete examples:"}
        </p>

        <h3 className="text-sm font-medium text-muted-foreground">Python</h3>
        <CodeBlock code={pythonRetry} language="python" />

        <h3 className="text-sm font-medium text-muted-foreground">Node.js</h3>
        <CodeBlock code={nodeRetry} language="javascript" />
      </section>

      {/* Best Practices */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          {lang === "zh" ? "最佳实践" : "Best Practices"}
        </h2>
        <ul className="text-sm text-muted-foreground space-y-2.5 list-none pl-0">
          {[
            lang === "zh" ? "使用指数退避（Exponential Backoff）重试 429 响应" : "Use exponential backoff when retrying 429 responses",
            lang === "zh" ? "监控 X-RateLimit-Remaining 头，在接近 0 时降低请求频率" : "Monitor X-RateLimit-Remaining header and slow down when approaching 0",
            lang === "zh" ? "在控制台适当提高高频使用 Key 的速率限制" : "Increase rate limits for high-frequency keys in the dashboard",
            lang === "zh" ? "流式请求（stream: true）也计入速率限制" : "Streaming requests (stream: true) also count toward rate limits",
            lang === "zh" ? "使用请求队列避免突发并发超过限制" : "Use a request queue to avoid burst concurrency exceeding limits",
            lang === "zh" ? "不同 Key 的限制独立计算，可按用途分配不同 Key" : "Each key's limit is independent — use separate keys for different purposes",
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* Info box */}
      <div className="rounded-lg border border-sky-500/20 bg-sky-500/5 p-4 text-sm">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 text-sky-500 mt-0.5 shrink-0" />
          <p className="text-muted-foreground">
            {lang === "zh"
              ? "如果你的应用需要更高的速率限制，请联系我们讨论企业级方案。"
              : "If your application needs higher rate limits, contact us to discuss enterprise plans."}
          </p>
        </div>
      </div>
    </div>
  );
}
