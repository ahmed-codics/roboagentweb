"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./client";

/**
 * Shared client-side view of the Supabase session.
 *
 * `loading` starts true and is what callers must gate on: rendering a signed-out
 * state while the session is still being read from the cookie is exactly the bug
 * that made the nav show "Sign in" to users who were already signed in.
 *
 * onAuthStateChange keeps every consumer in sync, so signing in on /login updates
 * the nav without a reload.
 */
export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      setSession(data.session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, next) => {
      if (cancelled) return;
      setSession(next);
      setLoading(false);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  return { session, user: session?.user ?? null, loading };
}

/** Best-effort display name, falling back through metadata to the email local part. */
export function displayName(user: { email?: string; user_metadata?: Record<string, unknown> } | null): string {
  if (!user) return "";
  const meta = user.user_metadata ?? {};
  const full = typeof meta.full_name === "string" ? meta.full_name : "";
  const name = typeof meta.name === "string" ? meta.name : "";
  const userName = typeof meta.user_name === "string" ? meta.user_name : "";
  return full || name || userName || user.email?.split("@")[0] || "";
}
