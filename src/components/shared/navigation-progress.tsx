"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function NavigationProgress() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const prevPathRef = useRef(pathname);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const [finishing, setFinishing] = useState(false);

  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      setLoading(true);
      setFinishing(false);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setFinishing(true);
        setTimeout(() => { setLoading(false); setFinishing(false); }, 200);
      }, 300);
      prevPathRef.current = pathname;
    }
    return () => clearTimeout(timerRef.current);
  }, [pathname]);

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-[2px] pointer-events-none">
      <div
        className="h-full bg-gradient-to-r from-primary to-purple-500 transition-all duration-300 ease-out"
        style={{ width: finishing ? "100%" : loading ? "90%" : "0%", opacity: loading || finishing ? 1 : 0 }}
      />
    </div>
  );
}
