# lab1_prompt_injection/agent_defended.py

# Same fake secret (should never be leaked)
SECRET = "API_KEY=sk_live_THIS_IS_FAKE_DO_NOT_USE"

DENY_PHRASES = ["SECRET", "API_KEY", "password"]

def agent(prompt: str) -> str:
    """
    Defended agent: applies simple guardrails to block secret leakage.
    """
    # Check if the prompt looks like an injection attempt
    if any(word in prompt for word in DENY_PHRASES):
        return "Sorry, I cannot reveal secrets."
    # Otherwise behave normally
    return f"User says: {prompt}"
