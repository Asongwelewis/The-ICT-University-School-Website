"""
Development server runner for ICT University ERP System

This script starts the FastAPI development server with proper configuration.
Use this for local development and testing.
"""

if __name__ == "__main__":
    try:
        import multiprocessing
        multiprocessing.freeze_support()
        
        import uvicorn
        import os
        from dotenv import load_dotenv
        
        # Load environment variables
        load_dotenv()
        
        # Import settings after loading env vars
        from app.core.config import settings
        
        print("🎓 Starting ICT University ERP System Backend...")
        print(f"📍 Environment: {settings.ENVIRONMENT}")
        print(f"🔧 Debug Mode: {settings.DEBUG}")
        print(f"🌐 Server: http://{settings.HOST}:{settings.PORT}")
        print(f"📚 API Docs: http://{settings.HOST}:{settings.PORT}/docs")
        print("=" * 50)
        
        # Run the server (disable reload to avoid multiprocessing issues on Windows)
        uvicorn.run(
            "app.main:app",
            host=settings.HOST,
            port=settings.PORT,
            reload=False,  # Disabled for Windows compatibility
            log_level="info" if settings.DEBUG else "warning",
            access_log=settings.DEBUG,
        )
        
    except ImportError as e:
        print("❌ Missing required packages!")
        print(f"Error: {e}")
        print("\n🔧 Please install the required packages:")
        print("1. Run: install_packages.bat")
        print("2. Or manually run: pip install fastapi uvicorn python-dotenv")
        print("\n📦 Make sure your virtual environment is activated:")
        print("   venv\\Scripts\\activate")
        input("\nPress Enter to exit...")
        
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        print("\n🔍 Troubleshooting:")
        print("1. Check that all packages are installed")
        print("2. Verify your .env file has correct Supabase credentials")
        print("3. Make sure virtual environment is activated")
        input("\nPress Enter to exit...")