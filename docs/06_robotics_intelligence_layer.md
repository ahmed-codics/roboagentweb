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
