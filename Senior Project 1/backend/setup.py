"""
Setup script for ICT University ERP System Backend

This script helps set up the development environment:
- Creates virtual environment
- Installs dependencies
- Sets up environment variables
"""

import os
import sys
import subprocess
import shutil
from pathlib import Path

def run_command(command, description):
    """Run a shell command and handle errors"""
    print(f"📦 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed: {e}")
        print(f"Error output: {e.stderr}")
        return False

def main():
    """Main setup function"""
    print("🎓 ICT University ERP System - Backend Setup")
    print("=" * 50)
    
    # Check if Python is available
    try:
        python_version = subprocess.check_output([sys.executable, "--version"], text=True).strip()
        print(f"🐍 Using {python_version}")
    except Exception as e:
        print(f"❌ Python not found: {e}")
        return False
    
    # Check if we're in the right directory
    if not Path("requirements.txt").exists():
        print("❌ requirements.txt not found. Please run this script from the backend directory.")
        return False
    
    # Create virtual environment if it doesn't exist
    venv_path = Path("venv")
    if not venv_path.exists():
        if not run_command(f"{sys.executable} -m venv venv", "Creating virtual environment"):
            return False
    else:
        print("✅ Virtual environment already exists")
    
    # Determine activation script based on OS
    if os.name == 'nt':  # Windows
        activate_script = "venv\\Scripts\\activate"
        pip_command = "venv\\Scripts\\pip"
    else:  # Unix/Linux/macOS
        activate_script = "source venv/bin/activate"
        pip_command = "venv/bin/pip"
    
    # Install dependencies
    if not run_command(f"{pip_command} install --upgrade pip", "Upgrading pip"):
        return False
    
    if not run_command(f"{pip_command} install -r requirements.txt", "Installing dependencies"):
        return False
    
    # Check if .env file exists
    env_file = Path(".env")
    if not env_file.exists():
        print("📝 Creating .env file from template...")
        try:
            shutil.copy(".env.example", ".env")
            print("✅ .env file created successfully")
            print("⚠️  Please update the .env file with your Supabase credentials")
        except FileNotFoundError:
            print("⚠️  .env.example not found, .env file already exists or needs to be created manually")
    else:
        print("✅ .env file already exists")
    
    print("\n" + "=" * 50)
    print("🎉 Setup completed successfully!")
    print("\nNext steps:")
    print("1. Update the .env file with your Supabase credentials:")
    print("   - SUPABASE_URL")
    print("   - SUPABASE_ANON_KEY") 
    print("   - SUPABASE_SERVICE_ROLE_KEY")
    print("   - JWT_SECRET_KEY")
    print("\n2. Activate the virtual environment:")
    if os.name == 'nt':
        print("   venv\\Scripts\\activate")
    else:
        print("   source venv/bin/activate")
    print("\n3. Run the development server:")
    print("   python run.py")
    print("   or")
    print("   uvicorn app.main:app --reload")
    print("\n4. Visit http://localhost:8000/docs for API documentation")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)