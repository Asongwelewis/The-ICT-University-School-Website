from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import httpx
import json
import os
from app.core.security import get_current_user
from app.models.profiles import Profile

router = APIRouter()

# Gemini Pro configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "your_gemini_api_key_here")
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"

@router.get("/status")
async def get_ai_status():
    """Get AI service status"""
    try:
        # Test Gemini API connection
        test_payload = {
            "contents": [{
                "parts": [{"text": "Hello"}]
            }]
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{GEMINI_API_URL}?key={GEMINI_API_KEY}",
                json=test_payload,
                timeout=5.0
            )
            
        if response.status_code == 200:
            return {
                "status": "online",
                "service": "Gemini 1.5 Flash",
                "models": ["gemini-1.5-flash"],
                "message": "AI service is running"
            }
        else:
            return {
                "status": "offline",
                "service": "Gemini 1.5 Flash", 
                "models": [],
                "error": "API key or service issue"
            }
    except Exception as e:
        return {
            "status": "offline",
            "service": "Gemini 1.5 Flash",
            "models": [],
            "error": str(e)
        }

class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str
    timestamp: Optional[str] = None

class ChatRequest(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None
    conversation_history: Optional[List[ChatMessage]] = []

class ChatResponse(BaseModel):
    response: str
    context: Optional[Dict[str, Any]] = None
    suggestions: Optional[List[str]] = []

# Educational AI system prompts
EDUCATIONAL_SYSTEM_PROMPT = """You are an intelligent educational assistant for a school ERP system. Your role is to help students, teachers, and staff with academic-related questions and tasks.

Your capabilities include:
1. Explaining academic concepts and assignments clearly and simply
2. Helping with homework and study materials
3. Providing information about courses, schedules, and announcements
4. Answering questions about school policies and procedures
5. Assisting with academic planning and organization
6. Breaking down complex topics into understandable parts

Guidelines:
- Be helpful, encouraging, and educational
- Use age-appropriate language suitable for students
- Provide accurate and relevant information
- Encourage learning and critical thinking
- Maintain a supportive and positive tone
- If you don't know something, admit it and suggest where to find the information
- Keep responses concise but comprehensive
- Use examples when explaining concepts

Current context: {context}
User role: {user_role}

Please provide helpful, educational responses that encourage learning."""

async def check_gemini_status():
    """Check if Gemini API is accessible"""
    try:
        async with httpx.AsyncClient() as client:
            test_data = {
                "contents": [{
                    "parts": [{"text": "Hello"}]
                }]
            }
            response = await client.post(
                f"{GEMINI_API_URL}?key={GEMINI_API_KEY}",
                json=test_data,
                timeout=10.0
            )
            return response.status_code == 200
    except Exception:
        return False

async def generate_ai_response_gemini(prompt: str, context: Dict = None, conversation_history: List[ChatMessage] = None):
    """Generate AI response using Gemini Pro API"""
    try:
        # Build system prompt with context
        user_role = context.get("user_role", "student") if context else "student"
        system_context = EDUCATIONAL_SYSTEM_PROMPT.format(
            context=json.dumps(context) if context else "{}",
            user_role=user_role
        )
        
        # Build conversation context
        conversation_context = ""
        if conversation_history:
            recent_history = conversation_history[-3:]  # Last 3 messages for context
            for msg in recent_history:
                conversation_context += f"{msg.role.title()}: {msg.content}\n"
        
        # Prepare the full prompt
        full_prompt = f"{system_context}\n\n{conversation_context}User: {prompt}\n\nAssistant:"
        
        # Prepare request data for Gemini
        request_data = {
            "contents": [{
                "parts": [{"text": full_prompt}]
            }],
            "generationConfig": {
                "temperature": 0.7,
                "topK": 40,
                "topP": 0.95,
                "maxOutputTokens": 500,
                "stopSequences": []
            },
            "safetySettings": [
                {
                    "category": "HARM_CATEGORY_HARASSMENT",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    "category": "HARM_CATEGORY_HATE_SPEECH",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                }
            ]
        }
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{GEMINI_API_URL}?key={GEMINI_API_KEY}",
                json=request_data
            )
            
            if response.status_code == 200:
                result = response.json()
                if "candidates" in result and len(result["candidates"]) > 0:
                    candidate = result["candidates"][0]
                    if "content" in candidate and "parts" in candidate["content"]:
                        generated_text = candidate["content"]["parts"][0]["text"]
                        return generated_text.strip()
                    else:
                        return "I'm here to help with your studies! Please ask me any academic question."
                else:
                    return "I'm ready to assist you with your educational needs!"
            elif response.status_code == 429:
                return "I'm getting a lot of questions right now. Please try again in a moment!"
            else:
                error_data = response.json() if response.content else {}
                raise HTTPException(status_code=500, detail="AI service temporarily unavailable")
                
    except httpx.TimeoutException:
        return "I'm taking a bit longer to respond. Please try asking a simpler question."
    except Exception as e:
        print(f"Gemini API Error: {str(e)}")
        return "I'm having trouble connecting right now. Please try again in a moment."

def generate_suggestions(context: Dict = None, user_role: str = "student") -> List[str]:
    """Generate contextual suggestions based on user role and current page"""
    if not context:
        return [
            "What assignments do I have due this week?",
            "Explain this concept to me",
            "What's my next class?",
            "Help me understand this topic"
        ]
    
    current_page = context.get("current_page", "")
    
    if "assignments" in current_page.lower():
        suggestions = [
            "Explain this assignment step by step",
            "What's the due date for this assignment?",
            "Help me break down this task",
            "What resources do I need for this?"
        ]
    elif "courses" in current_page.lower():
        suggestions = [
            "Tell me about this course",
            "What topics will we cover?",
            "How can I prepare for this class?",
            "What are the prerequisites?"
        ]
    elif "grades" in current_page.lower():
        suggestions = [
            "How can I improve my grades?",
            "Explain my grade calculation",
            "What assignments am I missing?",
            "Study tips for this subject"
        ]
    elif "schedule" in current_page.lower():
        suggestions = [
            "What's my next class?",
            "Where is this classroom located?",
            "What should I bring to class?",
            "How long is this class?"
        ]
    elif "notes" in current_page.lower():
        suggestions = [
            "Explain this concept in simple terms",
            "Give me examples of this topic",
            "How does this relate to other concepts?",
            "What are the key points to remember?"
        ]
    else:
        suggestions = [
            "What assignments do I have due?",
            "Check for new announcements",
            "What's my schedule today?",
            "Help me with my studies"
        ]
    
    return suggestions

@router.get("/status")
async def get_ai_status():
    """Check AI service status"""
    is_running = await check_gemini_status()
    
    return {
        "status": "online" if is_running else "offline",
        "service": "Google Gemini 1.5 Flash",
        "model": "gemini-1.5-flash",
        "features": [
            "Educational assistance",
            "Concept explanations",
            "Assignment help",
            "Study guidance",
            "Text analysis"
        ],
        "limits": {
            "requests_per_minute": 60,
            "requests_per_day": 1500,
            "free_tier": True
        }
    }

@router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(
    request: ChatRequest,
    current_user: Profile = Depends(get_current_user)
):
    """Chat with the AI assistant using Gemini Pro"""
    
    # Prepare context with user information
    context = request.context or {}
    context.update({
        "user_id": str(current_user.id),
        "user_role": getattr(current_user, 'role', 'student'),
        "user_name": getattr(current_user, 'full_name', 'Student')
    })
    
    # Generate AI response
    ai_response = await generate_ai_response_gemini(
        request.message, 
        context=context,
        conversation_history=request.conversation_history
    )
    
    # Generate contextual suggestions
    suggestions = generate_suggestions(
        context=context,
        user_role=context.get("user_role", "student")
    )
    
    return ChatResponse(
        response=ai_response,
        context=context,
        suggestions=suggestions
    )

@router.post("/explain-text")
async def explain_text(
    text: str,
    context: Optional[Dict[str, Any]] = None,
    current_user: Profile = Depends(get_current_user)
):
    """Explain highlighted text or specific content"""
    
    # Create explanation prompt
    prompt = f"Please explain this text in simple, clear terms suitable for a student. Break it down and provide examples if helpful: '{text}'"
    
    # Prepare context
    user_context = context or {}
    user_context.update({
        "user_id": str(current_user.id),
        "user_role": getattr(current_user, 'role', 'student'),
        "task": "text_explanation"
    })
    
    explanation = await generate_ai_response_gemini(prompt, context=user_context)
    
    return {
        "explanation": explanation,
        "original_text": text
    }

@router.get("/features")
async def get_ai_features():
    """Get available AI features"""
    return {
        "service": "Google Gemini Pro",
        "capabilities": [
            "Natural conversation about academic topics",
            "Assignment explanation and breakdown",
            "Concept clarification with examples",
            "Study tips and learning strategies",
            "Text analysis and explanation",
            "Context-aware responses based on current page",
            "Educational content generation",
            "Homework assistance and guidance"
        ],
        "educational_focus": [
            "Age-appropriate explanations",
            "Encouraging learning approach",
            "Critical thinking promotion",
            "Step-by-step breakdowns",
            "Real-world examples",
            "Study methodology guidance"
        ],
        "safety_features": [
            "Content filtering for educational appropriateness",
            "Harassment prevention",
            "Safe learning environment",
            "Privacy protection"
        ]
    }