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
