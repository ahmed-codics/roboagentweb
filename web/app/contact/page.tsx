"use client";

import { useState } from "react";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";

export default function ContactPage() {
  return (
    <>
      <Section className="pb-8">
        <SectionHeading
          eyebrow="Contact"
          title="Talk to us."
          subtitle="Real engineers read every message. No bots, no qualifying chatbots."
        />
      </Section>

      <Section className="pt-0">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <ContactForm
            id="general"
            title="General inquiry"
            subtitle="Product questions, bug reports, or feedback."
            fields={["name", "email", "subject", "message"]}
            cta="Send message"
          />
          <div className="space-y-4">
            <Card>
              <CardHeader icon={<i className="fa-solid fa-envelope text-xl"></i>} title="Email" subtitle="hello@roboagent.ai" />
              <CardBody>For anything that doesn't fit a form. Expect a reply within one business day.</CardBody>
            </Card>
            <Card>
              <CardHeader icon={<i className="fa-solid fa-message text-xl"></i>} title="Discord" subtitle="discord.gg/roboagent" />
              <CardBody>Community support, async robotics chat, weekly office hours with the team.</CardBody>
            </Card>
          </div>
        </div>
      </Section>

      <Section id="enterprise" className="py-12">
        <div className="grid gap-6 lg:grid-cols-2">
          <ContactForm
            id="enterprise"
            title="Enterprise inquiry"
            subtitle="Self-hosted, SSO, audit, custom fine-tunes, and dedicated support for fleet-scale teams."
            icon={<i className="fa-solid fa-building text-xl"></i>}
            fields={["name", "email", "company", "team_size", "use_case"]}
            cta="Request a call"
          />
          <ContactForm
            id="partnerships"
            title="Partnership"
            subtitle="Hardware vendors, simulator makers, robotics OEMs, and sensor manufacturers."
            icon={<i className="fa-solid fa-handshake text-xl"></i>}
            fields={["name", "email", "company", "partnership_type", "message"]}
            cta="Reach out"
          />
        </div>
      </Section>

      <Section id="research" className="py-12 pb-24">
        <ContactForm
          id="research"
          title="Research lab collaboration"
          subtitle="Free Pro for verified academic accounts. Co-authored papers, dataset access, citation in our docs."
          icon={<i className="fa-solid fa-flask text-xl"></i>}
          fields={["name", "email", "institution", "research_focus", "message"]}
          cta="Apply"
        />
      </Section>
    </>
  );
}

const LABELS: Record<string, string> = {
  name: "Your name",
  email: "Email",
  subject: "Subject",
  message: "Message",
  company: "Company",
  team_size: "Team size",
  use_case: "Use case",
  partnership_type: "Type of partnership",
  institution: "Institution",
  research_focus: "Research focus",
};

function ContactForm({
  id,
  title,
  subtitle,
  fields,
  cta,
  icon,
}: {
  id: string;
  title: string;
  subtitle: string;
  fields: string[];
  cta: string;
  icon?: React.ReactNode;
}) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1000);
  };

  if (submitted) {
    return (
      <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm flex flex-col items-center justify-center text-center h-full min-h-[350px]">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-4 ring-emerald-50/50 mb-4 animate-bounce-in">
          <i className="fa-solid fa-circle-check text-xl"></i>
        </div>
        <h4 className="text-lg font-bold text-slate-900">Message sent!</h4>
        <p className="mt-2 text-sm text-slate-500 max-w-xs leading-relaxed">
          Thank you for reaching out to us. An engineer will get back to you shortly.
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="mt-6 text-xs font-bold text-cyan-600 hover:text-cyan-700 hover:underline transition"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      id={id}
      onSubmit={handleSubmit}
      className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm hover:shadow-md transition-all duration-300"
    >
      <div className="flex items-start gap-3">
        {icon && (
          <div className="inline-flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 ring-1 ring-cyan-100">
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <p className="mt-1 text-sm text-slate-500 leading-relaxed">{subtitle}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4">
        {fields.map((f) => (
          <div key={f} className="grid gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500" htmlFor={`${id}-${f}`}>
              {LABELS[f] ?? f}
            </label>
            {f === "message" || f === "use_case" || f === "research_focus" ? (
              <textarea
                id={`${id}-${f}`}
                rows={4}
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition duration-200 focus:border-cyan-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                placeholder="Describe your project or questions..."
              />
            ) : (
              <input
                id={`${id}-${f}`}
                type={f === "email" ? "email" : "text"}
                required
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 placeholder:text-slate-400 transition duration-200 focus:border-cyan-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                placeholder={f === "email" ? "you@example.com" : "..."}
              />
            )}
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-cyan-600 px-5 text-sm font-bold text-white shadow-md shadow-cyan-600/10 hover:bg-cyan-700 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Sending...
          </span>
        ) : (
          cta
        )}
      </button>
    </form>
  );
}
