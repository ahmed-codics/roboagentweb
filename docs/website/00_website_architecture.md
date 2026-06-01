# RoboAgent Website — Architecture & Strategy

A companion blueprint for the marketing + product site living in `/web`.
Stack: **Next.js 15 (App Router) · React 19 · TypeScript · TailwindCSS · Framer Motion**.

---

## 1. Site map & routing

```
/                       Landing
/features               Deep feature page
/pricing                Free / Pro / Max + comparison + FAQ
/download               OS cards + release notes + checksums
/docs                   Docs home
/docs/[...slug]         Catch-all docs renderer (DOCS_NAV-driven)
/about                  Mission, vision, values, roadmap
/contact                General · Enterprise · Partnerships · Research
/blog                   Article index + categories
/blog/[slug]            (placeholder — wire MDX in /content)
/login                  Email + GitHub + Google
/register               Sign-up
/forgot                 Password reset
/dashboard              Authenticated control-plane mockup
/legal/{terms,privacy,security,dpa}   Legal stubs (TODO)
```

App Router segment layout:

- `app/layout.tsx` — root layout, fonts, dark-only theme, persistent `<Nav />` and `<Footer />`
- `app/docs/layout.tsx` — sidebar + right-rail "On this page" + ⌘K search slot
- Auth pages (`/login`, `/register`, `/forgot`) share the `<AuthShell />` component, not a layout (to keep the global `<Nav />` visible — switch to a route group `(auth)` with its own layout if you want a chrome-less look)

## 2. Component hierarchy

```
RootLayout
├─ Nav (sticky, scroll-blur, mobile sheet)
│   └─ Logo
├─ <main>
│   ├─ Hero
│   │   ├─ TerminalPreview (animated agent log)
│   │   └─ ROSGraph (SVG, animated edge particles)
│   ├─ FeaturesGrid (10 capability cards)
│   ├─ Workflow (Code → Sim → Debug → Deploy)
│   ├─ Personas
│   ├─ Testimonials
│   └─ CTA
└─ Footer (4-column links + social + status)
```

Reusable primitives live in `components/ui`:
- `Button` (variants: primary, secondary, ghost, outline, **max** = gradient glow)
- `Card`, `CardHeader`, `CardBody`
- `Section`, `SectionHeading`, `SectionLabel`

Robotics-specific visual components:
- `TerminalPreview` — scripted agent dialog with cursor blink and tool calls
- `ROSGraph` — SVG force-style graph with animated message flow
- `CodeBlock` — fenced code with file/lang chrome

## 3. Tailwind / styling strategy

Single source of truth in `tailwind.config.ts`. Tokens:

- **Surfaces** — `bg-bg`, `bg-bg-surface`, `bg-bg-elevated`, `bg-bg-ridge` (4 levels of dark — never raw black)
- **Text** — `text-ink`, `text-ink-muted`, `text-ink-dim`, `text-ink-faint`
- **Brand** — `text-cyan-glow` (#22e6ff) and `text-accent-violet` (#7b5cff) anchor the palette; supporting accents for amber/rose/green status
- **Effects** — `.glass` (backdrop-blur + tinted border), `.glow-border` (CSS-mask gradient ring), `.text-gradient`, `.bg-grid`, `.bg-grid-fine`, `.mask-fade-b`, `.mask-radial`
- **Animations** — `pulse-soft`, `scan`, `float`, `fade-up`, `blink` (terminal cursor)

No CSS-in-JS. No styled-components. Pure Tailwind + a few utility classes in `globals.css`.

## 4. Folder structure

```
web/
├── app/
│   ├── layout.tsx
│   ├── page.tsx            # landing
│   ├── globals.css
│   ├── features/page.tsx
│   ├── pricing/page.tsx
│   ├── download/page.tsx
│   ├── about/page.tsx
│   ├── contact/page.tsx
│   ├── blog/page.tsx
│   ├── docs/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── [...slug]/page.tsx
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── forgot/page.tsx
│   └── dashboard/page.tsx
├── components/
│   ├── Nav.tsx
│   ├── Footer.tsx
│   ├── Logo.tsx
│   ├── Hero.tsx
│   ├── TerminalPreview.tsx
│   ├── ROSGraph.tsx
│   ├── FeaturesGrid.tsx
│   ├── Workflow.tsx
│   ├── Personas.tsx
│   ├── Testimonials.tsx
│   ├── CTA.tsx
│   ├── CodeBlock.tsx
│   ├── AuthShell.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       └── Section.tsx
├── lib/
│   ├── cn.ts
│   └── docs-nav.ts
├── content/
│   └── docs/               # MDX docs (wire later)
├── public/
│   └── logo.png
├── tailwind.config.ts
├── postcss.config.mjs
├── next.config.ts
├── tsconfig.json
└── package.json
```

## 5. API & integration architecture (Phase 2)

The marketing site is statically renderable. Authenticated/dynamic surfaces live behind these routes:

- `/api/auth/*` — handled by **NextAuth (Auth.js)** with GitHub + Google providers; email/password via Resend magic links. Sessions in JWT + KV (Upstash Redis) for rotation.
- `/api/billing/*` — **Stripe** subscriptions (Pro = price_pro_monthly / price_pro_yearly, Max = price_max_*). **Metronome** for usage events (sim hours, tool calls).
- `/api/docs/search` — **MeiliSearch** index hosted on Cloud, populated at build via a script crawling `/content/docs/`.
- `/api/contact` — POST → Resend transactional + persist to Postgres for CRM (HubSpot via webhook).
- `/api/telemetry` — opt-in only. Endpoint: anonymized session traces from the desktop client.
- `/api/dashboard/*` — when wired, `roboagentd` connects via WebSocket (over mTLS) for fleet status, sim runs, deployments. Backed by Postgres (RDS) + ClickHouse (telemetry) + S3 (bag uploads).

Auth boundary:
- **Public**: `/`, `/features`, `/pricing`, `/download`, `/docs/*`, `/about`, `/contact`, `/blog`
- **Auth-only**: `/dashboard`, `/account`, `/billing`
- Middleware (`middleware.ts`, future) gates the auth-only paths and redirects unauth → `/login?next=…`

## 6. SEO strategy

- **Per-page metadata** via `generateMetadata` exporters; default metadata in root layout sets canonical title/description.
- **Sitemap & robots** via `app/sitemap.ts` and `app/robots.ts` (build-time generated for `/docs/[slug]`).
- **OpenGraph cards** auto-generated with `app/og/route.ts` (Edge `ImageResponse`) — same headline + glow grid as the hero, dynamic per page.
- **Structured data**: `SoftwareApplication`, `Organization`, `FAQPage` (on /pricing), `BreadcrumbList` on /docs. JSON-LD inlined in `<head>`.
- **Performance**: CSR is minimized (only Hero terminal + ROSGraph + Pricing toggle are client). Target Lighthouse ≥ 95 on all marketing pages.
- **Content moats**:
  - SEO-targeted comparison pages: `/vs/cursor`, `/vs/foxglove`, `/vs/copilot` — high-intent traffic.
  - Calculator pages: `/calculators/qos-checker`, `/calculators/launch-resolver` — utility tools that rank.
  - The blog targets long-tail ROS2 queries: "ros2 nav2 inflation_radius footprint mismatch", etc.
- **Internal linking**: docs cross-link to features; pricing cross-links to comparison and FAQ.

## 7. Onboarding strategy

Three-track onboarding, all driven by the agent itself rather than a modal wizard:

1. **"I have a workspace"** — point at `~/ros2_ws`, watch live indexing in the IDE, run `> explain my robot` to get a one-paragraph architecture report and a TF graph in <2 min. This is the path that converts.
2. **"I have a bag"** — drop a `rosbag2/` or `.mcap`. The agent runs Bag→Bug, surfaces 1–3 ranked diagnoses with citations. No workspace needed. This is the "wow" demo for outbound conversations.
3. **"I have nothing"** — scaffold the TurtleBot3 demo workspace and a sample bag, then walk the new user through both flows above.

Activation funnel (instrumented):
- Install → first ROS2 introspection (✓ tooling works)
- → first agent question (✓ understood pricing/value)
- → first sim run (✓ understood the loop)
- → first patch applied (✓ engaged daily-active)

The "first patch applied" event is the single best leading indicator of conversion to Pro.

Empty states everywhere are opinionated: every empty state has one copy line and one button, never a blank page.

## 8. Conversion optimization

- **Hero CTA hierarchy**: primary "Download for Linux" (cyan glow), secondary "Read the docs" (outline), tertiary "Get started" (ghost). Cursor's exact pattern.
- **Social proof above the fold** — 6 fictional but plausible logo names in the trust strip.
- **Live agent demo** in the hero — a static screenshot would be 30% less compelling than the scripted terminal animation.
- **Tier highlight**: Pro card glows; Max card uses violet gradient. ~70% of revenue will come from Pro per industry benchmarks; design the page accordingly.
- **Yearly toggle** with `−16%` badge — anchors the discount, accelerates LTV.
- **Comparison table** beats marketing copy. Engineers buy after they see the matrix.
- **Refund block** — removes friction. 30-day refund language in plain English.
- **Empty hero on /dashboard** when not signed in — convertible CTA: "Sign in to see your fleet".
- **Pricing FAQ owns the long tail** of objections (GPU, BYO key, data, cancellation, academic).

## 9. Animations (Framer Motion)

- Hero: fade-up cascades with staggered delays (50ms, 120ms, 200ms, 350ms)
- Terminal: timed line reveal every 1.1s, blinking cursor on the most recent agent line
- ROS graph: animated dots traveling each edge with offset delays — communicates "live data flow"
- Feature cards: hover lift + cyan border color shift
- Buttons: subtle scale on hover, glow shadow ramp on primary
- Scroll: section reveal at 30% viewport (use `framer-motion`'s `whileInView` when wired)

Performance rule: no animation that touches layout. Only `transform` and `opacity`.

## 10. Launch strategy

**T-30: Private beta**
- 50 hand-picked design partners (existing ROS2 startup network)
- Discord-only support
- Daily NPS via in-product prompt
- Features locked: Bag→Bug, launch IR, TF analyzer, local Gazebo

**T-14: Public waitlist + Show HN draft**
- Marketing site live at roboagent.ai
- Waitlist on /download — gate the binary download behind email
- Comparison pages (`/vs/cursor`, `/vs/foxglove`) live and indexed
- 5 launch-week blog posts queued (the ones already drafted in /app/blog)

**T-0: Launch day**
- Show HN: "Show HN: RoboAgent — an AI IDE that understands your ROS2 workspace"
- Lead with the Bag→Bug video (60s)
- Concurrent Twitter/X thread from the founder
- Press: TechCrunch (robotics beat), The Robot Report, IEEE Spectrum
- Founder appears on the Weekly Robotics, ROS Developers Day, and Robotics Tomorrow podcasts in the launch month
- ROScon 2026 booth (book early)

**T+30: First retention wave**
- Monthly engineering deep-dive blog post cadence
- Office hours weekly in Discord
- Open-source the launch-IR parser (the wedge for adoption)
- Begin enterprise outbound (5 named accounts/week)

**T+90: PMF measurement**
- 50 paid teams target
- Net retention ≥ 90% (early-stage benchmark)
- "First patch applied" → Pro conversion ≥ 30% within 14 days
- If we miss those, freeze new features and run a focused PMF sprint with our 5 most engaged teams.

## 11. Things deliberately NOT built (yet)

- No multi-language i18n. English-only at launch. (Robotics market is English-default at the dev level.)
- No light theme. Dark is the brand.
- No fully-built CMS. Blog and docs are MDX-on-disk; we'll graduate to Sanity/Contentlayer at >50 posts.
- No real auth wiring on these pages — they're routed and styled but the form actions are stubs. Wire NextAuth in the integration sprint.
- No live Stripe — `/pricing` CTAs route to `/register?plan=…` which is the right pre-payment flow.
- No comments/changelog feed on the site. GitHub Releases is the source of truth — `/docs/changelog` mirrors it.
- No status page in-house. Use Statuspage.io or Atlassian Status — wire link in footer.

## 12. Operational notes

- **Hosting**: Cloudflare Pages or Vercel. Pages preferred for cost; Vercel for OG/Edge ergonomics. Either works.
- **CI**: GitHub Actions — `next build`, `next lint`, type-check, link-check, broken-image check on every PR.
- **Preview deploys**: every PR gets a unique URL. Lighthouse CI gates merges below 90.
- **Analytics**: Plausible (self-hostable, GDPR-friendly) + PostHog for product. No Google Analytics.
- **Monitoring**: Sentry on `/api/*` routes; uptime via Better Uptime; cron checks for `/sitemap.xml` and OG renders.

---

## TL;DR

The website is built like the product: opinionated, dark, fast, robotics-first. It does the four things a SaaS site must — explain, demo, price, convert — and adds two robotics-native moves: live agent demo and ROS-graph visual. Marketing pages are pure SSG; auth and dashboard are scaffolded for the integration sprint. The fastest path from this commit to revenue is wire NextAuth + Stripe and ship to a private waitlist.
