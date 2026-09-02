"use client";

import type { MasteryLevel } from "@/app/types";
import { cn } from "@/lib/utils";

interface MasteryCycleButtonProps {
  level: MasteryLevel;
  onChange: (level: MasteryLevel) => void;
}

const config: Record<MasteryLevel, { label: string; dot: string; text: string }> = {
  0: { label: "未学习", dot: "bg-muted-foreground/40", text: "text-muted-foreground" },
  1: { label: "学习中", dot: "bg-warning", text: "text-warning" },
  2: { label: "已掌握", dot: "bg-success", text: "text-success" },
};

/** 轻量单按钮：点击循环切换 未学 → 学过 → 已掌握 → 未学 */
export function MasteryCycleButton({ level, onChange }: MasteryCycleButtonProps) {
  const c = config[level] || config[0];
  const next = ((level + 1) % 3) as MasteryLevel;

  return (
    <button
      type="button"
      onClick={() => onChange(next)}
      title={`点击切换为「${config[next].label}」`}
      className={cn(
        "inline-flex items-center gap-1.5 h-6 px-2 rounded-full border border-border/70 bg-card/60 text-[11px] font-medium transition-colors hover:bg-muted/60 whitespace-nowrap",
        c.text
      )}
    >
      <span className={cn("size-1.5 rounded-full shrink-0", c.dot)} />
      {c.label}
    </button>
  );
}
