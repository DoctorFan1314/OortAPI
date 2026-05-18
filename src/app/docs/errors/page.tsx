"use client";

import { useI18n } from "@/contexts/i18n-context";
import { CodeBlock } from "@/components/docs/code-block";

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

export default function ErrorsPage() {
  const { t } = useI18n();
  const L = t.apiDocs;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">{L.errorCodes}</h1>
        <p className="text-muted-foreground">{L.errorsDesc}</p>
      </div>

      {/* Error code table */}
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
            <div key={code} className={errorRow}>
              <span className={`font-mono text-sm font-bold ${statusColors[code] || ""}`}>
                {code}
              </span>
              <div>
                <span className="text-sm font-medium">{label}</span>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
            </div>
          );
        })}
      </div>

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
