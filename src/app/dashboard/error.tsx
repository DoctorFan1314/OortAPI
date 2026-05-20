"use client";

import { ErrorFallback } from "@/components/shared/error-fallback";

export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  return <ErrorFallback error={error} reset={reset} />;
}
