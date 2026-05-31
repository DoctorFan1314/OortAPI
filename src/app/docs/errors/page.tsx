"use client";

import { useI18n } from "@/contexts/i18n-context";
import { CodeBlock } from "@/components/docs/code-block";
import { AlertTriangle, ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const openaiError = `{
  "error": {
    "message": "Incorrect API key provided",
    "type": "authentication_error",
    "param": null,
    "code": "invalid_api_key"
  }
}`;

const anthropicError = `{
  "type": "error",
  "error": {
    "type": "authentication_error",
    "message": "Invalid API Key"
  }
}`;

const errorRow =
  "grid grid-cols-[5rem_1fr] gap-4 px-5 py-3.5 border-b border-border/20 last:border-b-0";

const statusColors: Record<string, string> = {
  "400": "text-orange-400",
  "401": "text-red-400",
  "402": "text-yellow-400",
  "429": "text-rose-400",
  "500": "text-red-500",
  "502": "text-amber-400",
  "503": "text-orange-500",
};

const errorCodes = ["400", "401", "402", "429", "500", "502", "503"];

const TROUBLESHOOTING: Record<string, { en: { causes: string[]; fixes: string[] }; zh: { causes: string[]; fixes: string[] } }> = {
  "400": {
    en: {
      causes: ["Malformed JSON in request body", "Missing required parameters (model, messages)", "Invalid parameter values (e.g., temperature > 2)"],
      fixes: ["Validate JSON syntax before sending", "Check the API spec for required fields", "Ensure parameter types match the spec (string vs number)"],
    },
    zh: {
      causes: ["请求体 JSON 格式错误", "缺少必填参数（model、messages）", "参数值无效（如 temperature > 2）"],
      fixes: ["发送前验证 JSON 语法", "检查 API 规范中的必填字段", "确保参数类型与规范匹配"],
    },
  },
  "401": {
    en: {
      causes: ["API Key not provided in header", "API Key is invalid or has been deleted", "Using wrong auth header format"],
      fixes: ["Include `Authorization: Bearer sk-oort-xxx` header", "Verify the key exists in Dashboard → API Keys", "For Anthropic endpoints, use `x-api-key` header"],
    },
    zh: {
      causes: ["请求头中未提供 API Key", "API Key 无效或已被删除", "使用了错误的认证头格式"],
      fixes: ["在请求头中添加 `Authorization: Bearer sk-oort-xxx`", "在控制台 → API Keys 中确认 Key 存在", "Anthropic 端点使用 `x-api-key` 请求头"],
    },
  },
  "402": {
    en: {
      causes: ["Account balance is zero or negative", "Model requires higher balance than available"],
      fixes: ["Top up in Dashboard → Billing", "Check model pricing in the model marketplace", "Use a cheaper model if needed"],
    },
    zh: {
      causes: ["账户余额为零或负数", "模型所需余额超过当前余额"],
      fixes: ["在控制台 → 充值中心充值", "在模型市场查看模型价格", "必要时使用更便宜的模型"],
    },
  },
  "429": {
    en: {
      causes: ["Request rate exceeds the key's RPM limit", "Too many concurrent requests", "Burst traffic from automated scripts"],
      fixes: ["Implement exponential backoff retry", "Monitor `X-RateLimit-Remaining` header", "Increase rate limit in Dashboard → API Keys", "Add request queuing in your application"],
    },
    zh: {
      causes: ["请求频率超过 Key 的 RPM 限制", "并发请求过多", "自动化脚本突发流量"],
      fixes: ["实现指数退避重试", "监控 `X-RateLimit-Remaining` 响应头", "在控制台 → API Keys 中提高速率限制", "在应用中添加请求队列"],
    },
  },
  "500": {
    en: {
      causes: ["Internal server error in the relay", "Unexpected model response format", "Database connection issue"],
      fixes: ["Retry after a few seconds", "Check the model's status page", "Contact support if persistent"],
    },
    zh: {
      causes: ["中继服务内部错误", "模型响应格式异常", "数据库连接问题"],
      fixes: ["等待几秒后重试", "检查模型状态页面", "如持续出现请联系支持"],
    },
  },
  "502": {
    en: {
      causes: ["Upstream model provider is down", "Network timeout to upstream", "Upstream returned invalid response"],
      fixes: ["Retry with backoff", "Try a different model", "Check provider status (OpenAI, Anthropic, etc.)"],
    },
    zh: {
      causes: ["上游模型提供商宕机", "上游网络超时", "上游返回无效响应"],
      fixes: ["使用退避策略重试", "尝试其他模型", "检查提供商状态（OpenAI、Anthropic 等）"],
    },
  },
  "503": {
    en: {
      causes: ["Service is under maintenance", "All channels for the model are unavailable", "System overload"],
      fixes: ["Retry after a few minutes", "Try a different model", "Check system status page"],
    },
    zh: {
      causes: ["服务正在维护", "该模型的所有通道不可用", "系统过载"],
      fixes: ["等待几分钟后重试", "尝试其他模型", "检查系统状态页面"],
    },
  },
};

function TroubleshootingSection({ code, lang }: { code: string; lang: string }) {
  const [open, setOpen] = useState(false);
  const data = TROUBLESHOOTING[code]?.[lang as "en" | "zh"] || TROUBLESHOOTING[code]?.en;
  if (!data) return null;

  return (
    <div className="border-t border-border/10">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-5 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        {lang === "zh" ? "故障排除" : "Troubleshooting"}
        <ChevronDown className={cn("h-3 w-3 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="px-5 pb-4 space-y-3">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              {lang === "zh" ? "常见原因" : "Common Causes"}
            </p>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
              {data.causes.map((c, i) => <li key={i}>{c}</li>)}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              {lang === "zh" ? "解决方案" : "Solutions"}
            </p>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
              {data.fixes.map((f, i) => <li key={i}>{f}</li>)}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

const retryExample = `import time
import requests

def api_call_with_retry(url, headers, data, max_retries=3):
    for attempt in range(max_retries):
        resp = requests.post(url, headers=headers, json=data)
        if resp.status_code in (429, 500, 502, 503):
            wait = 2 ** attempt  # Exponential backoff: 1s, 2s, 4s
            time.sleep(wait)
            continue
        return resp
    raise Exception("Max retries exceeded")`;

const retryExampleNode = `async function apiCallWithRetry(url, options, maxRetries = 5) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const resp = await fetch(url, options);
    if (resp.status === 429) {
      const wait = Math.min(Math.pow(2, attempt) * 1000, 30000);
      await new Promise(r => setTimeout(r, wait));
      continue;
    }
    if (!resp.ok) throw new Error(\`API error: \${resp.status}\`);
    return resp;
  }
  throw new Error("Max retries exceeded");
}`;

export default function ErrorsPage() {
  const { t, lang } = useI18n();
  const L = t.apiDocs;

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">{L.errorCodes}</h1>
        <p className="text-muted-foreground">{L.errorsDesc}</p>
      </div>

      {/* Error code table with troubleshooting */}
      <div className="rounded-xl border border-border/50 overflow-hidden">
        <div className="grid grid-cols-[5rem_1fr] gap-4 px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/20 bg-muted/10">
          <span>Code</span>
          <span>Description</span>
        </div>
        {errorCodes.map(code => {
          const labelKey = `error${code}` as keyof typeof L;
          const descKey = `error${code}Desc` as keyof typeof L;
          const label = L[labelKey] || code;
          const desc = L[descKey] || "";
          return (
            <div key={code}>
              <div className={errorRow}>
                <span className={`font-mono text-sm font-bold ${statusColors[code] || ""}`}>
                  {code}
                </span>
                <div>
                  <span className="text-sm font-medium">{label}</span>
                  <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                </div>
              </div>
              <TroubleshootingSection code={code} lang={lang} />
            </div>
          );
        })}
      </div>

      {/* Retry Strategy */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          {lang === "zh" ? "通用重试策略" : "General Retry Strategy"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {lang === "zh"
            ? "对于 429、500、502、503 错误，建议使用指数退避重试。以下是一个简单的 Python 示例："
            : "For 429, 500, 502, and 503 errors, use exponential backoff retry. Here's a simple Python example:"}
        </p>
        <CodeBlock code={retryExample} language="python" />
        <p className="text-sm text-muted-foreground mt-4">
          {lang === "zh"
            ? "Node.js 示例："
            : "Node.js example:"}
        </p>
        <CodeBlock code={retryExampleNode} language="javascript" />
      </section>

      {/* Error format comparison */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* OpenAI format */}
        <div className="rounded-xl border border-sky-500/20 overflow-hidden">
          <div className="bg-sky-500/5 px-5 py-3 border-b border-sky-500/10">
            <h2 className="text-sm font-semibold text-sky-400">{L.openaiErrorFormat}</h2>
          </div>
          <div className="p-4">
            <CodeBlock code={openaiError} />
          </div>
        </div>

        {/* Anthropic format */}
        <div className="rounded-xl border border-amber-500/20 overflow-hidden">
          <div className="bg-amber-500/5 px-5 py-3 border-b border-amber-500/10">
            <h2 className="text-sm font-semibold text-amber-400">{L.anthropicErrorFormat}</h2>
          </div>
          <div className="p-4">
            <CodeBlock code={anthropicError} />
          </div>
        </div>
      </div>
    </div>
  );
}
