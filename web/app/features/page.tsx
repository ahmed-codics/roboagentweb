
import { Section, SectionHeading } from "@/components/ui/Section";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { CodeBlock } from "@/components/CodeBlock";
import { ROSGraph } from "@/components/ROSGraph";

const SECTIONS = [
  {
    icon: <i className="fa-solid fa-brain text-xl"></i>,
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
    icon: <i className="fa-solid fa-network-wired text-xl"></i>,
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
    icon: <i className="fa-solid fa-bug text-xl"></i>,
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
    icon: <i className="fa-solid fa-circle-play text-xl"></i>,
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
    icon: <i className="fa-solid fa-microchip text-xl"></i>,
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
    icon: <i className="fa-solid fa-robot text-xl"></i>,
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
    icon: <i className="fa-solid fa-chart-line text-xl"></i>,
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
    icon: <i className="fa-solid fa-rocket text-xl"></i>,
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
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-cyan-600 shadow-sm font-semibold">
                {s.icon}
                <span className="text-slate-700">{s.eyebrow}</span>
              </div>
              <h2 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">{s.title}</h2>
              <p className="mt-5 text-lg leading-relaxed text-slate-600">{s.body}</p>
              <ul className="mt-8 grid gap-3">
                {s.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-3 text-slate-700 font-medium">
                    <span className="mt-2 h-2 w-2 flex-none rounded-full bg-gradient-to-br from-cyan-400 to-emerald-400 shadow-sm" />
                    <span className="leading-relaxed">{h}</span>
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
  let content = null;

  if (label === "Embedded Systems Support") {
    content = (
      <div className="flex flex-col items-center gap-6 w-full max-w-xs relative z-10">
        <div className="flex items-center gap-6">
          <div className="h-16 w-16 rounded-2xl bg-white shadow-xl border border-slate-100 flex items-center justify-center text-cyan-600">
            <i className="fa-solid fa-microchip text-3xl"></i>
          </div>
          <div className="h-1 w-20 bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full flex items-center justify-center">
            <i className="fa-solid fa-arrow-right-arrow-left text-white text-[10px] bg-emerald-500 rounded-full p-1 shadow-sm"></i>
          </div>
          <div className="h-16 w-16 rounded-2xl bg-slate-900 shadow-xl flex items-center justify-center text-white font-mono text-sm font-bold border border-slate-800">
            ROS2
          </div>
        </div>
        <div className="flex gap-2">
          <div className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 shadow-sm font-mono font-semibold">STM32</div>
          <div className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 shadow-sm font-mono font-semibold">Zephyr</div>
          <div className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 shadow-sm font-mono font-semibold">FreeRTOS</div>
        </div>
      </div>
    );
  } else if (label === "Autonomous Robotics Agents") {
    content = (
      <div className="flex flex-col items-center gap-3 w-full max-w-[280px] relative z-10">
        {["Plan", "Tool Call", "Observe", "Reflect"].map((step, i) => (
          <div key={step} className="w-full flex flex-col items-center">
            <div className="w-full bg-white border border-slate-200 shadow-md rounded-xl p-3 flex items-center gap-4">
              <div className="h-7 w-7 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center text-xs font-bold border border-cyan-200">{i + 1}</div>
              <span className="font-bold text-slate-800 text-sm tracking-tight">{step}</span>
              {i === 1 && <i className="fa-solid fa-terminal ml-auto text-slate-400 mr-2"></i>}
              {i === 2 && <i className="fa-solid fa-eye ml-auto text-slate-400 mr-2"></i>}
              {i === 0 && <i className="fa-solid fa-brain ml-auto text-slate-400 mr-2"></i>}
              {i === 3 && <i className="fa-solid fa-rotate-left ml-auto text-slate-400 mr-2"></i>}
            </div>
            {i !== 3 && <div className="h-4 w-0.5 bg-slate-200"></div>}
          </div>
        ))}
      </div>
    );
  } else if (label === "Real-time Observability") {
    content = (
      <div className="w-full h-full flex flex-col gap-4 p-8 relative z-10">
        <div className="flex gap-4">
          <div className="flex-1 bg-white border border-slate-200 shadow-lg rounded-2xl p-4">
             <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-3">CPU Load</div>
             <div className="h-12 w-full flex items-end gap-1">
               <div className="flex-1 h-[40%] bg-cyan-200 rounded-t-sm"></div>
               <div className="flex-1 h-[70%] bg-cyan-300 rounded-t-sm"></div>
               <div className="flex-1 h-[90%] bg-cyan-400 rounded-t-sm relative"><div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] font-bold text-cyan-600">90%</div></div>
               <div className="flex-1 h-[60%] bg-cyan-500 rounded-t-sm"></div>
               <div className="flex-1 h-[50%] bg-cyan-600 rounded-t-sm"></div>
             </div>
          </div>
          <div className="flex-1 bg-white border border-slate-200 shadow-lg rounded-2xl p-4 flex flex-col justify-center">
             <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-3">Network I/O</div>
             <div className="w-full flex flex-col gap-2.5">
               <div className="flex items-center gap-2"><div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden"><div className="h-full w-[80%] bg-emerald-400 rounded-full"></div></div><span className="text-[9px] font-mono font-bold text-slate-500">RX</span></div>
               <div className="flex items-center gap-2"><div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden"><div className="h-full w-[40%] bg-cyan-400 rounded-full"></div></div><span className="text-[9px] font-mono font-bold text-slate-500">TX</span></div>
             </div>
          </div>
        </div>
        <div className="w-full bg-white border border-slate-200 shadow-lg rounded-2xl p-4 flex-1">
          <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-3">Diagnostics Stream</div>
          <div className="space-y-2.5">
            <div className="flex items-center gap-3 text-[11px] font-mono"><span className="text-emerald-500 font-bold w-8">INFO</span><span className="text-slate-600 truncate">odom topic received at 50Hz</span></div>
            <div className="flex items-center gap-3 text-[11px] font-mono"><span className="text-amber-500 font-bold w-8">WARN</span><span className="text-slate-600 truncate">latency spike 42ms on /scan</span></div>
            <div className="flex items-center gap-3 text-[11px] font-mono"><span className="text-emerald-500 font-bold w-8">INFO</span><span className="text-slate-600 truncate">tf tree broadcast successfully</span></div>
          </div>
        </div>
      </div>
    );
  } else if (label === "Deployment Pipelines") {
    content = (
      <div className="flex flex-col items-center justify-center gap-6 w-full relative z-10 px-8">
        <div className="w-full flex items-center justify-between">
          <div className="flex flex-col items-center gap-2">
            <div className="h-12 w-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 shadow-md">
              <i className="fa-solid fa-code-commit text-lg"></i>
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Commit</span>
          </div>
          <div className="flex-1 h-px bg-slate-300 mx-4 relative"><i className="fa-solid fa-chevron-right absolute right-0 -top-2.5 text-slate-300 text-xs bg-slate-50 px-1"></i></div>
          <div className="flex flex-col items-center gap-2">
            <div className="h-12 w-12 rounded-full bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600 shadow-md relative">
              <i className="fa-solid fa-box text-lg"></i>
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-cyan-500"></span>
              </span>
            </div>
            <span className="text-[10px] font-bold text-cyan-600 uppercase tracking-widest">Build</span>
          </div>
          <div className="flex-1 h-px bg-slate-300 mx-4 relative"><i className="fa-solid fa-chevron-right absolute right-0 -top-2.5 text-slate-300 text-xs bg-slate-50 px-1"></i></div>
          <div className="flex flex-col items-center gap-2">
            <div className="h-12 w-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 shadow-md">
              <i className="fa-solid fa-robot text-lg"></i>
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Deploy</span>
          </div>
        </div>
        <div className="w-full bg-white border border-slate-200 shadow-sm rounded-lg px-4 py-3 flex items-center justify-between mt-2">
           <div className="flex items-center gap-2">
             <i className="fa-solid fa-circle-check text-emerald-500"></i>
             <span className="text-xs font-semibold text-slate-700">Target: Jetson Orin</span>
           </div>
           <span className="text-[10px] font-mono text-slate-400">v1.4.2</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-inner">
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {content}
      </div>
      <div className="absolute top-5 left-5 z-20">
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400 font-bold">architecture · {label}</div>
      </div>
    </div>
  );
}
