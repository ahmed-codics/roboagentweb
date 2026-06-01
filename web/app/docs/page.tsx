import Link from "next/link";
import { ArrowRight, Rocket, Bot, PlayCircle, Cpu } from "lucide-react";
import { CodeBlock } from "@/components/CodeBlock";

export default function DocsHome() {
  return (
    <div>
      <h1 className="text-4xl font-semibold tracking-tight">Welcome to RoboAgent</h1>
      <p className="mt-3 text-ink-muted">
        RoboAgent is the AI-native development environment for robots. These docs walk you from
        installation to your first sim-validated patch on a real robot.
      </p>

      <div id="overview" className="mt-10 grid gap-4 md:grid-cols-2">
        <Tile icon={<Rocket className="h-4 w-4" />} title="Quickstart" href="/docs/installation" body="Install RoboAgent and connect your first ROS2 workspace in under 5 minutes." />
        <Tile icon={<Bot className="h-4 w-4" />} title="AI Features" href="/docs/ai/agents" body="Understand the agent loop, context engine, and tool calling primitives." />
        <Tile icon={<PlayCircle className="h-4 w-4" />} title="Simulation" href="/docs/sim/gazebo" body="Run Gazebo headlessly, write scenarios, and let the agent close the loop." />
        <Tile icon={<Cpu className="h-4 w-4" />} title="Embedded" href="/docs/embedded/stm32" body="STM32, ESP32, Zephyr, FreeRTOS — and bridging into ROS2 via micro-ROS." />
      </div>

      <h2 id="concepts" className="mt-14 text-2xl font-semibold tracking-tight">Core concepts</h2>
      <ul className="mt-4 space-y-2 text-ink-muted">
        <li><strong className="text-ink">Robotics Knowledge Graph (RKG)</strong> — typed graph of nodes, topics, services, params, TF, URDF, hardware.</li>
        <li><strong className="text-ink">Launch IR</strong> — symbolic execution of <code className="font-mono">.launch.py</code> resolved into a queryable IR.</li>
        <li><strong className="text-ink">Bag Index</strong> — MCAP / rosbag2 indexed in DuckDB for time-windowed, cross-topic queries.</li>
        <li><strong className="text-ink">Sim-in-the-loop</strong> — closed-loop agent that proposes, runs, observes, and iterates in sim.</li>
        <li><strong className="text-ink">Tools</strong> — typed, sandboxed actions the agent can call: <code className="font-mono">rkg.query</code>, <code className="font-mono">bag.query</code>, <code className="font-mono">sim.run</code>, <code className="font-mono">code.edit</code>, <code className="font-mono">deploy.push</code>.</li>
      </ul>

      <h2 id="next-steps" className="mt-12 text-2xl font-semibold tracking-tight">Your first session</h2>
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

      <div className="mt-10 flex items-center justify-between rounded-xl border border-white/10 bg-bg-surface/60 p-5">
        <div>
          <div className="font-medium">Next: Installation</div>
          <div className="text-sm text-ink-muted">Get RoboAgent running on your machine.</div>
        </div>
        <Link href="/docs/installation" className="inline-flex items-center gap-1.5 text-cyan-glow">
          Continue <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

function Tile({ icon, title, href, body }: { icon: React.ReactNode; title: string; href: string; body: string }) {
  return (
    <Link href={href} className="group rounded-xl border border-white/10 bg-bg-surface/60 p-5 transition hover:border-cyan-glow/30 hover:bg-bg-elevated/60">
      <div className="flex items-center gap-2 text-cyan-glow">{icon}<span className="font-medium text-ink">{title}</span></div>
      <p className="mt-2 text-sm text-ink-muted">{body}</p>
      <div className="mt-3 flex items-center gap-1 text-xs text-cyan-glow opacity-0 transition group-hover:opacity-100">Read <ArrowRight className="h-3 w-3" /></div>
    </Link>
  );
}
