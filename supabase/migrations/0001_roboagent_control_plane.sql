-- ===========================================================================
-- RoboAgent control plane — initial schema
--
-- Context: this Supabase project (cgylgvvgyggfyvryqxxy) is the shared identity
-- provider for all four Robotics Corner products. Its `public` schema already
-- holds RobTalent tables (jobs, bids, escrow_transactions, …) and ConnectedLabs
-- tables (robots, bookings, connectedlabs_*). Following the convention set by
-- connectedlabs_*, every table here is prefixed `roboagent_` so ownership is
-- obvious from the name alone and no future migration can collide.
--
-- Before this migration the only RoboAgent-owned table was desktop_auth_codes.
-- The IDE therefore talked to the cloud for exactly one purpose — signing in —
-- which is why the dashboard had nothing real to render.
--
-- Design notes that are easy to get wrong later:
--
--   * RLS is SELECT-only for end users. Every table below is written solely by
--     the ingest API using the service-role key, which bypasses RLS entirely.
--     There is deliberately no INSERT/UPDATE/DELETE policy: a desktop app holds
--     a user access token, and if that token could write these rows directly a
--     user could forge their own usage records and defeat quota accounting.
--
--   * Identity is auth.users.id. ON DELETE CASCADE everywhere, so deleting a
--     user removes their telemetry — this is what makes an account-deletion
--     request satisfiable without a manual sweep.
--
--   * The IDE never sends filesystem paths. Projects are keyed by
--     project_key = base64url(sha256(workspace folder URI)), computed on the
--     client. We can group a user's activity per project without ever learning
--     where their code lives or what it is called on disk.
--
-- Idempotent by construction (IF NOT EXISTS / DROP POLICY IF EXISTS) so it is
-- safe to re-run against a partially-applied database.
-- ===========================================================================

-- gen_random_uuid(). Present by default on Supabase; asserted here so this file
-- also applies cleanly to a bare Postgres used for local testing.
create extension if not exists pgcrypto;


-- ---------------------------------------------------------------------------
-- Devices — one row per IDE installation.
--
-- install_id is generated once by the IDE and stored next to its encrypted
-- refresh token. It is NOT a hardware id: reinstalling produces a new one, and
-- that is the intended tradeoff. We want "which of my machines is this" for the
-- dashboard, not durable device fingerprinting.
-- ---------------------------------------------------------------------------
create table if not exists roboagent_devices (
	id            uuid primary key default gen_random_uuid(),
	user_id       uuid not null references auth.users (id) on delete cascade,
	install_id    text not null,
	hostname      text,
	platform      text,           -- 'linux' | 'darwin' | 'win32'
	arch          text,           -- 'x64' | 'arm64' | …
	app_version   text,           -- RoboAgent IDE version
	os_release    text,
	first_seen_at timestamptz not null default now(),
	last_seen_at  timestamptz not null default now(),
	revoked_at    timestamptz,

	-- The upsert target for the heartbeat endpoint. Scoped by user because two
	-- accounts on one shared machine are two distinct devices to us.
	constraint roboagent_devices_user_install_key unique (user_id, install_id)
);

create index if not exists roboagent_devices_user_last_seen_idx
	on roboagent_devices (user_id, last_seen_at desc);


-- ---------------------------------------------------------------------------
-- Projects — mirrors <workspace>/.roboagent/project.json, plus a summary of the
-- ROS2 workspace knowledge graph.
--
-- The control_level / domain / env / target / created_with columns are a direct
-- 1:1 mapping of the ProjectConfig interface written by the New-Project wizard
-- (extensions/roboagent-ros2/src/newProject.ts).
--
-- The *_count and indexed_at columns summarise Ros2WorkspaceGraph, which the
-- IDE rebuilds in memory on every launch and never persists. Storing the counts
-- here is what lets the dashboard say something true and specific about a
-- workspace ("41 packages, 118 topics") rather than inventing numbers.
-- ---------------------------------------------------------------------------
create table if not exists roboagent_projects (
	id             uuid primary key default gen_random_uuid(),
	user_id        uuid not null references auth.users (id) on delete cascade,
	project_key    text not null,   -- base64url(sha256(workspace folder URI))
	name           text not null,   -- folder basename; the only human label the IDE has

	-- Straight from .roboagent/project.json. All nullable: a plain folder opened
	-- in the IDE is a legitimate project that was never created by the wizard.
	control_level  text check (control_level in ('high', 'low')),
	domain         text check (domain in ('ros2', 'opencv', 'nlp')),
	env            text check (env in ('host', 'target', 'vm')),
	target         text,            -- 'host' for high-level, else 'stm32' | 'esp32' | …
	created_with   text,            -- e.g. 'roboagent-new-project@0.1.0'

	-- Live environment + workspace graph summary.
	ros_distro     text,            -- $ROS_DISTRO at index time, e.g. 'humble'
	package_count  integer not null default 0,
	node_count     integer not null default 0,
	topic_count    integer not null default 0,
	launch_count   integer not null default 0,
	indexed_at     timestamptz,     -- Ros2WorkspaceGraph.indexedAt

	first_seen_at  timestamptz not null default now(),
	last_opened_at timestamptz not null default now(),
	archived_at    timestamptz,

	constraint roboagent_projects_user_key_key unique (user_id, project_key)
);

create index if not exists roboagent_projects_user_last_opened_idx
	on roboagent_projects (user_id, last_opened_at desc);


-- ---------------------------------------------------------------------------
-- Sessions — one row per AI/agent chat session, mirroring the IDE's
-- IChatSessionEntryMetadata index and the per-session JSON files under
-- workspaceStorage/<id>/chatSessions/.
--
-- IMPORTANT: message CONTENT is deliberately not stored. `title` is the only
-- user-authored text that crosses the wire, and even that is opt-in on the
-- client (see the telemetry brief). Everything else is counters. A robotics
-- team's prompts routinely contain proprietary hardware detail; this table is
-- for metering and for answering "what was I working on", not for transcripts.
--
-- The token columns have no counterpart in the IDE today — IChatDebugModelTurnEvent
-- carries inputTokens/outputTokens/cachedTokens but is an in-memory ring buffer
-- that is discarded on reload. Populating these requires the new emitter
-- described in docs/11.
-- ---------------------------------------------------------------------------
create table if not exists roboagent_sessions (
	id              uuid primary key default gen_random_uuid(),
	user_id         uuid not null references auth.users (id) on delete cascade,
	project_id      uuid references roboagent_projects (id) on delete set null,
	device_id       uuid references roboagent_devices (id) on delete set null,

	session_id      text not null,  -- the IDE's own chat sessionId
	title           text,           -- IChatSessionEntryMetadata.title
	location        text,           -- ChatAgentLocation: 'panel' | 'editor' | …

	started_at      timestamptz not null,   -- IChatSessionTiming.created
	last_message_at timestamptz,            -- IChatSessionEntryMetadata.lastMessageDate

	request_count   integer not null default 0,
	tool_call_count integer not null default 0,
	input_tokens    bigint  not null default 0,
	output_tokens   bigint  not null default 0,
	cached_tokens   bigint  not null default 0,
	primary_model   text,           -- most-used modelId across the session's requests

	-- IChatSessionStats { fileCount, added, removed } — edit impact, not tokens.
	files_changed   integer not null default 0,
	lines_added     integer not null default 0,
	lines_removed   integer not null default 0,

	synced_at       timestamptz not null default now(),

	constraint roboagent_sessions_user_session_key unique (user_id, session_id)
);

create index if not exists roboagent_sessions_user_last_message_idx
	on roboagent_sessions (user_id, last_message_at desc nulls last);

create index if not exists roboagent_sessions_project_idx
	on roboagent_sessions (project_id, last_message_at desc nulls last);


-- ---------------------------------------------------------------------------
-- Usage events — the append-only meter behind every quota number.
--
-- Sessions above are mutable running totals (upserted as a session grows);
-- this table is immutable facts with timestamps, which is what makes
-- "usage in the current billing period" answerable at all. Do not merge them.
--
-- event_key is the idempotency key. Desktop telemetry retries — offline queues
-- get flushed twice, a crash replays the last batch — and double-counting a
-- metered event is a billing bug. The client derives a stable key per event
-- (e.g. '<sessionId>:<requestId>:model_turn') and the unique constraint below
-- turns a duplicate flush into a no-op via ON CONFLICT DO NOTHING.
-- ---------------------------------------------------------------------------
create table if not exists roboagent_usage_events (
	id            uuid primary key default gen_random_uuid(),
	user_id       uuid not null references auth.users (id) on delete cascade,
	device_id     uuid references roboagent_devices (id) on delete set null,
	project_id    uuid references roboagent_projects (id) on delete set null,
	session_id    text,           -- the IDE's chat sessionId; not an FK, sessions may sync later

	kind          text not null check (kind in (
		'model_turn',   -- one assistant turn: the metered unit for AI usage
		'tool_call',    -- one tool invocation inside a turn
		'sim_run',      -- one simulation run (quota-bearing on Free; see docs/11 §6)
		'build',        -- colcon / cmake build task
		'workspace_index' -- a ROS2 workspace (re)index
	)),

	model         text,           -- opaque modelId as reported by the provider
	input_tokens  integer not null default 0,
	output_tokens integer not null default 0,
	cached_tokens integer not null default 0,
	duration_ms   integer,
	status        text,           -- 'success' | 'error' | 'cancelled'

	occurred_at   timestamptz not null,   -- client clock, when it actually happened
	received_at   timestamptz not null default now(),  -- server clock, trusted for billing

	event_key     text not null,
	metadata      jsonb not null default '{}'::jsonb,

	constraint roboagent_usage_events_user_event_key unique (user_id, event_key)
);

-- The shape every quota question asks: this user, this kind, since this instant.
create index if not exists roboagent_usage_events_user_kind_time_idx
	on roboagent_usage_events (user_id, kind, occurred_at desc);

create index if not exists roboagent_usage_events_user_time_idx
	on roboagent_usage_events (user_id, occurred_at desc);


-- ---------------------------------------------------------------------------
-- Subscriptions — plan tier per user.
--
-- Tiers match app/pricing/page.tsx exactly ('free' | 'pro' | 'max'); if that
-- page gains a tier, this CHECK constraint must move with it.
--
-- The absence of a row means Free. That is intentional — it makes every existing
-- account correct without a backfill, and there is no "user signed up but has no
-- plan" state to handle in the app.
--
-- Payment columns are gateway-agnostic on purpose. Robotics Corner is migrating
-- off Paymob onto Kashier, so nothing here is Paymob-shaped and no gateway is
-- hardcoded; `gateway` is just a label alongside its reference.
-- ---------------------------------------------------------------------------
create table if not exists roboagent_subscriptions (
	user_id              uuid primary key references auth.users (id) on delete cascade,
	plan                 text not null default 'free' check (plan in ('free', 'pro', 'max')),
	status               text not null default 'active'
		check (status in ('active', 'past_due', 'cancelled', 'expired', 'trialing')),
	billing_interval     text check (billing_interval in ('monthly', 'yearly')),

	-- The metering window. NULL period_start means "no billing period yet", and
	-- the app falls back to the calendar month — see currentPeriod() in
	-- lib/roboagent/plans.ts, which must stay consistent with this comment.
	period_start         timestamptz,
	period_end           timestamptz,
	cancel_at_period_end boolean not null default false,

	gateway              text,   -- 'kashier' | …
	gateway_reference    text,

	created_at           timestamptz not null default now(),
	updated_at           timestamptz not null default now()
);


-- ---------------------------------------------------------------------------
-- Row level security.
--
-- Read-your-own-rows for authenticated users; no write policies at all, so the
-- only writer is the service-role ingest API. See the header note on why.
-- ---------------------------------------------------------------------------
alter table roboagent_devices       enable row level security;
alter table roboagent_projects      enable row level security;
alter table roboagent_sessions      enable row level security;
alter table roboagent_usage_events  enable row level security;
alter table roboagent_subscriptions enable row level security;

drop policy if exists roboagent_devices_select_own       on roboagent_devices;
drop policy if exists roboagent_projects_select_own      on roboagent_projects;
drop policy if exists roboagent_sessions_select_own      on roboagent_sessions;
drop policy if exists roboagent_usage_events_select_own  on roboagent_usage_events;
drop policy if exists roboagent_subscriptions_select_own on roboagent_subscriptions;

create policy roboagent_devices_select_own on roboagent_devices
	for select to authenticated using ((select auth.uid()) = user_id);

create policy roboagent_projects_select_own on roboagent_projects
	for select to authenticated using ((select auth.uid()) = user_id);

create policy roboagent_sessions_select_own on roboagent_sessions
	for select to authenticated using ((select auth.uid()) = user_id);

create policy roboagent_usage_events_select_own on roboagent_usage_events
	for select to authenticated using ((select auth.uid()) = user_id);

create policy roboagent_subscriptions_select_own on roboagent_subscriptions
	for select to authenticated using ((select auth.uid()) = user_id);


-- ---------------------------------------------------------------------------
-- Housekeeping: keep updated_at honest without the app having to remember.
-- ---------------------------------------------------------------------------
create or replace function roboagent_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
	new.updated_at = now();
	return new;
end;
$$;

drop trigger if exists roboagent_subscriptions_touch on roboagent_subscriptions;
create trigger roboagent_subscriptions_touch
	before update on roboagent_subscriptions
	for each row execute function roboagent_touch_updated_at();
