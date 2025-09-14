# Lab 3 — RCE via Unsafe Command Tool (Exploit + Defend)

**Purpose:** Show how a tool-execution endpoint (MCP-like JSON RPC) can lead to RCE if it uses `shell=True`
or lacks command validation; then lock it down.

## Files
- `server_vulnerable.py` — minimal JSON endpoint with `run_cmd` using `shell=True`.
- `exploit.py` — sends a crafted command with metacharacters.
- `server_defended.py` — uses explicit allowlist + `shell=False` + argument validation.
- `test_lab3.py` — sanity tests.

## Run
```bash
python3 server_vulnerable.py  # port 7001
python3 exploit.py

# defended
python3 server_defended.py    # port 7002
python3 exploit.py --defended
```
