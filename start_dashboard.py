#!/usr/bin/env python3
"""
SmartAgriNode Dashboard Startup Script
This script helps you start the web dashboard easily.
"""

import os
import sys
import subprocess
import webbrowser
import time
from pathlib import Path

def print_banner():
    """Print the application banner"""
    print("=" * 60)
    print("🌱 SmartAgriNode - AI-Powered Agriculture Dashboard 🌱")
    print("=" * 60)
    print()

def check_dependencies():
    """Check if required Python packages are installed"""
    print("🔍 Checking dependencies...")
    
    required_packages = [
        'flask', 'flask_cors', 'flask_sqlalchemy', 'flask_login',
        'werkzeug', 'joblib', 'ultralytics', 'opencv-python', 'pillow'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
            print(f"✅ {package}")
        except ImportError:
            missing_packages.append(package)
            print(f"❌ {package}")
    
    if missing_packages:
        print(f"\n❌ Missing packages: {', '.join(missing_packages)}")
        print("Please install them using: pip install -r requirements.txt")
        return False
    
    print("✅ All dependencies are installed!")
    return True

def check_models():
    """Check if ML models exist"""
    print("\n🔍 Checking ML models...")
    
    models_dir = Path("Models")
    crop_model = models_dir / "crop_recommendation_model.pkl"
    weed_model = models_dir / "weed_detection_model.pt"
    
    if not models_dir.exists():
        print("❌ Models directory not found!")
        return False
    
    if not crop_model.exists():
        print("❌ Crop recommendation model not found!")
        print("   Expected: Models/crop_recommendation_model.pkl")
        return False
    
    if not weed_model.exists():
        print("❌ Weed detection model not found!")
        print("   Expected: Models/weed_detection_model.pt")
        return False
    
    print("✅ All ML models found!")
    return True

def start_backend():
    """Start the Flask backend server"""
    print("\n🚀 Starting backend server...")
    
    backend_dir = Path("backend")
    if not backend_dir.exists():
        print("❌ Backend directory not found!")
        return None
    
    try:
        # Change to backend directory and start Flask app
        os.chdir(backend_dir)
        
        # Start Flask app in background
        process = subprocess.Popen([
            sys.executable, "app.py"
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        
        # Wait a bit for server to start
        time.sleep(3)
        
        # Check if process is still running
        if process.poll() is None:
            print("✅ Backend server started successfully!")
            print("   Server running on: http://localhost:5000")
            return process
        else:
            stdout, stderr = process.communicate()
            print("❌ Failed to start backend server!")
            print("Error:", stderr.decode())
            return None
            
    except Exception as e:
        print(f"❌ Error starting backend: {e}")
        return None

def open_frontend():
    """Open the frontend in the default browser"""
    print("\n🌐 Opening frontend...")
    
    frontend_file = Path("Frontend/index.html")
    if not frontend_file.exists():
        print("❌ Frontend file not found!")
        print("   Expected: Frontend/index.html")
        return False
    
    try:
        # Convert to absolute path and open in browser
        abs_path = frontend_file.absolute().as_uri()
        webbrowser.open(abs_path)
        print("✅ Frontend opened in browser!")
        print("   If it didn't open automatically, navigate to:")
        print(f"   {abs_path}")
        return True
    except Exception as e:
        print(f"❌ Error opening frontend: {e}")
        return False

def main():
    """Main function"""
    print_banner()
    
    # Check dependencies
    if not check_dependencies():
        print("\n❌ Please install missing dependencies first.")
        return
    
    # Check models
    if not check_models():
        print("\n❌ Please ensure ML models are in the Models/ directory.")
        return
    
    # Start backend
    backend_process = start_backend()
    if not backend_process:
        print("\n❌ Failed to start backend. Exiting.")
        return
    
    # Open frontend
    if not open_frontend():
        print("\n❌ Failed to open frontend.")
    
    print("\n🎉 Dashboard is ready!")
    print("\n📋 Instructions:")
    print("1. The backend is running on http://localhost:5000")
    print("2. The frontend should be open in your browser")
    print("3. Create an account or login to use the ML features")
    print("4. Use Ctrl+C to stop the backend server")
    
    try:
        # Keep the script running
        backend_process.wait()
    except KeyboardInterrupt:
        print("\n\n🛑 Stopping dashboard...")
        backend_process.terminate()
        print("✅ Dashboard stopped.")

if __name__ == "__main__":
    main()
