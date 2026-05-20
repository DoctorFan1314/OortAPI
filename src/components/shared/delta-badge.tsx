interface DeltaBadgeProps {
  delta: string | number | null | undefined;
  reverse?: boolean;
}

/**
 * DeltaBadge — 显示增减百分比徽章
 * @param delta 百分比值（如 "12.5" 或 12.5）
 * @param reverse 是否反转颜色（用于成本等"上升=坏"的指标）
 */
export function DeltaBadge({ delta, reverse }: DeltaBadgeProps) {
  if (delta == null) return null;
  const num = typeof delta === "string" ? parseFloat(delta) : delta;
  if (isNaN(num)) return null;

  const isUp = num >= 0;
  // 对于 reverse 模式（如成本），上升用红色；否则上升用绿色（好）
  const isPositive = reverse ? !isUp : isUp;

  return (
    <span
      className={`text-[10px] ml-1 font-medium ${
        isPositive ? "text-green-400" : "text-red-400"
      }`}
    >
      {isUp ? "↑" : "↓"}
      {Math.abs(num).toFixed(1)}%
    </span>
  );
}
