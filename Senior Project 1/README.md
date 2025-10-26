# School ERP System

A comprehensive School Enterprise Resource Planning (ERP) system integrating Academic, Marketing & Finance, and Administration & Human Resources modules.

## Architecture

- **Frontend**: Next.js 14 with React 18, TypeScript, Tailwind CSS
- **Backend**: FastAPI with Python 3.11+
- **Database**: Supabase (PostgreSQL with real-time features)
- **Caching**: Redis
- **Authentication**: Supabase Auth + JWT

## Project Structure

```
school-erp-system/
├── frontend/                    # Next.js Application
│   ├── src/
│   │   ├── app/                # App Router pages
│   │   ├── components/         # Reusable UI components
│   │   ├── modules/           # Feature modules
│   │   │   ├── auth/          # Authentication module
│   │   │   ├── academic/      # Academic management
│   │   │   ├── finance/       # Finance & marketing
│   │   │   └── hr/            # HR & administration
│   │   ├── lib/               # Utilities and configurations
│   │   ├── hooks/             # Custom React hooks
│   │   ├── stores/            # Zustand state management
│   │   └── types/             # TypeScript type definitions
│   └── package.json
├── backend/                     # FastAPI Application
│   ├── app/
│   │   ├── core/              # Core configurations
│   │   ├── models/            # Database models
│   │   ├── services/          # Business logic
│   │   ├── api/               # FastAPI routers
│   │   └── schemas/           # Pydantic schemas
│   └── requirements.txt
└── docker-compose.yml          # Development environment
```

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- PostgreSQL (or Supabase account)
- Redis

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd school-erp-system
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

3. **Backend Setup**
   ```bash
   cd backend
   pip install -r requirements.txt
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Database Setup**
   - Create a Supabase project or set up PostgreSQL
   - Update database connection strings in environment files

5. **Run with Docker (Recommended)**
   ```bash
   docker-compose up -d
   ```

   Or run individually:

   **Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

   **Backend**:
   ```bash
   cd backend
   uvicorn app.main:app --reload
   ```

## Features

### ✅ Authentication System (COMPLETED)
- ✅ Secure login/logout with JWT tokens
- ✅ Role-based access control (Student, Academic Staff, HR, Finance, Marketing, Admin)
- ✅ User registration with email verification
- ✅ Profile management and updates
- ✅ Session management and security
- ✅ Supabase integration for authentication

### ✅ Database Models & Repository Layer (COMPLETED)
- ✅ Complete SQLAlchemy models for all modules (15+ models)
- ✅ Repository pattern for clean data access
- ✅ Automatic database initialization and seeding
- ✅ Comprehensive relationship mapping
- ✅ UUID-based primary keys for security
- ✅ Audit logging and change tracking
- ✅ Full test coverage for all models

### 🚧 Academic Module (IN DEVELOPMENT)
- Course management and scheduling
- Student enrollment system
- Grade tracking and analytics
- Attendance management
- Student performance dashboards
- Academic reporting

### 🔄 Marketing & Finance Module (PLANNED)
- Fee management and invoicing
- Payment processing and tracking
- Financial reporting and analytics
- Marketing campaign management
- Lead tracking and conversion

### 🔄 Administration & HR Module (PLANNED)
- Employee management and profiles
- Leave request system
- Payroll processing
- Performance tracking
- Asset management

## API Documentation

Once the backend is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Development

### Code Style
- Frontend: ESLint + Prettier
- Backend: Black + isort + flake8

### Testing
- Frontend: Jest + React Testing Library
- Backend: pytest + pytest-asyncio

### Environment Variables

See `.env.example` files in both frontend and backend directories for required configuration.

## Deployment

### Frontend (Vercel)
```bash
cd frontend
npm run build
# Deploy to Vercel
```

### Backend (Railway/Render)
```bash
cd backend
# Deploy using your preferred platform
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License.