// Supabase server client for roboagentweb (SSO edition) — for use in Server
// Components, Route Handlers and Server Actions. Reads/writes the shared
// session cookie via Next's cookie store. Keep cookie `path: '/'` so it stays
// shared with the other apps (not scoped to the /roboagent basePath).
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    {
      cookieOptions: {
        path: "/",
        sameSite: "lax",
      },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component where cookies are read-only; the
            // middleware/route handler is responsible for refreshing instead.
          }
        },
      },
    },
  );
}
