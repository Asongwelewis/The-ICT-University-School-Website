"""
Test script to verify that all required packages are installed correctly
"""

def test_imports():
    """Test importing all required packages"""
    print("🧪 Testing package imports...")
    
    try:
        import fastapi
        print("✅ FastAPI imported successfully")
    except ImportError as e:
        print(f"❌ FastAPI import failed: {e}")
        return False
    
    try:
        import uvicorn
        print("✅ Uvicorn imported successfully")
    except ImportError as e:
        print(f"❌ Uvicorn import failed: {e}")
        return False
    
    try:
        from dotenv import load_dotenv
        print("✅ python-dotenv imported successfully")
    except ImportError as e:
        print(f"❌ python-dotenv import failed: {e}")
        return False
    
    try:
        import pydantic
        print("✅ Pydantic imported successfully")
    except ImportError as e:
        print(f"❌ Pydantic import failed: {e}")
        return False
    
    try:
        from pydantic_settings import BaseSettings
        print("✅ Pydantic Settings imported successfully")
    except ImportError as e:
        print(f"❌ Pydantic Settings import failed: {e}")
        return False
    
    try:
        import httpx
        print("✅ HTTPX imported successfully")
    except ImportError as e:
        print(f"❌ HTTPX import failed: {e}")
        return False
    
    try:
        from jose import jwt
        print("✅ python-jose imported successfully")
    except ImportError as e:
        print(f"❌ python-jose import failed: {e}")
        return False
    
    try:
        from supabase import create_client
        print("✅ Supabase client imported successfully")
    except ImportError as e:
        print(f"❌ Supabase client import failed: {e}")
        return False
    
    return True

def test_app_imports():
    """Test importing our app modules"""
    print("\n🏗️ Testing app module imports...")
    
    try:
        from app.core.config import settings
        print("✅ App config imported successfully")
    except ImportError as e:
        print(f"❌ App config import failed: {e}")
        return False
    
    try:
        from app.core.security import get_current_user
        print("✅ App security imported successfully")
    except ImportError as e:
        print(f"❌ App security import failed: {e}")
        return False
    
    try:
        from app.main import app
        print("✅ FastAPI app imported successfully")
    except ImportError as e:
        print(f"❌ FastAPI app import failed: {e}")
        return False
    
    return True

def main():
    """Main test function"""
    print("🎓 ICT University ERP System - Installation Test")
    print("=" * 50)
    
    # Test package imports
    packages_ok = test_imports()
    
    if not packages_ok:
        print("\n❌ Some packages are missing!")
        print("🔧 Please run: install_packages.bat")
        return False
    
    # Test app imports
    app_ok = test_app_imports()
    
    if not app_ok:
        print("\n❌ App modules have issues!")
        print("🔍 Check your .env file and app configuration")
        return False
    
    print("\n🎉 All tests passed!")
    print("✅ Installation is complete and working")
    print("🚀 You can now run: python run.py")
    
    return True

if __name__ == "__main__":
    try:
        success = main()
        if not success:
            input("\nPress Enter to exit...")
    except Exception as e:
        print(f"\n💥 Unexpected error: {e}")
        print("🔧 Please check your Python environment and try again")
        input("\nPress Enter to exit...")