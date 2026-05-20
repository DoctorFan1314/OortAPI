"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

export function LastUpdated() {
  const pathname = usePathname();
  const [date, setDate] = useState<string | null>(null);

  useEffect(() => {
    // Use build time as a proxy for last-updated
    // In production, this could be replaced with a git-log API call
    const buildDate = process.env.NEXT_PUBLIC_BUILD_TIME
      ? new Date(process.env.NEXT_PUBLIC_BUILD_TIME).toLocaleDateString()
      : null;
    setDate(buildDate);
  }, [pathname]);

  if (!date) return null;

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <Clock className="h-3 w-3" />
      {date}
    </span>
  );
}
