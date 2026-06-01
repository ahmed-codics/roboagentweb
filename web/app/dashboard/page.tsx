import {
  Activity, Bot, Boxes, Cpu, GitBranch, MessageSquare, PlayCircle, Plus, Rocket,
} from "lucide-react";
import { Section } from "@/components/ui/Section";

const PROJECTS = [
  { name: "amr_v3", subtitle: "Mobile robot · Nav2 · Humble", health: "ok", bags: 24, sims: 81 },
  { name: "drone_swarm", subtitle: "PX4 · ROS2 bridge", health: "warn", bags: 12, sims: 33 },
  { name: "arm_pickplace", subtitle: "MoveIt2 · UR5e", health: "ok", bags: 8, sims: 14 },
];

const SIMS = [
  { id: "sim-2871", scenario: "warehouse_corner", status: "passed", time: "12s ago", drift: "0.04m" },
  { id: "sim-2870", scenario: "narrow_aisle", status: "passed", time: "1m ago", drift: "0.02m" },
  { id: "sim-2869", scenario: "drift_test", status: "failed", time: "3m ago", drift: "0.21m" },
  { id: "sim-2868", scenario: "warehouse_corner", status: "passed", time: "8m ago", drift: "0.05m" },
];

const SESSIONS = [
  { title: "Why does /odom drift after 30s?", model: "Sonnet 4.6", tools: 14, time: "5m" },
  { title: "Generate launch for slam_toolbox + ekf", model: "Sonnet 4.6", tools: 7, time: "22m" },
  { title: "Fix Nav2 inflation_radius vs URDF footprint", model: "Opus 4.7", tools: 23, time: "1h" },
];

const ROBOTS = [
  { name: "amr-prod-01", target: "Jetson Orin", uptime: "12d", status: "online" },
  { name: "amr-prod-02", target: "Jetson Orin", uptime: "12d", status: "online" },
  { name: "amr-staging", target: "Jetson Nano", uptime: "3h", status: "deploying" },
  { name: "drone-test-04", target: "Pi 5", uptime: "—", status: "offline" },
];

export default function DashboardPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-cyan-glow">Workspace · maya@vertical-logistics</div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Dashboard</h1>
        </div>
        <button className="inline-flex h-10 items-center gap-2 rounded-lg bg-cyan-glow px-4 text-sm font-medium text-bg shadow-glow-sm hover:bg-cyan-neon">
          <Plus className="h-4 w-4" /> New project
        </button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <Stat icon={<Boxes className="h-4 w-4" />} label="Projects" value="3" delta="+1 this month" />
        <Stat icon={<PlayCircle className="h-4 w-4" />} label="Simulations" value="128" delta="+34 this week" />
        <Stat icon={<Bot className="h-4 w-4" />} label="AI sessions" value="412" delta="+89 this week" />
        <Stat icon={<Rocket className="h-4 w-4" />} label="Deployments" value="14" delta="2 in flight" />
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card title="Projects" icon={<Boxes className="h-4 w-4" />}>
          <ul className="divide-y divide-white/5">
            {PROJECTS.map((p) => (
              <li key={p.name} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <span className={`h-2 w-2 rounded-full ${p.health === "ok" ? "bg-accent-green" : "bg-accent-amber"}`} />
                  <div>
                    <div className="font-mono text-sm text-ink">{p.name}</div>
                    <div className="text-xs text-ink-muted">{p.subtitle}</div>
                  </div>
                </div>
                <div className="flex items-center gap-5 text-xs text-ink-muted">
                  <span>{p.bags} bags</span>
                  <span>{p.sims} sims</span>
                  <button className="text-cyan-glow hover:underline">Open →</button>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Telemetry" icon={<Activity className="h-4 w-4" />}>
          <div className="grid gap-3 text-sm">
            <Telem label="Avg /cmd_vel latency" value="38 ms" trend="down" />
            <Telem label="TF drift (24h)" value="0.04 m" trend="stable" />
            <Telem label="Sim pass rate" value="93%" trend="up" />
            <Telem label="Inference cost" value="$12.40" trend="down" />
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <Card title="Recent simulations" icon={<PlayCircle className="h-4 w-4" />}>
          <ul className="divide-y divide-white/5 text-sm">
            {SIMS.map((s) => (
              <li key={s.id} className="flex items-center justify-between py-3">
                <div>
                  <div className="font-mono text-ink">{s.id}</div>
                  <div className="text-xs text-ink-muted">{s.scenario}</div>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-ink-muted">{s.drift}</span>
                  <span className={`rounded-full px-2 py-0.5 ${s.status === "passed" ? "bg-accent-green/15 text-accent-green" : "bg-accent-rose/15 text-accent-rose"}`}>
                    {s.status}
                  </span>
                  <span className="text-ink-dim">{s.time}</span>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="AI sessions" icon={<MessageSquare className="h-4 w-4" />}>
          <ul className="divide-y divide-white/5 text-sm">
            {SESSIONS.map((s) => (
              <li key={s.title} className="flex items-center justify-between py-3">
                <div>
                  <div className="text-ink">{s.title}</div>
                  <div className="text-xs text-ink-muted">{s.model} · {s.tools} tool calls</div>
                </div>
                <span className="text-xs text-ink-dim">{s.time}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card title="Connected robots" icon={<Cpu className="h-4 w-4" />}>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {ROBOTS.map((r) => (
              <div key={r.name} className="rounded-lg border border-white/10 bg-bg-elevated/50 p-3">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${
                    r.status === "online" ? "bg-accent-green animate-pulse-soft" :
                    r.status === "deploying" ? "bg-cyan-glow animate-pulse" :
                    "bg-ink-dim"
                  }`} />
                  <span className="font-mono text-sm text-ink">{r.name}</span>
                </div>
                <div className="mt-1 flex justify-between text-xs text-ink-muted">
                  <span>{r.target}</span>
                  <span>{r.uptime}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Deployments" icon={<GitBranch className="h-4 w-4" />}>
          <div className="text-sm">
            <Deploy commit="9f3c…b71a" target="amr-prod-01..02" status="deploying" />
            <Deploy commit="b0a1…992f" target="amr-staging" status="success" />
            <Deploy commit="ec28…3a40" target="drone-test-04" status="rolled-back" />
          </div>
        </Card>
      </div>

      <div className="mt-12 rounded-xl border border-cyan-glow/20 bg-cyan-glow/[0.03] p-5 text-sm text-ink-muted">
        <span className="font-mono text-xs uppercase tracking-wider text-cyan-glow">preview</span>
        <span className="ml-3">This dashboard is a preview of the cloud control plane shipping on Max in Q3 2026.</span>
      </div>
    </div>
  );
}

function Card({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-bg-surface/60 p-5">
      <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-ink-dim">
        <span className="text-cyan-glow">{icon}</span>{title}
      </div>
      {children}
    </div>
  );
}

function Stat({ icon, label, value, delta }: { icon: React.ReactNode; label: string; value: string; delta: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-bg-surface/60 p-5">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-ink-dim">
        <span className="text-cyan-glow">{icon}</span>{label}
      </div>
      <div className="mt-3 text-3xl font-semibold tracking-tight">{value}</div>
      <div className="mt-1 text-xs text-ink-muted">{delta}</div>
    </div>
  );
}

function Telem({ label, value, trend }: { label: string; value: string; trend: "up" | "down" | "stable" }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-white/5 bg-bg-elevated/40 px-3 py-2.5">
      <div className="text-ink-muted">{label}</div>
      <div className="flex items-center gap-2">
        <span className="font-mono text-ink">{value}</span>
        <span className={`text-xs ${trend === "up" ? "text-accent-green" : trend === "down" ? "text-cyan-glow" : "text-ink-dim"}`}>
          {trend === "up" ? "▲" : trend === "down" ? "▼" : "·"}
        </span>
      </div>
    </div>
  );
}

function Deploy({ commit, target, status }: { commit: string; target: string; status: "deploying" | "success" | "rolled-back" }) {
  const color = status === "success" ? "text-accent-green" : status === "deploying" ? "text-cyan-glow" : "text-accent-rose";
  return (
    <div className="flex items-center justify-between border-t border-white/5 py-3 first:border-t-0">
      <div>
        <div className="font-mono text-xs text-ink">{commit}</div>
        <div className="text-xs text-ink-muted">{target}</div>
      </div>
      <span className={`text-xs ${color}`}>{status}</span>
    </div>
  );
}
