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
- Embedded/STM32 (Phase 2)
- Isaac Sim (Phase 3)
- Cloud sim (Phase 3)
- Multi-user collaboration (Phase 2)
- Plugin marketplace (Phase 3)
- MoveIt2 / manipulation (Phase 2)
- Windows/macOS native (Linux-first; Mac via remote later)
- Custom LLM training (use frontier APIs initially)
- Fancy multi-agent orchestration (single agent + tools is enough)

## 3.5 MVP success criteria

- 50 paid design partners by month 6
- Net retention of paid pilot conversions >70%
- Bag→Bug demo: <60s to first useful diagnosis on a 5-min bag
- Indexing: full `ros2_ws` (~200 packages) in <90s on Ryzen 7
