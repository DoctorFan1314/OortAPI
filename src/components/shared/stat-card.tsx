import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  color?: "blue" | "green" | "red" | "yellow" | "purple" | "cyan" | "emerald" | "orange";
}

const colorMap: Record<NonNullable<StatCardProps["color"]>, { bg: string; text: string }> = {
  blue: { bg: "bg-blue-500/10", text: "text-blue-500" },
  green: { bg: "bg-green-500/10", text: "text-green-500" },
  red: { bg: "bg-red-500/10", text: "text-red-500" },
  yellow: { bg: "bg-yellow-500/10", text: "text-yellow-500" },
  purple: { bg: "bg-purple-500/10", text: "text-purple-500" },
  cyan: { bg: "bg-cyan-500/10", text: "text-cyan-500" },
  emerald: { bg: "bg-emerald-500/10", text: "text-emerald-500" },
  orange: { bg: "bg-orange-500/10", text: "text-orange-500" },
};

export function StatCard({ icon: Icon, label, value, color = "blue" }: StatCardProps) {
  const { bg, text } = colorMap[color];

  return (
    <Card className="glass-card">
      <CardContent className="p-3 flex items-center gap-2">
        <div className={`p-2 rounded-md ${bg}`}>
          <Icon className={`h-4 w-4 ${text}`} />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-bold font-mono">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
