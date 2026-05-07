"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import ts from "react-syntax-highlighter/dist/esm/languages/hljs/typescript";
import json from "react-syntax-highlighter/dist/esm/languages/hljs/json";
import md from "react-syntax-highlighter/dist/esm/languages/hljs/markdown";

SyntaxHighlighter.registerLanguage("typescript", ts);
SyntaxHighlighter.registerLanguage("json", json);
SyntaxHighlighter.registerLanguage("markdown", md);

export const codeTheme: Record<string, React.CSSProperties> = {
  "hljs": { background: "#0d1117", color: "#e6edf3", padding: "1rem", borderRadius: "0 0 0.5rem 0.5rem", overflow: "auto" },
  "hljs-keyword": { color: "#ff7b72" },
  "hljs-string": { color: "#a5d6ff" },
  "hljs-number": { color: "#79c0ff" },
  "hljs-built_in": { color: "#ffa657" },
  "hljs-comment": { color: "#8b949e" },
  "hljs-title": { color: "#d2a8ff" },
  "hljs-attr": { color: "#79c0ff" },
  "hljs-params": { color: "#e6edf3" },
};

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      size="sm"
      variant="ghost"
      className="text-muted-foreground hover:text-foreground h-7 px-2"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
    </Button>
  );
}

function InlineMarkdown({ text }: { text: string }) {
  const parts = text.split(/(\*\*.*?\*\*|`[^`]+`)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i} className="text-foreground">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return <code key={i} className="px-1.5 py-0.5 bg-secondary rounded text-xs font-mono text-foreground">{part.slice(1, -1)}</code>;
        }
        return part;
      })}
    </>
  );
}

function isTableSeparator(line: string): boolean {
  return /^\|[\s\-:|]+\|$/.test(line.trim());
}

export function MarkdownRenderer({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeLines: string[] = [];
  let codeLang = "";
  let tableRows: string[][] = [];

  function flushTable() {
    if (tableRows.length === 0) return;
    const colCount = tableRows[0].length;
    elements.push(
      <div key={`table-${elements.length}`} className="my-4 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            {tableRows.slice(0, 1).map((row, ri) => (
              <tr key={ri} className="bg-secondary/50">
                {row.map((cell, ci) => (
                  <th key={ci} className="px-3 py-2 text-left text-muted-foreground font-medium">
                    <InlineMarkdown text={cell} />
                  </th>
                ))}
                {row.length < colCount && Array.from({ length: colCount - row.length }).map((_, ci) => (
                  <th key={`pad-${ci}`} className="px-3 py-2" />
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {tableRows.slice(1).map((row, ri) => (
              <tr key={ri} className="border-t border-border">
                {row.map((cell, ci) => (
                  <td key={ci} className="px-3 py-2 text-left text-muted-foreground">
                    <InlineMarkdown text={cell} />
                  </td>
                ))}
                {row.length < colCount && Array.from({ length: colCount - row.length }).map((_, ci) => (
                  <td key={`pad-${ci}`} className="px-3 py-2" />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    tableRows = [];
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("```")) {
      flushTable();
      if (inCodeBlock) {
        elements.push(
          <div key={`code-${i}`} className="relative my-4">
            <div className="flex items-center justify-between bg-[#161b22] border border-border border-b-0 rounded-t-lg px-4 py-2">
              <span className="text-xs text-muted-foreground font-mono">{codeLang || "code"}</span>
              <CopyButton text={codeLines.join("\n")} />
            </div>
            <SyntaxHighlighter language={codeLang || "text"} style={codeTheme} customStyle={{ margin: 0, fontSize: "0.875rem" }}>
              {codeLines.join("\n")}
            </SyntaxHighlighter>
          </div>
        );
        codeLines = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
        codeLang = line.slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    const headingText = line.replace(/^#+\s+/, "");
    const headingId = headingText.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");

    if (line.startsWith("### ")) {
      flushTable();
      elements.push(<h3 key={i} id={headingId} className="text-base font-semibold text-foreground mt-4 mb-2 scroll-mt-20">{headingText}</h3>);
    } else if (line.startsWith("## ")) {
      flushTable();
      elements.push(<h2 key={i} id={headingId} className="text-lg font-semibold text-foreground mt-6 mb-3 scroll-mt-20">{headingText}</h2>);
    } else if (line.startsWith("# ")) {
      flushTable();
      elements.push(<h1 key={i} id={headingId} className="text-2xl font-bold text-foreground mt-6 mb-3 scroll-mt-20">{headingText}</h1>);
    } else if (line.startsWith("| ") || line.startsWith("|")) {
      if (isTableSeparator(line)) {
        continue;
      }
      const cells = line.split("|").slice(1, -1).map(c => c.trim());
      if (cells.length > 0) {
        tableRows.push(cells);
      }
    } else if (line.startsWith("- ")) {
      flushTable();
      elements.push(
        <div key={i} className="flex gap-2 py-1 text-sm text-muted-foreground">
          <span className="text-primary shrink-0 mt-0.5">•</span>
          <span><InlineMarkdown text={line.slice(2)} /></span>
        </div>
      );
    } else if (line.match(/^\d+\.\s/)) {
      flushTable();
      const num = line.match(/^(\d+)\.\s/)?.[1] || "1";
      elements.push(
        <div key={i} className="flex gap-2 py-1 text-sm text-muted-foreground">
          <span className="text-primary shrink-0 font-mono text-xs mt-0.5">{num}.</span>
          <span><InlineMarkdown text={line.replace(/^\d+\.\s/, "")} /></span>
        </div>
      );
    } else if (line.startsWith("`") && line.endsWith("`")) {
      flushTable();
      elements.push(<code key={i} className="block my-1 px-3 py-1.5 bg-secondary rounded text-sm font-mono text-foreground">{line.slice(1, -1)}</code>);
    } else if (line.trim() === "") {
      flushTable();
      elements.push(<div key={i} className="h-2" />);
    } else {
      flushTable();
      elements.push(
        <p key={i} className="text-sm text-muted-foreground leading-relaxed">
          <InlineMarkdown text={line} />
        </p>
      );
    }
  }
  flushTable();

  return <div>{elements}</div>;
}
