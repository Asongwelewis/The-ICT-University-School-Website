"""
Improved AI Assistant Endpoint for ICT University ERP System

This module provides AI-powered assistance for educational tasks with:
- Proper error handling and retry mechanisms
- Dependency injection for better testability
- Configuration management
- Strategy pattern for contextual suggestions
- Enhanced Pydantic models with validation
- Clean architecture with separation of concerns
"""

from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum
import time
import asyncio
import httpx
import logging

from app.core.security import get_current_user
from app.models.profiles import User

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter()

# =====================================================
# CONFIGURATION (IMPROVED WITH TYPE HINTS)
# =====================================================

class AIServiceConfig:
    """Configuration for AI service integration with proper typing"""
    
    # Ollama Configuration
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    DEFAULT_MODEL: str = "llama2"
    
    # Request Configuration
    REQUEST_TIMEOUT: float = 30.0
    MAX_TOKENS: int = 500
    TEMPERATURE: float = 0.7
    TOP_P: float = 0.9
    
    # Retry Configuration
    MAX_RETRIES: int = 3
    RETRY_DELAY: float = 1.0
    
    def __init__(self, **kwargs):
        """Allow configuration override via kwargs"""
        for key, value in kwargs.items():
            if hasattr(self, key.upper()):
                setattr(self, key.upper(), value)

# Global configuration instance
ai_config = AIServiceConfig()

# =====================================================
# CUSTOM EXCEPTIONS (HIERARCHY)
# =====================================================

class AIServiceError(Exception):
    """Base exception for AI service errors"""
    
    def __init__(self, message: str, error_code: Optional[str] = None):
        super().__init__(message)
        self.error_code = error_code
        self.timestamp = datetime.utcnow()

class AIServiceUnavailableError(AIServiceError):
    """Raised when AI service is not available"""
    
    def __init__(self, message: str = "AI service is unavailable"):
        super().__init__(message, "SERVICE_UNAVAILABLE")

class AIServiceTimeoutError(AIServiceError):
    """Raised when AI service request times out"""
    
    def __init__(self, message: str = "AI service request timed out"):
        super().__init__(message, "REQUEST_TIMEOUT")

class AIServiceConfigurationError(AIServiceError):
    """Raised when AI service configuration is invalid"""
    
    def __init__(self, message: str = "AI service configuration error"):
        super().__init__(message, "CONFIGURATION_ERROR")

# =====================================================
# ENHANCED PYDANTIC MODELS WITH VALIDATION
# =====================================================

class MessageRole(str, Enum):
    """Enumeration for message roles with validation"""
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"

class ChatMessage(BaseModel):
    """Enhanced chat message model with comprehensive validation"""
    role: MessageRole
    content: str = Field(..., min_length=1, max_length=5000, description="Message content")
    timestamp: Optional[datetime] = Field(default_factory=datetime.utcnow)
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)
    
    @validator('content')
    def validate_content(cls, v):
        """Validate message content is not empty after stripping"""
        if not v.strip():
            raise ValueError('Message content cannot be empty or whitespace only')
        return v.strip()
    
    class Config:
        """Pydantic configuration"""
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class ChatRequest(BaseModel):
    """Enhanced chat request with comprehensive validation"""
    message: str = Field(..., min_length=1, max_length=1000, description="User message")
    context: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Request context")
    conversation_history: List[ChatMessage] = Field(
        default_factory=list, 
        max_items=50, 
        description="Previous conversation messages"
    )
    model: Optional[str] = Field(None, description="AI model to use")
    options: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Generation options")
    
    @validator('message')
    def validate_message(cls, v):
        """Validate message is not empty after stripping"""
        if not v.strip():
            raise ValueError('Message cannot be empty or whitespace only')
        return v.strip()
    
    @validator('conversation_history')
    def validate_conversation_history(cls, v):
        """Validate conversation history structure"""
        if len(v) > 50:
            raise ValueError('Conversation history cannot exceed 50 messages')
        return v

class ChatResponse(BaseModel):
    """Enhanced chat response model with metadata"""
    response: str = Field(..., description="AI generated response")
    context: Optional[Dict[str, Any]] = Field(None, description="Response context")
    suggestions: List[str] = Field(default_factory=list, description="Contextual suggestions")
    model_used: Optional[str] = Field(None, description="AI model that generated the response")
    response_time_ms: Optional[int] = Field(None, description="Response time in milliseconds")
    confidence_score: Optional[float] = Field(None, ge=0.0, le=1.0, description="Response confidence")
    
    class Config:
        """Pydantic configuration"""
        schema_extra = {
            "example": {
                "response": "I can help you with your assignment. What specific topic would you like to explore?",
                "suggestions": [
                    "Explain this assignment to me",
                    "What's the due date?",
                    "Help me break down this task"
                ],
                "model_used": "llama2",
                "response_time_ms": 1250
            }
        }

class AIServiceStatus(BaseModel):
    """AI service status model with comprehensive health information"""
    status: str = Field(..., regex="^(online|offline|degraded|maintenance)$")
    service: str = Field(..., description="Service name")
    models: List[str] = Field(default_factory=list, description="Available models")
    default_model: str = Field(..., description="Default model name")
    response_time_ms: Optional[int] = Field(None, description="Last response time")
    last_check: datetime = Field(default_factory=datetime.utcnow)
    version: Optional[str] = Field(None, description="Service version")
    uptime: Optional[str] = Field(None, description="Service uptime")

# =====================================================
# HTTP CLIENT WITH RETRY LOGIC (STRATEGY PATTERN)
# =====================================================

class RetryStrategy:
    """Base class for retry strategies"""
    
    def should_retry(self, attempt: int, exception: Exception) -> bool:
        """Determine if request should be retried"""
        return False
    
    def get_delay(self, attempt: int) -> float:
        """Get delay before next retry"""
        return 0.0

class ExponentialBackoffStrategy(RetryStrategy):
    """Exponential backoff retry strategy"""
    
    def __init__(self, max_retries: int = 3, base_delay: float = 1.0, max_delay: float = 60.0):
        self.max_retries = max_retries
        self.base_delay = base_delay
        self.max_delay = max_delay
    
    def should_retry(self, attempt: int, exception: Exception) -> bool:
        """Check if should retry based on attempt count and exception type"""
        if attempt >= self.max_retries:
            return False
        
        # Retry on timeout and server errors
        if isinstance(exception, (httpx.TimeoutException, httpx.ConnectError)):
            return True
        
        if isinstance(exception, httpx.HTTPStatusError):
            return exception.response.status_code >= 500
        
        return False
    
    def get_delay(self, attempt: int) -> float:
        """Calculate exponential backoff delay"""
        delay = self.base_delay * (2 ** attempt)
        return min(delay, self.max_delay)

class RetryableHttpClient:
    """HTTP client with configurable retry logic and proper error handling"""
    
    def __init__(self, config: AIServiceConfig, retry_strategy: Optional[RetryStrategy] = None):
        self.config = config
        self.retry_strategy = retry_strategy or ExponentialBackoffStrategy(
            max_retries=config.MAX_RETRIES,
            base_delay=config.RETRY_DELAY
        )
        self._client_config = {
            "timeout": httpx.Timeout(config.REQUEST_TIMEOUT),
            "limits": httpx.Limits(max_connections=10, max_keepalive_connections=5)
        }
    
    async def make_request(self, method: str, url: str, **kwargs) -> httpx.Response:
        """Make HTTP request with retry logic and proper error handling"""
        last_exception = None
        
        for attempt in range(self.config.MAX_RETRIES + 1):
            try:
                async with httpx.AsyncClient(**self._client_config) as client:
                    response = await getattr(client, method.lower())(url, **kwargs)
                    response.raise_for_status()
                    return response
                    
            except Exception as e:
                last_exception = e
                
                if not self.retry_strategy.should_retry(attempt, e):
                    break
                
                if attempt < self.config.MAX_RETRIES:
                    delay = self.retry_strategy.get_delay(attempt)
                    logger.warning(f"Request failed (attempt {attempt + 1}), retrying in {delay}s: {str(e)}")
                    await asyncio.sleep(delay)
                    continue
                
                break
        
        # Convert exceptions to domain-specific errors
        if isinstance(last_exception, httpx.TimeoutException):
            raise AIServiceTimeoutError("Request timeout") from last_exception
        elif isinstance(last_exception, httpx.ConnectError):
            raise AIServiceUnavailableError("Cannot connect to AI service") from last_exception
        elif isinstance(last_exception, httpx.HTTPStatusError):
            raise AIServiceError(f"HTTP error: {last_exception.response.status_code}") from last_exception
        else:
            raise AIServiceError(f"Unexpected error: {str(last_exception)}") from last_exception

# =====================================================
# AI SERVICE CLIENT (ADAPTER PATTERN)
# =====================================================

class AIServiceClient:
    """Abstract base class for AI service clients"""
    
    async def check_health(self) -> bool:
        """Check if AI service is available"""
        raise NotImplementedError
    
    async def list_models(self) -> List[str]:
        """Get available models"""
        raise NotImplementedError
    
    async def generate(self, prompt: str, model: Optional[str] = None, **options) -> str:
        """Generate response"""
        raise NotImplementedError

class OllamaClient(AIServiceClient):
    """Client for Ollama AI service with proper error handling and validation"""
    
    def __init__(self, config: AIServiceConfig, http_client: RetryableHttpClient):
        self.config = config
        self.http_client = http_client
        self.base_url = config.OLLAMA_BASE_URL.rstrip('/')
        
        # Validate configuration
        if not self.base_url:
            raise AIServiceConfigurationError("OLLAMA_BASE_URL is not configured")
    
    async def check_health(self) -> bool:
        """Check if Ollama service is available and responsive"""
        try:
            response = await self.http_client.make_request("GET", f"{self.base_url}/api/tags")
            return response.status_code == 200
        except (AIServiceError, AIServiceUnavailableError, AIServiceTimeoutError):
            return False
        except Exception as e:
            logger.error(f"Unexpected error during health check: {e}")
            return False
    
    async def list_models(self) -> List[str]:
        """Get available models from Ollama service with error handling"""
        try:
            response = await self.http_client.make_request("GET", f"{self.base_url}/api/tags")
            data = response.json()
            models = data.get("models", [])
            return [model.get("name", "") for model in models if model.get("name")]
        except (AIServiceError, AIServiceUnavailableError, AIServiceTimeoutError):
            logger.warning("Failed to fetch models from Ollama service")
            return []
        except Exception as e:
            logger.error(f"Unexpected error fetching models: {e}")
            return []
    
    async def generate(self, 
                      prompt: str, 
                      model: Optional[str] = None, 
                      **options) -> str:
        """Generate response from Ollama service with enhanced options"""
        if not prompt.strip():
            raise ValueError("Prompt cannot be empty")
        
        model = model or self.config.DEFAULT_MODEL
        
        # Prepare request data with validation
        request_data = {
            "model": model,
            "prompt": prompt.strip(),
            "stream": False,
            "options": {
                "temperature": max(0.0, min(2.0, options.get("temperature", self.config.TEMPERATURE))),
                "top_p": max(0.0, min(1.0, options.get("top_p", self.config.TOP_P))),
                "num_predict": max(1, min(2000, options.get("max_tokens", self.config.MAX_TOKENS)))
            }
        }
        
        try:
            response = await self.http_client.make_request(
                "POST", 
                f"{self.base_url}/api/generate", 
                json=request_data
            )
            result = response.json()
            
            # Validate response structure
            if "response" not in result:
                raise AIServiceError("Invalid response format from Ollama service")
            
            generated_text = result.get("response", "").strip()
            if not generated_text:
                return "I'm sorry, I couldn't generate a meaningful response. Please try rephrasing your question."
            
            return generated_text
            
        except AIServiceError:
            raise
        except Exception as e:
            logger.error(f"Unexpected error during generation: {e}")
            raise AIServiceError(f"Failed to generate response: {str(e)}") from e

# =====================================================
# AI SERVICE REPOSITORY (FACADE PATTERN)
# =====================================================

class AIServiceRepository:
    """Repository facade for AI service interactions with dependency injection"""
    
    def __init__(self, 
                 config: Optional[AIServiceConfig] = None,
                 client: Optional[AIServiceClient] = None):
        self.config = config or ai_config
        
        if client:
            self.client = client
        else:
            http_client = RetryableHttpClient(self.config)
            self.client = OllamaClient(self.config, http_client)
    
    async def check_status(self) -> bool:
        """Check if AI service is available"""
        try:
            return await self.client.check_health()
        except Exception as e:
            logger.error(f"Error checking AI service status: {e}")
            return False
    
    async def get_models(self) -> List[str]:
        """Get available models from AI service"""
        try:
            return await self.client.list_models()
        except Exception as e:
            logger.error(f"Error fetching models: {e}")
            return []
    
    async def generate_response(self, 
                               prompt: str, 
                               model: Optional[str] = None, 
                               **kwargs) -> str:
        """Generate AI response with enhanced configuration and error handling"""
        if not prompt.strip():
            raise ValueError("Prompt cannot be empty")
        
        try:
            return await self.client.generate(prompt, model, **kwargs)
        except AIServiceError:
            raise
        except Exception as e:
            logger.error(f"Unexpected error generating response: {e}")
            raise AIServiceError(f"Failed to generate response: {str(e)}") from e

# Service instance with dependency injection support
ai_service = AIServiceRepository()

# =====================================================
# SUGGESTION STRATEGIES (STRATEGY PATTERN)
# =====================================================

class SuggestionStrategy:
    """Base class for suggestion generation strategies"""
    
    def generate_suggestions(self, user_role: str, context: Dict[str, Any]) -> List[str]:
        """Generate contextual suggestions based on user role and context"""
        return []

class StudentSuggestionStrategy(SuggestionStrategy):
    """Strategy for student-specific suggestions"""
    
    def generate_suggestions(self, user_role: str, context: Dict[str, Any]) -> List[str]:
        base_suggestions = [
            "What assignments do I have due this week?",
            "Explain this concept to me",
            "Help me study for my upcoming exam",
            "What's my class schedule today?",
            "Check for new announcements"
        ]
        
        # Add context-specific suggestions
        current_page = context.get("current_page", "").lower()
        if "assignment" in current_page:
            base_suggestions.extend([
                "Break down this assignment for me",
                "What resources do I need?",
                "When is this due?"
            ])
        elif "course" in current_page:
            base_suggestions.extend([
                "What topics will be covered?",
                "Who is the instructor?",
                "What are the prerequisites?"
            ])
        
        return base_suggestions[:6]  # Limit to 6 suggestions

class TeacherSuggestionStrategy(SuggestionStrategy):
    """Strategy for teacher-specific suggestions"""
    
    def generate_suggestions(self, user_role: str, context: Dict[str, Any]) -> List[str]:
        base_suggestions = [
            "How can I create effective assignments?",
            "What grading criteria should I use?",
            "Help me plan my lesson",
            "Check student attendance patterns",
            "Generate quiz questions for this topic"
        ]
        
        current_page = context.get("current_page", "").lower()
        if "grade" in current_page:
            base_suggestions.extend([
                "Analyze class performance",
                "Identify struggling students",
                "Create grading rubric"
            ])
        
        return base_suggestions[:6]

class AdminSuggestionStrategy(SuggestionStrategy):
    """Strategy for admin-specific suggestions"""
    
    def generate_suggestions(self, user_role: str, context: Dict[str, Any]) -> List[str]:
        return [
            "Generate enrollment report",
            "Check system performance",
            "Review user activity",
            "Analyze academic trends",
            "Create administrative announcement",
            "Monitor service health"
        ]

class SuggestionGenerator:
    """Context-aware suggestion generator using Strategy pattern"""
    
    def __init__(self):
        self._strategies = {
            "student": StudentSuggestionStrategy(),
            "academic_staff": TeacherSuggestionStrategy(),
            "system_admin": AdminSuggestionStrategy(),
            "hr_personnel": AdminSuggestionStrategy(),
            "finance_staff": AdminSuggestionStrategy(),
            "marketing_team": AdminSuggestionStrategy(),
        }
        self._default_strategy = StudentSuggestionStrategy()
    
    def generate_suggestions(
        self, 
        context: Optional[Dict[str, Any]] = None, 
        user_role: str = "student"
    ) -> List[str]:
        """Generate contextual suggestions based on user role and context"""
        context = context or {}
        strategy = self._strategies.get(user_role, self._default_strategy)
        
        try:
            suggestions = strategy.generate_suggestions(user_role, context)
            return suggestions[:8]  # Limit to 8 suggestions maximum
        except Exception as e:
            logger.error(f"Error generating suggestions: {e}")
            return ["How can I help you today?", "Ask me about your studies"]

# Service instance
suggestion_generator = SuggestionGenerator()

# =====================================================
# PROMPT TEMPLATES (TEMPLATE METHOD PATTERN)
# =====================================================

class PromptTemplate:
    """Base class for prompt templates"""
    
    def build_prompt(self, user_input: str, context: Dict[str, Any]) -> str:
        """Template method for building prompts"""
        system_prompt = self._build_system_prompt(context)
        user_prompt = self._build_user_prompt(user_input, context)
        return f"{system_prompt}\n\n{user_prompt}"
    
    def _build_system_prompt(self, context: Dict[str, Any]) -> str:
        """Build system prompt - to be implemented by subclasses"""
        raise NotImplementedError
    
    def _build_user_prompt(self, user_input: str, context: Dict[str, Any]) -> str:
        """Build user prompt - can be overridden by subclasses"""
        return f"User: {user_input}\n\nAssistant:"

class EducationalPromptTemplate(PromptTemplate):
    """Prompt template for educational contexts"""
    
    SYSTEM_PROMPT_TEMPLATE = """You are an intelligent educational assistant for ICT University's ERP system. Your role is to help students, teachers, and staff with academic-related questions and tasks.

Your capabilities include:
1. Explaining academic concepts and assignments clearly
2. Helping with homework and study materials
3. Providing information about courses, schedules, and announcements
4. Answering questions about school policies and procedures
5. Assisting with academic planning and organization

Guidelines:
- Be helpful, encouraging, and educational
- Use appropriate language for {user_role}
- Provide accurate and relevant information
- Encourage learning and critical thinking
- Maintain a supportive and positive tone
- If you don't know something, admit it and suggest where to find information
- Keep responses concise but comprehensive

Current context: {context}
User role: {user_role}
User name: {user_name}
Current time: {timestamp}"""
    
    def _build_system_prompt(self, context: Dict[str, Any]) -> str:
        """Build educational system prompt with context"""
        return self.SYSTEM_PROMPT_TEMPLATE.format(
            user_role=context.get("user_role", "student"),
            user_name=context.get("user_name", "Student"),
            context=self._format_context(context),
            timestamp=datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
        )
    
    def _format_context(self, context: Dict[str, Any]) -> str:
        """Format context for inclusion in prompt"""
        relevant_context = {
            k: v for k, v in context.items() 
            if k in ["current_page", "course_id", "assignment_id", "subject"]
        }
        return str(relevant_context) if relevant_context else "General assistance"

class PromptBuilder:
    """Builder for creating AI prompts with proper context"""
    
    def __init__(self, template: Optional[PromptTemplate] = None):
        self.template = template or EducationalPromptTemplate()
    
    def build_chat_prompt(self, user_input: str, context: Dict[str, Any]) -> str:
        """Build prompt for general chat"""
        return self.template.build_prompt(user_input, context)

# =====================================================
# DEPENDENCY INJECTION
# =====================================================

def get_ai_service() -> AIServiceRepository:
    """Dependency for AI service - allows for easy testing and mocking"""
    return ai_service

def get_suggestion_generator() -> SuggestionGenerator:
    """Dependency for suggestion generator"""
    return suggestion_generator

def get_prompt_builder() -> PromptBuilder:
    """Dependency for prompt builder"""
    return PromptBuilder()

# =====================================================
# API ENDPOINTS WITH ENHANCED ERROR HANDLING
# =====================================================

@router.get("/status", response_model=AIServiceStatus)
async def get_ai_status(
    ai_svc: AIServiceRepository = Depends(get_ai_service)
) -> AIServiceStatus:
    """Get AI service status with comprehensive health information"""
    start_time = time.time()
    
    try:
        # Check service availability
        is_running = await ai_svc.check_status()
        
        # Get available models if service is running
        models = []
        if is_running:
            try:
                models = await ai_svc.get_models()
            except Exception as e:
                logger.warning(f"Could not fetch models: {e}")
        
        response_time = int((time.time() - start_time) * 1000)
        
        return AIServiceStatus(
            status="online" if is_running else "offline",
            service="Ollama",
            models=models,
            default_model=ai_config.DEFAULT_MODEL,
            response_time_ms=response_time,
            version="1.0.0"
        )
        
    except Exception as e:
        logger.error(f"Error checking AI service status: {e}")
        response_time = int((time.time() - start_time) * 1000)
        
        return AIServiceStatus(
            status="degraded",
            service="Ollama",
            models=[],
            default_model=ai_config.DEFAULT_MODEL,
            response_time_ms=response_time,
            version="1.0.0"
        )

@router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    ai_svc: AIServiceRepository = Depends(get_ai_service),
    suggestion_gen: SuggestionGenerator = Depends(get_suggestion_generator),
    prompt_builder: PromptBuilder = Depends(get_prompt_builder)
) -> ChatResponse:
    """Chat with AI assistant with enhanced error handling and performance tracking"""
    start_time = time.time()
    
    try:
        # Check service availability first
        if not await ai_svc.check_status():
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail={
                    "error": "AI service unavailable",
                    "message": "The AI service is currently not available. Please ensure Ollama is running and try again.",
                    "suggestions": ["Check if Ollama is installed and running", "Try again in a few moments"]
                }
            )
        
        # Prepare enhanced context
        context = request.context.copy()
        context.update({
            "user_id": str(current_user.id),
            "user_role": getattr(current_user, 'role', 'student'),
            "user_name": getattr(current_user, 'full_name', 'Student'),
            "timestamp": datetime.utcnow().isoformat(),
            "conversation_length": len(request.conversation_history)
        })
        
        # Build prompt using template
        prompt = prompt_builder.build_chat_prompt(request.message, context)
        
        # Generate AI response with options
        generation_options = request.options.copy()
        ai_response = await ai_svc.generate_response(
            prompt=prompt,
            model=request.model,
            **generation_options
        )
        
        # Generate contextual suggestions
        suggestions = suggestion_gen.generate_suggestions(
            context=context,
            user_role=context.get("user_role", "student")
        )
        
        response_time = int((time.time() - start_time) * 1000)
        
        return ChatResponse(
            response=ai_response,
            context=context,
            suggestions=suggestions,
            model_used=request.model or ai_config.DEFAULT_MODEL,
            response_time_ms=response_time,
            confidence_score=0.85  # Could be calculated based on response quality
        )
        
    except AIServiceUnavailableError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "error": "Service unavailable",
                "message": str(e),
                "error_code": e.error_code
            }
        )
    except AIServiceTimeoutError as e:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail={
                "error": "Request timeout",
                "message": str(e),
                "error_code": e.error_code
            }
        )
    except AIServiceError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "AI service error",
                "message": str(e),
                "error_code": getattr(e, 'error_code', 'UNKNOWN_ERROR')
            }
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "error": "Invalid request",
                "message": str(e)
            }
        )
    except Exception as e:
        logger.error(f"Unexpected error in chat endpoint: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "Internal server error",
                "message": "An unexpected error occurred while processing your request"
            }
        )

@router.post("/explain-text")
async def explain_text(
    text: str = Field(..., min_length=1, max_length=2000, description="Text to explain"),
    context: Optional[Dict[str, Any]] = None,
    current_user: User = Depends(get_current_user),
    ai_svc: AIServiceRepository = Depends(get_ai_service)
):
    """Explain text with enhanced validation and error handling"""
    start_time = time.time()
    
    try:
        # Validate input
        if not text.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Text to explain cannot be empty"
            )
        
        # Check service availability
        if not await ai_svc.check_status():
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="AI service is not available"
            )
        
        # Prepare context for text explanation
        user_context = context or {}
        user_context.update({
            "user_id": str(current_user.id),
            "user_role": getattr(current_user, 'role', 'student'),
            "task": "text_explanation",
            "text_length": len(text)
        })
        
        # Build explanation prompt
        user_role = user_context.get("user_role", "student")
        complexity_level = "simple" if user_role == "student" else "detailed"
        
        prompt = f"""Please explain this text in {complexity_level} terms suitable for a {user_role}:

Text to explain: "{text.strip()}"

Provide a clear, educational explanation that helps the user understand the content better."""
        
        explanation = await ai_svc.generate_response(prompt)
        response_time = int((time.time() - start_time) * 1000)
        
        return {
            "explanation": explanation,
            "original_text": text.strip(),
            "context": user_context,
            "response_time_ms": response_time
        }
        
    except AIServiceError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI service error: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Unexpected error in explain-text endpoint: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred"
        )

@router.get("/functions")
async def get_ai_functions():
    """Get available AI functions with detailed categorization and examples"""
    functions = [
        {
            "name": "explain_assignment",
            "description": "Explain assignment requirements and help break down complex tasks into manageable steps",
            "parameters": {
                "assignment_id": {"type": "string", "description": "Unique assignment identifier"},
                "specific_question": {"type": "string", "description": "Specific aspect to explain"}
            },
            "category": "academic",
            "examples": [
                "Explain the requirements for assignment CS101-A1",
                "Help me understand what's expected in this essay"
            ]
        },
        {
            "name": "check_announcements",
            "description": "Check for new announcements and important updates from courses and administration",
            "parameters": {
                "date_range": {"type": "string", "description": "Date range to check (e.g., 'last_week', 'today')"},
                "category": {"type": "string", "description": "Announcement category filter"}
            },
            "category": "information",
            "examples": [
                "Check for new announcements this week",
                "Any important updates from my courses?"
            ]
        },
        {
            "name": "get_schedule",
            "description": "Get class schedule and upcoming events with smart filtering options",
            "parameters": {
                "date": {"type": "string", "description": "Specific date or range"},
                "include_assignments": {"type": "boolean", "description": "Include assignment due dates"}
            },
            "category": "scheduling",
            "examples": [
                "What's my schedule for tomorrow?",
                "Show me this week's classes and assignments"
            ]
        },
        {
            "name": "study_help",
            "description": "Provide personalized study tips and learning resources for specific topics",
            "parameters": {
                "subject": {"type": "string", "description": "Subject area"},
                "topic": {"type": "string", "description": "Specific topic or concept"},
                "difficulty": {"type": "string", "description": "Difficulty level (beginner, intermediate, advanced)"}
            },
            "category": "learning",
            "examples": [
                "Help me study calculus derivatives",
                "What's the best way to learn programming?"
            ]
        },
        {
            "name": "grade_analysis",
            "description": "Analyze academic performance and provide improvement suggestions",
            "parameters": {
                "course_id": {"type": "string", "description": "Course identifier"},
                "time_period": {"type": "string", "description": "Analysis time period"}
            },
            "category": "analytics",
            "examples": [
                "How am I performing in my math course?",
                "What areas need improvement?"
            ]
        }
    ]
    
    categories = {
        "academic": {
            "name": "Academic Support",
            "description": "Assignment help, course explanations, and academic guidance",
            "icon": "📚"
        },
        "information": {
            "name": "Information Retrieval",
            "description": "Announcements, updates, and important notifications",
            "icon": "📢"
        },
        "scheduling": {
            "name": "Schedule Management",
            "description": "Class schedules, events, and time management",
            "icon": "📅"
        },
        "learning": {
            "name": "Learning Support",
            "description": "Study tips, resources, and learning strategies",
            "icon": "🎓"
        },
        "analytics": {
            "name": "Performance Analytics",
            "description": "Grade analysis and performance insights",
            "icon": "📊"
        }
    }
    
    return {
        "functions": functions,
        "categories": categories,
        "total_functions": len(functions),
        "version": "1.0.0",
        "last_updated": datetime.utcnow().isoformat()
    }

@router.get("/health")
async def health_check(ai_svc: AIServiceRepository = Depends(get_ai_service)):
    """Comprehensive health check endpoint for monitoring"""
    start_time = time.time()
    
    try:
        # Check AI service
        ai_status = await ai_svc.check_status()
        
        # Check models availability
        models = []
        if ai_status:
            try:
                models = await ai_svc.get_models()
            except Exception:
                pass
        
        response_time = int((time.time() - start_time) * 1000)
        
        health_status = {
            "status": "healthy" if ai_status else "degraded",
            "timestamp": datetime.utcnow().isoformat(),
            "response_time_ms": response_time,
            "services": {
                "ai_service": {
                    "status": "online" if ai_status else "offline",
                    "models_available": len(models),
                    "default_model": ai_config.DEFAULT_MODEL
                }
            },
            "version": "1.0.0"
        }
        
        return health_status
        
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "unhealthy",
            "timestamp": datetime.utcnow().isoformat(),
            "error": str(e),
            "response_time_ms": int((time.time() - start_time) * 1000)
        }