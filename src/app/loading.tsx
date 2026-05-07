export default function Loading() {
  return (
    <div className="animate-pulse" role="status" aria-busy="true" aria-label="Loading">
      {/* Hero skeleton */}
      <div className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="h-10 w-3/4 mx-auto bg-secondary rounded-lg" />
          <div className="h-6 w-2/3 mx-auto bg-secondary rounded-lg" />
          <div className="flex justify-center gap-4 mt-8">
            <div className="h-11 w-32 bg-secondary rounded-lg" />
            <div className="h-11 w-32 bg-secondary rounded-lg" />
          </div>
        </div>
      </div>

      {/* Tab section skeleton */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex justify-center gap-2 mb-10">
          <div className="h-10 w-36 bg-secondary rounded-lg" />
          <div className="h-10 w-36 bg-secondary rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-card p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-secondary rounded-full" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-1/2 bg-secondary rounded" />
                  <div className="h-3 w-1/3 bg-secondary rounded" />
                </div>
              </div>
              <div className="h-4 w-full bg-secondary rounded" />
              <div className="h-4 w-3/4 bg-secondary rounded" />
              <div className="flex gap-2 mt-2">
                <div className="h-6 w-16 bg-secondary rounded-full" />
                <div className="h-6 w-16 bg-secondary rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
