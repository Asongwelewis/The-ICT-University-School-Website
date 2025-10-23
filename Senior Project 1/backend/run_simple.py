"""
Simple server runner without reload (Windows-friendly)
"""

if __name__ == "__main__":
    import os
    import sys
    
    # Add the current directory to Python path
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    
    try:
        from dotenv import load_dotenv
        load_dotenv()
        
        import uvicorn
        
        print("🎓 ICT University ERP System - Simple Start")
        print("🌐 Server will be available at: http://localhost:8000")
        print("📚 API Documentation: http://localhost:8000/docs")
        print("=" * 50)
        
        # Simple uvicorn run without reload
        uvicorn.run(
            "app.main:app",
            host="0.0.0.0",
            port=8000,
            reload=False,
            log_level="info"
        )
        
    except Exception as e:
        print(f"❌ Error: {e}")
        input("Press Enter to exit...")