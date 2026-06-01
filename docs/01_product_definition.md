# 1. PRODUCT DEFINITION

## 1.1 What it is

RoboAgent is a **robotics-native, AI-first development environment** that combines an IDE shell, a robotics knowledge graph, a multi-agent reasoning layer, and integrated simulation/deployment infrastructure. It is *not* a fork of VS Code with a chat panel pinned to it. It is a system that ingests an entire robotics project — ROS2 workspace, URDF, launch graph, TF tree, bag logs, firmware tree, Docker stack, Gazebo world — and exposes that as queryable, executable, AI-reasonable context.

The core thesis: **robotics development is not a code problem; it is a systems problem.** A robotics bug rarely lives in one file. It lives across `colcon` build dependencies, QoS mismatches between two nodes, a TF frame published at the wrong rate, a URDF inertia that's wrong by 10x, a `/dev/ttyUSB0` that disappeared after a reboot, and a Gazebo plugin loading order race. No general-purpose AI editor models any of that. RoboAgent does.

## 1.2 Problems solved

| Pain point | Today | With RoboAgent |
|---|---|---|
| "Why is my TF tree broken?" | Stare at `tf2_tools view_frames` PDF | Agent reads TF graph + diffs against URDF, finds missing static publisher in launch file |
| "Why is Nav2 stuck?" | Read 14 log streams manually | Agent correlates costmap/AMCL/controller logs, identifies QoS or planner config drift |
| Bag analysis | RViz + manual `ros2 topic echo` | Indexed bag with semantic queries: "show me when cmd_vel and odom diverged by >0.5 m/s" |
| Bringing up new robot | Days of cargo-culting launch files | Generate launch graph from declared topology + verify in sim before hardware |
| Embedded↔ROS bridge | Hand-written micro-ROS / serial bridge, fragile | Auto-generated, schema-validated, with QoS modeled across the boundary |
| Real-hardware debugging | SSH + tmux + flashlight | Remote agent on robot, structured telemetry back to IDE, replayable |

## 1.3 Users (target personas)

1. **Robotics startup engineer (primary)** — 50–500-person robotics company, ROS2 Humble/Jazzy, ships physical product. Pays $50–200/seat/month. ~150k globally.
2. **Robotics researcher / PhD** — willing to evangelize, low willingness to pay. Free academic tier. Drives credibility, papers, GitHub stars.
3. **Embedded firmware engineer** — STM32/ESP32, increasingly forced to interop with ROS2 via micro-ROS. Underserved by both PlatformIO and Cursor.
4. **Robotics integrator / system engineer** — non-coder-heavy, owns the URDF, launch, calibration. Highest leverage from AI; today uses notebooks and tribal knowledge.
5. **Autonomy engineer** — Nav2, MoveIt2, SLAM tuning. Spends 70% of time on parameter sweeps and bag triage.
6. **Robotics student** — paid via institutional licenses; long-term funnel.

**Non-users (initially):** Tesla/Waymo/Boston Dynamics — they don't use ROS2, they have proprietary stacks, and they will not adopt third-party tooling. Don't chase them.

## 1.4 Why existing tools fail

- **Cursor / Windsurf / Copilot**: Treat a ROS2 workspace as "a folder of C++ and Python files." They do not parse `package.xml`, do not understand `colcon` topological build order, cannot reason about a launch graph, and will happily generate a publisher with the wrong QoS profile because they pattern-match from training data without checking the subscriber.
- **VS Code ROS extension**: Static, no AI, abandoned-ish. Useful for syntax, useless for systems-level reasoning.
- **Foxglove**: Excellent visualization, zero authoring, no AI, no codegen.
- **Isaac Sim / Isaac ROS**: NVIDIA-locked, GPU-heavy, intimidating to small teams, not an editor.
- **The Construct**: Education-focused cloud sim, not a daily driver IDE.
- **JetBrains CLion + ROS plugin**: Excellent C++, weak on the systems layer, no AI agent loop.

The gap is precisely the **systems-aware AI agent layer**. Nobody owns this.

## 1.5 Differentiators

1. **Robotics Knowledge Graph (RKG)** — a typed graph of nodes, topics, services, actions, parameters, TF frames, URDF links, hardware interfaces. The AI's "world model" of the robot. Proprietary, curated, growing.
2. **Bag-as-context** — bag files are first-class indexed artifacts, not opaque blobs. Semantic queries over rosbag2.
3. **Sim-in-the-loop AI** — the agent doesn't just write code; it launches Gazebo headlessly, observes outcome, iterates. Closed-loop.
4. **Hardware-aware deployment** — agent knows the difference between Jetson Orin and a Pi 4, and picks build flags, base images, and QoS depths accordingly.
5. **Embedded↔ROS unified context** — the only IDE where firmware and ROS2 nodes live in the same context window.

## 1.6 Long-term vision (5-year)

> "Every commercial robot in the world is debugged, simulated, and deployed through RoboAgent."

Concretely: a horizontal robotics OS-like layer that sits above ROS2, owns the dev-loop, and over time accumulates a proprietary corpus of (bug → fix → telemetry) tuples that no competitor can replicate without our user base. That corpus is the moat.
