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
