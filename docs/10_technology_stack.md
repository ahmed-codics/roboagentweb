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
