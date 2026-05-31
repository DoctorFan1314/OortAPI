export default function RoutingLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-40 bg-muted animate-pulse rounded" />
      {/* stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[76px] bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
      {/* pie chart */}
      <div className="h-[340px] bg-muted animate-pulse rounded-lg" />
      {/* channel health table */}
      <div className="space-y-2">
        <div className="h-6 w-48 bg-muted animate-pulse rounded" />
        <div className="h-8 w-56 bg-muted animate-pulse rounded" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-10 w-full bg-muted animate-pulse rounded" />
        ))}
      </div>
      {/* model mapping table */}
      <div className="space-y-2">
        <div className="h-6 w-52 bg-muted animate-pulse rounded" />
        <div className="h-8 w-56 bg-muted animate-pulse rounded" />
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-10 w-full bg-muted animate-pulse rounded" />
        ))}
      </div>
    </div>
  );
}
