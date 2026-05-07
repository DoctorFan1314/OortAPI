export default function SkillDetailLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8 animate-pulse">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6">
        <div className="h-4 w-12 bg-secondary rounded" />
        <div className="h-4 w-4 bg-secondary rounded" />
        <div className="h-4 w-24 bg-secondary rounded" />
      </div>

      {/* Header */}
      <div className="mb-6">
        <div className="h-8 w-64 bg-secondary rounded mb-3" />
        <div className="flex gap-6 mb-4">
          <div className="h-5 w-20 bg-secondary rounded" />
          <div className="h-5 w-16 bg-secondary rounded" />
          <div className="h-5 w-24 bg-secondary rounded" />
        </div>
        <div className="h-5 w-48 bg-secondary rounded mb-4" />
        <div className="h-4 w-full max-w-lg bg-secondary rounded mb-4" />
        <div className="flex gap-4">
          <div className="h-6 w-24 bg-secondary rounded" />
          <div className="h-6 w-32 bg-secondary rounded" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-border mb-6">
        {["w-24", "w-20", "w-24", "w-28"].map((w, i) => (
          <div key={i} className={`h-10 ${w} bg-secondary rounded-t mx-1`} />
        ))}
      </div>

      {/* Content */}
      <div className="grid lg:grid-cols-[1fr_280px] gap-6">
        <div className="glass-card p-6 space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-4 bg-secondary rounded" style={{ width: `${60 + Math.random() * 40}%` }} />
          ))}
        </div>
        <div className="space-y-4">
          <div className="glass-card p-5 h-48 bg-secondary" />
          <div className="glass-card p-5 h-64 bg-secondary" />
        </div>
      </div>
    </div>
  );
}
