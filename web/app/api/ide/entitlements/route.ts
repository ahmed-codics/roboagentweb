import { NextRequest } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { authenticate, ok } from "@/lib/roboagent/ide-auth";
import { getEntitlements } from "@/lib/roboagent/queries";

/**
 * GET /roboagent/api/ide/entitlements
 *
 * The user's plan and remaining quota. Same payload the heartbeat returns, split
 * out so the IDE can re-check cheaply — after an upgrade, or before starting a
 * quota-bearing action — without pretending to be a heartbeat and moving
 * last_seen_at.
 *
 *   Authorization: Bearer <access token>
 *   -> 200 { plan, status, periodStart, periodEnd, usage, quotas }
 *
 * Read-only, so it is a GET; entitlements are computed from the verified token's
 * user id and nothing in the request can influence the answer.
 */

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
	const auth = await authenticate(req);
	if (!auth.ok) return auth.response;

	const admin = createSupabaseAdminClient();
	return ok(await getEntitlements(admin, auth.auth.user.id));
}
