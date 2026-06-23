const PERSONAS = [
  { icon: <i className="fa-solid fa-robot"></i>, title: "Robotics Engineers", body: "Mobile robots, manipulators, drones, quadrupeds. From bringup to fleet." },
  { icon: <i className="fa-solid fa-gear"></i>, title: "ROS Developers", body: "Humble, Jazzy, Rolling. Native introspection and launch IR — no plugins required." },
  { icon: <i className="fa-solid fa-wrench"></i>, title: "Embedded Engineers", body: "STM32, ESP32, Zephyr, FreeRTOS — with cross-domain reasoning into ROS2 via micro-ROS." },
  { icon: <i className="fa-solid fa-atom"></i>, title: "Autonomous Systems Teams", body: "Nav2 tuning, SLAM debugging, sensor-fusion analysis with sim-validated patches." },
  { icon: <i className="fa-solid fa-rocket"></i>, title: "Robotics Startups", body: "Ship faster. Replace tribal knowledge with a knowledge graph that travels with the codebase." },
  { icon: <i className="fa-solid fa-flask"></i>, title: "Research Labs", body: "Reproducible experiments, declarative scenarios, papers that build cleanly twelve months later." },
];

export function Personas() {
  return (
    <div className="grid grid-cols-2 gap-x-10 gap-y-8 md:grid-cols-3">
      {PERSONAS.map((p) => (
        <div key={p.title} className="group">
          <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600 ring-1 ring-cyan-100 transition group-hover:bg-cyan-100">
            {p.icon}
          </div>
          <div className="font-bold text-slate-900">{p.title}</div>
          <div className="mt-1 text-sm text-slate-600">{p.body}</div>
        </div>
      ))}
    </div>
  );
}
