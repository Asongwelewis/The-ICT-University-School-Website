import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  usePathname: () => '/',
}))

// Mock environment variables for consistent testing
Object.defineProperty(process.env, 'NODE_ENV', {
  value: 'test',
  writable: true,
  configurable: true
})
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8000'

// Global test utilities
global.console = {
  ...console,
  // Suppress console.warn and console.error in tests unless explicitly needed
  warn: jest.fn(),
  error: jest.fn(),
}