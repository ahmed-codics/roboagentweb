import type { ReactNode } from "react";
import Link from "next/link";
import { Logo } from "./Logo";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid mask-fade-b opacity-40" />
      <div className="pointer-events-none absolute inset-x-0 -top-32 -z-10 h-[600px] bg-radial-glow" />

      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center px-6 py-16">
        <div className="mb-8 flex justify-center"><Logo /></div>
        <div className="rounded-2xl border border-white/10 bg-bg-surface/80 p-7 shadow-ring backdrop-blur">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1.5 text-sm text-ink-muted">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
        <div className="mt-6 text-center text-xs text-ink-dim">{footer}</div>
        <div className="mt-10 text-center">
          <Link href="/" className="text-xs text-ink-dim hover:text-ink">← Back to home</Link>
        </div>
      </div>
    </div>
  );
}

export function OAuthButtons() {
  return (
    <div className="grid gap-2.5">
      <button className="flex h-10 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] text-sm text-ink hover:bg-white/[0.06]">
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M12 .3a12 12 0 00-3.8 23.4c.6.1.8-.3.8-.6v-2.1c-3.4.7-4.1-1.6-4.1-1.6-.5-1.4-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.6-1.4-5.6-6.1 0-1.3.5-2.4 1.2-3.3-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.3a11.5 11.5 0 016 0c2.3-1.6 3.3-1.3 3.3-1.3.7 1.7.2 2.9.1 3.2.8.9 1.2 2 1.2 3.3 0 4.7-2.9 5.7-5.6 6 .4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0012 .3"/></svg>
        Continue with GitHub
      </button>
      <button className="flex h-10 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] text-sm text-ink hover:bg-white/[0.06]">
        <svg viewBox="0 0 24 24" className="h-4 w-4"><path fill="#EA4335" d="M5.3 14.4l-.8 3.1-3.1.1A11.9 11.9 0 010 12c0-2 .5-3.8 1.3-5.4l2.8.5L5.4 9.9a7.2 7.2 0 00-.4 2.1c0 .8.1 1.6.3 2.4z"/><path fill="#FBBC04" d="M23.8 9.8c.1.7.2 1.4.2 2.2 0 .8-.1 1.6-.3 2.4l-3.5-.3a7.2 7.2 0 00-.7-2.5l4.3-1.8z"/><path fill="#34A853" d="M19.6 18.7A11.9 11.9 0 0112 24a11.9 11.9 0 01-10.6-6.4l3.9-3.2a7.2 7.2 0 0010.4 3l3.9 3.2-.0.1z"/><path fill="#4285F4" d="M19.8 5.5l-3.9 3.2a7.2 7.2 0 00-12 3l-3.9-3.2A11.9 11.9 0 0112 0a11.9 11.9 0 017.8 2.7l-.0.1.0 2.7z"/></svg>
        Continue with Google
      </button>
    </div>
  );
}

export function Divider() {
  return (
    <div className="relative my-5 text-center">
      <div className="absolute inset-x-0 top-1/2 h-px bg-white/10" />
      <span className="relative inline-block bg-bg-surface px-3 text-xs uppercase tracking-wider text-ink-dim">or</span>
    </div>
  );
}

export function Field({
  label,
  type = "text",
  placeholder,
  rightLink,
}: {
  label: string;
  type?: string;
  placeholder?: string;
  rightLink?: ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium uppercase tracking-wider text-ink-dim">{label}</label>
        {rightLink}
      </div>
      <input
        type={type}
        placeholder={placeholder}
        className="h-10 rounded-lg border border-white/10 bg-bg-surface px-3 text-sm text-ink placeholder:text-ink-dim focus:border-cyan-glow/50 focus:outline-none focus:ring-2 focus:ring-cyan-glow/20"
      />
    </div>
  );
}
