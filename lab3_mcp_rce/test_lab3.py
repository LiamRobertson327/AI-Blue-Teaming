import requests, subprocess, threading, time, os, sys
from server_defended import app as defended_app

def run_app():
    defended_app.run(port=7002)

if __name__ == "__main__":
    t = threading.Thread(target=run_app, daemon=True)
    t.start()
    time.sleep(1)
    r = requests.post("http://127.0.0.1:7002/run_cmd", json={"cmd": ["echo", "SAFE"]})
    assert r.json().get("ok") is True
    print("defended ok")
    r = requests.post("http://127.0.0.1:7002/run_cmd", json={"cmd": ["bash", "-c", "whoami"]})
    assert r.status_code == 400
    print("blocked disallowed command")
