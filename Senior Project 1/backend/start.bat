@echo off
echo 🎓 ICT University ERP System - Backend
echo =====================================

REM Check if virtual environment exists
if not exist "venv" (
    echo ❌ Virtual environment not found!
    echo 🔧 Creating virtual environment...
    python -m venv venv
    if %errorlevel% neq 0 (
        echo ❌ Failed to create virtual environment
        pause
        exit /b 1
    )
)

REM Activate virtual environment
echo 📦 Activating virtual environment...
call venv\Scripts\activate

REM Check if packages are installed
echo 🧪 Testing installation...
python test_installation.py
if %errorlevel% neq 0 (
    echo ❌ Some packages are missing!
    echo 🔧 Running package installation...
    call install_packages.bat
)

REM Check if .env file exists
if not exist ".env" (
    echo ❌ .env file not found!
    echo 📝 Creating .env file from template...
    if exist ".env.example" (
        copy .env.example .env
        echo ✅ .env file created
        echo ⚠️  Please update .env with your Supabase credentials before continuing
        echo 📖 See SUPABASE_SETUP.md for detailed instructions
        pause
    ) else (
        echo ❌ .env.example not found
        pause
        exit /b 1
    )
)

REM Start the server
echo 🚀 Starting development server...
echo 💡 Using simple runner (no auto-reload for Windows compatibility)
python run_simple.py

pause