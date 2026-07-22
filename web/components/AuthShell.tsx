"use client";

import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Logo } from "./Logo";
import { supabase } from "@/lib/supabase/client";

// The app is served under this basePath (see next.config.ts). OAuth redirectTo
// needs an absolute URL to a real page, and window.location.origin does not
// include the basePath, so we prepend it explicitly.
const BASE_PATH = "/roboagent";

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
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-slate-50/50 flex items-center justify-center">
      {/* Ambient Orbs */}
      <div className="pointer-events-none absolute -top-40 -left-40 -z-10 h-[600px] w-[600px] rounded-full bg-cyan-200/10 blur-[100px] animate-pulse-glow" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 -z-10 h-[600px] w-[600px] rounded-full bg-emerald-200/10 blur-[100px] animate-pulse-glow" />
      <div className="pointer-events-none absolute inset-0 -z-20 bg-grid opacity-30" />

      <div className="w-full max-w-md px-6 py-12">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:border-cyan-200">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{title}</h1>
          <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
        <div className="mt-6 text-center text-xs text-slate-400 font-semibold">{footer}</div>
        <div className="mt-8 text-center">
          <Link href="/" className="text-xs text-slate-400 hover:text-slate-600 transition-colors font-bold inline-flex items-center gap-1.5">
            <span>← Back to home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * `callbackUrl` overrides the query-string value. The login page passes the
 * destination it resolved itself, which is how a desktop (PKCE) sign-in survives
 * an OAuth round trip — the IDE sends its parameters bare, with no callbackUrl
 * for this component to find.
 */
export function OAuthButtons({ callbackUrl }: { callbackUrl?: string } = {}) {
  return (
    <Suspense fallback={null}>
      <OAuthButtonsInner callbackUrl={callbackUrl} />
    </Suspense>
  );
}

function OAuthButtonsInner({ callbackUrl }: { callbackUrl?: string }) {
  const searchParams = useSearchParams();
  const callbackPath = callbackUrl || searchParams?.get("callbackUrl") || "/dashboard";

  const signInWithGithub = async () => {
    const redirectTo = `${window.location.origin}${BASE_PATH}${
      callbackPath.startsWith("/") ? callbackPath : `/${callbackPath}`
    }`;
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo },
    });
  };

  return (
    <div className="grid grid-cols-1 gap-3">
      <button
        type="button"
        onClick={signInWithGithub}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-200"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current text-slate-800"><path d="M12 .3a12 12 0 00-3.8 23.4c.6.1.8-.3.8-.6v-2.1c-3.4.7-4.1-1.6-4.1-1.6-.5-1.4-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.6-1.4-5.6-6.1 0-1.3.5-2.4 1.2-3.3-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.3a11.5 11.5 0 016 0c2.3-1.6 3.3-1.3 3.3-1.3.7 1.7.2 2.9.1 3.2.8.9 1.2 2 1.2 3.3 0 4.7-2.9 5.7-5.6 6 .4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0012 .3"/></svg>
        <span>Continue with GitHub</span>
      </button>
    </div>
  );
}

export function Divider() {
  return (
    <div className="relative my-6 text-center">
      <div className="absolute inset-x-0 top-1/2 h-px bg-slate-200" />
      <span className="relative inline-block bg-white px-4 text-xs font-semibold uppercase tracking-wider text-slate-400">or</span>
    </div>
  );
}

export function Field({
  label,
  rightLink,
  ...inputProps
}: {
  label: string;
  rightLink?: ReactNode;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</label>
        {rightLink}
      </div>
      <input
        className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 placeholder:text-slate-400 transition duration-200 focus:border-cyan-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
        {...inputProps}
      />
    </div>
  );
}
