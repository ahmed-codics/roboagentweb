import { Card } from "./ui/Card";

const QUOTES = [
  {
    quote:
      "RoboAgent reads my bags faster than I do. It found a QoS mismatch in 4 seconds that I'd been hunting for two days.",
    name: "Maya Okafor",
    role: "Sr. Autonomy Engineer",
    company: "Vertical Logistics AMRs",
  },
  {
    quote:
      "We replaced three internal Python scripts and a Streamlit dashboard with the bag analyzer. CI now fails when our TF tree drifts.",
    name: "Kentaro Hashimoto",
    role: "Robotics Platform Lead",
    company: "Hibiki Robotics",
  },
  {
    quote:
      "The micro-ROS bridge reasoning is unreal. It told me my STM32 was publishing as best-effort while Nav2 wanted reliable. Two-minute fix.",
    name: "Lara Belova",
    role: "Embedded Systems Engineer",
    company: "Karelia Drones",
  },
  {
    quote:
      "Sim-in-the-loop is the killer feature. The agent fixes the param, runs Gazebo headless, and only commits if my scenario passes. Real engineering rigor.",
    name: "Devraj Menon",
    role: "Head of Robotics",
    company: "Sentry Industrial",
  },
  {
    quote:
      "I used to keep the Nav2 docs open in a side monitor. Now I just ask. The launch IR explanation alone is worth the subscription.",
    name: "Hannah Lindberg",
    role: "Research Engineer",
    company: "ETH Robotics Lab",
  },
  {
    quote:
      "Our junior engineers are productive in week one instead of month three. RoboAgent flattened the bringup learning curve.",
    name: "Tomás Aguirre",
    role: "VP Engineering",
    company: "Carga Autónoma",
  },
];

export function Testimonials() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {QUOTES.map((q) => (
        <Card key={q.name} className="p-6">
          <p className="text-sm leading-relaxed text-ink">{q.quote}</p>
          <div className="mt-5 flex items-center gap-3 border-t border-white/5 pt-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cyan-glow/30 to-accent-violet/30 text-xs font-semibold text-ink ring-1 ring-white/10">
              {q.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div className="text-xs">
              <div className="text-ink">{q.name}</div>
              <div className="text-ink-dim">{q.role} · {q.company}</div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
