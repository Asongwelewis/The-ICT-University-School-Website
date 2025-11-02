# 🔐 Secure API Key Setup Guide

## ⚠️ IMPORTANT: API Key Security

The Gemini API key has been secured and removed from all committed files. Follow this guide to set up your API key securely.

## 🔑 API Key Setup

### 1. Get Your Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key or use an existing one
3. Copy the API key (starts with `AIzaSy...`)

### 2. Frontend Setup
Create or update `Senior Project 1/frontend/.env.local`:

```env
# Gemini AI Configuration
NEXT_PUBLIC_GEMINI_API_KEY=your_actual_api_key_here

# Replace 'your_actual_api_key_here' with your real API key
```

### 3. Backend Setup  
Create or update `Senior Project 1/backend/.env`:

```env
# Gemini AI Configuration
GEMINI_API_KEY=your_actual_api_key_here

# Replace 'your_actual_api_key_here' with your real API key
```

## 🛡️ Security Best Practices

### ✅ DO:
- Keep API keys in `.env` files only
- Add `.env*` to `.gitignore` (already done)
- Use environment variables in code
- Share API keys through secure channels (not Discord/Slack/Email)
- Rotate API keys regularly

### ❌ DON'T:
- Hardcode API keys in source code
- Commit `.env` files to git
- Share API keys in documentation
- Include API keys in screenshots
- Post API keys in chat messages

## 🔧 Code Implementation

### Frontend Usage:
```typescript
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
if (!apiKey) {
  throw new Error('Gemini API key not configured')
}
```

### Backend Usage:
```python
import os
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable not set")
```

## 🚨 If Your API Key Was Exposed

If GitGuardian or any security tool detects an exposed API key:

1. **Immediately revoke the key** in Google Cloud Console
2. **Generate a new API key**
3. **Update your local `.env` files** with the new key
4. **Never commit the new key** to version control

## 📋 Team Setup Checklist

For each team member:
- [ ] Clone the repository
- [ ] Create local `.env` files (frontend and backend)
- [ ] Add the Gemini API key to both `.env` files
- [ ] Verify the AI features work locally
- [ ] Confirm `.env` files are not tracked by git

## 🔍 Verification

Check that your setup is secure:

```bash
# Should show no .env files
git status

# Should show .env files are ignored
git check-ignore Senior\ Project\ 1/frontend/.env.local
git check-ignore Senior\ Project\ 1/backend/.env
```

Both commands should confirm the files are ignored.

## ✅ Setup Complete

Once you've followed this guide:
- ✅ API keys are secure and local only
- ✅ No sensitive data in version control  
- ✅ AI features work in development
- ✅ Team can collaborate safely

The AI Assistant will now work with your secure API key configuration! 🎉