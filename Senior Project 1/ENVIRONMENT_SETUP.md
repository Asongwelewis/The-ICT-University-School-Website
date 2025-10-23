# Environment Setup Guide

This guide helps you set up the development environment for the School ERP System.

## Prerequisites

- Node.js 20 or higher
- Python 3.11 or higher
- Git

## Frontend Setup

### 1. Install Dependencies

```bash
cd "Senior Project 1/frontend"
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the frontend directory:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Development settings
NODE_ENV=development
```

### 3. Get Supabase Credentials

1. Go to [Supabase](https://supabase.com)
2. Create a new project or use existing one
3. Go to Settings → API
4. Copy the Project URL and anon/public key
5. Add them to your `.env.local` file

### 4. Run Development Server

```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Backend Setup

### 1. Install Dependencies

```bash
cd "Senior Project 1/backend"
pip install -r requirements.txt
```

### 2. Environment Variables

Create a `.env` file in the backend directory:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/school_erp

# Security
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Environment
ENVIRONMENT=development
```

### 3. Run Development Server

```bash
uvicorn app.main:app --reload
```

The backend API will be available at `http://localhost:8000`

## CI/CD Setup (GitHub Actions)

### Required Repository Secrets

Add these secrets in your GitHub repository settings (Settings → Secrets and variables → Actions):

#### Frontend Secrets
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key

#### Deployment Secrets (Optional)
- `VERCEL_TOKEN`: For Vercel deployment
- `ORG_ID`: Vercel organization ID
- `PROJECT_ID`: Vercel project ID
- `RAILWAY_TOKEN`: For Railway deployment
- `RAILWAY_SERVICE`: Railway service name

### Workflow Features

- **Node.js 20**: Updated from 18 for better performance and security
- **Environment Validation**: Gracefully handles missing secrets for fork PRs
- **Build Protection**: Skips build step when Supabase secrets are unavailable
- **Multi-environment Support**: Separate jobs for frontend and backend

## Troubleshooting

### Common Issues

#### 1. "Missing required environment variables" during build

**Cause**: Supabase environment variables not set

**Solution**: 
- For local development: Add variables to `.env.local`
- For CI/CD: Add secrets to GitHub repository settings
- For fork PRs: The build will skip automatically when secrets are unavailable

#### 2. "Node.js 18 is deprecated" warning

**Cause**: Using outdated Node.js version

**Solution**: The workflow now uses Node.js 20 by default

#### 3. Build fails on fork PRs

**Cause**: Fork PRs cannot access repository secrets

**Solution**: The workflow now includes conditional checks to skip builds when secrets are unavailable

### Development Tips

1. **Environment Check**: The app includes a development-only environment checker that shows configuration status
2. **Mock Client**: When Supabase is not configured, a mock client is used to prevent crashes
3. **Graceful Degradation**: Auth features will show appropriate messages when Supabase is unavailable

## Project Structure

```
Senior Project 1/
├── frontend/                 # Next.js frontend
│   ├── src/
│   │   ├── app/             # App router pages
│   │   ├── components/      # Reusable components
│   │   ├── lib/             # Utilities and configurations
│   │   └── modules/         # Feature-specific modules
│   ├── .env.local           # Environment variables (create this)
│   └── package.json
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/            # API routes
│   │   ├── core/           # Core configurations
│   │   ├── models/         # Database models
│   │   └── schemas/        # Pydantic schemas
│   ├── .env                # Environment variables (create this)
│   └── requirements.txt
└── .github/
    └── workflows/
        └── ci-cd.yml       # GitHub Actions workflow
```

## Next Steps

1. Set up your environment variables
2. Run the development servers
3. Configure your Supabase project
4. Set up GitHub repository secrets for CI/CD
5. Start developing!

For more detailed information, check the individual README files in the frontend and backend directories.