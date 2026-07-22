import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client. SERVER ONLY.
 *
 * The key is read from SUPABASE_SERVICE_ROLE_KEY — deliberately NOT prefixed with
 * NEXT_PUBLIC_, so Next.js will never inline it into a client bundle. Importing
 * this module from a "use client" file will fail the build, which is the intent.
 *
 * This key bypasses row-level security entirely. Every query made with it must be
 * scoped explicitly to a single user; there is no database-side safety net.
 */
export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Supabase admin client requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY",
    );
  }

  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * Anon client for server-side use where we explicitly want RLS and no elevated
 * rights — e.g. validating a user's bearer token, or redeeming a one-time OTP to
 * mint a fresh session for the desktop app.
 */
export function createSupabaseAnonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase anon client requires NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  }

  return createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
