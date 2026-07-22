import { NextRequest, NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { createSupabaseAnonClient } from "@/lib/supabase/admin";

/**
 * Bearer-token authentication for the /api/ide/* endpoints.
 *
 * The desktop app already holds a Supabase access token from the PKCE flow (see
 * lib/desktop-auth.ts and docs/10). It presents that token here; there is no
 * second credential, no API key, no app token — exactly as promised in docs/10 §5.
 *
 * Validation goes through auth.getUser(), which asks the auth server, rather than
 * decoding the JWT locally. That costs a round trip and is worth it: a locally
 * decoded token still looks valid after the user signs out or an admin disables
 * the account, and these endpoints write billing-relevant rows.
 */

export interface AuthedRequest {
	readonly user: User;
	readonly accessToken: string;
}

/** Failure is returned, not thrown, so route handlers stay linear and explicit. */
export type AuthResult = { ok: true; auth: AuthedRequest } | { ok: false; response: NextResponse };

const unauthorized = (description: string) =>
	NextResponse.json(
		{ error: "unauthorized", error_description: description },
		{ status: 401, headers: { "Cache-Control": "no-store" } },
	);

export async function authenticate(req: NextRequest): Promise<AuthResult> {
	const header = req.headers.get("authorization") ?? "";
	if (!header.startsWith("Bearer ")) {
		return { ok: false, response: unauthorized("Missing bearer token") };
	}

	const accessToken = header.slice(7).trim();
	if (!accessToken) {
		return { ok: false, response: unauthorized("Missing bearer token") };
	}

	const anon = createSupabaseAnonClient();
	const { data, error } = await anon.auth.getUser(accessToken);

	if (error || !data?.user) {
		// Same message for expired, revoked and malformed. The client's only correct
		// reaction to any of them is identical — refresh, then sign out if that fails
		// (docs/10 §8) — so distinguishing them would leak token state for nothing.
		return { ok: false, response: unauthorized("Invalid or expired session") };
	}

	return { ok: true, auth: { user: data.user, accessToken } };
}

export const badRequest = (description: string) =>
	NextResponse.json(
		{ error: "invalid_request", error_description: description },
		{ status: 400, headers: { "Cache-Control": "no-store" } },
	);

export const serverError = (description: string) =>
	NextResponse.json(
		{ error: "server_error", error_description: description },
		{ status: 500, headers: { "Cache-Control": "no-store" } },
	);

export const ok = <T extends object>(body: T) =>
	NextResponse.json(body, { headers: { "Cache-Control": "no-store" } });

/** Parse a JSON body, returning a 400 rather than throwing on malformed input. */
export async function readJson(req: NextRequest): Promise<{ ok: true; body: unknown } | { ok: false; response: NextResponse }> {
	try {
		return { ok: true, body: await req.json() };
	} catch {
		return { ok: false, response: badRequest("Body must be JSON") };
	}
}

// --- small typed accessors -------------------------------------------------
// The bodies below arrive from a desktop binary we do not control the version of.
// An old IDE will keep POSTing an old shape long after the server moves on, so
// every field is read defensively and a wrong type is treated as absent rather
// than crashing the batch.

export function str(v: unknown, maxLength = 512): string | null {
	if (typeof v !== "string") return null;
	const trimmed = v.trim();
	if (!trimmed) return null;
	return trimmed.slice(0, maxLength);
}

export function int(v: unknown, { min = 0, max = Number.MAX_SAFE_INTEGER } = {}): number | null {
	if (typeof v !== "number" || !Number.isFinite(v)) return null;
	return Math.min(max, Math.max(min, Math.trunc(v)));
}

/** Accepts an ISO string or epoch milliseconds — the IDE's own types use both. */
export function timestamp(v: unknown): string | null {
	if (typeof v === "number" && Number.isFinite(v)) {
		const d = new Date(v);
		return Number.isNaN(d.getTime()) ? null : d.toISOString();
	}
	if (typeof v === "string") {
		const d = new Date(v);
		return Number.isNaN(d.getTime()) ? null : d.toISOString();
	}
	return null;
}

export function oneOf<T extends string>(v: unknown, allowed: readonly T[]): T | null {
	return typeof v === "string" && (allowed as readonly string[]).includes(v) ? (v as T) : null;
}
