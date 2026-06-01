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
