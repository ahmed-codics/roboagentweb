import { Hero } from "@/components/Hero";
import { Section, SectionHeading } from "@/components/ui/Section";
import { FeaturesGrid } from "@/components/FeaturesGrid";
import { Workflow } from "@/components/Workflow";
import { Personas } from "@/components/Personas";
import { Testimonials } from "@/components/Testimonials";
import { CTA } from "@/components/CTA";

export default function Page() {
  return (
    <>
      <Hero />

      {/* Trusted by / logo strip */}
      <div className="border-y border-slate-200 bg-slate-50 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-6 md:flex-row md:justify-between">
          <div className="text-xs uppercase tracking-widest text-slate-500">
            Trusted by robotics teams shipping in production
          </div>
          <div className="flex flex-wrap items-center gap-x-10 gap-y-3 font-mono text-sm text-slate-500">
            <span>VERTICAL</span>
            <span>HIBIKI</span>
            <span>KARELIA</span>
            <span>SENTRY</span>
            <span>ETH ROBOTICS</span>
            <span>CARGA</span>
          </div>
        </div>
      </div>

      <Section id="features">
        <SectionHeading
          eyebrow="Capabilities"
          title="An IDE that understands the robot, not just the repo."
          subtitle="Ten capabilities that turn weeks of bringup, debugging, and bag triage into minutes — backed by a robotics knowledge graph and closed-loop simulation."
        />
        <FeaturesGrid />
      </Section>

      <Section id="workflow" className="py-20 md:py-28">
        <SectionHeading
          eyebrow="Workflow"
          title="Code · Simulate · Debug · Deploy"
          subtitle="A single loop, instrumented end-to-end. The agent never deploys a change to your robot until it passes your scenarios in sim."
        />
        <Workflow />
      </Section>

      <Section id="who" className="py-20 md:py-28">
        <SectionHeading
          eyebrow="For"
          title="Built for serious robotics teams."
          subtitle="From two-person drone startups to research labs to industrial AMR fleets. If you ship physical machines, RoboAgent is built for you."
        />
        <Personas />
      </Section>

      <Section id="testimonials" className="py-20 md:py-28">
        <SectionHeading
          eyebrow="Field reports"
          title="What teams are saying."
        />
        <Testimonials />
      </Section>

      <Section id="cta" className="py-20 md:py-28">
        <CTA />
      </Section>
    </>
  );
}
