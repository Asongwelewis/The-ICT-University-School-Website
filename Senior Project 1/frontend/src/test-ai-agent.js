// Simple test for AI Agent functionality
const { AIAgent } = require('./lib/ai-agent')
const { mockStudentData } = require('./lib/mock-data')

async function testAIAgent() {
  console.log('🤖 Testing AI Agent...\n')
  
  // Create agent with mock data
  const agent = new AIAgent({
    userData: {
      courses: mockStudentData.courses,
      assignments: mockStudentData.assignments,
      grades: mockStudentData.grades,
      announcements: [],
      profile: mockStudentData.profile
    },
    currentPage: 'dashboard',
    timestamp: new Date().toISOString()
  })

  // Test various queries
  const testQueries = [
    'Hi there!',
    'What pending assignments do I have?',
    'How many courses am I enrolled in?',
    'Can you show me notes for Computer Science?',
    'What are my recent grades?',
    'What\'s my schedule for today?'
  ]

  for (const query of testQueries) {
    console.log(`\n📝 User: ${query}`)
    console.log('⏳ Processing...')
    
    try {
      const response = await agent.processMessage(query)
      console.log(`🤖 AI: ${response}`)
    } catch (error) {
      console.log(`❌ Error: ${error.message}`)
    }
    
    console.log('\n' + '─'.repeat(80))
  }
}

// Run the test
testAIAgent().catch(console.error)