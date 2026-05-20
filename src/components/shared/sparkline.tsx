"use client";

import { useMemo, useId } from "react";
import { cn } from "@/lib/utils";

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  className?: string;
}

/** Tiny inline SVG area sparkline — like Grafana sparklines */
export function Sparkline({ data, width = 80, height = 24, color = "#0891b2", className }: SparklineProps) {
  const path = useMemo(() => {
    if (!data || data.length < 2) return null;
    const max = Math.max(...data, 1);
    const min = Math.min(...data, 0);
    const range = max - min || 1;
    const stepX = width / (data.length - 1);
    const points = data.map((v, i) => `${(i * stepX).toFixed(1)},${(height - ((v - min) / range) * height).toFixed(1)}`);
    const top = (height - ((data[0] - min) / range) * height).toFixed(1);
    const areaPath = `M0,${height} L0,${top} L${points.join(" L")} L${width},${height} Z`;
    const linePath = `M0,${top} L${points.join(" L")}`;
    return { areaPath, linePath };
  }, [data, width, height]);

  if (!path) return null;
  const gid = useId();

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className={cn("shrink-0", className)} aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.45} />
          <stop offset="100%" stopColor={color} stopOpacity={0.06} />
        </linearGradient>
      </defs>
      <path d={path.areaPath} fill={`url(#${gid})`} />
      <path d={path.linePath} fill="none" stroke={color} strokeWidth={1.5} strokeOpacity={0.9} />
    </svg>
  );
}
