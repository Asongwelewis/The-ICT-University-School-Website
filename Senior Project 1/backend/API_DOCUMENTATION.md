# ICT University ERP System - API Documentation

## Overview

The ICT University ERP System API provides comprehensive endpoints for managing university operations including authentication, academic management, financial operations, HR management, and system administration.

**Base URL:** `http://localhost:8000`  
**API Version:** v1  
**Authentication:** Bearer Token (JWT)  
**Content-Type:** `application/json`

---

## Authentication Endpoints

### 1. User Registration

Register a new user in the system with role-based access control.

**Endpoint:** `POST /api/v1/auth/register`

#### Request

**Headers:**
```
Content-Type: application/json
```

**Body Parameters:**

| Parameter | Type | Required | Description | Validation |
|-----------|------|----------|-------------|------------|
| `email` | string | ✅ | User's email address | Valid email format |
| `password` | string | ✅ | User's password | Min 8 chars, 1 uppercase, 1 lowercase, 1 digit |
| `full_name` | string | ✅ | User's full name | Non-empty string |
| `phone` | string | ❌ | User's phone number | Optional |
| `role` | string | ✅ | User role | One of: `student`, `academic_staff`, `hr_personnel`, `finance_staff`, `marketing_team`, `system_admin` |
| `department` | string | ❌ | User's department | Optional |
| `student_id` | string | ⚠️ | Student ID | Required if role is `student` |
| `employee_id` | string | ⚠️ | Employee ID | Required if role is staff (non-student) |

#### Request Examples

**Student Registration:**
```json
{
  "email": "john.doe.student@gmail.com",
  "password": "SecurePass123",
  "full_name": "John Doe",
  "phone": "+1234567890",
  "role": "student",
  "student_id": "ICT2024001",
  "department": "Computer Science"
}
```

**Staff Registration:**
```json
{
  "email": "jane.smith.teacher@gmail.com",
  "password": "SecurePass123",
  "full_name": "Jane Smith",
  "phone": "+1234567890",
  "role": "academic_staff",
  "employee_id": "EMP2024001",
  "department": "Computer Science"
}
```

**Admin Registration:**
```json
{
  "email": "admin.user@gmail.com",
  "password": "SecurePass123",
  "full_name": "Admin User",
  "phone": "+1234567890",
  "role": "system_admin",
  "employee_id": "ADM2024001",
  "department": "Administration"
}
```

#### Response

**Success Response (200 OK) - Immediate Login:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2Znd1b3Nyc25xcG5uYWR2cHRwIiwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJpYXQiOjE3NjExODE0NzQsImV4cCI6MTc2MTE4NTA3NCwiYXVkIjoiYXV0aGVudGljYXRlZCIsInN1YiI6IjEyMzQ1Njc4LTkwYWItY2RlZi0xMjM0LTU2Nzg5MGFiY2RlZiJ9...",
  "token_type": "bearer",
  "user": {
    "id": "12345678-90ab-cdef-1234-567890abcdef",
    "email": "john.doe.student@gmail.com",
    "created_at": "2024-10-23T02:04:34.123456Z",
    "user_metadata": {
      "full_name": "John Doe",
      "role": "student",
      "phone": "+1234567890",
      "department": "Computer Science",
      "student_id": "ICT2024001"
    },
    "app_metadata": {}
  },
  "expires_in": 3600
}
```

**Success Response (200 OK) - Email Confirmation Required:**
```json
{
  "message": "Registration successful! Please check your email to confirm your account before logging in.",
  "user": {
    "id": "12345678-90ab-cdef-1234-567890abcdef",
    "email": "john.doe.student@gmail.com",
    "created_at": "2024-10-23T02:04:34.123456Z",
    "user_metadata": {
      "full_name": "John Doe",
      "role": "student"
    }
  },
  "email_confirmation_required": true
}
```

#### Error Responses

**Validation Error (422 Unprocessable Entity):**
```json
{
  "error": true,
  "message": "Validation error",
  "details": [
    {
      "type": "string_too_short",
      "loc": ["body", "password"],
      "msg": "Password must be at least 8 characters long",
      "input": "123"
    }
  ],
  "status_code": 422,
  "path": "/api/v1/auth/register",
  "timestamp": 1761181474.123456
}
```

**User Already Exists (400 Bad Request):**
```json
{
  "error": true,
  "message": "User with this email already exists",
  "status_code": 400,
  "path": "/api/v1/auth/register",
  "timestamp": 1761181474.123456
}
```

**Registration Failed (400 Bad Request):**
```json
{
  "error": true,
  "message": "Registration failed: [specific error message]",
  "status_code": 400,
  "path": "/api/v1/auth/register",
  "timestamp": 1761181474.123456
}
```

#### Notes

- **Password Requirements:** Must contain at least 8 characters with 1 uppercase letter, 1 lowercase letter, and 1 digit
- **Role-Specific Fields:** Students require `student_id`, staff roles require `employee_id`
- **Email Confirmation:** Depending on Supabase configuration, users may need to confirm their email before accessing the system
- **Access Token:** If returned, use this token in the `Authorization: Bearer <token>` header for authenticated requests
- **Token Expiry:** Access tokens expire after 1 hour (3600 seconds) by default

#### cURL Example

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe.student@gmail.com",
    "password": "SecurePass123",
    "full_name": "John Doe",
    "phone": "+1234567890",
    "role": "student",
    "student_id": "ICT2024001",
    "department": "Computer Science"
  }'
```

---

## Available User Roles

| Role | Description | Required Fields | Permissions |
|------|-------------|-----------------|-------------|
| `student` | Student users | `student_id`, `department` | View courses, grades, attendance, invoices |
| `academic_staff` | Teachers and academic personnel | `employee_id`, `department` | Manage courses, grades, attendance |
| `hr_personnel` | Human resources staff | `employee_id`, `department` | Manage employees, payroll, leave |
| `finance_staff` | Financial management staff | `employee_id`, `department` | Manage invoices, payments, reports |
| `marketing_team` | Marketing personnel | `employee_id`, `department` | Manage campaigns, leads, analytics |
| `system_admin` | System administrators | `employee_id`, `department` | Full system access |

---

### 2. User Login

Authenticate an existing user and obtain an access token.

**Endpoint:** `POST /api/v1/auth/login`

#### Request

**Headers:**
```
Content-Type: application/json
```

**Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `email` | string | ✅ | User's registered email address |
| `password` | string | ✅ | User's password |

#### Request Example

```json
{
  "email": "fonasongwelewis@gmail.com",
  "password": "Montero3.0"
}
```

#### Response

**Success Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsImtpZCI6IjlaMzhCNm95RXM1SjJQalkiLCJ0eXAiOiJKV1QifQ...",
  "token_type": "bearer",
  "user": {
    "id": "5efdad52-8843-4a8e-8b8b-69077b156a3f",
    "email": "fonasongwelewis@gmail.com",
    "created_at": "2025-10-23T01:18:41.165169+00:00",
    "updated_at": "2025-10-23T01:19:47.127732+00:00",
    "last_sign_in_at": "2025-10-23T01:19:47.124173+00:00",
    "email_confirmed_at": "2025-10-23T01:19:41.307718+00:00",
    "user_metadata": {
      "department": "Computer Science",
      "email": "fonasongwelewis@gmail.com",
      "email_verified": true,
      "full_name": "Lewis Fonasong Wele",
      "phone": "+237123456789",
      "phone_verified": false,
      "role": "student",
      "student_id": "ICT2024001"
    },
    "app_metadata": {
      "provider": "email",
      "providers": ["email"]
    }
  },
  "expires_in": 3600
}
```

#### Error Responses

**Invalid Credentials (401 Unauthorized):**
```json
{
  "error": true,
  "message": "Invalid email or password",
  "status_code": 401,
  "path": "/api/v1/auth/login",
  "timestamp": 1761182387.123456
}
```

**Email Not Confirmed (400 Bad Request):**
```json
{
  "error": true,
  "message": "Login failed: Email not confirmed",
  "status_code": 400,
  "path": "/api/v1/auth/login",
  "timestamp": 1761182387.123456
}
```

#### cURL Example

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "fonasongwelewis@gmail.com",
    "password": "Montero3.0"
  }'
```

---

### 3. Get Current User Profile

Retrieve the current authenticated user's profile information.

**Endpoint:** `GET /api/v1/auth/me`

#### Request

**Headers:**
```
Authorization: Bearer <access_token>
```

**No Body Required** (GET request)

#### Response

**Success Response (200 OK):**
```json
{
  "id": "5efdad52-8843-4a8e-8b8b-69077b156a3f",
  "email": "fonasongwelewis@gmail.com",
  "full_name": "Lewis Fonasong Wele",
  "phone": "+237123456789",
  "role": "student",
  "department": "Computer Science",
  "student_id": "ICT2024001",
  "employee_id": null,
  "is_active": true,
  "email_verified": true,
  "phone_verified": false,
  "avatar_url": null,
  "date_of_birth": null,
  "address": null,
  "emergency_contact": null,
  "emergency_phone": null,
  "created_at": "2025-10-23T01:18:41.165169+00:00",
  "updated_at": "2025-10-23T01:19:47.127732+00:00",
  "last_sign_in_at": "2025-10-23T01:19:47.124173+00:00",
  "email_confirmed_at": "2025-10-23T01:19:41.307718+00:00"
}
```

#### Error Responses

**Unauthorized (401):**
```json
{
  "error": true,
  "message": "Could not validate credentials",
  "status_code": 401
}
```

**Token Expired (401):**
```json
{
  "error": true,
  "message": "Token has expired",
  "status_code": 401
}
```

#### cURL Example

```bash
curl -X GET http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer <your_access_token>"
```

---

### 4. Update User Profile

Update the current authenticated user's profile information.

**Endpoint:** `PUT /api/v1/auth/me`

#### Request

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Body Parameters (all optional):**

| Parameter | Type | Description |
|-----------|------|-------------|
| `full_name` | string | User's full name |
| `phone` | string | User's phone number |
| `department` | string | User's department |
| `address` | string | User's address |
| `emergency_contact` | string | Emergency contact name |
| `emergency_phone` | string | Emergency contact phone |
| `date_of_birth` | string | Date of birth (YYYY-MM-DD format) |
| `avatar_url` | string | Profile picture URL |

#### Request Example

```json
{
  "full_name": "Lewis Fonasong Wele Updated",
  "phone": "+237987654321",
  "department": "Information Technology",
  "address": "Douala, Cameroon",
  "emergency_contact": "Jane Doe",
  "emergency_phone": "+237123456789"
}
```

#### Response

**Success Response (200 OK):**
```json
{
  "id": "5efdad52-8843-4a8e-8b8b-69077b156a3f",
  "email": "fonasongwelewis@gmail.com",
  "full_name": "Lewis Fonasong Wele Updated",
  "phone": "+237987654321",
  "role": "student",
  "department": "Information Technology",
  "student_id": "ICT2024001",
  "employee_id": null,
  "is_active": true,
  "address": "Douala, Cameroon",
  "emergency_contact": "Jane Doe",
  "emergency_phone": "+237123456789",
  "created_at": "2025-10-23T01:18:41.165169+00:00",
  "updated_at": "2025-10-23T02:35:00.000Z"
}
```

#### Error Responses

**No Data Provided (400 Bad Request):**
```json
{
  "error": true,
  "message": "No data provided for update",
  "status_code": 400
}
```

**Unauthorized (401):**
```json
{
  "error": true,
  "message": "Could not validate credentials",
  "status_code": 401
}
```

#### cURL Example

```bash
curl -X PUT http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer <your_access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Lewis Fonasong Wele Updated",
    "phone": "+237987654321",
    "department": "Information Technology"
  }'
```

---

### 5. User Logout

Logout the current authenticated user and invalidate their session.

**Endpoint:** `POST /api/v1/auth/logout`

#### Request

**Headers:**
```
Authorization: Bearer <access_token>
```

**No Body Required** (POST request without JSON body)

#### Response

**Success Response (200 OK):**
```json
{
  "message": "Successfully logged out"
}
```

#### Error Responses

**Unauthorized (401):**
```json
{
  "error": true,
  "message": "Could not validate credentials",
  "status_code": 401
}
```

#### cURL Example

```bash
curl -X POST http://localhost:8000/api/v1/auth/logout \
  -H "Authorization: Bearer <your_access_token>"
```

#### Notes

- After logout, the access token becomes invalid
- Users must login again to get a new access token
- This endpoint invalidates the session in Supabase

---

## 🎯 Complete Authentication Flow

### **Registration → Login → Profile Management → Logout**

1. **Register** (`POST /api/v1/auth/register`) - Create account
2. **Login** (`POST /api/v1/auth/login`) - Get access token
3. **Get Profile** (`GET /api/v1/auth/me`) - Retrieve user data
4. **Update Profile** (`PUT /api/v1/auth/me`) - Modify user data
5. **Logout** (`POST /api/v1/auth/logout`) - End session

### **Frontend Integration Ready**

All authentication endpoints are now tested and documented. Your frontend can integrate with these APIs using the access tokens for authenticated requests.

---

## 📚 Additional Endpoints Available

The system also includes endpoints for:
- **Academic Management** (`/api/v1/academic/*`)
- **Financial Management** (`/api/v1/finance/*`)
- **HR Management** (`/api/v1/hr/*`)
- **Marketing Management** (`/api/v1/marketing/*`)
- **System Administration** (`/api/v1/admin/*`)

*Documentation for additional modules will be added as they are implemented and tested.*