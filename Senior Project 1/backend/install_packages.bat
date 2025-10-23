@echo off
echo 🔧 Installing Python packages step by step...
echo ==========================================

REM Activate virtual environment
if not exist "venv" (
    echo ❌ Virtual environment not found! Creating one...
    python -m venv venv
)

echo 📦 Activating virtual environment...
call venv\Scripts\activate

echo 🔄 Upgrading pip...
python -m pip install --upgrade pip

echo 📦 Installing core packages...
pip install fastapi
if %errorlevel% neq 0 (
    echo ❌ Failed to install FastAPI
    pause
    exit /b 1
)

pip install uvicorn
if %errorlevel% neq 0 (
    echo ❌ Failed to install uvicorn
    pause
    exit /b 1
)

pip install python-dotenv
if %errorlevel% neq 0 (
    echo ❌ Failed to install python-dotenv
    pause
    exit /b 1
)

pip install pydantic
if %errorlevel% neq 0 (
    echo ❌ Failed to install pydantic
    pause
    exit /b 1
)

pip install pydantic-settings
if %errorlevel% neq 0 (
    echo ❌ Failed to install pydantic-settings
    pause
    exit /b 1
)

pip install httpx
if %errorlevel% neq 0 (
    echo ❌ Failed to install httpx
    pause
    exit /b 1
)

pip install python-multipart
if %errorlevel% neq 0 (
    echo ❌ Failed to install python-multipart
    pause
    exit /b 1
)

pip install python-dateutil
if %errorlevel% neq 0 (
    echo ❌ Failed to install python-dateutil
    pause
    exit /b 1
)

echo 🔐 Installing authentication packages...
pip install "python-jose[cryptography]"
if %errorlevel% neq 0 (
    echo ❌ Failed to install python-jose
    echo 💡 Trying alternative installation...
    pip install python-jose
    pip install cryptography
)

echo 🗄️ Installing Supabase client...
pip install supabase
if %errorlevel% neq 0 (
    echo ❌ Failed to install supabase
    pause
    exit /b 1
)

echo ✅ All packages installed successfully!
echo 🚀 You can now run: python run.py

pause