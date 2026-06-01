import { Brain, Network, Bug, PlayCircle, Cpu, Bot, Activity, Rocket } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { CodeBlock } from "@/components/CodeBlock";
import { ROSGraph } from "@/components/ROSGraph";

const SECTIONS = [
  {
    icon: <Brain className="h-5 w-5" />,
    eyebrow: "Robotics Intelligence Engine",
    title: "A typed knowledge graph of your robot.",
    body: "RoboAgent compiles your workspace into the Robotics Knowledge Graph (RKG): a typed graph of nodes, topics, services, actions, parameters, TF frames, URDF links, and hardware interfaces. The agent doesn't grep. It walks the graph.",
    highlights: [
      "Symbolic launch IR with conditions kept symbolic",
      "QoS compatibility resolved publisher-to-subscriber",
      "URDF inertia + joint validation",
      "colcon topological build order with stale-build detection",
    ],
    code: `# ask the graph, not the filesystem
rkg.query("which node publishes /odom and at what QoS?")
→ ekf_localization_node @ Reliable, KEEP_LAST 10, deadline 50ms`,
  },
  {
    icon: <Network className="h-5 w-5" />,
    eyebrow: "ROS Graph Understanding",
    title: "Live, reasoned graph — not a screenshot.",
    body: "Every node, topic, service, and action — with frequency, latency, and QoS overlays. Hover an edge to see DDS RxO compatibility flagged before runtime bites.",
    highlights: [
      "Force-directed live graph",
      "Frequency / latency / drop overlays",
      "QoS compatibility matrix at the edge",
      "Bag and live system both supported",
    ],
  },
  {
    icon: <Bug className="h-5 w-5" />,
    eyebrow: "AI Debugging",
    title: "From bag to bug, in under a minute.",
    body: "Drop a rosbag2 or MCAP. RoboAgent indexes it in DuckDB, runs heuristics across topics, TF, diagnostics, and rosout — then ranks root causes with citations and one-click jumps to the offending file.",
    highlights: [
      "TF discontinuity & drift detection",
      "Sensor timing and clock drift analysis",
      "Late-joining subscriber on volatile durability",
      "Cross-correlation /cmd_vel ↔ /odom and others",
    ],
    code: `# bag → bug
$ roboagent debug --bag ./bag_2026_05_08
✓ indexed 4.7M messages · 84 topics · 19 nodes
► /tf discontinuity 0.18m at t=22.4s (base_link → odom)
► /imu/data publishing at 38Hz, declared 100Hz (deadline missed)
► nav2_params.inflation_radius (0.35) < footprint diag (0.42)
suggest: open nav2_params.yaml:48`,
  },
  {
    icon: <PlayCircle className="h-5 w-5" />,
    eyebrow: "Simulation Automation",
    title: "Sim-in-the-loop. Closed loop. Headless.",
    body: "The agent doesn't ship a fix until it passes your scenario in Gazebo or Ignition. Containerized worlds, declarative scenarios, success criteria as YAML.",
    highlights: [
      "Headless Gazebo / Ignition orchestration",
      "Declarative scenarios + success criteria",
      "Automatic bag capture per run",
      "CI mode: scenarios run on every PR",
    ],
    code: `# scenario.yml
robot: amr_v3
world: warehouse
goal: reach (12.0, 4.5) within 60s
metrics:
  - max_velocity < 1.5 m/s
  - tf_drift < 0.05 m
  - no costmap inflation breaches`,
  },
  {
    icon: <Cpu className="h-5 w-5" />,
    eyebrow: "Embedded Systems Support",
    title: "Firmware and ROS2 in one context window.",
    body: "STM32, ESP32, Zephyr, FreeRTOS, PlatformIO. Pin maps, peripheral codegen, RTOS analysis — and most importantly, cross-domain reasoning across the micro-ROS bridge.",
    highlights: [
      "STM32CubeMX (.ioc) and Zephyr (Kconfig) parsed",
      "RTOS stack high-water-mark and priority inversion",
      "Saleae / Sigrok bus capture annotation",
      "micro-ROS QoS reasoning across firmware ↔ ROS2",
    ],
  },
  {
    icon: <Bot className="h-5 w-5" />,
    eyebrow: "Autonomous Robotics Agents",
    title: "Agents that propose, simulate, observe, iterate.",
    body: "Bounded autonomy. The agent runs a closed loop: propose a fix, run it in sim, observe telemetry, refine. Hard caps on tool calls, token budget, and human approval gates for irreversible actions.",
    highlights: [
      "Plan → tool call → observe → reflect state machine",
      "Hard human-confirmation gate for deploy.*",
      "Static safety scan for bypass / disable patterns",
      "Audit log of every tool call, model, and prompt hash",
    ],
  },
  {
    icon: <Activity className="h-5 w-5" />,
    eyebrow: "Real-time Observability",
    title: "Telemetry that explains itself.",
    body: "Diagnostics, rosout, and your own metrics piped into a parsed, queryable stream. Anomalies are highlighted; the agent is one click away from explaining them.",
    highlights: [
      "/diagnostics tree with severity filters",
      "rosout structured & semantic",
      "Custom metrics via Prometheus / OpenTelemetry",
      "Replayable bag-attached telemetry windows",
    ],
  },
  {
    icon: <Rocket className="h-5 w-5" />,
    eyebrow: "Deployment Pipelines",
    title: "From commit to robot, with a watchdog.",
    body: "Cross-compile for Jetson Orin, Pi, or industrial x86. Push over SSH, Greengrass, or Foxglove bridge. A watchdog on the robot rolls back if a safety event fires.",
    highlights: [
      "Per-target build profiles (arch, flags, base image)",
      "Signed deploy tokens, mTLS to robot agent",
      "Canary one-robot first, then fleet-wide",
      "Auto-rollback on collision / e-stop",
    ],
  },
];

export default function FeaturesPage() {
  return (
    <>
      <Section className="pb-12">
        <SectionHeading
          eyebrow="Features"
          title="Engineering a robot is a systems problem."
          subtitle="RoboAgent treats it as one. Eight pillars — each built from first principles for ROS2 and the realities of physical hardware."
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {SECTIONS.map((s) => (
            <Card key={s.eyebrow}>
              <CardHeader icon={s.icon} title={s.eyebrow} subtitle={s.title} />
            </Card>
          ))}
        </div>
      </Section>

      {SECTIONS.map((s, i) => (
        <Section key={s.eyebrow} className="py-16 md:py-20">
          <div className={`grid items-center gap-10 lg:grid-cols-2 ${i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""}`}>
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-cyan-glow">
                {s.icon}
                <span className="text-ink-muted">{s.eyebrow}</span>
              </div>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">{s.title}</h2>
              <p className="mt-4 text-ink-muted">{s.body}</p>
              <ul className="mt-6 grid gap-2.5">
                {s.highlights.map((h) => (
                  <li key={h} className="flex gap-2 text-sm text-ink-muted">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-cyan-glow shadow-[0_0_8px_#22e6ff]" />
                    {h}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              {s.eyebrow === "ROS Graph Understanding" ? (
                <ROSGraph />
              ) : s.code ? (
                <CodeBlock filename={s.eyebrow.toLowerCase().replace(/\s+/g, "-")} code={s.code} />
              ) : (
                <ArchitectureMock label={s.eyebrow} />
              )}
            </div>
          </div>
        </Section>
      ))}
    </>
  );
}

function ArchitectureMock({ label }: { label: string }) {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-bg-elevated to-bg-surface">
      <div className="absolute inset-0 bg-grid opacity-30 mask-radial" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-10 text-center">
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-ink-dim">architecture · {label}</div>
        <div className="font-mono text-sm text-cyan-glow/80">[ visualization placeholder ]</div>
        <div className="grid w-full max-w-xs grid-cols-3 gap-2 pt-4">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 rounded-md border border-white/10 bg-white/[0.02]" />
          ))}
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-glow/40 to-transparent" />
    </div>
  );
}
