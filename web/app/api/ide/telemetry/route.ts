import { NextRequest } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
	authenticate,
	badRequest,
	int,
	oneOf,
	ok,
	readJson,
	serverError,
	str,
	timestamp,
} from "@/lib/roboagent/ide-auth";

/**
 * POST /roboagent/api/ide/telemetry
 *
 * The ingest endpoint behind every real number on the dashboard. The IDE batches
 * up its local activity and flushes it here; the shape is described in full, from
 * the desktop side, in docs/11.
 *
 *   Authorization: Bearer <access token>
 *   { install_id, project?, sessions?, events? }
 *   -> 200 { project_id, sessions_synced, events_accepted, events_duplicate }
 *
 * Three properties this endpoint is built around:
 *
 *   * Idempotent. Usage events carry a client-generated event_key and land via
 *     ON CONFLICT DO NOTHING. A desktop app retries — offline queues get flushed
 *     twice, a crash replays the last batch — and double-counting a metered event
 *     is a billing bug, not a cosmetic one.
 *
 *   * Partial-failure tolerant. A malformed session in a batch of forty must not
 *     discard the other thirty-nine, because the client's only recovery is to
 *     resend the same bad batch forever. Bad entries are skipped and counted.
 *
 *   * user_id is taken from the verified token and never from the body. The
 *     admin client bypasses RLS, so this is the only thing stopping one user
 *     from writing telemetry into another's account.
 */

export const dynamic = "force-dynamic";

// Caps exist so one client cannot pin a request thread with a 50k-row array.
// The client is told to chunk (docs/11 §4); anything beyond the cap is rejected
// outright rather than silently truncated, because silent truncation looks like
// success and quietly loses billable events.
const MAX_SESSIONS = 100;
const MAX_EVENTS = 500;

const EVENT_KINDS = ["model_turn", "tool_call", "sim_run", "build", "workspace_index"] as const;

export async function POST(req: NextRequest) {
	const auth = await authenticate(req);
	if (!auth.ok) return auth.response;

	const parsed = await readJson(req);
	if (!parsed.ok) return parsed.response;

	const body = (parsed.body ?? {}) as Record<string, unknown>;
	const userId = auth.auth.user.id;
	const admin = createSupabaseAdminClient();

	const sessions = Array.isArray(body.sessions) ? body.sessions : [];
	const events = Array.isArray(body.events) ? body.events : [];

	if (sessions.length > MAX_SESSIONS) {
		return badRequest(`Too many sessions in one batch (max ${MAX_SESSIONS})`);
	}
	if (events.length > MAX_EVENTS) {
		return badRequest(`Too many events in one batch (max ${MAX_EVENTS})`);
	}

	// --- resolve the device ------------------------------------------------
	// Best-effort: telemetry from an IDE that has not yet heartbeated is still
	// worth keeping, just without a device attribution.
	let deviceId: string | null = null;
	const installId = str(body.install_id, 128);
	if (installId) {
		const { data } = await admin
			.from("roboagent_devices")
			.select("id")
			.eq("user_id", userId)
			.eq("install_id", installId)
			.maybeSingle();
		deviceId = data?.id ?? null;
	}

	// --- upsert the project ------------------------------------------------
	let projectId: string | null = null;
	const project = (body.project ?? null) as Record<string, unknown> | null;

	if (project && typeof project === "object") {
		const projectKey = str(project.project_key, 128);
		const name = str(project.name, 255);

		// Both are required together: project_key is the identity and name is the
		// only label the IDE has for it, so a row missing either is unusable.
		if (projectKey && name) {
			const graph = (project.graph ?? {}) as Record<string, unknown>;

			const { data, error } = await admin
				.from("roboagent_projects")
				.upsert(
					{
						user_id: userId,
						project_key: projectKey,
						name,
						// Mirrors ProjectConfig from .roboagent/project.json. All optional:
						// a plain folder opened in the IDE never went through the wizard.
						control_level: oneOf(project.control_level, ["high", "low"] as const),
						domain: oneOf(project.domain, ["ros2", "opencv", "nlp"] as const),
						env: oneOf(project.env, ["host", "target", "vm"] as const),
						target: str(project.target, 64),
						created_with: str(project.created_with, 128),
						// Summary of Ros2WorkspaceGraph, which the IDE holds in memory only.
						ros_distro: str(graph.ros_distro ?? project.ros_distro, 64),
						package_count: int(graph.packages) ?? 0,
						node_count: int(graph.nodes) ?? 0,
						topic_count: int(graph.topics) ?? 0,
						launch_count: int(graph.launch_files) ?? 0,
						indexed_at: timestamp(graph.indexed_at),
						last_opened_at: new Date().toISOString(),
					},
					{ onConflict: "user_id,project_key" },
				)
				.select("id")
				.single();

			if (error) {
				console.error("ide/telemetry: project upsert failed", error.message);
				return serverError("Could not record project");
			}
			projectId = data.id;
		}
	}

	// --- upsert sessions ---------------------------------------------------
	// Sessions are mutable running totals: the same session_id is resent as the
	// conversation grows, and each flush overwrites the previous counters. That is
	// why these are absolute values from the client, not increments — an increment
	// protocol would drift permanently the first time a flush was lost.
	let sessionsSynced = 0;

	const sessionRows = sessions
		.map((raw) => {
			if (!raw || typeof raw !== "object") return null;
			const s = raw as Record<string, unknown>;

			const sessionId = str(s.session_id, 128);
			const startedAt = timestamp(s.started_at);
			if (!sessionId || !startedAt) return null;

			return {
				user_id: userId,
				session_id: sessionId,
				project_id: projectId,
				device_id: deviceId,
				// Titles are IDE-generated summaries, but a user can rename a session to
				// anything. Truncated, and the client is told it may omit it entirely.
				title: str(s.title, 255),
				location: str(s.location, 32),
				started_at: startedAt,
				last_message_at: timestamp(s.last_message_at),
				request_count: int(s.request_count) ?? 0,
				tool_call_count: int(s.tool_call_count) ?? 0,
				input_tokens: int(s.input_tokens) ?? 0,
				output_tokens: int(s.output_tokens) ?? 0,
				cached_tokens: int(s.cached_tokens) ?? 0,
				primary_model: str(s.primary_model, 128),
				files_changed: int(s.files_changed) ?? 0,
				lines_added: int(s.lines_added) ?? 0,
				lines_removed: int(s.lines_removed) ?? 0,
				synced_at: new Date().toISOString(),
			};
		})
		.filter((row): row is NonNullable<typeof row> => row !== null);

	if (sessionRows.length > 0) {
		const { error } = await admin
			.from("roboagent_sessions")
			.upsert(sessionRows, { onConflict: "user_id,session_id" });

		if (error) {
			console.error("ide/telemetry: session upsert failed", error.message);
			return serverError("Could not record sessions");
		}
		sessionsSynced = sessionRows.length;
	}

	// --- insert usage events ------------------------------------------------
	let eventsAccepted = 0;

	const eventRows = events
		.map((raw) => {
			if (!raw || typeof raw !== "object") return null;
			const e = raw as Record<string, unknown>;

			const kind = oneOf(e.kind, EVENT_KINDS);
			const eventKey = str(e.event_key, 256);
			const occurredAt = timestamp(e.occurred_at);
			// All three are load-bearing: kind selects the meter, event_key provides
			// idempotency, occurred_at places the event in a billing period.
			if (!kind || !eventKey || !occurredAt) return null;

			return {
				user_id: userId,
				device_id: deviceId,
				project_id: projectId,
				session_id: str(e.session_id, 128),
				kind,
				model: str(e.model, 128),
				input_tokens: int(e.input_tokens) ?? 0,
				output_tokens: int(e.output_tokens) ?? 0,
				cached_tokens: int(e.cached_tokens) ?? 0,
				duration_ms: int(e.duration_ms),
				status: oneOf(e.status, ["success", "error", "cancelled"] as const),
				occurred_at: occurredAt,
				event_key: eventKey,
				metadata:
					e.metadata && typeof e.metadata === "object" && !Array.isArray(e.metadata)
						? e.metadata
						: {},
			};
		})
		.filter((row): row is NonNullable<typeof row> => row !== null);

	if (eventRows.length > 0) {
		// ignoreDuplicates makes a replayed batch a no-op instead of a constraint
		// error, which is what lets the client retry blindly. `select("id")` is what
		// tells us how many actually landed, so the response can distinguish
		// "accepted" from "already had it" — without it a retry looks like fresh usage.
		const { data, error } = await admin
			.from("roboagent_usage_events")
			.upsert(eventRows, { onConflict: "user_id,event_key", ignoreDuplicates: true })
			.select("id");

		if (error) {
			console.error("ide/telemetry: usage event insert failed", error.message);
			return serverError("Could not record usage");
		}
		eventsAccepted = data?.length ?? 0;
	}

	return ok({
		project_id: projectId,
		sessions_synced: sessionsSynced,
		sessions_rejected: sessions.length - sessionsSynced,
		events_accepted: eventsAccepted,
		events_duplicate: eventRows.length - eventsAccepted,
		events_rejected: events.length - eventRows.length,
	});
}
