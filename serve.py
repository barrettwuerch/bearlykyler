"""Run with Python 3 from any directory; serves only the bundled site folder."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from functools import partial
from pathlib import Path

if __name__ == '__main__':
    directory = Path(__file__).resolve().parent / 'site'
    server = ThreadingHTTPServer(('127.0.0.1', 8000), partial(SimpleHTTPRequestHandler, directory=str(directory)))
    print('Bearly Kyler: http://localhost:8000 — Ctrl+C to stop')
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
