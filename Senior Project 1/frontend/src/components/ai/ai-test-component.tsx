'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Clock, Bot, AlertTriangle } from 'lucide-react'

export function AITestComponent() {
  const [apiKeyStatus, setApiKeyStatus] = useState<'checking' | 'configured' | 'missing'>('checking')
  const [testResults, setTestResults] = useState<{
    id: string
    test: string
    status: 'pending' | 'success' | 'error'
    result?: string
    error?: string
  }[]>([])

  useEffect(() => {
    checkApiKeyStatus()
  }, [])

  const checkApiKeyStatus = () => {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      setApiKeyStatus('missing')
    } else {
      setApiKeyStatus('configured')
    }
  }

  const runTests = async () => {
    const tests = [
      {
        id: '1',
        test: 'Basic greeting test',
        prompt: 'Hello, how can you help me?',
        status: 'pending' as const
      },
      {
        id: '2', 
        test: 'Course information test',
        prompt: 'What courses am I enrolled in?',
        status: 'pending' as const
      },
      {
        id: '3',
        test: 'Grade inquiry test', 
        prompt: 'How do I check my grades?',
        status: 'pending' as const
      },
      {
        id: '4',
        test: 'Schedule question test',
        prompt: 'What is my class schedule?',
        status: 'pending' as const
      }
    ]

    setTestResults(tests)

    // Import the hook function dynamically to test it
    const { useAIChat } = await import('@/hooks/use-ai-chat')
    
    for (const test of tests) {
      try {
        setTestResults(prev => prev.map(t => 
          t.id === test.id ? { ...t, status: 'pending' } : t
        ))

        // Simulate chat message - this would normally be done through the hook
        const response = await fetch('/api/test-ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: test.prompt })
        })

        if (response.ok) {
          const data = await response.json()
          setTestResults(prev => prev.map(t =>
            t.id === test.id ? { ...t, status: 'success', result: data.response } : t
          ))
        } else {
          throw new Error(`HTTP ${response.status}`)
        }
      } catch (error) {
        setTestResults(prev => prev.map(t =>
          t.id === test.id ? { 
            ...t, 
            status: 'error', 
            error: error instanceof Error ? error.message : 'Unknown error'
          } : t
        ))
      }

      // Add delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />
      case 'pending': return <Clock className="h-4 w-4 text-orange-500 animate-pulse" />
      default: return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Integration Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* API Key Status */}
          <div className="flex items-center justify-between">
            <span>Gemini Pro API Key:</span>
            <Badge variant={apiKeyStatus === 'configured' ? 'default' : 'destructive'}>
              {apiKeyStatus === 'checking' && <Clock className="h-3 w-3 mr-1 animate-pulse" />}
              {apiKeyStatus === 'configured' && <CheckCircle className="h-3 w-3 mr-1" />}
              {apiKeyStatus === 'missing' && <XCircle className="h-3 w-3 mr-1" />}
              {apiKeyStatus === 'checking' ? 'Checking...' : 
               apiKeyStatus === 'configured' ? 'Configured' : 'Missing'}
            </Badge>
          </div>

          {/* Setup Instructions */}
          {apiKeyStatus === 'missing' && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-orange-800">API Key Required</h4>
                  <p className="text-sm text-orange-700 mt-1">
                    To use Gemini Pro, add your API key to the environment file:
                  </p>
                  <ol className="text-sm text-orange-700 mt-2 space-y-1 ml-4 list-decimal">
                    <li>Get your API key from <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline">Google AI Studio</a></li>
                    <li>Add it to <code className="bg-orange-100 px-1 rounded">frontend/.env.local</code></li>
                    <li>Restart the development server</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* Test Controls */}
          <div className="flex gap-2">
            <Button onClick={runTests} disabled={testResults.some(t => t.status === 'pending')}>
              {testResults.some(t => t.status === 'pending') ? 'Running Tests...' : 'Run AI Tests'}
            </Button>
            <Button variant="outline" onClick={checkApiKeyStatus}>
              Refresh Status
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {testResults.map((test) => (
                <div key={test.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{test.test}</h4>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(test.status)}
                      <Badge variant={test.status === 'success' ? 'default' : test.status === 'error' ? 'destructive' : 'secondary'}>
                        {test.status}
                      </Badge>
                    </div>
                  </div>
                  
                  {test.result && (
                    <div className="bg-green-50 border border-green-200 rounded p-3 mt-2">
                      <p className="text-sm text-green-800">{test.result}</p>
                    </div>
                  )}
                  
                  {test.error && (
                    <div className="bg-red-50 border border-red-200 rounded p-3 mt-2">
                      <p className="text-sm text-red-800">Error: {test.error}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}