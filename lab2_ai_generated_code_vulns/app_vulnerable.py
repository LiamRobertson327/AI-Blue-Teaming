from flask import Flask, request, jsonify
import sqlite3, os

app = Flask(__name__)

def get_db():
    conn = sqlite3.connect("lab2.db")
    return conn

@app.get("/calc")
def calc():
    expr = request.args.get("expr", "1+1")
    # Vulnerable: eval on untrusted input
    try:
        result = eval(expr)  # DANGEROUS
        return jsonify({"result": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.get("/user")
def user():
    name = request.args.get("name", "")
    # Vulnerable: string concatenated SQL
    q = f"SELECT id, name, email FROM users WHERE name = '{name}'"
    conn = get_db()
    rows = conn.execute(q).fetchall()
    conn.close()
    return jsonify([{"id": r[0], "name": r[1], "email": r[2]} for r in rows])

if __name__ == "__main__":
    app.run(port=5001)
