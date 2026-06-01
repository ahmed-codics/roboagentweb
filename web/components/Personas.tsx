import { Atom, Bot, Cog, FlaskConical, Rocket, Wrench } from "lucide-react";

const PERSONAS = [
  { icon: <Bot />, title: "Robotics Engineers", body: "Mobile robots, manipulators, drones, quadrupeds. From bringup to fleet." },
  { icon: <Cog />, title: "ROS Developers", body: "Humble, Jazzy, Rolling. Native introspection and launch IR — no plugins required." },
  { icon: <Wrench />, title: "Embedded Engineers", body: "STM32, ESP32, Zephyr, FreeRTOS — with cross-domain reasoning into ROS2 via micro-ROS." },
  { icon: <Atom />, title: "Autonomous Systems Teams", body: "Nav2 tuning, SLAM debugging, sensor-fusion analysis with sim-validated patches." },
  { icon: <Rocket />, title: "Robotics Startups", body: "Ship faster. Replace tribal knowledge with a knowledge graph that travels with the codebase." },
  { icon: <FlaskConical />, title: "Research Labs", body: "Reproducible experiments, declarative scenarios, papers that build cleanly twelve months later." },
];

export function Personas() {
  return (
    <div className="grid grid-cols-2 gap-x-10 gap-y-8 md:grid-cols-3">
      {PERSONAS.map((p) => (
        <div key={p.title} className="group">
          <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.04] text-cyan-glow ring-1 ring-white/10 transition group-hover:bg-cyan-glow/10 group-hover:ring-cyan-glow/30">
            {p.icon}
          </div>
          <div className="font-medium text-ink">{p.title}</div>
          <div className="mt-1 text-sm text-ink-muted">{p.body}</div>
        </div>
      ))}
    </div>
  );
}
