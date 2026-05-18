"use client";

import { CopyButton } from "@/components/shared/copy-button";

export function CodeBlock({ code }: { code: string }) {
  return (
    <div className="relative group">
      <pre className="bg-zinc-950 rounded-lg p-4 overflow-x-auto text-sm leading-relaxed border border-zinc-800">
        <code className="text-zinc-300 font-mono whitespace-pre">{code}</code>
      </pre>
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <CopyButton text={code} className="p-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200" />
      </div>
    </div>
  );
}
