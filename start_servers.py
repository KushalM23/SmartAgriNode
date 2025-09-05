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

def start_backend():
    """Start the backend Flask server"""
    print("🚀 Starting Backend Server...")
    os.chdir('backend')
    try:
        subprocess.run([sys.executable, 'app.py'], check=True)
    except KeyboardInterrupt:
        print("\n⏹️  Backend server stopped")
    except Exception as e:
        print(f"❌ Backend server error: {e}")

def start_frontend():
    """Start the frontend Flask server"""
    print("🌐 Starting Frontend Server...")
    os.chdir('Frontend')
    try:
        subprocess.run([sys.executable, 'app.py'], check=True)
    except KeyboardInterrupt:
        print("\n⏹️  Frontend server stopped")
    except Exception as e:
        print(f"❌ Frontend server error: {e}")

def main():
    print("🌱 SmartAgriNode - Starting Servers...")
    print("=" * 50)
    
    # Start backend in a separate thread
    backend_thread = Thread(target=start_backend, daemon=True)
    backend_thread.start()
    
    # Give backend time to start
    time.sleep(2)
    
    # Start frontend in main thread
    try:
        start_frontend()
    except KeyboardInterrupt:
        print("\n🛑 Shutting down servers...")
        sys.exit(0)

if __name__ == "__main__":
    main()
