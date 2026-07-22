"use client";

// Supabase browser client for roboagentweb (SSO edition).
//
// Replaces NextAuth. Uses @supabase/ssr cookie storage so this app shares one
// login with rc_website / RoboHub / connected-labs on the same origin. Cookie
// options are kept byte-identical with the other apps. `path: '/'` (NOT the
// /roboagent basePath) is required so the cookie is shared across all sub-paths.
import { createBrowserClient } from "@supabase/ssr";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

const isHttps =
  typeof window !== "undefined" && window.location.protocol === "https:";

export const supabase = createBrowserClient(url, anonKey, {
  cookieOptions: {
    path: "/",
    sameSite: "lax",
    secure: isHttps,
  },
  auth: {
    flowType: "pkce",
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
