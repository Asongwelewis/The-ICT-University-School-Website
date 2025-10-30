#!/usr/bin/env python3
"""
Simple server starter that uses the virtual environment directly.

This module provides a cross-platform server starter with proper error handling,
environment validation, and user-friendly feedback.
"""
import os
import sys
import subprocess
import platform
import logging
import json
from pathlib import Path
from typing import Tuple, Optional, Dict, Any
from dataclasses import dataclass, asdict


@dataclass
class ServerConfig:
    """Configuration for the server startup."""
    host: str = "0.0.0.0"
    port: int = 8000
    log_level: str = "info"
    app_module: str = "app.main:app"
    reload: bool = False
    workers: int = 1
    
    @classmethod
    def from_file(cls, config_path: Path) -> 'ServerConfig':
        """Load configuration from JSON file."""
        if not config_path.exists():
            return cls()
            
        try:
            with open(config_path, 'r') as f:
                config_data = json.load(f)
            return cls(**config_data)
        except (json.JSONDecodeError, TypeError) as e:
            logging.warning(f"Invalid config file {config_path}: {e}")
            return cls()
    
    def save_to_file(self, config_path: Path) -> None:
        """Save configuration to JSON file."""
        try:
            with open(config_path, 'w') as f:
                json.dump(asdict(self), f, indent=2)
        except Exception as e:
            logging.error(f"Failed to save config: {e}")


class VirtualEnvironmentManager:
    """Manages virtual environment detection and validation."""
    
    def __init__(self, backend_dir: Path):
        self.backend_dir = backend_dir
        self.is_windows = platform.system() == "Windows"
        
    def get_venv_paths(self) -> Tuple[Path, Path]:
        """Get platform-specific virtual environment paths."""
        if self.is_windows:
            scripts_dir = "Scripts"
            python_exe = "python.exe"
            uvicorn_exe = "uvicorn.exe"
        else:
            scripts_dir = "bin"
            python_exe = "python"
            uvicorn_exe = "uvicorn"
            
        venv_base = self.backend_dir / "venv" / scripts_dir
        return venv_base / python_exe, venv_base / uvicorn_exe
    
    def validate_environment(self) -> Tuple[bool, str, Optional[Path], Optional[Path]]:
        """
        Validate virtual environment setup.
        
        Returns:
            Tuple of (is_valid, error_message, python_path, uvicorn_path)
        """
        venv_python, venv_uvicorn = self.get_venv_paths()
        
        if not venv_python.exists():
            return False, "Virtual environment not found!", None, None
            
        if not venv_uvicorn.exists():
            return False, "Uvicorn not found in virtual environment!", venv_python, None
            
        return True, "", venv_python, venv_uvicorn


class ImportTester:
    """Handles testing of required imports."""
    
    @staticmethod
    def test_imports(python_path: Path, backend_dir: Path) -> Tuple[bool, str]:
        """
        Test if all required imports are available.
        
        Args:
            python_path: Path to Python executable
            backend_dir: Backend directory path
            
        Returns:
            Tuple of (success, error_message)
        """
        test_cmd = [
            str(python_path), "-c",
            "import sqlalchemy, fastapi, uvicorn; from app.main import app; print('✅ All imports successful')"
        ]
        
        try:
            result = subprocess.run(
                test_cmd, 
                capture_output=True, 
                text=True, 
                cwd=backend_dir,
                timeout=30  # Add timeout for safety
            )
            
            if result.returncode != 0:
                return False, f"Import test failed:\n{result.stderr}"
                
            return True, result.stdout.strip()
            
        except subprocess.TimeoutExpired:
            return False, "Import test timed out"
        except Exception as e:
            return False, f"Failed to test imports: {e}"


class ServerStarter:
    """Handles server startup and management."""
    
    def __init__(self, config: ServerConfig):
        self.config = config
        
    def start_server(self, uvicorn_path: Path, backend_dir: Path) -> int:
        """
        Start the uvicorn server.
        
        Args:
            uvicorn_path: Path to uvicorn executable
            backend_dir: Backend directory path
            
        Returns:
            Exit code (0 for success, 1 for error)
        """
        print("\n🌐 Starting server...")
        print("Server will be available at:")
        print(f"  • http://localhost:{self.config.port}")
        print(f"  • http://localhost:{self.config.port}/docs")
        print(f"  • http://localhost:{self.config.port}/redoc")
        print("\nPress Ctrl+C to stop")
        print("-" * 40)
        
        # Build uvicorn command
        cmd = [
            str(uvicorn_path),
            self.config.app_module,
            "--host", self.config.host,
            "--port", str(self.config.port),
            "--log-level", self.config.log_level
        ]
        
        # Add development options
        if self.config.reload:
            cmd.append("--reload")
            print("🔄 Auto-reload enabled (development mode)")
        
        if self.config.workers > 1:
            cmd.extend(["--workers", str(self.config.workers)])
            print(f"👥 Using {self.config.workers} workers")
        
        logger = logging.getLogger(__name__)
        logger.info(f"Starting server with command: {' '.join(cmd)}")
        
        try:
            subprocess.run(cmd, cwd=backend_dir, check=False)
            
        except KeyboardInterrupt:
            print("\n🛑 Server stopped")
            logger.info("Server stopped by user")
            return 0
        except Exception as e:
            print(f"\n❌ Server error: {e}")
            logger.error(f"Server error: {e}", exc_info=True)
            return 1
            
        return 0


def print_header():
    """Print application header."""
    print("🚀 School ERP Backend Server")
    print("=" * 40)


def print_error_instructions(error_type: str, python_path: Optional[Path] = None):
    """Print helpful error instructions based on error type."""
    if error_type == "venv_missing":
        print("❌ Virtual environment not found!")
        print("Create it with: python -m venv venv")
        print("Then install: pip install -r requirements.txt")
    elif error_type == "uvicorn_missing":
        print("❌ Uvicorn not found in virtual environment!")
        print("Install dependencies: pip install -r requirements.txt")
    elif error_type == "imports_failed":
        print("❌ Import test failed")
        print("\nTry installing dependencies:")
        if python_path and platform.system() == "Windows":
            print("venv\\Scripts\\pip.exe install -r requirements.txt")
        else:
            print("venv/bin/pip install -r requirements.txt")


def setup_logging(backend_dir: Path) -> None:
    """Setup logging configuration."""
    log_dir = backend_dir / "logs"
    log_dir.mkdir(exist_ok=True)
    
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler(log_dir / "server_starter.log"),
            logging.StreamHandler(sys.stdout)
        ]
    )


def show_help() -> None:
    """Show help information."""
    help_text = """
School ERP Backend Server Starter

Usage: python start_simple.py [OPTIONS]

Options:
  --dev          Enable development mode (auto-reload, debug logging)
  --port PORT    Set server port (default: 8000)
  --help, -h     Show this help message

Configuration:
  Create server_config.json to customize server settings.
  See server_config.json.example for available options.

Examples:
  python start_simple.py                    # Start with default settings
  python start_simple.py --dev             # Start in development mode
  python start_simple.py --port 9000       # Start on port 9000
    """
    print(help_text)


def parse_arguments() -> Dict[str, Any]:
    """Parse command line arguments (simple implementation)."""
    if "--help" in sys.argv or "-h" in sys.argv:
        show_help()
        sys.exit(0)
    
    args = {}
    
    # Simple argument parsing - could be enhanced with argparse
    if "--dev" in sys.argv:
        args["reload"] = True
        args["log_level"] = "debug"
    
    if "--port" in sys.argv:
        try:
            port_index = sys.argv.index("--port") + 1
            args["port"] = int(sys.argv[port_index])
        except (ValueError, IndexError):
            logging.warning("Invalid port argument, using default")
    
    return args


def main() -> int:
    """
    Main entry point for the server starter.
    
    Returns:
        Exit code (0 for success, 1 for error)
    """
    print_header()
    
    # Setup environment
    backend_dir = Path(__file__).parent.absolute()
    os.chdir(backend_dir)
    
    # Setup logging
    setup_logging(backend_dir)
    logger = logging.getLogger(__name__)
    
    try:
        # Load configuration
        config_path = backend_dir / "server_config.json"
        config = ServerConfig.from_file(config_path)
        
        # Override with command line arguments
        cli_args = parse_arguments()
        for key, value in cli_args.items():
            if hasattr(config, key):
                setattr(config, key, value)
        
        logger.info(f"Starting server with config: {asdict(config)}")
        
        # Initialize managers
        venv_manager = VirtualEnvironmentManager(backend_dir)
        
        # Validate virtual environment
        is_valid, error_msg, venv_python, venv_uvicorn = venv_manager.validate_environment()
        
        if not is_valid:
            if venv_python is None:
                print_error_instructions("venv_missing")
            else:
                print_error_instructions("uvicorn_missing")
            return 1
        
        print(f"✅ Using virtual environment: {venv_python}")
        logger.info(f"Virtual environment validated: {venv_python}")
        
        # Test imports
        print("\n🔍 Testing imports...")
        import_success, import_result = ImportTester.test_imports(venv_python, backend_dir)
        
        if not import_success:
            print_error_instructions("imports_failed", venv_python)
            print(f"\nError details: {import_result}")
            logger.error(f"Import test failed: {import_result}")
            return 1
            
        print(import_result)
        logger.info("Import test successful")
        
        # Start server
        server_starter = ServerStarter(config)
        return server_starter.start_server(venv_uvicorn, backend_dir)
        
    except Exception as e:
        logger.error(f"Unexpected error in main: {e}", exc_info=True)
        print(f"\n❌ Unexpected error: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())