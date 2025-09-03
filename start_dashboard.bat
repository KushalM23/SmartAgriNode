@echo off
echo ============================================================
echo   SmartAgriNode - AI-Powered Agriculture Dashboard
echo ============================================================
echo.

echo Starting the dashboard...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ and try again
    pause
    exit /b 1
)

REM Start the dashboard
python start_dashboard.py

pause
