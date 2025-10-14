# MCP Server Top 10 Security Risks
*(Model Context Protocol Security)*

- MCP servers connect LLMs/agents to tools and resources.
- They are a high-value attack surface.
- The Top 10 risks highlight both AI-specific and classical security issues.

---

# MCP-01: Prompt Injection

- Malicious prompts manipulate MCP server or bypass controls.  
- Can be direct (user input) or indirect (resource/tool descriptions).  
- **Impact:** Unauthorized actions, data leakage, privilege escalation.

---

# MCP-02: Confused Deputy

- Server executes actions with wrong user identity or privileges.  
- Delegation mis-binding, unclear context of authority.  
- **Impact:** Cross-user access, unauthorized tool execution.

---

# MCP-03: Tool Poisoning

- Malicious or misdescribed tools registered as legitimate.  
- Tool metadata manipulated to deceive the model.  
- **Impact:** Malicious execution, model deception, data theft.

---

# MCP-04: Credential & Token Exposure

- Leakage of API keys, OAuth tokens, or session credentials.  
- Improper storage, logging, or transmission of secrets.  
- **Impact:** Account takeover, API abuse, sensitive data exfiltration.

---

# MCP-05: Insecure Server Configuration

- Weak defaults, missing authentication, or misconfigured access.  
- Exposed endpoints with no rate limiting or ACLs.  
- **Impact:** Unauthorized access, server compromise.

---

# MCP-06: Supply Chain Attacks

- Compromised dependencies or malicious MCP ecosystem components.  
- Typosquatting or dependency confusion vulnerabilities.  
- **Impact:** System-wide compromise, persistent malware.

---

# MCP-07: Excessive Permissions / Scope Creep

- MCP granted more permissions than necessary.  
- Gradual accumulation of privileges over time.  
- **Impact:** Large blast radius if compromised.

---

# MCP-08: Data Exfiltration

- Unauthorized reading or leaking of sensitive data.  
- Tools/resources abused as exfiltration channels.  
- **Impact:** Privacy violations, regulatory non-compliance.

---

# MCP-09: Context Spoofing & Manipulation

- Manipulation of context fed to the model.  
- Poisoning, spoofing, or tampering with state/memory.  
- **Impact:** Incorrect actions, model deviation, unsafe tool use.

---

# MCP-10: Insecure Communication

- Weak or absent TLS, unencrypted channels.  
- Susceptible to MITM or protocol downgrade attacks.  
- **Impact:** Data interception, tampering, credential theft.

---

# Honorable Mentions

- Insufficient logging & monitoring.  
- Resource exhaustion / DoS.  
- Input validation failures (SQLi, injection).  
- Session management issues.  
- Overly permissive CORS.  
- Dependency confusion/typosquatting.  

---

# Key Takeaways

- Prompt Injection remains the top MCP server risk.  
- Identity binding and least privilege are critical.  
- Supply chain, configuration, and comms hygiene are essential.  
- Classical web/API security still applies, **with AI-specific twists**.  
