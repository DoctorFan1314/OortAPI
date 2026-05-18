interface LoadingSkeletonProps {
  height?: string;
  className?: string;
}

export function LoadingSkeleton({ height = "h-48", className }: LoadingSkeletonProps) {
  return <div className={`${height} animate-pulse bg-muted rounded-lg ${className ?? ""}`} />;
}
