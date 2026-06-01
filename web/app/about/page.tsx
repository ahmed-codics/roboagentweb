import { Section, SectionHeading } from "@/components/ui/Section";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Compass, Hammer, FlaskConical, Zap, Users, Globe } from "lucide-react";

const VALUES = [
  { icon: <Hammer className="h-5 w-5" />, title: "Engineering-first", body: "Demos don't ship robots. We build infrastructure-grade tools — Rust core, deterministic parsers, audited agent loops." },
  { icon: <Compass className="h-5 w-5" />, title: "Robotics is a systems problem", body: "We refuse to flatten ROS2 into a folder of files. We model launch graphs, TF trees, QoS, and bags as first-class objects." },
  { icon: <Zap className="h-5 w-5" />, title: "Speed with rigor", body: "Closed-loop agents only ship a fix after it passes simulation. Velocity without verification is a recipe for crashed robots." },
  { icon: <FlaskConical className="h-5 w-5" />, title: "Open formats", body: "Our launch IR, RKG schema, and bag query language will be open. The intelligence is the moat — not the file format." },
  { icon: <Users className="h-5 w-5" />, title: "ROS community first", body: "We sponsor ROScon, contribute upstream, and pay maintainers. Robotics is too small for tooling silos." },
  { icon: <Globe className="h-5 w-5" />, title: "Global, remote", body: "Robotics talent is everywhere. Our team spans nine timezones and three continents — by design, not by accident." },
];

export default function AboutPage() {
  return (
    <>
      <Section className="pb-10">
        <SectionHeading
          eyebrow="About"
          title="Building the operating system for AI-assisted robotics."
          subtitle="Robots are escaping the lab. The tools haven't caught up. RoboAgent is what we wished we had when we were debugging our own machines at 2 AM."
        />
      </Section>

      <Section className="py-10">
        <div className="grid items-start gap-10 lg:grid-cols-2">
          <div>
            <div className="text-xs uppercase tracking-widest text-cyan-glow">Mission</div>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              Make every roboticist 10× more productive — without giving up control of the robot.
            </h2>
            <p className="mt-5 text-ink-muted">
              The robotics industry has a productivity ceiling. Bag triage, TF debugging, launch-file archaeology, and
              cross-domain firmware work consume most of an engineer's day. Generic AI editors don't help — they don't
              know what a TF tree is, much less how to fix one.
            </p>
            <p className="mt-4 text-ink-muted">
              We built RoboAgent because we needed it. We index your workspace into a typed knowledge graph, run
              closed-loop simulation before any change touches a real robot, and keep humans in the loop for anything
              irreversible. Robots break in physical, expensive ways. Our agent is built for that reality.
            </p>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-cyan-glow">Vision</div>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              Every commercial robot, debugged and deployed through one system.
            </h2>
            <p className="mt-5 text-ink-muted">
              In five years, RoboAgent should be the default development environment for serious robotics teams — the
              way Linux is the default for servers, and Cursor became the default for web apps. Vertical depth beats
              horizontal breadth. We will be the tool that ships humanoids, drones, AMRs, surgical arms, and the
              industrial arms of 2030.
            </p>
            <p className="mt-4 text-ink-muted">
              We will not become a generic AI IDE. We will go deeper — into firmware, fleets, safety validation, and
              eventually proprietary middleware beyond ROS2. The robot is the product. We make the robot ship.
            </p>
          </div>
        </div>
      </Section>

      <Section className="py-16">
        <SectionHeading title="What we believe" subtitle="Six principles that govern how we build." />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {VALUES.map((v) => (
            <Card key={v.title}>
              <CardHeader icon={v.icon} title={v.title} />
              <CardBody>{v.body}</CardBody>
            </Card>
          ))}
        </div>
      </Section>

      <Section className="py-16">
        <SectionHeading title="Roadmap" subtitle="Where we're going. Public, evolving, never sandbagged." align="left" />
        <ol className="relative mt-4 space-y-8 border-l border-white/10 pl-6">
          <RoadmapItem when="Q2 2026" status="Now" title="Bag → Bug v2" body="Cross-bag correlation, semantic plot, autonomous regression mode for CI." />
          <RoadmapItem when="Q3 2026" status="Next" title="Embedded Phase 1" body="STM32, ESP32, Zephyr support. micro-ROS unified context." />
          <RoadmapItem when="Q4 2026" status="Next" title="Cloud sim cluster" body="GPU-pooled headless Ignition + Isaac Sim integration (premium)." />
          <RoadmapItem when="Q1 2027" status="Future" title="Fleet ops" body="Production-fleet observability, remote agents at scale, anomaly correlation." />
          <RoadmapItem when="Q2 2027" status="Future" title="MoveIt2 + manipulation" body="Inverse kinematics reasoning, motion-plan critique, Cartesian path debugging." />
        </ol>
      </Section>
    </>
  );
}

function RoadmapItem({ when, status, title, body }: { when: string; status: string; title: string; body: string }) {
  return (
    <li className="relative">
      <span className="absolute -left-[31px] top-2 h-3 w-3 rounded-full bg-cyan-glow shadow-[0_0_10px_#22e6ff]" />
      <div className="flex flex-wrap items-baseline gap-3">
        <span className="font-mono text-xs uppercase tracking-wider text-ink-dim">{when}</span>
        <span className="rounded-md border border-cyan-glow/30 bg-cyan-glow/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-cyan-glow">{status}</span>
      </div>
      <div className="mt-1 text-lg font-semibold">{title}</div>
      <div className="mt-1 text-sm text-ink-muted">{body}</div>
    </li>
  );
}
