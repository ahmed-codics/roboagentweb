"use client";

import { motion } from "framer-motion";
import { Button } from "./ui/Button";
import { TerminalPreview } from "./TerminalPreview";
import { ROSGraph } from "./ROSGraph";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 -z-10 bg-grid mask-fade-b" />
      <div className="absolute left-1/2 top-1/3 -z-10 h-px w-[80%] -translate-x-1/2 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent blur-sm" />

      <div className="mx-auto max-w-7xl px-6 pt-20 pb-24 md:pt-28 md:pb-32">
        <div className="grid items-center gap-12 lg:gap-16 lg:grid-cols-2">
          <div className="max-w-2xl relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-slate-200 bg-white shadow-sm text-xs font-bold text-slate-500 uppercase tracking-wide"
            >
              <i className="fa-solid fa-sparkles text-cyan-500"></i>
              <span>Now in private beta · Ubuntu 22.04 / 24.04</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="text-balance text-4xl font-bold leading-[1.05] tracking-tight text-slate-900 md:text-6xl lg:text-[68px]"
            >
              The AI IDE built for{" "}
              <span className="text-gradient">robotics.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.12 }}
              className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600"
            >
              RoboAgent understands your{" "}
              <span className="font-semibold text-slate-800">ROS2 workspace</span>, your{" "}
              <span className="font-semibold text-slate-800">launch graph</span>, your{" "}
              <span className="font-semibold text-slate-800">TF tree</span>, and your{" "}
              <span className="font-semibold text-slate-800">bag files</span> — then debugs, simulates, and
              deploys with you. Not just your code. Your robot.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <Button href="https://github.com/Mohamedsaied8/RoboAgent/releases/download/Linux/roboagent_1.120.0-1778204270_amd64.deb" size="lg" variant="primary">
                <i className="fa-solid fa-download"></i> Download for Linux
              </Button>
              <Button href="/docs" size="lg" variant="secondary">
                <i className="fa-solid fa-book-open"></i> Read the docs
              </Button>
              <Button href="/register" size="lg" variant="ghost">
                Get started <i className="fa-solid fa-arrow-right"></i>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.35 }}
              className="mt-10 grid max-w-lg grid-cols-3 gap-6 border-t border-slate-200 pt-6"
            >
              <Stat label="ROS2 Humble · Jazzy" value="Native" />
              <Stat label="Sim-in-the-loop" value="Gazebo · Ignition" />
              <Stat label="Targets" value="Jetson · Pi · STM32" />
            </motion.div>
          </div>

          <div className="relative w-full min-w-0 mx-auto max-w-xl lg:max-w-none">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
            >
              <TerminalPreview className="shadow-panel" />
            </motion.div>
            {/* Cascades below the terminal rather than floating over it. The old
                absolute overlay covered ~35% of the panel width and clipped every
                output line mid-sentence — the terminal is the hero's whole point. */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="relative z-10 -mt-6 ml-auto hidden w-[78%] max-w-[360px] md:block"
            >
              <ROSGraph compact className="shadow-panel" />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</div>
      <div className="mt-1 font-mono text-sm font-semibold text-slate-900">{value}</div>
    </div>
  );
}
