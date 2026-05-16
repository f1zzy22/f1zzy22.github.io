import http.server
import socketserver
import os

PORT = 8000

class GitHubPagesHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Ignore query parameters for file existence checks
        path = self.path.split('?')[0]
        
        # If navigating to a clean URL like /misc, append .html internally
        if path != '/' and not os.path.splitext(path)[1]:
            if os.path.exists('.' + path + '.html'):
                self.path = path + '.html'
                
        return super().do_GET()

# Allow address reuse so it doesn't crash on restarts
socketserver.TCPServer.allow_reuse_address = True

with socketserver.TCPServer(("", PORT), GitHubPagesHandler) as httpd:
    print(f"Custom Local Server running at http://localhost:{PORT}")
    print("This server perfectly mimics GitHub Pages clean URLs!")
    httpd.serve_forever()
