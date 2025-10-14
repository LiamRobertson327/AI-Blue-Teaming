#!/usr/bin/env python3
"""
agent_defended_server.py

Defended version of the Lab 1 agent.
Instead of blindly executing user instructions, it applies simple defenses:
- Input sanitization
- Policy checks to block instructions asking for SECRET

Wraps the vulnerable agent in a Flask API so it can be tested remotely.
Students can share their public URL (e.g. via Codespaces) with peers.
Make sure to set the visibility to public before remote testing.
"""

from flask import Flask, request, jsonify

# Fake secret, same as in vulnerable version
SECRET = "SESSION_TOKEN=tok_live_THIS_IS_FAKE"

app = Flask(__name__)

def defended_agent(user_input: str) -> str:
    """
    Simple defended agent:
    - Never reveals SECRET.
    - Refuses suspicious instructions (ignore previous, reveal secret, etc.).
    """
    lowered = user_input.lower()

    # Detect common prompt-injection patterns
    blocked_keywords = ["ignore previous", "reveal", "secret", "token", "password", "return only"]
    if any(kw in lowered for kw in blocked_keywords):
        return "[BLOCKED] Malicious instruction detected."

    # Otherwise, behave like a simple chatbot
    return f"[Agent] You said: {user_input}"

@app.post("/chat")
def chat():
    data = request.get_json(force=True)
    user_input = data.get("input", "")
    try:
        reply = defended_agent(user_input)
    except Exception as e:
        reply = f"[ERROR] {e}"
    return jsonify({"output": reply})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=6002)
