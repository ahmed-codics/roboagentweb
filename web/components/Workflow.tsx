const STEPS = [
  {
    icon: <i className="fa-solid fa-code text-lg"></i>,
    title: "Code",
    body: "AI completion that knows your URDF, your nav2 params, and your colcon graph. Cmd-K respects QoS.",
  },
  {
    icon: <i className="fa-solid fa-circle-play text-lg"></i>,
    title: "Simulate",
    body: "One command to launch a containerized Gazebo world with your scenario. Bags captured automatically.",
  },
  {
    icon: <i className="fa-solid fa-bug text-lg"></i>,
    title: "Debug",
    body: "The agent reads bag, TF, diagnostics, and your launch IR — then ranks root causes with citations.",
  },
  {
    icon: <i className="fa-solid fa-rocket text-lg"></i>,
    title: "Deploy",
    body: "Cross-compile for Jetson or Pi, push over SSH or Greengrass, watchdog auto-rollback if a safety event fires.",
  },
];

export function Workflow() {
  return (
    <div className="relative">
      <div className="absolute left-[22px] top-6 bottom-6 w-px bg-gradient-to-b from-cyan-400/0 via-cyan-400/60 to-emerald-400/60 md:hidden" />
      <ol className="grid gap-8 md:grid-cols-4">
        {STEPS.map((s, i) => (
          <li key={s.title} className="relative">
            <div className="hidden md:block absolute left-1/2 -top-px h-px w-full -translate-x-1/2 bg-gradient-to-r from-cyan-400/0 via-cyan-400/50 to-emerald-400/50" />
            <div className="flex items-start gap-4 md:flex-col md:items-stretch">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-100 bg-cyan-50 text-cyan-600 shadow-sm">
                {s.icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-400">0{i + 1}</span>
                  <h3 className="text-lg font-bold text-slate-900">{s.title}</h3>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.body}</p>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
