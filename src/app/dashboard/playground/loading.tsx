import { LoadingSkeleton } from "@/components/shared/loading-skeleton";

export default function PlaygroundLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-40 bg-muted animate-pulse rounded" />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <LoadingSkeleton height="h-[60vh]" />
        <div className="space-y-4">
          <LoadingSkeleton height="h-32" />
          <LoadingSkeleton height="h-48" />
        </div>
      </div>
    </div>
  );
}
