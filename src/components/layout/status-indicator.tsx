"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/contexts/i18n-context";

export function StatusIndicator() {
  const { lang } = useI18n();
  const [status, setStatus] = useState<"loading" | "online" | "offline">("loading");

  useEffect(() => {
    const check = () => {
      fetch("/api/health")
        .then(r => r.json())
        .then(d => {
          setStatus(d.status === "healthy" ? "online" : "offline");
        })
        .catch(() => setStatus("offline"));
    };
    check();
    const interval = setInterval(check, 60000);
    return () => clearInterval(interval);
  }, []);

  if (status === "loading") return null;

  const label = status === "online"
    ? (lang === "zh" ? "所有系统正常" : "All Systems Operational")
    : (lang === "zh" ? "服务异常" : "Service Disruption");

  return (
    <div className="flex items-center gap-1.5 text-xs">
      <span className={`h-1.5 w-1.5 rounded-full ${status === "online" ? "bg-green-500" : "bg-red-500"}`} />
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}
