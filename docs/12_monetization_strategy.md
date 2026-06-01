# 12. MONETIZATION STRATEGY

## 12.1 Tiers

| Tier | Price | Target | Includes |
|---|---|---|---|
| Hobby | $0 | Students, OSS | Local-only, frontier model with rate limit (200 reqs/day), no cloud sim, no robot agent |
| Pro | $40/seat/mo | Indie roboticists, freelancers | Higher rate limits, all robotics tools, 1 robot agent, basic sim hours |
| Team | $80/seat/mo | Small startups (5–50) | Shared RKG, team analytics, 5 robot agents/seat, 50 cloud sim hrs/seat |
| Business | $200/seat/mo | Series A–C robotics cos. | SSO/SAML, audit logs, unlimited robot agents, 200 sim hrs, priority support |
| Enterprise | $500–2000/seat/mo + custom | Large industrials | Self-hosted option, on-prem RKG, custom models/fine-tunes, dedicated support, SLA, sim cluster sizing |

Plus **usage-metered**:
- Cloud GPU sim: $1.50–4/hr (margin ~40%)
- Frontier-model agent loops: pass-through + 25% margin above tier inclusion
- Robot fleet agents: $50/robot/mo above tier inclusion

## 12.2 Revenue model rationale

- Per-seat pricing because that's what dev tool buyers expect and budget for
- Usage on top because long-running agents and sim are real costs
- Enterprise is where the money is: 1 enterprise contract ($300k ARR) = 600 Pro seats

## 12.3 5-year revenue model (back-of-envelope)

- Year 1: 50 paying teams × $5k avg ARR = $250k ARR (proof)
- Year 2: 500 teams + 5 enterprise × $100k = $1.5M + $500k = $2M ARR
- Year 3: 2k teams + 25 enterprise = $10M ARR
- Year 4: $25M ARR (enterprise heavy)
- Year 5: $50M+ ARR target; Series B at this point

These are aggressive but achievable if we hit the Bag→Bug PMF in Year 1.

## 12.4 Adjacent revenue (Phase 4)

- **Marketplace** (15–30% take): paid robot templates, sensor drivers, scenarios
- **Certification / training**: "RoboAgent Certified Engineer"
- **Managed fleet debugging**: per-robot/month for production fleets
- **Insurance partnership** (long-tail): pre-deployment validation as evidence for robotics insurers

## 12.5 What not to monetize early

- Don't monetize the basic ROS2 introspection tools — they need to be free to drive adoption
- Don't gate the launch parser — open-source it, become the standard
- Don't charge for OSS contributors
