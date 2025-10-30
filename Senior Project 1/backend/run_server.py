#!/usr/bin/env python3
"""
Development server startup script.
This script ensures proper virtual environment handling for uvicorn reload.
"""
import uvicorn
import os
import sys
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def setup_environment():
    """Setup the Python environment for the server."""
    try:
        # Ensure we're in the right directory
        script_dir = Path(__file__).parent.absolute()
        os.chdir(script_dir)
        logger.info(f"Changed working directory to: {script_dir}")
        
        # Add the current directory to Python path if not already present
        current_dir = str(script_dir)
        if current_dir not in sys.path:
            sys.path.insert(0, current_dir)
            logger.info(f"Added {current_dir} to Python path")
            
        return True
    except Exception as e:
        logger.error(f"Failed to setup environment: {e}")
        return False

def validate_app_structure():
    """Validate that the required app structure exists."""
    app_dir = Path("app")
    main_file = app_dir / "main.py"
    
    if not app_dir.exists():
        logger.error("App directory not found. Please ensure you're in the correct project directory.")
        return False
        
    if not main_file.exists():
        logger.error("app/main.py not found. Please ensure the FastAPI app is properly structured.")
        return False
        
    logger.info("App structure validation passed")
    return True

def get_server_config():
    """Get server configuration from environment variables with defaults."""
    config = {
        "app": "app.main:app",
        "host": os.getenv("HOST", "0.0.0.0"),
        "port": int(os.getenv("PORT", "8000")),
        "reload": os.getenv("ENVIRONMENT", "development") == "development",
        "reload_dirs": ["app"],
        "log_level": os.getenv("LOG_LEVEL", "info").lower()
    }
    
    # Validate port
    if not (1 <= config["port"] <= 65535):
        logger.warning(f"Invalid port {config['port']}, using default 8000")
        config["port"] = 8000
    
    return config

def check_port_availability(port: int) -> bool:
    """Check if the specified port is available."""
    import socket
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            sock.bind(('localhost', port))
            return True
    except OSError:
        return False

def main():
    """Main entry point for the development server."""
    try:
        logger.info("🚀 Starting School ERP Development Server...")
        
        # Setup environment
        if not setup_environment():
            logger.error("❌ Environment setup failed")
            sys.exit(1)
            
        # Validate app structure
        if not validate_app_structure():
            logger.error("❌ App structure validation failed")
            sys.exit(1)
            
        # Get configuration
        config = get_server_config()
        
        # Check port availability
        if not check_port_availability(config["port"]):
            logger.warning(f"⚠️  Port {config['port']} is already in use")
            logger.info("The server will attempt to start anyway (uvicorn may find an alternative port)")
        
        logger.info(f"📋 Server configuration:")
        logger.info(f"   • Host: {config['host']}")
        logger.info(f"   • Port: {config['port']}")
        logger.info(f"   • Reload: {config['reload']}")
        logger.info(f"   • Log Level: {config['log_level']}")
        
        # Start the server
        logger.info("🌟 Starting uvicorn server...")
        uvicorn.run(**config)
        
    except KeyboardInterrupt:
        logger.info("🛑 Server shutdown requested by user")
    except ValueError as e:
        logger.error(f"❌ Configuration error: {e}")
        sys.exit(1)
    except Exception as e:
        logger.error(f"❌ Failed to start server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()