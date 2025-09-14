# AI Governance & Cybersecurity — Labs Template

A ready-to-teach repository template for a 10-week course (20 lectures) blending AI governance with hands-on cybersecurity.  
Includes **four exploit+defense labs**, **Docker/Compose**, **GitHub Actions (Semgrep & Bandit)**, and a **Dev Container** for one-click Codespaces.

> **Ethical use only**. All secrets are fake. Run locally in controlled environments.

## Quick Start

### Option A — GitHub Codespaces (recommended)
1. Click **Use this template → Create a new repository** on GitHub.
2. Open your new repo and click **Code → Codespaces → Create codespace on main**.
3. Wait for the dev container to build; dependencies install automatically.
4. Run a lab:
   ```bash
   cd lab2_ai_generated_code_vulns
   docker compose up --build   # or run Flask directly
   ```

### Option B — Local Docker
```bash
# Lab 3 example
cd lab3_mcp_rce
docker compose up --build
python exploit.py            # vulnerable
python exploit.py --defended # defended
```

### Option C — Local Python
```bash
pip install flask requests beautifulsoup4
python lab1_prompt_injection/exploit.py
```

## What’s Inside

- `lab1_prompt_injection/` — Prompt injection & secret exfiltration (exploit + defense).
- `lab2_ai_generated_code_vulns/` — `eval` misuse & SQL injection (exploit + defense).
- `lab3_mcp_rce/` — Command execution endpoint (MCP-like) RCE (exploit + defense).
- `lab4_agentic_browser/` — Agentic browser prompt injection & exfiltration (exploit + defense).
- `.github/workflows/` — Semgrep & Bandit CI.
- `.devcontainer/` — Pre-configured Codespaces dev container.

## Teaching Materials (in `docs/`)
- Student **Getting Started** (Word, PDF) and **Slides** (PPTX).
- **Lab & Capstone rubrics** (Word) and **grading sheet** (Excel/CSV).
- **Instructor demo script** (PDF).
- **Capstone project templates** (Word & Markdown).

## Safety & Governance
- These labs are for **education and defense**.
- Map exercises to governance frameworks (EU AI Act, NIST AI RMF, ISO/IEC 42001, SOC‑2).
- Use CI scans (Semgrep/Bandit) to demonstrate secure SDLC & continuous assurance.

---
