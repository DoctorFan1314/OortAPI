"use client";

import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useCurrency } from "@/contexts/currency-context";
import { dashboardSWRConfig } from "@/lib/swr-fetcher";

interface DailyData {
  date: string;
  calls: number;
  cost: number;
  tokens: number;
}

interface StatsResponse {
  daily_usage: DailyData[];
}

const LABELS = {
  zh: { title: "近 7 天用量", calls: "调用次数", cost: "花费", tokens: "Token 用量", noData: "暂无数据" },
  en: { title: "Last 7 Days Usage", calls: "Calls", cost: "Cost", tokens: "Tokens", noData: "No data yet" },
};

export function UsageChart({ lang = "zh" }: { lang?: "zh" | "en" }) {
  const { data: stats } = useSWR<StatsResponse>("/api/dashboard/stats", dashboardSWRConfig);
  const { formatPrice } = useCurrency();
  const data = stats?.daily_usage || [];
  const t = LABELS[lang];

  if (data.length === 0) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg">{t.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">{t.noData}</div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <div className="grid md:grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i} className="glass-card">
            <CardHeader>
              <div className="h-5 w-24 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-[200px] bg-muted rounded-lg animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const chartData = data.map(d => ({
    ...d,
    label: d.date.slice(5),
  }));

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg">{t.calls}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="calls" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg">{t.cost}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(value) => [formatPrice(Number(value)), t.cost]}
              />
              <Line type="monotone" dataKey="cost" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
