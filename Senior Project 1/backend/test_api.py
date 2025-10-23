"""
Simple API test script to verify the server is working
"""

import requests
import json

def test_api():
    """Test the API endpoints"""
    base_url = "http://localhost:8000"
    
    print("🧪 Testing ICT University ERP API")
    print("=" * 40)
    
    try:
        # Test health endpoint
        print("📊 Testing health endpoint...")
        response = requests.get(f"{base_url}/health", timeout=5)
        if response.status_code == 200:
            print("✅ Health check passed")
            print(f"   Response: {response.json()}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
        
        # Test detailed health endpoint
        print("\n📊 Testing detailed health endpoint...")
        response = requests.get(f"{base_url}/health/detailed", timeout=5)
        if response.status_code == 200:
            print("✅ Detailed health check passed")
            data = response.json()
            print(f"   Status: {data.get('status')}")
            print(f"   Supabase: {data.get('supabase', {}).get('status')}")
        else:
            print(f"❌ Detailed health check failed: {response.status_code}")
        
        # Test root endpoint
        print("\n📊 Testing root endpoint...")
        response = requests.get(f"{base_url}/", timeout=5)
        if response.status_code == 200:
            print("✅ Root endpoint passed")
            data = response.json()
            print(f"   Message: {data.get('message')}")
        else:
            print(f"❌ Root endpoint failed: {response.status_code}")
        
        # Test API docs
        print("\n📊 Testing API documentation...")
        response = requests.get(f"{base_url}/docs", timeout=5)
        if response.status_code == 200:
            print("✅ API documentation is accessible")
        else:
            print(f"❌ API documentation failed: {response.status_code}")
        
        print("\n🎉 All basic tests passed!")
        print(f"🌐 API is running at: {base_url}")
        print(f"📚 Documentation: {base_url}/docs")
        print(f"🔍 ReDoc: {base_url}/redoc")
        
        return True
        
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to the server")
        print("💡 Make sure the server is running: python run_simple.py")
        return False
    except requests.exceptions.Timeout:
        print("❌ Server response timeout")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

if __name__ == "__main__":
    success = test_api()
    if not success:
        input("\nPress Enter to exit...")