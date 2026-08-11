"use client";

import { cn } from "@/lib/utils";
import { Inbox, SearchX, FileQuestion, Frown } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: "inbox" | "search" | "question" | "frown";
  action?: React.ReactNode;
  className?: string;
  variant?: "default" | "warm" | "cool";
}

const iconMap = {
  inbox: Inbox,
  search: SearchX,
  question: FileQuestion,
  frown: Frown,
};

const variantClasses = {
  default: "border-border bg-card",
  warm: "border-warning-200 bg-warning-50/40",
  cool: "border-brand-200 bg-brand-50/40",
};

export function EmptyState({
  title = "暂无数据",
  description,
  icon = "inbox",
  action,
  className,
  variant = "default",
}: EmptyStateProps) {
  const Icon = iconMap[icon];
  return (
    <div
      className={cn(
        "rounded-2xl border border-dashed p-8 text-center",
        variantClasses[variant],
        className
      )}
    >
      <div
        className={cn(
          "w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4",
          variant === "default" && "bg-muted",
          variant === "warm" && "bg-warning-100 text-warning-600",
          variant === "cool" && "bg-brand-100 text-brand-600"
        )}
      >
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-sm font-bold text-foreground mb-1">{title}</h3>
      {description && (
        <p className="text-xs text-muted-foreground mb-4">{description}</p>
      )}
      {action && <div className="inline-flex">{action}</div>}
    </div>
  );
}
