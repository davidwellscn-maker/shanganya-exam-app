"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  /** 是否启用脉冲动画 */
  pulse?: boolean;
  /** 是否启用闪光扫过效果 */
  shimmer?: boolean;
}

export function Skeleton({
  className,
  pulse = true,
  shimmer = true,
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "bg-muted/80 rounded-md",
        pulse && "animate-pulse",
        shimmer && "relative overflow-hidden",
        className
      )}
    >
      {shimmer && (
        <span className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/25 to-transparent" />
      )}
    </div>
  );
}

export function SkeletonCard({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-5 space-y-3",
        className
      )}
    >
      {children ?? (
        <>
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </>
      )}
    </div>
  );
}

export function SkeletonStats({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} className="text-center space-y-2">
          <Skeleton className="h-8 w-16 mx-auto" />
          <Skeleton className="h-3 w-20 mx-auto" />
        </SkeletonCard>
      ))}
    </div>
  );
}
