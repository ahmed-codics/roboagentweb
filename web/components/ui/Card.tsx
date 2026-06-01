import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export function Card({
  children,
  className,
  glow = false,
  hover = true,
}: {
  children: ReactNode;
  className?: string;
  glow?: boolean;
  hover?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative rounded-xl border border-white/[0.07] bg-bg-surface/60 backdrop-blur-sm",
        hover &&
          "transition-all duration-300 hover:border-cyan-glow/30 hover:bg-bg-elevated/70",
        glow && "glow-border",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  icon,
  title,
  subtitle,
}: {
  icon?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
}) {
  return (
    <div className="p-6 pb-3">
      {icon && (
        <div className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-glow/10 text-cyan-glow ring-1 ring-cyan-glow/20">
          {icon}
        </div>
      )}
      <div className="font-semibold tracking-tight text-ink">{title}</div>
      {subtitle && <div className="mt-1 text-sm text-ink-muted">{subtitle}</div>}
    </div>
  );
}

export function CardBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("p-6 pt-3 text-sm text-ink-muted", className)}>{children}</div>;
}
