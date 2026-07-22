# Implementation brief: report usage to the RoboAgent control plane

> **How to use this document.** Paste it whole into your coding assistant as the
> task brief, inside the RoboAgent IDE (Electron/VS Code fork) repository. It is
> self-contained: the web side already exists and is described here as a fixed
> contract you code against. You are implementing **only the desktop side**.
>
> Companion to `10_ide_sso_implementation_prompt.md`, which delivered sign-in.
> This document is what makes the signed-in user's dashboard show anything.

---

## 1. What you are building

The web dashboard at `https://www.roboticscorner.tech/roboagent/dashboard` renders
the user's projects, AI sessions, usage and devices. Until now it had no data
source at all — the IDE talked to the cloud for exactly one purpose, signing in.

You are adding a **telemetry reporter**: a small main-process component that
batches local activity and POSTs it to two endpoints, plus the emitters needed to
produce counts the IDE does not currently keep.

Three properties are non-negotiable, and each is explained where it appears below:
the reporter must be **idempotent** (§5), **offline-tolerant** (§7), and must
**never send code, prompts or file paths** (§8).

---

## 2. What already exists vs. what you must add

This matters more than anything else in this document. Roughly half the data the
dashboard wants is already recorded locally; the other half has no counter at all.

| Data | Status in the IDE today | Where |
|---|---|---|
| Signed-in user, tokens | **Exists** | `src/vs/platform/roboagentAuth/**` |
| Project config | **Exists** | `<workspace>/.roboagent/project.json`, written by `extensions/roboagent-ros2/src/newProject.ts` |
| ROS2 workspace graph | **Exists, in memory only** | `Ros2WorkspaceGraph` in `src/vs/workbench/contrib/roboagent/common/ros2WorkspaceModel.ts` |
| Chat session list, titles, timing | **Exists** | `IChatSessionEntryMetadata` in `src/vs/workbench/contrib/chat/common/model/chatSessionStore.ts`, storage key `chat.ChatSessionStore.index'` |
| Files/lines changed per session | **Exists** | `IChatSessionStats { fileCount, added, removed }` |
| Model id per request | **Exists** | `ISerializableChatRequestData.modelId` |
| **Token counts** | **In-memory only, discarded on reload** | `IChatDebugModelTurnEvent` in `chatDebugService.ts` — has `inputTokens`/`outputTokens`/`cachedTokens`, never persisted |
| **Tool-call counts** | **In-memory only** | `IChatDebugToolCallEvent`, same file |
| **Simulation runs** | **Does not exist** | Design prose only, `requirements_docs/roboagent_blueprint_part3.md` §7 |
| **Cost** | **Does not exist** | No cost field anywhere in the codebase |

So: **§4 and §6.1–6.3 are wiring up data you already have. §6.4 is new
instrumentation.** Do the first part first — it makes the dashboard real on its
own, and it is the part you can finish without touching the chat subsystem.

---

## 3. Constants

```
WEB_BASE = https://www.roboticscorner.tech/roboagent      // already in authConstants.ts
HEARTBEAT_URL    = ${WEB_BASE}/api/ide/heartbeat          // POST
TELEMETRY_URL    = ${WEB_BASE}/api/ide/telemetry          // POST
ENTITLEMENTS_URL = ${WEB_BASE}/api/ide/entitlements       // GET
```

Every call carries the access token you already hold:

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

There is no API key and no second credential — same as `10_…` §5. On `401`,
refresh via the existing path and retry **once**; if that also fails, treat the
session as gone and stop reporting. Do not retry `4xx` other than `401` — a `400`
means the payload is malformed and resending it will fail identically forever.

### `install_id`

Generate once, on first run: `base64url(randomBytes(16))`. Persist it next to the
encrypted refresh token (extend `IStoredSessionData` in
`src/vs/platform/roboagentAuth/electron-main/storage.ts`, or use a sibling file).

It identifies **an installation, not a machine**. Reinstalling produces a new one
and that is intended — this is for "which of my machines is this" in the dashboard,
not durable device fingerprinting. Do not derive it from a MAC address, machine
GUID, or anything else that survives an uninstall.

---

## 4. Heartbeat

Call on sign-in, on launch with a restored session, and every **15 minutes** while
the window has focus. Skip it entirely when the window is hidden — a laptop asleep
in a bag should not read as an active device.

```http
POST /roboagent/api/ide/heartbeat
{
  "install_id": "…",
  "hostname":    "orin-devbox",     // os.hostname()
  "platform":    "linux",           // process.platform
  "arch":        "arm64",           // process.arch
  "app_version": "1.0.3",           // productService.version
  "os_release":  "6.5.0-27-generic" // os.release()
}
```

`200`:

```json
{
  "device": { "id": "uuid" },
  "entitlements": {
    "plan": { "id": "free", "name": "Free", "monthlyUsd": 0,
              "workspaces": 1, "simRunsPerPeriod": 5,
              "contextTokens": 32000, "modelTurnsPerPeriod": null },
    "status": "active",
    "periodStart": "2026-07-01T00:00:00.000Z",
    "periodEnd":   "2026-08-01T00:00:00.000Z",
    "usage":  { "modelTurns": 0, "toolCalls": 0, "simRuns": 0, "builds": 0,
                "inputTokens": 0, "outputTokens": 0, "cachedTokens": 0 },
    "quotas": { "simRuns":    { "used": 0, "limit": 5,    "fraction": 0, "unlimited": false, "exceeded": false },
                "workspaces": { "used": 1, "limit": 1,    "fraction": 1, "unlimited": false, "exceeded": true  },
                "modelTurns": { "used": 0, "limit": null, "fraction": null, "unlimited": true, "exceeded": false } }
  }
}
```

`install_id` is the only required field; everything else is best-effort.

**Use the returned entitlements** rather than a local copy of the pricing table.
`limit: null` means unlimited — treat it as unlimited, never as zero. This is the
answer to the open item left at the end of `10_…` §11: plan data now exists
server-side, and this is where you read it.

---

## 5. Telemetry batch

```http
POST /roboagent/api/ide/telemetry
{
  "install_id": "…",
  "project":  { … },     // optional, see §6.1
  "sessions": [ … ],     // optional, max 100
  "events":   [ … ]      // optional, max 500
}
```

`200`:

```json
{ "project_id": "uuid|null", "sessions_synced": 3, "sessions_rejected": 0,
  "events_accepted": 41, "events_duplicate": 12, "events_rejected": 0 }
```

Chunk anything larger than the caps; the server rejects an oversized batch with
`400` rather than silently truncating it, because silent truncation looks like
success while losing metered events.

`events_duplicate > 0` is **normal and healthy** — it means idempotency worked.
Do not treat it as an error or retry those events.

### Idempotency: `event_key`

Every usage event carries a client-generated `event_key`, unique per user. The
server upserts on it and ignores duplicates.

This is the single most important field in the payload. A desktop app retries:
offline queues get flushed twice, a crash replays the last batch, a user restores a
profile. Without a stable key those replays become double-counted usage, which is a
billing bug. Derive it deterministically from what the event *is* — never from a
timestamp taken at send time, and never from `Math.random()`:

```
model_turn      ->  `${sessionId}:${requestId}:turn`
tool_call       ->  `${sessionId}:${requestId}:tool:${toolCallId ?? index}`
sim_run         ->  `sim:${runId}`
build           ->  `build:${sessionScopedBuildId}`
workspace_index ->  `index:${projectKey}:${indexedAt}`
```

Re-deriving the same key for the same fact after a restart is the whole point. If
you cannot produce a stable key for an event, do not send the event.

---

## 6. Payload details

### 6.1 `project` — one per batch, describing the active workspace

```json
{
  "project_key":   "base64url(sha256(workspace folder URI))",
  "name":          "amr_v3",
  "control_level": "high",
  "domain":        "ros2",
  "env":           "host",
  "target":        "host",
  "created_with":  "roboagent-new-project@0.1.0",
  "graph": {
    "ros_distro":   "humble",
    "packages":     41,
    "nodes":        87,
    "topics":       118,
    "launch_files": 12,
    "indexed_at":   1769000000000
  }
}
```

- `project_key` — **`base64url(sha256(workspaceFolder.uri.toString()))`, computed
  locally. Never send the path itself.** The server groups a user's activity per
  project without ever learning where their code lives. Use the same URI string
  consistently or the same folder will appear as two projects.
- `name` — the folder basename. This is the only human label the IDE has; there is
  no name field in `project.json`.
- `control_level` / `domain` / `env` / `target` / `created_with` — read straight
  from `.roboagent/project.json` (the `ProjectConfig` interface in
  `extensions/roboagent-ros2/src/newProject.ts`). **All optional**: a plain folder
  opened in the IDE never went through the wizard, and that is a legitimate
  project. Omit the fields rather than inventing defaults.
- `graph` — summarise `Ros2WorkspaceGraph` (`ros2WorkspaceModel.ts`): array lengths
  for `packages`/`nodes`/`topics`/`launchFiles`, and `indexedAt` verbatim.
  `ros_distro` is `$ROS_DISTRO`, which `ros2StatusBar.ts` already reads live.
  Send it after each index completes — this is what lets the dashboard say
  "41 packages, 118 topics" instead of nothing.

### 6.2 `sessions[]` — AI session running totals

```json
{
  "session_id":      "…",          // required, the chat sessionId
  "title":           "…",          // optional — see the privacy note below
  "location":        "panel",
  "started_at":      1768990000000, // required; IChatSessionTiming.created
  "last_message_at": 1769000000000,
  "request_count":   14,
  "tool_call_count": 37,
  "input_tokens":    120400,
  "output_tokens":   8300,
  "cached_tokens":   96000,
  "primary_model":   "claude-sonnet-4-6",
  "files_changed":   6,             // IChatSessionStats.fileCount
  "lines_added":     214,           // IChatSessionStats.added
  "lines_removed":   88             // IChatSessionStats.removed
}
```

Sessions are **absolute running totals, not increments** — resend the whole row as
the conversation grows and the server overwrites. An increment protocol would
drift permanently the first time a flush was lost, with no way to reconcile.

`session_id` and `started_at` are required; a row missing either is dropped.

`primary_model` is the most-frequent `modelId` across the session's requests. It is
an opaque provider string — do not normalise or prettify it.

Flush a session when it goes idle for 30s, and on window close. Do not flush on
every keystroke or every streamed token.

### 6.3 `events[]` — the append-only meter

```json
{
  "event_key":     "…",            // required, see §5
  "kind":          "model_turn",   // required: model_turn | tool_call | sim_run | build | workspace_index
  "session_id":    "…",
  "occurred_at":   1769000000000,  // required
  "model":         "claude-sonnet-4-6",
  "input_tokens":  8200,
  "output_tokens": 640,
  "cached_tokens": 7000,
  "duration_ms":   4310,
  "status":        "success",      // success | error | cancelled
  "metadata":      {}
}
```

`kind`, `event_key` and `occurred_at` are required — they select the meter, provide
idempotency, and place the event in a billing period. Rows missing any of the three
are dropped and reported in `events_rejected`.

`metadata` is free-form JSON. Keep it small, and keep §8 in mind — it is the
easiest place to leak something by accident.

### 6.4 New instrumentation you must add

`chatDebugService.ts` already computes almost exactly the right numbers:

```ts
export interface IChatDebugModelTurnEvent extends IChatDebugEventCommon {
	readonly kind: 'modelTurn';
	readonly model?: string;
	readonly inputTokens?: number;
	readonly outputTokens?: number;
	readonly cachedTokens?: number;
	readonly totalTokens?: number;
	readonly durationInMillis?: number;
}
```

…but `chatDebugServiceImpl.ts` has no persistence at all — it is a live ring buffer
discarded on reload. **Tap it, do not rebuild it.** Subscribe to the same events,
map `modelTurn` → `kind: "model_turn"` and `toolCall` → `kind: "tool_call"`, and
push them into the outbound queue. `IChatDebugToolCallEvent` carries `toolName`,
`result` and `durationInMillis`; put `toolName` in `metadata`, map `result` to
`status`.

If the debug service is disabled in release builds, add a lightweight always-on
listener at the same call sites rather than shipping the debug UI.

`sim_run` has **nothing to tap** — simulation does not exist in the codebase (§10).
Wire the emitter when the simulation system lands; until then no `sim_run` events
are sent and the dashboard correctly shows 0.

---

## 7. Offline behaviour

Queue events in memory, flush on a **60-second timer** or when the queue exceeds
100 events, whichever comes first.

- On network failure, keep the queue and retry with exponential backoff
  (60s → 2m → 5m → 15m, capped). Do not spin.
- Persist the queue across restarts, capped at **2,000 events**. On overflow drop
  the *oldest* and log a count — recent usage matters more than a week-old
  backlog, and an unbounded queue on a machine that is offline for a fortnight is
  a memory leak.
- Blind retries are safe **because of `event_key`** (§5). Never dedupe by clearing
  the queue before you have a `200`.
- Telemetry failure must never surface as a user-facing error and must never block
  a chat turn, a build, or shutdown. It is strictly best-effort.

---

## 8. Privacy — what must never leave the machine

The control plane is a meter and a workspace summary. It is not a transcript store.

**Never send:**
- message content, prompts, or model responses;
- code, diffs, file contents, or file names;
- filesystem paths — including the workspace path, which is why `project_key` is a
  hash (§6.1);
- environment variables, hostnames of robots, IP addresses, or ROS domain ids;
- access tokens or refresh tokens, in any field, including `metadata`.

**Session titles are the one exception, and they are opt-in.** Titles are usually
IDE-generated summaries, but a user can rename a session to anything, and robotics
work routinely involves customer names and unreleased hardware. Gate them behind a
setting — `roboagent.telemetry.includeSessionTitles`, default **off** — and omit
the field when it is off. The dashboard renders "Untitled session" and stays useful.

Also add a master switch, `roboagent.telemetry.enabled` (default on, honoured
immediately), and make it respect VS Code's own `telemetryLevel` — if the user set
that to `off`, send nothing. Users who have already opted out of telemetry once
should not have to find a second setting.

`10_…` §6.6 said "never write tokens to logs, telemetry, crash dumps". That rule
now has a literal telemetry channel to apply to. Redact deliberately, and add a
test that fails if a token-shaped string reaches the outbound payload.

---

## 9. Acceptance criteria

1. Sign in on a fresh install → the dashboard shows the device within one heartbeat,
   with correct hostname, platform and version.
2. Open a ROS2 workspace → it appears under Projects with real package/node/topic
   counts matching the node graph view.
3. Run a chat session → it appears under Recent AI sessions with a matching request
   count, and the 30-day activity strip increments.
4. **Kill the app mid-batch and relaunch → `events_duplicate` rises and
   `events_accepted` stays flat. No usage is double-counted.** Test this explicitly;
   it is the one that silently regresses.
5. Go offline, work for 10 minutes, come back online → the queued events land, once.
6. Set `telemetryLevel: off` → no requests are made to either endpoint at all.
7. With `includeSessionTitles` off, no title text appears in any payload. Verify by
   capturing the request body, not by reading the code.
8. A `400` response does not cause an infinite retry loop.
9. Free-plan account with 1 project → heartbeat returns `workspaces.exceeded: true`,
   and the IDE surfaces it rather than ignoring it.
10. Sign out → reporting stops immediately and the persisted queue is cleared.

---

## 10. Open items to confirm before shipping

- **Simulation does not exist.** There is no simulation service, run record, or
  Gazebo adapter in the repo — only design prose in
  `requirements_docs/roboagent_blueprint_part3.md` §7. The `sim_run` event kind and
  the Free-tier quota of 5 runs/month are built and waiting; nothing will populate
  them until the simulation system ships.

- **The pricing model contradicts itself across repos, and this needs a product
  decision before any quota is enforced.** The website
  (`roboagentweb/web/app/pricing/page.tsx`) sells Free / Pro $20 / Max $150 with
  "5 simulation runs / month" on Free. The IDE's own blueprint
  (`requirements_docs/roboagent_blueprint_part5.md` §12.1) describes an entirely
  different lineup — Community (free, "limited AI, 20 queries/day") / Pro $39 /
  Team $69 per user / Enterprise $150+, with cloud simulation billed separately at
  $2–15/hour. These are not reconcilable by picking one number. The server
  currently implements the **website's** tiers, and deliberately sets no AI-turn
  limit on any plan, because the website advertises none — see the note on
  `modelTurnsPerPeriod` in `lib/roboagent/plans.ts`. Usage is metered and displayed;
  nothing is blocked.

- **`extensions/roboagent-authentication/` is a second, divergent auth
  implementation** — a non-PKCE `AuthenticationProvider` that scrapes a `token`
  query param and stores sessions under the SecretStorage key
  `roboagent.sessions`. It is not in the extension compile list and is superseded
  by `src/vs/platform/roboagentAuth/`. Delete it rather than teaching it to report
  telemetry; leaving it in place means a second, weaker place a token can land.

- Whether `build` events should be emitted from the existing colcon/cmake task
  handlers (`extensions/roboagent-ros2/src/colconTasks.ts`) — cheap to add, and the
  meter already accepts the kind, but no dashboard panel reads it yet.
