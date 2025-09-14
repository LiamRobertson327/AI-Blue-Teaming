from http.server import BaseHTTPRequestHandler, HTTPServer
import json

class Handler(BaseHTTPRequestHandler):
    def do_POST(self):
        length = int(self.headers.get('Content-Length', 0))
        data = self.rfile.read(length)
        try:
            obj = json.loads(data.decode())
        except Exception:
            obj = {"raw": data.decode(errors='ignore')}
        print("Received:", obj)
        self.send_response(200)
        self.end_headers()
        self.wfile.write(b"ok")

if __name__ == "__main__":
    HTTPServer(("127.0.0.1", 8088), Handler).serve_forever()
