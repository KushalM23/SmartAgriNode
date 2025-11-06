#!/usr/bin/env python3
"""
SmartAgriNode Server Startup Script
This script starts both the backend API server and the frontend web server.
"""

import logging
import os
import shutil
import subprocess
import sys
import time
from threading import Thread

backend_process = None
react_process = None

# Resolve absolute paths once
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(PROJECT_ROOT, 'backend')
REACT_DIR = os.path.join(PROJECT_ROOT, 'frontend-react')


logging.basicConfig(level=logging.INFO, format="[%(levelname)s] %(message)s")
logger = logging.getLogger("SmartAgriNode.start_servers")

def start_backend():
    """Start the backend FastAPI server"""
    global backend_process
    logger.info("🚀 Starting Backend Server (FastAPI)...")
    try:
        # Start the backend with uvicorn
        backend_process = subprocess.Popen(
            [sys.executable, '-m', 'uvicorn', 'main:app', '--host', '0.0.0.0', '--port', '5000', '--reload'],
            cwd=BACKEND_DIR
        )
        backend_process.wait()
    except KeyboardInterrupt:
        logger.info("⏹️ Backend server stopped")
    except Exception:
        logger.exception("❌ Backend server error")

def start_react_frontend():
    """Start the React (Vite) development server"""
    global react_process
    logger.info("🌐 Starting React Frontend (Vite) Server...")
    try:
        # Resolve npm/npx paths (Windows uses .cmd shims)
        npm_exe = 'npm.cmd' if os.name == 'nt' else 'npm'
        npx_exe = 'npx.cmd' if os.name == 'nt' else 'npx'
        npm_path = shutil.which(npm_exe) or shutil.which('npm')
        npx_path = shutil.which(npx_exe) or shutil.which('npx')

        if not npm_path:
            logger.error("❌ npm not found in PATH for this process. Make sure Node.js is installed and restart the terminal/IDE.")
            logger.info("   You can also add it manually to PATH or run once:")
            logger.info("   C:\\Program Files\\nodejs\\npm.cmd --version")
            return
        else:
            subprocess.run([npm_path, "--version"], check=True, capture_output=True)
            logger.info("✅ npm found, starting Vite dev server...")
        
        # Install dependencies if node_modules doesn't exist
        if not os.path.exists(os.path.join(REACT_DIR, 'node_modules')):
            logger.info("📦 Installing React dependencies...")
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
            logger.warning("↩️ Falling back to npx vite --host")
            if not npx_path:
                logger.error("❌ npx not found. Please ensure Node.js installation is complete and restart your terminal.")
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
        
        logger.info("🌐 React dev server starting at http://localhost:5173")
        react_process.wait()
    except KeyboardInterrupt:
        logger.info("🛑 React frontend server stopped")
    except Exception:
        logger.exception("❌ React frontend server error")
        logger.info("   Make sure Node.js and npm are installed and in your PATH")

def stop_servers():
    """Kill backend and frontend processes"""
    global backend_process, react_process
    if backend_process:
        backend_process.terminate()
        logger.info("Backend process terminated")
    if react_process:
        react_process.terminate()
        logger.info("React process terminated")

def main():
    logger.info("🌱 SmartAgriNode - Starting Servers...")
    logger.info("=" * 50)
    
    # Start backend in a separate thread
    backend_thread = Thread(target=start_backend)
    backend_thread.start()
    
    # Give backend time to start
    time.sleep(2)
    
    try:
        # Prefer starting the React app
        start_react_frontend()
    except KeyboardInterrupt:
        logger.info("🛑 Shutting down servers...")
        stop_servers()
        sys.exit(0)

if __name__ == "__main__":
    main()
