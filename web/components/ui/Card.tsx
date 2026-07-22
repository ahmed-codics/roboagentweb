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
        /* 24px reconciles with the 12px controls; 32px against rounded-xl buttons
           read as two different design systems. Resting shadow is 4% black —
           the old shadow-md → shadow-2xl hover was a 6x jump in pure black. */
        "relative rounded-3xl border border-slate-200 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden group",
        hover &&
          "transition-[box-shadow,transform,border-color] duration-300 hover:shadow-[0_16px_48px_rgb(0,0,0,0.08)] hover:-translate-y-1 hover:border-cyan-300",
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
