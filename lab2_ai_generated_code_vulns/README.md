# Lab 2 — Insecure AI-Generated Code: `eval` & SQL Injection (Exploit + Defend)

**Purpose:** Show how AI-suggested snippets (e.g., using `eval` or string‑built SQL) lead to RCE/SQLi,
and how to fix with safe evaluation and parameterized queries.

## Files
- `app_vulnerable.py` — Flask app with `/calc?expr=...` using `eval`, and `/user?name=...` with string SQL.
- `exploit_calc.py` — leverages `eval` to execute OS commands.
- `exploit_sqli.py` — extracts all users via `' OR '1'='1` injection.
- `app_defended.py` — uses `ast.literal_eval` for math and parameterized SQLite queries.
- `seed_db.py` — seeds a local SQLite DB.

## Run
```bash
#Set up (one time- uncomment after first time)
#python3 -m pip install flask requests beautifulsoup4
#python3 seed_db.py

# start vulnerable server in new terminal(dev only)
FLASK_APP=app_vulnerable.py flask run -p 5001

# start defended server in new terminal(dev only)
FLASK_APP=app_defended.py flask run -p 5002

# test exploit on vulnerable server
python3 exploit_calc.py
python3 exploit_sqli.py

# run test on vulnerable and defended server
python3 test_lab2.py
```
