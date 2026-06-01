import { Building2, Handshake, FlaskConical, Mail, MessageCircle } from "lucide-react";
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
            cta="Send"
          />
          <div className="space-y-4">
            <Card>
              <CardHeader icon={<Mail className="h-5 w-5" />} title="Email" subtitle="hello@roboagent.ai" />
              <CardBody>For anything that doesn't fit a form. Expect a reply within one business day.</CardBody>
            </Card>
            <Card>
              <CardHeader icon={<MessageCircle className="h-5 w-5" />} title="Discord" subtitle="discord.gg/roboagent" />
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
            icon={<Building2 className="h-5 w-5" />}
            fields={["name", "email", "company", "team_size", "use_case"]}
            cta="Request a call"
          />
          <ContactForm
            id="partnerships"
            title="Partnership"
            subtitle="Hardware vendors, simulator makers, robotics OEMs, and sensor manufacturers."
            icon={<Handshake className="h-5 w-5" />}
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
          icon={<FlaskConical className="h-5 w-5" />}
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
  return (
    <form
      id={id}
      action="#"
      className="rounded-2xl border border-white/10 bg-bg-surface/60 p-7"
    >
      <div className="flex items-start gap-3">
        {icon && (
          <div className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-cyan-glow/10 text-cyan-glow ring-1 ring-cyan-glow/20">
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4">
        {fields.map((f) => (
          <div key={f} className="grid gap-1.5">
            <label className="text-xs font-medium uppercase tracking-wider text-ink-dim" htmlFor={`${id}-${f}`}>
              {LABELS[f] ?? f}
            </label>
            {f === "message" || f === "use_case" || f === "research_focus" ? (
              <textarea
                id={`${id}-${f}`}
                rows={4}
                className="w-full rounded-lg border border-white/10 bg-bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-dim focus:border-cyan-glow/50 focus:outline-none focus:ring-2 focus:ring-cyan-glow/20"
                placeholder="…"
              />
            ) : (
              <input
                id={`${id}-${f}`}
                type={f === "email" ? "email" : "text"}
                className="h-10 w-full rounded-lg border border-white/10 bg-bg-surface px-3 text-sm text-ink placeholder:text-ink-dim focus:border-cyan-glow/50 focus:outline-none focus:ring-2 focus:ring-cyan-glow/20"
                placeholder="…"
              />
            )}
          </div>
        ))}
      </div>

      <button
        type="submit"
        className="mt-6 inline-flex h-10 items-center gap-2 rounded-lg bg-cyan-glow px-4 text-sm font-medium text-bg shadow-glow-sm hover:bg-cyan-neon"
      >
        {cta}
      </button>
    </form>
  );
}
