"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AuthShell, OAuthButtons, Divider, Field } from "@/components/AuthShell";
import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabase/client";
import { useSession } from "@/lib/supabase/use-session";

/**
 * Only same-origin relative paths are honoured as a post-login destination.
 * `callbackUrl` comes from the query string, so accepting an absolute URL here
 * would turn the login page into an open redirect.
 */
function safeCallback(raw: string | null | undefined): string {
  if (!raw) return "/dashboard";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/dashboard";
  return raw;
}

/** The PKCE parameters the desktop IDE appends when it opens this page. */
const DESKTOP_PARAMS = ["code_challenge", "code_challenge_method", "state", "redirect_uri"] as const;

/**
 * Resolve where to send the user once they are authenticated.
 *
 * The RoboAgent IDE opens `/login?code_challenge=…&state=…&redirect_uri=…`
 * directly — it does NOT send a `callbackUrl`. This page used to read only
 * `callbackUrl`, so those four parameters were dropped on the floor and every
 * desktop sign-in dead-ended on /dashboard with the IDE still waiting on its
 * loopback listener. When the desktop parameters are present we forward the
 * whole request to /desktop-auth, which mints the single-use code and bounces
 * back to 127.0.0.1.
 */
function resolveDestination(params: URLSearchParams | null): string {
  const hasDesktopHandoff = Boolean(params?.get("code_challenge") && params?.get("redirect_uri"));
  if (hasDesktopHandoff) {
    const forwarded = new URLSearchParams();
    for (const key of DESKTOP_PARAMS) {
      const value = params?.get(key);
      if (value) forwarded.set(key, value);
    }
    return `/desktop-auth?${forwarded.toString()}`;
  }
  return safeCallback(params?.get("callbackUrl"));
}

function LoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, loading: sessionLoading } = useSession();
  const destination = useMemo(() => resolveDestination(searchParams), [searchParams]);
  const isDesktopHandoff = destination.startsWith("/desktop-auth");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // An already-signed-in user must not be shown a login form. This is the other
  // half of the desktop flow: the IDE's whole premise is that a shared Robotics
  // Corner session passes straight through to the code handoff without a prompt.
  useEffect(() => {
    if (!sessionLoading && session) router.replace(destination);
  }, [sessionLoading, session, destination, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }
    router.push(destination);
  };

  return (
    <AuthShell
      title="Sign in to RoboAgent"
      subtitle={
        isDesktopHandoff ? (
          <>Sign in to connect the RoboAgent desktop IDE. You&apos;ll return to the app automatically.</>
        ) : (
          <>Welcome back. Continue where you left off.</>
        )
      }
      footer={
        <>
          New to RoboAgent?{" "}
          <Link className="text-cyan-600 hover:text-cyan-700 font-bold hover:underline" href="/register">
            Create an account
          </Link>
        </>
      }
    >
      <OAuthButtons callbackUrl={destination} />
      <Divider />
      <form onSubmit={handleSubmit} className="grid gap-4">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-600 animate-fade-in">
            {error}
          </div>
        )}
        <Field
          label="Email"
          type="email"
          placeholder="you@robotics.co"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Field
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          rightLink={
            <Link href="/forgot" className="text-xs text-slate-400 hover:text-slate-600 transition-colors font-semibold">
              Forgot?
            </Link>
          }
        />
        <Button size="lg" className="w-full mt-2" type="submit" disabled={loading}>
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Signing in...
            </span>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>
    </AuthShell>
  );
}

export default function LoginPage() {
  // useSearchParams needs a Suspense boundary or the route opts out of static
  // rendering and the build fails.
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}
