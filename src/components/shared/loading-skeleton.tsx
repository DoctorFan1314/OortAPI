interface LoadingSkeletonProps {
  height?: string;
  width?: string;
  shape?: "rounded" | "circle" | "rect";
  lines?: number;
  className?: string;
}

export function LoadingSkeleton({ height = "h-48", width, shape = "rounded", lines, className }: LoadingSkeletonProps) {
  if (lines) {
    return (
      <div className={`space-y-2 ${className ?? ""}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse bg-muted rounded"
            style={{ height: "0.75rem", width: `${100 - i * 15}%` }}
          />
        ))}
      </div>
    );
  }

  const shapeClass = shape === "circle" ? "rounded-full" : shape === "rect" ? "rounded-none" : "rounded-lg";
  return <div className={`animate-pulse bg-muted ${shapeClass} ${height} ${width ?? ""} ${className ?? ""}`} />;
}
