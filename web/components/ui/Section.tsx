import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export function Section({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cn("relative mx-auto w-full max-w-7xl px-6 py-24 md:py-32", className)}>
      {children}
    </section>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-slate-200 bg-white shadow-sm text-xs font-bold text-slate-500 uppercase tracking-wide">
      {children}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "left" | "center";
}) {
  return (
    <div className={cn("mb-14 max-w-3xl", align === "center" && "mx-auto text-center")}>
      {eyebrow && <div className="mb-4 flex justify-start"><div className={cn(align === "center" && "mx-auto")}>{typeof eyebrow === "string" ? <SectionLabel>{eyebrow}</SectionLabel> : eyebrow}</div></div>}
      <h2 className="text-balance text-3xl font-bold tracking-tight text-slate-900 md:text-5xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-5 text-base leading-relaxed text-slate-600 md:text-lg">{subtitle}</p>
      )}
    </div>
  );
}
