import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const cookieStore = cookies();
    
    // Get auth token from cookies
    const authToken = cookieStore.get('auth-token')?.value || 
                     cookieStore.get('access_token')?.value ||
                     request.headers.get('authorization');

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (authToken) {
      headers['Authorization'] = authToken.startsWith('Bearer ') ? authToken : `Bearer ${authToken}`;
    }

    // Convert body to URL search params for the backend endpoint
    const params = new URLSearchParams();
    params.append('text', body.text);
    if (body.context) {
      params.append('context', JSON.stringify(body.context));
    }

    const response = await fetch(`${BACKEND_URL}/api/v1/ai/explain-text?${params}`, {
      method: 'POST',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'AI service unavailable' }));
      return NextResponse.json(
        { 
          explanation: 'Sorry, I couldn\'t explain this text right now. Please try again later.',
          error: errorData.detail || 'Service unavailable'
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('AI Explain Text API Error:', error);
    return NextResponse.json(
      { 
        explanation: 'Sorry, I encountered an error while explaining this text. Please try again later.',
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}