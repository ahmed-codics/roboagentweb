import Link from "next/link";
import { cn } from "@/lib/cn";
import { type ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "max";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-glow/50";

const variants: Record<Variant, string> = {
  primary:
    "bg-cyan-glow text-bg hover:bg-cyan-neon shadow-glow-sm hover:shadow-glow",
  secondary:
    "bg-white/[0.06] text-ink hover:bg-white/[0.1] border border-white/10",
  ghost: "text-ink-muted hover:text-ink hover:bg-white/[0.04]",
  outline:
    "border border-white/15 text-ink hover:border-cyan-glow/50 hover:text-cyan-glow",
  max: "relative bg-gradient-to-r from-cyan-glow via-accent-violet to-accent-blue text-white shadow-[0_0_30px_-5px_rgba(123,92,255,0.6)] hover:shadow-[0_0_50px_-5px_rgba(123,92,255,0.8)]",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  href?: string;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  href,
  className,
  children,
  ...rest
}: ButtonProps) {
  const cls = cn(base, variants[variant], sizes[size], className);
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}
