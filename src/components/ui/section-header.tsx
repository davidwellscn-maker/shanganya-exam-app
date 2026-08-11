interface SectionHeaderProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "success" | "warning" | "purple" | "cyan" | "orange";
}

const dotMap: Record<string, string> = {
  default: "bg-primary",
  success: "bg-success-500",
  warning: "bg-brand-500",
  purple: "bg-primary",
  cyan: "bg-text-500",
  orange: "bg-primary",
};

export function SectionHeader({ children, className, variant = "default" }: SectionHeaderProps) {
  return (
    <p
      className={`font-sans text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground flex items-center gap-1.5 ${className || ""}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotMap[variant]}`} />
      {children}
    </p>
  );
}
