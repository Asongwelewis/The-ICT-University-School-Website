#!/usr/bin/env python3
"""
Server runner with proper environment variable handling.
This addresses the multiprocessing + virtual environment issue on Windows.
"""
import uvicorn
import os
import sys
import multiprocessing

def run_server():
    """Run the uvicorn server with proper environment setup."""
    # Ensure we're in the right directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    # Add the current directory to Python path
    sys.path.insert(0, os.getcwd())
    
    # Set environment variables for multiprocessing
    os.environ["PYTHONPATH"] = os.getcwd()
    
    print("Starting School ERP Backend Server...")
    print("Server will be available at: http://localhost:8000")
    print("API documentation at: http://localhost:8000/docs")
    print("Press Ctrl+C to stop the server")
    print("-" * 50)
    
    # Run uvicorn with watchfiles instead of StatReload
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        reload_dirs=["app"],
        log_level="info",
        use_colors=True,
        reload_excludes=["*.pyc", "__pycache__"]
    )

if __name__ == "__main__":
    # Set multiprocessing start method for Windows compatibility
    if sys.platform.startswith('win'):
        multiprocessing.set_start_method('spawn', force=True)
    
    run_server()