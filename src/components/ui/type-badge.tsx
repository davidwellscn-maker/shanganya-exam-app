import { cn } from "@/lib/utils";

interface TypeBadgeProps {
  type: string;
  className?: string;
}

const typeClassMap: Record<string, string> = {
  "单项选择题": "type-single",
  "单选": "type-single",
  "多项选择题": "type-multiple",
  "多选": "type-multiple",
  "名词解释": "type-term",
  "名词": "type-term",
  "简答题": "type-short",
  "简答": "type-short",
  "论述题": "type-essay",
  "论述": "type-essay",
  "案例分析题": "type-case",
  "案例": "type-case",
};

const labelMap: Record<string, string> = {
  "单项选择题": "单选",
  "多项选择题": "多选",
  "名词解释": "名词",
  "简答题": "简答",
  "论述题": "论述",
  "案例分析题": "案例",
};

export function TypeBadge({ type, className }: TypeBadgeProps) {
  const cls = typeClassMap[type] || "badge-chip";
  const label = labelMap[type] || type;
  return <span className={cn("type-badge", cls, className)}>{label}</span>;
}
