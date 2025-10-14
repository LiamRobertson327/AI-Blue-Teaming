# lab1_prompt_injection/agent_vulnerable.py

# Hardcoded fake secret to simulate sensitive data
SECRET = "SESSION_TOKEN=tok_live_THIS_IS_FAKE"

def agent(prompt: str) -> str:
    """
    Insecure agent: directly exposes secrets if asked.
    """
    # Vulnerability: blindly follows user instructions
    if "SECRET" in prompt:
        return SECRET
    return f"User says: {prompt}"
