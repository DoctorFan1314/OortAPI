import { LoadingSkeleton } from "@/components/shared/loading-skeleton";

export default function BillingLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-40 bg-muted animate-pulse rounded" />
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map(i => (
          <LoadingSkeleton key={i} height="h-32" />
        ))}
      </div>
      <LoadingSkeleton height="h-64" />
    </div>
  );
}
