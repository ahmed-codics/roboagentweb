"use client";

import { Fragment, useState } from "react";

import Link from "next/link";

import { Section, SectionHeading } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { useSession } from "@/lib/supabase/use-session";
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

/**
 * Signed-in visitors must never be sent to /register — they already have an
 * account, and being asked to sign up again reads as "you're logged out".
 *
 * Free resolves to the dashboard (there is nothing to buy). Pro/Max open a
 * prefilled email, deliberately NOT /contact: that form is a stub that fakes a
 * success message without sending anything, so upgrade intent would be lost
 * silently. hello@roboagent.ai is the address the contact page itself gives for
 * anything that doesn't fit the form.
 *
 * This is interim. Once the Kashier checkout exists it replaces this function
 * and nothing else on the page has to change.
 */
function signedInCta(plan: Plan): { cta: string; href: string } {
  if (plan.id === "free") return { cta: "Go to dashboard", href: "/dashboard" };

  const subject = `Upgrade my account to RoboAgent ${plan.name}`;
  const body =
    `Hi RoboAgent team,\n\nI'd like to upgrade my account to the ${plan.name} plan.\n\n` +
    `Account email: \n\nThanks.`;

  return {
    cta: `Upgrade to ${plan.name}`,
    href: `mailto:hello@roboagent.ai?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
  };
}

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
  // Gate on `loading`: rendering the signed-out CTA before the cookie has been
  // read is the same bug that used to make the nav show "Sign in" to signed-in
  // users (see the note in lib/supabase/use-session.ts).
  const { user, loading: sessionLoading } = useSession();
  const signedIn = !sessionLoading && !!user;

  return (
    <>
      <Section className="pb-10">
        <SectionHeading
          eyebrow="Pricing"
          title="Plans that scale from prototype to fleet."
          subtitle="Start free. Upgrade when your robot is more than a side project. Pay annually for two months free."
        />

        <div className="mb-10 flex justify-center">
          <div className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-1 text-sm shadow-sm">
            <button
              onClick={() => setYearly(false)}
              className={cn(
                "rounded-full px-4 py-1.5 transition font-semibold",
                !yearly ? "bg-white text-slate-900 shadow-sm border border-slate-200" : "text-slate-600 hover:text-slate-900"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setYearly(true)}
              className={cn(
                "rounded-full px-4 py-1.5 transition flex items-center gap-1.5 font-semibold",
                yearly ? "bg-white text-slate-900 shadow-sm border border-slate-200" : "text-slate-600 hover:text-slate-900"
              )}
            >
              Yearly
              <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-[10px] font-bold text-cyan-700">
                −16%
              </span>
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3 max-w-6xl mx-auto items-stretch">
          {PLANS.map((p) => (
            <PlanCard key={p.id} plan={p} yearly={yearly} signedIn={signedIn} />
          ))}
        </div>

        <p className="mt-12 text-center text-sm text-slate-500 font-medium">
          Need 50+ seats, on-prem, or air-gapped?{" "}
          <Link href="/contact#enterprise" className="text-cyan-600 font-bold underline-offset-4 hover:underline">
            Talk to our enterprise team →
          </Link>
        </p>
      </Section>

      <ComparisonTable />
      <FAQ />
      <Refund />
    </>
  );
}

function PlanCard({ plan, yearly, signedIn }: { plan: Plan; yearly: boolean; signedIn: boolean }) {
  const price = yearly ? Math.round(plan.yearly / 12) : plan.monthly;
  const { cta, href } = signedIn ? signedInCta(plan) : { cta: plan.cta, href: plan.href };
  return (
    <div
      className={cn(
        "relative rounded-3xl border p-8 transition flex flex-col h-full",
        plan.highlight
          ? "border-cyan-400 bg-white shadow-[0_8px_30px_rgb(6,182,212,0.12)] scale-[1.02]"
          : plan.premium
          ? "border-violet-300 bg-gradient-to-b from-slate-50 to-white shadow-lg"
          : "border-slate-200 bg-white shadow-sm hover:shadow-md"
      )}
    >
      {plan.highlight && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
          Most popular
        </div>
      )}
      {plan.premium && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
          Premium
        </div>
      )}

      <div className="flex items-center gap-3">
        {plan.id === "free" && <i className="fa-solid fa-sparkles text-slate-400 text-lg"></i>}
        {plan.id === "pro" && <i className="fa-solid fa-bolt text-cyan-600 text-lg"></i>}
        {plan.id === "max" && <i className="fa-solid fa-shield-halved text-violet-600 text-lg"></i>}
        <h3 className="text-2xl font-bold text-slate-900">{plan.name}</h3>
      </div>
      <p className="mt-2 text-sm text-slate-600">{plan.tagline}</p>

      <div className="mt-8 flex items-baseline gap-1">
        <span className="text-5xl font-bold tracking-tight text-slate-900">${price}</span>
        <span className="text-sm text-slate-500 font-medium">/ seat / mo</span>
      </div>
      {yearly && plan.monthly > 0 ? (
        <div className="mt-2 text-xs text-slate-400 font-medium h-4">
          billed ${plan.yearly} yearly
        </div>
      ) : (
        <div className="mt-2 h-4"></div>
      )}

      <Button
        href={href}
        size="lg"
        variant={plan.premium ? "max" : plan.highlight ? "primary" : "secondary"}
        className="mt-8 w-full"
      >
        {cta}
      </Button>

      <ul className="mt-10 space-y-4 flex-1">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-3 text-sm text-slate-700 font-medium">
            <i className="fa-solid fa-check mt-1 text-cyan-500 text-[10px] bg-cyan-50 p-1 rounded-full"></i>
            <span className="leading-tight">{f}</span>
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
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm mt-8">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200 bg-slate-50/50">
              <th className="px-6 py-5 font-bold">Feature</th>
              <th className="px-6 py-5 font-bold text-slate-700">Free</th>
              <th className="px-6 py-5 font-bold text-cyan-700">Pro</th>
              <th className="px-6 py-5 font-bold text-violet-700">Max</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {COMPARE.map((row, i) => (
              <Fragment key={i}>
                {row.group && (
                  <tr className="bg-slate-50">
                    <td colSpan={4} className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                      {row.group}
                    </td>
                  </tr>
                )}
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-slate-900 font-semibold">{row.label}</td>
                  <td className="px-6 py-4"><Cell v={row.free} /></td>
                  <td className="px-6 py-4"><Cell v={row.pro} /></td>
                  <td className="px-6 py-4"><Cell v={row.max} /></td>
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
  if (v === true) return <i className="fa-solid fa-check text-emerald-500"></i>;
  if (v === false) return <i className="fa-solid fa-minus text-slate-300"></i>;
  return <span className="text-slate-600 font-medium">{v}</span>;
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
      <div className="mx-auto grid max-w-4xl gap-4 mt-8">
        {FAQS.map((f) => (
          <details key={f.q} className="group rounded-2xl border border-slate-200 bg-white shadow-sm p-6 open:bg-slate-50 open:shadow-md transition-all cursor-pointer">
            <summary className="flex list-none items-center justify-between font-bold text-slate-900 text-lg outline-none select-none">
              {f.q}
              <span className="text-slate-400 transition-transform duration-300 group-open:rotate-45 flex items-center justify-center">
                <i className="fa-solid fa-plus"></i>
              </span>
            </summary>
            <p className="mt-4 text-base text-slate-600 leading-relaxed pr-8">{f.a}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}

function Refund() {
  return (
    <Section className="py-16 pb-32">
      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white shadow-sm p-10 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-cyan-400 to-emerald-400"></div>
        <h3 className="text-2xl font-bold text-slate-900">30-day refund policy</h3>
        <p className="mt-4 text-base leading-relaxed text-slate-600">
          If RoboAgent doesn't save you a meaningful amount of debugging time in the first 30 days, email{" "}
          <a className="text-cyan-600 font-semibold hover:underline underline-offset-2" href="mailto:billing@roboagent.ai">billing@roboagent.ai</a> for a full refund.
          No invoices, no hoops. Yearly plans are pro-rated to the day.
        </p>
      </div>
    </Section>
  );
}
