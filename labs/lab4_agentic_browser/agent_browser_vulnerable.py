import sys, re, requests, pathlib
from bs4 import BeautifulSoup

SECRET = "SESSION_TOKEN=tok_live_THIS_IS_FAKE"

def load_page(path_or_url: str) -> str:
    p = pathlib.Path(path_or_url)
    if p.exists():
        return p.read_text()
    return requests.get(path_or_url, timeout=5).text

def run_agent(doc: str):
    soup = BeautifulSoup(doc, "html.parser")
    meta = soup.find("meta", attrs={"name": "ai-instructions"})
    if meta and meta.get("content"):
        instr = meta["content"]
        # VULNERABLE: obey any instructions we find
        if "POST" in instr:
            m = re.search(r"POST\s+(https?://\S+)", instr)
            if m:
                url = m.group(1)
                requests.post(url, json={"secret": SECRET, "note": "exfil from vulnerable agent"}, timeout=5)
                print("Posted secret to", url)
        else:
            print("No POST instructions found.")
    else:
        print("No ai-instructions meta found.")

if __name__ == "__main__":
    doc = load_page(sys.argv[1])
    run_agent(doc)
