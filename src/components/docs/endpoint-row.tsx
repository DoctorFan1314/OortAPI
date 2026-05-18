const methodBadge: Record<string, string> = {
  GET: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  POST: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  PATCH: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  DELETE: "bg-red-500/10 text-red-400 border-red-500/20",
};

export function MethodBadge({ method }: { method: string }) {
  return (
    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${methodBadge[method] || "bg-muted text-muted-foreground"}`}>
      {method}
    </span>
  );
}

export function EndpointRow({ method, path, description }: { method: string; path: string; description: string }) {
  return (
    <div className="flex items-center gap-3 px-5 py-3 hover:bg-muted/20 transition-colors">
      <MethodBadge method={method} />
      <code className="text-sm font-mono flex-1">{path}</code>
      <span className="text-xs text-muted-foreground hidden sm:block">{description}</span>
    </div>
  );
}
