"use client";

import type { MasteryLevel } from "@/app/types";
import { cn } from "@/lib/utils";

interface MasteryToggleProps {
  level: MasteryLevel;
  onChange: (level: MasteryLevel) => void;
  size?: "sm" | "md";
}

const options: { value: MasteryLevel; label: string; icon: string; desc: string }[] = [
  { value: 0, label: "未学", icon: "○", desc: "尚未开始学习" },
  { value: 1, label: "学过", icon: "◐", desc: "已浏览，未掌握" },
  { value: 2, label: "已掌握", icon: "●", desc: "能够独立回忆" },
];

export function MasteryToggle({ level, onChange, size = "sm" }: MasteryToggleProps) {
  return (
    <div
      className="inline-flex rounded-xl border border-border bg-muted/50 p-1"
      role="group"
      aria-label="掌握状态"
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          aria-pressed={level === opt.value}
          title={opt.desc}
          className={cn(
            "relative font-sans font-semibold transition-all first:rounded-l-lg last:rounded-r-lg",
            size === "sm" ? "text-[11px] px-2 py-1" : "text-xs px-3 py-1.5",
            level === opt.value
              ? opt.value === 2
                ? "bg-success text-success-foreground shadow-sm"
                : opt.value === 1
                  ? "bg-warning text-warning-foreground shadow-sm"
                  : "bg-muted-foreground text-background"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
          )}
        >
          <span className="mr-1">{opt.icon}</span>
          {opt.label}
          {level === opt.value && (
            <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-current opacity-40" />
          )}
        </button>
      ))}
    </div>
  );
}
