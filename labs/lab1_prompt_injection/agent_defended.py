# lab1_prompt_injection/agent_defended.py

# Same fake secret (should never be leaked)
SECRET = "SESSION_TOKEN=tok_live_THIS_IS_FAKE"

DENY_PHRASES = ["SECRET", "SESSION_TOKEN", "password"]

def agent(prompt: str) -> str:
    """
    Defended agent: applies simple guardrails to block secret leakage.
    """
    # Check if the prompt looks like an injection attempt
    if any(word in prompt for word in DENY_PHRASES):
        return "Sorry, I cannot reveal secrets."
    # Otherwise behave normally
    return f"User says: {prompt}"
