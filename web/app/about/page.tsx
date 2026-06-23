import { Section, SectionHeading } from "@/components/ui/Section";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";


const VALUES = [
  { icon: <i className="fa-solid fa-hammer text-xl"></i>, title: "Engineering-first", body: "Demos don't ship robots. We build infrastructure-grade tools — Rust core, deterministic parsers, audited agent loops." },
  { icon: <i className="fa-solid fa-compass text-xl"></i>, title: "Robotics is a systems problem", body: "We refuse to flatten ROS2 into a folder of files. We model launch graphs, TF trees, QoS, and bags as first-class objects." },
  { icon: <i className="fa-solid fa-bolt text-xl"></i>, title: "Speed with rigor", body: "Closed-loop agents only ship a fix after it passes simulation. Velocity without verification is a recipe for crashed robots." },
  { icon: <i className="fa-solid fa-flask text-xl"></i>, title: "Open formats", body: "Our launch IR, RKG schema, and bag query language will be open. The intelligence is the moat — not the file format." },
  { icon: <i className="fa-solid fa-users text-xl"></i>, title: "ROS community first", body: "We sponsor ROScon, contribute upstream, and pay maintainers. Robotics is too small for tooling silos." },
  { icon: <i className="fa-solid fa-globe text-xl"></i>, title: "Global, remote", body: "Robotics talent is everywhere. Our team spans nine timezones and three continents — by design, not by accident." },
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
            <div className="text-[11px] font-bold uppercase tracking-widest text-cyan-600">Mission</div>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl text-slate-900">
              Make every roboticist 10× more productive — without giving up control of the robot.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-slate-600">
              The robotics industry has a productivity ceiling. Bag triage, TF debugging, launch-file archaeology, and
              cross-domain firmware work consume most of an engineer's day. Generic AI editors don't help — they don't
              know what a TF tree is, much less how to fix one.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">
              We built RoboAgent because we needed it. We index your workspace into a typed knowledge graph, run
              closed-loop simulation before any change touches a real robot, and keep humans in the loop for anything
              irreversible. Robots break in physical, expensive ways. Our agent is built for that reality.
            </p>
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-widest text-cyan-600">Vision</div>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl text-slate-900">
              Every commercial robot, debugged and deployed through one system.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-slate-600">
              In five years, RoboAgent should be the default development environment for serious robotics teams — the
              way Linux is the default for servers, and Cursor became the default for web apps. Vertical depth beats
              horizontal breadth. We will be the tool that ships humanoids, drones, AMRs, surgical arms, and the
              industrial arms of 2030.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">
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
        <div className="relative mt-12 max-w-3xl pl-8 border-l-2 border-slate-200/80 space-y-8">
          <RoadmapItem when="Q2 2026" status="Now" title="Bag → Bug v2" body="Cross-bag correlation, semantic plot, autonomous regression mode for CI." />
          <RoadmapItem when="Q3 2026" status="Next" title="Embedded Phase 1" body="STM32, ESP32, Zephyr support. micro-ROS unified context." />
          <RoadmapItem when="Q4 2026" status="Next" title="Cloud sim cluster" body="GPU-pooled headless Ignition + Isaac Sim integration (premium)." />
          <RoadmapItem when="Q1 2027" status="Future" title="Fleet ops" body="Production-fleet observability, remote agents at scale, anomaly correlation." />
          <RoadmapItem when="Q2 2027" status="Future" title="MoveIt2 + manipulation" body="Inverse kinematics reasoning, motion-plan critique, Cartesian path debugging." />
        </div>
      </Section>
    </>
  );
}

function RoadmapItem({ when, status, title, body }: { when: string; status: string; title: string; body: string }) {
  const getStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case "now":
        return "bg-cyan-50 text-cyan-700 border-cyan-200";
      case "next":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  const getDotStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case "now":
        return "bg-cyan-500 ring-cyan-100";
      case "next":
        return "bg-emerald-500 ring-emerald-100";
      default:
        return "bg-slate-400 ring-slate-100";
    }
  };

  return (
    <div className="relative group">
      {/* Timeline Dot */}
      <div className={`absolute -left-[41px] top-6 h-5 w-5 rounded-full border-4 border-white shadow-md ring-4 transition-all duration-300 ${getDotStyles(status)}`} />
      
      {/* Card Content */}
      <div className="p-6 rounded-[2rem] border border-slate-200 bg-white shadow-sm hover:shadow-md hover:border-cyan-300 transition-all duration-300">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-slate-400">{when}</span>
          <span className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm transition-all duration-300 ${getStatusStyles(status)}`}>
            {status}
          </span>
        </div>
        <h3 className="mt-3 text-xl font-bold text-slate-900 group-hover:text-cyan-600 transition-colors duration-300">
          {title}
        </h3>
        <p className="mt-2 text-base text-slate-600 leading-relaxed">
          {body}
        </p>
      </div>
    </div>
  );
}
