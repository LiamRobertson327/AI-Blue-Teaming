from flask import Flask, request, jsonify
import subprocess

app = Flask(__name__)

@app.post("/run_cmd")
def run_cmd():
    data = request.get_json(force=True, silent=True) or {}
    cmd = data.get("cmd", "echo hello")
    # VULNERABLE: shell=True executes metacharacters
    try:
        out = subprocess.check_output(cmd, shell=True, stderr=subprocess.STDOUT, text=True, timeout=3)
        return jsonify({"ok": True, "output": out})
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 400

if __name__ == "__main__":
    app.run(port=7001)
