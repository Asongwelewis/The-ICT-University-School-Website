"""
Debug script to test email validation and Supabase connection
"""

from pydantic import EmailStr, ValidationError
from supabase import create_client
import os
from dotenv import load_dotenv

def test_email_validation():
    """Test email validation with different formats"""
    print("🧪 Testing Email Validation")
    print("=" * 30)
    
    test_emails = [
        "student@ictuniversity.edu",
        "john.doe@gmail.com",
        "test@example.com",
        "user@test.org",
        "admin@company.com"
    ]
    
    for email in test_emails:
        try:
            validated_email = EmailStr(email)
            print(f"✅ {email} - Valid")
        except ValidationError as e:
            print(f"❌ {email} - Invalid: {e}")

def test_supabase_connection():
    """Test Supabase connection and auth"""
    print("\n🔗 Testing Supabase Connection")
    print("=" * 30)
    
    load_dotenv()
    
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_anon_key = os.getenv("SUPABASE_ANON_KEY")
    
    print(f"URL: {supabase_url}")
    print(f"Key: {supabase_anon_key[:20]}..." if supabase_anon_key else "No key found")
    
    try:
        supabase = create_client(supabase_url, supabase_anon_key)
        print("✅ Supabase client created successfully")
        
        # Test a simple query
        response = supabase.table("_health").select("*").limit(1).execute()
        print("✅ Supabase connection test completed")
        
    except Exception as e:
        print(f"❌ Supabase connection error: {e}")

def test_supabase_auth():
    """Test Supabase auth with a simple email"""
    print("\n🔐 Testing Supabase Auth")
    print("=" * 30)
    
    load_dotenv()
    
    try:
        from supabase import create_client
        
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_anon_key = os.getenv("SUPABASE_ANON_KEY")
        
        supabase = create_client(supabase_url, supabase_anon_key)
        
        # Try to register with a simple email
        test_email = "test@example.com"
        test_password = "TestPass123"
        
        print(f"Attempting to register: {test_email}")
        
        # This will help us see the exact error from Supabase
        response = supabase.auth.sign_up({
            "email": test_email,
            "password": test_password
        })
        
        if response.user:
            print("✅ Registration successful!")
            print(f"User ID: {response.user.id}")
        else:
            print("❌ Registration failed - no user returned")
            
    except Exception as e:
        print(f"❌ Supabase auth error: {e}")
        print(f"Error type: {type(e)}")

if __name__ == "__main__":
    test_email_validation()
    test_supabase_connection()
    test_supabase_auth()