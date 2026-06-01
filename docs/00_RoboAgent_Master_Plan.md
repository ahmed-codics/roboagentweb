# RoboAgent: The Operating System for AI-Assisted Robotics Development

*Internal architecture & strategy document — v1.0*

---

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

Concretely: a horizontal robotics OS-like layer that sits above ROS2, owns the dev-loop, and over time accumulates a proprietary corpus of (bug → fix → telemetry) tuples that no competitor can replicate without our user base. That corpus is the moat (see §14).

---

# 2. MARKET ANALYSIS

## 2.1 Markets we touch

| Market | 2026 size (est.) | Our wedge |
|---|---|---|
| AI coding assistants | ~$6B ARR collectively | Vertical specialization; we don't compete on Python autocomplete |
| Robotics software (ROS ecosystem services + tooling) | ~$1.5B and growing 25% YoY | Direct addressable |
| Embedded dev tools | ~$2B (IAR, Keil, Segger, PlatformIO) | Adjacent; entry via micro-ROS |
| Robotics simulation | ~$800M (Gazebo OSS + Isaac + commercial) | Orchestration, not authoring sims |
| **Effective SAM** | **~$2–3B** | Robotics teams that pay for tooling per seat |

## 2.2 Competitive landscape

| Player | Strength | Weakness | Threat to us |
|---|---|---|---|
| Cursor | Best-in-class general AI IDE, fast, $9B valuation | Zero robotics depth; will not vertical-specialize | Medium — could acquire a robotics startup |
| Windsurf/Codeium | Agent loops, enterprise features | Same as Cursor | Medium |
| GitHub Copilot | Distribution, Microsoft | Slow, generic | Low — they won't move for a niche |
| NVIDIA Isaac (Sim + ROS + GR00T) | GPU stack, simulation, foundation models | Closed, GPU-only, intimidating, not an IDE | **High** — strategic; partner before they compete |
| Foxglove | Visualization, bag tooling, ROS expertise, ~$30M raised | Read-only, no authoring, no AI | **High** — closest natural competitor; they could build *up* into an IDE |
| The Construct | Cloud Gazebo, education brand | Education-only positioning | Low |
| Open Robotics / Intrinsic (Alphabet) | Owns ROS2 itself, Flowstate IDE | Slow, enterprise-only, Alphabet-rate-of-execution | **High** — they could absorb the segment if they wake up |
| ROS-Industrial / PickNik | Domain expertise, services | Not productized | Low |

## 2.3 Gaps

1. **No "Cursor for robotics" exists.** Confirmed via market scan; closest analogue is Foxglove which is read-only.
2. **No platform owns the bag→insight loop.** Bag analysis is still RViz + scripts.
3. **No platform unifies firmware + ROS2 context.** micro-ROS adoption is creating this need precisely now.
4. **No closed-loop sim-driven AI.** Isaac is the closest but it's a stack, not an agent.

## 2.4 Risks & barriers to entry

- **NVIDIA could ship Isaac IDE.** Mitigation: be ROS2-native, hardware-agnostic; their GPU lock-in is our differentiator.
- **Cursor adds a "robotics mode."** Mitigation: depth (RKG, sim-in-loop) takes 2+ years to replicate. Build moat fast.
- **ROS2 itself fragments** (ROS3? proprietary stacks at humanoid companies?). Mitigation: abstract the IR layer; ROS2 is *a* backend, not the only one.
- **Cost of inference for agentic loops** could destroy unit economics. Mitigation: aggressive caching, local small models for indexing, premium tier for cloud-heavy work.

## 2.5 Defensibility (preview, expanded in §14)

- Proprietary RKG schema and curated robotics corpus
- (Anonymized) bag/telemetry corpus with user consent → fine-tunes
- Workflow lock-in: simulation orchestration + deploy = stickiness
- Marketplace network effects (sensor drivers, robot templates)

---

# 3. MVP DEFINITION

## 3.1 The MVP must answer one question

> "Can a ROS2 developer save 10+ hours/week using RoboAgent in their existing workspace?"

If yes, we have a business. If no, no architecture matters.

## 3.2 First niche

**ROS2 Humble + Jazzy developers on Ubuntu 22.04/24.04 working on mobile robots (AMRs, drones, quadrupeds) with Nav2 and/or SLAM Toolbox.** Not manipulators (MoveIt2 is its own beast — phase 2). Not humanoids (proprietary stacks). Not industrial arms (PLC interop hell).

Why mobile robots:
- Largest ROS2 user base
- Standardized stacks (Nav2 + slam_toolbox + robot_localization)
- Bag analysis is a daily ritual → killer feature surface
- Gazebo simulation is mature here

## 3.3 First killer feature: **"Bag → Bug" agent**

Drop a `rosbag2` directory into RoboAgent. Agent:
1. Indexes all topics, types, frequencies, gaps, latency distributions
2. Runs heuristics (TF discontinuities, dropped messages, QoS-incompatible publishers, stale topics)
3. Cross-references the user's workspace (which node *should* publish this?)
4. Produces a ranked diagnosis with one-click "open the offending file at line X"
5. Optionally: writes a fix and verifies it in simulation

This is the wedge. It's high-pain, high-frequency, demoable in 90 seconds, and impossible to replicate without robotics depth.

## 3.4 MVP scope (3 months, 4–6 engineers)

**In scope:**
- Electron/Tauri shell wrapping a Monaco editor (initially fork the open VS Code OSS or use code-oss-dev)
- `colcon` workspace parser + `package.xml`/`CMakeLists.txt` understanding
- ROS2 introspection on running system (`ros2 node`, `ros2 topic`, `ros2 param` wrapped in a daemon)
- `rosbag2` indexer with SQLite + Parquet storage of message metadata
- Launch file (`.launch.py`) AST parser + symbolic execution
- TF tree extractor (static + runtime)
- URDF parser + visualizer (reuse `urdf-viz` or build with three.js)
- AI chat panel with tool-calling: `read_topic`, `query_bag`, `inspect_node`, `diff_qos`, `run_in_sim`
- Single-agent loop (planner+executor) on Claude Sonnet 4.6 / Opus 4.7
- Local Gazebo Classic + Ignition Fortress orchestration via Docker
- Project context indexing with sentence-transformers locally + Qdrant
- "Bag → Bug" agent (the demo)

**Out of scope (explicit nos):**
- ❌ Embedded/STM32 (Phase 2)
- ❌ Isaac Sim (Phase 3)
- ❌ Cloud sim (Phase 3)
- ❌ Multi-user collaboration (Phase 2)
- ❌ Plugin marketplace (Phase 3)
- ❌ MoveIt2 / manipulation (Phase 2)
- ❌ Windows/macOS native (Linux-first; Mac via remote later)
- ❌ Custom LLM training (use frontier APIs initially)
- ❌ Fancy multi-agent orchestration (single agent + tools is enough)

## 3.5 MVP success criteria

- 50 paid design partners by month 6
- Net retention of paid pilot conversions >70%
- Bag→Bug demo: <60s to first useful diagnosis on a 5-min bag
- Indexing: full `ros2_ws` (~200 packages) in <90s on Ryzen 7

---

# 4. SYSTEM ARCHITECTURE

## 4.1 Architecture diagram (text)

```
┌──────────────────────────────────────────────────────────────────┐
│                      RoboAgent Desktop (Tauri/Rust)              │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────────┐ │
│  │  Editor UI   │  │  Robotics    │  │  Agent Chat / Inline    │ │
│  │  (Monaco/    │  │  Dashboards  │  │  (streaming, diffs)     │ │
│  │   CodeMirror)│  │  (TF, Nav2,  │  │                         │ │
│  └──────┬───────┘  │   bag, URDF) │  └────────────┬────────────┘ │
│         │          └──────┬───────┘               │              │
│         └────────── IPC (Cap'n Proto) ────────────┘              │
└────────────────────────┬─────────────────────────────────────────┘
                         │ gRPC over Unix socket
┌────────────────────────▼─────────────────────────────────────────┐
│              RoboAgent Local Daemon (Rust + Python)              │
│ ┌────────────┐ ┌─────────────┐ ┌──────────────┐ ┌──────────────┐ │
│ │ Workspace  │ │  Robotics   │ │   Indexer    │ │  ROS2 Bridge │ │
│ │   Watcher  │ │  Knowledge  │ │  (tree-      │ │  (rclpy +    │ │
│ │            │ │   Graph     │ │  sitter +    │ │   rclrs)     │ │
│ │            │ │  (rocksdb + │ │  embeddings) │ │              │ │
│ │            │ │  in-memory) │ │              │ │              │ │
│ └────────────┘ └─────────────┘ └──────────────┘ └──────────────┘ │
│ ┌────────────┐ ┌─────────────┐ ┌──────────────┐ ┌──────────────┐ │
│ │   Bag      │ │  URDF/TF    │ │  Launch IR   │ │ Sim Orch.    │ │
│ │  Indexer   │ │   Parser    │ │   Compiler   │ │ (Docker +    │ │
│ │ (mcap/db3) │ │             │ │              │ │  Gazebo)     │ │
│ └────────────┘ └─────────────┘ └──────────────┘ └──────────────┘ │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │      Agent Runtime (LangGraph-style state machine, Rust)     │ │
│ │   tools: rkg.query, bag.query, sim.run, code.edit, fs.*,     │ │
│ │          ros.introspect, build.colcon, deploy.push           │ │
│ └──────────────────────────────────────────────────────────────┘ │
└────────────────────────┬─────────────────────────────────────────┘
                         │ HTTPS
┌────────────────────────▼─────────────────────────────────────────┐
│                    RoboAgent Cloud (multi-tenant)                │
│ ┌─────────────┐ ┌──────────────┐ ┌─────────────┐ ┌─────────────┐ │
│ │ LLM Gateway │ │  RKG Public  │ │ Sim Cloud   │ │  Telemetry  │ │
│ │ (Anthropic, │ │   (curated   │ │ (k8s +      │ │  +          │ │
│ │  bedrock,   │ │   robot      │ │ GPU pools)  │ │  Corpus     │ │
│ │  self-host) │ │   library)   │ │             │ │  (opt-in)   │ │
│ └─────────────┘ └──────────────┘ └─────────────┘ └─────────────┘ │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │  Auth (WorkOS) | Billing (Stripe) | Org/Team | Marketplace   │ │
│ └──────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
                         │ ssh/tunneled gRPC
┌────────────────────────▼─────────────────────────────────────────┐
│                Robot-side Agent (lightweight, ARM64)             │
│   ros2 introspection · log shipping · remote tool execution      │
│   (Jetson, Pi, x86 industrial PCs)                               │
└──────────────────────────────────────────────────────────────────┘
```

## 4.2 Service breakdown

### Desktop client (Tauri)
- Rust shell, web frontend (React + xterm.js + three.js)
- Why Tauri not Electron: 30MB vs 200MB, faster, native FS perf for workspace watching, and we need tight Rust↔system integration anyway
- Editor: fork **code-oss-dev** (Monaco + extension API) for Phase 1 to inherit the LSP/extension ecosystem; eventually consider Zed-style native editor in Phase 3

### Local daemon (`roboagentd`)
- Rust core, Python plugins for ROS2 introspection (rclpy is path of least resistance)
- Single long-running process per workspace
- Owns: indexes, RKG, agent runtime, sim orchestration
- Communicates with desktop via gRPC over Unix socket

### Cloud services
- Stateless LLM gateway (rate limit, cache, route by user tier)
- RKG sync service (proprietary curated graph distributed to clients)
- Optional cloud sim (GPU instance pool for headless Gazebo/Isaac)
- Telemetry pipeline (opt-in only, anonymized)

### Robot-side agent (`roboagent-edge`)
- ~30MB ARM64/x86 binary
- Connects back to user's desktop or cloud for remote debugging
- Streams structured logs, exposes shell, reads ROS2 introspection
- This is also a paid feature (fleet tier)

## 4.3 Data flow: a typical "fix the Nav2 bug" loop

1. User: "the robot keeps hitting the wall in the corner"
2. Desktop forwards prompt to daemon → Agent Runtime
3. Agent calls `bag.list_recent` → finds last bag from 11 min ago
4. Agent calls `bag.query("/cmd_vel, /odom, /scan around event time")`
5. Agent calls `rkg.query("controllers configured for this robot")` → finds DWB params
6. Agent reads `nav2_params.yaml`, identifies `inflation_radius` mismatch with footprint in URDF
7. Agent calls `sim.run({world: warehouse, params_patch: {...}})` headlessly
8. Sim succeeds → agent proposes diff
9. User approves → daemon applies edit → optionally `colcon build` + redeploy

Each step is a tool call. Each tool is sandboxed and audited.

## 4.4 Scalability

- Indexing: incremental, file-watch driven; full reindex only on workspace open
- RKG: in-memory + RocksDB on disk; for very large workspaces (>2k packages) shard by package
- Agent runs: stateless other than session; horizontal scale on cloud is trivial
- Cloud sim: Kubernetes with NVIDIA device plugin, autoscaling node pools

---

# 5. AI SYSTEM DESIGN

## 5.1 Model strategy

| Tier | Model | Use |
|---|---|---|
| Frontier reasoning | Claude Opus 4.7 | Multi-step debugging, sim-in-loop planning, hard codegen |
| Default workhorse | Claude Sonnet 4.6 | Most chat, code edits, single-tool calls |
| Fast inline | Claude Haiku 4.5 | Tab completions, "explain this line", quick lookups |
| Local (privacy / offline) | Qwen2.5-Coder-7B / Llama-3.1-8B fine-tuned | Free tier + air-gapped enterprise |
| Embeddings | nomic-embed-text-v2 (local) + voyage-3 (cloud) | RAG, code search |
| Reranker | bge-reranker-v2 (local) | RAG quality |

Rationale: don't train a foundation model in year 1. Fine-tune small models for narrow tasks (e.g., a ROS2 launch-file repair model) once we have corpus. Frontier API for the heavy lifting until economics force otherwise.

## 5.2 Agent architecture

A single primary agent with **typed tool calls**, plus three specialist sub-agents invoked as tools (not autonomously):

```
PrimaryAgent (planner+executor, Sonnet)
├─ tool: rkg.query
├─ tool: bag.query
├─ tool: code.read / code.edit / code.search
├─ tool: ros.introspect
├─ tool: build.colcon
├─ tool: sim.run         ← invokes SimAgent
├─ tool: debug.tf_tree   ← invokes RoboticsDebugAgent
├─ tool: deploy.push
└─ tool: human.confirm   ← always required for irreversible actions

Sub-agents:
- SimAgent: owns sim orchestration loop (run → observe → diagnose → repeat)
- RoboticsDebugAgent: specialized prompts + tools for TF/QoS/timing
- EmbeddedAgent (Phase 2): owns firmware reasoning
```

**Why not autonomous multi-agent swarms:** they're a research demo. Coordination cost > value for our domain. One smart agent + good tools + crisp termination criteria beats five chattering agents.

State machine (LangGraph-style, but implemented in Rust to avoid Python in the hot path):
```
plan → tool_call → observe → reflect → (continue | finish | escalate)
```

Hard limits: max 25 tool calls per session, 4M token budget per session, hard timeout 10 min, irreversible-action gating.

## 5.3 Context engine

This is the core differentiator. It is **not** "throw the repo into RAG."

Three layers:

**Layer 1 — Symbolic context (deterministic):**
- ROS2 workspace tree (parsed `package.xml`, dependency DAG)
- Launch IR (compiled from `.launch.py` via symbolic execution — see §6)
- TF tree (static URDF + dynamic from running system or bag)
- QoS profile map (publisher → subscriber, with compatibility flags)
- URDF kinematic + dynamic model
- Build graph (colcon topo order)

**Layer 2 — Semantic context (RAG):**
- Code embeddings (chunked at function/class level, language-aware via tree-sitter)
- Documentation embeddings (REPs, API docs, user's `README.md`s)
- Bag *summary* embeddings (not raw messages — summaries like "10s of /scan, 30Hz, no gaps")

**Layer 3 — Knowledge graph (RKG):**
- Public part: curated ontology of ROS2 packages, message types, common patterns, known anti-patterns. Authored by us, versioned, distributed.
- Private part: user's project as nodes/edges (Node→publishes→Topic→subscribed_by→Node)

Retrieval policy: **structural first, semantic second.** If you ask "why is `/cmd_vel` not arriving at `diff_drive_controller`?", we walk the graph (it's a graph problem!) and only fall back to embeddings for free-form questions. This is the single biggest reason we win against Cursor: they treat everything as a string-similarity problem.

## 5.4 Long-context management

- Session summary every 50 turns, distilled into a "session memory" doc
- Per-session "scratchpad" for agent intermediate state, persisted to disk
- Context cache (Anthropic prompt caching) for the workspace summary, refreshed on workspace change
- Hard rule: never dump full bags or full URDFs into context; always hand the agent a *handle* (`bag://abc123`) and tools to query through it

## 5.5 ROS-specific reasoning capabilities

| Capability | Implementation |
|---|---|
| Launch graph reasoning | Symbolic execution of `.launch.py` → IR → reasoning tools |
| TF reasoning | Graph algorithms (reachability, cycles, frequency budget) over the TF graph |
| QoS reasoning | Compatibility matrix (Reliability × Durability × History × Deadline × Liveliness) |
| Bag reasoning | Time-series analytics + CEP (complex event processing) over indexed messages |
| Message-type reasoning | Full parse of `.msg`/`.srv`/`.action`; type-aware codegen |
| Parameter reasoning | YAML schema validation against declared `ros2_param` types |

## 5.6 Sandboxes

- Code execution: gVisor container per session, ephemeral
- Sim execution: Docker w/ host networking off, X forwarding via xpra/xvfb
- Build execution: same colcon container as user, but mounted read-only by default (writes go through approval)
- Deploy execution: **always human-confirmed**, never autonomous

---

# 6. ROBOTICS INTELLIGENCE LAYER

This is the proprietary heart. Detail per parser:

## 6.1 ROS2 workspace parser
- Walks `src/`, finds all `package.xml`
- Extracts: name, version, deps (`depend`, `build_depend`, `exec_depend`), license, maintainer
- Builds dependency DAG → colcon topo order
- Detects: missing deps (referenced but not in `package.xml`), version conflicts, circular deps
- Output: `WorkspaceModel` struct, persisted in RKG

## 6.2 Colcon parser
- Reads `colcon.meta`, `.colcon` cache
- Models: build profiles (Release/Debug), per-package CMake args, mixin usage
- Detects: stale builds, ABI mismatches across packages, build flag drift

## 6.3 Launch parser (the hardest one)
- ROS2 launch files are Python with side effects → cannot just AST-parse
- Approach: **symbolic execution** of `generate_launch_description()`
  - Replace `LaunchConfiguration`/`PathJoinSubstitution`/etc. with symbolic placeholders
  - Walk the tree, build a launch IR: `[Node(pkg, exec, params, remappings, namespace, condition), IncludeLaunchDescription(...), GroupAction(...)]`
  - Resolve nested includes recursively
- Output: complete launch graph with conditions kept symbolic
- Tools: "what nodes get launched if I pass `use_sim_time:=true`?", "what are the effective remappings for node X?"
- This is hard, but doable; we open-source the parser as a wedge for adoption

## 6.4 TF tree parser
- Static frames: extracted from URDF + `static_transform_publisher` calls in launch IR
- Dynamic frames: subscribed at runtime to `/tf` and `/tf_static`
- Build directed graph; detect: multiple parents (illegal), unreachable frames, low-frequency frames, latency/age statistics
- Visualize as interactive graph in UI

## 6.5 URDF/Xacro parser
- Use `urdfdom` Rust port or wrap `urdf_parser_py`
- Xacro: invoke `xacro` subprocess to expand, then parse
- Validate: inertia tensors physically valid (positive-semidefinite, masses positive), joint limits sane, mesh files exist
- Visualize via three.js

## 6.6 Bag analyzer
- Read MCAP and rosbag2 SQLite formats
- Build index in DuckDB: `(topic, timestamp, msg_size, msg_offset)` → fast time-windowed queries
- Compute per-topic: rate, jitter, gap distribution, message size distribution
- Cross-topic: correlation (e.g., `/cmd_vel` vs `/odom` velocity tracking)
- Heuristics library:
  - TF discontinuity > 10cm/frame
  - Topic rate drops below `Deadline` QoS
  - Late-joining subscriber on `Volatile` durability
  - Clock jumps in `/clock`
  - `/joint_states` publishing inconsistent joints

## 6.7 Nav2 analyzer
- Parses `nav2_params.yaml` against known schema (we maintain this — they don't ship one)
- Cross-references with URDF footprint, costmap layers, BT XML
- Detects: footprint > inflation_radius, planner/controller frequency mismatch, BT references undefined node

## 6.8 SLAM analyzer
- Slam Toolbox: parse map files, scan-match quality from logs, loop closures
- Cartographer: read `.lua` configs
- Detects: low loop closure rate, drift > X over N seconds, map-to-odom jumps

## 6.9 QoS analyzer
- Built from launch IR + node introspection
- Compatibility matrix per ROS 2 spec (DDS QoS RxO rules)
- Common findings: `BestEffort` publisher → `Reliable` subscriber (silent failure)

## 6.10 Sensor timing analyzer
- For each sensor topic, compute publish timestamp vs header.stamp drift
- Detect: clock drift, missing `use_sim_time`, hardware buffer issues
- Cross-correlate camera/IMU/lidar for fusion debugging (huge for VIO)

---

# 7. SIMULATION SYSTEM

## 7.1 Supported sims (phased)

| Sim | Phase | Why |
|---|---|---|
| Gazebo Classic 11 | MVP | Largest legacy install base |
| Ignition / Gazebo Sim (Garden/Harmonic) | MVP | Modern default for ROS2 |
| Webots | Phase 3 | Education, niche |
| NVIDIA Isaac Sim | Phase 3 | Premium tier; needs partnership/GPU |
| MuJoCo | Phase 3 | Manipulation/RL |

## 7.2 Orchestration

- All sims run in Docker containers we maintain (versioned base images)
- Headless by default: `ign gazebo -s -r world.sdf` with no GUI
- Optional X forwarding for visual debugging (xpra → user's browser)
- Worker pool: locally on user machine for free tier; cloud GPU pool for paid tier
- Wire the simulated `/clock` and ROS2 DDS bridge correctly so the agent's introspection tools "just work" against sim

## 7.3 The closed loop

```
agent.proposes(code_change)
  → roboagent.applies(change_in_sandbox)
  → sim.run(world, robot, scenario, success_criteria)
  → telemetry.collect(bags + logs)
  → roboagent.evaluates(success_criteria)
  → agent.observes(result)
  → loop until success or budget exhausted
```

Success criteria are declarative:
```yaml
scenario: warehouse_corner
robot: amr_v3
goal: reach (12.0, 4.5) within 60s without collision
metrics:
  - max_velocity < 1.5 m/s
  - tf_drift < 0.05 m
  - no costmap inflation breaches
```

These come from a library we curate per robot class (mobile, manipulator, drone), and users can author their own.

## 7.4 Failure detection

- Bag-based post-mortem (using §6.6 infrastructure)
- Custom Gazebo plugin that emits structured events: collision, joint limit, NaN states
- ROS2 subscriber on `/diagnostics`, `/rosout` (parsed semantically)
- Wall-clock timeout

## 7.5 Reinforcement / iteration loop

For Phase 3 (not MVP): use sim outcomes as reward signal for tuning controllers / SLAM params via Bayesian optimization or simple grid search, agent in the driver's seat. **Not** RL training in the LLM — that's a research project, not a product.

---

# 8. EMBEDDED SYSTEMS SUPPORT (Phase 2)

## 8.1 Targets

| MCU | Toolchain | RTOS |
|---|---|---|
| STM32 (F4/H7/G4) | arm-none-eabi-gcc, STM32CubeMX | FreeRTOS, ThreadX |
| ESP32 (S3/C3/C6) | ESP-IDF, Xtensa/RISC-V | FreeRTOS (ESP-IDF) |
| nRF52/nRF53 | Zephyr / nrfx | Zephyr RTOS |
| Raspberry Pi Pico | pico-sdk | bare-metal / FreeRTOS |
| Generic Cortex-M | PlatformIO | Zephyr / FreeRTOS |

## 8.2 Indexing

- Parse `.ioc` files (STM32CubeMX) → pin map, peripheral config
- Parse `Kconfig` / `prj.conf` (Zephyr) → enabled modules
- Parse `platformio.ini` → boards, frameworks
- Parse linker scripts → memory regions
- Build with clangd integration → semantic index

## 8.3 Capabilities

- **Peripheral generation**: "I need UART2 at 115200 with DMA RX" → generates HAL code matching the target's CubeMX/Zephyr conventions
- **Pin map sanity**: detect conflicting alternate functions, missing pull-ups
- **RTOS analysis**: stack high-water-mark estimates, priority inversion detection from FreeRTOS traces
- **Interrupt analysis**: estimate interrupt latency, detect ISRs that call non-ISR-safe APIs
- **Memory analysis**: parse `.map` file, flag overflows, suggest `.ld` adjustments
- **Bus debugging**: ingest `.sal` (Saleae) / Sigrok captures; AI annotates protocol-level

## 8.4 Flash + debug workflow

- Wrap OpenOCD / probe-rs / pyocd / esptool / J-Link as tools
- One-click flash + auto-attached RTT/SWO console in IDE
- Live variable watch (via OpenOCD MI or RTT)

## 8.5 micro-ROS unification

- Detect `micro_ros_agent` in workspace
- Cross-reference firmware-side topic publishers with ROS2-side subscribers in launch IR
- This is the **moat** for embedded: nobody else does cross-domain reasoning.

---

# 9. IDE / UX DESIGN

## 9.1 Layout

```
┌──────────────────────────────────────────────────────────────┐
│ ☰  Workspace: ros2_ws        [Sim:▶]  [Robot:●online]  [Σ☁]  │
├──────────┬─────────────────────────────────┬─────────────────┤
│ Files    │     Editor (Monaco)              │   Agent Chat    │
│ ROS2     │                                  │                 │
│ Pkgs     │                                  │  [streaming]    │
│ Launch   │                                  │                 │
│ URDF     │                                  │                 │
│ Bags     │                                  │                 │
│ Sims     │                                  │                 │
├──────────┴─────────────────────────────────┴─────────────────┤
│  Bottom panel: [Terminal] [Tasks] [TF Graph] [Bag] [Diag]    │
└──────────────────────────────────────────────────────────────┘
```

## 9.2 Robotics-specific panels

- **TF Graph panel**: live, force-directed graph with frequency/latency overlay
- **Bag panel**: time-scrubber, multi-topic timeline, plot-with-AI ("plot /odom.x vs /amcl_pose.x and explain divergence")
- **URDF panel**: 3D viewer, joint sliders, inertia visualization
- **ROS Graph panel**: nodes/topics/services interactive (think `rqt_graph` but useful)
- **Sim panel**: launch buttons, scenarios, video stream, telemetry overlay
- **Diagnostics panel**: parsed `/diagnostics` with severity filters
- **Robot panel**: when connected to a real robot, shows live status, deploy button

## 9.3 Inline AI integration

- Cmd-K: "edit this selection" (Cursor-style, but with robotics tools available)
- Tab: completion (Haiku, latency-optimized)
- Cmd-L: full chat
- Cmd-Shift-D: "debug this" — fires the debug agent on whatever is focused (a node, a topic, a launch file)
- "@" mentions: `@bag/2024-...`, `@node/diff_drive`, `@frame/base_link`, `@param/nav2.yaml#planner`

## 9.4 Onboarding (critical, often botched)

Three onboarding flows:
1. **"I have a workspace"** → point at `ros2_ws/`, watch indexing live, run "explain my robot" to demo value in <2 min
2. **"I have a bag"** → drop bag, run Bag→Bug demo, no workspace needed
3. **"I have nothing"** → scaffold a TurtleBot3 demo workspace + bag from our gallery, walk through

Onboarding is itself an agent — not a series of modal dialogs.

## 9.5 Workflows

- **Daily dev**: edit, AI completion, occasional chat for "why does X fail"
- **Bringup**: scaffold launch + URDF, simulate, iterate
- **Debug**: drop bag, agent diagnoses, applies fix, re-sims
- **Deploy**: agent picks build flags, builds for target arch, pushes via SSH/Foxglove bridge/Greengrass, monitors

---

# 10. TECHNOLOGY STACK

Opinionated picks. No "we'll evaluate later."

| Layer | Choice | Reason | Tradeoff |
|---|---|---|---|
| Desktop shell | **Tauri 2** + React 19 | Small binary, Rust core, great FS perf | Smaller plugin ecosystem than Electron — worth it |
| Editor core | **Monaco** (via fork of code-oss-dev) Phase 1; consider Zed (gpui) Phase 3 | Inherit LSP/extension ecosystem | Forking VS Code is heavy; mitigated by minimal patches |
| Local daemon | **Rust** (tokio, tonic) | Performance, safety, concurrency for indexing/sim orch | Rust hiring slower than Go |
| Python interop | **PyO3** | rclpy needs Python; PyO3 is the cleanest bridge | Embedded Python adds complexity; isolate to one process |
| Frontend state | Zustand + Tanstack Query | Simple, scales | — |
| 3D viz | three.js + react-three-fiber | URDF + sim viewer | WebGPU for Phase 3 |
| Code parsing | **tree-sitter** (C++/Python/CMake/YAML grammars) + **clangd** for C++ semantics | Industry standard | clangd is heavy on big workspaces; cache aggressively |
| Embeddings (local) | nomic-embed-text-v2 | Open, fast, decent quality | — |
| Vector DB (local) | **Qdrant** (embedded) | Rust, embedded mode, filterable | Could use lance; Qdrant has better filters |
| Vector DB (cloud) | Qdrant Cloud or **pgvector** in Postgres | Single source of truth | pgvector slower at scale; fine until 100M vectors |
| Graph DB | **RocksDB** + custom typed-graph layer; **Neo4j** for cloud RKG | Embedded for client; Neo4j for collaborative cloud RKG | Neo4j licensing cost; alt: KuzuDB (embedded graph) |
| Time-series (bag idx) | **DuckDB** (embedded) + Parquet | Insanely fast analytics, no server | None for our use |
| Bag formats | MCAP (preferred), rosbag2 SQLite (legacy) | MCAP is the future | — |
| LLM access | Anthropic API primary; Bedrock/Vertex for enterprise | Best frontier models | Vendor concentration risk; abstract behind gateway |
| Local LLM | llama.cpp + GGUF | Battle-tested | vLLM if we ever self-host serving |
| Sim orchestration | **Docker** + custom Python supervisor | Standard, works everywhere | Phase 3: switch to Podman or Firecracker for tenancy |
| ROS2 client | rclpy (MVP), rclrs once mature | Pragmatism | rclrs not yet production-grade |
| Cloud | **AWS** (EKS, S3, Bedrock, RDS Postgres) | Robotics customers often already there (RoboMaker shut down — opportunity) | GCP would be fine; pick one |
| Auth | WorkOS | SSO/SAML/SCIM out of the box | Build vs buy: buy |
| Billing | Stripe + Metronome (usage) | Standard | — |
| Observability | OpenTelemetry → Honeycomb | Tracing across agent tool calls is critical | — |
| Frontend deploy | Cloudflare (marketing site, doc site) | Cheap, fast | — |
| CI | GitHub Actions + self-hosted runners (for sim tests) | Standard + GPU access | — |

**Avoid:**
- LangChain in production hot path (fine for prototyping). Build the agent runtime in Rust with explicit state machines. LangChain is a tarpit at our scale.
- Over-using MCP for internal tools. MCP is great for *user-facing extensibility* (let users plug in their robot's MCP server), bad for performance-critical internal tool calls.

---

# 11. SECURITY & SAFETY

Robotics is uniquely dangerous. A hallucinated parameter can drive a 200kg robot through a wall.

## 11.1 Threat model

| Risk | Severity | Mitigation |
|---|---|---|
| Agent autonomously deploys broken code to real robot | Catastrophic | **Hard gate: human confirmation for deploy.* tools, always.** No exceptions. |
| Agent generates code that passes review but breaks safety (e.g., disables collision check) | High | Static analysis pass for known-dangerous patterns: `disable_collision_avoidance`, `bypass_*`, `e_stop = False`, etc. |
| Hallucinated QoS / parameters cause silent runtime failure | Medium | Sim-validate before any deploy; flag low-confidence outputs |
| Malicious code injection via shared launch files / templates from marketplace | High | Sandboxed execution; signed marketplace artifacts; no auto-execution of untrusted launch files |
| User's source code/bag exfiltrated via cloud LLM | Medium | Local-only mode; explicit data residency; opt-in telemetry |
| Compromised robot-side agent | High | mTLS, short-lived tokens, narrow capability tokens, signed binaries |
| Prompt injection via bag metadata or rosout messages | Medium | Strict separation of "user content" vs "system prompt" in agent context; never let model inputs change tool permissions |
| Supply-chain (rosdep / colcon dep) | High | Lockfile + SBOM; flag deps without provenance |

## 11.2 Safety validation layers (defense in depth)

```
1. Static safety scan (regex + AST)
        ↓ pass
2. Type/QoS/launch validation
        ↓ pass
3. Simulation pre-flight (mandatory before deploy)
        ↓ pass
4. Human approval (mandatory for irreversible)
        ↓
5. Deploy
        ↓
6. Watchdog on robot — auto-rollback on safety event
```

For *autonomous* mode (premium): user pre-declares safe scenarios in YAML; agent can only act within those.

## 11.3 Sandboxing

- gVisor for code exec (not Docker alone — Docker isn't a security boundary against a malicious agent payload)
- Read-only mounts by default; writes go through approval queue
- No network egress from sandboxes by default
- Deploy actions go through a separate signed-token service

## 11.4 Audit trail

Every agent action is logged with:
- Tool name, args (redacted for sensitive)
- Model + model version + prompt hash
- User identity
- Approval (if required)

Stored 90 days local, 1 year for enterprise. Required for any liability story.

## 11.5 Functional safety stance

We are **not** ISO 26262 / IEC 61508 certified, and we don't claim to be. This must be **explicit** in our terms: RoboAgent is a development tool, not a runtime safety system. For safety-critical robots (medical, automotive), users layer their own certified safety stack underneath. We can't compete on this and shouldn't pretend to.

---

# 12. MONETIZATION STRATEGY

## 12.1 Tiers

| Tier | Price | Target | Includes |
|---|---|---|---|
| Hobby | $0 | Students, OSS | Local-only, frontier model with rate limit (200 reqs/day), no cloud sim, no robot agent |
| Pro | $40/seat/mo | Indie roboticists, freelancers | Higher rate limits, all robotics tools, 1 robot agent, basic sim hours |
| Team | $80/seat/mo | Small startups (5–50) | Shared RKG, team analytics, 5 robot agents/seat, 50 cloud sim hrs/seat |
| Business | $200/seat/mo | Series A–C robotics cos. | SSO/SAML, audit logs, unlimited robot agents, 200 sim hrs, priority support |
| Enterprise | $500–2000/seat/mo + custom | Large industrials | Self-hosted option, on-prem RKG, custom models/fine-tunes, dedicated support, SLA, sim cluster sizing |

Plus **usage-metered**:
- Cloud GPU sim: $1.50–4/hr (margin ~40%)
- Frontier-model agent loops: pass-through + 25% margin above tier inclusion
- Robot fleet agents: $50/robot/mo above tier inclusion

## 12.2 Revenue model rationale

- Per-seat pricing because that's what dev tool buyers expect and budget for
- Usage on top because long-running agents and sim are real costs
- Enterprise is where the money is: 1 enterprise contract ($300k ARR) = 600 Pro seats

## 12.3 5-year revenue model (back-of-envelope)

Year 1: 50 paying teams × $5k avg ARR = $250k ARR (proof)
Year 2: 500 teams + 5 enterprise × $100k = $1.5M + $500k = $2M ARR
Year 3: 2k teams + 25 enterprise = $10M ARR
Year 4: $25M ARR (enterprise heavy)
Year 5: $50M+ ARR target; Series B at this point

These are aggressive but achievable if we hit the Bag→Bug PMF in Year 1.

## 12.4 Adjacent revenue (Phase 4)

- **Marketplace** (15–30% take): paid robot templates, sensor drivers, scenarios
- **Certification / training**: "RoboAgent Certified Engineer"
- **Managed fleet debugging**: per-robot/month for production fleets
- **Insurance partnership** (long-tail): pre-deployment validation as evidence for robotics insurers

## 12.5 What not to monetize early

- Don't monetize the basic ROS2 introspection tools — they need to be free to drive adoption
- Don't gate the launch parser — open-source it, become the standard
- Don't charge for OSS contributors

---

# 13. DEVELOPMENT ROADMAP

## 13.1 3-month roadmap (Founders + 4 engineers)

**M1**
- Tauri shell + Monaco editor working
- ROS2 daemon (rclpy bridge) introspection tools
- Workspace + package.xml indexer
- Anthropic API integration with single-agent loop
- Basic chat panel

**M2**
- Launch IR parser (symbolic execution)
- TF tree extractor
- Bag indexer (MCAP + DuckDB)
- URDF parser + 3D viewer
- Tool calling MVP (8 tools)

**M3**
- Bag → Bug agent E2E (the demo)
- Gazebo Ignition orchestration
- 10 design partners onboarded
- Pricing page + waitlist

**Hires:** Two senior Rust engineers, one robotics engineer (ROS2 deep), one full-stack/UX, one founding designer.

## 13.2 6-month roadmap

**M4–M6**
- Closed-loop sim agent (sim-in-loop)
- Nav2 + SLAM analyzers
- QoS analyzer
- Robot-side agent (basic)
- Public beta launch
- 50 paying teams

**Hires:** +2 robotics engineers, +1 SRE/DevOps, +1 frontend, +1 founding GTM/DevRel.

## 13.3 12-month roadmap

**M7–M12**
- Embedded Phase 1 (STM32, ESP32, micro-ROS unification)
- Cloud sim (GPU pool)
- Team features (shared RKG, comments, history)
- Marketplace MVP
- Enterprise SSO + audit
- Self-hosted option (single-binary on-prem)
- 500 teams + first 3 enterprise contracts
- Series A ($15–25M)

**Headcount target: 25.**

## 13.4 24-month roadmap

**Year 2**
- Isaac Sim integration (premium tier)
- MoveIt2 / manipulation support
- Foundation-level fine-tunes (ROS2-native code model, launch repair model)
- Fleet operations product (tracks, monitors, debugs production fleets)
- ROS3 / proprietary stack support layer (humanoid SDKs)
- $10M ARR
- Headcount: 60

## 13.5 Team structure (24 months)

```
CEO (founder)
├─ CTO (founder)
│  ├─ Platform Eng (8): Rust core, daemon, agent runtime
│  ├─ Robotics Eng (6): RKG, parsers, sim, embedded
│  ├─ AI Eng (4): orchestration, RAG, fine-tunes
│  ├─ Frontend (4): IDE, panels, viz
│  └─ SRE/Infra (3): cloud, sim cluster, security
├─ VP Eng (hire M9)
├─ Head of GTM (hire M6)
│  ├─ DevRel (3)
│  ├─ Sales (4, enterprise heavy)
│  └─ Customer success (3)
├─ Head of Product (hire M9)
└─ Head of Design (hire M3)
```

## 13.6 Infrastructure milestones

| Milestone | When | Cost trigger |
|---|---|---|
| AWS account, basic VPC, Bedrock access | M1 | $5k/mo |
| Cloud sim cluster v1 (10 GPU nodes) | M5 | $40k/mo |
| Self-hosted LLM serving experiment | M9 | $20k/mo |
| Cloud sim cluster v2 (50 GPU + autoscale) | M14 | $150k/mo |
| Multi-region deployment | M20 | $250k/mo |

---

# 14. MOAT & DEFENSIBILITY

The danger: Cursor adds a "Robotics" extension and we evaporate. Why won't that happen?

## 14.1 Layered moat

1. **Data moat — proprietary RKG.** A curated, versioned graph of every ROS2 package, message, common pattern, anti-pattern, and known bug. Years of effort to build. We seed it from public ROS2 sources and grow it from user telemetry (opt-in). Cursor can't catch up without doing the same work, and they won't because their bet is horizontal.
2. **Telemetry moat.** With user consent, anonymized (bag → bug → fix) tuples become a fine-tuning corpus. After year 2, our small models on robotics-specific tasks beat frontier models. No one else has this data.
3. **Workflow moat.** Sim orchestration + deploy + robot-side agent = sticky. Once a team's CI runs through us, switching cost is high. Cursor doesn't have an opinion on sim or deploy.
4. **Format moat.** The launch IR, RKG schema, and bag query language become *standards* in the community (open-source the standards, proprietary the implementation tier). Foxglove pulled this off with `mcap`. We can do it with `launch-ir` and `rkg-schema`.
5. **Embedded↔ROS unified moat.** No one else is in this lane. Two-year head start once we ship.
6. **Marketplace network effects.** Robot templates, sensor drivers, sim scenarios. Once 1000+ robots have RoboAgent definitions, every new user finds value instantly.
7. **Trust moat.** In safety-critical domains (medical, industrial), trust + audit logs + enterprise-grade controls take *years* to build. New entrants can't shortcut.
8. **Domain-talent moat.** Robotics + AI engineers who can build this are rare; locking them in early is a moat.

## 14.2 What is NOT a moat

- Our LLM. Frontier models are commoditized at the top.
- Our editor UI. Anyone can fork code-oss.
- Generic RAG / agent loop. Same.

So: **everything we invest in must compound into one of the moats above**, or it's a feature that competitors will copy in 6 months.

## 14.3 Strategic posture vs. each threat

- **vs Cursor**: open-source the launch parser + RKG schema; make us the *substrate* even Cursor would use. Then they're a frontend, we're the platform.
- **vs NVIDIA**: partner. Be the easiest way to get into Isaac. Don't try to beat them on GPU sim.
- **vs Foxglove**: out-execute. They could pivot up; we move first.
- **vs Open Robotics / Intrinsic**: stay scrappy and useful. They'll be slow.

---

# 15. FAILURE MODES

Honest assessment of how this dies.

## 15.1 Existential risks

1. **Inference cost > revenue.** Agent loops on Opus can burn $5/session. If a Pro user runs 50 sessions/day, we lose money. **Mitigation**: aggressive caching (Anthropic prompt cache covers 60–80% of repeated workspace context), local small models for cheap tasks, tier rate limits, route to Haiku/Sonnet by default.
2. **No PMF on Bag→Bug.** Maybe robotics engineers are happy with their current ritual. **Mitigation**: 10 design partners interviewed *before* writing code, weekly PMF check-ins, kill the wedge fast if it doesn't resonate, pivot to launch-file authoring or sim CI.
3. **ROS2 ecosystem fragmentation.** Humanoid companies don't use ROS2; some Chinese stacks don't either. Market may shrink. **Mitigation**: abstract the IR; ROS2 is one backend. Be ready to support proprietary middleware in Year 2.
4. **Cursor / Microsoft ships a robotics SKU.** **Mitigation**: depth + speed; build moats §14.
5. **Robotics market itself doesn't grow as expected.** Robotics has had multiple "this is the year" moments. **Mitigation**: serve adjacent markets (drones, embedded↔IoT) to broaden TAM.

## 15.2 Technical risks

- **Launch IR parser turns out to be infeasible** for the long tail of weird launch files. **Mitigation**: best-effort; fall back to LLM parsing for the 5% we can't symbolically resolve. Acceptable.
- **rclpy is slow.** Real concern at scale. **Mitigation**: switch hot-path introspection to rclrs or DDS-direct via Cyclone DDS Rust bindings.
- **Gazebo orchestration is flaky.** It is. **Mitigation**: container snapshots, fixed versions, retries, structured timeouts.
- **Local indexing OOMs on huge workspaces.** **Mitigation**: streaming indexer, mmap'd RocksDB, optional cloud-side indexing.
- **Hallucinations cause physical accidents.** This is the existential safety risk. **Mitigation**: §11.

## 15.3 Market risks

- **NVIDIA gives away an Isaac IDE for free.** Possible. **Mitigation**: ROS2-native, not GPU-native. Run on a $200 used ThinkPad.
- **Open-source competitor (e.g., Foxglove pivots).** Likely within 18 months. **Mitigation**: speed, depth, partnerships, our agent loop is hard to replicate.

## 15.4 Organizational risks

- **Founders can't hire robotics-AI talent.** Real risk; talent pool is small. **Mitigation**: well-known founder profile, ROS2 community presence, competitive equity, remote-first.
- **Robotics customers buy slowly.** True. **Mitigation**: hobbyist + indie funnel + freemium top-of-funnel; don't depend on enterprise revenue until Year 2.

## 15.5 Probability assessment (founder's eye)

- P(builds and ships MVP in 3 months) = 0.7
- P(MVP achieves PMF signal with 10 design partners) = 0.45
- P(reaches $1M ARR by month 18) = 0.30
- P(reaches $10M ARR by month 36) = 0.15
- P(becomes a $1B+ company in 7 years) = 0.05

Numbers are normal for a deep-tech vertical SaaS. They are not "easy" but they are fundable.

---

# 16. FINAL RECOMMENDATION

## 16.1 Scores

| Dimension | Score (1–10) | Notes |
|---|---|---|
| Viability (is there a business?) | **8** | Real pain, willing buyers, growing market, no incumbent |
| Technical feasibility | **7** | Hard but tractable; launch parser + sim orch + RKG are heavy lifts but not research |
| Startup difficulty | **9** | Deep-tech vertical SaaS, long sales cycles for enterprise, expensive infra |
| Defensibility | **8** | Real moat candidates (RKG, telemetry, formats); not commoditizable in <2 yrs |
| Founder-market fit required | **9** | You need a robotics-native founder + an AI-systems founder; without both, do not start |
| Inference economics | **6** | Manageable with discipline; risky if profligate |

## 16.2 Estimated infrastructure costs

| Stage | Monthly burn (infra only) |
|---|---|
| MVP (50 users) | $8–15k |
| Beta (500 users, light sim) | $40–80k |
| Year 1 end (2k users, sim cluster, telemetry) | $150–250k |
| Year 2 end (10k users, GPU pool, multi-region) | $500–800k |

LLM costs dominate after sim — budget 30–40% of infra for LLM API.

## 16.3 Recommended MVP (concrete)

> **A Linux-only desktop app for ROS2 Humble/Jazzy mobile robot developers, whose first killer feature is "drop a bag, get a ranked diagnosis with a fix that's been validated in Gazebo."**

Build only this for the first 3 months. Nothing else.

## 16.4 Best initial market

**ROS2 mobile-robot startups, Series Seed–B, US/EU, 10–80 engineers, who are already paying for Foxglove or building internal bag tooling.** They have the pain, the budget ($50–200/seat is nothing), and the technical sophistication to extract value from day 1. ~2,000 such companies globally. You only need 100 of them.

Do **not** start with:
- Universities (no money, slow)
- Defense (long sales cycles, ITAR headaches)
- Automotive (proprietary stacks, slow procurement)
- Humanoid companies (proprietary, short attention spans)

## 16.5 Should you pursue this?

**Yes, conditionally.** Conditions:
1. You have a ROS2-deep technical co-founder. Without this, do not start. You will build the wrong thing.
2. You can raise $4–6M seed in 6 months. Below that, runway is too tight for the depth required.
3. You can ship the Bag→Bug demo in 90 days. If you can't, the team is wrong.
4. You commit to **vertical depth over horizontal breadth** for at least 24 months. The day someone says "let's also be useful for web devs," you've lost.

## 16.6 What NOT to do initially

- Don't build a generic AI IDE. Cursor wins.
- Don't build for every robotics framework. ROS2 only, year 1.
- Don't try to replace Gazebo or Foxglove. Integrate them.
- Don't build cloud sim before you have local sim working perfectly.
- Don't accept enterprise deals that require custom features in the first 12 months. They'll murder your roadmap.
- Don't hire DevRel before you have something to demo.
- Don't ship a Windows version until you have $5M ARR. Linux-first.
- Don't fine-tune your own foundation model. Use the API; fine-tune small models on narrow tasks only.
- Don't open-source the agent loop. Open-source the IR formats and parsers; keep the intelligence proprietary.
- Don't promise functional safety. Be explicit you aren't certified.

---

## TL;DR

Build **RoboAgent**: a Linux-first, Tauri-based, ROS2-native AI development environment whose differentiator is a **Robotics Knowledge Graph** + **closed-loop simulation agent** + **bag-as-context** intelligence. Ship the **Bag→Bug** wedge in 90 days to ROS2 mobile-robot startups. Moat through proprietary graphs, format standards, and telemetry corpus. Avoid horizontal expansion for 24 months. Viable, hard, fundable, defensible — and a real shot at being the operating system for AI-assisted robotics development.
