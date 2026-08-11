import { cn } from "@/lib/utils";

interface ProgressBarProps {
  pct: number;
  className?: string;
  variant?: "primary" | "success" | "accent";
  size?: "sm" | "md" | "lg";
  animated?: boolean;
  striped?: boolean;
  showLabel?: boolean;
}

const trackColors: Record<string, string> = {
  primary: "progress-gradient",
  success: "progress-gradient-success",
  accent: "progress-gradient-accent",
};

const sizeClasses: Record<string, string> = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-3.5",
};

export function ProgressBar({
  pct,
  className,
  variant = "primary",
  size = "md",
  animated = false,
  striped = false,
  showLabel = false,
}: ProgressBarProps) {
  const safePct = Math.max(0, Math.min(100, pct));
  const track = safePct > 0 ? trackColors[variant] : "bg-transparent";

  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "w-full overflow-hidden rounded-full bg-muted border border-border/30",
          sizeClasses[size]
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700 ease-out relative",
            track,
            animated && "animate-pulse-soft",
            striped && safePct > 0 && "progress-striped"
          )}
          style={{ width: `${safePct}%` }}
        >
          {safePct > 0 && (
            <span className="absolute inset-0 animate-shimmer opacity-30" />
          )}
        </div>
      </div>
      {showLabel && (
        <span className="absolute -top-5 right-0 text-[10px] font-bold text-foreground tabular-nums">
          {safePct}%
        </span>
      )}
    </div>
  );
}
