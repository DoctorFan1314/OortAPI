"use client";

import { useI18n } from "@/contexts/i18n-context";
import { CodeBlock } from "@/components/docs/code-block";
import { Gauge, AlertTriangle } from "lucide-react";

export default function RateLimitsPage() {
  const { lang } = useI18n();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Gauge className="h-6 w-6" />
        {lang === "zh" ? "速率限制" : "Rate Limits"}
      </h1>

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

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">{lang === "zh" ? "超限处理" : "Rate Limit Response"}</h2>
        <p className="text-sm text-muted-foreground">
          {lang === "zh"
            ? "当请求频率超过限制时，API 返回 429 状态码："
            : "When the rate limit is exceeded, the API returns HTTP 429:"}
        </p>
        <CodeBlock code={`HTTP/1.1 429 Too Many Requests
Content-Type: application/json

{
  "error": {
    "message": "Rate limit exceeded. Please try again later.",
    "type": "rate_limit_error"
  }
}`} />
        <p className="text-sm text-muted-foreground">
          {lang === "zh"
            ? "所有 API 响应头中会包含当前限流状态："
            : "All API responses include rate limit headers:"}
        </p>
        <CodeBlock code={`X-RateLimit-Limit: 60
X-RateLimit-Remaining: 42
X-RateLimit-Reset: 1700000000`} />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">{lang === "zh" ? "建议的重试策略" : "Recommended Retry Strategy"}</h2>

        <h3 className="text-sm font-medium text-muted-foreground">Python</h3>
        <CodeBlock code={`import time
import requests

def api_call_with_retry(url, headers, data, max_retries=3):
    for i in range(max_retries):
        resp = requests.post(url, headers=headers, json=data)
        if resp.status_code == 429:
            wait = int(resp.headers.get("X-RateLimit-Reset", time.time() + 5)) - time.time()
            wait = max(wait, 1)
            time.sleep(min(wait, 30))
            continue
        return resp
    raise Exception("Max retries exceeded")`} />

        <h3 className="text-sm font-medium text-muted-foreground">Node.js</h3>
        <CodeBlock code={`async function apiCallWithRetry(url, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    const resp = await fetch(url, options);
    if (resp.status === 429) {
      const reset = parseInt(resp.headers.get("X-RateLimit-Reset") || String(Date.now()/1000 + 5));
      const wait = Math.max(reset - Date.now()/1000, 1) * 1000;
      await new Promise(r => setTimeout(r, Math.min(wait, 30000)));
      continue;
    }
    return resp;
  }
  throw new Error("Max retries exceeded");
}`} />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          {lang === "zh" ? "最佳实践" : "Best Practices"}
        </h2>
        <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-5">
          <li>{lang === "zh" ? "使用指数退避（Exponential Backoff）重试 429 响应" : "Use exponential backoff when retrying 429 responses"}</li>
          <li>{lang === "zh" ? "监控 X-RateLimit-Remaining 头，在接近 0 时降低请求频率" : "Monitor X-RateLimit-Remaining header and slow down when approaching 0"}</li>
          <li>{lang === "zh" ? "在控制台适当提高高频使用 Key 的速率限制" : "Increase rate limits for high-frequency keys in the dashboard"}</li>
          <li>{lang === "zh" ? "流式请求（stream: true）也计入速率限制" : "Streaming requests (stream: true) also count toward rate limits"}</li>
        </ul>
      </section>
    </div>
  );
}
