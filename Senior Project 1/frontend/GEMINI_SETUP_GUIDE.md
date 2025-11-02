# 🚀 Gemini Pro API Key Setup Guide

## Step 1: Get Your Gemini Pro API Key

1. **Visit Google AI Studio**
   - Go to: https://makersuite.google.com/app/apikey
   - Sign in with your Google account

2. **Create a New API Key**
   - Click "Create API Key"
   - Select your Google Cloud project (or create a new one)
   - Copy the generated API key

3. **Add the API Key to Your Environment**
   - Open: `frontend/.env.local`
   - Replace `your_gemini_api_key_here` with your actual API key:
   ```env
   NEXT_PUBLIC_GEMINI_API_KEY=AIzaSyD...your-actual-api-key-here
   ```

## Step 2: Test the Integration

1. **Restart the Development Server**
   ```cmd
   # Stop the current server (Ctrl+C)
   # Then restart:
   cd "Senior Project 1/frontend"
   npm run dev
   ```

2. **Test the Chat Widget**
   - Go to: http://localhost:3000/dashboard
   - Click the chat icon in the bottom-right corner
   - Send a message like "What courses am I enrolled in?"
   - You should get a response from Gemini Pro!

## Step 3: Verify the Setup

### ✅ **Success Indicators:**
- Chat responses are more natural and contextual
- Responses vary based on your questions
- No more "mock response" patterns

### ❌ **If It's Not Working:**
- Check the browser console for errors
- Verify your API key is correctly set in `.env.local`
- Make sure you restarted the development server
- Ensure your API key has the correct permissions

## 🎯 **Current Features:**

### **Intelligent Context Awareness**
The AI assistant now understands ICT University context and can help with:
- Academic information (courses, grades, schedules)
- Student services (enrollment, fees, payments)
- Course management and materials
- University policies and procedures
- Technical ERP system support

### **Fallback System**
- If Gemini Pro is unavailable, falls back to enhanced mock responses
- Graceful error handling with user-friendly messages
- Context-aware mock responses based on keywords

### **Performance Optimizations**
- Efficient API calls with proper error handling
- Loading states and user feedback
- Optimized React patterns with useCallback and useMemo

## 📝 **Sample Questions to Test:**

Try asking the AI assistant:
- "What are my upcoming assignments?"
- "How do I check my grades?"
- "What's my class schedule for today?"
- "How do I pay my fees?"
- "What courses am I enrolled in?"
- "Help me with my studies"

## 🔧 **Troubleshooting:**

### **API Key Issues:**
```
Error: API key not configured
```
**Solution:** Add your Gemini Pro API key to `.env.local`

### **Network Errors:**
```
Error: Failed to fetch from Gemini API
```
**Solution:** Check your internet connection and API key permissions

### **Empty Responses:**
```
Error: Empty response from Gemini
```
**Solution:** The fallback system will handle this automatically

## 🚀 **Next Steps:**

Once your API key is configured:
1. Test various types of questions
2. The AI will provide personalized, contextual responses
3. Enjoy your intelligent academic assistant!

---

**Need your API key?** → https://makersuite.google.com/app/apikey