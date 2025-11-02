# AI Assistant Endpoint - Code Analysis & Improvements

## Overview
Analysis of the newly created AI assistant endpoint (`ai_assistant.py`) for the ICT University ERP System. This document identifies code smells, design issues, and provides specific improvement recommendations.

## 🔍 Code Smells Identified

### 1. **Magic Numbers and Hardcoded Values**
**Issue**: Multiple hardcoded values scattered throughout the code
```python
# Current problematic code
OLLAMA_BASE_URL = "http://localhost:11434"
DEFAULT_MODEL = "llama2"
timeout=30.0
"max_tokens": 500
"temperature": 0.7
```

**Impact**: Makes configuration inflexible and testing difficult

### 2. **Long Method with Multiple Responsibilities**
**Issue**: `generate_ai_response()` method is doing too much
- Building system prompts
- Preparing requests
- Making HTTP calls
- Error handling
- Response processing

**Impact**: Violates Single Responsibility Principle, hard to test and maintain

### 3. **Repetitive Code Patterns**
**Issue**: Similar HTTP client patterns repeated across functions
```python
# Repeated pattern in check_ollama_status() and get_available_models()
async with httpx.AsyncClient() as client:
    response = await client.get(f"{OLLAMA_BASE_URL}/api/tags")
```

### 4. **Broad Exception Handling**
**Issue**: Generic `except Exception:` catches all errors
```python
except Exception:
    return False  # Lost error information
```

**Impact**: Makes debugging difficult and hides important error details

### 5. **Large Conditional Chain**
**Issue**: `generate_suggestions()` has a long if-elif chain
```python
if "assignments" in current_page.lower():
    # ...
elif "courses" in current_page.lower():
    # ...
elif "grades" in current_page.lower():
    # ...
# ... continues
```

**Impact**: Difficult to extend and maintain

## 🏗️ Design Pattern Recommendations

### 1. **Configuration Pattern**
Create a dedicated configuration class for AI service settings.

### 2. **Strategy Pattern**
Use Strategy pattern for different suggestion generation strategies.

### 3. **Factory Pattern**
Implement Factory pattern for creating different types of AI prompts.

### 4. **Repository Pattern**
Create a repository for AI service interactions.

## 📋 Specific Improvement Recommendations

### 1. **Extract Configuration Class**

**Current Issue**: Hardcoded configuration values
**Solution**: Create a dedicated configuration class

```python
# NEW: app/core/ai_config.py
from pydantic import BaseModel
from typing import Dict, Any
import os

class AIServiceConfig(BaseModel):
    """Configuration for AI service integration"""
    
    # Ollama Configuration
    ollama_base_url: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    default_model: str = os.getenv("OLLAMA_DEFAULT_MODEL", "llama2")
    
    # Request Configuration
    request_timeout: float = float(os.getenv("AI_REQUEST_TIMEOUT", "30.0"))
    max_tokens: int = int(os.getenv("AI_MAX_TOKENS", "500"))
    temperature: float = float(os.getenv("AI_TEMPERATURE", "0.7"))
    top_p: float = float(os.getenv("AI_TOP_P", "0.9"))
    
    # Retry Configuration
    max_retries: int = int(os.getenv("AI_MAX_RETRIES", "3"))
    retry_delay: float = float(os.getenv("AI_RETRY_DELAY", "1.0"))
    
    class Config:
        env_file = ".env"
        case_sensitive = False

# Usage
ai_config = AIServiceConfig()
```

### 2. **Create AI Service Repository**

**Current Issue**: Direct HTTP calls scattered throughout endpoints
**Solution**: Centralize AI service interactions

```python
# NEW: app/services/ai_service.py
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
import httpx
import asyncio
from app.core.ai_config import ai_config
from app.core.exceptions import AIServiceError, AIServiceUnavailableError

class AIServiceInterface(ABC):
    """Abstract interface for AI services"""
    
    @abstractmethod
    async def check_status(self) -> bool:
        pass
    
    @abstractmethod
    async def get_models(self) -> List[str]:
        pass
    
    @abstractmethod
    async def generate_response(self, prompt: str, model: str = None, **kwargs) -> str:
        pass

class OllamaService(AIServiceInterface):
    """Ollama AI service implementation with proper error handling and retries"""
    
    def __init__(self, config: AIServiceConfig = ai_config):
        self.config = config
        self._client_config = {
            "timeout": httpx.Timeout(self.config.request_timeout),
            "limits": httpx.Limits(max_connections=10, max_keepalive_connections=5)
        }
    
    async def _make_request(self, method: str, endpoint: str, **kwargs) -> httpx.Response:
        """Make HTTP request with retry logic"""
        last_exception = None
        
        for attempt in range(self.config.max_retries):
            try:
                async with httpx.AsyncClient(**self._client_config) as client:
                    url = f"{self.config.ollama_base_url}{endpoint}"
                    response = await getattr(client, method.lower())(url, **kwargs)
                    response.raise_for_status()
                    return response
                    
            except httpx.TimeoutException as e:
                last_exception = e
                if attempt < self.config.max_retries - 1:
                    await asyncio.sleep(self.config.retry_delay * (attempt + 1))
                    continue
                raise AIServiceUnavailableError("AI service timeout") from e
                
            except httpx.HTTPStatusError as e:
                if e.response.status_code >= 500:
                    last_exception = e
                    if attempt < self.config.max_retries - 1:
                        await asyncio.sleep(self.config.retry_delay * (attempt + 1))
                        continue
                raise AIServiceError(f"AI service error: {e.response.status_code}") from e
                
            except Exception as e:
                raise AIServiceError(f"Unexpected AI service error: {str(e)}") from e
        
        raise AIServiceUnavailableError("AI service unavailable after retries") from last_exception
    
    async def check_status(self) -> bool:
        """Check if Ollama service is available"""
        try:
            await self._make_request("GET", "/api/tags")
            return True
        except (AIServiceError, AIServiceUnavailableError):
            return False
    
    async def get_models(self) -> List[str]:
        """Get available models from Ollama"""
        try:
            response = await self._make_request("GET", "/api/tags")
            data = response.json()
            return [model["name"] for model in data.get("models", [])]
        except (AIServiceError, AIServiceUnavailableError):
            return []
    
    async def generate_response(
        self, 
        prompt: str, 
        model: str = None, 
        **kwargs
    ) -> str:
        """Generate AI response using Ollama"""
        model = model or self.config.default_model
        
        request_data = {
            "model": model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": kwargs.get("temperature", self.config.temperature),
                "top_p": kwargs.get("top_p", self.config.top_p),
                "max_tokens": kwargs.get("max_tokens", self.config.max_tokens)
            }
        }
        
        response = await self._make_request("POST", "/api/generate", json=request_data)
        result = response.json()
        return result.get("response", "I'm sorry, I couldn't generate a response.")

# Service instance
ai_service = OllamaService()
```

### 3. **Implement Strategy Pattern for Suggestions**

**Current Issue**: Long if-elif chain for suggestion generation
**Solution**: Use Strategy pattern for different contexts

```python
# NEW: app/services/suggestion_strategies.py
from abc import ABC, abstractmethod
from typing import List, Dict, Any
from enum import Enum

class SuggestionContext(Enum):
    ASSIGNMENTS = "assignments"
    COURSES = "courses"
    GRADES = "grades"
    SCHEDULE = "schedule"
    DEFAULT = "default"

class SuggestionStrategy(ABC):
    """Abstract strategy for generating contextual suggestions"""
    
    @abstractmethod
    def generate_suggestions(self, user_role: str, context: Dict[str, Any]) -> List[str]:
        pass

class AssignmentSuggestionStrategy(SuggestionStrategy):
    def generate_suggestions(self, user_role: str, context: Dict[str, Any]) -> List[str]:
        base_suggestions = [
            "Explain this assignment to me",
            "What's the due date for this assignment?",
            "Help me break down this task",
            "What resources do I need for this?"
        ]
        
        if user_role == "academic_staff":
            base_suggestions.extend([
                "How can I create effective assignments?",
                "What grading criteria should I use?"
            ])
        
        return base_suggestions

class CourseSuggestionStrategy(SuggestionStrategy):
    def generate_suggestions(self, user_role: str, context: Dict[str, Any]) -> List[str]:
        return [
            "Tell me about this course",
            "What topics will we cover?",
            "How can I prepare for this class?",
            "What are the prerequisites?"
        ]

class GradeSuggestionStrategy(SuggestionStrategy):
    def generate_suggestions(self, user_role: str, context: Dict[str, Any]) -> List[str]:
        return [
            "How can I improve my grades?",
            "Explain my grade calculation",
            "What assignments am I missing?",
            "Study tips for this subject"
        ]

class ScheduleSuggestionStrategy(SuggestionStrategy):
    def generate_suggestions(self, user_role: str, context: Dict[str, Any]) -> List[str]:
        return [
            "What's my next class?",
            "Where is this classroom located?",
            "What should I bring to class?",
            "How long is this class?"
        ]

class DefaultSuggestionStrategy(SuggestionStrategy):
    def generate_suggestions(self, user_role: str, context: Dict[str, Any]) -> List[str]:
        return [
            "What assignments do I have due?",
            "Check for new announcements",
            "What's my schedule today?",
            "Help me with my studies"
        ]

class SuggestionGenerator:
    """Context-aware suggestion generator using Strategy pattern"""
    
    def __init__(self):
        self._strategies = {
            SuggestionContext.ASSIGNMENTS: AssignmentSuggestionStrategy(),
            SuggestionContext.COURSES: CourseSuggestionStrategy(),
            SuggestionContext.GRADES: GradeSuggestionStrategy(),
            SuggestionContext.SCHEDULE: ScheduleSuggestionStrategy(),
            SuggestionContext.DEFAULT: DefaultSuggestionStrategy(),
        }
    
    def generate_suggestions(
        self, 
        context: Dict[str, Any] = None, 
        user_role: str = "student"
    ) -> List[str]:
        """Generate contextual suggestions based on current page and user role"""
        if not context:
            strategy = self._strategies[SuggestionContext.DEFAULT]
            return strategy.generate_suggestions(user_role, context or {})
        
        current_page = context.get("current_page", "").lower()
        
        # Determine context from current page
        suggestion_context = SuggestionContext.DEFAULT
        for context_type in SuggestionContext:
            if context_type.value in current_page:
                suggestion_context = context_type
                break
        
        strategy = self._strategies[suggestion_context]
        return strategy.generate_suggestions(user_role, context)

# Service instance
suggestion_generator = SuggestionGenerator()
```

### 4. **Create Prompt Factory**

**Current Issue**: Hardcoded prompt templates
**Solution**: Factory pattern for different prompt types

```python
# NEW: app/services/prompt_factory.py
from abc import ABC, abstractmethod
from typing import Dict, Any
from enum import Enum

class PromptType(Enum):
    EDUCATIONAL_CHAT = "educational_chat"
    TEXT_EXPLANATION = "text_explanation"
    ASSIGNMENT_HELP = "assignment_help"
    STUDY_GUIDANCE = "study_guidance"

class PromptTemplate(ABC):
    """Abstract base class for prompt templates"""
    
    @abstractmethod
    def build_prompt(self, user_input: str, context: Dict[str, Any]) -> str:
        pass

class EducationalChatPrompt(PromptTemplate):
    """Template for general educational chat"""
    
    SYSTEM_TEMPLATE = """You are an intelligent educational assistant for a school ERP system. Your role is to help students, teachers, and staff with academic-related questions and tasks.

Your capabilities include:
1. Explaining academic concepts and assignments
2. Helping with homework and study materials
3. Providing information about courses, schedules, and announcements
4. Answering questions about school policies and procedures
5. Assisting with academic planning and organization

Guidelines:
- Be helpful, encouraging, and educational
- Use age-appropriate language for {user_role}
- Provide accurate and relevant information
- Encourage learning and critical thinking
- Maintain a supportive and positive tone
- If you don't know something, admit it and suggest where to find the information

Current context: {context}
User role: {user_role}
User name: {user_name}
"""
    
    def build_prompt(self, user_input: str, context: Dict[str, Any]) -> str:
        system_prompt = self.SYSTEM_TEMPLATE.format(
            user_role=context.get("user_role", "student"),
            user_name=context.get("user_name", "Student"),
            context=str(context)
        )
        return f"System: {system_prompt}\n\nUser: {user_input}\n\nAssistant:"

class TextExplanationPrompt(PromptTemplate):
    """Template for explaining specific text content"""
    
    def build_prompt(self, user_input: str, context: Dict[str, Any]) -> str:
        user_role = context.get("user_role", "student")
        difficulty_level = "simple" if user_role == "student" else "detailed"
        
        return f"""Please explain this text in {difficulty_level} terms suitable for a {user_role}: 
        
Text to explain: "{user_input}"

Provide a clear, educational explanation that helps the user understand the concept better."""

class PromptFactory:
    """Factory for creating different types of prompts"""
    
    def __init__(self):
        self._templates = {
            PromptType.EDUCATIONAL_CHAT: EducationalChatPrompt(),
            PromptType.TEXT_EXPLANATION: TextExplanationPrompt(),
            # Add more prompt types as needed
        }
    
    def create_prompt(
        self, 
        prompt_type: PromptType, 
        user_input: str, 
        context: Dict[str, Any]
    ) -> str:
        """Create a prompt of the specified type"""
        if prompt_type not in self._templates:
            raise ValueError(f"Unknown prompt type: {prompt_type}")
        
        template = self._templates[prompt_type]
        return template.build_prompt(user_input, context)

# Factory instance
prompt_factory = PromptFactory()
```

### 5. **Improved Exception Handling**

**Current Issue**: Generic exception handling loses error information
**Solution**: Custom exception hierarchy

```python
# NEW: app/core/exceptions.py (add to existing file)
class AIServiceError(Exception):
    """Base exception for AI service errors"""
    pass

class AIServiceUnavailableError(AIServiceError):
    """Raised when AI service is not available"""
    pass

class AIServiceTimeoutError(AIServiceError):
    """Raised when AI service request times out"""
    pass

class AIModelNotFoundError(AIServiceError):
    """Raised when requested AI model is not available"""
    pass
```

### 6. **Enhanced Pydantic Models**

**Current Issue**: Basic models without validation
**Solution**: Enhanced models with proper validation

```python
# IMPROVED: Enhanced Pydantic models
from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class MessageRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"

class ChatMessage(BaseModel):
    """Enhanced chat message model with validation"""
    role: MessageRole
    content: str = Field(..., min_length=1, max_length=5000)
    timestamp: Optional[datetime] = Field(default_factory=datetime.utcnow)
    
    @validator('content')
    def validate_content(cls, v):
        if not v.strip():
            raise ValueError('Message content cannot be empty')
        return v.strip()

class ChatRequest(BaseModel):
    """Enhanced chat request with validation"""
    message: str = Field(..., min_length=1, max_length=1000)
    context: Optional[Dict[str, Any]] = Field(default_factory=dict)
    conversation_history: List[ChatMessage] = Field(default_factory=list, max_items=50)
    model: Optional[str] = None
    
    @validator('message')
    def validate_message(cls, v):
        if not v.strip():
            raise ValueError('Message cannot be empty')
        return v.strip()
    
    @validator('conversation_history')
    def validate_history_length(cls, v):
        if len(v) > 50:
            raise ValueError('Conversation history too long')
        return v

class ChatResponse(BaseModel):
    """Enhanced chat response model"""
    response: str
    context: Optional[Dict[str, Any]] = None
    suggestions: List[str] = Field(default_factory=list)
    model_used: Optional[str] = None
    response_time_ms: Optional[int] = None
    
class AIServiceStatus(BaseModel):
    """AI service status model"""
    status: str = Field(..., regex="^(online|offline|degraded)$")
    service: str
    models: List[str] = Field(default_factory=list)
    default_model: str
    response_time_ms: Optional[int] = None
    last_check: datetime = Field(default_factory=datetime.utcnow)
```

### 7. **Refactored Endpoint with Dependency Injection**

**Current Issue**: Endpoints directly instantiate services
**Solution**: Use dependency injection for better testability

```python
# IMPROVED: Refactored endpoints with proper structure
from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Dict, Any, Optional
import time
from datetime import datetime

from app.core.security import get_current_user
from app.models.profiles import User
from app.services.ai_service import ai_service, AIServiceInterface
from app.services.suggestion_strategies import suggestion_generator
from app.services.prompt_factory import prompt_factory, PromptType
from app.core.exceptions import AIServiceError, AIServiceUnavailableError

router = APIRouter()

# Dependency injection
def get_ai_service() -> AIServiceInterface:
    """Dependency for AI service"""
    return ai_service

@router.get("/status", response_model=AIServiceStatus)
async def get_ai_status(
    ai_svc: AIServiceInterface = Depends(get_ai_service)
) -> AIServiceStatus:
    """Get AI service status with performance metrics"""
    start_time = time.time()
    
    try:
        is_running = await ai_svc.check_status()
        models = await ai_svc.get_models() if is_running else []
        
        response_time = int((time.time() - start_time) * 1000)
        
        return AIServiceStatus(
            status="online" if is_running else "offline",
            service="Ollama",
            models=models,
            default_model=ai_config.default_model,
            response_time_ms=response_time
        )
        
    except Exception as e:
        return AIServiceStatus(
            status="degraded",
            service="Ollama",
            models=[],
            default_model=ai_config.default_model,
            response_time_ms=int((time.time() - start_time) * 1000)
        )

@router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    ai_svc: AIServiceInterface = Depends(get_ai_service)
) -> ChatResponse:
    """Chat with AI assistant with improved error handling and performance tracking"""
    start_time = time.time()
    
    try:
        # Check service availability
        if not await ai_svc.check_status():
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="AI service is not available. Please ensure Ollama is running."
            )
        
        # Prepare enhanced context
        context = request.context.copy()
        context.update({
            "user_id": str(current_user.id),
            "user_role": getattr(current_user, 'role', 'student'),
            "user_name": getattr(current_user, 'full_name', 'Student'),
            "timestamp": datetime.utcnow().isoformat()
        })
        
        # Build prompt using factory
        prompt = prompt_factory.create_prompt(
            PromptType.EDUCATIONAL_CHAT,
            request.message,
            context
        )
        
        # Generate AI response
        ai_response = await ai_svc.generate_response(
            prompt=prompt,
            model=request.model
        )
        
        # Generate contextual suggestions
        suggestions = suggestion_generator.generate_suggestions(
            context=context,
            user_role=context.get("user_role", "student")
        )
        
        response_time = int((time.time() - start_time) * 1000)
        
        return ChatResponse(
            response=ai_response,
            context=context,
            suggestions=suggestions,
            model_used=request.model or ai_config.default_model,
            response_time_ms=response_time
        )
        
    except AIServiceUnavailableError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI service is temporarily unavailable"
        )
    except AIServiceError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI service error: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred"
        )

@router.post("/explain-text")
async def explain_text(
    text: str = Field(..., min_length=1, max_length=2000),
    context: Optional[Dict[str, Any]] = None,
    current_user: User = Depends(get_current_user),
    ai_svc: AIServiceInterface = Depends(get_ai_service)
):
    """Explain text with improved validation and error handling"""
    try:
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
            "task": "text_explanation"
        })
        
        # Build explanation prompt
        prompt = prompt_factory.create_prompt(
            PromptType.TEXT_EXPLANATION,
            text,
            user_context
        )
        
        explanation = await ai_svc.generate_response(prompt)
        
        return {
            "explanation": explanation,
            "original_text": text,
            "context": user_context
        }
        
    except AIServiceError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI service error: {str(e)}"
        )
```

## 🧪 Testing Improvements

### 1. **Unit Test Structure**

```python
# NEW: tests/test_ai_assistant.py
import pytest
from unittest.mock import AsyncMock, Mock
from fastapi.testclient import TestClient
from app.services.ai_service import OllamaService
from app.services.suggestion_strategies import SuggestionGenerator

class TestOllamaService:
    @pytest.fixture
    def ai_service(self):
        return OllamaService()
    
    @pytest.mark.asyncio
    async def test_check_status_success(self, ai_service, httpx_mock):
        httpx_mock.add_response(
            method="GET",
            url="http://localhost:11434/api/tags",
            status_code=200
        )
        
        result = await ai_service.check_status()
        assert result is True
    
    @pytest.mark.asyncio
    async def test_generate_response_success(self, ai_service, httpx_mock):
        httpx_mock.add_response(
            method="POST",
            url="http://localhost:11434/api/generate",
            json={"response": "Test response"},
            status_code=200
        )
        
        result = await ai_service.generate_response("Test prompt")
        assert result == "Test response"

class TestSuggestionGenerator:
    def test_assignment_suggestions(self):
        generator = SuggestionGenerator()
        context = {"current_page": "assignments"}
        
        suggestions = generator.generate_suggestions(context, "student")
        
        assert "Explain this assignment to me" in suggestions
        assert len(suggestions) > 0
```

## 📊 Performance Improvements

### 1. **Connection Pooling**
- Implement HTTP connection pooling for better performance
- Add request/response caching for frequently asked questions

### 2. **Async Optimization**
- Use asyncio.gather() for concurrent operations
- Implement request batching for multiple AI calls

### 3. **Monitoring and Metrics**
- Add response time tracking
- Implement health check endpoints
- Add usage analytics

## 🔒 Security Enhancements

### 1. **Input Validation**
- Sanitize user inputs to prevent prompt injection
- Implement rate limiting for AI requests
- Add content filtering for inappropriate requests

### 2. **Authentication & Authorization**
- Verify user permissions for different AI functions
- Log AI interactions for audit purposes

## 📈 Benefits of These Improvements

1. **Maintainability**: Cleaner separation of concerns, easier to modify and extend
2. **Testability**: Dependency injection makes unit testing straightforward
3. **Reliability**: Better error handling and retry mechanisms
4. **Performance**: Connection pooling and async optimizations
5. **Security**: Input validation and proper error handling
6. **Scalability**: Modular design allows easy addition of new AI providers
7. **Configuration**: Environment-based configuration for different deployments

## 🚀 Implementation Priority

1. **High Priority**: Configuration class, exception handling, Pydantic model improvements
2. **Medium Priority**: Service repository, strategy pattern for suggestions
3. **Low Priority**: Prompt factory, advanced monitoring, caching

## 📝 Migration Notes

- These changes are backward compatible
- Can be implemented incrementally
- Existing endpoints will continue to work during migration
- Tests should be added before refactoring existing code

This refactoring transforms the AI assistant from a simple endpoint into a robust, maintainable, and scalable service that follows enterprise-level best practices.