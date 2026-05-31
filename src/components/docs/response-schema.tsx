"use client";

import { useState, useCallback } from "react";
import { ChevronDown, Copy, Check, FileJson, Table } from "lucide-react";
import { cn } from "@/lib/utils";
import LazySyntaxHighlighter from "@/components/shared/lazy-syntax-highlighter";

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

function ParameterTable({ parameters }: { parameters: Parameter[] }) {
  if (!parameters || parameters.length === 0) return null;

  return (
    <div className="border-t border-zinc-800">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-[#0d1117]">
        <Table className="h-3.5 w-3.5 text-zinc-500" />
        <span className="text-xs font-medium text-zinc-400">Parameters</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-[#0d1117]/60">
              <th className="text-left px-4 py-2 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                Name
              </th>
              <th className="text-left px-4 py-2 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                Type
              </th>
              <th className="text-left px-4 py-2 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                Required
              </th>
              <th className="text-left px-4 py-2 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                Description
              </th>
            </tr>
          </thead>
          <tbody>
            {parameters.map((param, i) => (
              <tr
                key={param.name}
                className={cn(
                  "border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors",
                  i === parameters.length - 1 && "border-b-0"
                )}
              >
                <td className="px-4 py-2.5">
                  <code className="text-xs font-mono text-emerald-400">
                    {param.name}
                  </code>
                </td>
                <td className="px-4 py-2.5">
                  <code className="text-xs font-mono text-sky-400">
                    {param.type}
                  </code>
                </td>
                <td className="px-4 py-2.5">
                  {param.required ? (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      Required
                    </span>
                  ) : (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500 border border-zinc-700/50">
                      Optional
                    </span>
                  )}
                </td>
                <td className="px-4 py-2.5 text-xs text-zinc-400 max-w-xs">
                  {param.description}
                </td>
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

  const tabConfig: { key: TabKey; label: string }[] = [
    { key: "request", label: "Request" },
    { key: "response", label: "Response" },
  ];

  return (
    <div
      className={cn(
        "rounded-lg border border-zinc-800 overflow-hidden",
        className
      )}
    >
      {/* Header — always visible, toggles collapse */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-[#0d1117] hover:bg-[#0d1117]/80 transition-colors text-left"
      >
        <div className="flex items-center gap-2.5">
          <FileJson className="h-4 w-4 text-emerald-500" />
          <span className="text-sm font-semibold text-zinc-200">{title}</span>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-zinc-500 transition-transform duration-200 shrink-0",
            open && "rotate-180"
          )}
        />
      </button>

      {/* Collapsible body */}
      {open && (
        <div>
          {/* Tab bar */}
          <div className="flex items-center justify-between px-3 py-1.5 border-t border-zinc-800 bg-[#161b20]">
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
                      ? "bg-zinc-800 text-zinc-200 border border-zinc-700 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-300"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors"
              aria-label="Copy code"
            >
              {copied ? (
                <Check className="h-3 w-3 text-emerald-400" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
              <span>{copied ? "Copied!" : "Copy"}</span>
            </button>
          </div>

          {/* Syntax-highlighted JSON */}
          <div className="w-full max-w-full overflow-x-auto min-w-0">
            <LazySyntaxHighlighter code={activeCode} language="json" />
          </div>

          {/* Parameter table */}
          <ParameterTable parameters={parameters ?? []} />
        </div>
      )}
    </div>
  );
}
