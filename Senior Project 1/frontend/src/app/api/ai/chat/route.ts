import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const cookieStore = cookies();
    
    // Get auth token from request headers (sent from client)
    const authToken = request.headers.get('authorization') ||
                     cookieStore.get('access_token')?.value;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (authToken) {
      headers['Authorization'] = authToken.startsWith('Bearer ') ? authToken : `Bearer ${authToken}`;
    }

    const response = await fetch(`${BACKEND_URL}/api/v1/ai/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'AI service unavailable' }));
      return NextResponse.json(
        { 
          response: 'Sorry, I\'m having trouble connecting right now. Please make sure the AI service is running and try again.',
          error: errorData.detail || 'Service unavailable'
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('AI Chat API Error:', error);
    return NextResponse.json(
      { 
        response: 'Sorry, I encountered an error. Please try again later.',
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}