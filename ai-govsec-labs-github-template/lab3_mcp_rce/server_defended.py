from flask import Flask, request, jsonify
import subprocess, shlex

app = Flask(__name__)

ALLOWED_CMDS = {
    "echo": ["echo"],
    "date": ["date"],
    "uptime": ["uptime"],
}

def validate(cmdlist):
    if not isinstance(cmdlist, list) or not cmdlist:
        raise ValueError("Command must be a non-empty list")
    base = cmdlist[0]
    if base not in ALLOWED_CMDS:
        raise ValueError("Command not allowed")
    # No metacharacters; only plain args
    for arg in cmdlist[1:]:
        if any(c in arg for c in [";", "&", "|", "$", "`"]):
            raise ValueError("Invalid characters in arguments")

@app.post("/run_cmd")
def run_cmd():
    data = request.get_json(force=True, silent=True) or {}
    cmd = data.get("cmd", [])
    try:
        validate(cmd)
        out = subprocess.check_output(cmd, shell=False, text=True, stderr=subprocess.STDOUT, timeout=3)
        return jsonify({"ok": True, "output": out})
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 400

if __name__ == "__main__":
    app.run(port=7002)
