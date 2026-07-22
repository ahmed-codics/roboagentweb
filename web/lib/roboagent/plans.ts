/**
 * Plan tiers and their entitlements.
 *
 * The tier ids and every limit below are lifted from app/pricing/page.tsx, which
 * is the customer-facing promise and therefore the source of truth. If a limit
 * changes there it must change here, and the CHECK constraint on
 * roboagent_subscriptions.plan must move with it.
 *
 * Shared by the dashboard (to render "3 of 5 used") and by the IDE entitlements
 * endpoint (so the desktop app gates against the same numbers the site advertises,
 * rather than a second copy that drifts).
 */

export type PlanId = "free" | "pro" | "max";

export const PLAN_IDS: readonly PlanId[] = ["free", "pro", "max"];

/** `null` means unlimited. Zero would mean "not available at all". */
export interface PlanLimits {
	readonly id: PlanId;
	readonly name: string;
	readonly monthlyUsd: number;
	readonly yearlyUsd: number;
	/** Max distinct projects that may be active. Free is explicitly "Single workspace". */
	readonly workspaces: number | null;
	/** Simulation runs per billing period. Free is "5 simulation runs / month". */
	readonly simRunsPerPeriod: number | null;
	/** Context window in tokens, as advertised. Display-only — the IDE enforces it. */
	readonly contextTokens: number;
	/**
	 * Metered AI turns per billing period.
	 *
	 * Deliberately null on every tier, including Free: the pricing page promises
	 * "Basic AI chat" without a number, so there is no advertised limit to enforce
	 * and inventing one here would be a limit users never agreed to. The blueprint
	 * in the IDE repo (requirements_docs/roboagent_blueprint_part5.md §12.1) does
	 * quote "20 queries/day" — but for a completely different tier lineup
	 * (Community/Pro $39/Team $69/Enterprise), so it cannot simply be adopted.
	 * Resolving that contradiction is a product decision, not a code decision.
	 * Until then we meter usage and display it; we do not block on it.
	 */
	readonly modelTurnsPerPeriod: number | null;
}

export const PLANS: Record<PlanId, PlanLimits> = {
	free: {
		id: "free",
		name: "Free",
		monthlyUsd: 0,
		yearlyUsd: 0,
		workspaces: 1,
		simRunsPerPeriod: 5,
		contextTokens: 32_000,
		modelTurnsPerPeriod: null,
	},
	pro: {
		id: "pro",
		name: "Pro",
		monthlyUsd: 20,
		yearlyUsd: 200,
		workspaces: null, // "Unlimited workspaces"
		simRunsPerPeriod: null,
		contextTokens: 200_000,
		modelTurnsPerPeriod: null,
	},
	max: {
		id: "max",
		name: "Max",
		monthlyUsd: 150,
		yearlyUsd: 1500,
		workspaces: null,
		simRunsPerPeriod: null,
		contextTokens: 200_000,
		modelTurnsPerPeriod: null,
	},
};

/** Unknown or absent tier resolves to Free — see the schema note on why no row means Free. */
export function planFor(plan: string | null | undefined): PlanLimits {
	return PLANS[(plan ?? "free") as PlanId] ?? PLANS.free;
}

export interface BillingPeriod {
	readonly start: Date;
	readonly end: Date;
	/** True when we fell back to the calendar month because no subscription period exists. */
	readonly isCalendarMonth: boolean;
}

/**
 * The window every quota is measured over.
 *
 * A paid subscription carries its own period. Everyone else — which today is
 * everyone — is metered over the calendar month in UTC. Keep this in sync with
 * the comment on roboagent_subscriptions.period_start.
 *
 * UTC deliberately: metering on the viewer's local month would let a user in
 * UTC+14 and one in UTC-11 see different totals for the same events, and the
 * reset time would move when someone flies somewhere.
 */
export function currentPeriod(
	periodStart?: string | null,
	periodEnd?: string | null,
	now: Date = new Date(),
): BillingPeriod {
	if (periodStart && periodEnd) {
		const start = new Date(periodStart);
		const end = new Date(periodEnd);
		// Only trust a period that actually contains `now`; a stale one (gateway
		// webhook missed, renewal not yet written) would silently meter against a
		// window that ended last month.
		if (start <= now && now < end) {
			return { start, end, isCalendarMonth: false };
		}
	}

	const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
	const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
	return { start, end, isCalendarMonth: true };
}

export interface QuotaUsage {
	readonly used: number;
	readonly limit: number | null;
	/** 0..1, or null when unlimited. Clamped, so an over-quota account renders as a full bar. */
	readonly fraction: number | null;
	readonly unlimited: boolean;
	readonly exceeded: boolean;
}

export function quota(used: number, limit: number | null): QuotaUsage {
	if (limit === null) {
		return { used, limit: null, fraction: null, unlimited: true, exceeded: false };
	}
	return {
		used,
		limit,
		fraction: limit === 0 ? 1 : Math.min(1, used / limit),
		unlimited: false,
		exceeded: used >= limit,
	};
}
