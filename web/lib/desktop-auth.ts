import { createHash, randomBytes, timingSafeEqual } from "crypto";

/**
 * Shared helpers for the RoboAgent IDE desktop sign-in flow.
 *
 * Server-only (imports node:crypto). Do not import from a "use client" module.
 */

/** Codes are deliberately short-lived — the desktop redeems within seconds. */
export const CODE_TTL_SECONDS = 120;

export function base64url(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function sha256(input: string): Buffer {
  return createHash("sha256").update(input).digest();
}

/** Opaque authorization code handed to the browser. */
export function generateCode(): string {
  return base64url(randomBytes(32));
}

/** What we persist. The raw code is never stored. */
export function hashCode(code: string): string {
  return base64url(sha256(code));
}

/** PKCE S256 check: base64url(SHA256(verifier)) must equal the stored challenge. */
export function verifyPkce(codeVerifier: string, codeChallenge: string): boolean {
  // RFC 7636 section 4.1 — a verifier outside 43..128 chars is malformed.
  if (codeVerifier.length < 43 || codeVerifier.length > 128) return false;

  const computed = Buffer.from(base64url(sha256(codeVerifier)));
  const expected = Buffer.from(codeChallenge);
  if (computed.length !== expected.length) return false;
  return timingSafeEqual(computed, expected);
}

/**
 * Redirect-target allowlist.
 *
 * This is the single most important check in the flow. The page this replaced
 * accepted ANY `callbackUrl` and sent the user's access and refresh token to it,
 * so `?callbackUrl=https://evil.example` exfiltrated a full session from any
 * logged-in visitor.
 *
 * Two shapes are permitted, both of which keep the payload on the user's machine:
 *   - loopback HTTP  — http://127.0.0.1:<port>/<path> or http://localhost:<port>/...
 *   - the app's own custom scheme — roboagent://...
 *
 * Everything else is rejected. Note `[::1]` is included because Node's loopback
 * listener may report an IPv6 address on some hosts.
 */
export function isAllowedRedirect(raw: string): boolean {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return false;
  }

  if (url.protocol === "roboagent:") return true;

  if (url.protocol === "http:") {
    const host = url.hostname;
    return host === "127.0.0.1" || host === "localhost" || host === "[::1]" || host === "::1";
  }

  // Explicitly not https: a remote https target is exactly the exfiltration case.
  return false;
}

/** Append query params to a redirect target, preserving any it already carries. */
export function withParams(target: string, params: Record<string, string>): string {
  const url = new URL(target);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return url.toString();
}
