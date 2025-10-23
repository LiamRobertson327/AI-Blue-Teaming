#!/usr/bin/env python3
"""run_demo.py
Walkthrough script for the Capstone starter repo.
- Calls the local demo endpoints:
  - POST /tasks          (normal workflow)
  - POST /tests/rt-01    (safe red-team simulation)
  - GET  /logs           (fetch structured logs)
- Collects and saves sanitized evidence in `redteam/results/collected_evidence_<ts>.json`.

Usage:
  python run_demo.py --base-url http://localhost:8000
  (Run the FastAPI app separately with: uvicorn app.main:app --reload --port 8000)

Options:
  --base-url      Base URL of running service (default: http://localhost:8000)
  --start-server  OPTIONAL: try to start the example server (uvicorn) as a subprocess.
                  Use only in local dev. The script will try to stop it at the end.
  --timeout       HTTP timeout seconds (default: 5)
  --out           Output evidence JSON path (default: redteam/results/collected_evidence_<ts>.json)
"""

import argparse
import json
import os
import subprocess
import sys
import time
from datetime import datetime, timezone
from typing import Any, Dict, Optional

import requests

DEFAULT_BASE = "http://localhost:8000"


def now_iso():
    return datetime.now(timezone.utc).isoformat().replace(":", "-")


def ensure_dirs():
    os.makedirs("redteam/results", exist_ok=True)
    os.makedirs("logs", exist_ok=True)


def health_check(base_url: str, timeout: int = 5) -> Dict[str, Any]:
    url = f"{base_url}/health"
    try:
        r = requests.get(url, timeout=timeout)
        return {"ok": True, "status_code": r.status_code, "body": r.text}
    except requests.RequestException as e:
        return {"ok": False, "error": str(e)}


def post_task(base_url: str, task: str = "demo-task", payload: Optional[Dict] = None, timeout: int = 5) -> Dict[str, Any]:
    url = f"{base_url}/tasks"
    data = {"task": task, "data": payload or {}}
    try:
        r = requests.post(url, json=data, timeout=timeout)
        return {"ok": True, "status_code": r.status_code, "json": r.json()}
    except requests.RequestException as e:
        return {"ok": False, "error": str(e)}


def run_rt01(base_url: str, timeout: int = 10) -> Dict[str, Any]:
    url = f"{base_url}/tests/rt-01"
    try:
        r = requests.post(url, timeout=timeout)
        return {"ok": True, "status_code": r.status_code, "json": r.json()}
    except requests.RequestException as e:
        return {"ok": False, "error": str(e)}


def get_logs(base_url: str, timeout: int = 5) -> Dict[str, Any]:
    url = f"{base_url}/logs"
    try:
        r = requests.get(url, timeout=timeout)
        return {"ok": True, "status_code": r.status_code, "json": r.json()}
    except requests.RequestException as e:
        return {"ok": False, "error": str(e)}


def save_evidence(out_path: str, evidence: Dict[str, Any]):
    with open(out_path, "w") as f:
        json.dump(evidence, f, indent=2)
    print(f"Saved evidence to: {out_path}")


def start_uvicorn(app_module: str = "app.main:app", port: int = 8000):
    cmd = [sys.executable, "-m", "uvicorn", app_module, "--reload", "--port", str(port)]
    print("Starting uvicorn:", " ".join(cmd))
    proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    time.sleep(2)
    return proc


def stop_process(proc: subprocess.Popen):
    print("Stopping subprocess PID", proc.pid)
    proc.terminate()
    try:
        proc.wait(timeout=5)
    except subprocess.TimeoutExpired:
        proc.kill()


def main():
    parser = argparse.ArgumentParser(description="Demo runner for Capstone starter agent (safe).")
    parser.add_argument("--base-url", default=DEFAULT_BASE, help="Base URL for the running service")
    parser.add_argument("--start-server", action="store_true", help="Start uvicorn locally (dev only)")
    parser.add_argument("--timeout", type=int, default=5, help="HTTP timeout seconds")
    parser.add_argument("--out", default=None, help="Output evidence path (optional)")
    args = parser.parse_args()

    ensure_dirs()
    proc = None
    try:
        if args.start_server:
            port = int(args.base_url.rsplit(":", 1)[-1]) if ":" in args.base_url else 8000
            proc = start_uvicorn(port=port)
            print("Waiting for server to warm up...")
            time.sleep(2)

        evidence = {
            "collected_at": datetime.now(timezone.utc).isoformat(),
            "base_url": args.base_url,
            "steps": []
        }

        # Health check
        health = health_check(args.base_url, timeout=args.timeout)
        evidence["steps"].append({"step": "health_check", "result": health})

        # Normal workflow
        task_res = post_task(args.base_url, task="process-expense", payload={"amount": 42}, timeout=args.timeout)
        evidence["steps"].append({"step": "post_task", "request": {"task": "process-expense"}, "result": task_res})

        # Red-team simulation
        rt_res = run_rt01(args.base_url, timeout=max(args.timeout, 10))
        evidence["steps"].append({"step": "run_rt01", "result": rt_res})

        # Fetch logs
        logs_res = get_logs(args.base_url, timeout=args.timeout)
        evidence["steps"].append({"step": "get_logs", "result": logs_res})

        if logs_res.get("ok") and isinstance(logs_res.get("json"), list):
            safe_logs = []
            for item in logs_res["json"]:
                redacted = dict(item)
                for k in list(redacted.keys()):
                    if "secret" in k.lower() or "token" in k.lower():
                        redacted[k] = "<REDACTED>"
                safe_logs.append(redacted)
            evidence["logs"] = safe_logs

        out_path = args.out or os.path.join("redteam", "results", f"collected_evidence_{now_iso()}.json")
        save_evidence(out_path, evidence)
    finally:
        if proc:
            stop_process(proc)


if __name__ == "__main__":
    main()
