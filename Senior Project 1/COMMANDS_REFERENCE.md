# Development Commands Reference

## Frontend Development Commands

### Start Frontend Development Server
```cmd
# Navigate to frontend folder
cd "Senior Project 1/frontend"

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

**Frontend will be available at:** http://localhost:3000

### Frontend Package Management
```cmd
# Install new package
npm install [package-name]

# Install dev dependency
npm install -D [package-name]

# Update packages
npm update

# Build for production
npm run build

# Start production server
npm start
```

## Backend Development Commands

### Virtual Environment Setup (One Time Only)
```cmd
# Navigate to backend folder
cd "Senior Project 1/backend"

# Create virtual environment
python -m venv venv

# Activate virtual environment (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables (create .env file)
# Copy from .env.example and update with your database credentials
```

### Database Setup (One Time Only)
```cmd
# Make sure PostgreSQL is installed and running
# Create database: ict_university_erp
# Update database credentials in .env file

# The application will automatically create tables on first run
```

### Daily Backend Development
```cmd
# Navigate to backend
cd "Senior Project 1/backend"

# Activate virtual environment
venv\Scripts\activate

# Run the backend server with auto-reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Alternative: Run with Python directly
python -m app.main

# Deactivate when done
deactivate
```

**Backend will be available at:** 
- API: http://localhost:8000
- Swagger Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- Health Check: http://localhost:8000/health

## Git Workflow Commands

### Daily Feature Development

#### Working on Frontend Changes
```cmd
# Switch to frontend branch
git checkout Frontend
git pull origin Frontend

# Make your frontend changes, then save:
git add .
git commit -m "Feature: Description of frontend changes"
git push origin Frontend
```

#### Working on Backend Changes
```cmd
# Switch to backend branch
git checkout Backend
git pull origin Backend

# Make your backend changes, then save:
git add .
git commit -m "Feature: Description of backend changes"
git push origin Backend
```

### Completing a Feature (Merge to Main)
```cmd
# Option A: Create pull requests on GitHub
# 1. Go to GitHub repository
# 2. Create pull request: Backend → main
# 3. Create pull request: Frontend → main
# 4. Review and merge both

# Option B: Command line merge
git checkout main
git pull origin main
git merge Backend
git merge Frontend
git push origin main
```

## Running Both Servers Simultaneously

### Option 1: Two Terminal Windows (Recommended)
**Terminal 1 (Backend):**
```cmd
cd "Senior Project 1/backend"
venv\Scripts\activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 (Frontend):**
```cmd
cd "Senior Project 1/frontend"
npm run dev
```

## Quick Start Commands

### Start Development Session
```cmd
# 1. Check current branch
git status

# 2. Choose which part to work on
git checkout Frontend   # for frontend work
# OR
git checkout Backend    # for backend work

# 3. Start frontend (Terminal 1)
cd "Senior Project 1/frontend"
npm run dev

# 4. Start backend (Terminal 2) - if needed
cd "Senior Project 1/backend"
venv\Scripts\activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### End Development Session
```cmd
# 1. Save frontend progress
git checkout Frontend
git add .
git commit -m "Description of frontend changes"
git push origin Frontend

# 2. Save backend progress (if worked on backend)
git checkout Backend
git add .
git commit -m "Description of backend changes"
git push origin Backend

# 3. Stop servers (Ctrl+C in both terminals)
```

## Default Server URLs
- **Frontend App:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **Backend Docs:** http://localhost:8000/docs

## Authentication Pages
- **Login:** http://localhost:3000/auth/login
- **Register:** http://localhost:3000/auth/register
- **Dashboard:** http://localhost:3000/dashboard

## Troubleshooting Commands

### Frontend Issues
```cmd
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# Check versions
node --version
npm --version
```

### Backend Issues
```cmd
# Reinstall dependencies
pip install -r requirements.txt --force-reinstall

# Check Python version
python --version

# Check if virtual environment is active
where python
```

### Git Issues
```cmd
# See current status
git status

# See all branches
git branch -a

# Force pull latest changes
git fetch origin
git reset --hard origin/[branch-name]
```