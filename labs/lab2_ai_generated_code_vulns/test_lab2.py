# lab2_ai_generated_code_vulns/test_lab2.py
import requests

BASE_VULN = "http://127.0.0.1:5001"
BASE_DEF  = "http://127.0.0.1:5002"

def _extract_items(obj):
    # Accept: {"result":[...]}, or [...] (list of strings OR list of dicts)
    if isinstance(obj, dict) and "result" in obj:
        obj = obj["result"]
    if isinstance(obj, list):
        return obj
    raise AssertionError(f"Unexpected response shape: {obj!r}")

def _to_names(seq):
    # Map ["alice"] or [{"name":"alice"}] -> ["alice"]
    out = []
    for item in seq:
        if isinstance(item, str):
            out.append(item)
        elif isinstance(item, dict) and "name" in item:
            out.append(item["name"])
    return out

def test_vuln_calc():
    r = requests.get(f"{BASE_VULN}/calc", params={"expr": "1+2*3"})
    print("DEBUG:", r.text)
    assert r.json().get("result") == 7, f"calc 1+2*3 wrong: {r.text}"
    print("[PASS] Vulnerable calc normal input")

    r = requests.get(f"{BASE_VULN}/calc",
                     params={"expr": "__import__('os').popen('echo PWNED').read()"})
    print("DEBUG:", r.text)
    assert "PWNED" in (r.json().get("result") or ""), f"calc exploit not leaked: {r.text}"
    print("[PASS] Vulnerable calc exploit leaked")

def test_def_calc():
    r = requests.get(f"{BASE_DEF}/calc", params={"expr": "1+2*3"})
    print("DEBUG:", r.text)
    assert r.json().get("result") == 7, f"defended calc 1+2*3 wrong: {r.text}"
    print("[PASS] Defended calc normal input")

    r = requests.get(f"{BASE_DEF}/calc",
                     params={"expr": "__import__('os').popen('echo PWNED').read()"})
    print("DEBUG:", r.text)
    assert "error" in r.json(), f"defended calc did not block exploit: {r.text}"
    print("[PASS] Defended calc blocked exploit")

def test_vuln_user():
    r = requests.get(f"{BASE_VULN}/user", params={"name": "alice"})
    items = _extract_items(r.json())
    names = _to_names(items)
    print("DEBUG:", r.text)
    assert any(n.lower() == "alice" for n in names), f"Expected 'alice' | names={names} raw={r.text}"
    print("[PASS] Vulnerable user normal input")

    # SQLi: expect more than one user back
    sqli = "' OR '1'='1' -- "
    r = requests.get(f"{BASE_VULN}/user", params={"name": sqli})
    items = _extract_items(r.json())
    #r = requests.get(f"{BASE_VULN}/user", params={"name": "' OR '1'='1 --"})
    #items = _extract_items(r.json())
    names = _to_names(items)
    print("DEBUG:", r.text)
    assert len(set(names)) >= 2, f"Expected multi-row dump | names={names} raw={r.text}"
    print("[PASS] Vulnerable user SQL injection leaked data")

def test_def_user():
    r = requests.get(f"{BASE_DEF}/user", params={"name": "alice"})
    items = _extract_items(r.json())
    names = _to_names(items)
    print("DEBUG:", r.text)
    assert any(n.lower() == "alice" for n in names), f"(def) missing 'alice' | names={names} raw={r.text}"
    print("[PASS] Defended user normal input")

    r = requests.get(f"{BASE_DEF}/user", params={"name": "' OR '1'='1 --"})
    items = _extract_items(r.json())
    names = _to_names(items)
    print("DEBUG:", r.text)
    assert names == [] or len(names) == 0, f"(def) SQLi not blocked | names={names} raw={r.text}"
    print("[PASS] Defended user blocked SQL injection")

if __name__ == "__main__":
    print("Running Lab 2 tests...\n")
    test_vuln_calc()
    test_def_calc()
    test_vuln_user()
    test_def_user()
