# Implementation brief: Sign in to RoboAgent IDE via Robotics Corner SSO

> **How to use this document.** Paste it whole into your coding assistant as the task
> brief, inside the RoboAgent IDE (Electron) repository. It is self-contained: the
> web side of this flow is being built separately and is described here as a fixed
> contract you code against. You are implementing **only the Electron/desktop side**.

---

## 1. What you are building

RoboAgent IDE is a desktop Electron app. On first launch the user has no account
session. They click **Sign in**, their **default system browser** opens to the
Robotics Corner web app, they authenticate there (or are already authenticated),
the browser hands control back to the IDE, and the IDE ends up holding a valid
session for that user.

The critical product requirement: **if the user is already signed in on the web,
the browser must not ask them anything.** It should flash through and return to the
IDE. That works because all Robotics Corner web properties share one browser
session cookie (see §2).

You are implementing an **OAuth 2.0 native-app authorization-code flow with PKCE**
(RFC 8252 / RFC 7636) against endpoints that already exist. You are not designing
the protocol — follow §4 exactly.

---

## 2. Background: how Robotics Corner SSO works

You need this to reason about the flow, not to call it directly.

- There are four web products — the main site, RoboHub, ConnectedLabs, and
  RoboAgent — all served from **one origin**, `https://www.roboticscorner.tech`,
  under different path prefixes (`/`, `/robohub`, `/connectedlabs`, `/roboagent`).
- Identity for all of them is a **single Supabase project**, ref
  `cgylgvvgyggfyvryqxxy` (`https://cgylgvvgyggfyvryqxxy.supabase.co`). Supabase Auth
  is the identity provider. There is no separate user database.
- The browser session lives in a host-only cookie `sb-cgylgvvgyggfyvryqxxy-auth-token`
  with `path=/`, which is why one login covers all four apps.
- A user is identified everywhere by their Supabase **`auth.users.id` (a UUID)**.
  Treat that UUID as the canonical user identifier in the IDE. Email can change.

**What this means for you:** you do not implement passwords, OAuth providers,
registration, or password reset. The browser handles all of it. You receive tokens
at the end and are responsible for storing and refreshing them.

---

## 3. Constants

```
SUPABASE_URL   = https://cgylgvvgyggfyvryqxxy.supabase.co
SUPABASE_ANON_KEY = <supplied separately — a public, publishable key>
WEB_BASE       = https://www.roboticscorner.tech/roboagent
```

The **anon key is public by design** and is safe to ship inside the desktop binary.
It grants nothing on its own; all authority comes from the user's token.

> **Never** put a Supabase *service role* key in the IDE. If you are given one,
> that is a mistake — stop and flag it. It bypasses all row-level security.

---

## 4. The flow — implement exactly this

### Step 1 — IDE prepares the request

Generate, per sign-in attempt:

| Value | How |
|---|---|
| `code_verifier` | 32 random bytes, base64url-encoded, no padding (43 chars) |
| `code_challenge` | base64url(SHA-256(`code_verifier`)), no padding |
| `state` | 32 random bytes, base64url-encoded, no padding |

Use `crypto.randomBytes` and `crypto.createHash('sha256')` from Node. Do not use
`Math.random()`.

### Step 2 — IDE starts a loopback listener

Start an HTTP server bound to **`127.0.0.1` on an ephemeral port** (listen on port
`0` and read the assigned port). Handle exactly one path: `GET /callback`.

Loopback is the primary redirect target because, unlike a custom URL scheme, no
other installed application can claim it. See §7 for the `roboagent://` fallback.

### Step 3 — IDE opens the system browser

```
shell.openExternal(
  `${WEB_BASE}/desktop-auth` +
  `?code_challenge=${challenge}` +
  `&code_challenge_method=S256` +
  `&state=${state}` +
  `&redirect_uri=${encodeURIComponent(`http://127.0.0.1:${port}/callback`)}`
)
```

**Must be `shell.openExternal`** — the real system browser. Do **not** open a
`BrowserWindow`: an in-app window has its own cookie jar, so the user's existing web
session would not be visible and SSO would silently fail. It is also a well-known
phishing-surface anti-pattern that identity providers actively block.

### Step 4 — the browser side (already built; here for context)

The web page validates `redirect_uri` against an allowlist, checks for an existing
session, sends the user to login if needed, then issues a **one-time authorization
code** bound to your `code_challenge`, and redirects to:

```
http://127.0.0.1:<port>/callback?code=<code>&state=<state>
```

On failure it redirects to `...?error=<code>&error_description=<text>`.

### Step 5 — IDE handles the callback

On `GET /callback`:

1. **Compare `state` to the value from Step 1 using a constant-time comparison**
   (`crypto.timingSafeEqual`). If it does not match, abort — do not proceed.
2. If `error` is present, abort and show the message.
3. Respond to the browser with a small HTML page saying "You can close this tab and
   return to RoboAgent" — the user is looking at a browser tab, so leave them
   somewhere sensible. Then shut the loopback server down.
4. Proceed to Step 6.

### Step 6 — IDE exchanges the code for tokens

```http
POST https://www.roboticscorner.tech/roboagent/api/desktop-auth/exchange
Content-Type: application/json

{ "code": "<code from callback>", "code_verifier": "<verifier from Step 1>" }
```

Success — `200`:

```json
{
  "access_token": "eyJ…",
  "refresh_token": "…",
  "token_type": "bearer",
  "expires_in": 3600,
  "expires_at": 1770000000,
  "user": { "id": "uuid", "email": "user@example.com", "user_metadata": { "full_name": "…" } }
}
```

Failure — `400` with `{ "error": "invalid_grant", "error_description": "…" }`.
Codes are **single-use and expire in 120 seconds**. Possible `error` values:
`invalid_grant` (unknown, expired, or already-used code), `invalid_request`
(malformed body), `access_denied`.

The code exchange is a POST precisely so that **tokens never appear in a URL**,
process arguments, browser history, or shell logs.

### Step 7 — IDE stores the session

Persist **only the refresh token** at rest, encrypted with Electron's
`safeStorage.encryptString()` (Keychain on macOS, DPAPI on Windows, libsecret on
Linux). Write the ciphertext under `app.getPath('userData')`.

- Check `safeStorage.isEncryptionAvailable()` first. If it returns false (common on
  bare Linux with no keyring), do **not** silently fall back to plaintext — tell the
  user encrypted storage is unavailable and require sign-in each launch.
- Keep the access token in memory only. It is short-lived; there is no reason to
  write it to disk.
- Never log either token. Redact them from crash reports and telemetry.

### Step 8 — refreshing

Access tokens last ~1 hour. Refresh **before** expiry (a 60-second margin is fine):

```http
POST https://cgylgvvgyggfyvryqxxy.supabase.co/auth/v1/token?grant_type=refresh_token
apikey: <SUPABASE_ANON_KEY>
Content-Type: application/json

{ "refresh_token": "<stored refresh token>" }
```

Returns the same shape as Step 6. **Supabase rotates refresh tokens** — the response
contains a new one. Persist it immediately, replacing the old.

Treat a `400`/`401` here as "session is gone": clear stored credentials and return
the user to the signed-out state. Do not retry in a loop.

Serialize refreshes behind a single in-flight promise. Two concurrent refreshes with
the same token will race, and the loser gets a revoked token.

### Step 9 — sign out

```http
POST https://cgylgvvgyggfyvryqxxy.supabase.co/auth/v1/logout
apikey: <SUPABASE_ANON_KEY>
Authorization: Bearer <access_token>
```

Then delete the stored refresh token and clear in-memory state. Treat a network
failure as non-fatal — still clear locally.

---

## 5. Calling Robotics Corner APIs afterwards

Send the access token as a bearer token:

```
Authorization: Bearer <access_token>
```

Backends verify it against the same Supabase project (some via JWKS, some via
`auth.getUser`). Nothing else is required — no API key, no separate app token.

---

## 6. Security requirements (non-negotiable)

1. **PKCE S256 only.** Never send `code_challenge_method=plain`.
2. **Validate `state`** with a constant-time compare. Reject on mismatch.
3. **Bind the loopback server to `127.0.0.1`, never `0.0.0.0`** — binding to all
   interfaces exposes your callback to the local network.
4. **One attempt per server.** Shut the listener down after the first callback, and
   on a timeout (~5 minutes) or user cancel.
5. **Reject unexpected requests** to the loopback server: wrong path, wrong method,
   or a second callback after one succeeded.
6. **Never write tokens to logs**, telemetry, crash dumps, or the renderer process.
7. **Keep tokens in the main process.** If the renderer needs to make authenticated
   calls, proxy them over IPC — do not hand the token to renderer JavaScript, which
   is the process most exposed to injected content.
8. **Verify the exchange response is TLS.** Do not disable certificate validation,
   even in dev builds. `NODE_TLS_REJECT_UNAUTHORIZED=0` must never ship.

---

## 7. Deep-link fallback (`roboagent://`)

Loopback is primary. Some hardened environments block loopback listeners, so also
register a custom scheme as a fallback:

- `app.setAsDefaultProtocolClient('roboagent')`
- macOS: handle the `open-url` event.
- Windows/Linux: the deep link arrives as an argv entry to a **second instance** —
  you must call `app.requestSingleInstanceLock()` and handle `second-instance`, or
  the OS will launch a duplicate app that receives the callback while the original
  waits forever.

When using the fallback, pass `redirect_uri=roboagent://auth/callback`. Everything
else in the flow is identical — the code still comes back as a query parameter and
is still exchanged over POST.

**Understand the tradeoff and prefer loopback:** any application on the machine can
register `roboagent://` and thereby intercept the callback. PKCE is what makes this
survivable — an intercepted code is useless without the verifier, which never leaves
your process. This is exactly why the flow does not pass tokens directly.

---

## 8. UX and edge cases to handle

| Case | Expected behaviour |
|---|---|
| User already signed in on web | Browser flashes through, no prompt, returns to IDE. This is the happy path — verify it. |
| User has no account | The web login page offers registration. The IDE just waits; the callback arrives after signup. |
| User closes the browser without finishing | Time out after ~5 min, shut the listener, return to signed-out state with a retry affordance. |
| User clicks Sign in twice | Cancel the first attempt (and its listener) before starting a second. Never run two listeners. |
| Ephemeral port unavailable | Retry a couple of times, then fall back to the `roboagent://` scheme. |
| Offline at launch with a stored token | Start signed-in optimistically; on the first refresh failure that is clearly auth (`400`/`401`, not a network error) sign out. Do not sign the user out because the wifi is off. |
| Clock skew | Do not trust local time alone for expiry; treat a `401` from any API as authoritative and refresh. |
| App updates / reinstall | Stored refresh token should survive an update. Document whether it survives an uninstall. |

Show a clear in-app state while waiting: *"Waiting for you to finish signing in in
your browser…"* with a **Cancel** button that actually tears down the listener.

---

## 9. Acceptance criteria

1. Signed in on `roboticscorner.tech` in the default browser → clicking **Sign in**
   in the IDE completes with **zero** browser prompts, and the IDE shows the correct
   email/name.
2. Signed out on web → the browser prompts for login, and on success the IDE
   completes sign-in.
3. Tokens appear **nowhere** in: the callback URL, application logs, `ps` output, or
   shell history. Verify deliberately.
4. Restarting the IDE keeps the user signed in (refresh token path works).
5. An expired access token is transparently refreshed without the user noticing.
6. Sign out clears local credentials, and the next launch requires sign-in.
7. Tampering with `state` in the callback URL causes a hard failure, not a sign-in.
8. Replaying a used `code` returns `invalid_grant` and does not produce a session.
9. Two rapid sign-in clicks do not leave a stray listener bound.

Test 3, 7, and 8 explicitly — they are the ones that silently regress.

---

## 10. Suggested structure

```
src/main/auth/
  pkce.ts        # verifier/challenge/state generation
  loopback.ts    # one-shot 127.0.0.1 callback server
  exchange.ts    # code -> tokens, refresh, logout HTTP calls
  storage.ts     # safeStorage wrapper for the refresh token
  session.ts     # in-memory session, refresh scheduling, sign-in/out orchestration
  index.ts       # IPC surface exposed to the renderer
```

Keep everything above in the **main** process. The renderer should only ever see
derived state — `isSignedIn`, `user.email`, `user.id` — never a token.

Write unit tests for `pkce.ts` (challenge matches a known verifier/hash pair) and for
the `state` mismatch and used-code rejection paths.

---

## 11. Open items to confirm before shipping

- The `SUPABASE_ANON_KEY` value — request it; do not guess or scrape it.
- Whether the IDE should surface RoboAgent plan tier (Free/Pro/Max). **Note: plan
  data does not exist server-side yet** — there is no plans table. Do not build
  entitlement gating against an API that isn't there; assume every authenticated
  user is Free until told otherwise.
- Whether an existing web session should be *required*, or the IDE should also allow
  a fully in-browser first-time registration. Current design allows both.
