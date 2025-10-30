#!/usr/bin/env python3
"""
Simple server runner without multiprocessing reload.
Use this if you're having issues with the reload functionality.
"""
import uvicorn
import os
import sys

if __name__ == "__main__":
    # Ensure we're in the right directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    # Add the current directory to Python path
    sys.path.insert(0, os.getcwd())
    
    print("Starting School ERP Backend Server...")
    print("Server will be available at: http://localhost:8000")
    print("API documentation at: http://localhost:8000/docs")
    print("Press Ctrl+C to stop the server")
    print("-" * 50)
    
    # Run uvicorn without reload for stability
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=False,  # Disable reload to avoid subprocess issues
        log_level="info"
    )