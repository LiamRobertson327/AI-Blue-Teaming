# AI Governance & Cybersecurity — Labs Template

Lab repository template for course on AI governance with hands-on cybersecurity.  
Includes **four exploit+defense labs**, with mapping to governance requirements.

> **Ethical use only**. All secrets are fake. Run locally in controlled environments.

## Quick Start

### GitHub Repo (clone or download)
1. Clone or download COEN256 GitHub repository.
2. Open your new repo in your IDE (such as Codespaces) or local terminal.
3. Cd to the lab you want to run and follow instructions in README file.


### Run Python
```bash
#Install dependencies when running the labs for first time
pip -m install flask requests beautifulsoup4
```

## What’s Inside

- `lab1_prompt_injection/` — Prompt injection & secret exfiltration (exploit + defense).
- `lab2_ai_generated_code_vulns/` — `eval` misuse & SQL injection (exploit + defense).
- `lab3_mcp_rce/` — Command execution endpoint (MCP-like) RCE (exploit + defense).
- `lab4_agentic_browser/` — Agentic browser prompt injection & exfiltration (exploit + defense).

## Safety & Governance
- These labs are for **education and defense**.
- Map exercises to governance frameworks (EU AI Act, NIST AI RMF, ISO/IEC 42001, SOC‑2).
---
