export function TrustBar() {
  const stats = [
    { value: "1284+", label: "精选实测模板" },
    { value: "每日", label: "更新" },
    { value: "真实", label: "Before/After 对比" },
    { value: "双适配", label: "在线/本地" },
    { value: "社区", label: "验证" },
  ];
  return (
    <section className="border-y border-white/[0.06] bg-white/[0.02]">
      <div className="mx-auto max-w-7xl px-4 py-4 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm">
          {stats.map((stat, i) => (
            <span key={i} className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-[#00d4ff]" />
              <span className="font-semibold text-white">{stat.value}</span>
              <span className="text-[#8b949e]">{stat.label}</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
