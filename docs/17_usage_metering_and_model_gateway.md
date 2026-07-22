# 17. USAGE METERING & THE MODEL GATEWAY

> **Status:** proposal, pending decisions in §9.
> **Audience:** product and engineering leadership. §1–§5 are non-technical.
> **Companions:** `10_ide_sso_implementation_prompt.md` (sign-in, shipped),
> `11_ide_telemetry_implementation_prompt.md` (activity reporting, specced),
> `12_monetization_strategy.md` (tiers — see §9.1, it conflicts with the live site).

---

## 1. Executive summary

RoboAgent uses external frontier models (Anthropic) that cost real money per
request. Today the product has no way to (a) give a user access to a model,
(b) measure what that user costs us, or (c) stop a user who costs more than they
pay. This document proposes the mechanism for all three.

**The proposal in one paragraph.** We run a single provider API key on our own
server. The IDE never receives it. Every AI request from the IDE goes to a
RoboAgent **gateway** endpoint that authenticates the user against the sign-in
they already have, checks whether they have budget left, forwards the request to
the model provider, streams the answer straight back, and records the exact cost
from the provider's own response. Users are metered in **credits derived from
token cost**, not from request counts. When credits run out, the AI features stop
until the billing period resets or the user upgrades; the rest of the IDE keeps
working.

**Why it matters commercially.** A single heavy user on an agentic coding tool can
consume $200–400/month of model cost. Our advertised Max tier is $150/month with
no stated limit. Without the mechanism below, our worst-case customer is our most
expensive one, and we cannot detect it until the provider invoice arrives.

**Cost of building it.** Roughly two engineer-weeks, most of it on one new server
endpoint and one new IDE extension. About 60% of the required database schema is
already written (`supabase/migrations/0001_roboagent_control_plane.sql`) and
merely needs amending before it is applied for the first time.

**What blocks it.** A product decision on tiers and allowances (§9). Every number
in the implementation reads from that decision, so engineering cannot start the
metering logic until it is made.

---

## 2. The decision that shapes everything

There are two ways to give a user access to a paid model.

### Option A — issue each user their own provider API key (rejected)

We create an Anthropic key per signup and ship it to their IDE.

| Problem | Consequence |
|---|---|
| The key sits on the user's machine | Anyone can extract it and spend on our account, outside our IDE entirely |
| No enforcement point | We can only *observe* spend after the fact, via delayed provider reporting. We cannot stop a user at their limit |
| Revocation is unreliable | Downgrade requires a provider API call that can fail; a stale key keeps spending |
| Provider quotas are per-organisation | Thousands of keys still share one rate limit, and providers cap key counts |
| Total lock-in | No model switching, no fallback, no caching strategy, no per-project attribution |

The first row alone disqualifies it. A leaked key is an unbounded charge with no
ceiling and no alarm.

### Option B — one server-side key behind a gateway (recommended)

One key, held in server environment configuration. The IDE authenticates as a
*user*, not as a key holder.

| Property | Result |
|---|---|
| Key never leaves our infrastructure | Nothing to leak from a user's laptop |
| Every request passes an enforcement point | We can refuse before spending a cent |
| Revocation is instant | Disable the account; the next request fails |
| Model choice is a server config value | We can switch providers, add fallbacks, tier model access |
| Cost is recorded at the source | The provider's own usage numbers, not a client's claim |

**Recommendation: Option B.** This is also what every comparable product
(Cursor, GitHub Copilot, Windsurf) does; there is no third architecture in this
category.

---

## 3. How a user gets access — there is nothing to activate

A common assumption is that "linking the IDE to the model" needs a provisioning
step: generate something, email it, have the user paste it in.

**It does not. The sign-in we already shipped is the linking step.**

After the PKCE desktop flow (`10_ide_sso_implementation_prompt.md`), the IDE holds
a Supabase access token and refresh token. That token *is* the credential the
gateway accepts — and it is strictly better than a provider key would be:

| | Provider API key | Supabase access token |
|---|---|---|
| Lifetime | Permanent until revoked | ~1 hour, auto-refreshed |
| Blast radius if stolen | Unbounded spend on our account | One hour of one already-capped user |
| Works outside our product | Yes — anywhere | No — only against our gateway |
| Revocation | Provider API call, can fail | Account disable, immediate |
| User has to manage it | Yes | No — invisible to them |

So the onboarding story is: **register → sign in → use the AI.** No keys, no
licence strings, no activation screen. This is a feature, not a shortcut.

---

## 4. What actually happens during an AI task

This section corrects the most common misunderstanding of the design.

**The server does not edit anyone's code.** The agent loop runs inside the IDE, on
the user's own machine. The model never touches a file — it *asks* for things, and
the IDE performs them locally.

A single user message such as *"my /cmd_vel publisher isn't firing, find out why"*
becomes several independent round trips:

```
  IDE ──request 1──> gateway ──> model:  "grep the workspace for cmd_vel"
  IDE greps locally, sends results back
  IDE ──request 2──> gateway ──> model:  "read the node source"
  IDE reads the file locally, sends contents back
  IDE ──request 3──> gateway ──> model:  "read the launch file"
  IDE reads it locally
  IDE ──request 4──> gateway ──> model:  "run: colcon build"
  IDE runs the build locally, captures output
  IDE ──request 5──> gateway ──> model:  proposes an edit + explanation
  IDE shows a diff; user accepts; IDE writes to disk
```

Five HTTP requests to our gateway for one user message. Each is separately
authenticated, separately budget-checked, and separately metered. The gateway is
**stateless** — it relays one turn and hangs up. The IDE holds the conversation.

Three consequences that matter:

1. **"Number of API calls" is meaningless as a billing unit.** A trivial question
   is one call; a real debugging task is fifteen. Cost per call varies by a factor
   of 100 or more. This is why we meter tokens (§5).
2. **We are not building an execution environment.** No sandboxes, no repo clones,
   no build servers. The gateway is a turnstile with a meter, which is why the
   engineering estimate is weeks and not quarters.
3. **User code does transit our gateway**, because file contents form part of the
   prompt. This is unavoidable in any gateway design and is true of Cursor as
   well. It must be stated in the privacy policy, we must log token counts only
   and never message content, and BYOK (§7.4) is the answer for teams who cannot
   accept it.

### Is JSON over HTTPS reliable for agentic code editing?

Yes — it is the only architecture in use in this product category. Three
specifics make it work in practice:

- **Streaming.** Responses arrive as Server-Sent Events and appear in the chat
  panel token by token. A buffered request/response design would feel broken and
  would hit HTTP timeouts on long turns.
- **Typed tools, not parsed prose.** We declare tools (`read_file`, `edit_file`,
  `run_terminal`) with JSON schemas. The provider guarantees the model's output
  validates against the schema, so the IDE receives typed arguments rather than
  text it must interpret. Failures are "the model chose the wrong file" — a model
  quality issue — not "the response was malformed."
- **Context discipline.** Large files are a cost problem, not a transport problem.
  The IDE sends excerpts and uses search tools rather than dumping whole files,
  and prompt caching (§5.2) makes the repeated part of a conversation ~10× cheaper
  on every subsequent turn in the loop.

---

## 5. How usage is calculated

### 5.1 Three layers, bill on one

| Layer | Stored as | Visible to |
|---|---|---|
| **Raw** | input / output / cache-read / cache-write tokens, model id | nobody — audit and disputes only |
| **Cost** | `cost_micro_usd`, integer micro-dollars | internal — this is the margin number |
| **Credits** | `credits`, integer | the customer |

Credits decouple our pricing from provider price changes. If a provider raises
rates or we switch models, we adjust the internal conversion rate; the customer's
"6,000 credits per month" promise does not change. Exposing raw tokens instead
would make every provider price change a customer-facing repricing event.

### 5.2 Token types are not interchangeable

The current schema has a single `cached_tokens` column. That is insufficient. The
provider returns **two** cache figures priced roughly 20× apart:

| Token type | Sonnet-class price / million | Relative |
|---|---|---|
| Fresh input | $3.00 | 1× |
| Cache read | ~$0.30 | 0.1× |
| Cache write | ~$3.75 | 1.25× |
| Output | $15.00 | 5× |

Two requests with identical *total* token counts can differ tenfold in real cost.
Collapsing them into one column systematically under-bills the heaviest users —
precisely the users who threaten the Max tier. **`cached_tokens` must be split
into `cache_read_tokens` and `cache_write_tokens` before the schema is applied.**

Cache hit rate is therefore a commercial metric, not a technical detail. On long
agentic runs it is the difference between roughly 1× and 3× our cost of goods.

### 5.3 The formula

```
cost_micro_usd =  input_tokens        × price.input
                + cache_write_tokens  × price.cache_write
                + cache_read_tokens   × price.cache_read
                + output_tokens       × price.output      (per million, integer maths)

credits = ceil(cost_micro_usd × markup ÷ CREDIT_MICRO_USD)
```

All integer arithmetic — never floating point for money.

`price` is read from a **`roboagent_model_pricing` table keyed by model and
`effective_from` date**, never from a constant in code. Provider prices change on
schedule (current Sonnet-class introductory pricing of $2/$10 per million reverts
to $3/$15 on 2026-08-31). Effective-dated pricing lets us reprice future usage
without corrupting historical records.

### 5.4 Illustrative numbers

At `CREDIT_MICRO_USD = 1000` (1 credit = $0.001 of provider cost), a realistic
agentic turn — 5k fresh input, 25k cache read, 2k output on a Sonnet-class model —
costs about **52 credits**.

| Tier | Price | Credits / period | Our model cost ceiling | ≈ agent turns |
|---|---|---|---|---|
| Free | $0 | 300 | $0.30 | ~6 |
| Pro | $20 | 6,000 | $6.00 (30% COGS) | ~115 |
| Max | $150 | 50,000 | $50.00 (33% COGS) | ~960 |

These are illustrations of the *mechanism*, not a pricing recommendation — the
real numbers follow from the decision in §9.

**Model access is a tier lever, not a second meter.** Free and Pro get Haiku- and
Sonnet-class models; Max additionally gets Opus-class. Because credits are derived
from cost, an Opus turn automatically debits roughly 1.7× a Sonnet turn with no
extra accounting logic.

---

## 6. The user journey, end to end

**Registration.** The user signs up on the website. Supabase creates one identity
shared across all four Robotics Corner products. No subscription row is written —
absence of a row means Free, which avoids any backfill and removes the
"registered but has no plan" state entirely.

**Linking.** They install the IDE and sign in. PKCE flow completes, tokens are
stored encrypted. That is the whole activation. The IDE fetches entitlements —
plan Free, 300 credits, 300 remaining — and the model picker shows only the models
Free permits. Higher-tier models are absent from the list, and a hand-crafted
request naming one is rejected by the gateway regardless.

**First task.** The user asks a question. Over five or six round trips (§4), the
gateway authenticates, checks budget, forwards, streams back, and after each turn
records one immutable usage row and atomically decrements the balance. Total for
the task: roughly 72 credits.

**Watching the meter.** Credits are debited **at the end of each turn**, not
continuously — cost is unknowable until a turn completes. The counter therefore
falls in visible steps (15, 11, 14, 19), not smoothly. The IDE shows the remaining
balance and refreshes it after each turn; the dashboard shows the same figure plus
history, read under row-level security. Users can read their own usage rows and
cannot write any, which is what makes the meter non-forgeable.

**Running out.** At 20 credits remaining, a turn costing 22 is allowed to complete
and takes the balance to −2. This overshoot is deliberate: terminating a stream
mid-turn can leave a half-applied edit in the user's working tree, which is a data
integrity failure, not a billing win. The *next* turn fails its pre-flight check
and returns a dedicated "insufficient credits" response before any money is spent.
The IDE surfaces an upgrade action rather than an error. Editing, building, ROS2
tooling and simulation are unaffected — the user has lost the AI, not the editor.

**Upgrade and reset.** The payment gateway webhook (Kashier) writes the new plan,
sets the billing period to the subscription anchor date, and resets the balance.
The IDE picks it up on its next entitlements poll — no restart, no re-login.
Renewal resets the balance on the same anchor date each period; metering on the
calendar month instead would give a customer subscribing on the 28th three days of
service for a month's price.

---

## 7. Implementation plan

### 7.1 Database (amend before first apply)

`supabase/migrations/0001_roboagent_control_plane.sql` has **not yet been applied**
to Supabase. Amending it now yields one clean migration instead of a corrective
second one.

| Change | Table | Why |
|---|---|---|
| Split `cached_tokens` → `cache_read_tokens`, `cache_write_tokens` | `roboagent_usage_events` | §5.2 — 20× price difference |
| Add `cost_micro_usd`, `credits`, `billed`, `request_id` | `roboagent_usage_events` | server-computed cost; `billed=false` for BYOK; provider request id for disputes |
| New table `roboagent_model_pricing` | — | effective-dated prices (§5.3) |
| New table `roboagent_credit_balances` | — | materialised balance; the row the gateway reads and atomically updates |
| Add `credit_grant_override`, `byok_enabled` | `roboagent_subscriptions` | comped accounts, enterprise deals, bring-your-own-key |

Design constraints carried over from the existing migration, all of which remain
correct: usage events stay **append-only and immutable** (corrections are
compensating entries, never updates); row-level security stays **SELECT-only** so
the desktop app cannot forge usage; identity remains `auth.users.id` with cascade
delete so account-deletion requests stay satisfiable.

### 7.2 Server — `web/app/api/ai/chat/route.ts`

The single new surface. Six enforcement points per request:

| # | Point | Prevents |
|---|---|---|
| 1 | Balance check before forwarding | runaway spend |
| 2 | Model allow-list for the user's plan | a Free user reaching an Opus-class model |
| 3 | Per-request ceilings (max output tokens, max tool iterations) | one request consuming a month |
| 4 | **Drain the upstream stream even if the IDE disconnects** | silent under-billing |
| 5 | Atomic `consumed = consumed + n` in SQL | two IDE windows racing |
| 6 | Idempotency on `(user_id, event_key)` | retries double-charging |

**Point 4 is the one that is easy to get wrong.** Usage figures arrive in the final
chunk of the stream. Cancellation is common in an IDE — the user presses Escape.
If we abandon the upstream connection on client disconnect, we never see the token
counts and systematically under-bill our most active users.

**One performance change to existing code.** `web/lib/roboagent/ide-auth.ts`
currently validates via `auth.getUser()`, a network round trip to Supabase on
every call. That is correct for a once-per-minute heartbeat and wrong for the
model path, which runs several times per user message. The gateway should verify
the token locally against Supabase's JWKS with a short verification cache, then
check the device revocation flag. The existing `/api/ide/*` routes keep
`getUser()` unchanged.

### 7.3 Server — `web/app/api/ide/models/route.ts`

Returns the model list for the authenticated user's plan. The IDE must not
hardcode this: a hardcoded list is how a Free user learns the identifier of a
premium model and starts probing.

### 7.4 IDE — `extensions/roboagent-models`

A new extension registering RoboAgent as a model vendor through
`vscode.lm.registerLanguageModelChatProvider`, which is already generally
available in our fork (`src/vscode-dts/vscode.d.ts:20847`). It advertises the
models returned by §7.3 and routes every chat request to the gateway with the
existing Supabase bearer token. On an "insufficient credits" response it must
present a real upgrade action, not a generic error notification.

**Bring your own key (BYOK).** A user may supply their own provider key, stored
encrypted. Their requests are metered for their dashboard but charge zero credits.
This is our commercial safety valve against the individual user who would
otherwise cost several times their subscription, and it is a prerequisite for
teams whose procurement policy forbids code transiting a third party.

### 7.5 Dashboard and billing

Extend `api/dashboard/summary` with the credit balance and a usage-over-time
series. Add the Kashier subscription webhook that writes the plan, sets the
billing period from the subscription anchor date, and resets the balance on
renewal.

### 7.6 Build order

| # | Deliverable | Depends on |
|---|---|---|
| 1 | Tier and allowance decision (§9) | leadership |
| 2 | Amend and **apply** the migration | 1 |
| 3 | Seed the model pricing table | 2 |
| 4 | `lib/roboagent/metering.ts` — pure cost and credit functions, unit-tested | 3 |
| 5 | Gateway endpoint | 4 |
| 6 | Plan-filtered model list endpoint | 5 |
| 7 | IDE model provider extension | 5, 6 |
| 8 | Dashboard credit display | 4 |
| 9 | BYOK | 5 |
| 10 | Kashier webhook → period and balance reset | 2 |

Steps 4 and 5 carry the engineering risk; the remainder is plumbing. Steps 1–8
constitute a shippable increment; 9 and 10 can follow.

**Note on step 2:** applying the migration requires database DDL access, which the
current deployment box does not have — the service-role key is REST-only and there
is no Postgres connection string. Someone must run it in the Supabase SQL editor.
Until then the dashboard degrades to its "connect your IDE" empty state rather
than erroring.

---

## 8. Risks

| Risk | Mitigation |
|---|---|
| A single user's model cost exceeds their subscription | Credits with a hard ceiling; BYOK for outliers; anomaly alerting on sustained high consumption |
| Provider raises prices | Effective-dated pricing table; credits insulate the customer-facing promise |
| Under-billing through abandoned streams | Drain upstream on client disconnect (§7.2 point 4) |
| Double-billing on retry | Idempotency key already present in the schema |
| Customer disputes a charge | Immutable append-only ledger with provider request ids |
| Provider outage | Gateway is a single choke point — but also the single place to add fallback routing, which per-user keys would make impossible |
| User code transits our servers | Disclose in the privacy policy; log counts only, never content; offer BYOK |
| Cache hit rate collapses, tripling cost | Monitor cache read ratio as an operational metric from day one |

---

## 9. Decisions required before engineering starts

### 9.1 Which tier lineup is real?

Three incompatible lineups currently exist in our own materials:

| Source | Lineup |
|---|---|
| Live website (`app/pricing/page.tsx`) | Free / Pro $20 / Max $150 |
| `docs/12_monetization_strategy.md` | Hobby $0 / Pro $40 / Team $80 / Business $200 / Enterprise $500–2000 |
| IDE repo `requirements_docs/roboagent_blueprint_part5.md` §12.1 | Community / Pro $39 / Team $69 / Enterprise, with hourly simulation billing |

The server currently implements the website's tiers because that is the public
promise. Metering cannot be finished until one lineup is authoritative.

### 9.2 Do paid tiers advertise a credit allowance?

`web/lib/roboagent/plans.ts` deliberately sets the AI turn limit to unlimited on
every tier, with the comment that the pricing page promises "Basic AI chat"
without a number, and inventing a limit would impose a restriction users never
agreed to. That reasoning is sound — and it also means **we currently cannot stop
anyone.** Either the pricing page gains an explicit allowance, or Max remains
uncapped and we accept unbounded downside per customer.

Recommendation: publish an explicit allowance per tier.

### 9.3 Is overage purchasable?

When a user exhausts their credits mid-project, do they buy a top-up, or wait for
renewal? A top-up is additional revenue and a better experience; it is also
additional billing integration work.

Recommendation: block at first, add top-ups once Kashier integration is stable.

### 9.4 Which models on which tier?

Confirm the mapping (proposed: Haiku- and Sonnet-class on Free and Pro, Opus-class
added on Max). This determines both cost of goods and the perceived value gap
between Pro and Max.

---

## 10. Recommendation

Adopt Option B (§2). Amend the pending migration (§7.1) so the schema is right
the first time. Settle §9.1 and §9.2, which are product decisions rather than
engineering ones and are the only genuine blockers. Engineering can then deliver
steps 2–8 of §7.6 in approximately two weeks.

Until this ships, RoboAgent has no way to give a customer model access, no
measurement of what any customer costs, and no ability to stop the customer who
costs more than they pay.
