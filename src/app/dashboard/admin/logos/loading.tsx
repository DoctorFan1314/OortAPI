export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-7 w-32 bg-muted rounded" />
          <div className="h-4 w-48 bg-muted rounded mt-2" />
        </div>
        <div className="h-9 w-48 bg-muted rounded-lg" />
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-8 w-20 bg-muted rounded-lg" />
        ))}
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
        {Array.from({ length: 30 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2 p-3 rounded-xl border border-border/50">
            <div className="w-10 h-10 bg-muted rounded-lg" />
            <div className="h-3 w-12 bg-muted rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
