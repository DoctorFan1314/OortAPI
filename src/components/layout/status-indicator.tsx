"use client";

import { useEffect, useState } from "react";

export function StatusIndicator() {
  const [status, setStatus] = useState<"loading" | "online" | "offline">("loading");

  useEffect(() => {
    const check = () => {
      fetch("/api/health")
        .then(r => r.json())
        .then(d => {
          setStatus(d.status === "ok" ? "online" : "offline");
        })
        .catch(() => setStatus("offline"));
    };
    check();
    const interval = setInterval(check, 60000);
    return () => clearInterval(interval);
  }, []);

  if (status === "loading") return null;

  return (
    <div className="flex items-center gap-1.5 text-xs">
      <span className={`h-1.5 w-1.5 rounded-full ${status === "online" ? "bg-green-500" : "bg-red-500"}`} />
      <span className="text-muted-foreground">
        {status === "online" ? "All Systems Operational" : "Service Disruption"}
      </span>
    </div>
  );
}
