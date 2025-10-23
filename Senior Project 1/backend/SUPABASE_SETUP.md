# Supabase Setup Guide

## 📁 Where to Put Your Supabase Credentials

Your Supabase credentials should be placed in the `.env` file located at:
```
Senior Project 1/backend/.env
```

## 🔑 Required Credentials

You need to get these 4 credentials from your Supabase project:

### 1. SUPABASE_URL
- Go to your Supabase project dashboard
- Navigate to **Settings** → **API**
- Copy the **Project URL**
- Example: `https://abcdefghijklmnop.supabase.co`

### 2. SUPABASE_ANON_KEY
- In the same **Settings** → **API** page
- Copy the **anon public** key
- This is safe to use in frontend applications

### 3. SUPABASE_SERVICE_ROLE_KEY
- In the same **Settings** → **API** page
- Copy the **service_role secret** key
- ⚠️ **Keep this secret!** This has admin privileges

### 4. JWT_SECRET_KEY
- In **Settings** → **API** page
- Scroll down to **JWT Settings**
- Copy the **JWT Secret**

## 📝 Update Your .env File

Open `Senior Project 1/backend/.env` and update these lines:

```env
# Replace these with your actual Supabase credentials
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
JWT_SECRET_KEY=your_jwt_secret_here

# You can also customize these if needed
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DEBUG=True
ENVIRONMENT=development
API_V1_STR=/api/v1
BACKEND_CORS_ORIGINS=["http://localhost:3000", "http://127.0.0.1:3000"]
HOST=0.0.0.0
PORT=8000
```

## 🗄️ Optional: Create Profiles Table

If you want to store additional user information, create this table in your Supabase database:

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run this SQL command:

```sql
-- Create profiles table for extended user information
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'student',
  phone TEXT,
  department TEXT,
  student_id TEXT,
  employee_id TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Create policy for users to update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create policy for service role to manage all profiles
CREATE POLICY "Service role can manage all profiles" ON profiles
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
```

## 🔐 Security Notes

- **Never commit your `.env` file to git** (it's already in `.gitignore`)
- **Keep your service role key secret** - it has admin access to your database
- **The anon key is safe to use in frontend** - it has limited permissions
- **JWT secret is used to verify tokens** - keep it secure

## ✅ Verification

After setting up your credentials, you can verify the connection by:

1. Starting the backend server:
   ```bash
   cd "Senior Project 1/backend"
   python run.py
   ```

2. Visiting the health check endpoint:
   ```
   http://localhost:8000/health/detailed
   ```

3. You should see a response indicating Supabase connection status.

## 🆘 Troubleshooting

### "Invalid JWT" errors
- Check that your `JWT_SECRET_KEY` matches the one in Supabase Settings → API → JWT Settings

### "Invalid API key" errors
- Verify your `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are correct
- Make sure there are no extra spaces or characters

### Connection timeout errors
- Check that your `SUPABASE_URL` is correct and accessible
- Verify your internet connection

### "Table doesn't exist" errors
- The profiles table is optional - the auth system will work without it
- If you want extended user profiles, create the table using the SQL above