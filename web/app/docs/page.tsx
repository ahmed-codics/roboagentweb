import Link from "next/link";

import { CodeBlock } from "@/components/CodeBlock";

export default function DocsHome() {
  return (
    <div>
      <h1 className="text-4xl font-bold tracking-tight text-slate-900">Welcome to RoboAgent</h1>
      <p className="mt-4 text-lg text-slate-600 leading-relaxed max-w-3xl">
        RoboAgent is the AI-native development environment for robots. These docs walk you from
        installation to your first sim-validated patch on a real robot.
      </p>

      <div id="overview" className="mt-12 grid gap-5 md:grid-cols-2">
        <Tile icon={<i className="fa-solid fa-rocket"></i>} title="Quickstart" href="/docs/installation" body="Install RoboAgent and connect your first ROS2 workspace in under 5 minutes." />
        <Tile icon={<i className="fa-solid fa-robot"></i>} title="AI Features" href="/docs/ai/agents" body="Understand the agent loop, context engine, and tool calling primitives." />
        <Tile icon={<i className="fa-solid fa-circle-play"></i>} title="Simulation" href="/docs/sim/gazebo" body="Run Gazebo headlessly, write scenarios, and let the agent close the loop." />
        <Tile icon={<i className="fa-solid fa-microchip"></i>} title="Embedded" href="/docs/embedded/stm32" body="STM32, ESP32, Zephyr, FreeRTOS — and bridging into ROS2 via micro-ROS." />
      </div>

      <h2 id="concepts" className="mt-16 text-2xl font-bold tracking-tight text-slate-900">Core concepts</h2>
      <ul className="mt-5 space-y-3 text-slate-600">
        <li><strong className="text-slate-900 font-semibold">Robotics Knowledge Graph (RKG)</strong> — typed graph of nodes, topics, services, params, TF, URDF, hardware.</li>
        <li><strong className="text-slate-900 font-semibold">Launch IR</strong> — symbolic execution of <code className="font-mono text-cyan-600 bg-cyan-50 px-1 py-0.5 rounded text-sm">.launch.py</code> resolved into a queryable IR.</li>
        <li><strong className="text-slate-900 font-semibold">Bag Index</strong> — MCAP / rosbag2 indexed in DuckDB for time-windowed, cross-topic queries.</li>
        <li><strong className="text-slate-900 font-semibold">Sim-in-the-loop</strong> — closed-loop agent that proposes, runs, observes, and iterates in sim.</li>
        <li><strong className="text-slate-900 font-semibold">Tools</strong> — typed, sandboxed actions the agent can call: <code className="font-mono text-cyan-600 bg-cyan-50 px-1 py-0.5 rounded text-sm">rkg.query</code>, <code className="font-mono text-cyan-600 bg-cyan-50 px-1 py-0.5 rounded text-sm">bag.query</code>, <code className="font-mono text-cyan-600 bg-cyan-50 px-1 py-0.5 rounded text-sm">sim.run</code>, <code className="font-mono text-cyan-600 bg-cyan-50 px-1 py-0.5 rounded text-sm">code.edit</code>, <code className="font-mono text-cyan-600 bg-cyan-50 px-1 py-0.5 rounded text-sm">deploy.push</code>.</li>
      </ul>

      <h2 id="next-steps" className="mt-16 text-2xl font-bold tracking-tight text-slate-900">Your first session</h2>
      <CodeBlock
        className="mt-4"
        filename="terminal"
        code={`# 1. install
sudo apt install ./roboagent_0.4.2_amd64.deb

# 2. open your workspace
cd ~/ros2_ws && roboagent .

# 3. ask
> Why is /cmd_vel arriving 200ms late?`}
      />

      <div className="mt-12 flex items-center justify-between rounded-2xl border border-slate-200 bg-white shadow-sm p-6 hover:shadow-md transition-shadow">
        <div>
          <div className="font-bold text-slate-900 text-lg">Next: Installation</div>
          <div className="text-slate-600 mt-1">Get RoboAgent running on your machine.</div>
        </div>
        <Link href="/docs/installation" className="inline-flex items-center gap-2 text-cyan-600 font-semibold hover:text-cyan-700 bg-cyan-50 px-4 py-2 rounded-lg transition-colors">
          Continue <i className="fa-solid fa-arrow-right"></i>
        </Link>
      </div>
    </div>
  );
}

function Tile({ icon, title, href, body }: { icon: React.ReactNode; title: string; href: string; body: string }) {
  return (
    <Link href={href} className="group rounded-2xl border border-slate-200 bg-white shadow-sm p-6 transition-all hover:border-cyan-400 hover:shadow-md hover:scale-[1.01]">
      <div className="flex items-center gap-3 text-cyan-600 text-lg">{icon}<span className="font-bold text-slate-900">{title}</span></div>
      <p className="mt-3 text-slate-600 leading-relaxed">{body}</p>
      <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-cyan-600 opacity-0 transition group-hover:opacity-100">Read <i className="fa-solid fa-arrow-right text-[10px]"></i></div>
    </Link>
  );
}
