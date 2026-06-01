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
