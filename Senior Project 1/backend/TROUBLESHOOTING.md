# Backend Server Troubleshooting Guide

## Common Issues and Solutions

### 1. "ModuleNotFoundError: No module named 'sqlalchemy'" with --reload

**Problem**: Uvicorn's reload functionality spawns subprocesses that don't inherit the virtual environment properly on Windows.

**Solutions** (in order of preference):

1. **Use the startup script**:
   ```bash
   python run_server.py
   ```

2. **Use the batch file**:
   ```bash
   start_server.bat
   ```

3. **Use simple runner (no reload)**:
   ```bash
   python run_simple.py
   ```

4. **Manual command without reload**:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```

### 2. Virtual Environment Not Activated

**Problem**: Commands fail because virtual environment is not active.

**Solution**:
```bash
cd "Senior Project 1/backend"
venv\Scripts\activate
# You should see (venv) in your prompt
```

### 3. Dependencies Not Installed

**Problem**: Missing packages like SQLAlchemy, FastAPI, etc.

**Solution**:
```bash
pip install -r requirements.txt
```

### 4. Port Already in Use

**Problem**: Port 8000 is already occupied.

**Solutions**:
- Kill existing process: `taskkill /f /im python.exe`
- Use different port: `uvicorn app.main:app --port 8001`

### 5. Database Connection Issues

**Problem**: Database connection fails.

**Check**:
1. Database URL in `.env` file
2. Database server is running
3. Credentials are correct

### 6. CORS Issues

**Problem**: Frontend can't connect to backend.

**Check**:
1. CORS origins in `.env`: `BACKEND_CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000`
2. Backend is running on correct port (8000)
3. Frontend is running on correct port (3000)

## Quick Health Check

Run this to verify your setup:
```bash
python -c "
import sys
print('Python:', sys.executable)
try:
    import sqlalchemy
    print('SQLAlchemy:', sqlalchemy.__version__)
except ImportError:
    print('SQLAlchemy: NOT INSTALLED')
try:
    import fastapi
    print('FastAPI:', fastapi.__version__)
except ImportError:
    print('FastAPI: NOT INSTALLED')
try:
    from app.main import app
    print('App import: SUCCESS')
except Exception as e:
    print('App import: FAILED -', e)
"
```

## Development Workflow

1. **Start Backend**:
   ```bash
   cd "Senior Project 1/backend"
   venv\Scripts\activate
   python run_server.py
   ```

2. **Start Frontend** (in new terminal):
   ```bash
   cd "Senior Project 1/frontend"
   npm run dev
   ```

3. **Access Application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

## Still Having Issues?

1. Check that you're in the correct directory
2. Ensure virtual environment is activated
3. Verify all dependencies are installed
4. Try the simple runner without reload
5. Check Windows firewall/antivirus settings