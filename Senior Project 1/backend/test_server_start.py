#!/usr/bin/env python3
"""
Comprehensive server startup testing framework for ICT University ERP System

This script validates that all critical components can be loaded and configured
properly before attempting to start the server. It provides detailed reporting
and helps identify configuration issues early.
"""

import sys
import logging
from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional, Callable
from enum import Enum


class TestSeverity(Enum):
    """Test result severity levels"""
    CRITICAL = "critical"
    WARNING = "warning" 
    INFO = "info"


@dataclass
class TestResult:
    """Represents the result of a test execution"""
    name: str
    success: bool
    message: str
    severity: TestSeverity = TestSeverity.INFO
    details: Optional[Dict[str, Any]] = field(default_factory=dict)
    execution_time: float = 0.0


class ImportTester:
    """Handles systematic testing of module imports"""
    
    CRITICAL_IMPORTS = [
        ("app.core.config", ["settings", "UserRoles", "Permissions"]),
        ("app.main", ["app"]),
        ("app.core.security", ["verify_supabase_token", "get_current_user"]),
    ]
    
    OPTIONAL_IMPORTS = [
        ("app.api.api_v1.endpoints.auth", ["router"]),
        ("app.api.api_v1.endpoints.academic", ["router"]),
    ]
    
    def test_imports(self) -> TestResult:
        """Test all critical imports with detailed reporting"""
        failed_imports = []
        successful_imports = []
        warnings = []
        
        # Test critical imports
        for module_name, components in self.CRITICAL_IMPORTS:
            result = self._test_single_import(module_name, components)
            if result["success"]:
                successful_imports.append(module_name)
            else:
                failed_imports.append(result)
        
        # Test optional imports (failures are warnings, not errors)
        for module_name, components in self.OPTIONAL_IMPORTS:
            result = self._test_single_import(module_name, components)
            if result["success"]:
                successful_imports.append(module_name)
            else:
                warnings.append(result)
        
        # Determine overall success
        success = len(failed_imports) == 0
        severity = TestSeverity.CRITICAL if failed_imports else (
            TestSeverity.WARNING if warnings else TestSeverity.INFO
        )
        
        message = f"Imports: {len(successful_imports)} successful, {len(failed_imports)} failed"
        if warnings:
            message += f", {len(warnings)} warnings"
        
        return TestResult(
            name="import_test",
            success=success,
            message=message,
            severity=severity,
            details={
                "successful": successful_imports,
                "failed": failed_imports,
                "warnings": warnings,
                "total_tested": len(self.CRITICAL_IMPORTS) + len(self.OPTIONAL_IMPORTS)
            }
        )
    
    def _test_single_import(self, module_name: str, components: List[str]) -> Dict[str, Any]:
        """Test importing a single module and its components"""
        try:
            module = __import__(module_name, fromlist=components)
            
            # Verify specific components exist
            missing_components = []
            for component in components:
                if not hasattr(module, component):
                    missing_components.append(component)
            
            if missing_components:
                return {
                    "success": False,
                    "module": module_name,
                    "error": f"Missing components: {missing_components}",
                    "type": "MissingComponents"
                }
            
            return {
                "success": True,
                "module": module_name,
                "components": components
            }
            
        except ImportError as e:
            return {
                "success": False,
                "module": module_name,
                "error": str(e),
                "type": "ImportError"
            }
        except Exception as e:
            return {
                "success": False,
                "module": module_name,
                "error": str(e),
                "type": type(e).__name__
            }


class ConfigurationTester:
    """Validates configuration settings and environment setup"""
    
    def test_configuration(self) -> TestResult:
        """Comprehensive configuration validation"""
        try:
            from app.core.config import settings, UserRoles, validate_production_config
            
            validation_results = {
                "environment": self._validate_environment(settings),
                "supabase": self._validate_supabase_config(settings),
                "security": self._validate_security_config(settings),
                "cors": self._validate_cors_config(settings),
                "roles": self._validate_roles(UserRoles),
            }
            
            # Check for production configuration issues
            production_warnings = []
            if settings.is_production:
                production_warnings = validate_production_config(settings)
                validation_results["production_warnings"] = production_warnings
            
            # Determine overall success and severity
            critical_issues = []
            warnings = []
            
            for category, result in validation_results.items():
                if isinstance(result, dict) and not result.get("valid", True):
                    if result.get("severity") == "critical":
                        critical_issues.append(category)
                    else:
                        warnings.append(category)
                elif isinstance(result, list) and result:  # production warnings
                    warnings.extend(result)
            
            success = len(critical_issues) == 0
            severity = TestSeverity.CRITICAL if critical_issues else (
                TestSeverity.WARNING if warnings else TestSeverity.INFO
            )
            
            message = f"Configuration: {len(critical_issues)} critical issues, {len(warnings)} warnings"
            
            return TestResult(
                name="configuration_test",
                success=success,
                message=message,
                severity=severity,
                details=validation_results
            )
            
        except Exception as e:
            return TestResult(
                name="configuration_test",
                success=False,
                message=f"Configuration test failed: {str(e)}",
                severity=TestSeverity.CRITICAL,
                details={"exception": str(e)}
            )
    
    def _validate_environment(self, settings) -> Dict[str, Any]:
        """Validate environment-specific settings"""
        issues = []
        
        # Check port availability (basic validation)
        if not (1 <= settings.PORT <= 65535):
            issues.append(f"Invalid port number: {settings.PORT}")
        
        return {
            "valid": len(issues) == 0,
            "environment": settings.ENVIRONMENT.value,
            "debug": settings.DEBUG,
            "host": settings.HOST,
            "port": settings.PORT,
            "issues": issues,
            "severity": "critical" if issues else "info"
        }
    
    def _validate_supabase_config(self, settings) -> Dict[str, Any]:
        """Validate Supabase configuration"""
        issues = []
        warnings = []
        
        # Critical issues
        if not settings.SUPABASE_URL or settings.SUPABASE_URL == "https://your-project.supabase.co":
            issues.append("SUPABASE_URL is missing or using default placeholder")
        
        if not settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_SERVICE_ROLE_KEY == "your-service-role-key":
            issues.append("SUPABASE_SERVICE_ROLE_KEY is missing or using default placeholder")
        
        if not settings.JWT_SECRET_KEY or settings.JWT_SECRET_KEY == "your-jwt-secret":
            issues.append("JWT_SECRET_KEY is missing or using default placeholder")
        
        # Warnings
        if settings.SUPABASE_URL and not settings.SUPABASE_URL.startswith(('http://', 'https://')):
            warnings.append("SUPABASE_URL does not appear to be a valid URL")
        
        return {
            "valid": len(issues) == 0,
            "url": settings.SUPABASE_URL,
            "has_service_key": bool(settings.SUPABASE_SERVICE_ROLE_KEY and 
                                  settings.SUPABASE_SERVICE_ROLE_KEY != "your-service-role-key"),
            "has_anon_key": bool(settings.SUPABASE_ANON_KEY and 
                               settings.SUPABASE_ANON_KEY != "your-anon-key"),
            "has_jwt_secret": bool(settings.JWT_SECRET_KEY and 
                                 settings.JWT_SECRET_KEY != "your-jwt-secret"),
            "issues": issues,
            "warnings": warnings,
            "severity": "critical" if issues else ("warning" if warnings else "info")
        }
    
    def _validate_security_config(self, settings) -> Dict[str, Any]:
        """Validate security-related configuration"""
        issues = []
        warnings = []
        
        if settings.is_production and settings.DEBUG:
            warnings.append("DEBUG mode is enabled in production environment")
        
        if len(settings.SECRET_KEY) < 32:
            issues.append("SECRET_KEY is too short (should be at least 32 characters)")
        
        return {
            "valid": len(issues) == 0,
            "secret_key_length": len(settings.SECRET_KEY),
            "jwt_algorithm": settings.JWT_ALGORITHM,
            "token_expire_minutes": settings.ACCESS_TOKEN_EXPIRE_MINUTES,
            "issues": issues,
            "warnings": warnings,
            "severity": "critical" if issues else ("warning" if warnings else "info")
        }
    
    def _validate_cors_config(self, settings) -> Dict[str, Any]:
        """Validate CORS configuration"""
        warnings = []
        
        cors_origins = settings.BACKEND_CORS_ORIGINS
        if not cors_origins:
            warnings.append("No CORS origins configured")
        elif "*" in cors_origins and settings.is_production:
            warnings.append("Wildcard CORS origin (*) should not be used in production")
        
        return {
            "valid": True,  # CORS issues are typically warnings, not critical
            "origins": cors_origins,
            "origin_count": len(cors_origins),
            "warnings": warnings,
            "severity": "warning" if warnings else "info"
        }
    
    def _validate_roles(self, UserRoles) -> Dict[str, Any]:
        """Validate user roles configuration"""
        try:
            all_roles = UserRoles.get_all_roles()
            staff_roles = UserRoles.get_staff_roles()
            admin_roles = UserRoles.get_admin_roles()
            
            return {
                "valid": True,
                "total_roles": len(all_roles),
                "staff_roles": len(staff_roles),
                "admin_roles": len(admin_roles),
                "roles": all_roles,
                "severity": "info"
            }
        except Exception as e:
            return {
                "valid": False,
                "error": str(e),
                "severity": "critical"
            }


class TestReporter:
    """Handles test result reporting with different output formats"""
    
    def __init__(self, verbose: bool = False):
        self.verbose = verbose
        self.setup_logging()
    
    def setup_logging(self):
        """Configure logging for test execution"""
        level = logging.DEBUG if self.verbose else logging.INFO
        logging.basicConfig(
            level=level,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
    
    def report_results(self, results: List[TestResult]) -> bool:
        """Generate comprehensive test report"""
        print("\n" + "="*70)
        print("🚀 ICT UNIVERSITY ERP - SERVER STARTUP TEST REPORT")
        print("="*70)
        
        # Calculate statistics
        total_tests = len(results)
        passed_tests = sum(1 for r in results if r.success)
        failed_tests = total_tests - passed_tests
        critical_failures = sum(1 for r in results if not r.success and r.severity == TestSeverity.CRITICAL)
        warnings = sum(1 for r in results if r.severity == TestSeverity.WARNING)
        
        # Summary section
        print(f"\n📊 SUMMARY:")
        print(f"   Total Tests: {total_tests}")
        print(f"   Passed: {passed_tests} ✅")
        print(f"   Failed: {failed_tests} ❌")
        print(f"   Critical Failures: {critical_failures} 🚨")
        print(f"   Warnings: {warnings} ⚠️")
        print(f"   Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        # Quick status
        if critical_failures > 0:
            print(f"\n🚨 CRITICAL ISSUES DETECTED - Server startup will likely fail!")
        elif failed_tests > 0:
            print(f"\n⚠️  Some tests failed - Server may have issues")
        elif warnings > 0:
            print(f"\n⚠️  Warnings detected - Server should start but check configuration")
        else:
            print(f"\n✅ All tests passed - Server should start successfully!")
        
        # Detailed results for failures
        if failed_tests > 0:
            print(f"\n❌ FAILED TESTS:")
            for result in results:
                if not result.success:
                    severity_icon = "🚨" if result.severity == TestSeverity.CRITICAL else "⚠️"
                    print(f"   {severity_icon} {result.name}: {result.message}")
                    if self.verbose and result.details:
                        self._print_details(result.details, indent=6)
        
        # Show warnings
        warning_results = [r for r in results if r.severity == TestSeverity.WARNING]
        if warning_results:
            print(f"\n⚠️  WARNINGS:")
            for result in warning_results:
                print(f"   ⚠️  {result.name}: {result.message}")
                if self.verbose and result.details:
                    self._print_details(result.details, indent=6)
        
        # Verbose output for all tests
        if self.verbose:
            print(f"\n📋 DETAILED TEST RESULTS:")
            for result in results:
                status_icon = "✅" if result.success else "❌"
                severity_icon = {
                    TestSeverity.CRITICAL: "🚨",
                    TestSeverity.WARNING: "⚠️",
                    TestSeverity.INFO: "ℹ️"
                }.get(result.severity, "")
                
                print(f"   {status_icon} {severity_icon} {result.name}: {result.message}")
                if result.details:
                    self._print_details(result.details, indent=6)
        
        print("\n" + "="*70)
        
        return critical_failures == 0
    
    def _print_details(self, details: Dict[str, Any], indent: int = 0):
        """Print detailed test information with proper formatting"""
        prefix = " " * indent
        for key, value in details.items():
            if isinstance(value, dict):
                print(f"{prefix}{key}:")
                self._print_details(value, indent + 2)
            elif isinstance(value, list):
                if len(value) == 0:
                    print(f"{prefix}{key}: (empty)")
                elif len(value) <= 3 or self.verbose:
                    print(f"{prefix}{key}:")
                    for item in value:
                        print(f"{prefix}  - {item}")
                else:
                    print(f"{prefix}{key}: {len(value)} items (use --verbose to see all)")
                    for item in value[:2]:
                        print(f"{prefix}  - {item}")
                    print(f"{prefix}  ... and {len(value) - 2} more")
            else:
                print(f"{prefix}{key}: {value}")


class ServerStartupTester:
    """Main testing orchestrator"""
    
    def __init__(self, verbose: bool = False):
        self.verbose = verbose
        self.reporter = TestReporter(verbose)
        self.logger = logging.getLogger(__name__)
        
    def run_all_tests(self) -> bool:
        """Execute all startup tests and return overall success"""
        import time
        
        tests = [
            ("Import Tests", ImportTester().test_imports),
            ("Configuration Tests", ConfigurationTester().test_configuration),
        ]
        
        results = []
        
        for test_name, test_func in tests:
            self.logger.info(f"Running {test_name}...")
            start_time = time.time()
            
            try:
                result = test_func()
                result.execution_time = time.time() - start_time
                results.append(result)
                
                status = "✅" if result.success else "❌"
                self.logger.info(f"{status} {test_name} completed in {result.execution_time:.2f}s")
                
            except Exception as e:
                execution_time = time.time() - start_time
                error_result = TestResult(
                    name=test_name.lower().replace(" ", "_"),
                    success=False,
                    message=f"Test execution failed: {str(e)}",
                    severity=TestSeverity.CRITICAL,
                    details={"exception": str(e)},
                    execution_time=execution_time
                )
                results.append(error_result)
                self.logger.error(f"❌ {test_name} failed with exception: {e}")
        
        # Generate report and return success status
        return self.reporter.report_results(results)


def main():
    """Main entry point for the test script"""
    import argparse
    
    parser = argparse.ArgumentParser(
        description="Test ICT University ERP server startup components",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python test_server_start.py              # Run basic tests
  python test_server_start.py --verbose    # Run with detailed output
  python test_server_start.py -v           # Short form of verbose
        """
    )
    parser.add_argument(
        "-v", "--verbose", 
        action="store_true", 
        help="Enable verbose output with detailed test information"
    )
    
    args = parser.parse_args()
    
    # Run tests
    tester = ServerStartupTester(verbose=args.verbose)
    success = tester.run_all_tests()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()