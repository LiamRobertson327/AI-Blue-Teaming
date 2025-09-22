# Lab 1 — Prompt Injection & Secret Exfiltration (Exploit + Defend)

**Purpose:** Demonstrate how naive LLM agents can be tricked into revealing secrets via prompt injection,
then harden the agent using separation of concerns, allowlists, and output filtering.

> Educational use only. Run locally. Do **not** connect to real secrets/systems.

## Files
- `agent_vulnerable.py` — a toy LLM "agent" that naively concatenates instructions and can leak secrets.
- `agent_vulnerable_server.py` — a server that wraps the vulnerable agent.
- `exploit.py` — demonstrates a classic prompt injection to exfiltrate a secret.
- `agent_defended.py` — adds mitigations: instruction separation, deny‑rules, content filters, and redaction.
- `agent_defended_server.py` — a server that wraps the defended agent.
- `test_lab1.py` — quick sanity tests.

## Run
```bash
# run vulnerable server
python3 agent_vulnerable_server.py # port 6001

# test exploit on vulnerable server
python3 exploit.py

# start defended server in new terminal(dev only)
python3 agent_defended_server.py    # port 6002

# test exploit on defended server
python3 exploit.py --defended

#run test on vulnerable and defended agent
python3 test_lab1.py
```
