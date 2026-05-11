export default function TagsLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 lg:px-8">
      <div className="h-8 w-24 bg-secondary rounded animate-pulse mb-2" />
      <div className="h-4 w-64 bg-secondary rounded animate-pulse mb-10" />
      <div className="glass-card p-8 flex flex-wrap items-center justify-center gap-3">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="h-8 bg-secondary rounded-full animate-pulse" style={{ width: `${40 + ((i * 17) % 60)}px` }} />
        ))}
      </div>
    </div>
  );
}
