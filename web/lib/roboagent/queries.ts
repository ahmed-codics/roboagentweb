import type { SupabaseClient } from "@supabase/supabase-js";
import { currentPeriod, planFor, quota, type PlanLimits, type QuotaUsage } from "./plans";

/**
 * Data access for the RoboAgent control plane.
 *
 * Every function takes a client rather than creating one, because the two callers
 * need different authority and the difference matters:
 *
 *   - the dashboard passes a *server* client carrying the user's cookie session,
 *     so RLS scopes rows to that user and a query bug cannot leak someone else's
 *     telemetry;
 *   - the /api/ide/* routes pass the *admin* client, which bypasses RLS and must
 *     therefore filter on user_id explicitly in every call.
 *
 * The `userId` parameter is mandatory for exactly that reason — under the service
 * role there is no database-side safety net.
 */

export interface DeviceRow {
	id: string;
	install_id: string;
	hostname: string | null;
	platform: string | null;
	arch: string | null;
	app_version: string | null;
	first_seen_at: string;
	last_seen_at: string;
}

export interface ProjectRow {
	id: string;
	project_key: string;
	name: string;
	control_level: "high" | "low" | null;
	domain: string | null;
	env: string | null;
	target: string | null;
	ros_distro: string | null;
	package_count: number;
	node_count: number;
	topic_count: number;
	launch_count: number;
	indexed_at: string | null;
	first_seen_at: string;
	last_opened_at: string;
}

export interface SessionRow {
	id: string;
	session_id: string;
	title: string | null;
	project_id: string | null;
	started_at: string;
	last_message_at: string | null;
	request_count: number;
	tool_call_count: number;
	input_tokens: number;
	output_tokens: number;
	cached_tokens: number;
	primary_model: string | null;
	files_changed: number;
	lines_added: number;
	lines_removed: number;
}

export interface SubscriptionRow {
	plan: string;
	status: string;
	billing_interval: string | null;
	period_start: string | null;
	period_end: string | null;
	cancel_at_period_end: boolean;
}

export async function getSubscription(
	db: SupabaseClient,
	userId: string,
): Promise<SubscriptionRow | null> {
	const { data } = await db
		.from("roboagent_subscriptions")
		.select("plan, status, billing_interval, period_start, period_end, cancel_at_period_end")
		.eq("user_id", userId)
		.maybeSingle();

	// No row is the normal case, not an error: it means Free. See the schema note.
	return (data as SubscriptionRow | null) ?? null;
}

export async function getDevices(db: SupabaseClient, userId: string): Promise<DeviceRow[]> {
	const { data } = await db
		.from("roboagent_devices")
		.select("id, install_id, hostname, platform, arch, app_version, first_seen_at, last_seen_at")
		.eq("user_id", userId)
		.is("revoked_at", null)
		.order("last_seen_at", { ascending: false });

	return (data as DeviceRow[]) ?? [];
}

export async function getProjects(
	db: SupabaseClient,
	userId: string,
	limit = 20,
): Promise<ProjectRow[]> {
	const { data } = await db
		.from("roboagent_projects")
		.select(
			"id, project_key, name, control_level, domain, env, target, ros_distro, package_count, node_count, topic_count, launch_count, indexed_at, first_seen_at, last_opened_at",
		)
		.eq("user_id", userId)
		.is("archived_at", null)
		.order("last_opened_at", { ascending: false })
		.limit(limit);

	return (data as ProjectRow[]) ?? [];
}

export async function getRecentSessions(
	db: SupabaseClient,
	userId: string,
	limit = 8,
): Promise<SessionRow[]> {
	const { data } = await db
		.from("roboagent_sessions")
		.select(
			"id, session_id, title, project_id, started_at, last_message_at, request_count, tool_call_count, input_tokens, output_tokens, cached_tokens, primary_model, files_changed, lines_added, lines_removed",
		)
		.eq("user_id", userId)
		.order("last_message_at", { ascending: false, nullsFirst: false })
		.limit(limit);

	return (data as SessionRow[]) ?? [];
}

export interface UsageTotals {
	readonly modelTurns: number;
	readonly toolCalls: number;
	readonly simRuns: number;
	readonly builds: number;
	readonly inputTokens: number;
	readonly outputTokens: number;
	readonly cachedTokens: number;
}

const EMPTY_TOTALS: UsageTotals = {
	modelTurns: 0,
	toolCalls: 0,
	simRuns: 0,
	builds: 0,
	inputTokens: 0,
	outputTokens: 0,
	cachedTokens: 0,
};

/**
 * Aggregate usage over a window.
 *
 * Deliberately aggregated in JS over the raw rows rather than in SQL. At current
 * volumes (a single user's events in one month) this is a few hundred rows at
 * most, and it keeps the migration free of views or RPCs that would then need
 * their own permissions and versioning. Revisit if a user's monthly event count
 * approaches the 10k page cap below — at that point this should become a
 * materialised rollup, not a bigger page size.
 */
export async function getUsageTotals(
	db: SupabaseClient,
	userId: string,
	since: Date,
	until: Date,
): Promise<UsageTotals> {
	const { data, error } = await db
		.from("roboagent_usage_events")
		.select("kind, input_tokens, output_tokens, cached_tokens")
		.eq("user_id", userId)
		.gte("occurred_at", since.toISOString())
		.lt("occurred_at", until.toISOString())
		.limit(10_000);

	if (error || !data) return EMPTY_TOTALS;

	const totals = { ...EMPTY_TOTALS } as {
		-readonly [K in keyof UsageTotals]: number;
	};

	for (const row of data as Array<{
		kind: string;
		input_tokens: number | null;
		output_tokens: number | null;
		cached_tokens: number | null;
	}>) {
		switch (row.kind) {
			case "model_turn":
				totals.modelTurns += 1;
				break;
			case "tool_call":
				totals.toolCalls += 1;
				break;
			case "sim_run":
				totals.simRuns += 1;
				break;
			case "build":
				totals.builds += 1;
				break;
		}
		totals.inputTokens += row.input_tokens ?? 0;
		totals.outputTokens += row.output_tokens ?? 0;
		totals.cachedTokens += row.cached_tokens ?? 0;
	}

	return totals;
}

export interface Entitlements {
	readonly plan: PlanLimits;
	readonly status: string;
	readonly periodStart: string;
	readonly periodEnd: string;
	readonly cancelAtPeriodEnd: boolean;
	readonly usage: UsageTotals;
	readonly quotas: {
		readonly simRuns: QuotaUsage;
		readonly workspaces: QuotaUsage;
		readonly modelTurns: QuotaUsage;
	};
}

/**
 * The single answer to "what is this user allowed to do, and how much have they
 * used". Shared verbatim by the dashboard and the IDE entitlements endpoint so
 * the two can never disagree about a user's remaining quota.
 */
export async function getEntitlements(
	db: SupabaseClient,
	userId: string,
): Promise<Entitlements> {
	const subscription = await getSubscription(db, userId);
	const plan = planFor(subscription?.plan);
	const period = currentPeriod(subscription?.period_start, subscription?.period_end);

	// Workspace count is a live count of active projects, not a period aggregate —
	// the Free "single workspace" limit is about what exists now, not what was
	// used this month.
	const [usage, { count: workspaceCount }] = await Promise.all([
		getUsageTotals(db, userId, period.start, period.end),
		db
			.from("roboagent_projects")
			.select("id", { count: "exact", head: true })
			.eq("user_id", userId)
			.is("archived_at", null),
	]);

	return {
		plan,
		status: subscription?.status ?? "active",
		periodStart: period.start.toISOString(),
		periodEnd: period.end.toISOString(),
		cancelAtPeriodEnd: subscription?.cancel_at_period_end ?? false,
		usage,
		quotas: {
			simRuns: quota(usage.simRuns, plan.simRunsPerPeriod),
			workspaces: quota(workspaceCount ?? 0, plan.workspaces),
			modelTurns: quota(usage.modelTurns, plan.modelTurnsPerPeriod),
		},
	};
}

/** Per-day model turn counts for the activity chart. Gaps are filled by the caller. */
export async function getDailyActivity(
	db: SupabaseClient,
	userId: string,
	days = 30,
): Promise<Map<string, number>> {
	const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
	const { data } = await db
		.from("roboagent_usage_events")
		.select("occurred_at")
		.eq("user_id", userId)
		.eq("kind", "model_turn")
		.gte("occurred_at", since.toISOString())
		.limit(10_000);

	const byDay = new Map<string, number>();
	for (const row of (data as Array<{ occurred_at: string }>) ?? []) {
		const day = row.occurred_at.slice(0, 10); // ISO date, already UTC
		byDay.set(day, (byDay.get(day) ?? 0) + 1);
	}
	return byDay;
}
