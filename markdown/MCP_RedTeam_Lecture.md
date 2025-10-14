# Red-Team Practicum: Multi-Agent MCP Client ↔ MCP Server
- Case study: Planner → Executor agents using MCP tools
- Objective: Safely probe weaknesses & validate guardrails
- Scope: Staging-only, mock creds, non-destructive tests

---

# Agenda
- System overview & threat model
- Policy & controls on MCP server
- Threat-driven test matrix (selected 4.x items)
- Safe test invocations & expected signals
- Observability & audit evidence
- Findings & remediation patterns
- In-class demo / lab checklist

---

# System Overview
- Planner: parses user goals, drafts plan
- Executor: calls MCP tools
- MCP client: JSON-RPC over WebSocket
- MCP server: policy engine (allowlist, scopes, signing, replay)
- RAG & Memory: knowledge base + ephemeral notes
- Boundary: staging only; simulators for external effects

---

# Threat Model (Mapping to 4.x Catalog)
- 4.1 Authz/Delegation
- 4.2 Human-in-loop
- 4.3 Critical commands
- 4.4 Goal/Instruction tamper
- 4.5 Hallucination cascades
- 4.6 Blast radius
- 4.7 KB poisoning
- 4.8 Memory & context
- 4.9 Orchestration exploitation
- 4.10 DoS
- 4.11 Supply chain
- 4.12 Untraceability / log suppression

---

# Test Requirements & Safety
- Staging endpoints, mock creds, canary content only
- Enable guards: signing, nonce, TTL, scopes, allowlists
- Evidence: request/response traces, SIEM alerts, audit exports
- No production data or side effects

---

# Selected Threat Tests (Matrix)
- 4.1.6 Scope Violations
- 4.9.2 / 4.9.4 Unsigned + Replay
- 4.4.1 RAG Tampering
- 4.8.1 Memory Writes
- 4.10.1 Inference Flood
- 4.3.5 Command Pre-Validation

---

# Test A: 4.1.6 Scope Violations
- Hypothesis: Over-broad/missing scopes rejected
- Steps: Call fileOps.write with bad scopes
- Expected: 403 insufficient scope / 409 staging write disabled
- Evidence: decision ID, audit record

---

# Test B: 4.9.2 / 4.9.4 Unsigned + Replay
- Hypothesis: Unsigned/replay messages rejected
- Steps: Remove meta.sig; reuse same nonce
- Expected: 401 bad signature / 409 replay detected
- Evidence: rejection logs, replay counter, SIEM alert

---

# Test C: 4.4.1 RAG Tampering
- Hypothesis: Unsigned ingest blocked; signed allowed; canary triggers alert
- Steps: Ingest unsigned doc; ingest signed doc; query canary
- Expected: Reject unsigned; accept signed; canary alert
- Evidence: pipeline logs, canary event, provenance metadata

---

# Test D: 4.8.1 Memory Writes
- Hypothesis: Unauth writes blocked; overwrites flagged
- Steps: memory.set without auth; overwrite attempt
- Expected: Block unauth; anomaly alert on overwrite
- Evidence: memory audit trail, anomaly event

---

# Test E: 4.10.1 Inference Flood
- Hypothesis: Quotas/rate limiter throttle floods
- Steps: Send 1000 benign invokes/min
- Expected: 429 throttles, dashboards show limiter
- Evidence: throttle metrics, SIEM logs

---

# Test F: 4.3.5 Command Pre-Validation
- Hypothesis: Malformed payloads rejected
- Steps: httpFetch with file:// schema
- Expected: 400 schema violation
- Evidence: validation error, no egress

---

# Prompt-Injection Defense (RAG/Tools)
- Treat prompts as untrusted
- Tool allowlist & policy checks
- Signed instruction artifacts only
- Canary prompts verify blocking & alerting

---

# Observability & Audit Signals
- Decision records: id, hash, sig
- Replay counters & SIEM rules
- Scope mismatch diffs, schema validation logs
- RAG provenance, canary event stream
- Rate limiting dashboards

---

# Findings Template (Example)
- Title: Replay protection missing
- Mapping: 4.9.4 Orchestration → Replay
- Impact: re-execution possible
- Evidence: duplicate nonce accepted
- Fix: nonce cache, timestamp skew, signature verification
- Detection: SIEM rule, replay_rejects_total metric

---

# Remediation Playbook
- Envelope v2: canonicalization, sig, nonce, ts window
- Policy engine: central allowlist, HITL for side-effects
- RAG: provenance-gated ingest, re-validation, canaries
- Memory: append-only, ACLs, rollback, anomaly alerts
- DoS: quotas, circuit breakers
- Audit: WORM logs, SoD

---

# Takeaways
- Red teaming MCP apps = policy + proofs, not exploits
- Prevent-detect-recover: block + alert + rollback
- Prompts are untrusted; policy is signed code
- Make blocks observable, auditable, testable
