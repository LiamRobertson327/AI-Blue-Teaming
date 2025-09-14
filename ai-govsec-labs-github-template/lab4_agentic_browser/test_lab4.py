import subprocess, threading, time, requests, pathlib, sys, os

def start_receiver():
    return subprocess.Popen([sys.executable, "receiver_server.py"], cwd=os.path.dirname(__file__))

if __name__ == "__main__":
    p = start_receiver()
    time.sleep(0.5)
    # vulnerable posts secret
    out = subprocess.check_output([sys.executable, "agent_browser_vulnerable.py", "phishing.html"], cwd=os.path.dirname(__file__), text=True)
    assert "Posted secret" in out
    print("vulnerable posted secret (as expected)")
    # defended refuses
    out = subprocess.check_output([sys.executable, "agent_browser_defended.py", "phishing.html"], cwd=os.path.dirname(__file__), text=True)
    assert "Ignoring page-supplied instructions" in out or "denied" in out
    print("defended blocked exfil")
    p.terminate()
