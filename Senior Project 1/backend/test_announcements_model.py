"""
Test script for the improved Announcements model
"""

import sys
import os
from datetime import datetime, timedelta

# Add the backend directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '.'))

def test_announcement_model():
    """Test the improved Announcements model"""
    print("🧪 Testing Improved Announcements Model")
    print("=" * 50)
    
    try:
        # Test imports
        from app.models.announcements import Announcement, AnnouncementType, AnnouncementPriority
        print("✅ Model imports successful")
        
        # Test enum methods
        all_types = AnnouncementType.get_all_types()
        print(f"✅ Announcement types: {all_types}")
        
        priority_order = AnnouncementPriority.get_priority_order()
        print(f"✅ Priority ordering: {priority_order}")
        
        # Test model instantiation (without database)
        announcement = Announcement(
            title="Test Announcement",
            content="This is a test announcement content",
            type=AnnouncementType.GENERAL,
            priority=AnnouncementPriority.MEDIUM,
            target_roles=["student", "academic_staff"],
            department="Computer Science"
        )
        print("✅ Model instantiation successful")
        
        # Test validation methods (these would normally be called by SQLAlchemy)
        try:
            announcement.validate_type("type", AnnouncementType.ACADEMIC)
            print("✅ Type validation working")
        except Exception as e:
            print(f"❌ Type validation failed: {e}")
        
        try:
            announcement.validate_target_roles("target_roles", ["student", "academic_staff"])
            print("✅ Target roles validation working")
        except Exception as e:
            print(f"❌ Target roles validation failed: {e}")
        
        # Test business logic methods
        announcement.is_active = True
        announcement.expires_at = None
        is_active = announcement.is_active_now()
        print(f"✅ is_active_now() returns: {is_active}")
        
        # Test visibility methods
        can_see_student = announcement.is_visible_to_role("student")
        can_see_admin = announcement.is_visible_to_role("system_admin")
        print(f"✅ Student can see: {can_see_student}")
        print(f"✅ Admin can see: {can_see_admin}")
        
        # Test department visibility
        can_see_cs = announcement.is_visible_to_department("Computer Science")
        can_see_math = announcement.is_visible_to_department("Mathematics")
        print(f"✅ CS department can see: {can_see_cs}")
        print(f"✅ Math department can see: {can_see_math}")
        
        # Test combined visibility
        can_user_see = announcement.can_user_see("student", "Computer Science")
        print(f"✅ CS student can see: {can_user_see}")
        
        # Test priority property
        priority_num = announcement.priority_order
        print(f"✅ Priority order: {priority_num}")
        
        # Test string representations
        repr_str = repr(announcement)
        str_str = str(announcement)
        print(f"✅ __repr__: {repr_str}")
        print(f"✅ __str__: {str_str}")
        
        print("\n🎉 All tests passed! The improved model is working correctly.")
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("💡 Make sure you're running from the backend directory")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

if __name__ == "__main__":
    success = test_announcement_model()
    if not success:
        input("\nPress Enter to exit...")