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
        "relative rounded-[2rem] border border-slate-200 bg-white shadow-md overflow-hidden group",
        hover &&
          "transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 hover:border-cyan-300",
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
    <div className="p-8 pb-4 relative z-10">
      {icon && (
        <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 ring-1 ring-cyan-100">
          {icon}
        </div>
      )}
      <div className="text-xl font-bold tracking-tight text-slate-900">{title}</div>
      {subtitle && <div className="mt-1.5 text-sm font-medium text-slate-500">{subtitle}</div>}
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
  return <div className={cn("p-8 pt-2 text-base text-slate-600 relative z-10", className)}>{children}</div>;
}
