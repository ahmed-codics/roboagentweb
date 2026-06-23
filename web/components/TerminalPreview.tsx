"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

type Line = { kind: "user" | "agent" | "tool" | "diff" | "status"; text: string };

const SCRIPT: Line[] = [
  { kind: "user", text: "Why does the robot drift to the left after 30s?" },
  { kind: "status", text: "Indexing workspace · 184 packages · launch IR" },
  { kind: "tool", text: "→ bag.query(/odom, /imu/data, /tf, last 60s)" },
  { kind: "tool", text: "→ rkg.query(robot_localization config)" },
  { kind: "agent", text: "Found it. ekf_node fuses /imu but the IMU yaw bias drifts" },
  { kind: "agent", text: "0.012 rad/s — robot_localization isn't subscribing with" },
  { kind: "agent", text: "use_imu_yaw=true in nav2_params.yaml." },
  { kind: "diff", text: "+ use_imu_yaw: true" },
  { kind: "diff", text: "+ imu0_remove_gravitational_acceleration: true" },
  { kind: "tool", text: "→ sim.run(scenario: drift_test, headless)" },
  { kind: "status", text: "✓ Sim passed · drift 0.04m / 60s · TF stable" },
  { kind: "agent", text: "Patch validated in Gazebo. Apply?" },
];

export function TerminalPreview({ className }: { className?: string }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setStep((s) => (s + 1) % (SCRIPT.length + 4));
    }, 1100);
    return () => clearInterval(id);
  }, []);

  const visible = SCRIPT.slice(0, Math.min(step, SCRIPT.length));

  return (
    <div className={cn("relative rounded-2xl overflow-hidden bg-[#0a1424] glass shadow-ring", className)}>
      {/* Title bar */}
      <div className="flex items-center justify-between bg-[#0a1424] border-b border-white/5 px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
        </div>
        <div className="text-[11px] font-mono text-ink-dim">
          roboagent · ros2_ws/amr_v3 · ros2 humble
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono text-cyan-glow/80">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-glow shadow-[0_0_6px_#22e6ff] animate-pulse-soft" />
          agent · sonnet 4.6
        </div>
      </div>

      {/* Body */}
      <div className="font-mono text-[13px] leading-relaxed p-5 min-h-[320px] bg-gradient-to-b from-[#08111c] to-[#070a14]">
        <div className="text-ink-dim">$ roboagent debug --bag last --workspace amr_v3</div>
        <div className="mt-2 space-y-1.5">
          {visible.map((line, i) => (
            <Row key={i} line={line} last={i === visible.length - 1 && step <= SCRIPT.length} />
          ))}
        </div>
      </div>

      {/* Glow lines */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-glow/50 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent-violet/40 to-transparent" />
      </div>
    </div>
  );
}

function Row({ line, last }: { line: Line; last: boolean }) {
  const cls = {
    user: "text-ink",
    agent: "text-cyan-glow/90",
    tool: "text-accent-violet/90",
    diff: "text-accent-green",
    status: "text-ink-muted",
  }[line.kind];
  const prefix = {
    user: ">",
    agent: "◆",
    tool: " ",
    diff: " ",
    status: "·",
  }[line.kind];
  return (
    <div className={cn("flex gap-2 animate-fade-up", cls)}>
      <span className="select-none text-ink-dim w-3">{prefix}</span>
      <span className={cn("whitespace-pre-wrap", last && line.kind === "agent" && "terminal-cursor")}>
        {line.text}
      </span>
    </div>
  );
}
