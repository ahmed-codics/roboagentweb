
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
    <div className="mx-auto w-full max-w-7xl px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-cyan-600">Workspace · maya@vertical-logistics</div>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">Dashboard</h1>
        </div>
        <button className="inline-flex h-11 items-center gap-2 rounded-xl bg-cyan-600 px-5 text-sm font-bold text-white shadow-md shadow-cyan-600/10 hover:shadow-lg hover:shadow-cyan-600/20 hover:bg-cyan-700 hover:-translate-y-0.5 transition-all duration-200">
          <i className="fa-solid fa-plus"></i> New project
        </button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        <Stat icon={<i className="fa-solid fa-boxes-stacked"></i>} label="Projects" value="3" delta="+1 this month" />
        <Stat icon={<i className="fa-solid fa-circle-play"></i>} label="Simulations" value="128" delta="+34 this week" />
        <Stat icon={<i className="fa-solid fa-robot"></i>} label="AI sessions" value="412" delta="+89 this week" />
        <Stat icon={<i className="fa-solid fa-rocket"></i>} label="Deployments" value="14" delta="2 in flight" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card title="Projects" icon={<i className="fa-solid fa-boxes-stacked"></i>}>
          <ul className="divide-y divide-slate-100">
            {PROJECTS.map((p) => (
              <li key={p.name} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <span className={`h-2.5 w-2.5 rounded-full ${p.health === "ok" ? "bg-emerald-500" : "bg-amber-500 animate-pulse"}`} />
                  <div>
                    <div className="font-mono text-sm font-bold text-slate-900">{p.name}</div>
                    <div className="text-xs text-slate-500">{p.subtitle}</div>
                  </div>
                </div>
                <div className="flex items-center gap-5 text-xs text-slate-500">
                  <span>{p.bags} bags</span>
                  <span>{p.sims} sims</span>
                  <button className="text-cyan-600 hover:text-cyan-700 font-bold hover:underline">Open →</button>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Telemetry" icon={<i className="fa-solid fa-chart-line"></i>}>
          <div className="grid gap-3">
            <Telem label="Avg /cmd_vel latency" value="38 ms" trend="down" />
            <Telem label="TF drift (24h)" value="0.04 m" trend="stable" />
            <Telem label="Sim pass rate" value="93%" trend="up" />
            <Telem label="Inference cost" value="$12.40" trend="down" />
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Card title="Recent simulations" icon={<i className="fa-solid fa-circle-play"></i>}>
          <ul className="divide-y divide-slate-100 text-sm">
            {SIMS.map((s) => (
              <li key={s.id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                <div>
                  <div className="font-mono font-bold text-slate-900">{s.id}</div>
                  <div className="text-xs text-slate-500">{s.scenario}</div>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-slate-600 font-mono">{s.drift}</span>
                  <span className={`rounded-full px-2.5 py-0.5 border text-[10px] font-bold uppercase tracking-wider ${
                    s.status === "passed" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-rose-50 text-rose-700 border-rose-100"
                  }`}>
                    {s.status}
                  </span>
                  <span className="text-slate-400 font-semibold">{s.time}</span>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="AI sessions" icon={<i className="fa-solid fa-message"></i>}>
          <ul className="divide-y divide-slate-100 text-sm">
            {SESSIONS.map((s) => (
              <li key={s.title} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                <div>
                  <div className="font-semibold text-slate-900">{s.title}</div>
                  <div className="text-xs text-slate-500">{s.model} · {s.tools} tool calls</div>
                </div>
                <span className="text-xs text-slate-400 font-semibold">{s.time}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card title="Connected robots" icon={<i className="fa-solid fa-microchip"></i>}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {ROBOTS.map((r) => (
              <div key={r.name} className="rounded-xl border border-slate-200 bg-slate-50 p-4 hover:border-cyan-300 transition duration-200">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${
                    r.status === "online" ? "bg-emerald-500 animate-pulse" :
                    r.status === "deploying" ? "bg-cyan-500 animate-pulse" :
                    "bg-slate-300"
                  }`} />
                  <span className="font-mono text-sm font-bold text-slate-900">{r.name}</span>
                </div>
                <div className="mt-2 flex justify-between text-xs text-slate-500 font-semibold">
                  <span>{r.target}</span>
                  <span>{r.uptime}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Deployments" icon={<i className="fa-solid fa-code-branch"></i>}>
          <div className="text-sm">
            <Deploy commit="9f3c…b71a" target="amr-prod-01..02" status="deploying" />
            <Deploy commit="b0a1…992f" target="amr-staging" status="success" />
            <Deploy commit="ec28…3a40" target="drone-test-04" status="rolled-back" />
          </div>
        </Card>
      </div>

      <div className="mt-12 rounded-2xl border border-cyan-200 bg-cyan-50/50 p-6 text-sm text-slate-600 flex items-start gap-3 shadow-sm">
        <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-100 text-cyan-800 border border-cyan-200">preview</span>
        <span className="leading-relaxed">This dashboard is a preview of the cloud control plane shipping on Max in Q3 2026.</span>
      </div>
    </div>
  );
}

function Card({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:border-cyan-200">
      <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
        <span className="text-cyan-600">{icon}</span>{title}
      </div>
      {children}
    </div>
  );
}

function Stat({ icon, label, value, delta }: { icon: React.ReactNode; label: string; value: string; delta: string }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:border-cyan-200">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
        <span className="text-cyan-600">{icon}</span>{label}
      </div>
      <div className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">{value}</div>
      <div className="mt-1 text-xs font-semibold text-slate-400">{delta}</div>
    </div>
  );
}

function Telem({ label, value, trend }: { label: string; value: string; trend: "up" | "down" | "stable" }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
      <div className="text-sm text-slate-600">{label}</div>
      <div className="flex items-center gap-2">
        <span className="font-mono font-semibold text-slate-900">{value}</span>
        <span className={`text-xs font-bold ${trend === "up" ? "text-emerald-600" : trend === "down" ? "text-cyan-600" : "text-slate-400"}`}>
          {trend === "up" ? "▲" : trend === "down" ? "▼" : "·"}
        </span>
      </div>
    </div>
  );
}

function Deploy({ commit, target, status }: { commit: string; target: string; status: "deploying" | "success" | "rolled-back" }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-emerald-600 bg-emerald-50 border-emerald-100";
      case "deploying":
        return "text-cyan-600 bg-cyan-50 border-cyan-100";
      default:
        return "text-rose-600 bg-rose-50 border-rose-100";
    }
  };
  return (
    <div className="flex items-center justify-between border-t border-slate-100 py-3.5 first:border-t-0">
      <div>
        <div className="font-mono text-xs font-bold text-slate-900">{commit}</div>
        <div className="text-xs text-slate-600">{target}</div>
      </div>
      <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getStatusColor(status)}`}>
        {status}
      </span>
    </div>
  );
}
