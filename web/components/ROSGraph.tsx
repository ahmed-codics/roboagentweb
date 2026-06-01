"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

type Node = { id: string; x: number; y: number; kind: "node" | "topic" | "tf"; label: string };
type Edge = { from: string; to: string };

const nodes: Node[] = [
  { id: "lidar", x: 60, y: 80, kind: "node", label: "/lidar_driver" },
  { id: "scan", x: 180, y: 60, kind: "topic", label: "/scan" },
  { id: "slam", x: 320, y: 100, kind: "node", label: "slam_toolbox" },
  { id: "map", x: 460, y: 80, kind: "topic", label: "/map" },
  { id: "imu", x: 60, y: 200, kind: "node", label: "/imu_driver" },
  { id: "imu_t", x: 200, y: 200, kind: "topic", label: "/imu/data" },
  { id: "ekf", x: 340, y: 200, kind: "node", label: "ekf_localization" },
  { id: "odom", x: 480, y: 200, kind: "topic", label: "/odom" },
  { id: "nav2", x: 360, y: 320, kind: "node", label: "controller_server" },
  { id: "cmd", x: 220, y: 360, kind: "topic", label: "/cmd_vel" },
  { id: "drive", x: 80, y: 340, kind: "node", label: "diff_drive" },
  { id: "tf", x: 520, y: 320, kind: "tf", label: "/tf" },
];

const edges: Edge[] = [
  { from: "lidar", to: "scan" },
  { from: "scan", to: "slam" },
  { from: "slam", to: "map" },
  { from: "imu", to: "imu_t" },
  { from: "imu_t", to: "ekf" },
  { from: "ekf", to: "odom" },
  { from: "odom", to: "nav2" },
  { from: "map", to: "nav2" },
  { from: "nav2", to: "cmd" },
  { from: "cmd", to: "drive" },
  { from: "ekf", to: "tf" },
  { from: "slam", to: "tf" },
];

function getNode(id: string) {
  return nodes.find((n) => n.id === id)!;
}

export function ROSGraph({ className }: { className?: string }) {
  return (
    <div className={cn("relative w-full overflow-hidden rounded-2xl glass shadow-ring", className)}>
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-2.5">
        <div className="flex items-center gap-2 text-[11px] font-mono text-ink-dim">
          <span className="h-1.5 w-1.5 rounded-full bg-accent-green animate-pulse-soft" />
          ros graph · 12 nodes · 8 topics · 4 tf frames
        </div>
        <div className="text-[11px] font-mono text-ink-dim">live</div>
      </div>
      <div className="relative bg-gradient-to-b from-[#070b14] to-[#050810] p-2">
        <div className="bg-grid-fine absolute inset-0 opacity-30 mask-radial" />
        <svg viewBox="0 0 600 420" className="relative w-full h-[280px] md:h-[360px]">
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#22e6ff" opacity="0.7" />
            </marker>
            <linearGradient id="edge" x1="0" x2="1">
              <stop offset="0%" stopColor="#22e6ff" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#7b5cff" stopOpacity="0.7" />
            </linearGradient>
          </defs>

          {edges.map((e, i) => {
            const a = getNode(e.from);
            const b = getNode(e.to);
            return (
              <g key={i}>
                <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="url(#edge)" strokeWidth={1.2} markerEnd="url(#arrow)" />
                <motion.circle
                  r={2.6}
                  fill="#22e6ff"
                  initial={false}
                  animate={{
                    cx: [a.x, b.x],
                    cy: [a.y, b.y],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2.4,
                    delay: (i * 0.18) % 2.4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </g>
            );
          })}

          {nodes.map((n) => {
            const isTopic = n.kind === "topic";
            const isTf = n.kind === "tf";
            return (
              <g key={n.id}>
                {isTopic ? (
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r={9}
                    fill="#0a1424"
                    stroke="#22e6ff"
                    strokeWidth={1.4}
                  />
                ) : isTf ? (
                  <rect
                    x={n.x - 14}
                    y={n.y - 9}
                    width={28}
                    height={18}
                    rx={3}
                    fill="#0a1424"
                    stroke="#ffb547"
                    strokeWidth={1.4}
                  />
                ) : (
                  <rect
                    x={n.x - 18}
                    y={n.y - 11}
                    width={36}
                    height={22}
                    rx={5}
                    fill="#0a1424"
                    stroke="#7b5cff"
                    strokeWidth={1.4}
                  />
                )}
                <text
                  x={n.x}
                  y={n.y + 24}
                  textAnchor="middle"
                  className="fill-ink-muted"
                  style={{ font: "10px ui-monospace,Menlo,monospace" }}
                >
                  {n.label}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="absolute bottom-3 left-3 flex gap-3 text-[10px] font-mono text-ink-dim">
          <Legend color="#7b5cff" label="node" />
          <Legend color="#22e6ff" label="topic" />
          <Legend color="#ffb547" label="tf" />
        </div>
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-sm" style={{ background: color }} />
      {label}
    </span>
  );
}
