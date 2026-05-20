"use client";
import { useRef, useState, useCallback } from "react";
import { ErrorFallback } from "@/components/shared/error-fallback";

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  const retryCountRef = useRef(0);
  const [disabled, setDisabled] = useState(false);

  const handleReset = useCallback(() => {
    retryCountRef.current += 1;
    if (retryCountRef.current >= 3) {
      setDisabled(true);
      return;
    }
    reset();
  }, [reset]);

  if (disabled) {
    return (
      <ErrorFallback
        error={new Error("Service unavailable. Please try again later.")}
        reset={undefined}
      />
    );
  }

  return <ErrorFallback error={error} reset={handleReset} />;
}
