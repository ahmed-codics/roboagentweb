import { NextRequest } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { authenticate, ok } from "@/lib/roboagent/ide-auth";
import {
	getDailyActivity,
	getDevices,
	getEntitlements,
	getProjects,
	getRecentSessions,
} from "@/lib/roboagent/queries";

/**
 * GET /roboagent/api/dashboard/summary
 *
 * Everything the dashboard renders, in one round trip.
 *
 * Authenticated by bearer token rather than by the session cookie, even though
 * the caller is our own web page. The reason is concrete: this app has no
 * middleware, so a Server Component cannot write a refreshed auth cookie, and a
 * cookie-based read would start failing an hour after sign-in with no way to
 * recover. The browser client already holds a continuously-refreshed access token
 * (autoRefreshToken is on in lib/supabase/client.ts), so handing that to the same
 * authenticate() helper the IDE endpoints use is both simpler and more reliable.
 *
 * Queries run through the admin client, explicitly scoped to the verified token's
 * user id — the same discipline as the /api/ide/* routes. Note that these tables
 * do have SELECT RLS policies, so a future Server Component could read them
 * directly with a user-scoped client; nothing here depends on bypassing RLS
 * beyond avoiding the cookie-refresh problem above.
 */

export const dynamic = "force-dynamic";

const ACTIVITY_DAYS = 30;

export async function GET(req: NextRequest) {
	const auth = await authenticate(req);
	if (!auth.ok) return auth.response;

	const userId = auth.auth.user.id;
	const db = createSupabaseAdminClient();

	// Independent reads — run them together rather than paying five serial round
	// trips to Supabase on every dashboard load.
	const [entitlements, devices, projects, sessions, activityByDay] = await Promise.all([
		getEntitlements(db, userId),
		getDevices(db, userId),
		getProjects(db, userId),
		getRecentSessions(db, userId),
		getDailyActivity(db, userId, ACTIVITY_DAYS),
	]);

	// Fill gaps so the chart has one point per day. A sparse series would render a
	// week of silence as a straight line between two busy days, which reads as
	// steady activity — the opposite of the truth.
	const activity: Array<{ date: string; count: number }> = [];
	const today = new Date();
	for (let i = ACTIVITY_DAYS - 1; i >= 0; i--) {
		const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - i));
		const key = d.toISOString().slice(0, 10);
		activity.push({ date: key, count: activityByDay.get(key) ?? 0 });
	}

	return ok({
		entitlements,
		devices,
		projects,
		sessions,
		activity,
		// Lets the UI tell "you have no data yet" apart from "your IDE has never
		// talked to us" — two different empty states with two different fixes.
		hasEverSynced: devices.length > 0 || projects.length > 0 || sessions.length > 0,
	});
}
