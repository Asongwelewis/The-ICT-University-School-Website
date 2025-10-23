# Frontend-Backend Integration Guide

## 🔗 Backend Connection Information

### **Backend API Base URL**
```
http://localhost:8000
```

### **API Version Prefix**
```
/api/v1
```

### **Complete Authentication Endpoints**
```
POST http://localhost:8000/api/v1/auth/register
POST http://localhost:8000/api/v1/auth/login
GET  http://localhost:8000/api/v1/auth/me
PUT  http://localhost:8000/api/v1/auth/me
POST http://localhost:8000/api/v1/auth/logout
```

---

## 🔧 Frontend Environment Configuration

### **Update your `.env.local` file:**

```env
# Backend API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_API_VERSION=/api/v1

# Authentication Endpoints
NEXT_PUBLIC_AUTH_REGISTER_URL=http://localhost:8000/api/v1/auth/register
NEXT_PUBLIC_AUTH_LOGIN_URL=http://localhost:8000/api/v1/auth/login
NEXT_PUBLIC_AUTH_PROFILE_URL=http://localhost:8000/api/v1/auth/me
NEXT_PUBLIC_AUTH_LOGOUT_URL=http://localhost:8000/api/v1/auth/logout

# Supabase Configuration (if needed for direct client access)
NEXT_PUBLIC_SUPABASE_URL=https://qvfwuosrsnqpnnadvptp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2Znd1b3Nyc25xcG5uYWR2cHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzc5NTQsImV4cCI6MjA3MDc1Mzk1NH0.XKgGiX_ssidFIF4nScjnHLxgXQ4EjLdzHlaooP7Wkdw
```

---

## 📡 API Client Configuration

### **Create API Client (`src/lib/api.ts`):**

```typescript
// src/lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || '/api/v1';

export const API_ENDPOINTS = {
  // Authentication
  REGISTER: `${API_BASE_URL}${API_VERSION}/auth/register`,
  LOGIN: `${API_BASE_URL}${API_VERSION}/auth/login`,
  PROFILE: `${API_BASE_URL}${API_VERSION}/auth/me`,
  LOGOUT: `${API_BASE_URL}${API_VERSION}/auth/logout`,
  
  // Future endpoints
  COURSES: `${API_BASE_URL}${API_VERSION}/academic/courses`,
  INVOICES: `${API_BASE_URL}${API_VERSION}/finance/invoices`,
  // Add more as needed
};

// API Client Class
export class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = `${API_BASE_URL}${API_VERSION}`;
    // Get token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('access_token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
    }
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: this.getHeaders(),
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Authentication methods
  async register(userData: any) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: { email: string; password: string }) {
    const response = await this.request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.access_token) {
      this.setToken(response.access_token);
    }
    
    return response;
  }

  async getProfile() {
    return this.request('/auth/me');
  }

  async updateProfile(profileData: any) {
    return this.request('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async logout() {
    const response = await this.request('/auth/logout', {
      method: 'POST',
    });
    this.clearToken();
    return response;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
```

---

## 🔐 Authentication Hook (`src/hooks/useAuth.ts`)

```typescript
// src/hooks/useAuth.ts
import { useState, useEffect, createContext, useContext } from 'react';
import { apiClient } from '@/lib/api';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  // Add other user properties as needed
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profileData: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        apiClient.setToken(token);
        const profile = await apiClient.getProfile();
        setUser(profile);
      }
    } catch (error) {
      // Token might be expired
      localStorage.removeItem('access_token');
      apiClient.clearToken();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await apiClient.login({ email, password });
    setUser(response.user);
  };

  const register = async (userData: any) => {
    const response = await apiClient.register(userData);
    if (response.access_token) {
      setUser(response.user);
    }
  };

  const logout = async () => {
    await apiClient.logout();
    setUser(null);
  };

  const updateProfile = async (profileData: any) => {
    const updatedUser = await apiClient.updateProfile(profileData);
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
```

---

## 🔄 Update Your Forms

### **Update Login Form (`src/modules/auth/components/login-form.tsx`):**

```typescript
// Add this to your existing login form
import { useAuth } from '@/hooks/useAuth';

export function LoginForm() {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await login(email, password);
      // Redirect to dashboard or home page
      router.push('/dashboard');
    } catch (error) {
      // Handle error (show toast, etc.)
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Rest of your form component...
}
```

### **Update Register Form (`src/modules/auth/components/register-form.tsx`):**

```typescript
// Add this to your existing register form
import { useAuth } from '@/hooks/useAuth';

export function RegisterForm() {
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await register({
        email,
        password,
        full_name: fullName,
        phone,
        role,
        student_id: studentId, // if role is student
        employee_id: employeeId, // if role is staff
        department,
      });
      // Redirect to dashboard or login page
      router.push('/dashboard');
    } catch (error) {
      // Handle error (show toast, etc.)
      console.error('Registration failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Rest of your form component...
}
```

---

## 🛡️ Protected Routes

### **Create Route Protection (`src/components/auth/ProtectedRoute.tsx`):**

```typescript
// src/components/auth/ProtectedRoute.tsx
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth/login');
        return;
      }

      if (requiredRole && user.role !== requiredRole) {
        router.push('/unauthorized');
        return;
      }
    }
  }, [user, loading, requiredRole, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  if (requiredRole && user.role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
}
```

---

## 🚀 Usage in Your App

### **Wrap your app with AuthProvider (`src/app/layout.tsx`):**

```typescript
import { AuthProvider } from '@/hooks/useAuth';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

### **Use in Dashboard (`src/app/dashboard/page.tsx`):**

```typescript
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <ProtectedRoute>
      <div>
        <h1>Welcome, {user?.full_name}!</h1>
        <p>Role: {user?.role}</p>
        <button onClick={logout}>Logout</button>
      </div>
    </ProtectedRoute>
  );
}
```

---

## ⚙️ Backend Server Commands

### **Start Backend Server:**
```bash
cd "Senior Project 1/backend"
python run_simple.py
```

### **Backend will run on:**
```
http://localhost:8000
```

### **API Documentation:**
```
http://localhost:8000/docs
```

---

## 🔍 Testing Connection

1. **Start your backend server** on port 8000
2. **Start your frontend** on port 3000
3. **Test registration/login** from your frontend forms
4. **Check browser network tab** to see API calls
5. **Verify tokens** are stored in localStorage

Your frontend is now ready to connect to the backend! 🎉