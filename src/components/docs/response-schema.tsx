"use client";

import { useState, useCallback } from "react";
import { ChevronDown, Copy, Check, FileJson, Table } from "lucide-react";
import { cn } from "@/lib/utils";
import LazySyntaxHighlighter from "@/components/shared/lazy-syntax-highlighter";
import { useI18n } from "@/contexts/i18n-context";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Parameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

interface ResponseSchemaProps {
  /** Section heading, e.g. "Chat Completions" */
  title: string;
  /** JSON string shown in the "Request" tab */
  requestExample: string;
  /** JSON string shown in the "Response" tab */
  responseExample: string;
  /** Parameter table rows */
  parameters?: Parameter[];
  /** Start expanded (default false) */
  defaultOpen?: boolean;
  /** Extra class on the outer wrapper */
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

type TabKey = "request" | "response";

function ParameterTable({ parameters, labels }: { parameters: Parameter[]; labels: { parameters: string; required: string; optional: string; name: string; type: string; description: string } }) {
  if (!parameters || parameters.length === 0) return null;

  return (
    <div className="border-t border-[var(--code-border)]">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-[var(--code-bg)]">
        <Table className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">{labels.parameters}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--code-border)] bg-[var(--code-bg)]/60">
              <th className="text-left px-4 py-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{labels.name}</th>
              <th className="text-left px-4 py-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{labels.type}</th>
              <th className="text-left px-4 py-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{labels.required}</th>
              <th className="text-left px-4 py-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{labels.description}</th>
            </tr>
          </thead>
          <tbody>
            {parameters.map((param, i) => (
              <tr
                key={param.name}
                className={cn(
                  "border-b border-[var(--code-border)]/50 hover:bg-[var(--code-bg)]/40 transition-colors",
                  i === parameters.length - 1 && "border-b-0"
                )}
              >
                <td className="px-4 py-2.5">
                  <code className="text-xs font-mono text-emerald-500 dark:text-emerald-400">{param.name}</code>
                </td>
                <td className="px-4 py-2.5">
                  <code className="text-xs font-mono text-sky-600 dark:text-sky-400">{param.type}</code>
                </td>
                <td className="px-4 py-2.5">
                  {param.required ? (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      {labels.required}
                    </span>
                  ) : (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                      {labels.optional}
                    </span>
                  )}
                </td>
                <td className="px-4 py-2.5 text-xs text-muted-foreground max-w-xs">{param.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function ResponseSchema({
  title,
  requestExample,
  responseExample,
  parameters,
  defaultOpen = false,
  className,
}: ResponseSchemaProps) {
  const { lang } = useI18n();
  const [open, setOpen] = useState(defaultOpen);
  const [activeTab, setActiveTab] = useState<TabKey>("request");
  const [copied, setCopied] = useState(false);

  const activeCode = activeTab === "request" ? requestExample : responseExample;

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(activeCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }).catch(() => {});
  }, [activeCode]);

  const labels = lang === "zh"
    ? { parameters: "参数", required: "必填", optional: "可选", name: "名称", type: "类型", description: "描述", request: "请求", response: "响应", copied: "已复制!", copy: "复制" }
    : { parameters: "Parameters", required: "Required", optional: "Optional", name: "Name", type: "Type", description: "Description", request: "Request", response: "Response", copied: "Copied!", copy: "Copy" };

  const tabConfig: { key: TabKey; label: string }[] = [
    { key: "request", label: labels.request },
    { key: "response", label: labels.response },
  ];

  return (
    <div className={cn("rounded-lg border border-[var(--code-border)] overflow-hidden", className)}>
      {/* Header — always visible, toggles collapse */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-[var(--code-bg)] hover:bg-[var(--code-bg)]/80 transition-colors text-left"
      >
        <div className="flex items-center gap-2.5">
          <FileJson className="h-4 w-4 text-emerald-500" />
          <span className="text-sm font-semibold text-[var(--code-foreground)]">{title}</span>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-200 shrink-0",
            open && "rotate-180"
          )}
        />
      </button>

      {/* Collapsible body */}
      {open && (
        <div>
          {/* Tab bar */}
          <div className="flex items-center justify-between px-3 py-1.5 border-t border-[var(--code-border)] bg-[var(--code-bg)]">
            <div className="flex gap-0.5">
              {tabConfig.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActiveTab(tab.key);
                    setCopied(false);
                  }}
                  className={cn(
                    "px-2.5 py-1 text-[11px] font-mono rounded transition-colors",
                    tab.key === activeTab
                      ? "bg-background text-foreground border border-border shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
              aria-label={labels.copy}
            >
              {copied ? (
                <Check className="h-3 w-3 text-emerald-500" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
              <span>{copied ? labels.copied : labels.copy}</span>
            </button>
          </div>

          {/* Syntax-highlighted JSON */}
          <div className="w-full max-w-full overflow-x-auto min-w-0">
            <LazySyntaxHighlighter code={activeCode} language="json" />
          </div>

          {/* Parameter table */}
          <ParameterTable parameters={parameters ?? []} labels={labels} />
        </div>
      )}
    </div>
  );
}
