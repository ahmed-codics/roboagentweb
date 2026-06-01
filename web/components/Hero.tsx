"use client";

import { ArrowRight, Download, BookOpen, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "./ui/Button";
import { TerminalPreview } from "./TerminalPreview";
import { ROSGraph } from "./ROSGraph";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background grid + scan */}
      <div className="absolute inset-0 -z-10 bg-grid mask-fade-b" />
      <div className="absolute inset-x-0 top-0 -z-10 h-[700px] bg-radial-glow" />
      <div className="absolute left-1/2 top-1/3 -z-10 h-px w-[80%] -translate-x-1/2 bg-gradient-to-r from-transparent via-cyan-glow/40 to-transparent blur-sm" />

      <div className="mx-auto max-w-7xl px-6 pt-20 pb-24 md:pt-28 md:pb-32">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-ink-muted backdrop-blur"
            >
              <Sparkles className="h-3.5 w-3.5 text-cyan-glow" />
              <span>Now in private beta · Ubuntu 22.04 / 24.04</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl lg:text-[68px]"
            >
              The AI IDE built for{" "}
              <span className="text-gradient">robotics.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.12 }}
              className="mt-6 max-w-xl text-lg leading-relaxed text-ink-muted"
            >
              RoboAgent understands your{" "}
              <span className="text-ink">ROS2 workspace</span>, your{" "}
              <span className="text-ink">launch graph</span>, your{" "}
              <span className="text-ink">TF tree</span>, and your{" "}
              <span className="text-ink">bag files</span> — then debugs, simulates, and
              deploys with you. Not just your code. Your robot.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <Button href="/download" size="lg" variant="primary">
                <Download className="h-4 w-4" /> Download for Linux
              </Button>
              <Button href="/docs" size="lg" variant="outline">
                <BookOpen className="h-4 w-4" /> Read the docs
              </Button>
              <Button href="/register" size="lg" variant="ghost">
                Get started <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.35 }}
              className="mt-10 grid max-w-lg grid-cols-3 gap-6 border-t border-white/5 pt-6"
            >
              <Stat label="ROS2 Humble · Jazzy" value="Native" />
              <Stat label="Sim-in-the-loop" value="Gazebo · Ignition" />
              <Stat label="Targets" value="Jetson · Pi · STM32" />
            </motion.div>
          </div>

          <div className="relative">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
            >
              <TerminalPreview />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="absolute -bottom-12 -right-4 hidden w-[340px] md:block"
            >
              <ROSGraph />
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
      <div className="text-xs uppercase tracking-wider text-ink-dim">{label}</div>
      <div className="mt-1 font-mono text-sm text-ink">{value}</div>
    </div>
  );
}
