"use client";

import Link from "next/link";
import { useI18n } from "@/contexts/i18n-context";
import { CodeBlock } from "@/components/docs/code-block";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Shield, Key } from "lucide-react";

export default function AuthenticationPage() {
  const { lang, t } = useI18n();
  const L = t.apiDocs;

  const openaiCode = `curl https://your-domain.com/api/v1/chat/completions \\
  -H "Authorization: Bearer sk-oort-xxxxxxxxxxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "Hello"}]
  }'`;

  const anthropicCode = `curl https://your-domain.com/api/v1/messages \\
  -H "x-api-key: sk-oort-xxxxxxxxxxxxxxxx" \\
  -H "anthropic-version: 2023-06-01" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "claude-sonnet-4-20250514",
    "max_tokens": 1024,
    "messages": [{"role": "user", "content": "Hello"}]
  }'`;

  const anthropicAltCode = `# Alternatively, using Authorization header:
curl https://your-domain.com/api/v1/messages \\
  -H "Authorization: Bearer sk-oort-xxxxxxxxxxxxxxxx" \\
  -H "anthropic-version: 2023-06-01" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "claude-sonnet-4-20250514",
    "max_tokens": 1024,
    "messages": [{"role": "user", "content": "Hello"}]
  }'`;

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold mb-2">{L.authentication}</h1>
        <p className="text-sm text-muted-foreground">{L.authDesc}</p>
      </div>

      {/* Two-column auth methods */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* OpenAI Auth */}
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-emerald-500" />
              <CardTitle className="text-sm">{L.authOpenai}</CardTitle>
            </div>
            <CardDescription className="text-xs">{L.authOpenaiDesc}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <CodeBlock code={openaiCode} />
          </CardContent>
        </Card>

        {/* Anthropic Auth */}
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-amber-500" />
              <CardTitle className="text-sm">{L.authAnthropic}</CardTitle>
            </div>
            <CardDescription className="text-xs">
              {L.authAnthropicDesc} <span className="font-mono">x-api-key</span>{" "}
              {L.authAnthropicEnd}{" "}
              <span className="font-mono">Authorization: Bearer</span>{" "}
              {L.authAnthropicEnd2}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <CodeBlock code={anthropicCode} />
            <CodeBlock code={anthropicAltCode} />
          </CardContent>
        </Card>
      </div>

      {/* Create API Keys note */}
      <div className="rounded-lg border border-border/50 bg-muted/20 p-4 text-sm">
        <p className="text-muted-foreground">
          {lang === "zh" ? (
            <>
              还没有 API Key？前往{" "}
              <Link href="/dashboard/keys" className="text-primary hover:underline font-medium">
                控制台 → API Keys
              </Link>{" "}
              创建。所有 Key 以 <code className="text-xs px-1 py-0.5 rounded bg-muted font-mono">sk-oort-</code> 开头。
            </>
          ) : (
            <>
              Don&apos;t have an API Key yet? Go to{" "}
              <Link href="/dashboard/keys" className="text-primary hover:underline font-medium">
                Dashboard &rarr; API Keys
              </Link>{" "}
              to create one. All keys start with{" "}
              <code className="text-xs px-1 py-0.5 rounded bg-muted font-mono">sk-oort-</code>.
            </>
          )}
        </p>
      </div>
    </div>
  );
}
