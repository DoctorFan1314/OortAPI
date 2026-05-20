import { LoadingSkeleton } from "@/components/shared/loading-skeleton";

export default function KeysLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-8 w-40 bg-muted animate-pulse rounded" />
        <div className="h-9 w-28 bg-muted animate-pulse rounded" />
      </div>
      <div className="h-10 w-64 bg-muted animate-pulse rounded" />
      <LoadingSkeleton height="h-64" />
    </div>
  );
}
