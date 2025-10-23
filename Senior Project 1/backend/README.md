# ICT University ERP System - Backend

FastAPI backend with Supabase integration for the ICT University ERP System.

## Features

- 🔐 **Authentication**: Supabase Auth integration with JWT tokens
- 👥 **Role-Based Access Control**: Multiple user roles (Admin, Staff, Students)
- 📚 **Academic Management**: Courses, grades, attendance tracking
- 💰 **Financial Management**: Invoices, payments, financial reports
- 👔 **HR Management**: Employee management, payroll, leave tracking
- 📈 **Marketing Management**: Campaigns, leads, analytics
- 🛡️ **Security**: JWT verification, permission-based access control
- 📖 **API Documentation**: Auto-generated OpenAPI/Swagger docs

## Quick Start

### Prerequisites

- Python 3.8+
- Supabase account and project

### Installation

1. **Clone and navigate to backend directory**
   ```bash
   cd "Senior Project 1/backend"
   ```

2. **Run the setup script**
   ```bash
   python setup.py
   ```

3. **Activate virtual environment**
   ```bash
   # Windows
   venv\Scripts\activate
   
   # macOS/Linux
   source venv/bin/activate
   ```

4. **Configure environment variables**
   
   Update the `.env` file with your Supabase credentials:
   ```env
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   JWT_SECRET_KEY=your_jwt_secret_key
   ```

5. **Run the development server**
   ```bash
   python run.py
   ```

The API will be available at:
- **API**: http://localhost:8000
- **Documentation**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Manual Installation

If you prefer manual setup:

1. **Create virtual environment**
   ```bash
   python -m venv venv
   ```

2. **Activate virtual environment**
   ```bash
   # Windows
   venv\Scripts\activate
   
   # macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Copy environment file**
   ```bash
   copy .env.example .env  # Windows
   cp .env.example .env    # macOS/Linux
   ```

5. **Update .env with your credentials**

6. **Run the server**
   ```bash
   uvicorn app.main:app --reload
   ```

## Supabase Setup

### Required Supabase Configuration

1. **Create a Supabase project** at https://supabase.com

2. **Get your credentials** from Project Settings > API:
   - Project URL
   - Anon (public) key
   - Service role (secret) key

3. **Get JWT Secret** from Project Settings > API > JWT Settings

4. **Create profiles table** (optional, for extended user data):
   ```sql
   CREATE TABLE profiles (
     id UUID REFERENCES auth.users ON DELETE CASCADE,
     email TEXT,
     full_name TEXT,
     role TEXT,
     phone TEXT,
     department TEXT,
     student_id TEXT,
     employee_id TEXT,
     is_active BOOLEAN DEFAULT TRUE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     PRIMARY KEY (id)
   );
   ```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/me` - Get current user profile
- `PUT /api/v1/auth/me` - Update user profile
- `POST /api/v1/auth/forgot-password` - Password reset
- `POST /api/v1/auth/verify-token` - Token verification

### Academic Management
- `GET /api/v1/academic/courses` - Get courses
- `GET /api/v1/academic/grades` - Get grades
- `GET /api/v1/academic/attendance` - Get attendance

### Financial Management
- `GET /api/v1/finance/invoices` - Get invoices
- `GET /api/v1/finance/payments` - Get payments

### HR Management
- `GET /api/v1/hr/employees` - Get employees
- `GET /api/v1/hr/payroll` - Get payroll

### Marketing Management
- `GET /api/v1/marketing/campaigns` - Get campaigns
- `GET /api/v1/marketing/leads` - Get leads

### System Administration
- `GET /api/v1/admin/users` - Get users (admin only)
- `GET /api/v1/admin/settings` - Get settings (admin only)

## User Roles

- **system_admin**: Full system access
- **academic_staff**: Academic management access
- **student**: Student-specific access
- **hr_personnel**: HR management access
- **finance_staff**: Financial management access
- **marketing_team**: Marketing management access

## Development

### Running Tests
```bash
pytest
```

### Code Formatting
```bash
black app/
isort app/
```

### Code Linting
```bash
flake8 app/
```

## Project Structure

```
backend/
├── app/
│   ├── api/
│   │   └── api_v1/
│   │       ├── endpoints/
│   │       │   ├── auth.py
│   │       │   ├── academic.py
│   │       │   ├── finance.py
│   │       │   ├── hr.py
│   │       │   ├── marketing.py
│   │       │   └── admin.py
│   │       └── api.py
│   ├── core/
│   │   ├── config.py
│   │   ├── security.py
│   │   └── database.py
│   ├── schemas/
│   │   ├── user.py
│   │   └── academic.py
│   └── main.py
├── requirements.txt
├── .env.example
├── .env
├── run.py
└── setup.py
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SUPABASE_URL` | Your Supabase project URL | Yes |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `JWT_SECRET_KEY` | JWT secret from Supabase | Yes |
| `ENVIRONMENT` | Environment (development/production) | No |
| `DEBUG` | Debug mode (True/False) | No |
| `HOST` | Server host (default: 0.0.0.0) | No |
| `PORT` | Server port (default: 8000) | No |

## Troubleshooting

### Common Issues

1. **Import errors**: Make sure virtual environment is activated
2. **Supabase connection errors**: Check your credentials in `.env`
3. **JWT verification errors**: Ensure JWT_SECRET_KEY matches Supabase settings
4. **CORS errors**: Check BACKEND_CORS_ORIGINS in config

### Getting Help

- Check the API documentation at `/docs`
- Review the logs for detailed error messages
- Ensure all environment variables are set correctly