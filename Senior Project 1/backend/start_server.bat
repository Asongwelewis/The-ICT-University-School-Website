@echo off
echo ========================================
echo   School ERP Backend Server Starter
echo ========================================
echo.

REM Check if we're in the right directory
if not exist "app\main.py" (
    echo ERROR: app\main.py not found!
    echo Make sure you're in the backend directory
    pause
    exit /b 1
)

REM Activate virtual environment
echo Activating virtual environment...
if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
    echo Virtual environment activated
) else (
    echo WARNING: Virtual environment not found at venv\Scripts\activate.bat
    echo Continuing with system Python...
)

echo.
echo Checking dependencies...
python -c "import sys; print('Python:', sys.executable)"

REM Test imports
python -c "import sqlalchemy, fastapi, uvicorn; print('Dependencies: OK')" 2>nul
if errorlevel 1 (
    echo ERROR: Missing dependencies!
    echo Run: pip install -r requirements.txt
    pause
    exit /b 1
)

REM Test app import
python -c "from app.main import app; print('App import: OK')" 2>nul
if errorlevel 1 (
    echo ERROR: Cannot import app!
    echo Check your code for syntax errors
    pause
    exit /b 1
)

echo.
echo Starting server...
echo Server will be available at: http://localhost:8000
echo API docs at: http://localhost:8000/docs
echo Press Ctrl+C to stop the server
echo.

REM Start the simple server
python start_dev.py

echo.
echo Server stopped.
pause