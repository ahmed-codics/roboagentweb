import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient, createSupabaseAnonClient } from "@/lib/supabase/admin";
import { hashCode, verifyPkce } from "@/lib/desktop-auth";

/**
 * POST /roboagent/api/desktop-auth/exchange
 *
 *   { code, code_verifier }  ->  200 { access_token, refresh_token, ... , user }
 *
 * Unauthenticated by design: possession of the code plus the matching PKCE
 * verifier IS the credential. This is a POST so tokens never appear in a URL.
 *
 * The session returned is a NEW, independent session minted for the desktop app —
 * not a copy of the browser's. That matters because Supabase rotates refresh
 * tokens: handing the browser's refresh token to the IDE would mean whichever
 * client refreshed second got a revoked token and was silently signed out.
 */

export const dynamic = "force-dynamic";

const invalidGrant = (description: string) =>
  NextResponse.json(
    { error: "invalid_grant", error_description: description },
    { status: 400, headers: { "Cache-Control": "no-store" } },
  );

export async function POST(req: NextRequest) {
  let body: { code?: unknown; code_verifier?: unknown };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "invalid_request", error_description: "Body must be JSON" },
      { status: 400 },
    );
  }

  const code = typeof body.code === "string" ? body.code : "";
  const codeVerifier = typeof body.code_verifier === "string" ? body.code_verifier : "";

  if (!code || !codeVerifier) {
    return NextResponse.json(
      { error: "invalid_request", error_description: "code and code_verifier are required" },
      { status: 400 },
    );
  }

  const admin = createSupabaseAdminClient();

  // Claim the code atomically. `used_at is null` in the WHERE clause is what makes
  // this single-use under concurrency — two simultaneous redemptions cannot both
  // match, so exactly one gets a row back.
  const { data: claimed, error: claimError } = await admin
    .from("desktop_auth_codes")
    .update({ used_at: new Date().toISOString() })
    .eq("code_hash", hashCode(code))
    .is("used_at", null)
    .select("code_challenge, user_id, user_email, expires_at")
    .maybeSingle();

  if (claimError) {
    console.error("desktop-auth/exchange: claim failed", claimError.message);
    return NextResponse.json(
      { error: "server_error", error_description: "Could not redeem code" },
      { status: 500 },
    );
  }

  // Deliberately identical response for unknown / already-used codes — telling a
  // caller which one it was would confirm that a code existed.
  if (!claimed) return invalidGrant("Code is invalid, expired, or already used");

  if (new Date(claimed.expires_at) < new Date()) {
    return invalidGrant("Code is invalid, expired, or already used");
  }

  // Note the code is already burned at this point, even if PKCE fails. That is
  // intentional: any redemption attempt consumes it, so an intercepted code cannot
  // be probed repeatedly.
  if (!verifyPkce(codeVerifier, claimed.code_challenge)) {
    return invalidGrant("PKCE verification failed");
  }

  // Mint a fresh session for this user. Supabase has no direct "create a session
  // for user X" admin call, so the supported path is to generate a magic-link OTP
  // (generateLink does NOT send an email) and immediately redeem its hash.
  let session;
  try {
    const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email: claimed.user_email,
    });

    if (linkError || !linkData?.properties?.hashed_token) {
      console.error("desktop-auth/exchange: generateLink failed", linkError?.message);
      return NextResponse.json(
        { error: "server_error", error_description: "Could not create session" },
        { status: 500 },
      );
    }

    const anon = createSupabaseAnonClient();
    const { data: otpData, error: otpError } = await anon.auth.verifyOtp({
      token_hash: linkData.properties.hashed_token,
      type: "magiclink",
    });

    if (otpError || !otpData?.session) {
      console.error("desktop-auth/exchange: verifyOtp failed", otpError?.message);
      return NextResponse.json(
        { error: "server_error", error_description: "Could not create session" },
        { status: 500 },
      );
    }

    session = otpData.session;
  } catch (err) {
    console.error("desktop-auth/exchange: unexpected failure", err);
    return NextResponse.json(
      { error: "server_error", error_description: "Could not create session" },
      { status: 500 },
    );
  }

  // Opportunistic cleanup; never block the response on it.
  void admin.rpc("purge_expired_desktop_auth_codes").then(
    () => undefined,
    () => undefined,
  );

  return NextResponse.json(
    {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      token_type: session.token_type ?? "bearer",
      expires_in: session.expires_in,
      expires_at: session.expires_at,
      user: {
        id: session.user.id,
        email: session.user.email,
        user_metadata: session.user.user_metadata,
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
