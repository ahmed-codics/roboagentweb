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
    <div className="inline-flex items-center gap-2 rounded-full border border-cyan-glow/20 bg-cyan-glow/5 px-3 py-1 text-xs font-medium uppercase tracking-wider text-cyan-glow">
      <span className="h-1.5 w-1.5 rounded-full bg-cyan-glow shadow-[0_0_8px_#22e6ff] animate-pulse-soft" />
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
      <h2 className="text-balance text-3xl font-semibold tracking-tight text-ink md:text-5xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-5 text-base leading-relaxed text-ink-muted md:text-lg">{subtitle}</p>
      )}
    </div>
  );
}
