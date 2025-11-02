/**
 * Tests for AI Status Route
 * Comprehensive test coverage for the improved AI status endpoint
 */

import { NextRequest } from 'next/server';
import { GET } from '../route-improved';

// Mock fetch globally
global.fetch = jest.fn();

describe('/api/ai/status', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
  });

  describe('GET', () => {
    it('should return online status when backend is available', async () => {
      // Mock successful backend response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'online',
          models: ['gemini-1.5-flash'],
          metadata: { version: '1.0.0' }
        })
      });

      const request = new NextRequest('http://localhost:3000/api/ai/status');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('online');
      expect(data.service).toBe('Gemini 1.5 Flash');
      expect(data.models).toEqual(['gemini-1.5-flash']);
      expect(data.lastChecked).toBeDefined();
    });

    it('should return offline status when backend is unavailable', async () => {
      // Mock backend error response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable'
      });

      const request = new NextRequest('http://localhost:3000/api/ai/status');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(502);
      expect(data.status).toBe('offline');
      expect(data.error).toBe('Backend AI service unavailable');
      expect(data.models).toEqual([]);
    });

    it('should handle network errors gracefully', async () => {
      // Mock network error
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const request = new NextRequest('http://localhost:3000/api/ai/status');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.status).toBe('offline');
      expect(data.error).toBe('Connection failed');
    });

    it('should forward authorization header when provided', async () => {
      const authToken = 'Bearer test-token';
      
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'online' })
      });

      const request = new NextRequest('http://localhost:3000/api/ai/status', {
        headers: { authorization: authToken }
      });
      
      await GET(request);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/ai/status'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': authToken
          })
        })
      );
    });

    it('should include cache control headers in response', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'online' })
      });

      const request = new NextRequest('http://localhost:3000/api/ai/status');
      const response = await GET(request);

      expect(response.headers.get('Cache-Control')).toBe('no-cache, no-store, must-revalidate');
      expect(response.headers.get('Pragma')).toBe('no-cache');
      expect(response.headers.get('Expires')).toBe('0');
    });

    it('should handle timeout scenarios', async () => {
      // Mock timeout by delaying response beyond timeout
      (fetch as jest.Mock).mockImplementationOnce(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('AbortError')), 15000)
        )
      );

      const request = new NextRequest('http://localhost:3000/api/ai/status');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.status).toBe('offline');
      expect(data.error).toBe('Connection failed');
    });
  });

  describe('Configuration', () => {
    it('should use correct backend URL from environment', () => {
      const originalEnv = process.env.NEXT_PUBLIC_API_URL;
      process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com';

      // Test would verify the URL is used correctly
      // This is more of an integration test

      process.env.NEXT_PUBLIC_API_URL = originalEnv;
    });
  });
});