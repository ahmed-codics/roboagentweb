# 14. MOAT & DEFENSIBILITY

The danger: Cursor adds a "Robotics" extension and we evaporate. Why won't that happen?

## 14.1 Layered moat

1. **Data moat — proprietary RKG.** A curated, versioned graph of every ROS2 package, message, common pattern, anti-pattern, and known bug. Years of effort to build. We seed it from public ROS2 sources and grow it from user telemetry (opt-in). Cursor can't catch up without doing the same work, and they won't because their bet is horizontal.
2. **Telemetry moat.** With user consent, anonymized (bag → bug → fix) tuples become a fine-tuning corpus. After year 2, our small models on robotics-specific tasks beat frontier models. No one else has this data.
3. **Workflow moat.** Sim orchestration + deploy + robot-side agent = sticky. Once a team's CI runs through us, switching cost is high. Cursor doesn't have an opinion on sim or deploy.
4. **Format moat.** The launch IR, RKG schema, and bag query language become *standards* in the community (open-source the standards, proprietary the implementation tier). Foxglove pulled this off with `mcap`. We can do it with `launch-ir` and `rkg-schema`.
5. **Embedded↔ROS unified moat.** No one else is in this lane. Two-year head start once we ship.
6. **Marketplace network effects.** Robot templates, sensor drivers, sim scenarios. Once 1000+ robots have RoboAgent definitions, every new user finds value instantly.
7. **Trust moat.** In safety-critical domains (medical, industrial), trust + audit logs + enterprise-grade controls take *years* to build. New entrants can't shortcut.
8. **Domain-talent moat.** Robotics + AI engineers who can build this are rare; locking them in early is a moat.

## 14.2 What is NOT a moat

- Our LLM. Frontier models are commoditized at the top.
- Our editor UI. Anyone can fork code-oss.
- Generic RAG / agent loop. Same.

So: **everything we invest in must compound into one of the moats above**, or it's a feature that competitors will copy in 6 months.

## 14.3 Strategic posture vs. each threat

- **vs Cursor**: open-source the launch parser + RKG schema; make us the *substrate* even Cursor would use. Then they're a frontend, we're the platform.
- **vs NVIDIA**: partner. Be the easiest way to get into Isaac. Don't try to beat them on GPU sim.
- **vs Foxglove**: out-execute. They could pivot up; we move first.
- **vs Open Robotics / Intrinsic**: stay scrappy and useful. They'll be slow.
