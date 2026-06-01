# 16. FINAL RECOMMENDATION

## 16.1 Scores

| Dimension | Score (1–10) | Notes |
|---|---|---|
| Viability (is there a business?) | **8** | Real pain, willing buyers, growing market, no incumbent |
| Technical feasibility | **7** | Hard but tractable; launch parser + sim orch + RKG are heavy lifts but not research |
| Startup difficulty | **9** | Deep-tech vertical SaaS, long sales cycles for enterprise, expensive infra |
| Defensibility | **8** | Real moat candidates (RKG, telemetry, formats); not commoditizable in <2 yrs |
| Founder-market fit required | **9** | You need a robotics-native founder + an AI-systems founder; without both, do not start |
| Inference economics | **6** | Manageable with discipline; risky if profligate |

## 16.2 Estimated infrastructure costs

| Stage | Monthly burn (infra only) |
|---|---|
| MVP (50 users) | $8–15k |
| Beta (500 users, light sim) | $40–80k |
| Year 1 end (2k users, sim cluster, telemetry) | $150–250k |
| Year 2 end (10k users, GPU pool, multi-region) | $500–800k |

LLM costs dominate after sim — budget 30–40% of infra for LLM API.

## 16.3 Recommended MVP (concrete)

> **A Linux-only desktop app for ROS2 Humble/Jazzy mobile robot developers, whose first killer feature is "drop a bag, get a ranked diagnosis with a fix that's been validated in Gazebo."**

Build only this for the first 3 months. Nothing else.

## 16.4 Best initial market

**ROS2 mobile-robot startups, Series Seed–B, US/EU, 10–80 engineers, who are already paying for Foxglove or building internal bag tooling.** They have the pain, the budget ($50–200/seat is nothing), and the technical sophistication to extract value from day 1. ~2,000 such companies globally. You only need 100 of them.

Do **not** start with:
- Universities (no money, slow)
- Defense (long sales cycles, ITAR headaches)
- Automotive (proprietary stacks, slow procurement)
- Humanoid companies (proprietary, short attention spans)

## 16.5 Should you pursue this?

**Yes, conditionally.** Conditions:
1. You have a ROS2-deep technical co-founder. Without this, do not start. You will build the wrong thing.
2. You can raise $4–6M seed in 6 months. Below that, runway is too tight for the depth required.
3. You can ship the Bag→Bug demo in 90 days. If you can't, the team is wrong.
4. You commit to **vertical depth over horizontal breadth** for at least 24 months. The day someone says "let's also be useful for web devs," you've lost.

## 16.6 What NOT to do initially

- Don't build a generic AI IDE. Cursor wins.
- Don't build for every robotics framework. ROS2 only, year 1.
- Don't try to replace Gazebo or Foxglove. Integrate them.
- Don't build cloud sim before you have local sim working perfectly.
- Don't accept enterprise deals that require custom features in the first 12 months. They'll murder your roadmap.
- Don't hire DevRel before you have something to demo.
- Don't ship a Windows version until you have $5M ARR. Linux-first.
- Don't fine-tune your own foundation model. Use the API; fine-tune small models on narrow tasks only.
- Don't open-source the agent loop. Open-source the IR formats and parsers; keep the intelligence proprietary.
- Don't promise functional safety. Be explicit you aren't certified.

---

## TL;DR

Build **RoboAgent**: a Linux-first, Tauri-based, ROS2-native AI development environment whose differentiator is a **Robotics Knowledge Graph** + **closed-loop simulation agent** + **bag-as-context** intelligence. Ship the **Bag→Bug** wedge in 90 days to ROS2 mobile-robot startups. Moat through proprietary graphs, format standards, and telemetry corpus. Avoid horizontal expansion for 24 months. Viable, hard, fundable, defensible — and a real shot at being the operating system for AI-assisted robotics development.
