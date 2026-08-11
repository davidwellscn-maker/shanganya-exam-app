"use client";

import { cn } from "@/lib/utils";

interface BarItem {
  label: string;
  value: number;
  colorClass?: string;
}

interface MiniBarChartProps {
  data: BarItem[];
  max?: number;
  className?: string;
  showLabels?: boolean;
  showValues?: boolean;
  barHeight?: number;
}

export function MiniBarChart({
  data,
  max,
  className,
  showLabels = true,
  showValues = true,
  barHeight = 8,
}: MiniBarChartProps) {
  const safeMax = max ?? Math.max(1, ...data.map((d) => d.value));

  return (
    <div className={cn("space-y-2", className)}>
      {data.map((item, i) => {
        const pct = Math.max(0, Math.min(100, (item.value / safeMax) * 100));
        return (
          <div key={item.label + i} className="group">
            <div className="flex items-center justify-between text-xs mb-1">
              {showLabels && (
                <span className="text-muted-foreground font-medium">
                  {item.label}
                </span>
              )}
              {showValues && (
                <span className="font-mono font-bold text-foreground tabular-nums">
                  {item.value}
                </span>
              )}
            </div>
            <div
              className="w-full rounded-full bg-muted overflow-hidden border border-border/30"
              style={{ height: barHeight }}
            >
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-700 ease-out",
                  item.colorClass ?? "progress-gradient"
                )}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
