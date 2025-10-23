"""
Test registration endpoint to verify datetime serialization fix
"""

import requests
import json

def test_registration():
    """Test the registration endpoint"""
    url = "http://localhost:8000/api/v1/auth/register"
    
    test_data = {
        "email": "test.student@gmail.com",
        "password": "SecurePass123",
        "full_name": "Test Student",
        "phone": "+1234567890",
        "role": "student",
        "student_id": "ICT2024001",
        "department": "Computer Science"
    }
    
    print("🧪 Testing Registration Endpoint")
    print("=" * 40)
    print(f"URL: {url}")
    print(f"Data: {json.dumps(test_data, indent=2)}")
    print()
    
    try:
        response = requests.post(
            url,
            json=test_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 200:
            print("✅ Registration successful!")
        else:
            print("❌ Registration failed")
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to server. Make sure it's running on port 8000")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_registration()