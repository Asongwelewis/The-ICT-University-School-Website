#!/usr/bin/env python3
"""
Development server starter for School ERP Backend.

This module provides a robust development server manager that handles
environment validation, dependency checking, and server startup with
proper error handling and configuration management.
"""
import os
import sys
import logging
from dataclasses import dataclass
from pathlib import Path
from typing import Optional, Tuple, List, Protocol
from enum import Enum


class LogLevel(Enum):
    """Available logging levels."""
    DEBUG = "DEBUG"
    INFO = "INFO"
    WARNING = "WARNING"
    ERROR = "ERROR"


@dataclass
class ServerConfig:
    """Development server configuration."""
    host: str = "0.0.0.0"
    port: int = 8000
    reload: bool = False
    log_level: str = "info"
    access_log: bool = True
    
    @classmethod
    def from_env(cls) -> 'ServerConfig':
        """Create configuration from environment variables."""
        return cls(
            host=os.getenv('DEV_HOST', cls.host),
            port=int(os.getenv('DEV_PORT', cls.port)),
            reload=os.getenv('DEV_RELOAD', 'false').lower() == 'true',
            log_level=os.getenv('DEV_LOG_LEVEL', cls.log_level),
            access_log=os.getenv('DEV_ACCESS_LOG', 'true').lower() == 'true'
        )


class ServerRunner(Protocol):
    """Protocol for server runners."""
    
    def run(self, app_module: str, **kwargs) -> None:
        """Run the server with given configuration."""
        ...


class UvicornRunner:
    """Uvicorn server runner implementation."""
    
    def run(self, app_module: str, **kwargs) -> None:
        """Run server using uvicorn."""
        import uvicorn
        uvicorn.run(app_module, **kwargs)


class DevServerLogger:
    """Custom logger for development server with emoji support."""
    
    def __init__(self, level: LogLevel = LogLevel.INFO):
        """Initialize logger with specified level."""
        self.logger = logging.getLogger("dev_server")
        self.logger.setLevel(getattr(logging, level.value))
        
        if not self.logger.handlers:
            handler = logging.StreamHandler()
            formatter = logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
            )
            handler.setFormatter(formatter)
            self.logger.addHandler(handler)
    
    def info(self, message: str, emoji: str = "ℹ️") -> None:
        """Log info message with emoji."""
        print(f"{emoji} {message}")
    
    def success(self, message: str) -> None:
        """Log success message."""
        print(f"✅ {message}")
    
    def warning(self, message: str) -> None:
        """Log warning message."""
        print(f"⚠️ {message}")
    
    def error(self, message: str) -> None:
        """Log error message."""
        print(f"❌ {message}")
    
    def header(self, message: str) -> None:
        """Log header message."""
        print(f"🚀 {message}")
    
    def separator(self, char: str = "=", length: int = 50) -> None:
        """Print separator line."""
        print(char * length)


class DevServerManager:
    """
    Manages development server startup, validation, and configuration.
    
    This class encapsulates all the logic needed to start a FastAPI development
    server with proper environment validation and error handling.
    """
    
    def __init__(
        self, 
        config: Optional[ServerConfig] = None,
        server_runner: Optional[ServerRunner] = None,
        logger: Optional[DevServerLogger] = None
    ) -> None:
        """
        Initialize the development server manager.
        
        Args:
            config: Optional server configuration. If None, loads from environment.
            server_runner: Optional server runner. If None, uses UvicornRunner.
            logger: Optional logger. If None, creates default logger.
        """
        self.script_dir: Path = Path(__file__).parent.absolute()
        self.config: ServerConfig = config or ServerConfig.from_env()
        self.server_runner: ServerRunner = server_runner or UvicornRunner()
        self.logger: DevServerLogger = logger or DevServerLogger()
    
    def validate_environment(self) -> Tuple[bool, List[str]]:
        """
        Validate the development environment.
        
        Returns:
            Tuple of (is_valid, error_messages)
        """
        errors: List[str] = []
        
        # Change to script directory
        os.chdir(self.script_dir)
        self.logger.info(f"Working directory: {self.script_dir}", "📁")
        
        # Check virtual environment
        if not self._check_virtual_env():
            # This is a warning, not an error
            pass
        
        # Check dependencies
        if not self._check_dependencies():
            errors.append("Required dependencies missing")
        
        # Test app import
        if not self._test_app_import():
            errors.append("FastAPI application cannot be imported")
        
        return len(errors) == 0, errors
    
    def _check_virtual_env(self) -> bool:
        """Check if virtual environment is active."""
        is_venv = (
            hasattr(sys, 'real_prefix') or 
            (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix)
        )
        
        if is_venv:
            self.logger.success("Virtual environment detected")
        else:
            self.logger.warning("Virtual environment not detected - make sure to activate it!")
        
        return is_venv
    
    def _check_dependencies(self) -> bool:
        """Check if required dependencies are installed."""
        required_packages = ['sqlalchemy', 'fastapi', 'uvicorn']
        
        try:
            import sqlalchemy
            import fastapi
            import uvicorn
            
            self.logger.success(f"Dependencies OK (SQLAlchemy: {sqlalchemy.__version__})")
            return True
        except ImportError as e:
            self.logger.error(f"Missing dependency: {e}")
            self.logger.info("Run: pip install -r requirements.txt")
            return False
    
    def _test_app_import(self) -> bool:
        """Test if the FastAPI app can be imported."""
        try:
            from app.main import app
            self.logger.success("App import successful")
            return True
        except Exception as e:
            self.logger.error(f"App import failed: {e}")
            return False
    
    def _print_startup_info(self) -> None:
        """Print server startup information."""
        print("\n🌐 Server will be available at:")
        print(f"   • http://localhost:{self.config.port}")
        print(f"   • http://localhost:{self.config.port}/docs (API documentation)")
        print(f"   • http://localhost:{self.config.port}/health (Health check)")
        
        if not self.config.reload:
            print("\n⚡ Starting server without reload (stable mode)...")
            print("   Note: Restart manually after code changes")
        else:
            print("\n⚡ Starting server with auto-reload...")
            print("   Note: Server will restart automatically on code changes")
        
        print("   Press Ctrl+C to stop")
        print("-" * 50)
    
    def _run_server(self) -> int:
        """Run the server with current configuration."""
        self._print_startup_info()
        
        try:
            self.server_runner.run(
                "app.main:app",
                host=self.config.host,
                port=self.config.port,
                reload=self.config.reload,
                log_level=self.config.log_level,
                access_log=self.config.access_log
            )
            return 0
        except KeyboardInterrupt:
            self.logger.info("Server stopped by user", "🛑")
            return 0
        except Exception as e:
            self.logger.error(f"Server error: {e}")
            return 1
    
    def start_server(self) -> int:
        """
        Start the development server with full validation.
        
        Returns:
            Exit code (0 for success, 1 for error)
        """
        # Validate environment
        is_valid, errors = self.validate_environment()
        
        if not is_valid:
            self.logger.error("Environment validation failed:")
            for error in errors:
                self.logger.error(f"  - {error}")
            return 1
        
        # Start server
        return self._run_server()


def main() -> int:
    """
    Entry point for the development server.
    
    Returns:
        Exit code (0 for success, 1 for error)
    """
    logger = DevServerLogger()
    logger.header("Starting School ERP Backend Server...")
    logger.separator()
    
    try:
        server_manager = DevServerManager()
        return server_manager.start_server()
    except Exception as e:
        logger.error(f"Failed to start server: {e}")
        return 1


if __name__ == "__main__":
    sys.exit(main())