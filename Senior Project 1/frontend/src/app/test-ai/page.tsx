import { AITestComponent } from '@/components/ai/ai-test-component'

export default function AITestPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">AI Integration Test</h1>
          <p className="text-gray-600 mt-2">
            Test and verify the Gemini Pro AI chat integration
          </p>
        </div>
        
        <AITestComponent />
      </div>
    </div>
  )
}