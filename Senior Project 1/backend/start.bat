@echo off
echo ========================================
echo   School ERP Backend Server
echo ========================================
echo.

REM Change to the backend directory
cd /d "%~dp0"
echo Current directory: %CD%

REM Check if virtual environment exists
if not exist "venv\Scripts\activate.bat" (
    echo ERROR: Virtual environment not found!
    echo Please create it with: python -m venv venv
    echo Then install dependencies: pip install -r requirements.txt
    pause
    exit /b 1
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Verify activation worked
echo.
echo Checking Python environment...
python -c "import sys; print('Python:', sys.executable)"
python -c "import sys; print('Virtual env active:', 'venv' in sys.executable)"

REM Check if packages are installed
echo.
echo Checking dependencies...
python -c "import sqlalchemy; print('SQLAlchemy:', sqlalchemy.__version__)" 2>nul || (
    echo ERROR: SQLAlchemy not found!
    echo Installing dependencies...
    pip install -r requirements.txt
)

python -c "import fastapi; print('FastAPI:', fastapi.__version__)" 2>nul || (
    echo ERROR: FastAPI not found!
    echo Installing dependencies...
    pip install -r requirements.txt
)

python -c "import uvicorn; print('Uvicorn:', uvicorn.__version__)" 2>nul || (
    echo ERROR: Uvicorn not found!
    echo Installing dependencies...
    pip install -r requirements.txt
)

REM Test app import
echo.
echo Testing app import...
python -c "from app.main import app; print('App import: SUCCESS')" 2>nul || (
    echo ERROR: Cannot import app!
    echo Check for syntax errors in your code
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Starting Server
echo ========================================
echo Server will be available at:
echo   - http://localhost:8000
echo   - http://localhost:8000/docs (API documentation)
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

REM Start the server using the virtual environment's uvicorn
venv\Scripts\uvicorn.exe app.main:app --host 0.0.0.0 --port 8000

echo.
echo Server stopped.
pause