import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient, createSupabaseAnonClient } from "@/lib/supabase/admin";
import {
  CODE_TTL_SECONDS,
  generateCode,
  hashCode,
  isAllowedRedirect,
} from "@/lib/desktop-auth";

/**
 * POST /roboagent/api/desktop-auth/issue
 *
 * Called by the browser-side /desktop-auth page on behalf of a signed-in user.
 * Mints a single-use authorization code bound to the desktop app's PKCE challenge.
 *
 *   Authorization: Bearer <the browser session's access token>
 *   { code_challenge, code_challenge_method: "S256", redirect_uri }
 *   -> 200 { code, expires_in }
 *
 * The code is returned to the PAGE, which then redirects to the loopback listener
 * with it. No token ever leaves this endpoint.
 */

// This route reads per-request auth and must never be prerendered or cached.
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: {
    code_challenge?: unknown;
    code_challenge_method?: unknown;
    redirect_uri?: unknown;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "invalid_request", error_description: "Body must be JSON" },
      { status: 400 },
    );
  }

  const codeChallenge = typeof body.code_challenge === "string" ? body.code_challenge : "";
  const method = typeof body.code_challenge_method === "string" ? body.code_challenge_method : "";
  const redirectUri = typeof body.redirect_uri === "string" ? body.redirect_uri : "";

  // S256 only. Accepting `plain` would let anyone who intercepts the redirect
  // redeem the code, which is the whole thing PKCE exists to prevent.
  if (method !== "S256") {
    return NextResponse.json(
      { error: "invalid_request", error_description: "code_challenge_method must be S256" },
      { status: 400 },
    );
  }

  // A base64url SHA-256 digest is always 43 chars.
  if (!codeChallenge || codeChallenge.length !== 43 || !/^[A-Za-z0-9_-]+$/.test(codeChallenge)) {
    return NextResponse.json(
      { error: "invalid_request", error_description: "Malformed code_challenge" },
      { status: 400 },
    );
  }

  if (!isAllowedRedirect(redirectUri)) {
    return NextResponse.json(
      {
        error: "invalid_request",
        error_description:
          "redirect_uri must be a loopback http address or the roboagent: scheme",
      },
      { status: 400 },
    );
  }

  // Authenticate the caller. getUser() validates against the auth server rather
  // than trusting a locally-decoded token.
  const authHeader = req.headers.get("authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "unauthorized", error_description: "Missing bearer token" },
      { status: 401 },
    );
  }
  const accessToken = authHeader.slice(7);

  const anon = createSupabaseAnonClient();
  const { data: userData, error: userError } = await anon.auth.getUser(accessToken);

  if (userError || !userData?.user?.email) {
    return NextResponse.json(
      { error: "unauthorized", error_description: "Invalid or expired session" },
      { status: 401 },
    );
  }

  const user = userData.user;
  const code = generateCode();
  const expiresAt = new Date(Date.now() + CODE_TTL_SECONDS * 1000);

  const admin = createSupabaseAdminClient();
  const { error: insertError } = await admin.from("desktop_auth_codes").insert({
    code_hash: hashCode(code),
    code_challenge: codeChallenge,
    user_id: user.id,
    user_email: user.email,
    redirect_uri: redirectUri,
    expires_at: expiresAt.toISOString(),
  });

  if (insertError) {
    console.error("desktop-auth/issue: insert failed", insertError.message);
    return NextResponse.json(
      { error: "server_error", error_description: "Could not issue code" },
      { status: 500 },
    );
  }

  return NextResponse.json(
    { code, expires_in: CODE_TTL_SECONDS },
    { headers: { "Cache-Control": "no-store" } },
  );
}
