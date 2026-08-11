import type { MasteryLevel } from "@/app/types";
import { cn } from "@/lib/utils";

interface StatusDotProps {
  level: MasteryLevel;
  className?: string;
  size?: "sm" | "md" | "lg";
  pulse?: boolean;
}

const dotStyles: Record<number, string> = {
  0: "bg-muted-foreground/40",
  1: "bg-warning-500 ring-2 ring-warning-200",
  2: "bg-success-500 ring-2 ring-success-200",
};

const titles: Record<number, string> = {
  0: "未学习",
  1: "已浏览 · 未掌握",
  2: "已掌握",
};

const sizeClasses: Record<string, string> = {
  sm: "size-2",
  md: "size-2.5",
  lg: "size-3.5",
};

export function StatusDot({ level, className, size = "md", pulse = false }: StatusDotProps) {
  return (
    <span
      className={cn(
        "shrink-0 rounded-full inline-flex items-center justify-center",
        sizeClasses[size],
        dotStyles[level] || dotStyles[0],
        pulse && level === 1 && "animate-ring-pulse",
        className
      )}
      title={titles[level] || titles[0]}
      aria-label={titles[level] || titles[0]}
    >
      {level === 2 && (
        <svg className="w-1/2 h-1/2 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={4}>
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </span>
  );
}
