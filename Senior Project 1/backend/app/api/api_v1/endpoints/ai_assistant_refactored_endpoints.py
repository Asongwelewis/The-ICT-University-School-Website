"""
Refactored AI Assistant Endpoints with Improved Architecture
Demonstrates clean endpoint design with proper separation of concerns
"""

from fastapi import APIRouter, HTTPException, Depends, status, BackgroundTasks
from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from datetime import datetime
import time
import logging
import uuid

from app.core.security import get_current_user
from app.models.profiles import User
from .ai_assistant_refactored_services import (
    AIService, AIRequest, AIResponse, AIServiceError,
    AIServiceUnavailableError, AIServiceTimeoutError, AIServiceRateLimitError,
    get_ai_service
)
from .ai_assistant_refactored_config import get_ai_config

logger = logging.getLogger(__name__)

router = APIRouter()

# =====================================================
# ENHANCED REQUEST/RESPONSE MODELS
# =====================================================

class ChatMessageRole(str, Enum):
    """Enumeration for chat message roles"""
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"

class ChatMessage(BaseModel):
    """Enhanced chat message model with validation"""
    role: ChatMessageRole
    content: str = Field(..., min_length=1, max_length=5000)
    timestamp: Optional[datetime] = Field(default_factory=datetime.utcnow)
    
    @validator('content')
    def validate_content(cls, v):
        if not v.strip():
            raise ValueError('Message content cannot be empty')
        return v.strip()

class ChatRequest(BaseModel):
    """Enhanced chat request with comprehensive validation"""
    message: str = Field(..., min_length=1, max_length=2000, description="User message")
    context: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Additional context")
    conversation_history: List[ChatMessage] = Field(
        default_factory=list, 
        max_items=50,
        description="Previous conversation messages"
    )
    model: Optional[str] = Field(None, description="Specific AI model to use")
    options: Optional[Dict[str, Any]] = Field(default_factory=dict, description="AI generation options")
    
    @validator('message')
    def validate_message(cls, v):
        if not v.strip():
            raise ValueError('Message cannot be empty')
        return v.strip()
    
    @validator('options')
    def validate_options(cls, v):
        """Validate AI generation options"""
        allowed_options = {'temperature', 'top_p', 'max_tokens'}
        invalid_options = set(v.keys()) - allowed_options
        if invalid_options:
            raise ValueError(f'Invalid options: {invalid_options}. Allowed: {allowed_options}')
        
        # Validate option ranges
        if 'temperature' in v and not (0.0 <= v['temperature'] <= 2.0):
            raise ValueError('Temperature must be between 0.0 and 2.0')
        if 'top_p' in v and not (0.0 <= v['top_p'] <= 1.0):
            raise ValueError('Top_p must be between 0.0 and 1.0')
        if 'max_tokens' in v and not (1 <= v['max_tokens'] <= 4000):
            raise ValueError('Max_tokens must be between 1 and 4000')
        
        return v

class ChatResponse(BaseModel):
    """Enhanced chat response model with comprehensive metadata"""
    response: str = Field(..., description="AI generated response")
    context: Optional[Dict[str, Any]] = Field(None, description="Response context")
    suggestions: List[str] = Field(default_factory=list, description="Contextual suggestions")
    model_used: str = Field(..., description="AI model that generated the response")
    response_time_ms: int = Field(..., description="Response generation time in milliseconds")
    request_id: str = Field(..., description="Unique request identifier")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional response metadata")

class ExplainTextRequest(BaseModel):
    """Request model for text explanation"""
    text: str = Field(..., min_length=1, max_length=2000, description="Text to explain")
    context: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Explanation context")
    difficulty_level: Optional[str] = Field(
        "intermediate", 
        regex="^(beginner|intermediate|advanced)$",
        description="Explanation difficulty level"
    )
    
    @validator('text')
    def validate_text(cls, v):
        if not v.strip():
            raise ValueError('Text cannot be empty')
        return v.strip()

class ExplainTextResponse(BaseModel):
    """Response model for text explanation"""
    explanation: str = Field(..., description="Generated explanation")
    original_text: str = Field(..., description="Original text that was explained")
    difficulty_level: str = Field(..., description="Explanation difficulty level")
    context: Dict[str, Any] = Field(..., description="Explanation context")
    request_id: str = Field(..., description="Unique request identifier")

class AIServiceStatusResponse(BaseModel):
    """Enhanced AI service status response"""
    status: str = Field(..., regex="^(healthy|unhealthy|degraded|error)$")
    service: str = Field(..., description="AI service name")
    models: List[str] = Field(default_factory=list, description="Available AI models")
    default_model: str = Field(..., description="Default AI model")
    response_time_ms: Optional[int] = Field(None, description="Health check response time")
    circuit_breaker_enabled: bool = Field(False, description="Circuit breaker status")
    last_check: str = Field(..., description="Last health check timestamp")
    error: Optional[str] = Field(None, description="Error message if status is error")

class AIFunctionInfo(BaseModel):
    """Information about available AI functions"""
    name: str = Field(..., description="Function name")
    description: str = Field(..., description="Function description")
    parameters: Dict[str, str] = Field(..., description="Function parameters")
    category: str = Field(..., description="Function category")
    examples: Optional[List[str]] = Field(default_factory=list, description="Usage examples")

class AIFunctionsResponse(BaseModel):
    """Response for available AI functions"""
    functions: List[AIFunctionInfo] = Field(..., description="Available AI functions")
    categories: List[str] = Field(..., description="Function categories")
    total_functions: int = Field(..., description="Total number of functions")

# =====================================================
# SUGGESTION GENERATION (IMPROVED)
# =====================================================

class SuggestionStrategy(ABC):
    """Abstract base class for suggestion strategies"""
    
    @abstractmethod
    def generate_suggestions(self, user_role: str, context: Dict[str, Any]) -> List[str]:
        """Generate contextual suggestions"""
        pass

class AssignmentSuggestionStrategy(SuggestionStrategy):
    """Strategy for assignment-related suggestions"""
    
    def generate_suggestions(self, user_role: str, context: Dict[str, Any]) -> List[str]:
        base_suggestions = [
            "Explain this assignment to me",
            "What's the due date for this assignment?",
            "Help me break down this task",
            "What resources do I need for this?",
            "Show me similar examples"
        ]
        
        if user_role in ["academic_staff", "system_admin"]:
            base_suggestions.extend([
                "How can I create effective assignments?",
                "What grading criteria should I use?",
                "Generate assignment rubric"
            ])
        
        return base_suggestions

class CourseSuggestionStrategy(SuggestionStrategy):
    """Strategy for course-related suggestions"""
    
    def generate_suggestions(self, user_role: str, context: Dict[str, Any]) -> List[str]:
        base_suggestions = [
            "What courses am I enrolled in?",
            "Show me my course schedule",
            "What's my next class?",
            "Course materials and resources"
        ]
        
        if user_role in ["academic_staff", "system_admin"]:
            base_suggestions.extend([
                "Manage course content",
                "View student enrollment",
                "Create course announcements"
            ])
        
        return base_suggestions

class DefaultSuggestionStrategy(SuggestionStrategy):
    """Default strategy for general suggestions"""
    
    def generate_suggestions(self, user_role: str, context: Dict[str, Any]) -> List[str]:
        suggestions = [
            "What assignments do I have due?",
            "Check for new announcements",
            "What's my schedule today?",
            "Help me with my studies"
        ]
        
        if user_role == "student":
            suggestions.extend([
                "Check my grades",
                "View payment status",
                "Academic calendar"
            ])
        elif user_role in ["academic_staff", "system_admin"]:
            suggestions.extend([
                "Manage student records",
                "Create announcements",
                "Generate reports"
            ])
        
        return suggestions

class ImprovedSuggestionGenerator:
    """Improved suggestion generator with better strategy resolution"""
    
    def __init__(self):
        self._strategies = {
            "assignments": AssignmentSuggestionStrategy(),
            "courses": CourseSuggestionStrategy(),
            "default": DefaultSuggestionStrategy(),
        }
        
        # Strategy resolution rules (order matters)
        self._resolution_rules = [
            (lambda ctx: "assignment" in ctx.get("current_page", "").lower(), "assignments"),
            (lambda ctx: "course" in ctx.get("current_page", "").lower(), "courses"),
            (lambda ctx: ctx.get("context_type") == "assignment", "assignments"),
            (lambda ctx: ctx.get("context_type") == "course", "courses"),
            (lambda ctx: True, "default")  # Fallback
        ]
    
    def generate_suggestions(
        self, 
        context: Dict[str, Any] = None, 
        user_role: str = "student"
    ) -> List[str]:
        """Generate contextual suggestions with improved strategy resolution"""
        context = context or {}
        
        # Resolve strategy using rules
        strategy_name = self._resolve_strategy(context)
        strategy = self._strategies.get(strategy_name, self._strategies["default"])
        
        suggestions = strategy.generate_suggestions(user_role, context)
        
        # Limit suggestions and ensure uniqueness
        return list(dict.fromkeys(suggestions))[:8]  # Max 8 unique suggestions
    
    def _resolve_strategy(self, context: Dict[str, Any]) -> str:
        """Resolve strategy based on context using rules"""
        for rule, strategy_name in self._resolution_rules:
            if rule(context):
                return strategy_name
        return "default"

# =====================================================
# PROMPT BUILDING (IMPROVED)
# =====================================================

class PromptBuilder:
    """Enhanced prompt builder with template management"""
    
    SYSTEM_PROMPTS = {
        "chat": """You are an intelligent educational assistant for ICT University's ERP system.

Your role is to help {user_role}s with academic-related questions and tasks.

Guidelines:
- Be helpful, encouraging, and educational
- Use appropriate language for {user_role} level
- Provide accurate and relevant information
- Encourage learning and critical thinking
- Maintain a supportive and positive tone
- If uncertain, admit it and suggest where to find information

Current context: {context}
User: {user_name} ({user_role})
""",
        
        "explanation": """You are an educational content explainer for ICT University.

Your task is to explain the given text in a clear, understandable way suitable for a {difficulty_level} level {user_role}.

Guidelines:
- Break down complex concepts into simpler parts
- Use analogies and examples when helpful
- Define technical terms
- Structure your explanation logically
- Adapt language to the specified difficulty level

Context: {context}
""",
        
        "assignment_help": """You are an academic assistant helping with assignment-related questions.

Your role is to guide students through their assignments without providing direct answers.

Guidelines:
- Help break down complex tasks
- Suggest research approaches
- Provide study strategies
- Encourage critical thinking
- Point to relevant resources
- Never provide complete solutions

Assignment context: {context}
"""
    }
    
    @classmethod
    def build_chat_prompt(cls, user_input: str, context: Dict[str, Any]) -> str:
        """Build prompt for general chat"""
        system_prompt = cls.SYSTEM_PROMPTS["chat"].format(
            user_role=context.get("user_role", "student"),
            user_name=context.get("user_name", "Student"),
            context=cls._format_context(context)
        )
        return f"{system_prompt}\n\nUser: {user_input}\n\nAssistant:"
    
    @classmethod
    def build_explanation_prompt(cls, text: str, context: Dict[str, Any]) -> str:
        """Build prompt for text explanation"""
        system_prompt = cls.SYSTEM_PROMPTS["explanation"].format(
            difficulty_level=context.get("difficulty_level", "intermediate"),
            user_role=context.get("user_role", "student"),
            context=cls._format_context(context)
        )
        return f"{system_prompt}\n\nText to explain: {text}\n\nExplanation:"
    
    @classmethod
    def _format_context(cls, context: Dict[str, Any]) -> str:
        """Format context for inclusion in prompts"""
        relevant_keys = ["current_page", "context_type", "subject", "course_id"]
        formatted_context = {k: v for k, v in context.items() if k in relevant_keys and v}
        return str(formatted_context) if formatted_context else "General academic assistance"

# =====================================================
# BACKGROUND TASKS
# =====================================================

async def log_ai_interaction(
    user_id: str,
    request_type: str,
    model_used: str,
    response_time_ms: int,
    success: bool
):
    """Background task to log AI interactions for analytics"""
    try:
        # In a real implementation, this would write to a database or analytics service
        logger.info(
            "AI interaction logged",
            extra={
                "user_id": user_id,
                "request_type": request_type,
                "model_used": model_used,
                "response_time_ms": response_time_ms,
                "success": success,
                "timestamp": datetime.utcnow().isoformat()
            }
        )
    except Exception as e:
        logger.error(f"Failed to log AI interaction: {e}")

# =====================================================
# DEPENDENCY INJECTION
# =====================================================

def get_suggestion_generator() -> ImprovedSuggestionGenerator:
    """Dependency for suggestion generator"""
    return ImprovedSuggestionGenerator()

# =====================================================
# API ENDPOINTS
# =====================================================

@router.get("/status", response_model=AIServiceStatusResponse)
async def get_ai_status(
    ai_service: AIService = Depends(get_ai_service)
) -> AIServiceStatusResponse:
    """Get comprehensive AI service status with performance metrics"""
    try:
        health_data = await ai_service.health_check()
        return AIServiceStatusResponse(**health_data)
        
    except Exception as e:
        logger.error(f"Error checking AI service status: {e}")
        return AIServiceStatusResponse(
            status="error",
            service="ollama",
            models=[],
            default_model=get_ai_config().default_model,
            last_check=datetime.utcnow().isoformat(),
            error=str(e)
        )

@router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(
    request: ChatRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    ai_service: AIService = Depends(get_ai_service),
    suggestion_gen: ImprovedSuggestionGenerator = Depends(get_suggestion_generator)
) -> ChatResponse:
    """Enhanced chat endpoint with comprehensive error handling and logging"""
    request_id = str(uuid.uuid4())
    start_time = time.time()
    
    try:
        # Prepare enhanced context
        context = request.context.copy()
        context.update({
            "user_id": str(current_user.id),
            "user_role": getattr(current_user, 'role', 'student'),
            "user_name": getattr(current_user, 'full_name', 'Student'),
            "timestamp": datetime.utcnow().isoformat(),
            "request_id": request_id
        })
        
        # Build AI request
        prompt = PromptBuilder.build_chat_prompt(request.message, context)
        ai_request = AIRequest(
            prompt=prompt,
            model=request.model,
            context=context,
            options=request.options,
            request_id=request_id
        )
        
        # Generate AI response
        ai_response = await ai_service.generate_response(ai_request)
        
        # Generate contextual suggestions
        suggestions = suggestion_gen.generate_suggestions(
            context=context,
            user_role=context.get("user_role", "student")
        )
        
        response_time_ms = int((time.time() - start_time) * 1000)
        
        # Log interaction in background
        background_tasks.add_task(
            log_ai_interaction,
            user_id=str(current_user.id),
            request_type="chat",
            model_used=ai_response.model,
            response_time_ms=response_time_ms,
            success=True
        )
        
        return ChatResponse(
            response=ai_response.content,
            context=context,
            suggestions=suggestions,
            model_used=ai_response.model,
            response_time_ms=response_time_ms,
            request_id=request_id,
            metadata=ai_response.metadata
        )
        
    except AIServiceUnavailableError:
        background_tasks.add_task(
            log_ai_interaction,
            user_id=str(current_user.id),
            request_type="chat",
            model_used="unknown",
            response_time_ms=int((time.time() - start_time) * 1000),
            success=False
        )
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI service is temporarily unavailable. Please try again later."
        )
    except AIServiceTimeoutError:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="AI service request timed out. Please try again with a shorter message."
        )
    except AIServiceRateLimitError:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded. Please wait before making another request."
        )
    except AIServiceError as e:
        logger.error(f"AI service error in chat endpoint: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI service error: {e.error_code}"
        )
    except Exception as e:
        logger.error(f"Unexpected error in chat endpoint: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred"
        )

@router.post("/explain-text", response_model=ExplainTextResponse)
async def explain_text(
    request: ExplainTextRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    ai_service: AIService = Depends(get_ai_service)
) -> ExplainTextResponse:
    """Enhanced text explanation endpoint with difficulty level support"""
    request_id = str(uuid.uuid4())
    start_time = time.time()
    
    try:
        # Prepare context for text explanation
        context = request.context.copy()
        context.update({
            "user_id": str(current_user.id),
            "user_role": getattr(current_user, 'role', 'student'),
            "difficulty_level": request.difficulty_level,
            "task": "text_explanation",
            "request_id": request_id
        })
        
        # Build explanation prompt
        prompt = PromptBuilder.build_explanation_prompt(request.text, context)
        ai_request = AIRequest(
            prompt=prompt,
            context=context,
            request_id=request_id
        )
        
        # Generate explanation
        ai_response = await ai_service.generate_response(ai_request)
        
        # Log interaction in background
        background_tasks.add_task(
            log_ai_interaction,
            user_id=str(current_user.id),
            request_type="explain_text",
            model_used=ai_response.model,
            response_time_ms=int((time.time() - start_time) * 1000),
            success=True
        )
        
        return ExplainTextResponse(
            explanation=ai_response.content,
            original_text=request.text,
            difficulty_level=request.difficulty_level,
            context=context,
            request_id=request_id
        )
        
    except AIServiceError as e:
        logger.error(f"AI service error in explain-text endpoint: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI service error: {e.error_code}"
        )
    except Exception as e:
        logger.error(f"Unexpected error in explain-text endpoint: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred"
        )

@router.get("/functions", response_model=AIFunctionsResponse)
async def get_ai_functions() -> AIFunctionsResponse:
    """Get available AI functions with enhanced categorization and examples"""
    functions = [
        AIFunctionInfo(
            name="explain_assignment",
            description="Explain assignment requirements and help break down tasks",
            parameters={
                "assignment_id": "string",
                "specific_question": "string",
                "difficulty_level": "string"
            },
            category="academic",
            examples=[
                "Explain the requirements for assignment CS101-A1",
                "Help me understand what I need to do for this project"
            ]
        ),
        AIFunctionInfo(
            name="check_announcements",
            description="Check for new announcements and important updates",
            parameters={
                "date_range": "string",
                "category": "string",
                "course_filter": "string"
            },
            category="information",
            examples=[
                "Check for announcements from this week",
                "Show me course-specific announcements"
            ]
        ),
        AIFunctionInfo(
            name="get_schedule",
            description="Get class schedule and upcoming events",
            parameters={
                "date": "string",
                "include_assignments": "boolean",
                "course_filter": "string"
            },
            category="scheduling",
            examples=[
                "What's my schedule for today?",
                "Show me next week's classes"
            ]
        ),
        AIFunctionInfo(
            name="study_help",
            description="Provide study tips and learning resources for specific topics",
            parameters={
                "subject": "string",
                "topic": "string",
                "difficulty": "string",
                "learning_style": "string"
            },
            category="learning",
            examples=[
                "Help me study for my calculus exam",
                "Provide resources for learning Python programming"
            ]
        ),
        AIFunctionInfo(
            name="grade_analysis",
            description="Analyze grades and provide improvement suggestions",
            parameters={
                "course_id": "string",
                "time_period": "string",
                "include_predictions": "boolean"
            },
            category="academic",
            examples=[
                "Analyze my performance in CS101",
                "Show me grade trends for this semester"
            ]
        )
    ]
    
    categories = list(set(func.category for func in functions))
    
    return AIFunctionsResponse(
        functions=functions,
        categories=sorted(categories),
        total_functions=len(functions)
    )

@router.get("/models")
async def get_available_models(
    ai_service: AIService = Depends(get_ai_service)
) -> Dict[str, Any]:
    """Get list of available AI models with metadata"""
    try:
        models = await ai_service.list_available_models()
        config = get_ai_config()
        
        return {
            "models": models,
            "default_model": config.default_model,
            "total_models": len(models),
            "service": "ollama",
            "last_updated": datetime.utcnow().isoformat()
        }
        
    except AIServiceError as e:
        logger.error(f"Error fetching models: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch available models"
        )