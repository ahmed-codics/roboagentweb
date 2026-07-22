"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { displayName, useSession } from "@/lib/supabase/use-session";
import { apiUrl } from "@/lib/roboagent/base-path";

/**
 * The RoboAgent dashboard.
 *
 * Everything rendered here comes from /api/dashboard/summary, which reads the
 * roboagent_* control-plane tables. Nothing on this page is sample data: if a
 * panel has no rows it says so and tells the user what would populate it. That is
 * a deliberate reversal — the previous version rendered invented projects,
 * simulations, robots and telemetry to every visitor, which made the product look
 * like it had a cloud backend it did not have.
 *
 * Numbers only appear once the IDE actually reports them (see docs/11).
 */

// --- shapes returned by /api/dashboard/summary -----------------------------

interface Quota {
	used: number;
	limit: number | null;
	fraction: number | null;
	unlimited: boolean;
	exceeded: boolean;
}

interface Summary {
	entitlements: {
		plan: { id: string; name: string; monthlyUsd: number; contextTokens: number };
		status: string;
		periodStart: string;
		periodEnd: string;
		cancelAtPeriodEnd: boolean;
		usage: {
			modelTurns: number;
			toolCalls: number;
			simRuns: number;
			builds: number;
			inputTokens: number;
			outputTokens: number;
			cachedTokens: number;
		};
		quotas: { simRuns: Quota; workspaces: Quota; modelTurns: Quota };
	};
	devices: Array<{
		id: string;
		hostname: string | null;
		platform: string | null;
		arch: string | null;
		app_version: string | null;
		first_seen_at: string;
		last_seen_at: string;
	}>;
	projects: Array<{
		id: string;
		name: string;
		control_level: string | null;
		domain: string | null;
		target: string | null;
		ros_distro: string | null;
		package_count: number;
		node_count: number;
		topic_count: number;
		launch_count: number;
		indexed_at: string | null;
		last_opened_at: string;
	}>;
	sessions: Array<{
		id: string;
		title: string | null;
		started_at: string;
		last_message_at: string | null;
		request_count: number;
		tool_call_count: number;
		input_tokens: number;
		output_tokens: number;
		primary_model: string | null;
		files_changed: number;
		lines_added: number;
		lines_removed: number;
	}>;
	activity: Array<{ date: string; count: number }>;
	hasEverSynced: boolean;
}

// --- formatting ------------------------------------------------------------

function compact(n: number): string {
	if (n < 1000) return String(n);
	if (n < 1_000_000) return `${(n / 1000).toFixed(n < 10_000 ? 1 : 0)}k`;
	return `${(n / 1_000_000).toFixed(1)}M`;
}

function relative(iso: string | null): string {
	if (!iso) return "—";
	const then = new Date(iso).getTime();
	if (Number.isNaN(then)) return "—";
	const seconds = Math.round((Date.now() - then) / 1000);
	if (seconds < 60) return "just now";
	const minutes = Math.round(seconds / 60);
	if (minutes < 60) return `${minutes}m ago`;
	const hours = Math.round(minutes / 60);
	if (hours < 24) return `${hours}h ago`;
	const days = Math.round(hours / 24);
	if (days < 30) return `${days}d ago`;
	return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function periodLabel(startIso: string, endIso: string): string {
	const start = new Date(startIso);
	const end = new Date(endIso);
	const fmt = (d: Date) => d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
	// end is exclusive — show the last included day so it reads as a range, not an
	// off-by-one ("Jul 1 – Aug 1" implies August is in the period).
	const lastDay = new Date(end.getTime() - 1);
	return `${fmt(start)} – ${fmt(lastDay)}`;
}

// --- page ------------------------------------------------------------------

export default function DashboardPage() {
	const router = useRouter();
	const { user, loading } = useSession();
	const [data, setData] = useState<Summary | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [fetching, setFetching] = useState(true);

	useEffect(() => {
		if (!loading && !user) router.replace(`/login?callbackUrl=${encodeURIComponent("/dashboard")}`);
	}, [loading, user, router]);

	const load = useCallback(async () => {
		setFetching(true);
		setError(null);
		try {
			// Read the token at call time rather than from the session in state: this
			// also runs on the refresh button, potentially an hour later, and the
			// token captured in the original session object would be stale by then.
			const { data: sessionData } = await supabase.auth.getSession();
			const token = sessionData.session?.access_token;
			if (!token) {
				setError("Your session expired. Sign in again to load your dashboard.");
				return;
			}

			const res = await fetch(apiUrl("/api/dashboard/summary"), {
				headers: { Authorization: `Bearer ${token}` },
				cache: "no-store",
			});

			if (!res.ok) {
				setError(
					res.status === 401
						? "Your session expired. Sign in again to load your dashboard."
						: "Could not load your dashboard. Please try again.",
				);
				return;
			}
			setData((await res.json()) as Summary);
		} catch {
			setError("Could not reach the server. Check your connection and try again.");
		} finally {
			setFetching(false);
		}
	}, []);

	useEffect(() => {
		if (user) void load();
	}, [user, load]);

	if (loading || !user) return <CenteredSpinner />;

	return (
		<div className="mx-auto w-full max-w-7xl px-6 py-12">
			<Header
				email={user.email ?? ""}
				name={displayName(user)}
				plan={data?.entitlements.plan.name}
				onRefresh={load}
				refreshing={fetching}
			/>

			{error && (
				<div className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800">
					{error}
				</div>
			)}

			{!data && fetching && <CenteredSpinner />}

			{data && !data.hasEverSynced && <ConnectIdeCard />}

			{data && data.hasEverSynced && <Panels data={data} />}

			{data && <PlanCard data={data} />}
		</div>
	);
}

function CenteredSpinner() {
	return (
		<div className="mx-auto flex w-full max-w-7xl items-center justify-center px-6 py-32">
			<svg className="h-8 w-8 animate-spin text-cyan-600" fill="none" viewBox="0 0 24 24">
				<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
				<path
					className="opacity-75"
					fill="currentColor"
					d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
				/>
			</svg>
		</div>
	);
}

function Header({
	email,
	name,
	plan,
	onRefresh,
	refreshing,
}: {
	email: string;
	name: string;
	plan?: string;
	onRefresh: () => void;
	refreshing: boolean;
}) {
	return (
		<div className="flex flex-wrap items-center justify-between gap-4">
			<div>
				<div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cyan-600">
					<span>Workspace · {email}</span>
					{plan && (
						<span className="rounded-full border border-cyan-200 bg-cyan-50 px-2 py-0.5 text-[10px] text-cyan-700">
							{plan}
						</span>
					)}
				</div>
				<h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
					Welcome back, {name}
				</h1>
			</div>
			<button
				onClick={onRefresh}
				disabled={refreshing}
				className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 shadow-sm transition-all duration-200 hover:border-cyan-300 hover:text-cyan-700 disabled:opacity-50"
			>
				<i className={`fa-solid fa-arrows-rotate ${refreshing ? "animate-spin" : ""}`}></i>
				Refresh
			</button>
		</div>
	);
}

/**
 * Shown when the account has never been seen by an IDE. This is the true state for
 * every existing user on day one, so it has to be a real onboarding step rather
 * than an apology.
 */
function ConnectIdeCard() {
	return (
		<div className="mt-8 rounded-[2rem] border border-cyan-200 bg-gradient-to-br from-cyan-50/70 to-white p-8 shadow-sm">
			<div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-600">
				<i className="fa-solid fa-plug"></i> Connect your IDE
			</div>
			<h2 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900">No activity yet</h2>
			<p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
				This dashboard fills in from RoboAgent IDE. Install it, sign in with this account, and your
				projects, AI sessions and usage appear here automatically — usually within a minute of your
				first session.
			</p>
			<div className="mt-6 flex flex-wrap gap-3">
				<Link
					href="/download"
					className="inline-flex h-11 items-center gap-2 rounded-xl bg-cyan-600 px-5 text-sm font-bold text-white shadow-md shadow-cyan-600/10 transition-all duration-200 hover:-translate-y-0.5 hover:bg-cyan-700"
				>
					<i className="fa-solid fa-download"></i> Download RoboAgent IDE
				</Link>
				<Link
					href="/docs"
					className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 transition-all duration-200 hover:border-cyan-300 hover:text-cyan-700"
				>
					Read the docs
				</Link>
			</div>
			<p className="mt-6 text-xs text-slate-500">
				Already signed in on the desktop? Open{" "}
				<span className="font-mono">RoboAgent → Account</span> and it will sync on the next
				heartbeat.
			</p>
		</div>
	);
}

function Panels({ data }: { data: Summary }) {
	const { entitlements: ent, projects, sessions, devices, activity } = data;
	const totalTokens = ent.usage.inputTokens + ent.usage.outputTokens;

	return (
		<>
			<div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
				<Stat icon="fa-boxes-stacked" label="Projects" value={String(projects.length)} />
				<Stat icon="fa-message" label="AI sessions" value={String(sessions.length)} note="synced" />
				<Stat
					icon="fa-robot"
					label="AI turns"
					value={compact(ent.usage.modelTurns)}
					note={periodLabel(ent.periodStart, ent.periodEnd)}
				/>
				<Stat
					icon="fa-coins"
					label="Tokens"
					value={compact(totalTokens)}
					note={`${compact(ent.usage.toolCalls)} tool calls`}
				/>
			</div>

			<div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
				<ActivityCard activity={activity} />
				<QuotaCard entitlements={ent} />
			</div>

			<div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
				<ProjectsCard projects={projects} />
				<DevicesCard devices={devices} />
			</div>

			<div className="mt-6">
				<SessionsCard sessions={sessions} />
			</div>
		</>
	);
}

/**
 * 30 days of AI turns.
 *
 * One series, so no legend — the card title names it. Bars are thin with a 2px
 * surface gap and rounded only at the data end, anchored to a common baseline.
 * Days with zero activity render as a flat 2px stub in the grid colour rather than
 * nothing, so a gap in the strip reads as "no usage" instead of "no data".
 */
function ActivityCard({ activity }: { activity: Summary["activity"] }) {
	const max = Math.max(1, ...activity.map((d) => d.count));
	const total = activity.reduce((sum, d) => sum + d.count, 0);

	return (
		<Card title="AI turns · last 30 days" icon="fa-chart-simple">
			{total === 0 ? (
				<Empty>No AI turns recorded in the last 30 days.</Empty>
			) : (
				<>
					<div className="text-3xl font-extrabold tracking-tight text-slate-900">
						{compact(total)}
					</div>
					<div
						className="mt-6 flex h-32 items-end gap-[2px]"
						role="img"
						aria-label={`${total} AI turns over the last 30 days`}
					>
						{activity.map((d) => (
							<div key={d.date} className="group relative h-full flex-1">
								<div className="flex h-full items-end">
									<div
										className={`w-full rounded-t transition-colors duration-150 ${
											d.count === 0 ? "bg-slate-200" : "bg-cyan-600 group-hover:bg-cyan-700"
										}`}
										style={{
											height: d.count === 0 ? "2px" : `${Math.max(4, (d.count / max) * 100)}%`,
										}}
									/>
								</div>
								{/* Hover detail. An HTML chart is interactive by default; without this
								    the strip is shape-only and a reader cannot recover any real number. */}
								<div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-white shadow-lg group-hover:block">
									{d.count} {d.count === 1 ? "turn" : "turns"}
									<span className="ml-1.5 font-normal text-slate-300">
										{new Date(d.date).toLocaleDateString(undefined, {
											month: "short",
											day: "numeric",
										})}
									</span>
								</div>
							</div>
						))}
					</div>
					<div className="mt-2 flex justify-between text-[11px] font-semibold text-slate-400">
						<span>
							{new Date(activity[0].date).toLocaleDateString(undefined, {
								month: "short",
								day: "numeric",
							})}
						</span>
						<span>Today</span>
					</div>
				</>
			)}
		</Card>
	);
}

function QuotaCard({ entitlements: ent }: { entitlements: Summary["entitlements"] }) {
	return (
		<Card title={`Usage · ${periodLabel(ent.periodStart, ent.periodEnd)}`} icon="fa-gauge-high">
			<div className="grid gap-4">
				<Meter label="Workspaces" q={ent.quotas.workspaces} />
				<Meter label="Simulation runs" q={ent.quotas.simRuns} />
				<div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
					<div className="text-sm text-slate-600">AI turns</div>
					<span className="font-mono text-sm font-semibold text-slate-900">
						{compact(ent.usage.modelTurns)}
					</span>
				</div>
				<div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
					<div className="text-sm text-slate-600">Context window</div>
					<span className="font-mono text-sm font-semibold text-slate-900">
						{compact(ent.plan.contextTokens)}
					</span>
				</div>
			</div>
		</Card>
	);
}

/**
 * A meter is only meaningful against a finite limit — an unlimited allowance has
 * no bar to fill, so it renders as a plain value instead of a permanently-empty
 * progress bar implying the user is near some threshold.
 */
function Meter({ label, q }: { label: string; q: Quota }) {
	return (
		<div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
			<div className="flex items-center justify-between">
				<div className="text-sm text-slate-600">{label}</div>
				<div className="font-mono text-sm font-semibold text-slate-900">
					{compact(q.used)}{" "}
					<span className="text-slate-400">/ {q.unlimited ? "∞" : compact(q.limit ?? 0)}</span>
				</div>
			</div>
			{!q.unlimited && (
				<div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
					<div
						className={`h-full rounded-full ${q.exceeded ? "bg-rose-500" : "bg-cyan-600"}`}
						style={{ width: `${Math.round((q.fraction ?? 0) * 100)}%` }}
					/>
				</div>
			)}
			{q.exceeded && (
				<div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-rose-700">
					<i className="fa-solid fa-triangle-exclamation"></i>
					Limit reached —{" "}
					<Link href="/pricing" className="underline underline-offset-2">
						upgrade
					</Link>
				</div>
			)}
		</div>
	);
}

function ProjectsCard({ projects }: { projects: Summary["projects"] }) {
	return (
		<Card title="Projects" icon="fa-boxes-stacked">
			{projects.length === 0 ? (
				<Empty>
					No projects synced yet. Open a workspace in RoboAgent IDE, or create one with{" "}
					<span className="font-mono text-xs">RoboAgent: New Project</span>.
				</Empty>
			) : (
				<ul className="divide-y divide-slate-100">
					{projects.map((p) => {
						// Build the subtitle from whatever the IDE actually reported. A project
						// opened as a plain folder has none of these, and a bare "Workspace" is
						// correct — better than inventing a plausible "Nav2 · Humble".
						const facts = [
							p.domain === "ros2" ? "ROS2" : p.domain?.toUpperCase(),
							p.ros_distro,
							p.control_level === "low"
								? "Low-level"
								: p.control_level === "high"
									? "High-level"
									: null,
							p.target && p.target !== "host" ? p.target.toUpperCase() : null,
						].filter(Boolean);

						return (
							<li
								key={p.id}
								className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0"
							>
								<div className="min-w-0">
									<div className="truncate font-mono text-sm font-bold text-slate-900">{p.name}</div>
									<div className="truncate text-xs text-slate-500">
										{facts.length > 0 ? facts.join(" · ") : "Workspace"}
									</div>
								</div>
								<div className="flex shrink-0 items-center gap-4 text-xs text-slate-500">
									{p.package_count > 0 && <span>{p.package_count} pkg</span>}
									{p.node_count > 0 && <span>{p.node_count} nodes</span>}
									{p.topic_count > 0 && <span>{p.topic_count} topics</span>}
									<span className="font-semibold text-slate-400">{relative(p.last_opened_at)}</span>
								</div>
							</li>
						);
					})}
				</ul>
			)}
		</Card>
	);
}

function SessionsCard({ sessions }: { sessions: Summary["sessions"] }) {
	return (
		<Card title="Recent AI sessions" icon="fa-message">
			{sessions.length === 0 ? (
				<Empty>
					No AI sessions synced yet. Start a chat in RoboAgent IDE and it will appear here.
				</Empty>
			) : (
				<ul className="divide-y divide-slate-100 text-sm">
					{sessions.map((s) => {
						const detail = [
							s.primary_model,
							`${s.request_count} ${s.request_count === 1 ? "request" : "requests"}`,
							s.tool_call_count > 0 ? `${s.tool_call_count} tool calls` : null,
							s.files_changed > 0 ? `${s.files_changed} files changed` : null,
						].filter(Boolean);

						return (
							<li
								key={s.id}
								className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0"
							>
								<div className="min-w-0">
									<div className="truncate font-semibold text-slate-900">
										{s.title ?? <span className="text-slate-400">Untitled session</span>}
									</div>
									<div className="truncate text-xs text-slate-500">{detail.join(" · ")}</div>
								</div>
								<div className="flex shrink-0 items-center gap-4">
									{s.lines_added + s.lines_removed > 0 && (
										<span className="font-mono text-xs">
											<span className="text-emerald-600">+{s.lines_added}</span>{" "}
											<span className="text-rose-600">−{s.lines_removed}</span>
										</span>
									)}
									<span className="text-xs font-semibold text-slate-400">
										{relative(s.last_message_at)}
									</span>
								</div>
							</li>
						);
					})}
				</ul>
			)}
		</Card>
	);
}

const PLATFORM_LABELS: Record<string, string> = {
	linux: "Linux",
	darwin: "macOS",
	win32: "Windows",
};

function DevicesCard({ devices }: { devices: Summary["devices"] }) {
	return (
		<Card title="Signed-in devices" icon="fa-laptop-code">
			{devices.length === 0 ? (
				<Empty>No devices signed in yet.</Empty>
			) : (
				<div className="grid gap-3">
					{devices.map((d) => {
						// "Active" is a claim about right now, so it needs a real bound. The IDE
						// heartbeats roughly every 15 minutes; 45 covers two missed beats before
						// we stop calling a machine active.
						const active = Date.now() - new Date(d.last_seen_at).getTime() < 45 * 60 * 1000;
						return (
							<div
								key={d.id}
								className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition duration-200 hover:border-cyan-300"
							>
								<div className="flex items-center gap-2">
									<span
										className={`h-2.5 w-2.5 rounded-full ${active ? "animate-pulse bg-emerald-500" : "bg-slate-300"}`}
									/>
									<span className="truncate font-mono text-sm font-bold text-slate-900">
										{d.hostname ?? "Unknown device"}
									</span>
								</div>
								<div className="mt-2 flex justify-between text-xs font-semibold text-slate-500">
									<span>
										{PLATFORM_LABELS[d.platform ?? ""] ?? d.platform ?? "—"}
										{d.arch ? ` · ${d.arch}` : ""}
										{d.app_version ? ` · v${d.app_version}` : ""}
									</span>
									<span>{relative(d.last_seen_at)}</span>
								</div>
							</div>
						);
					})}
				</div>
			)}
		</Card>
	);
}

function PlanCard({ data }: { data: Summary }) {
	const { plan, status, periodEnd, cancelAtPeriodEnd } = data.entitlements;
	const renews = new Date(periodEnd).toLocaleDateString(undefined, {
		month: "long",
		day: "numeric",
		year: "numeric",
	});

	return (
		<div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
			<div>
				<div className="text-xs font-bold uppercase tracking-wider text-slate-500">Plan</div>
				<div className="mt-1 flex items-center gap-2">
					<span className="text-2xl font-extrabold tracking-tight text-slate-900">{plan.name}</span>
					{status !== "active" && (
						<span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">
							{status}
						</span>
					)}
				</div>
				<div className="mt-1 text-xs font-semibold text-slate-400">
					{plan.id === "free"
						? `Usage resets ${renews}`
						: cancelAtPeriodEnd
							? `Ends ${renews}`
							: `Renews ${renews}`}
				</div>
			</div>
			{plan.id !== "max" && (
				<Link
					href="/pricing"
					className="inline-flex h-11 items-center gap-2 rounded-xl bg-cyan-600 px-5 text-sm font-bold text-white shadow-md shadow-cyan-600/10 transition-all duration-200 hover:-translate-y-0.5 hover:bg-cyan-700"
				>
					<i className="fa-solid fa-arrow-up"></i> Upgrade
				</Link>
			)}
		</div>
	);
}

// --- shared bits -----------------------------------------------------------

function Card({
	title,
	icon,
	children,
}: {
	title: string;
	icon: string;
	children: React.ReactNode;
}) {
	return (
		<div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-cyan-200 hover:shadow-md">
			<div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
				<span className="text-cyan-600">
					<i className={`fa-solid ${icon}`}></i>
				</span>
				{title}
			</div>
			{children}
		</div>
	);
}

function Stat({
	icon,
	label,
	value,
	note,
}: {
	icon: string;
	label: string;
	value: string;
	note?: string;
}) {
	return (
		<div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-cyan-200 hover:shadow-md">
			<div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
				<span className="text-cyan-600">
					<i className={`fa-solid ${icon}`}></i>
				</span>
				{label}
			</div>
			<div className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">{value}</div>
			{note && <div className="mt-1 text-xs font-semibold text-slate-400">{note}</div>}
		</div>
	);
}

function Empty({ children }: { children: React.ReactNode }) {
	return <div className="py-6 text-sm leading-relaxed text-slate-500">{children}</div>;
}
