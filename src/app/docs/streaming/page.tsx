"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/contexts/i18n-context";
import { CodeBlock } from "@/components/docs/code-block";

const openaiStream = `data: {"id":"chatcmpl-xxx","object":"chat.completion.chunk","choices":[{"delta":{"content":"Hello"},"index":0}]}

data: {"id":"chatcmpl-xxx","object":"chat.completion.chunk","choices":[{"delta":{"content":"!"},"index":0}]}

data: [DONE]`;

const openaiUsage = `data: {"id":"chatcmpl-xxx","object":"chat.completion.chunk","choices":[],"usage":{"prompt_tokens":10,"completion_tokens":5,"total_tokens":15}}

data: [DONE]`;

const anthropicStream = `event: message_start
data: {"type":"message_start","message":{"id":"msg_xxx","content":[],"model":"claude-sonnet-4-20250514"}}

event: content_block_start
data: {"type":"content_block_start","index":0,"content_block":{"type":"text","text":""}}

event: content_block_delta
data: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":"Hello"}}

event: content_block_delta
data: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":"!"}}

event: message_stop
data: {"type":"message_stop"}`;

const CLIENT_SIDE_URL = "/api/v1"; // Relative path, resolved by browser

export default function StreamingPage() {
  const { t, lang } = useI18n();
  const [origin, setOrigin] = useState("");
  useEffect(() => { setOrigin(window.location.origin); }, []);

  const baseUrl = origin || "http://localhost:3000";

  const fetchStream = `const response = await fetch("${baseUrl}/api/v1/chat/completions", {
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer sk-oortapi-your-key",
  },
  body: JSON.stringify({
    model: "gpt-4o",
    stream: true,
    messages: [{ role: "user", content: "Hello!" }],
  }),
});

const reader = response.body.getReader();
const decoder = new TextDecoder();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  const chunk = decoder.decode(value);
  const lines = chunk.split("\\n").filter(l => l.startsWith("data: ") && l !== "data: [DONE]");
  for (const line of lines) {
    const json = JSON.parse(line.slice(6));
    console.log(json.choices[0]?.delta?.content || "");
  }
}`;

  const L = t.apiDocs;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">{L.streamTitle}</h1>
        <p className="text-muted-foreground">{L.streamDesc}</p>
      </div>

      {/* Two-column comparison */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* OpenAI */}
        <div className="rounded-xl border border-sky-500/20 overflow-hidden">
          <div className="bg-sky-500/5 px-5 py-3 border-b border-sky-500/10">
            <h2 className="text-sm font-semibold text-sky-400">{L.streamOpenai}</h2>
          </div>
          <div className="p-5 space-y-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              {L.streamOpenaiDesc}
            </p>
            <CodeBlock code={openaiStream} />
          </div>
        </div>

        {/* Anthropic */}
        <div className="rounded-xl border border-amber-500/20 overflow-hidden">
          <div className="bg-amber-500/5 px-5 py-3 border-b border-amber-500/10">
            <h2 className="text-sm font-semibold text-amber-400">{L.streamAnthropic}</h2>
          </div>
          <div className="p-5 space-y-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              {L.streamAnthropicDesc}
            </p>
            <CodeBlock code={anthropicStream} />
          </div>
        </div>
      </div>

      {/* OpenAI usage info */}
      <div className="rounded-xl border border-border/50 overflow-hidden">
        <div className="bg-muted/10 px-5 py-3 border-b border-border/20">
          <h2 className="text-sm font-semibold">{L.streamOpenai} &mdash; stream_options.include_usage</h2>
        </div>
        <div className="p-5 space-y-3">
          <p className="text-xs text-muted-foreground">
            {lang === "zh"
              ? "设置 stream_options: { include_usage: true } 可在最后一个 chunk 中获取用量信息。"
              : "Set stream_options: { include_usage: true } to receive usage info in the final chunk."}
          </p>
          <CodeBlock code={openaiUsage} />
        </div>
      </div>

      {/* Consuming streams */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">{L.navSdk}</h2>
        <p className="text-sm text-muted-foreground">
          {lang === "zh"
            ? "以下示例演示如何使用 fetch API 在浏览器中消费流式响应。"
            : "The example below shows how to consume a streaming response using the fetch API in the browser."}
        </p>
        <CodeBlock code={fetchStream} />
      </section>
    </div>
  );
}
