# 11. SECURITY & SAFETY

Robotics is uniquely dangerous. A hallucinated parameter can drive a 200kg robot through a wall.

## 11.1 Threat model

| Risk | Severity | Mitigation |
|---|---|---|
| Agent autonomously deploys broken code to real robot | Catastrophic | **Hard gate: human confirmation for deploy.* tools, always.** No exceptions. |
| Agent generates code that passes review but breaks safety (e.g., disables collision check) | High | Static analysis pass for known-dangerous patterns: `disable_collision_avoidance`, `bypass_*`, `e_stop = False`, etc. |
| Hallucinated QoS / parameters cause silent runtime failure | Medium | Sim-validate before any deploy; flag low-confidence outputs |
| Malicious code injection via shared launch files / templates from marketplace | High | Sandboxed execution; signed marketplace artifacts; no auto-execution of untrusted launch files |
| User's source code/bag exfiltrated via cloud LLM | Medium | Local-only mode; explicit data residency; opt-in telemetry |
| Compromised robot-side agent | High | mTLS, short-lived tokens, narrow capability tokens, signed binaries |
| Prompt injection via bag metadata or rosout messages | Medium | Strict separation of "user content" vs "system prompt" in agent context; never let model inputs change tool permissions |
| Supply-chain (rosdep / colcon dep) | High | Lockfile + SBOM; flag deps without provenance |

## 11.2 Safety validation layers (defense in depth)

```
1. Static safety scan (regex + AST)
        ↓ pass
2. Type/QoS/launch validation
        ↓ pass
3. Simulation pre-flight (mandatory before deploy)
        ↓ pass
4. Human approval (mandatory for irreversible)
        ↓
5. Deploy
        ↓
6. Watchdog on robot — auto-rollback on safety event
```

For *autonomous* mode (premium): user pre-declares safe scenarios in YAML; agent can only act within those.

## 11.3 Sandboxing

- gVisor for code exec (not Docker alone — Docker isn't a security boundary against a malicious agent payload)
- Read-only mounts by default; writes go through approval queue
- No network egress from sandboxes by default
- Deploy actions go through a separate signed-token service

## 11.4 Audit trail

Every agent action is logged with:
- Tool name, args (redacted for sensitive)
- Model + model version + prompt hash
- User identity
- Approval (if required)

Stored 90 days local, 1 year for enterprise. Required for any liability story.

## 11.5 Functional safety stance

We are **not** ISO 26262 / IEC 61508 certified, and we don't claim to be. This must be **explicit** in our terms: RoboAgent is a development tool, not a runtime safety system. For safety-critical robots (medical, automotive), users layer their own certified safety stack underneath. We can't compete on this and shouldn't pretend to.
