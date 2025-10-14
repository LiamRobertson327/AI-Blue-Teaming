#!/usr/bin/env python3
"""
agent_vulnerable_server.py

Wraps the vulnerable agent in a Flask API so it can be tested remotely.
Students can share their public URL (e.g. via Codespaces) with peers.
Make sure to set the visibility to public before remote testing.
"""

from flask import Flask, request, jsonify
from agent_vulnerable import agent  # import your existing vulnerable agent

app = Flask(__name__)

@app.post("/chat")
def chat():
    data = request.get_json(force=True)
    user_input = data.get("input", "")
    try:
        reply = agent(user_input)  # run the vulnerable agent
    except Exception as e:
        reply = f"[ERROR] {e}"
    return jsonify({"output": reply})

if __name__ == "__main__":
    # Bind to all interfaces so it's reachable remotely
    app.run(host="0.0.0.0", port=6001)
