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
