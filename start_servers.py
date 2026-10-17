"""
Convenient runner to start both FastAPI Backend (port 8000) and Vite Frontend (port 3000) concurrently.
"""
import os
import sys
import subprocess
import time
import signal

# Paths
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
PYTHON_EXE = sys.executable

# Find node directory
NODE_DIR = r"C:\Users\Supply office\AppData\Local\Microsoft\WinGet\Packages\OpenJS.NodeJS.LTS_Microsoft.Winget.Source_8wekyb3d8bbwe\node-v24.19.0-win-x64"
NPM_CMD = os.path.join(NODE_DIR, "npm.cmd") if os.path.exists(NODE_DIR) else "npm.cmd"

# Set environment PATH
env = os.environ.copy()
env["PATH"] = f"{NODE_DIR};{os.path.dirname(PYTHON_EXE)};{os.path.join(os.path.dirname(PYTHON_EXE), 'Scripts')};{env.get('PATH', '')}"

print("=" * 70)
print("  KERALA FPS PHYSICAL STOCK AUDIT & ePOS RECONCILIATION SYSTEM")
print("  Taluk Supply Office (TSO) / Rationing Inspector Tool")
print("=" * 70)
print(f"[*] Starting Python FastAPI Scraper on http://127.0.0.1:8000 ...")
backend_proc = subprocess.Popen(
    [PYTHON_EXE, "-m", "uvicorn", "api.index:app", "--host", "0.0.0.0", "--port", "8000"],
    cwd=ROOT_DIR,
    env=env
)

time.sleep(1.5)

print(f"[*] Starting React/Vite Mobile-First PWA on http://localhost:3000 ...")
frontend_proc = subprocess.Popen(
    [NPM_CMD, "run", "dev"],
    cwd=ROOT_DIR,
    env=env
)

print("\n" + "-" * 70)
print("  APP IS RUNNING!")
print("  - Web App (Inspector UI): http://localhost:3000")
print("  - Backend ePOS Scraper API: http://localhost:8000/docs")
print("  - Test live ARD: 2056003 (Ponnani Firka)")
print("  Press Ctrl+C to terminate both servers.")
print("-" * 70 + "\n")

try:
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    print("\n[*] Shutting down servers...")
    backend_proc.terminate()
    frontend_proc.terminate()
    print("[*] Stopped.")
