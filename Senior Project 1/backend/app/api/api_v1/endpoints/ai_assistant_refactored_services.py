"""
Refactored AI Service Classes with Improved Architecture
Demonstrates separation of concerns and proper dependency injection
"""

from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional, Protocol
from dataclasses import dataclass
from datetime import datetime
import time
import asyncio
import httpx
import logging
from contextlib import asynccontextmanager

from .ai_assistant_refactored_config import AIServiceConfig, get_ai_config

logger = logging.getLogger(__name__)

# =====================================================
# DOMAIN MODELS
# =====================================================

@dataclass
class AIRequest:
    """Domain model for AI requests"""
    prompt: str
    model: Optional[str] = None
    context: Optional[Dict[str, Any]] = None
    options: Optional[Dict[str, Any]] = None
    request_id: Optional[str] = None
    
    def __post_init__(self):
        if self.request_id is None:
            self.request_id = f"req_{int(time.time() * 1000)}"
        if self.context is None:
            self.context = {}
        if self.options is None:
            self.options = {}

@dataclass
class AIResponse:
    """Domain model for AI responses"""
    content: str
    model: str
    response_time_ms: int
    request_id: str
    metadata: Optional[Dict[str, Any]] = None
    
    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}

# =====================================================
# PROTOCOLS (INTERFACES)
# =====================================================

class AIServiceClient(Protocol):
    """Protocol for AI service clients"""
    
    async def health_check(self) -> bool:
        """Check if the AI service is healthy"""
        ...
    
    async def list_models(self) -> List[str]:
        """List available models"""
        ...
    
    async def generate(self, request: AIRequest) -> AIResponse:
        """Generate AI response"""
        ...

class HttpClient(Protocol):
    """Protocol for HTTP clients"""
    
    async def request(self, method: str, url: str, **kwargs) -> httpx.Response:
        """Make HTTP request"""
        ...

# =====================================================
# ERROR HANDLING
# =====================================================

class AIServiceError(Exception):
    """Base exception for AI service errors"""
    
    def __init__(self, message: str, error_code: str = None, context: Dict[str, Any] = None):
        super().__init__(message)
        self.error_code = error_code
        self.context = context or {}

class AIServiceUnavailableError(AIServiceError):
    """AI service is not available"""
    
    def __init__(self, message: str = "AI service is unavailable", **kwargs):
        super().__init__(message, error_code="SERVICE_UNAVAILABLE", **kwargs)

class AIServiceTimeoutError(AIServiceError):
    """AI service request timed out"""
    
    def __init__(self, message: str = "AI service request timed out", **kwargs):
        super().__init__(message, error_code="REQUEST_TIMEOUT", **kwargs)

class AIServiceRateLimitError(AIServiceError):
    """AI service rate limit exceeded"""
    
    def __init__(self, message: str = "Rate limit exceeded", **kwargs):
        super().__init__(message, error_code="RATE_LIMIT_EXCEEDED", **kwargs)

class AIServiceErrorHandler:
    """Centralized error handling for AI service operations"""
    
    @staticmethod
    def handle_http_error(error: Exception, context: str) -> AIServiceError:
        """Convert HTTP errors to domain-specific errors"""
        if isinstance(error, httpx.TimeoutException):
            return AIServiceTimeoutError(f"Timeout in {context}", context={"operation": context})
        elif isinstance(error, httpx.HTTPStatusError):
            status_code = error.response.status_code
            if status_code == 429:
                return AIServiceRateLimitError(f"Rate limit in {context}")
            elif status_code >= 500:
                return AIServiceUnavailableError(f"Server error {status_code} in {context}")
            else:
                return AIServiceError(f"HTTP {status_code} in {context}")
        elif isinstance(error, httpx.ConnectError):
            return AIServiceUnavailableError(f"Connection failed in {context}")
        else:
            return AIServiceError(f"Unexpected error in {context}: {str(error)}")

# =====================================================
# HTTP CLIENT WITH RETRY LOGIC
# =====================================================

class RetryableHttpClient:
    """HTTP client with configurable retry logic and proper error handling"""
    
    def __init__(self, config: AIServiceConfig):
        self.config = config
        self._client: Optional[httpx.AsyncClient] = None
        self.error_handler = AIServiceErrorHandler()
    
    async def __aenter__(self):
        """Async context manager entry"""
        self._client = httpx.AsyncClient(**self.config.get_client_config())
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        if self._client:
            await self._client.aclose()
    
    async def request(self, method: str, url: str, **kwargs) -> httpx.Response:
        """Make HTTP request with retry logic"""
        if not self._client:
            raise AIServiceError("HTTP client not initialized. Use as async context manager.")
        
        last_exception = None
        
        for attempt in range(self.config.max_retries + 1):  # +1 for initial attempt
            try:
                response = await self._client.request(method, url, **kwargs)
                response.raise_for_status()
                return response
                
            except Exception as e:
                last_exception = e
                
                # Don't retry on client errors (4xx)
                if isinstance(e, httpx.HTTPStatusError) and 400 <= e.response.status_code < 500:
                    break
                
                # Log retry attempt
                if attempt < self.config.max_retries:
                    logger.warning(
                        f"Request failed on attempt {attempt + 1}, retrying in {self.config.retry_delay}s",
                        extra={"url": url, "method": method, "error": str(e)}
                    )
                    await asyncio.sleep(self.config.retry_delay * (attempt + 1))
                    continue
                
                break
        
        # Convert to domain-specific error
        raise self.error_handler.handle_http_error(last_exception, f"{method} {url}")

# =====================================================
# CIRCUIT BREAKER PATTERN
# =====================================================

class CircuitBreaker:
    """Circuit breaker for service resilience"""
    
    def __init__(self, failure_threshold: int = 5, timeout: int = 60):
        self.failure_threshold = failure_threshold
        self.timeout = timeout
        self.failure_count = 0
        self.last_failure_time = None
        self.state = "CLOSED"  # CLOSED, OPEN, HALF_OPEN
    
    async def call(self, func, *args, **kwargs):
        """Execute function with circuit breaker protection"""
        if self.state == "OPEN":
            if time.time() - self.last_failure_time > self.timeout:
                self.state = "HALF_OPEN"
                logger.info("Circuit breaker transitioning to HALF_OPEN")
            else:
                raise AIServiceUnavailableError("Circuit breaker is OPEN")
        
        try:
            result = await func(*args, **kwargs)
            
            # Success - reset circuit breaker if it was half-open
            if self.state == "HALF_OPEN":
                self.state = "CLOSED"
                self.failure_count = 0
                logger.info("Circuit breaker reset to CLOSED")
            
            return result
            
        except Exception as e:
            self.failure_count += 1
            self.last_failure_time = time.time()
            
            if self.failure_count >= self.failure_threshold:
                self.state = "OPEN"
                logger.warning(f"Circuit breaker opened after {self.failure_count} failures")
            
            raise

# =====================================================
# OLLAMA CLIENT IMPLEMENTATION
# =====================================================

class OllamaClient:
    """Client for Ollama AI service with proper error handling and resilience"""
    
    def __init__(self, config: AIServiceConfig, http_client: RetryableHttpClient):
        self.config = config
        self.http_client = http_client
        self.base_url = config.ollama_base_url
        self.circuit_breaker = CircuitBreaker(
            failure_threshold=config.circuit_breaker_failure_threshold,
            timeout=config.circuit_breaker_timeout
        ) if config.enable_circuit_breaker else None
    
    async def _make_protected_call(self, func, *args, **kwargs):
        """Make call with optional circuit breaker protection"""
        if self.circuit_breaker:
            return await self.circuit_breaker.call(func, *args, **kwargs)
        else:
            return await func(*args, **kwargs)
    
    async def health_check(self) -> bool:
        """Check if Ollama service is healthy"""
        try:
            await self._make_protected_call(
                self.http_client.request,
                "GET",
                f"{self.base_url}/api/tags"
            )
            return True
        except AIServiceError:
            return False
    
    async def list_models(self) -> List[str]:
        """Get available models from Ollama"""
        try:
            response = await self._make_protected_call(
                self.http_client.request,
                "GET",
                f"{self.base_url}/api/tags"
            )
            data = response.json()
            return [model["name"] for model in data.get("models", [])]
        except AIServiceError:
            logger.warning("Failed to fetch models from Ollama")
            return []
    
    async def generate(self, request: AIRequest) -> AIResponse:
        """Generate response using Ollama"""
        start_time = time.time()
        
        model = request.model or self.config.default_model
        options = self.config.get_generation_options(**request.options)
        
        request_data = {
            "model": model,
            "prompt": request.prompt,
            "stream": False,
            "options": options
        }
        
        try:
            response = await self._make_protected_call(
                self.http_client.request,
                "POST",
                f"{self.base_url}/api/generate",
                json=request_data
            )
            
            result = response.json()
            response_time_ms = int((time.time() - start_time) * 1000)
            
            return AIResponse(
                content=result.get("response", "I'm sorry, I couldn't generate a response."),
                model=model,
                response_time_ms=response_time_ms,
                request_id=request.request_id,
                metadata={
                    "tokens_generated": result.get("eval_count", 0),
                    "tokens_per_second": result.get("eval_count", 0) / (response_time_ms / 1000) if response_time_ms > 0 else 0,
                    "context_length": result.get("prompt_eval_count", 0)
                }
            )
            
        except AIServiceError:
            # Re-raise domain errors as-is
            raise
        except Exception as e:
            # Convert unexpected errors
            raise AIServiceError(f"Unexpected error during generation: {str(e)}")

# =====================================================
# AI SERVICE FACADE
# =====================================================

class AIService:
    """
    Main AI service facade that coordinates all AI operations
    
    This class provides a clean interface for AI operations while
    managing the underlying complexity of HTTP clients, error handling,
    and service coordination.
    """
    
    def __init__(self, config: AIServiceConfig = None):
        self.config = config or get_ai_config()
        self._http_client: Optional[RetryableHttpClient] = None
        self._ollama_client: Optional[OllamaClient] = None
    
    @asynccontextmanager
    async def _get_clients(self):
        """Get initialized clients as async context manager"""
        async with RetryableHttpClient(self.config) as http_client:
            ollama_client = OllamaClient(self.config, http_client)
            yield http_client, ollama_client
    
    async def health_check(self) -> Dict[str, Any]:
        """Comprehensive health check with detailed status"""
        start_time = time.time()
        
        try:
            async with self._get_clients() as (http_client, ollama_client):
                is_healthy = await ollama_client.health_check()
                models = await ollama_client.list_models() if is_healthy else []
                
                response_time_ms = int((time.time() - start_time) * 1000)
                
                return {
                    "status": "healthy" if is_healthy else "unhealthy",
                    "service": "ollama",
                    "models": models,
                    "default_model": self.config.default_model,
                    "response_time_ms": response_time_ms,
                    "circuit_breaker_enabled": self.config.enable_circuit_breaker,
                    "last_check": datetime.utcnow().isoformat()
                }
                
        except Exception as e:
            response_time_ms = int((time.time() - start_time) * 1000)
            logger.error(f"Health check failed: {e}")
            
            return {
                "status": "error",
                "service": "ollama",
                "models": [],
                "default_model": self.config.default_model,
                "response_time_ms": response_time_ms,
                "error": str(e),
                "last_check": datetime.utcnow().isoformat()
            }
    
    async def generate_response(self, request: AIRequest) -> AIResponse:
        """Generate AI response with full error handling"""
        async with self._get_clients() as (http_client, ollama_client):
            return await ollama_client.generate(request)
    
    async def list_available_models(self) -> List[str]:
        """Get list of available models"""
        async with self._get_clients() as (http_client, ollama_client):
            return await ollama_client.list_models()

# =====================================================
# SERVICE FACTORY
# =====================================================

class AIServiceFactory:
    """Factory for creating AI service instances"""
    
    @staticmethod
    def create_service(config: AIServiceConfig = None) -> AIService:
        """Create AI service with optional configuration"""
        return AIService(config)
    
    @staticmethod
    def create_test_service(**config_overrides) -> AIService:
        """Create AI service for testing with configuration overrides"""
        from .ai_assistant_refactored_config import AIConfigFactory
        
        test_config = AIConfigFactory.create_test_config(**config_overrides)
        return AIService(test_config)
    
    @staticmethod
    def create_production_service() -> AIService:
        """Create AI service optimized for production"""
        from .ai_assistant_refactored_config import AIConfigFactory
        
        prod_config = AIConfigFactory.create_production_config()
        return AIService(prod_config)

# =====================================================
# DEPENDENCY INJECTION
# =====================================================

# Global service instance (can be replaced for testing)
_ai_service: Optional[AIService] = None

def get_ai_service() -> AIService:
    """Dependency injection for AI service"""
    global _ai_service
    if _ai_service is None:
        _ai_service = AIServiceFactory.create_service()
    return _ai_service

def set_ai_service(service: AIService) -> None:
    """Set AI service instance (useful for testing)"""
    global _ai_service
    _ai_service = service

# =====================================================
# USAGE EXAMPLES
# =====================================================

async def example_usage():
    """Example of how to use the refactored AI service"""
    
    # Create service
    ai_service = AIServiceFactory.create_service()
    
    # Health check
    health = await ai_service.health_check()
    print(f"Service status: {health['status']}")
    
    # Generate response
    request = AIRequest(
        prompt="Explain quantum computing in simple terms",
        model="llama2",
        context={"user_role": "student"},
        options={"temperature": 0.5}
    )
    
    try:
        response = await ai_service.generate_response(request)
        print(f"Response: {response.content}")
        print(f"Response time: {response.response_time_ms}ms")
        print(f"Tokens per second: {response.metadata.get('tokens_per_second', 0)}")
        
    except AIServiceError as e:
        print(f"AI service error: {e}")
        print(f"Error code: {e.error_code}")
        print(f"Context: {e.context}")

if __name__ == "__main__":
    asyncio.run(example_usage())