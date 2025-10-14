# Very small safe retriever: maps simple keywords to canned docs (no external calls)
class Retriever:
    def __init__(self):
        self.store = {
            'expense': 'Expense policy: claims under $100 auto-approve.',
            'deploy': 'Deploy checklist: run tests, backup db, apply migration.',
            'portfolio': 'Portfolio guide: diversify across assets.'
        }

    def get_context(self, key):
        # return first matching store value for any token in key
        k = key.lower()
        for token, doc in self.store.items():
            if token in k:
                return doc
        return None
