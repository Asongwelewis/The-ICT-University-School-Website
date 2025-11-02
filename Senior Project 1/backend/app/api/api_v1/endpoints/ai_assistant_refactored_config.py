"""
Improved Configuration Management for AI Assistant
Demonstrates proper configuration handling with Pydantic BaseSettings
"""

from pydantic import BaseSettings, Field, validator
from typing import Optional, Dict, Any
import os
from functools import lru_cache

class AIServiceConfig(BaseSettings):
    """
    AI Service configuration with environment variable support
    
    This replaces the hardcoded AIServiceConfig class with a proper
    Pydantic BaseSettings implementation that supports:
    - Environment variables
    - Type validation
    - Default values
    - Configuration validation
    """
    
    # Ollama Configuration
    ollama_base_url: str = Field(
        default="http://localhost:11434",
        env="OLLAMA_BASE_URL",
        description="Base URL for Ollama service"
    )
    
    default_model: str = Field(
        default="llama2",
        env="OLLAMA_DEFAULT_MODEL",
        description="Default AI model to use"
    )
    
    # Request Configuration
    request_timeout: float = Field(
        default=30.0,
        env="AI_REQUEST_TIMEOUT",
        ge=1.0,
        le=300.0,
        description="Request timeout in seconds"
    )
    
    max_tokens: int = Field(
        default=500,
        env="AI_MAX_TOKENS",
        ge=1,
        le=4000,
        description="Maximum tokens in response"
    )
    
    temperature: float = Field(
        default=0.7,
        env="AI_TEMPERATURE",
        ge=0.0,
        le=2.0,
        description="AI response creativity (0.0-2.0)"
    )
    
    top_p: float = Field(
        default=0.9,
        env="AI_TOP_P",
        ge=0.0,
        le=1.0,
        description="AI nucleus sampling parameter"
    )
    
    # Retry Configuration
    max_retries: int = Field(
        default=3,
        env="AI_MAX_RETRIES",
        ge=0,
        le=10,
        description="Maximum retry attempts"
    )
    
    retry_delay: float = Field(
        default=1.0,
        env="AI_RETRY_DELAY",
        ge=0.1,
        le=10.0,
        description="Delay between retries in seconds"
    )
    
    # Connection Pool Configuration
    max_connections: int = Field(
        default=10,
        env="AI_MAX_CONNECTIONS",
        ge=1,
        le=100,
        description="Maximum HTTP connections"
    )
    
    max_keepalive_connections: int = Field(
        default=5,
        env="AI_MAX_KEEPALIVE_CONNECTIONS",
        ge=1,
        le=50,
        description="Maximum keepalive connections"
    )
    
    keepalive_expiry: float = Field(
        default=30.0,
        env="AI_KEEPALIVE_EXPIRY",
        ge=1.0,
        le=300.0,
        description="Keepalive connection expiry in seconds"
    )
    
    # Feature Flags
    enable_caching: bool = Field(
        default=True,
        env="AI_ENABLE_CACHING",
        description="Enable response caching"
    )
    
    enable_metrics: bool = Field(
        default=True,
        env="AI_ENABLE_METRICS",
        description="Enable metrics collection"
    )
    
    enable_circuit_breaker: bool = Field(
        default=False,
        env="AI_ENABLE_CIRCUIT_BREAKER",
        description="Enable circuit breaker pattern"
    )
    
    # Circuit Breaker Configuration
    circuit_breaker_failure_threshold: int = Field(
        default=5,
        env="AI_CIRCUIT_BREAKER_FAILURE_THRESHOLD",
        ge=1,
        le=20,
        description="Circuit breaker failure threshold"
    )
    
    circuit_breaker_timeout: int = Field(
        default=60,
        env="AI_CIRCUIT_BREAKER_TIMEOUT",
        ge=10,
        le=600,
        description="Circuit breaker timeout in seconds"
    )
    
    @validator('ollama_base_url')
    def validate_ollama_url(cls, v):
        """Validate Ollama URL format"""
        if not v.startswith(('http://', 'https://')):
            raise ValueError('Ollama URL must start with http:// or https://')
        return v.rstrip('/')
    
    @validator('max_keepalive_connections')
    def validate_keepalive_connections(cls, v, values):
        """Ensure keepalive connections don't exceed max connections"""
        max_conn = values.get('max_connections', 10)
        if v > max_conn:
            raise ValueError('max_keepalive_connections cannot exceed max_connections')
        return v
    
    def get_client_config(self) -> Dict[str, Any]:
        """Get HTTP client configuration"""
        import httpx
        
        return {
            "timeout": httpx.Timeout(self.request_timeout),
            "limits": httpx.Limits(
                max_connections=self.max_connections,
                max_keepalive_connections=self.max_keepalive_connections,
                keepalive_expiry=self.keepalive_expiry
            )
        }
    
    def get_generation_options(self, **overrides) -> Dict[str, Any]:
        """Get AI generation options with optional overrides"""
        options = {
            "temperature": self.temperature,
            "top_p": self.top_p,
            "max_tokens": self.max_tokens
        }
        options.update(overrides)
        return options
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False
        validate_assignment = True
        extra = "ignore"


# Singleton pattern with caching for performance
@lru_cache()
def get_ai_config() -> AIServiceConfig:
    """
    Get AI configuration singleton with caching
    
    Uses functools.lru_cache to ensure configuration is loaded only once
    and cached for subsequent calls, improving performance.
    """
    return AIServiceConfig()


# Configuration factory for testing
class AIConfigFactory:
    """Factory for creating AI configurations for different environments"""
    
    @staticmethod
    def create_test_config(**overrides) -> AIServiceConfig:
        """Create configuration for testing with overrides"""
        test_defaults = {
            "request_timeout": 5.0,
            "max_retries": 1,
            "retry_delay": 0.1,
            "enable_caching": False,
            "enable_metrics": False,
            "enable_circuit_breaker": False
        }
        test_defaults.update(overrides)
        
        # Create temporary environment variables
        original_env = {}
        for key, value in test_defaults.items():
            env_key = f"AI_{key.upper()}"
            original_env[env_key] = os.environ.get(env_key)
            os.environ[env_key] = str(value)
        
        try:
            # Clear cache and create new config
            get_ai_config.cache_clear()
            config = AIServiceConfig()
            return config
        finally:
            # Restore original environment
            for env_key, original_value in original_env.items():
                if original_value is None:
                    os.environ.pop(env_key, None)
                else:
                    os.environ[env_key] = original_value
            get_ai_config.cache_clear()
    
    @staticmethod
    def create_production_config() -> AIServiceConfig:
        """Create configuration optimized for production"""
        return AIServiceConfig(
            request_timeout=60.0,
            max_retries=5,
            retry_delay=2.0,
            max_connections=50,
            max_keepalive_connections=25,
            enable_caching=True,
            enable_metrics=True,
            enable_circuit_breaker=True
        )
    
    @staticmethod
    def create_development_config() -> AIServiceConfig:
        """Create configuration optimized for development"""
        return AIServiceConfig(
            request_timeout=30.0,
            max_retries=3,
            retry_delay=1.0,
            max_connections=10,
            max_keepalive_connections=5,
            enable_caching=False,
            enable_metrics=False,
            enable_circuit_breaker=False
        )


# Configuration validator
class AIConfigValidator:
    """Validator for AI configuration with environment-specific checks"""
    
    @staticmethod
    def validate_config(config: AIServiceConfig, environment: str = "development") -> Dict[str, Any]:
        """
        Validate configuration for specific environment
        
        Returns:
            Dict with validation results including errors and warnings
        """
        errors = []
        warnings = []
        
        # Production-specific validations
        if environment == "production":
            if config.request_timeout < 30.0:
                warnings.append("Request timeout might be too low for production")
            
            if config.max_retries < 3:
                warnings.append("Max retries might be too low for production")
            
            if not config.enable_metrics:
                errors.append("Metrics should be enabled in production")
            
            if not config.enable_circuit_breaker:
                warnings.append("Circuit breaker recommended for production")
        
        # Development-specific validations
        elif environment == "development":
            if config.enable_circuit_breaker:
                warnings.append("Circuit breaker not needed in development")
        
        # General validations
        if config.temperature > 1.5:
            warnings.append("High temperature may produce inconsistent responses")
        
        if config.max_tokens > 2000:
            warnings.append("High max_tokens may impact performance")
        
        return {
            "is_valid": len(errors) == 0,
            "errors": errors,
            "warnings": warnings,
            "environment": environment
        }


# Usage examples:
if __name__ == "__main__":
    # Basic usage
    config = get_ai_config()
    print(f"Ollama URL: {config.ollama_base_url}")
    print(f"Default Model: {config.default_model}")
    
    # Test configuration
    test_config = AIConfigFactory.create_test_config(request_timeout=10.0)
    print(f"Test timeout: {test_config.request_timeout}")
    
    # Validation
    validation = AIConfigValidator.validate_config(config, "production")
    print(f"Config valid: {validation['is_valid']}")
    if validation['warnings']:
        print(f"Warnings: {validation['warnings']}")