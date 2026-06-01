import { Code2, PlayCircle, Bug, Rocket } from "lucide-react";

const STEPS = [
  {
    icon: <Code2 className="h-5 w-5" />,
    title: "Code",
    body: "AI completion that knows your URDF, your nav2 params, and your colcon graph. Cmd-K respects QoS.",
  },
  {
    icon: <PlayCircle className="h-5 w-5" />,
    title: "Simulate",
    body: "One command to launch a containerized Gazebo world with your scenario. Bags captured automatically.",
  },
  {
    icon: <Bug className="h-5 w-5" />,
    title: "Debug",
    body: "The agent reads bag, TF, diagnostics, and your launch IR — then ranks root causes with citations.",
  },
  {
    icon: <Rocket className="h-5 w-5" />,
    title: "Deploy",
    body: "Cross-compile for Jetson or Pi, push over SSH or Greengrass, watchdog auto-rollback if a safety event fires.",
  },
];

export function Workflow() {
  return (
    <div className="relative">
      <div className="absolute left-[22px] top-6 bottom-6 w-px bg-gradient-to-b from-cyan-glow/0 via-cyan-glow/40 to-accent-violet/40 md:hidden" />
      <ol className="grid gap-8 md:grid-cols-4">
        {STEPS.map((s, i) => (
          <li key={s.title} className="relative">
            <div className="hidden md:block absolute left-1/2 -top-px h-px w-full -translate-x-1/2 bg-gradient-to-r from-cyan-glow/0 via-cyan-glow/30 to-accent-violet/30" />
            <div className="flex items-start gap-4 md:flex-col md:items-stretch">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-glow/20 bg-cyan-glow/[0.06] text-cyan-glow shadow-glow-sm">
                {s.icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-ink-dim">0{i + 1}</span>
                  <h3 className="text-lg font-semibold">{s.title}</h3>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{s.body}</p>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
