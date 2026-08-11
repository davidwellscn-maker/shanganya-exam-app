"use client";

import { cn } from "@/lib/utils";

interface StatRingProps {
  value: number;
  max?: number;
  size?: number;
  stroke?: number;
  colorClass?: string;
  trackClass?: string;
  children?: React.ReactNode;
  className?: string;
}

export function StatRing({
  value,
  max = 100,
  size = 80,
  stroke = 8,
  colorClass = "text-primary",
  trackClass = "text-muted/50",
  children,
  className,
}: StatRingProps) {
  const pct = Math.max(0, Math.min(1, max === 0 ? 0 : value / max));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - pct * c;

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center",
        className
      )}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="currentColor"
          strokeWidth={stroke}
          fill="none"
          className={trackClass}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="currentColor"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          className={colorClass}
          style={{
            strokeDasharray: c,
            strokeDashoffset: offset,
            transition: "stroke-dashoffset 700ms ease-out",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
