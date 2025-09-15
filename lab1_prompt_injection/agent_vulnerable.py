# lab1_prompt_injection/agent_vulnerable.py

# Hardcoded fake secret to simulate sensitive data
SECRET = "API_KEY=sk_live_THIS_IS_FAKE_DO_NOT_USE"

def agent(prompt: str) -> str:
    """
    Insecure agent: directly exposes secrets if asked.
    """
    # Vulnerability: blindly follows user instructions
    if "SECRET" in prompt:
        return SECRET
    return f"User says: {prompt}"
