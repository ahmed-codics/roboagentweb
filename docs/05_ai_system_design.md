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
- Launch IR (compiled from `.launch.py` via symbolic execution)
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
