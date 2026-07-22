"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

/**
 * Desktop sign-in handoff for the RoboAgent IDE.
 *
 * The IDE opens this page in the SYSTEM browser with a PKCE challenge and a
 * loopback redirect target. Because every Robotics Corner app shares one session
 * cookie, an already-signed-in user passes straight through without a prompt.
 *
 * This page hands back a single-use CODE, never a token. The previous version put
 * the access and refresh token in the query string of an unvalidated `callbackUrl`,
 * so `?callbackUrl=https://evil.example` exfiltrated a full session from any
 * logged-in visitor. Both problems are fixed here: the redirect target is
 * allowlisted client-side and re-validated server-side, and the payload is a code
 * that is useless without the verifier held by the desktop process.
 */

type Status = "checking" | "redirecting" | "signin" | "error";

/** Mirrors lib/desktop-auth.ts. Duplicated because that module is server-only. */
function isAllowedRedirect(raw: string): boolean {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return false;
  }
  if (url.protocol === "roboagent:") return true;
  if (url.protocol === "http:") {
    const h = url.hostname;
    return h === "127.0.0.1" || h === "localhost" || h === "[::1]" || h === "::1";
  }
  return false;
}

function DesktopAuthInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<Status>("checking");
  const [message, setMessage] = useState("");

  const codeChallenge = searchParams?.get("code_challenge") ?? "";
  const method = searchParams?.get("code_challenge_method") ?? "";
  const state = searchParams?.get("state") ?? "";
  const redirectUri = searchParams?.get("redirect_uri") ?? "";

  useEffect(() => {
    let cancelled = false;

    const fail = (msg: string) => {
      if (cancelled) return;
      setStatus("error");
      setMessage(msg);
    };

    // Only ever navigate to a target that passed the allowlist.
    const bounce = (params: Record<string, string>) => {
      const url = new URL(redirectUri);
      for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
      if (!cancelled) {
        setStatus("redirecting");
        window.location.href = url.toString();
      }
    };

    if (!redirectUri || !isAllowedRedirect(redirectUri)) {
      fail(
        "This sign-in link is not valid. The desktop app must supply a local " +
          "callback address. Nothing has been shared.",
      );
      return;
    }
    if (method !== "S256" || codeChallenge.length !== 43) {
      bounce({ error: "invalid_request", error_description: "Missing or invalid PKCE challenge" });
      return;
    }
    if (!state) {
      bounce({ error: "invalid_request", error_description: "Missing state" });
      return;
    }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (cancelled) return;

      if (!session?.access_token) {
        // Preserve the whole desktop request across the login round trip, so the
        // user lands back here with the challenge and redirect intact.
        setStatus("signin");
        const returnTo = `/desktop-auth?${searchParams?.toString() ?? ""}`;
        router.push(`/login?callbackUrl=${encodeURIComponent(returnTo)}`);
        return;
      }

      try {
        const res = await fetch("/roboagent/api/desktop-auth/issue", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            code_challenge: codeChallenge,
            code_challenge_method: "S256",
            redirect_uri: redirectUri,
          }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok || !data.code) {
          bounce({
            error: data.error ?? "server_error",
            error_description: data.error_description ?? "Could not issue an authorization code",
          });
          return;
        }

        bounce({ code: data.code, state });
      } catch {
        bounce({ error: "server_error", error_description: "Network error issuing code" });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [router, searchParams, redirectUri, codeChallenge, method, state]);

  const heading =
    status === "error"
      ? "Sign-in link not valid"
      : status === "signin"
        ? "Taking you to sign in…"
        : status === "redirecting"
          ? "Returning to RoboAgent…"
          : "Signing you in…";

  const body =
    status === "error"
      ? message
      : status === "signin"
        ? "You'll come straight back here afterwards."
        : status === "redirecting"
          ? "You can close this tab."
          : "Checking your Robotics Corner session.";

  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50 px-6">
      <div className="max-w-md text-center">
        <h2 className="text-xl font-semibold text-slate-800">{heading}</h2>
        <p className="mt-2 text-sm text-slate-500">{body}</p>

        {status !== "error" && (
          <div className="mt-4 flex justify-center">
            <svg className="h-8 w-8 animate-spin text-cyan-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DesktopAuthPage() {
  return (
    <Suspense fallback={null}>
      <DesktopAuthInner />
    </Suspense>
  );
}
