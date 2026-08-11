import { cn } from "@/lib/utils";

interface WeightBadgeProps {
  weight: string;
  className?: string;
  compact?: boolean;
}

const styles: Record<string, string> = {
  "高": "weight-high",
  "中": "weight-mid",
  "低": "weight-low",
};

const dotMap: Record<string, string> = {
  "高": "bg-error-500",
  "中": "bg-warning-500",
  "低": "bg-muted-foreground/40",
};

const stars: Record<string, string> = {
  "高": "★★★",
  "中": "★★☆",
  "低": "★☆☆",
};

export function WeightBadge({ weight, className, compact = false }: WeightBadgeProps) {
  const style = styles[weight] || styles["低"];
  const dot = dotMap[weight] || dotMap["低"];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold",
        compact ? "" : "font-mono",
        style,
        className
      )}
      title={`${weight}权重 ${stars[weight] || ""}`}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", dot)} />
      {!compact && <span>{weight}权重</span>}
      {compact && <span>{weight}</span>}
    </span>
  );
}
