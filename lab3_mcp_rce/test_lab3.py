import os
import requests

BASE_VULN = "http://127.0.0.1:7001"
BASE_DEF  = "http://127.0.0.1:7002"

DEFAULT_PATH = "/run_cmd"

def _vuln_url(): return (BASE_VULN.rstrip("/") + DEFAULT_PATH)
def _def_url():  return (BASE_DEF.rstrip("/")  + DEFAULT_PATH)

def _safe_json(resp):
    try:
        return resp.json()
    except Exception:
        return {"_raw": resp.text or ""}

def _extract_output(obj):
    if isinstance(obj, dict):
        for k in ("result", "output", "_raw"):
            v = obj.get(k)
            if isinstance(v, str):
                return v
        if isinstance(obj.get("error"), str):
            return ""  # treat explicit error as blocked
        return str(obj)
    if isinstance(obj, str):
        return obj
    return str(obj)

def _post_with_auto_shape(url: str, cmd: str, prefer_list: bool = False, timeout=10):
    """
    Sends {"cmd": cmd} or {"cmd":[...]}.
    - If prefer_list=True, try list first (for defended).
    - If server replies 400 with 'Command must be a non-empty list', retry as list.
    Returns (resp, json, out_str).
    """
    shapes = []
    if prefer_list:
        shapes = [{"cmd": cmd.split()}, {"cmd": cmd}]
    else:
        shapes = [{"cmd": cmd}, {"cmd": cmd.split()}]

    last = None
    for payload in shapes:
        resp = requests.post(url, json=payload, timeout=timeout)
        js = _safe_json(resp)
        out = _extract_output(js)
        # If server explicitly asks for list, retry with list
        if resp.status_code == 400 and isinstance(js, dict):
            err = js.get("error", "")
            if "must be a non-empty list" in err and isinstance(payload.get("cmd"), str):
                continue
        return resp, js, out
    return resp, js, out  # last try

def test_vuln_rce_benign():
    url = _vuln_url()
    resp, js, out = _post_with_auto_shape(url, "echo SAFE", prefer_list=False)
    print("DEBUG:", resp.text)
    assert resp.status_code == 200 and ("SAFE" in out or "ok" in str(js)), \
        f"Benign on vuln failed: status={resp.status_code} url={url} body={resp.text}"
    print("[PASS] Vulnerable server: benign command echoed")

def test_vuln_rce_exploit():
    url = _vuln_url()
    resp, js, out = _post_with_auto_shape(url, "echo PWNED && whoami", prefer_list=False)
    print("DEBUG:", resp.text)
    assert "PWNED" in out and len(out.strip()) > len("PWNED"), \
        f"Exploit on vuln did not execute: status={resp.status_code} url={url} body={resp.text}"
    print("[PASS] Vulnerable server: exploit executed (RCE proven)")

def test_def_rce_benign():
    url = _def_url()
    # Defended typically expects list args; prefer_list=True tries list first.
    resp, js, out = _post_with_auto_shape(url, "echo SAFE", prefer_list=True)
    ok_flag = (isinstance(js, dict) and js.get("ok") is True)
    print("DEBUG:", resp.text)
    assert (resp.status_code in (200, 201)) and ("SAFE" in out or ok_flag or out != ""), \
        f"Benign on defended failed: status={resp.status_code} url={url} body={resp.text}"
    print("[PASS] Defended server: benign command allowed")

def test_def_rce_block():
    url = _def_url()
    resp, js, out = _post_with_auto_shape(url, "echo PWNED && whoami", prefer_list=True)
    # Block if explicit error/ok:false OR the dangerous output is absent
    blocked = False
    if isinstance(js, dict) and (js.get("error") or js.get("ok") is False):
        blocked = True
    if not any(tok in out for tok in ("PWNED", "whoami", "root")):
        blocked = True
    print("DEBUG:", resp.text)
    assert blocked, f"Exploit not blocked on defended: status={resp.status_code} url={url} body={resp.text}"
    print("[PASS] Defended server: exploit blocked")

if __name__ == "__main__":
    print("Running Lab 3 tests...\n")
    test_vuln_rce_benign()
    test_vuln_rce_exploit()
    test_def_rce_benign()
    test_def_rce_block()
