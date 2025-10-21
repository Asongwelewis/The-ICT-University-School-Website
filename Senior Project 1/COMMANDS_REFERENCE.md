# Development Commands Reference

## Git Workflow Commands

### Daily Feature Development

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

### Completing a Feature (Merge to Main)

#### Option A: Using GitHub Pull Requests (Recommended)
1. Go to your GitHub repository
2. Create pull request: `Backend` → `main`
3. Create pull request: `Frontend` → `main`
4. Review and merge both pull requests

#### Option B: Command Line Merge
```cmd
# Merge backend changes to main
git checkout main
git pull origin main
git merge Backend
git push origin main

# Merge frontend changes to main
git merge Frontend
git push origin main
```

### Rollback Commands (When Things Go Wrong)

#### Rollback Main Branch to Previous Working Version
```cmd
# See commit history
git checkout main
git log --oneline

# Option A: Reset to specific commit
git reset --hard [commit-hash]
git push --force origin main

# Option B: Go back 1 commit
git reset --hard HEAD~1
git push --force origin main

# Option C: Revert specific problematic commit
git revert [commit-hash-of-problem]
git push origin main
```

#### Rollback Individual Branches
```cmd
# Rollback backend branch
git checkout Backend
git reset --hard HEAD~1
git push --force origin Backend

# Rollback frontend branch
git checkout Frontend
git reset --hard HEAD~1
git push --force origin Frontend
```

### Checking Status
```cmd
# See current branch and changes
git status

# See all branches
git branch -a

# See commit history
git log --oneline
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
```

### Daily Backend Development
```cmd
# Navigate to backend
cd "Senior Project 1/backend"

# Activate virtual environment
venv\Scripts\activate

# Run the backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Deactivate when done
deactivate
```

### Backend Package Management
```cmd
# Install new package
pip install [package-name]

# Update requirements.txt
pip freeze > requirements.txt
```

## Frontend Development Commands

### Initial Setup (One Time Only)
```cmd
# Navigate to frontend folder
cd "Senior Project 1/frontend"

# Install dependencies
npm install
```

### Daily Frontend Development
```cmd
# Navigate to frontend
cd "Senior Project 1/frontend"

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Frontend Package Management
```cmd
# Install new package
npm install [package-name]

# Install dev dependency
npm install -D [package-name]

# Update packages
npm update
```

## Running Both Servers Simultaneously

### Option 1: Two Terminal Windows
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

### Option 2: Background Process (Advanced)
```cmd
# Start backend in background
cd "Senior Project 1/backend"
venv\Scripts\activate
start /B uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Start frontend
cd "Senior Project 1/frontend"
npm run dev
```

## Default Server URLs
- **Backend API:** http://localhost:8000
- **Frontend App:** http://localhost:3000
- **Backend Docs:** http://localhost:8000/docs

## Quick Reference - Most Used Commands

### Start Development Session
```cmd
# 1. Check current branch
git status

# 2. Choose which part to work on
git checkout Backend    # for backend work
# OR
git checkout Frontend   # for frontend work

# 3. Start backend (Terminal 1)
cd "Senior Project 1/backend"
venv\Scripts\activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 4. Start frontend (Terminal 2)
cd "Senior Project 1/frontend"
npm run dev
```

### End Development Session
```cmd
# 1. Save backend progress
git checkout Backend
git add .
git commit -m "Description of backend changes"
git push origin Backend

# 2. Save frontend progress
git checkout Frontend
git add .
git commit -m "Description of frontend changes"
git push origin Frontend

# 3. Stop servers (Ctrl+C in both terminals)
```

### Complete Feature Workflow
```cmd
# 1. Work on backend
git checkout Backend
# Make changes...
git add .
git commit -m "Login: Add authentication API"
git push origin Backend

# 2. Work on frontend
git checkout Frontend
# Make changes...
git add .
git commit -m "Login: Add login form"
git push origin Frontend

# 3. When feature is complete and tested:
# Create pull requests on GitHub: Backend → main, Frontend → main
# OR merge via command line (see above)
```

## Troubleshooting Commands

### Git Issues
```cmd
# Force pull latest changes (replace [branch] with Backend, Frontend, or main)
git fetch origin
git reset --hard origin/[branch]

# See what files changed
git diff

# Undo last commit (keep changes)
git reset --soft HEAD~1

# See current branch
git branch

# See all branches
git branch -a
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

### Frontend Issues
```cmd
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# Check Node version
node --version
npm --version
```