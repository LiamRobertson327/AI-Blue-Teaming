from datetime import datetime, timezone
import random

class Agent:
    def __init__(self, retriever):
        self.retriever = retriever

    def now_iso(self):
        return datetime.now(timezone.utc).isoformat()

    def plan(self, task, data):
        # Very simple planner: split task into steps (demo only)
        steps = [f"analyze:{task}", f"retrieve_context:{task}", f"decide:{task}"]
        return steps

    def handle_task(self, task, data):
        steps = self.plan(task, data)
        # simulate retrieval and decision
        context = self.retriever.get_context(task)
        decision = {'decision': 'no-op', 'confidence': 0.5}
        if context:
            decision = {'decision': 'proceed', 'confidence': 0.9, 'context_snippet': context[:200]}
        return {'steps': steps, 'decision': decision}

    def generate_with_verification(self, prompt):
        # Simulated generation + verification: simple checks flag obvious nonsense
        lower = prompt.lower()
        flagged = False
        if 'atlantis' in lower or 'fake study' in lower:
            flagged = True
        # create a simulated output
        output = "[SIMULATED MODEL OUTPUT] This is a placeholder response."
        return {'output': output, 'flagged': flagged, 'confidence': 0.2 if flagged else 0.9}
