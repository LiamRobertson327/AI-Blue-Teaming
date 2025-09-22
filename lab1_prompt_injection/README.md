# Lab 1 — Prompt Injection & Secret Exfiltration (Exploit + Defend)

**Purpose:** Demonstrate how naive LLM agents can be tricked into revealing secrets via prompt injection,
then harden the agent using separation of concerns, allowlists, and output filtering.

> Educational use only. Run locally. Do **not** connect to real secrets/systems.

## Files
- `agent_vulnerable.py` — a toy LLM "agent" that naively concatenates instructions and can leak secrets.
- `exploit.py` — demonstrates a classic prompt injection to exfiltrate a secret.
- `agent_defended.py` — adds mitigations: instruction separation, deny‑rules, content filters, and redaction.
- `test_lab1.py` — quick sanity tests.

## Run
```bash
# test exploit on vulnerable agent
python3 exploit.py

#run test on vulnerable and defended agent
python3 test_lab1.py
```
