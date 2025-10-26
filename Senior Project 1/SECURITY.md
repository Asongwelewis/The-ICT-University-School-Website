# Security Policy

## 🔒 Security Overview

This document outlines the security measures implemented in the ICT University School ERP System.

## 🛡️ Security Measures

### 1. **Environment Variables Protection**
- All sensitive data is stored in `.env` files
- `.env` files are excluded from version control via `.gitignore`
- Example files (`.env.example`) contain placeholder values only
- Production secrets are managed through secure deployment platforms

### 2. **Database Security**
- Supabase provides built-in security features:
  - Row Level Security (RLS) enabled
  - JWT-based authentication
  - Encrypted connections (SSL/TLS)
  - Regular security updates

### 3. **API Security**
- JWT token-based authentication
- Role-based access control (RBAC)
- Input validation using Pydantic schemas
- CORS configuration for frontend-backend communication

### 4. **Frontend Security**
- NextAuth.js for secure authentication
- Client-side input validation
- Secure HTTP-only cookies for session management
- XSS protection through React's built-in sanitization

## 🚨 CI/CD Security Checks

Our CI/CD pipeline includes:

1. **GitGuardian Secret Scanning** - Detects exposed secrets in code
2. **Dependency Vulnerability Scanning** - Checks for known vulnerabilities
3. **Code Quality Checks** - ESLint, TypeScript, and Python linting
4. **Automated Testing** - Unit and integration tests

## 📋 Security Checklist

### Before Deployment:
- [ ] All `.env` files contain placeholder values only
- [ ] Secrets are configured in deployment platform
- [ ] Database RLS policies are enabled
- [ ] CORS origins are properly configured
- [ ] JWT secrets are strong and unique
- [ ] All dependencies are up to date

### Regular Maintenance:
- [ ] Update dependencies monthly
- [ ] Review access logs quarterly
- [ ] Rotate JWT secrets annually
- [ ] Audit user permissions quarterly

## 🔑 Environment Variables

### Backend (.env)
```bash
# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# JWT Configuration
SUPABASE_JWT_SECRET=your_supabase_jwt_secret_here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Environment
DEBUG=False
ENVIRONMENT=production
```

### Frontend (.env.local)
```bash
# NextAuth Configuration
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-nextauth-secret-here

# API Configuration
NEXT_PUBLIC_API_URL=https://your-api-domain.com

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## 🚨 Reporting Security Issues

If you discover a security vulnerability, please:

1. **DO NOT** create a public GitHub issue
2. Email security concerns to: [security@ictuniversity.edu]
3. Include detailed information about the vulnerability
4. Allow time for investigation and patching

## 📚 Security Resources

- [Supabase Security Documentation](https://supabase.com/docs/guides/auth/security)
- [NextAuth.js Security](https://next-auth.js.org/configuration/options#security)
- [FastAPI Security](https://fastapi.tiangolo.com/tutorial/security/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

## 🔄 Security Updates

This security policy is reviewed and updated quarterly. Last updated: October 25, 2025.