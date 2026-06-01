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
