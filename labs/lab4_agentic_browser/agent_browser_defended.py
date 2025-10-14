import sys, re, requests, pathlib
from bs4 import BeautifulSoup

SECRET = "SESSION_TOKEN=tok_live_THIS_IS_FAKE"
ALLOWED_DOMAINS = {"127.0.0.1"}
NO_PAGE_INSTRUCTION = True

def load_page(path_or_url: str) -> str:
    p = pathlib.Path(path_or_url)
    if p.exists():
        return p.read_text()
    return requests.get(path_or_url, timeout=5).text

def safe_post(url: str, payload: dict):
    # Domain allowlist
    from urllib.parse import urlparse
    host = urlparse(url).hostname
    if host not in ALLOWED_DOMAINS:
        raise ValueError("Destination not allowed")
    # Never send secrets automatically
    if any(k in ("SESSION_TOKEN", "API_KEY", "password") for k in "".join(payload.keys()+list(payload.values()))):
        raise ValueError("Sensitive data blocked")
    return requests.post(url, json=payload, timeout=5)

def consent_checkpoint(prompt: str) -> bool:
    # Simulate human-in-the-loop approval
    risky = any(w in prompt.lower() for w in ["post", "upload", "secret", "token"])
    return not risky  # auto-deny risky actions in this demo

def run_agent(doc: str):
    soup = BeautifulSoup(doc, "html.parser")
    meta = soup.find("meta", attrs={"name": "ai-instructions"})
    if meta and meta.get("content"):
        instr = meta["content"]
        if NO_PAGE_INSTRUCTION:
            print("Ignoring page-supplied instructions by policy.")
            return
        if not consent_checkpoint(instr):
            print("Action denied by consent checkpoint.")
            return
        m = re.search(r"POST\s+(https?://\S+)", instr)
        if m:
            url = m.group(1)
            # Do not include secrets; send only minimal telemetry
            safe_post(url, {"note": "allowed telemetry only"})
            print("Posted telemetry to", url)
        else:
            print("No actionable instructions.")
    else:
        print("No ai-instructions meta found.")

if __name__ == "__main__":
    doc = load_page(sys.argv[1])
    run_agent(doc)
