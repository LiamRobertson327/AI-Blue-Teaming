# Lab 4 — Agentic Browser Prompt Injection (Exploit + Defend)

**Purpose:** Simulate an autonomous "web agent" that reads page-provided instructions
and inadvertently exfiltrates a secret. Then implement guardrails: domain allowlists,
no-page-instructions policy, and consent checkpoints.

## Files
- `agent_browser_vulnerable.py` — follows `<meta name="ai-instructions">` blindly.
- `phishing.html` — malicious page encoding exfil instructions.
- `receiver_server.py` — "attacker" server that logs exfil.
- `run_exploit.sh` — runs all pieces (requires `bash`).
- `agent_browser_defended.py` — defenses: allowlist, consent, and secret scrubbing.
- `test_lab4.py` — sanity tests.

## Run
```bash
#use the following to clear existing process on port 8000 (uncomment if needed)
#lsof -i :8000
#kill -9 <PID>

# terminal 1: start attacker receiver
python3 receiver_server.py
# terminal 2: run vulnerable agent against local phishing page
python3 agent_browser_vulnerable.py phishing.html
# terminal 3: run defended agent
python3 agent_browser_defended.py phishing.html

# run attack on vulnerable and defended agent
python3 test_lab4.py
```
