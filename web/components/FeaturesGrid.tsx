import { Card, CardBody, CardHeader } from "./ui/Card";

const FEATURES = [
  {
    icon: <i className="fa-solid fa-boxes-stacked text-lg"></i>,
    title: "ROS2 Workspace Intelligence",
    body: "Indexes every package.xml, CMakeLists.txt, and colcon dependency. Understands your topological build order — not just your filesystem.",
  },
  {
    icon: <i className="fa-solid fa-bug text-lg"></i>,
    title: "AI Robotics Debugging",
    body: "Cross-references logs, bags, params, TF, and launch graph to find why your robot misbehaved. Not why your function returned null.",
  },
  {
    icon: <i className="fa-solid fa-circle-play text-lg"></i>,
    title: "Simulation Integration",
    body: "Headless Gazebo and Ignition orchestration. The agent proposes a fix, runs it in sim, and only suggests the diff if it passes your scenario.",
  },
  {
    icon: <i className="fa-solid fa-code-branch text-lg"></i>,
    title: "TF Tree Analysis",
    body: "Detects multi-parents, drift, low-frequency frames, and missing static publishers. Diff the URDF against the live tree.",
  },
  {
    icon: <i className="fa-solid fa-chart-line text-lg"></i>,
    title: "Bag File Analysis",
    body: "MCAP and rosbag2 indexed in DuckDB. Ask questions in English — get heuristics, plots, and the offending node opened at the right line.",
  },
  {
    icon: <i className="fa-solid fa-microchip text-lg"></i>,
    title: "Embedded Firmware Support",
    body: "STM32, ESP32, Zephyr, FreeRTOS, PlatformIO. Pin maps, peripheral codegen, RTOS analysis, and micro-ROS bridge reasoning.",
  },
  {
    icon: <i className="fa-solid fa-satellite-dish text-lg"></i>,
    title: "Gazebo Integration",
    body: "Containerized worlds, declarative scenarios, success criteria YAML. CI-friendly — your robot's tests run on every PR.",
  },
  {
    icon: <i className="fa-solid fa-network-wired text-lg"></i>,
    title: "Autonomous Debugging Agents",
    body: "Closed-loop agents propose, simulate, observe, and iterate — until your scenario passes or the budget is spent. You stay in command.",
  },
  {
    icon: <i className="fa-solid fa-project-diagram text-lg"></i>,
    title: "ROS Graph Visualization",
    body: "Live, force-directed graph with frequency and latency overlays. QoS compatibility flagged at the edge.",
  },
  {
    icon: <i className="fa-solid fa-layer-group text-lg"></i>,
    title: "Launch File Understanding",
    body: "Symbolic execution of .launch.py — every condition, include, and remap resolved into a queryable IR. The agent knows what you'll launch before you launch it.",
  },
];

export function FeaturesGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {FEATURES.map((f) => (
        <Card key={f.title}>
          <CardHeader icon={f.icon} title={f.title} />
          <CardBody>{f.body}</CardBody>
        </Card>
      ))}
    </div>
  );
}
