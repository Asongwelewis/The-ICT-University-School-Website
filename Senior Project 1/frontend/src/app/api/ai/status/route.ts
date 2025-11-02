import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  try {
    const authToken = request.headers.get('authorization');
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (authToken) {
      headers['Authorization'] = authToken;
    }

    const response = await fetch(`${BACKEND_URL}/api/v1/ai/status`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      return NextResponse.json({
        status: 'offline',
        service: 'Gemini 1.5 Flash',
        models: [],
        error: 'Backend AI service unavailable'
      });
    }

    const data = await response.json();
    return NextResponse.json({
      status: 'online',
      service: 'Gemini 1.5 Flash',
      models: ['gemini-1.5-flash'],
      ...data
    });
  } catch (error) {
    console.error('AI Status API Error:', error);
    return NextResponse.json({
      status: 'offline',
      service: 'Gemini 1.5 Flash',
      models: [],
      error: 'Connection failed'
    });
  }
}