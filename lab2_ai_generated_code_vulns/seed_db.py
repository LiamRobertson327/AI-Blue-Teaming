import sqlite3, os

conn = sqlite3.connect("lab2.db")
c = conn.cursor()
c.execute("DROP TABLE IF EXISTS users")
c.execute("CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, email TEXT)")
c.executemany("INSERT INTO users (name, email) VALUES (?,?)", [
    ("alice", "alice@example.com"),
    ("bob", "bob@example.com"),
    ("charlie", "charlie@example.com"),
])
conn.commit()
conn.close()
print("Seeded lab2.db")
