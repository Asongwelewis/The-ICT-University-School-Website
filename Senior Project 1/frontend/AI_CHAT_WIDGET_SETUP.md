# AI Chat Widget - Gemini Pro Integration Setup

## Overview

The AI chat widget has been successfully implemented and is now visible on all dashboard pages. It includes:

- ✅ **Chat Widget Component**: Fixed position chat widget with toggle functionality
- ✅ **Chat Interface**: Full conversation interface with message history
- ✅ **State Management**: Custom hook for managing chat state
- ✅ **UI Integration**: Integrated into dashboard layout
- ✅ **Responsive Design**: Mobile-friendly design with proper accessibility

## Current Status

The widget is currently using **mock responses** but is ready for Gemini Pro integration.

## Next Steps: Connect to Gemini Pro

To connect the chat widget to actual Gemini Pro, follow these steps:

### 1. Install Google AI SDK

```bash
cd "Senior Project 1/frontend"
npm install @google/generative-ai
```

### 2. Add Gemini Pro API Key

Add your Gemini Pro API key to environment variables:

**Frontend (.env.local):**
```env
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

**Backend (.env):**
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Update the AI Chat Hook

Replace the mock implementation in `src/hooks/use-ai-chat.ts`:

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '')
const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

async function callGeminiAPI(prompt: string): Promise<string> {
  try {
    // Create context for school ERP system
    const context = `You are an AI assistant for ICT University's ERP system. 
    Help students and staff with academic queries, course information, 
    schedules, grades, and general university procedures. 
    Be helpful, concise, and professional.
    
    User question: ${prompt}`

    const result = await model.generateContent(context)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('Gemini API Error:', error)
    throw new Error('Failed to get AI response')
  }
}
```

### 4. Backend Integration (Optional)

For better security and rate limiting, consider moving the AI API calls to the backend:

**Create new endpoint in backend:**
```python
# backend/app/api/api_v1/endpoints/ai.py
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
import google.generativeai as genai
import os

router = APIRouter()

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-pro')

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str

@router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(request: ChatRequest):
    try:
        context = f"""You are an AI assistant for ICT University's ERP system. 
        Help students and staff with academic queries, course information, 
        schedules, grades, and general university procedures. 
        Be helpful, concise, and professional.
        
        User question: {request.message}"""
        
        response = model.generate_content(context)
        return ChatResponse(response=response.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

### 5. Environment Configuration

**Get Gemini Pro API Key:**
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your environment variables

**Update backend requirements.txt:**
```txt
google-generativeai>=0.3.0
```

## Features Implemented

### Chat Widget UI
- Fixed position floating chat button (bottom-right)
- Expandable chat window with proper sizing
- Message bubbles with user/AI distinction
- Timestamp display for each message
- Loading states and error handling
- Clear chat functionality
- Keyboard shortcuts (Enter to send)

### Performance Optimizations
- React.memo for component optimization
- useCallback for event handlers
- Proper dependency arrays in useEffect
- Efficient scroll-to-bottom functionality
- Optimized re-renders

### Accessibility
- Proper ARIA labels
- Keyboard navigation support
- Focus management
- Screen reader friendly

### Integration Points
- Available on all dashboard pages
- Consistent with app's design system
- Proper error boundaries
- Loading states

## Testing

The widget is now ready for testing:

1. **Visual Test**: Check if the chat icon appears in bottom-right corner
2. **Interaction Test**: Click to open/close chat interface
3. **Message Test**: Send messages and receive mock responses
4. **Responsive Test**: Test on different screen sizes

## Deployment Notes

- Chat widget uses React strict mode compatible patterns
- All components are properly memoized for performance
- Error handling included for production use
- Mobile-responsive design implemented

The AI chat widget is now fully implemented and ready for Gemini Pro integration!