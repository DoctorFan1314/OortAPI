"use client";

import { useI18n } from "@/contexts/i18n-context";
import { CodeBlock } from "@/components/docs/code-block";
import { CrossLinks } from "@/components/docs/cross-links";
import {
  Webhook,
  Shield,
  RotateCcw,
  Settings,
  AlertTriangle,
} from "lucide-react";

const payloadExample = `{
  "event": "balance.low",
  "timestamp": "2026-01-15T08:30:00Z",
  "payload": {
    "balance": "2.50",
    "currency": "USD",
    "threshold": "5.00"
  }
}`;

const signatureVerificationNode = `import crypto from "crypto";

function verifyWebhookSignature(payload, signature, secret) {
  const expected = crypto
    .createHmac("sha256", secret)
    .update(payload, "utf8")
    .digest("hex");

  // Compare using timing-safe comparison
  return crypto.timingSafeEqual(
    Buffer.from(signature, "hex"),
    Buffer.from(expected, "hex")
  );
}

// Express.js example
app.post("/webhooks/oortapi", (req, res) => {
  const signature = req.headers["x-webhook-signature"];
  const isValid = verifyWebhookSignature(
    JSON.stringify(req.body),
    signature,
    process.env.WEBHOOK_SECRET
  );

  if (!isValid) {
    return res.status(401).json({ error: "Invalid signature" });
  }

  const { event, payload } = req.body;
  switch (event) {
    case "balance.low":
      console.log("Low balance:", payload.balance);
      break;
    case "subscription.expired":
      console.log("Subscription expired");
      break;
    // Handle other events...
  }

  res.status(200).json({ received: true });
});`;

const signatureVerificationPy = `import hmac
import hashlib
from flask import Flask, request, jsonify

app = Flask(__name__)
WEBHOOK_SECRET = "whsec_your_webhook_secret"

@app.route("/webhooks/oortapi", methods=["POST"])
def handle_webhook():
    signature = request.headers.get("X-Webhook-Signature")
    payload_bytes = request.get_data()

    expected = hmac.new(
        WEBHOOK_SECRET.encode("utf-8"),
        payload_bytes,
        hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(signature, expected):
        return jsonify({"error": "Invalid signature"}), 401

    data = request.get_json()
    event = data["event"]
    payload = data["payload"]

    if event == "balance.low":
        print(f"Low balance: {payload['balance']}")
    elif event == "subscription.expired":
        print("Subscription expired")
    # Handle other events...

    return jsonify({"received": True}), 200`;

const retryDiagram = `Attempt 1  →  Fail  →  Wait 1 min  →
Attempt 2  →  Fail  →  Wait 5 min  →
Attempt 3  →  Fail  →  Mark as failed`;

const endpointExample = `POST https://your-app.com/webhooks/oortapi
Content-Type: application/json
X-Webhook-Signature: a1b2c3d4e5f6...
X-Oortapi-Event: balance.low

{
  "event": "balance.low",
  "timestamp": "2026-01-15T08:30:00Z",
  "payload": { ... }
}`;

export function WebhooksContent() {
  const { lang } = useI18n();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2 flex items-center gap-2">
          <Webhook className="h-6 w-6" />
          {lang === "zh" ? "Webhooks" : "Webhooks"}
        </h1>
        <p className="text-muted-foreground">
          {lang === "zh"
            ? "Webhooks 允许你在特定事件发生时接收 HTTP 回调通知，实现自动化的账户和订阅管理。"
            : "Webhooks allow you to receive HTTP callback notifications when specific events occur, enabling automated account and subscription management."}
        </p>
      </div>

      {/* What are Webhooks */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">
          {lang === "zh" ? "什么是 Webhooks？" : "What are Webhooks?"}
        </h2>
        <div className="rounded-xl border border-border/50 glass-card p-6 space-y-3">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {lang === "zh"
              ? "Webhooks 是一种基于 HTTP 的回调机制。当 OortAPI 中发生你关注的事件时（如余额不足、订阅到期），系统会向你预设的 URL 发送一个 POST 请求，包含事件的详细信息。"
              : "Webhooks are an HTTP-based callback mechanism. When an event you care about occurs in OortAPI (such as low balance or subscription expiry), the system sends a POST request to your pre-configured URL with the event details."}
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {lang === "zh"
              ? "与轮询不同，Webhooks 是实时推送的——你无需反复查询 API 来检查状态变化。"
              : "Unlike polling, webhooks are pushed in real time — you do not need to repeatedly query the API to check for status changes."}
          </p>
        </div>
      </section>

      {/* Supported Events */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">
          {lang === "zh" ? "支持的事件" : "Supported Events"}
        </h2>
        <div className="rounded-xl border border-border/50 overflow-hidden">
          <div className="grid grid-cols-[12rem_1fr] gap-4 px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/20 bg-muted/10">
            <span>{lang === "zh" ? "事件名称" : "Event"}</span>
            <span>{lang === "zh" ? "触发条件" : "Trigger"}</span>
          </div>
          {[
            {
              event: "balance.low",
              descEn: "Account balance falls below the configured threshold",
              descZh: "账户余额低于配置的阈值",
            },
            {
              event: "subscription.created",
              descEn: "A new subscription is created for the account",
              descZh: "账户创建了新的订阅",
            },
            {
              event: "subscription.expired",
              descEn: "An active subscription has expired",
              descZh: "活跃订阅已过期",
            },
            {
              event: "subscription.renewal_failed",
              descEn: "Automatic subscription renewal payment failed",
              descZh: "订阅自动续费支付失败",
            },
            {
              event: "subscription.expiring",
              descEn: "Subscription is approaching its expiration date (sent 3 days before expiry)",
              descZh: "订阅即将到期（到期前 3 天发送）",
            },
          ].map((item) => (
            <div
              key={item.event}
              className="grid grid-cols-[12rem_1fr] gap-4 px-5 py-3.5 border-b border-border/20 last:border-b-0 text-sm"
            >
              <code className="font-mono text-xs text-primary bg-primary/5 px-2 py-0.5 rounded self-start">
                {item.event}
              </code>
              <span className="text-muted-foreground">
                {lang === "zh" ? item.descZh : item.descEn}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Payload Format */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">
          {lang === "zh" ? "请求载荷格式" : "Payload Format"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {lang === "zh"
            ? "所有 Webhook 请求都以 JSON 格式发送，包含以下三个顶层字段："
            : "All webhook requests are sent as JSON with the following top-level fields:"}
        </p>
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            {
              name: "event",
              desc: lang === "zh" ? "事件类型标识符" : "Event type identifier",
            },
            {
              name: "timestamp",
              desc: lang === "zh"
                ? "事件发生的 ISO 8601 时间戳"
                : "ISO 8601 timestamp of when the event occurred",
            },
            {
              name: "payload",
              desc: lang === "zh"
                ? "包含事件详细数据的对象"
                : "Object containing event-specific data",
            },
          ].map((field) => (
            <div key={field.name} className="rounded-lg border border-border/30 p-3">
              <code className="text-xs font-mono text-primary">{field.name}</code>
              <p className="text-xs text-muted-foreground mt-1">{field.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          {lang === "zh"
            ? "以下是一个 balance.low 事件的完整载荷示例："
            : "Here is a complete payload example for a balance.low event:"}
        </p>
        <CodeBlock code={payloadExample} language="json" />
        <p className="text-sm text-muted-foreground">
          {lang === "zh"
            ? "请求还会包含以下 HTTP 头："
            : "Requests also include the following HTTP headers:"}
        </p>
        <CodeBlock code={endpointExample} language="bash" />
      </section>

      {/* Signature Verification */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Shield className="h-5 w-5 text-green-500" />
          {lang === "zh" ? "签名验证" : "Signature Verification"}
        </h2>
        <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-4 text-sm">
          <p className="text-muted-foreground">
            {lang === "zh"
              ? "每个 Webhook 请求都包含 X-Webhook-Signature 头，使用 HMAC-SHA256 算法和你的 Webhook Secret 对请求体进行签名。你必须验证此签名以确保请求来自 OortAPI。"
              : "Every webhook request includes an X-Webhook-Signature header, computed using HMAC-SHA256 with your Webhook Secret over the request body. You must verify this signature to ensure the request came from OortAPI."}
          </p>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-medium">
            {lang === "zh" ? "验证步骤：" : "Verification steps:"}
          </h3>
          <ol className="text-sm text-muted-foreground space-y-2 list-decimal pl-4">
            <li>
              {lang === "zh"
                ? "获取 X-Webhook-Signature 请求头的值"
                : "Extract the X-Webhook-Signature header value"}
            </li>
            <li>
              {lang === "zh"
                ? "使用你的 Webhook Secret 和原始请求体计算 HMAC-SHA256"
                : "Compute HMAC-SHA256 using your Webhook Secret and the raw request body"}
            </li>
            <li>
              {lang === "zh"
                ? "使用时间安全的比较函数对比计算结果与请求头中的签名"
                : "Compare the computed hash with the header signature using a timing-safe comparison"}
            </li>
          </ol>
        </div>

        {/* Node.js verification */}
        <div className="rounded-xl border border-sky-500/20 overflow-hidden">
          <div className="bg-sky-500/5 px-5 py-3 border-b border-sky-500/10">
            <h3 className="text-sm font-semibold text-sky-400">
              Node.js {lang === "zh" ? "验证示例" : "Verification"}
            </h3>
          </div>
          <div className="p-4">
            <CodeBlock code={signatureVerificationNode} language="javascript" />
          </div>
        </div>

        {/* Python verification */}
        <div className="rounded-xl border border-amber-500/20 overflow-hidden">
          <div className="bg-amber-500/5 px-5 py-3 border-b border-amber-500/10">
            <h3 className="text-sm font-semibold text-amber-400">
              Python {lang === "zh" ? "验证示例" : "Verification"}
            </h3>
          </div>
          <div className="p-4">
            <CodeBlock code={signatureVerificationPy} language="python" />
          </div>
        </div>
      </section>

      {/* Retry Policy */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <RotateCcw className="h-5 w-5 text-blue-500" />
          {lang === "zh" ? "重试策略" : "Retry Policy"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {lang === "zh"
            ? "如果你的端点在 10 秒内未返回 2xx 状态码，OortAPI 会使用指数退避策略自动重试，最多 3 次："
            : "If your endpoint does not return a 2xx status code within 10 seconds, OortAPI will automatically retry with exponential backoff, up to 3 attempts:"}
        </p>
        <div className="rounded-lg border border-border/50 p-4">
          <pre className="text-xs font-mono text-muted-foreground whitespace-pre">
            {retryDiagram}
          </pre>
        </div>
        <ul className="text-sm text-muted-foreground space-y-2.5 list-none pl-0">
          {(lang === "zh"
            ? [
                "第 1 次重试：失败后等待 1 分钟",
                "第 2 次重试：失败后等待 5 分钟",
                "第 3 次重试：失败后标记为投递失败",
                "所有重试都包含相同的请求头和签名",
              ]
            : [
                "Retry 1: Wait 1 minute after failure",
                "Retry 2: Wait 5 minutes after failure",
                "Retry 3: Mark as delivery failure after failure",
                "All retries include the same headers and signature",
              ]
          ).map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* Configuration */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          {lang === "zh" ? "配置 Webhooks" : "Configuring Webhooks"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {lang === "zh"
            ? "你可以在控制台中配置 Webhooks："
            : "You can configure webhooks in the dashboard:"}
        </p>
        <ol className="text-sm text-muted-foreground space-y-2 list-decimal pl-4">
          <li>
            {lang === "zh"
              ? "进入 控制台 → Admin → Webhooks"
              : "Go to Dashboard → Admin → Webhooks"}
          </li>
          <li>
            {lang === "zh"
              ? '点击 "添加 Webhook" 并填写你的接收端点 URL'
              : 'Click "Add Webhook" and enter your receiving endpoint URL'}
          </li>
          <li>
            {lang === "zh"
              ? "选择你要订阅的事件类型"
              : "Select the event types you want to subscribe to"}
          </li>
          <li>
            {lang === "zh"
              ? "保存后，系统会生成一个 Webhook Secret，请妥善保管"
              : "After saving, the system generates a Webhook Secret — store it securely"}
          </li>
          <li>
            {lang === "zh"
              ? '使用 "测试" 按钮发送一个测试事件验证配置'
              : 'Use the "Test" button to send a test event and verify your configuration'}
          </li>
        </ol>
      </section>

      {/* Security Best Practices */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          {lang === "zh" ? "安全最佳实践" : "Security Best Practices"}
        </h2>
        <ul className="text-sm text-muted-foreground space-y-2.5 list-none pl-0">
          {(lang === "zh"
            ? [
                "始终验证 X-Webhook-Signature 签名，防止伪造请求",
                "使用 HTTPS 端点，确保传输安全",
                "尽快返回 2xx 响应（< 5 秒），耗时处理请异步执行",
                "不要将 Webhook Secret 硬编码在代码中，使用环境变量存储",
                "定期轮换 Webhook Secret",
                "记录所有 Webhook 请求以便审计和排查问题",
              ]
            : [
                "Always verify the X-Webhook-Signature to prevent forged requests",
                "Use HTTPS endpoints to ensure transport security",
                "Return a 2xx response quickly (< 5 seconds) — process heavy work asynchronously",
                "Do not hardcode the Webhook Secret in code — store it in environment variables",
                "Rotate your Webhook Secret periodically",
                "Log all webhook requests for auditing and troubleshooting",
              ]
          ).map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* Cross Links */}
      <CrossLinks
        links={[
          {
            title: lang === "zh" ? "认证方式" : "Authentication",
            href: "/docs/authentication",
            description:
              lang === "zh"
                ? "获取和配置 API Key"
                : "Get and configure your API Key",
          },
          {
            title: lang === "zh" ? "错误码" : "Error Codes",
            href: "/docs/errors",
            description:
              lang === "zh"
                ? "错误码含义与故障排除"
                : "Error code meanings and troubleshooting",
          },
          {
            title: lang === "zh" ? "安全" : "Security",
            href: "/docs/security",
            description:
              lang === "zh"
                ? "了解 OortAPI 的安全机制"
                : "Learn about OortAPI security mechanisms",
          },
        ]}
      />
    </div>
  );
}
