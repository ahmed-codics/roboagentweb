import { NextRequest } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { authenticate, badRequest, ok, readJson, serverError, str } from "@/lib/roboagent/ide-auth";
import { getEntitlements } from "@/lib/roboagent/queries";

/**
 * POST /roboagent/api/ide/heartbeat
 *
 * Called by the IDE on sign-in, on launch with a restored session, and then
 * periodically (every ~15 min while the window has focus). Two jobs:
 *
 *   1. Register/refresh this installation, so the dashboard can show the user
 *      which machines are signed in — the one piece of account state people
 *      actually go looking for.
 *   2. Return the user's entitlements, so the IDE gates features against the
 *      same numbers the pricing page advertises instead of its own copy.
 *
 *   Authorization: Bearer <access token>
 *   { install_id, hostname?, platform?, arch?, app_version?, os_release? }
 *   -> 200 { device: { id }, entitlements: { … } }
 *
 * This is the only endpoint the IDE strictly needs. Telemetry is additive; if
 * /api/ide/telemetry is never called the dashboard degrades to devices + plan,
 * which is honest rather than broken.
 */

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
	const auth = await authenticate(req);
	if (!auth.ok) return auth.response;

	const parsed = await readJson(req);
	if (!parsed.ok) return parsed.response;

	const body = (parsed.body ?? {}) as Record<string, unknown>;
	const installId = str(body.install_id, 128);

	// The only required field. Without it every launch would create a new device
	// row and the dashboard would fill with phantom machines.
	if (!installId) return badRequest("install_id is required");

	const userId = auth.auth.user.id;
	const admin = createSupabaseAdminClient();
	const now = new Date().toISOString();

	const { data: device, error } = await admin
		.from("roboagent_devices")
		.upsert(
			{
				user_id: userId,
				install_id: installId,
				hostname: str(body.hostname, 255),
				platform: str(body.platform, 32),
				arch: str(body.arch, 32),
				app_version: str(body.app_version, 64),
				os_release: str(body.os_release, 128),
				last_seen_at: now,
			},
			{ onConflict: "user_id,install_id" },
		)
		.select("id")
		.single();

	if (error) {
		console.error("ide/heartbeat: device upsert failed", error.message);
		return serverError("Could not record device");
	}

	// Note: first_seen_at is intentionally left out of the upsert payload. Including
	// it would reset the "signed in since" date on every heartbeat; the column
	// default populates it on insert and nothing should touch it again.

	const entitlements = await getEntitlements(admin, userId);

	return ok({ device: { id: device.id }, entitlements });
}
