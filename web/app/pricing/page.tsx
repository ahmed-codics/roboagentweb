"use client";

import { Fragment, useState } from "react";
import { Check, Minus, Sparkles, Zap, ShieldCheck } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

type Plan = {
  id: "free" | "pro" | "max";
  name: string;
  tagline: string;
  monthly: number;
  yearly: number;
  features: string[];
  cta: string;
  href: string;
  highlight?: boolean;
  premium?: boolean;
};

const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    tagline: "For curious developers and students.",
    monthly: 0,
    yearly: 0,
    features: [
      "Basic AI chat",
      "Small context window (32k)",
      "Limited ROS workspace indexing",
      "Community support (Discord)",
      "Basic code completion",
      "5 simulation runs / month",
      "Single workspace",
    ],
    cta: "Start Free",
    href: "/register",
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "For roboticists shipping real machines.",
    monthly: 20,
    yearly: 200,
    features: [
      "Advanced AI robotics assistant (Sonnet 4.6)",
      "Full ROS2 workspace intelligence",
      "TF tree analysis & QoS auditing",
      "Launch file symbolic execution",
      "Sim-in-the-loop debugging",
      "Bag file analyzer (MCAP + rosbag2)",
      "Embedded support (STM32 / ESP32 / Zephyr)",
      "Priority inference, larger context (200k)",
      "Unlimited workspaces",
      "Email support",
    ],
    cta: "Upgrade to Pro",
    href: "/register?plan=pro",
    highlight: true,
  },
  {
    id: "max",
    name: "Max",
    tagline: "For teams operating fleets.",
    monthly: 150,
    yearly: 1500,
    features: [
      "Autonomous robotics agents (Opus 4.7)",
      "Multi-agent debugging loops",
      "Cloud Gazebo / Ignition GPU pool",
      "Team collaboration & shared RKG",
      "Fleet debugging & remote agents",
      "Enterprise deployment tools",
      "Priority inference + dedicated compute",
      "Custom robotics fine-tunes",
      "Advanced observability & audit",
      "API access",
      "SLA & dedicated support",
    ],
    cta: "Go Max",
    href: "/register?plan=max",
    premium: true,
  },
];

export default function PricingPage() {
  const [yearly, setYearly] = useState(false);

  return (
    <>
      <Section className="pb-10">
        <SectionHeading
          eyebrow="Pricing"
          title="Plans that scale from prototype to fleet."
          subtitle="Start free. Upgrade when your robot is more than a side project. Pay annually for two months free."
        />

        <div className="mb-10 flex justify-center">
          <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-bg-surface p-1 text-sm">
            <button
              onClick={() => setYearly(false)}
              className={cn(
                "rounded-full px-4 py-1.5 transition",
                !yearly ? "bg-white/10 text-ink" : "text-ink-muted"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setYearly(true)}
              className={cn(
                "rounded-full px-4 py-1.5 transition flex items-center gap-1.5",
                yearly ? "bg-white/10 text-ink" : "text-ink-muted"
              )}
            >
              Yearly
              <span className="rounded-full bg-cyan-glow/15 px-2 py-0.5 text-[10px] font-medium text-cyan-glow">
                −16%
              </span>
            </button>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {PLANS.map((p) => (
            <PlanCard key={p.id} plan={p} yearly={yearly} />
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-ink-muted">
          Need 50+ seats, on-prem, or air-gapped?{" "}
          <a href="/contact#enterprise" className="text-cyan-glow underline-offset-4 hover:underline">
            Talk to our enterprise team →
          </a>
        </p>
      </Section>

      <ComparisonTable />
      <FAQ />
      <Refund />
    </>
  );
}

function PlanCard({ plan, yearly }: { plan: Plan; yearly: boolean }) {
  const price = yearly ? Math.round(plan.yearly / 12) : plan.monthly;
  return (
    <div
      className={cn(
        "relative rounded-2xl border p-7 transition",
        plan.highlight
          ? "border-cyan-glow/40 bg-bg-surface shadow-glow"
          : plan.premium
          ? "border-accent-violet/40 bg-gradient-to-b from-bg-elevated to-bg-surface shadow-[0_0_50px_-10px_rgba(123,92,255,0.4)]"
          : "border-white/10 bg-bg-surface/60"
      )}
    >
      {plan.highlight && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-cyan-glow px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-bg shadow-glow-sm">
          Most popular
        </div>
      )}
      {plan.premium && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-accent-violet to-cyan-glow px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
          Premium
        </div>
      )}

      <div className="flex items-center gap-2">
        {plan.id === "free" && <Sparkles className="h-4 w-4 text-ink-muted" />}
        {plan.id === "pro" && <Zap className="h-4 w-4 text-cyan-glow" />}
        {plan.id === "max" && <ShieldCheck className="h-4 w-4 text-accent-violet" />}
        <h3 className="text-xl font-semibold">{plan.name}</h3>
      </div>
      <p className="mt-1 text-sm text-ink-muted">{plan.tagline}</p>

      <div className="mt-6 flex items-baseline gap-1">
        <span className="text-5xl font-semibold tracking-tight">${price}</span>
        <span className="text-sm text-ink-muted">/ seat / mo</span>
      </div>
      {yearly && plan.monthly > 0 && (
        <div className="mt-1 text-xs text-ink-dim">
          billed ${plan.yearly} yearly
        </div>
      )}

      <Button
        href={plan.href}
        size="lg"
        variant={plan.premium ? "max" : plan.highlight ? "primary" : "secondary"}
        className="mt-6 w-full"
      >
        {plan.cta}
      </Button>

      <ul className="mt-7 space-y-2.5">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-ink-muted">
            <Check className="mt-0.5 h-4 w-4 flex-none text-cyan-glow" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const COMPARE: { label: string; free: string | boolean; pro: string | boolean; max: string | boolean; group?: string }[] = [
  { group: "AI", label: "Frontier model", free: "Haiku 4.5", pro: "Sonnet 4.6", max: "Opus 4.7" },
  { label: "Context window", free: "32k", pro: "200k", max: "1M (cached)" },
  { label: "Autonomous agents", free: false, pro: false, max: true },
  { label: "Multi-agent debugging", free: false, pro: false, max: true },
  { label: "Custom fine-tunes", free: false, pro: false, max: true },

  { group: "Robotics", label: "ROS2 workspace indexing", free: "limited", pro: true, max: true },
  { label: "Launch IR & TF analysis", free: false, pro: true, max: true },
  { label: "Bag analyzer", free: "1 bag", pro: "unlimited", max: "unlimited + cloud" },
  { label: "Embedded (STM32/ESP32/Zephyr)", free: false, pro: true, max: true },
  { label: "Fleet / remote robot agent", free: false, pro: "1 robot", max: "unlimited" },

  { group: "Simulation", label: "Local Gazebo / Ignition", free: "5/mo", pro: "unlimited", max: "unlimited" },
  { label: "Cloud GPU sim", free: false, pro: "20 hrs/mo", max: "200 hrs/mo" },
  { label: "Scenario library", free: false, pro: true, max: "yes + custom" },

  { group: "Team & enterprise", label: "Workspaces", free: "1", pro: "unlimited", max: "unlimited" },
  { label: "Shared RKG", free: false, pro: false, max: true },
  { label: "SSO / SAML", free: false, pro: false, max: true },
  { label: "Audit logs", free: false, pro: false, max: true },
  { label: "Self-hosted option", free: false, pro: false, max: true },
  { label: "Support", free: "Community", pro: "Email", max: "Dedicated + SLA" },
];

function ComparisonTable() {
  return (
    <Section className="py-16">
      <SectionHeading title="Compare plans" subtitle="Every capability, side by side." />
      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-bg-surface/40">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-ink-dim">
              <th className="px-5 py-4 font-medium">Feature</th>
              <th className="px-5 py-4 font-medium">Free</th>
              <th className="px-5 py-4 font-medium text-cyan-glow">Pro</th>
              <th className="px-5 py-4 font-medium text-accent-violet">Max</th>
            </tr>
          </thead>
          <tbody>
            {COMPARE.map((row, i) => (
              <Fragment key={i}>
                {row.group && (
                  <tr className="bg-white/[0.02]">
                    <td colSpan={4} className="px-5 py-2 text-xs font-semibold uppercase tracking-wider text-ink-dim">
                      {row.group}
                    </td>
                  </tr>
                )}
                <tr className="border-t border-white/5">
                  <td className="px-5 py-3 text-ink">{row.label}</td>
                  <td className="px-5 py-3"><Cell v={row.free} /></td>
                  <td className="px-5 py-3"><Cell v={row.pro} /></td>
                  <td className="px-5 py-3"><Cell v={row.max} /></td>
                </tr>
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

function Cell({ v }: { v: string | boolean }) {
  if (v === true) return <Check className="h-4 w-4 text-cyan-glow" />;
  if (v === false) return <Minus className="h-4 w-4 text-ink-dim" />;
  return <span className="text-ink-muted">{v}</span>;
}

const FAQS = [
  {
    q: "Do I need a GPU?",
    a: "No. RoboAgent runs on a regular Linux laptop. GPU is only useful for cloud Isaac Sim (Max tier) or self-hosted local LLMs.",
  },
  {
    q: "Does it work with my existing ROS2 workspace?",
    a: "Yes. Point RoboAgent at your ros2_ws and it will index colcon, launch files, URDF, and bags incrementally. No code changes required.",
  },
  {
    q: "Can I use my own LLM keys?",
    a: "On Pro and Max, yes — bring-your-own-key for Anthropic, AWS Bedrock, or Vertex. Useful for compliance and bursty enterprise inference.",
  },
  {
    q: "How is data handled?",
    a: "Source code and bags stay local by default. Telemetry to improve our models is opt-in only. Enterprise customers can run fully air-gapped.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Monthly plans cancel instantly; yearly plans are refundable for 30 days, no questions asked.",
  },
  {
    q: "Is there an academic discount?",
    a: "Pro is free for verified .edu accounts. Reach out from your institutional email and we'll set you up.",
  },
];

function FAQ() {
  return (
    <Section className="py-20">
      <SectionHeading title="Frequently asked" />
      <div className="mx-auto grid max-w-4xl gap-3">
        {FAQS.map((f) => (
          <details key={f.q} className="group rounded-xl border border-white/10 bg-bg-surface/60 p-5 open:bg-bg-elevated/60">
            <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-ink">
              {f.q}
              <span className="text-ink-dim transition group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 text-sm text-ink-muted">{f.a}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}

function Refund() {
  return (
    <Section className="py-16">
      <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-bg-surface/60 p-8 text-center">
        <h3 className="text-lg font-semibold">30-day refund policy</h3>
        <p className="mt-2 text-sm text-ink-muted">
          If RoboAgent doesn't save you a meaningful amount of debugging time in the first 30 days, email{" "}
          <a className="text-cyan-glow" href="mailto:billing@roboagent.ai">billing@roboagent.ai</a> for a full refund.
          No invoices, no hoops. Yearly plans are pro-rated to the day.
        </p>
      </div>
    </Section>
  );
}
