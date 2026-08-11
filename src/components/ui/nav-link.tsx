"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavLinkProps {
  href: string;
  label: string;
}

export function NavLink({ href, label }: NavLinkProps) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <a
      href={href}
      className={cn(
        "text-sm transition-colors",
        active
          ? "text-foreground font-medium"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {label}
    </a>
  );
}
