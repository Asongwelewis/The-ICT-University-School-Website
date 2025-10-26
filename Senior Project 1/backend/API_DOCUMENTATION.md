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

---

## 🗄️ Database Models and Data Layer

### **Completed: October 25, 2025**

The ICT University ERP System now includes a comprehensive database layer with SQLAlchemy models and repository patterns for all major modules.

#### **Database Architecture**

**Database Provider:** Supabase (PostgreSQL)  
**ORM:** SQLAlchemy with Pydantic schemas  
**Connection:** Connection pooling with automatic retry  
**Testing:** SQLite for development/testing  

#### **Core Models Implemented**

##### **1. Profile Model (`profiles` table)**
Extends Supabase auth.users with additional user information:

```python
class Profile:
    id: UUID                    # References auth.users(id)
    email: str                  # User email
    full_name: str             # Full name
    phone: str                 # Phone number
    role: UserRole             # User role (student, staff, admin, etc.)
    department: str            # Department name
    student_id: str            # Student ID (for students)
    employee_id: str           # Employee ID (for staff)
    is_active: bool            # Account status
    avatar_url: str            # Profile picture URL
    date_of_birth: date        # Date of birth
    address: str               # Physical address
    emergency_contact: str     # Emergency contact name
    emergency_phone: str       # Emergency contact phone
    timezone: str              # User timezone
    language: str              # Preferred language
    email_notifications: bool  # Email notification preference
```

**Supported Roles:**
- `student` - Student users
- `academic_staff` - Teachers and academic personnel
- `hr_personnel` - Human resources staff
- `finance_staff` - Financial management staff
- `marketing_team` - Marketing personnel
- `system_admin` - System administrators

##### **2. Academic Models**

**Course Model (`courses` table):**
```python
class Course:
    id: UUID
    course_code: str           # Unique course code (e.g., CS101)
    course_name: str           # Course name
    description: str           # Course description
    credits: int               # Credit hours (default: 3)
    department_id: UUID        # Foreign key to departments
    instructor_id: UUID        # Foreign key to profiles (instructor)
    semester: str              # Semester (Fall, Spring, Summer)
    academic_year: str         # Academic year (2024-2025)
    is_active: bool            # Course status
```

**Enrollment Model (`enrollments` table):**
```python
class Enrollment:
    id: UUID
    student_id: UUID           # Foreign key to profiles (student)
    course_id: UUID            # Foreign key to courses
    enrollment_date: date      # Date of enrollment
    status: str                # enrolled, completed, dropped, failed
    grade: str                 # Final grade (A, B, C, D, F)
    grade_points: decimal      # GPA points
```

**Attendance Model (`attendance` table):**
```python
class Attendance:
    id: UUID
    student_id: UUID           # Foreign key to profiles (student)
    course_id: UUID            # Foreign key to courses
    attendance_date: date      # Date of attendance
    status: str                # present, absent, late, excused
    notes: str                 # Additional notes
    recorded_by: UUID          # Foreign key to profiles (recorder)
```

**Grade Model (`grades` table):**
```python
class Grade:
    id: UUID
    user_id: UUID              # Foreign key to profiles (student)
    course_id: UUID            # Foreign key to courses
    assignment_id: UUID        # Reference to assignment
    grade: decimal             # Grade received
    max_grade: decimal         # Maximum possible grade
    feedback: str              # Instructor feedback
    graded_by: UUID            # Foreign key to profiles (grader)
```

##### **3. Finance Models**

**FeeStructure Model (`fee_structure` table):**
```python
class FeeStructure:
    id: UUID
    fee_type: str              # Type of fee (tuition, registration, etc.)
    amount: decimal            # Fee amount
    department_id: UUID        # Foreign key to departments
    academic_year: str         # Academic year
    semester: str              # Semester (optional)
    is_active: bool            # Fee status
```

**Invoice Model (`invoices` table):**
```python
class Invoice:
    id: UUID
    invoice_number: str        # Unique invoice number
    student_id: UUID           # Foreign key to profiles (student)
    amount: decimal            # Invoice amount
    due_date: date             # Payment due date
    status: str                # pending, paid, overdue, cancelled
    description: str           # Invoice description
    academic_year: str         # Academic year
    semester: str              # Semester
    created_by: UUID           # Foreign key to profiles (creator)
```

**Payment Model (`payments` table):**
```python
class Payment:
    id: UUID
    payment_reference: str     # Unique payment reference
    invoice_id: UUID           # Foreign key to invoices
    student_id: UUID           # Foreign key to profiles (student)
    amount: decimal            # Payment amount
    payment_method: str        # cash, bank_transfer, mobile_money, card, cheque
    payment_date: date         # Date of payment
    status: str                # pending, completed, failed, refunded
    notes: str                 # Payment notes
    processed_by: UUID         # Foreign key to profiles (processor)
```

##### **4. HR Models**

**Employee Model (`employees` table):**
```python
class Employee:
    id: UUID                   # References profiles(id)
    employee_number: str       # Unique employee number
    position: str              # Job position
    hire_date: date            # Date of hire
    salary: decimal            # Employee salary
    employment_type: str       # full_time, part_time, contract, intern
    manager_id: UUID           # Foreign key to profiles (manager)
    is_active: bool            # Employment status
```

**LeaveRequest Model (`leave_requests` table):**
```python
class LeaveRequest:
    id: UUID
    employee_id: UUID          # Foreign key to employees
    leave_type: str            # annual, sick, maternity, paternity, emergency, unpaid
    start_date: date           # Leave start date
    end_date: date             # Leave end date
    days_requested: int        # Number of days requested
    reason: str                # Reason for leave
    status: str                # pending, approved, rejected, cancelled
    approved_by: UUID          # Foreign key to profiles (approver)
    approved_at: datetime      # Approval timestamp
    comments: str              # Approval/rejection comments
```

##### **5. Marketing Models**

**Campaign Model (`campaigns` table):**
```python
class Campaign:
    id: UUID
    name: str                  # Campaign name
    description: str           # Campaign description
    campaign_type: str         # email, social_media, print, radio, tv, online, event
    start_date: date           # Campaign start date
    end_date: date             # Campaign end date
    budget: decimal            # Campaign budget
    target_audience: str       # Target audience description
    status: str                # draft, active, paused, completed, cancelled
    created_by: UUID           # Foreign key to profiles (creator)
```

**Lead Model (`leads` table):**
```python
class Lead:
    id: UUID
    first_name: str            # Lead's first name
    last_name: str             # Lead's last name
    email: str                 # Lead's email
    phone: str                 # Lead's phone
    source: str                # website, social_media, referral, advertisement, event, cold_call, other
    status: str                # new, contacted, qualified, converted, lost
    interest_level: str        # low, medium, high
    program_interest: str      # Program of interest
    notes: str                 # Additional notes
    assigned_to: UUID          # Foreign key to profiles (assigned user)
    converted_at: datetime     # Conversion timestamp
```

##### **6. System Models**

**Department Model (`departments` table):**
```python
class Department:
    id: UUID
    name: str                  # Department name
    code: str                  # Department code (unique)
    description: str           # Department description
    head_of_department: UUID   # Foreign key to profiles (department head)
    is_active: bool            # Department status
```

**SystemSetting Model (`system_settings` table):**
```python
class SystemSetting:
    id: UUID
    setting_key: str           # Unique setting key
    setting_value: str         # Setting value
    description: str           # Setting description
    category: str              # Setting category
    is_public: bool            # Whether setting is public
    updated_by: UUID           # Foreign key to profiles (updater)
```

**AuditLog Model (`audit_log` table):**
```python
class AuditLog:
    id: UUID
    table_name: str            # Table that was modified
    record_id: UUID            # ID of the modified record
    action: str                # INSERT, UPDATE, DELETE
    old_values: JSON           # Previous values
    new_values: JSON           # New values
    user_id: UUID              # Foreign key to profiles (user who made change)
    timestamp: datetime        # When the change occurred
```

**Attachment Model (`attachments` table):**
```python
class Attachment:
    id: UUID
    file_name: str             # Original file name
    file_url: str              # File storage URL
    file_type: str             # File MIME type
    file_size: int             # File size in bytes
    uploaded_by: UUID          # Foreign key to profiles (uploader)
    related_id: UUID           # ID of related record
    related_type: str          # Type of related record (polymorphic)
```

#### **Repository Pattern Implementation**

Each model has a corresponding repository class that provides clean data access methods:

**Base Repository:**
```python
class BaseRepository:
    def create(obj_in: Dict) -> Model
    def get(id: UUID) -> Optional[Model]
    def get_multi(skip: int, limit: int, filters: Dict) -> List[Model]
    def update(id: UUID, obj_in: Dict) -> Optional[Model]
    def delete(id: UUID) -> bool
    def count(filters: Dict) -> int
    def exists(id: UUID) -> bool
```

**Specialized Repositories:**
- `ProfileRepository` - User profile operations
- `AcademicRepository` - Course, enrollment, attendance, grade operations
- `FinanceRepository` - Invoice, payment, fee operations
- `HRRepository` - Employee, leave request operations
- `MarketingRepository` - Campaign, lead operations

#### **Database Features**

✅ **Automatic Timestamps** - All models have `created_at` and `updated_at`  
✅ **UUID Primary Keys** - All tables use UUID for better security  
✅ **Relationship Mapping** - Proper foreign key relationships  
✅ **Data Validation** - Pydantic schemas for input validation  
✅ **Connection Pooling** - Optimized database connections  
✅ **Migration Support** - Automatic table creation and updates  
✅ **Seed Data** - Default departments and system settings  
✅ **Comprehensive Testing** - Full test coverage for all models  

#### **Database Initialization**

The system automatically:
1. Creates all database tables on startup
2. Initializes default departments (CS, BA, ENG, MATH)
3. Sets up system settings (university name, academic year, etc.)
4. Validates all model relationships
5. Runs comprehensive tests

#### **Security Features**

🔒 **Row Level Security** - Supabase RLS policies enabled  
🔒 **Encrypted Connections** - All database connections use SSL/TLS  
🔒 **Input Validation** - All inputs validated through Pydantic schemas  
🔒 **Audit Logging** - All changes tracked in audit_log table  
🔒 **Role-Based Access** - Database access controlled by user roles  

---

## 📚 Additional Endpoints Available

The system also includes endpoints for:
- **Academic Management** (`/api/v1/academic/*`) - *Coming Next*
- **Financial Management** (`/api/v1/finance/*`) - *Planned*
- **HR Management** (`/api/v1/hr/*`) - *Planned*
- **Marketing Management** (`/api/v1/marketing/*`) - *Planned*
- **System Administration** (`/api/v1/admin/*`) - *Planned*

*Documentation for additional modules will be added as they are implemented and tested.*

---

## 🔄 Development Status

### ✅ **Completed Features (October 23-25, 2025)**

1. **Authentication System** ✅
   - User registration with role-based access
   - Secure login/logout functionality
   - Profile management and updates
   - JWT token-based authentication
   - Supabase integration

2. **Database Models & Repository Layer** ✅
   - Complete SQLAlchemy models for all modules
   - Repository pattern implementation
   - Database initialization and seeding
   - Comprehensive testing suite
   - Security and audit logging

3. **CI/CD Pipeline** ✅
   - GitGuardian secret scanning
   - Frontend and backend testing
   - Integration test suite
   - Automated deployment pipeline

### 🚧 **Next Development Phase**

**Academic Module Implementation** - *Starting Next*
- Course management APIs
- Enrollment system endpoints
- Attendance tracking APIs
- Grade management system
- Academic reporting features