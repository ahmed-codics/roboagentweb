import Link from "next/link";
import { cn } from "@/lib/cn";
import { type ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "max";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50";

/* Primary is a solid brand fill whose hover shifts hue, not just shadow opacity.
   The old cyan→emerald gradient fill is the single strongest "template" tell,
   and both sibling products (RoboHub, ConnectedLabs) use solid primaries. */
const variants: Record<Variant, string> = {
  primary:
    "bg-cyan-600 text-white shadow-lg shadow-cyan-600/25 hover:bg-cyan-700 hover:shadow-xl hover:shadow-cyan-600/30 hover:-translate-y-0.5",
  secondary:
    "text-slate-700 border border-slate-300 bg-white shadow-sm hover:border-cyan-400 hover:text-cyan-700 hover:bg-cyan-50/60 hover:-translate-y-0.5",
  ghost: "text-slate-600 hover:text-slate-900 hover:bg-slate-100",
  outline:
    "border border-slate-300 text-slate-700 hover:border-cyan-400 hover:text-cyan-600 bg-white",
  /* The Max pricing tier owns violet (see the shield icon at pricing/page.tsx:176).
     Solid fill to match primary — was a purple→pink gradient. */
  max: "bg-violet-600 text-white shadow-lg shadow-violet-600/25 hover:bg-violet-700 hover:shadow-xl hover:shadow-violet-600/30 hover:-translate-y-0.5",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-sm",
  lg: "h-[3.25rem] px-8 text-base",
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
