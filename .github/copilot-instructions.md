# GitHub Copilot Instructions - ICT University ERP System

## Architecture Overview

This is a **Next.js 14 + FastAPI + Supabase** school ERP system with modular architecture:

- **Frontend**: Next.js 14 App Router with TypeScript, Tailwind CSS, Zustand state management
- **Backend**: FastAPI with Python 3.11+, SQLAlchemy models, repository pattern
- **Database**: Supabase (PostgreSQL) with real-time features and auth
- **Authentication**: Supabase Auth + JWT with role-based access control

Key directories:
- `frontend/src/components/` - Reusable UI components organized by feature
- `frontend/src/modules/` - Feature modules (auth, academic, finance, hr)
- `backend/app/models/` - SQLAlchemy database models with UUID primary keys
- `backend/app/repositories/` - Repository pattern for data access
- `backend/app/api/api_v1/` - FastAPI routers with role-based permissions

## Code Optimization Requirements

### React Performance Patterns
Always apply these optimization techniques:

1. **Use React.memo for components with stable props**:
   ```tsx
   export const ExpensiveComponent = React.memo(({ data, onAction }) => {
     // Component logic
   })
   ```

2. **Implement useMemo for expensive calculations**:
   ```tsx
   const processedData = useMemo(() => 
     rawData.filter(item => item.status === 'active').sort((a, b) => a.name.localeCompare(b.name)),
     [rawData]
   )
   ```

3. **Use useCallback for event handlers passed to child components**:
   ```tsx
   const handleSubmit = useCallback((data) => {
     // Submit logic
   }, [dependency])
   ```

4. **Prefer React Fragments over unnecessary divs**:
   ```tsx
   return (
     <>
       <Header />
       <Content />
     </>
   )
   ```

### Component Organization
Follow the established patterns in `components/dashboard/` - components are grouped by feature with:
- Main component file (`dashboard-layout.tsx`)
- `components/` subfolder for related sub-components
- `types/` subfolder for TypeScript definitions
- `constants/` subfolder for configuration

## Problem-Solving Approach

### Analyze Before Creating
**NEVER create new files to solve existing component problems**. Instead:

1. **Thoroughly analyze the existing codebase** in the relevant folder
2. **Identify the root cause** by examining component logic, props, and data flow
3. **Fix in-place** using existing files and established patterns
4. **Only create new files** when implementing genuinely new features

Example: If `dashboard/student-dashboard.tsx` has issues, examine:
- Component state management
- Hook dependencies and data fetching
- Props passing and type definitions
- CSS classes and responsive behavior

### Permission Protocol
**Always ask for explicit permission** before:
- Performing actions outside the current task scope
- Making significant architectural changes
- Installing new dependencies
- Modifying core configuration files (`next.config.js`, `tailwind.config.js`, etc.)

## Project-Specific Patterns

### Role-Based UI Components
Follow the role configuration pattern from `enhanced-dashboard.tsx`:
```tsx
const ROLE_CONFIG = {
  student: { theme: 'orange', titleColor: 'text-orange-700' },
  academic_staff: { theme: 'blue', titleColor: 'text-blue-700' },
  // ... other roles
}
```

### Data Fetching with TanStack Query
Use the established pattern with proper optimization:
```tsx
const { data, isLoading, error } = useQuery({
  queryKey: ['resource', filters],
  queryFn: () => fetchResource(filters),
  staleTime: 60 * 1000, // 1 minute as configured in providers.tsx
})
```

### Backend Repository Pattern
Follow the repository pattern in `backend/app/repositories/`:
- Base repository class with common CRUD operations
- Specific repositories inheriting from base
- Service layer calling repositories, not direct model access

### Error Handling
Use the standardized error response format from `main.py`:
```python
{
  "error": True,
  "message": "Error description",
  "status_code": 400,
  "path": "/api/path",
  "timestamp": 1234567890
}
```

## Development Workflow

### Frontend Development
- Run development server: `npm run dev` from `frontend/` directory
- Components use TypeScript strict mode - ensure proper typing
- CSS utility classes follow Tailwind patterns established in existing components

### Backend Development  
- Start server: `python run.py` from `backend/` directory
- API documentation available at `/docs` endpoint
- Use Supabase client for auth, repository pattern for data access

### Authentication Flow
Authentication uses Supabase Auth with custom JWT verification in FastAPI. User roles determine component access patterns and API endpoint permissions per `ROLE_PERMISSIONS` in `backend/app/core/config.py`.

## Key Files to Reference

- `frontend/src/components/providers.tsx` - Global providers and query configuration
- `backend/app/core/config.py` - Role definitions and permissions mapping
- `backend/app/main.py` - API structure and error handling patterns
- `frontend/src/components/dashboard/dashboard-layout.tsx` - Component optimization examples