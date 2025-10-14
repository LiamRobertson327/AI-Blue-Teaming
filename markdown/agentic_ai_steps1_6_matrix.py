import matplotlib.pyplot as plt

# Define the steps and threats with example scenarios
steps = [
    "1. Agency & Reasoning Threats",
    "2. Memory-Based Threats",
    "3. Tool & Execution-Based Threats",
    "4. Authentication & Identity Threats",
    "5. Human-in-the-Loop Threats",
    "6. Multi-Agent System Threats"
]

threats = [
    "• Intent Breaking (Plan Injection, Reflection Traps)\n• Misaligned/Deceptive Behaviors\n• Repudiation/Untraceability",
    "• Memory Poisoning (Session/Shared)\n• Cascading Hallucinations",
    "• Tool Misuse & Chaining\n• Privilege Compromise\n• Resource Overload\n• RCE & Code Injection",
    "• Identity Spoofing\n• Cross-Platform Impersonation\n• Framing Attacks",
    "• Overwhelming HITL (info overload)\n• Human Manipulation (invoice fraud, phishing)",
    "• Agent Communication Poisoning\n• Human Exploitation of Delegation\n• Rogue Agents/Consensus Hijacking"
]

examples = [
    "Ex: Injecting false sub-goals; deceiving HITL; fraud logs missing",
    "Ex: Travel AI tricked on flight costs; hallucinated APIs; medical AI compounding errors",
    "Ex: Over-reserving seats; Terraform backdoor; quota depletion DoS",
    "Ex: Spoofing HR agent to create fake accounts; rogue email-sender AI",
    "Ex: Invoice fraud with fake bank details; phishing disguised as updates",
    "Ex: Poisoned inter-agent consensus; rogue agent approves fraudulent transactions"
]

# Create figure
fig, ax = plt.subplots(figsize=(15, 8))
ax.axis('off')

# Table data
table_data = list(zip(steps, threats, examples))

# Draw table
table = plt.table(
    cellText=table_data,
    colLabels=["Step", "Threats", "Example Scenarios"],
    cellLoc='left',
    colLoc='center',
    loc='center'
)

# Style
table.auto_set_font_size(False)
table.set_fontsize(9)
table.scale(1.2, 3.6)

# Highlight header
for key, cell in table.get_celld().items():
    if key[0] == 0:  # header row
        cell.set_facecolor("#2f5597")
        cell.set_text_props(color="w", weight="bold")

# Save as PNG
plt.savefig("AgenticAI_Steps1-6_ThreatMatrix.png", bbox_inches="tight")
plt.show()
