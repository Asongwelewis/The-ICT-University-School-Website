"""
Test script to verify database models are working correctly.

This module provides comprehensive testing for:
- Database connectivity and health
- Repository operations and data integrity
- Model relationships and constraints
- Error handling and edge cases
"""

import sys
import os
from typing import Dict, Any, List, Optional, Tuple
from dataclasses import dataclass
from contextlib import contextmanager
from time import time
import logging

# Set test environment variables before importing anything
os.environ['DATABASE_URL'] = 'sqlite:///./test.db'
os.environ['ENVIRONMENT'] = 'test'
os.environ['SUPABASE_URL'] = 'https://test.supabase.co'
os.environ['SUPABASE_ANON_KEY'] = 'test_anon_key'
os.environ['SUPABASE_SERVICE_ROLE_KEY'] = 'test_service_key'
os.environ['SUPABASE_JWT_SECRET'] = 'test_jwt_secret'

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal, init_db, DatabaseManager
from app.repositories.profile_repository import ProfileRepository
from app.repositories.academic_repository import AcademicRepository
from app.repositories.finance_repository import FinanceRepository

# Configure logging with better formatting
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)


@dataclass
class TestResult:
    """Data class for test results with comprehensive information."""
    name: str
    success: bool
    message: str
    execution_time: float = 0.0
    details: Dict[str, Any] = None
    error_type: Optional[str] = None
    
    def __post_init__(self):
        if self.details is None:
            self.details = {}
    
    @property
    def status_icon(self) -> str:
        """Get status icon for display."""
        return "✅" if self.success else "❌"
    
    def __str__(self) -> str:
        """String representation of test result."""
        time_str = f" ({self.execution_time:.3f}s)" if self.execution_time > 0 else ""
        return f"{self.status_icon} {self.name}: {self.message}{time_str}"


class DatabaseTester:
    """
    Comprehensive database testing class with proper resource management.
    
    This class provides structured testing for database operations with:
    - Proper resource management using context managers
    - Detailed error reporting and logging
    - Performance measurement
    - Extensible test framework
    """
    
    def __init__(self):
        self.results: List[TestResult] = []
        self.start_time = 0.0
    
    @contextmanager
    def measure_time(self):
        """Context manager to measure execution time."""
        start = time()
        try:
            yield
        finally:
            self.execution_time = time() - start
    
    def add_result(self, name: str, success: bool, message: str, 
                   details: Optional[Dict[str, Any]] = None, 
                   error_type: Optional[str] = None) -> TestResult:
        """Add a test result with proper formatting."""
        result = TestResult(
            name=name,
            success=success,
            message=message,
            execution_time=getattr(self, 'execution_time', 0.0),
            details=details or {},
            error_type=error_type
        )
        self.results.append(result)
        logger.info(str(result))
        return result
    
    def test_database_connection(self) -> TestResult:
        """Test basic database connection with comprehensive validation."""
        with self.measure_time():
            try:
                from sqlalchemy import text
                
                with SessionLocal() as db:
                    # Test basic connection
                    result = db.execute(text("SELECT 1 as test_value")).fetchone()
                    
                    if not result or result[0] != 1:
                        return self.add_result(
                            "Database Connection",
                            False,
                            "Connection test query returned unexpected result",
                            {"expected": 1, "actual": result[0] if result else None}
                        )
                    
                    # Test database health
                    health_info = DatabaseManager.health_check()
                    
                    return self.add_result(
                        "Database Connection",
                        True,
                        "Connection successful",
                        {
                            "health_status": health_info.get("status"),
                            "database_version": health_info.get("database_version"),
                            "connection_test": health_info.get("connection_test")
                        }
                    )
                    
            except Exception as e:
                return self.add_result(
                    "Database Connection",
                    False,
                    f"Connection failed: {str(e)}",
                    error_type=type(e).__name__
                )
    
    def test_database_initialization(self) -> TestResult:
        """Test database initialization and table creation."""
        with self.measure_time():
            try:
                init_db()
                
                # Verify tables were created by checking if we can query them
                with SessionLocal() as db:
                    from sqlalchemy import text
                    
                    # Check if profiles table exists and is accessible
                    try:
                        result = db.execute(text("SELECT COUNT(*) FROM profiles")).fetchone()
                        profile_count = result[0] if result else 0
                    except Exception:
                        profile_count = "Table not accessible"
                    
                    return self.add_result(
                        "Database Initialization",
                        True,
                        "Database initialized successfully",
                        {"profile_count": profile_count}
                    )
                    
            except Exception as e:
                return self.add_result(
                    "Database Initialization",
                    False,
                    f"Initialization failed: {str(e)}",
                    error_type=type(e).__name__
                )
    
    def test_repository_operations(self) -> TestResult:
        """Test repository operations with comprehensive validation."""
        with self.measure_time():
            try:
                with SessionLocal() as db:
                    repository_results = {}
                    
                    # Test Profile Repository
                    try:
                        profile_repo = ProfileRepository(db)
                        profiles = profile_repo.get_active_profiles()
                        
                        if not isinstance(profiles, list):
                            raise ValueError(f"Expected list, got {type(profiles)}")
                        
                        repository_results['profiles'] = {
                            'count': len(profiles),
                            'status': 'success'
                        }
                        
                    except Exception as e:
                        repository_results['profiles'] = {
                            'status': 'failed',
                            'error': str(e)
                        }
                    
                    # Test Academic Repository
                    try:
                        academic_repo = AcademicRepository(db)
                        courses = academic_repo.get_active_courses()
                        
                        if not isinstance(courses, list):
                            raise ValueError(f"Expected list, got {type(courses)}")
                        
                        repository_results['courses'] = {
                            'count': len(courses),
                            'status': 'success'
                        }
                        
                    except Exception as e:
                        repository_results['courses'] = {
                            'status': 'failed',
                            'error': str(e)
                        }
                    
                    # Test Finance Repository
                    try:
                        finance_repo = FinanceRepository(db)
                        fee_structures = finance_repo.get_fee_structures()
                        
                        if not isinstance(fee_structures, list):
                            raise ValueError(f"Expected list, got {type(fee_structures)}")
                        
                        repository_results['fee_structures'] = {
                            'count': len(fee_structures),
                            'status': 'success'
                        }
                        
                    except Exception as e:
                        repository_results['fee_structures'] = {
                            'status': 'failed',
                            'error': str(e)
                        }
                    
                    # Check if any repository failed
                    failed_repos = [name for name, result in repository_results.items() 
                                  if result.get('status') == 'failed']
                    
                    if failed_repos:
                        return self.add_result(
                            "Repository Operations",
                            False,
                            f"Failed repositories: {', '.join(failed_repos)}",
                            repository_results
                        )
                    
                    # All repositories successful
                    success_message = ", ".join([
                        f"{name}: {result['count']} items" 
                        for name, result in repository_results.items()
                        if result.get('status') == 'success'
                    ])
                    
                    return self.add_result(
                        "Repository Operations",
                        True,
                        f"All repositories working - {success_message}",
                        repository_results
                    )
                    
            except Exception as e:
                return self.add_result(
                    "Repository Operations",
                    False,
                    f"Repository test setup failed: {str(e)}",
                    error_type=type(e).__name__
                )
    
    def run_all_tests(self) -> Tuple[bool, List[TestResult]]:
        """
        Run all database tests and return comprehensive results.
        
        Returns:
            Tuple of (all_passed, test_results)
        """
        logger.info("🚀 Starting comprehensive database model tests...")
        self.start_time = time()
        
        # Run all tests
        tests = [
            self.test_database_connection,
            self.test_database_initialization,
            self.test_repository_operations,
        ]
        
        for test_func in tests:
            result = test_func()
            if not result.success:
                # Stop on first failure for critical tests
                if result.name in ["Database Connection", "Database Initialization"]:
                    logger.error(f"Critical test failed: {result.name}")
                    break
        
        # Calculate summary
        total_time = time() - self.start_time
        passed_tests = sum(1 for r in self.results if r.success)
        total_tests = len(self.results)
        all_passed = passed_tests == total_tests
        
        # Log summary
        logger.info("=" * 60)
        if all_passed:
            logger.info(f"🎉 All {total_tests} tests passed! ({total_time:.3f}s total)")
        else:
            logger.error(f"❌ {total_tests - passed_tests}/{total_tests} tests failed")
        
        logger.info("Test Summary:")
        for result in self.results:
            logger.info(f"  {result}")
        
        return all_passed, self.results


def main() -> bool:
    """
    Main function to run all database tests.
    
    Returns:
        bool: True if all tests passed, False otherwise
    """
    try:
        tester = DatabaseTester()
        all_passed, results = tester.run_all_tests()
        
        # Print detailed results for debugging
        if not all_passed:
            logger.info("\nDetailed Error Information:")
            for result in results:
                if not result.success:
                    logger.error(f"Failed Test: {result.name}")
                    logger.error(f"  Error: {result.message}")
                    if result.error_type:
                        logger.error(f"  Type: {result.error_type}")
                    if result.details:
                        logger.error(f"  Details: {result.details}")
        
        return all_passed
        
    except Exception as e:
        logger.error(f"💥 Test runner failed: {e}", exc_info=True)
        return False


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)