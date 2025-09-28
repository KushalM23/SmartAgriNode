#!/usr/bin/env python3
"""
SmartAgriNode Server Startup Script
This script starts both the backend API server and the frontend web server.
"""

import subprocess
import sys
import time
import os
import signal
from threading import Thread
import shutil

backend_process = None
frontend_process = None
react_process = None

# Resolve absolute paths once
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(PROJECT_ROOT, 'backend')
LEGACY_FRONTEND_DIR = os.path.join(PROJECT_ROOT, 'Frontend')
REACT_DIR = os.path.join(PROJECT_ROOT, 'frontend-react')

def start_backend():
    """Start the backend Flask server"""
    global backend_process
    print("🚀 Starting Backend Server...")
    try:
        # Start the backend in a subprocess and keep it running
        backend_process = subprocess.Popen([sys.executable, 'app.py'], cwd=BACKEND_DIR)
        backend_process.wait()
    except KeyboardInterrupt:
        print("\n⏹️ Backend server stopped")
    except Exception as e:
        print(f"❌ Backend server error: {e}")

def start_frontend():
    """Start the frontend static server"""
    global frontend_process
    print("🌐 Starting Frontend Server...")
    try:
        # Start frontend in a subprocess
        frontend_process = subprocess.Popen([sys.executable, "-m", "http.server", "3000"], cwd=LEGACY_FRONTEND_DIR)
        frontend_process.wait()
    except KeyboardInterrupt:
        print("\n🛑 Frontend server stopped")
    except Exception as e:
        print(f"❌ Frontend server error: {e}")

def start_react_frontend():
    """Start the React (Vite) development server"""
    global react_process
    print("🌐 Starting React Frontend (Vite) Server...")
    try:
        # Resolve npm/npx paths (Windows uses .cmd shims)
        npm_exe = 'npm.cmd' if os.name == 'nt' else 'npm'
        npx_exe = 'npx.cmd' if os.name == 'nt' else 'npx'
        npm_path = shutil.which(npm_exe) or shutil.which('npm')
        npx_path = shutil.which(npx_exe) or shutil.which('npx')

        if not npm_path:
            print("❌ npm not found in PATH for this process. Make sure Node.js is installed and restart the terminal/IDE.")
            print("   You can also add it manually to PATH or run once:")
            print("   C:\\Program Files\\nodejs\\npm.cmd --version")
            return
        else:
            subprocess.run([npm_path, "--version"], check=True, capture_output=True)
            print("✅ npm found, starting Vite dev server...")
        
        # Install dependencies if node_modules doesn't exist
        if not os.path.exists(os.path.join(REACT_DIR, 'node_modules')):
            print("📦 Installing React dependencies...")
            subprocess.run([npm_path, "install"], check=True, cwd=REACT_DIR)
        
        # Start Vite dev server with proper Windows handling
        cmd = [npm_path, "run", "dev", "--", "--host"]
        try:
            if os.name == 'nt':  # Windows
                react_process = subprocess.Popen(
                    cmd,
                    cwd=REACT_DIR,
                    shell=False,
                    creationflags=subprocess.CREATE_NEW_PROCESS_GROUP
                )
            else:  # Unix-like
                react_process = subprocess.Popen(cmd, cwd=REACT_DIR, shell=False)
        except Exception:
            # Fallback to npx vite
            print("↩️ Falling back to npx vite --host")
            if not npx_path:
                print("❌ npx not found. Please ensure Node.js installation is complete and restart your terminal.")
                return
            fallback_cmd = [npx_path, "vite", "--host"]
            if os.name == 'nt':
                react_process = subprocess.Popen(
                    fallback_cmd,
                    cwd=REACT_DIR,
                    shell=False,
                    creationflags=subprocess.CREATE_NEW_PROCESS_GROUP
                )
            else:
                react_process = subprocess.Popen(fallback_cmd, cwd=REACT_DIR, shell=False)
        
        print("🌐 React dev server starting at http://localhost:5173")
        react_process.wait()
    except KeyboardInterrupt:
        print("\n🛑 React frontend server stopped")
    except Exception as e:
        print(f"❌ React frontend server error: {e}")
        print("   Make sure Node.js and npm are installed and in your PATH")

def stop_servers():
    """Kill backend and frontend processes"""
    global backend_process, frontend_process, react_process
    if backend_process:
        backend_process.terminate()
    if frontend_process:
        frontend_process.terminate()
    if react_process:
        react_process.terminate()

def main():
    print("🌱 SmartAgriNode - Starting Servers...")
    print("=" * 50)
    
    # Start backend in a separate thread
    backend_thread = Thread(target=start_backend)
    backend_thread.start()
    
    # Give backend time to start
    time.sleep(2)
    
    try:
        # Prefer starting the React app
        start_react_frontend()
    except KeyboardInterrupt:
        print("\n🛑 Shutting down servers...")
        stop_servers()
        sys.exit(0)

if __name__ == "__main__":
    main()
