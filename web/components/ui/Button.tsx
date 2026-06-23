import Link from "next/link";
import { cn } from "@/lib/cn";
import { type ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "max";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50";

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:-translate-y-1",
  secondary:
    "text-slate-700 border border-slate-300 bg-white shadow-sm hover:border-blue-400 hover:bg-blue-50 hover:-translate-y-1",
  ghost: "text-slate-600 hover:text-slate-900 hover:bg-slate-100",
  outline:
    "border border-slate-300 text-slate-700 hover:border-cyan-400 hover:text-cyan-600 bg-white",
  max: "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:-translate-y-1",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-sm",
  lg: "h-14 px-8 text-sm",
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
