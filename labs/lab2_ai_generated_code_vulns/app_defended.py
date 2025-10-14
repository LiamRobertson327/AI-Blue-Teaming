from flask import Flask, request, jsonify
import sqlite3, ast

app = Flask(__name__)

def get_db():
    conn = sqlite3.connect("lab2.db")
    conn.row_factory = sqlite3.Row
    return conn

@app.get("/calc")
def calc():
    expr = request.args.get("expr", "1+1")
    # Safe numeric evaluation via AST
    try:
        node = ast.parse(expr, mode="eval")
        allowed = (ast.Expression, ast.BinOp, ast.UnaryOp, ast.Num, ast.Add, ast.Sub, ast.Mult, ast.Div, ast.Pow, ast.Mod)
        if not all(isinstance(n, allowed) for n in ast.walk(node)):
            raise ValueError("Disallowed expression")
        result = eval(compile(node, "<safe>", "eval"), {"__builtins__": {}}, {})
        return jsonify({"result": result})
    except Exception as e:
        return jsonify({"error": "Validation failed"}), 400

@app.get("/user")
def user():
    name = request.args.get("name", "")
    conn = get_db()
    rows = conn.execute("SELECT id, name, email FROM users WHERE name = ?", (name,)).fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

if __name__ == "__main__":
    app.run(port=5002)
