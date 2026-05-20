import { LoadingSkeleton } from "@/components/shared/loading-skeleton";

export default function SettingsLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-40 bg-muted animate-pulse rounded" />
      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2, 3, 4].map(i => (
          <LoadingSkeleton key={i} height="h-48" />
        ))}
      </div>
    </div>
  );
}
