import http.server
import socketserver
import webbrowser
import os
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

def run_server():
    os.chdir(DIRECTORY)
    socketserver.TCPServer.allow_reuse_address = True
    try:
        with socketserver.TCPServer(("", PORT), Handler) as httpd:
            print("==================================================")
            print("NASA Astronaut Health Monitor Dashboard Server")
            print("==================================================")
            print(f"Server running at: http://localhost:{PORT}")
            print("Press Ctrl+C to stop the server.")
            
            webbrowser.open(f"http://localhost:{PORT}")
            httpd.serve_forever()
    except OSError:
        print(f"Server already active on http://localhost:{PORT}")

if __name__ == "__main__":
    run_server()
