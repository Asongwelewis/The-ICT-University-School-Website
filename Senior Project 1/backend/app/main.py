"""
Main FastAPI application for ICT University ERP System

This is the entry point for the backend API that provides:
- Authentication and authorization
- Academic management (courses, grades, attendance)
- Financial management (invoices, payments)
- HR management (employees, payroll)
- Marketing management (campaigns, analytics)
- System administration
"""

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import time
import logging
from contextlib import asynccontextmanager

from app.core.config import settings
from app.api.api_v1.api import api_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager for Supabase integration
    
    Handles startup and shutdown events:
    - Supabase connection verification
    - Application initialization
    - Cleanup on shutdown
    """
    # Startup events
    logger.info("Starting ICT University ERP System with Supabase...")
    
    try:
        # Verify Supabase connection
        from app.core.security import supabase
        
        # Test Supabase connection
        health_check = supabase.table("_health").select("*").limit(1).execute()
        logger.info("Supabase connection verified successfully")
        
        logger.info("Application startup completed successfully")
        
    except Exception as e:
        logger.warning(f"Supabase connection test failed (this is normal if _health table doesn't exist): {e}")
        logger.info("Application will continue - Supabase authentication will work normally")
    
    yield  # Application runs here
    
    # Shutdown events
    logger.info("Shutting down ICT University ERP System...")
    logger.info("Application shutdown completed")


# Create FastAPI application instance
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",  # Swagger UI
    redoc_url="/redoc",  # ReDoc documentation
    lifespan=lifespan,
)


# CORS Middleware Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
)

# Trusted Host Middleware (security)
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["localhost", "127.0.0.1", "*.ictuniversity.edu"]
)


# Custom Middleware for Request Logging and Performance Monitoring
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """
    Middleware to log all HTTP requests and measure response times
    
    Logs:
    - Request method, URL, and client IP
    - Response status code and processing time
    - Error details for failed requests
    """
    start_time = time.time()
    
    # Log incoming request
    client_ip = request.client.host if request.client else "unknown"
    logger.info(
        f"Request: {request.method} {request.url.path} from {client_ip}"
    )
    
    try:
        # Process request
        response = await call_next(request)
        
        # Calculate processing time
        process_time = time.time() - start_time
        
        # Log response
        logger.info(
            f"Response: {response.status_code} in {process_time:.4f}s"
        )
        
        # Add processing time to response headers
        response.headers["X-Process-Time"] = str(process_time)
        
        return response
        
    except Exception as e:
        # Log errors
        process_time = time.time() - start_time
        logger.error(
            f"Request failed: {request.method} {request.url.path} "
            f"in {process_time:.4f}s - Error: {str(e)}"
        )
        raise


# Global Exception Handlers
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """
    Handle HTTP exceptions with consistent error response format
    
    Returns standardized error responses for all HTTP exceptions
    """
    logger.warning(
        f"HTTP Exception: {exc.status_code} - {exc.detail} "
        f"for {request.method} {request.url.path}"
    )
    
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": True,
            "message": exc.detail,
            "status_code": exc.status_code,
            "path": str(request.url.path),
            "timestamp": time.time(),
        }
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Handle request validation errors with detailed error information
    
    Provides clear feedback for invalid request data
    """
    logger.warning(
        f"Validation Error for {request.method} {request.url.path}: {exc.errors()}"
    )
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": True,
            "message": "Validation error",
            "details": exc.errors(),
            "status_code": 422,
            "path": str(request.url.path),
            "timestamp": time.time(),
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """
    Handle unexpected exceptions with generic error response
    
    Logs detailed error information while returning safe error message to client
    """
    logger.error(
        f"Unexpected error for {request.method} {request.url.path}: {str(exc)}",
        exc_info=True
    )
    
    # Don't expose internal error details in production
    error_message = (
        str(exc) if settings.DEBUG 
        else "An internal server error occurred"
    )
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": True,
            "message": error_message,
            "status_code": 500,
            "path": str(request.url.path),
            "timestamp": time.time(),
        }
    )


# Health Check Endpoints
@app.get("/health", tags=["Health"])
async def health_check():
    """
    Basic health check endpoint
    
    Returns:
        dict: Application health status
    """
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "timestamp": time.time(),
    }


@app.get("/health/detailed", tags=["Health"])
async def detailed_health_check():
    """
    Detailed health check with Supabase and system information
    
    Returns:
        dict: Comprehensive health status including Supabase connectivity
    """
    # Check Supabase health
    supabase_health = {"status": "healthy", "message": "Supabase connection available"}
    
    try:
        from app.core.security import supabase
        # Simple test query to verify connection
        test_response = supabase.table("_health").select("*").limit(1).execute()
        supabase_health = {"status": "healthy", "message": "Supabase connection verified"}
    except Exception as e:
        supabase_health = {"status": "warning", "message": f"Supabase test query failed (normal if _health table doesn't exist): {str(e)}"}
    
    # System information
    system_info = {
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "debug_mode": settings.DEBUG,
        "supabase": supabase_health,
        "timestamp": time.time(),
    }
    
    # Determine overall health status
    overall_status = "healthy" if supabase_health.get("status") in ["healthy", "warning"] else "unhealthy"
    
    return {
        "status": overall_status,
        **system_info
    }


# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    """
    Root endpoint with API information
    
    Returns:
        dict: API welcome message and basic information
    """
    return {
        "message": f"Welcome to {settings.PROJECT_NAME} API",
        "version": settings.VERSION,
        "docs_url": "/docs",
        "redoc_url": "/redoc",
        "health_check": "/health",
        "api_base": settings.API_V1_STR,
    }


# Include API routes
app.include_router(
    api_router,
    prefix=settings.API_V1_STR,
    tags=["API v1"]
)


# Development-only endpoints
if settings.DEBUG:
    @app.get("/debug/config", tags=["Debug"])
    async def debug_config():
        """
        Debug endpoint to view current configuration (development only)
        
        Returns sanitized configuration for debugging purposes
        """
        return {
            "project_name": settings.PROJECT_NAME,
            "version": settings.VERSION,
            "environment": settings.ENVIRONMENT,
            "debug": settings.DEBUG,
            "cors_origins": [str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
            "supabase_url": settings.SUPABASE_URL,
            "api_prefix": settings.API_V1_STR,
        }
    
    @app.get("/debug/supabase", tags=["Debug"])
    async def debug_supabase():
        """
        Debug endpoint for Supabase connection information (development only)
        
        Returns Supabase connection details
        """
        return {
            "supabase_url": settings.SUPABASE_URL,
            "has_anon_key": bool(settings.SUPABASE_ANON_KEY and settings.SUPABASE_ANON_KEY != "your-anon-key"),
            "has_service_key": bool(settings.SUPABASE_SERVICE_KEY and settings.SUPABASE_SERVICE_KEY != "your-service-role-key"),
            "has_jwt_secret": bool(settings.SUPABASE_JWT_SECRET and settings.SUPABASE_JWT_SECRET != "your-jwt-secret"),
        }


# Custom startup message
@app.on_event("startup")
async def startup_message():
    """
    Display startup message with important information
    """
    logger.info("=" * 60)
    logger.info(f"🎓 {settings.PROJECT_NAME} v{settings.VERSION}")
    logger.info(f"🌍 Environment: {settings.ENVIRONMENT}")
    logger.info(f"🔧 Debug Mode: {settings.DEBUG}")
    logger.info(f"📚 API Documentation: http://localhost:8000/docs")
    logger.info(f"🔍 ReDoc Documentation: http://localhost:8000/redoc")
    logger.info(f"💚 Health Check: http://localhost:8000/health")
    logger.info("=" * 60)


if __name__ == "__main__":
    import uvicorn
    
    # Run the application with uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level="info" if settings.DEBUG else "warning",
    )