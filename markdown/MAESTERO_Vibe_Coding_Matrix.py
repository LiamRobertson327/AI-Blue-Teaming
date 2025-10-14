import matplotlib.pyplot as plt

# Define MAESTRO layers and mapped vibe coding threats
layers = [
    "1. Foundation Models",
    "2. Data Operations",
    "3. Agent Frameworks",
    "4. Deployment Infrastructure",
    "5. Evaluation & Observability",
    "6. Security & Compliance",
    "7. Agent Ecosystem"
]

threats = [
    "Hallucinated insecure patterns\nModel instability / poisoning",
    "Prompt injection via examples\nMalicious code snippets",
    "Tool misuse\nPlugin compromise\nUnisolated functions",
    "Insecure IaC / Dockerfiles\nPrivilege escalation / RCE",
    "Lack of validation & static analysis\nUndetected insecure merges",
    "Secrets leakage in code\nRegulatory violations (GDPR/CCPA)",
    "Dependency confusion\nMalicious OSS packages"
]

# Create figure
fig, ax = plt.subplots(figsize=(12, 7))
ax.axis('off')

# Table data
table_data = list(zip(layers, threats))

# Draw table
table = plt.table(
    cellText=table_data,
    colLabels=["MAESTRO Layer", "Vibe Coding Threat Examples"],
    cellLoc='left',
    colLoc='center',
    loc='center'
)

# Style
table.auto_set_font_size(False)
table.set_fontsize(10)
table.scale(1.2, 2.6)

# Highlight header
for key, cell in table.get_celld().items():
    if key[0] == 0:  # header row
        cell.set_facecolor("#2f5597")
        cell.set_text_props(color="w", weight="bold")

# Save as PNG
plt.savefig("MAESTRO_VibeCoding_ThreatMatrix.png", bbox_inches="tight")
plt.show()
