import '@testing-library/jest-dom'

// Enhanced Next.js router mock with more realistic behavior
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn().mockResolvedValue(true),
    replace: jest.fn().mockResolvedValue(true),
    refresh: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn().mockResolvedValue(undefined),
    pathname: '/',
    query: {},
    asPath: '/',
  }),
  useSearchParams: () => ({
    get: jest.fn((key) => null),
    getAll: jest.fn((key) => []),
    has: jest.fn((key) => false),
    keys: jest.fn(() => []),
    values: jest.fn(() => []),
    entries: jest.fn(() => []),
    toString: jest.fn(() => ''),
  }),
  usePathname: () => '/',
  redirect: jest.fn(),
  notFound: jest.fn(),
}))

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ children, href, ...props }) => {
    return React.createElement('a', { href, ...props }, children)
  }
})

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element
    return React.createElement('img', { ...props, alt: props.alt || '' })
  },
}))

// Mock Supabase client for consistent testing
jest.mock('@/lib/supabase', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(),
      getUser: jest.fn(),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
      resetPasswordForEmail: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    })),
  })),
  getSupabaseClient: jest.fn(),
  supabaseUtils: {
    isAuthenticated: jest.fn().mockResolvedValue(false),
    getCurrentUser: jest.fn().mockResolvedValue({ data: null, error: null }),
    signOut: jest.fn().mockResolvedValue({ data: null, error: null }),
    onAuthStateChange: jest.fn(),
    healthCheck: jest.fn().mockResolvedValue(true),
  },
  isSupabaseConfigured: jest.fn(() => true),
}))

// Mock window.matchMedia for responsive design tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock IntersectionObserver for components that use it
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() { return null }
  disconnect() { return null }
  unobserve() { return null }
}

// Mock ResizeObserver for components that use it
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() { return null }
  disconnect() { return null }
  unobserve() { return null }
}

// Mock environment variables for consistent testing
const mockEnvVars = {
  NODE_ENV: 'test',
  NEXT_PUBLIC_API_URL: 'http://localhost:8000',
  NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
}

Object.entries(mockEnvVars).forEach(([key, value]) => {
  Object.defineProperty(process.env, key, {
    value,
    writable: true,
    configurable: true,
  })
})

// Enhanced console mocking with selective suppression
const originalConsole = { ...console }

global.console = {
  ...console,
  // Suppress specific warnings/errors in tests unless explicitly needed
  warn: jest.fn((message) => {
    // Allow specific warnings to pass through for debugging
    if (process.env.JEST_VERBOSE === 'true') {
      originalConsole.warn(message)
    }
  }),
  error: jest.fn((message) => {
    // Allow specific errors to pass through for debugging
    if (process.env.JEST_VERBOSE === 'true') {
      originalConsole.error(message)
    }
  }),
}

// Global test utilities
global.testUtils = {
  // Helper to restore console for specific tests
  restoreConsole: () => {
    global.console = originalConsole
  },
  
  // Helper to mock API responses
  mockApiResponse: (data, error = null) => ({
    data,
    error,
    status: error ? 400 : 200,
  }),
  
  // Helper to create mock user
  createMockUser: (overrides = {}) => ({
    id: 'test-user-id',
    email: 'test@example.com',
    role: 'student',
    profile: {
      firstName: 'Test',
      lastName: 'User',
    },
    permissions: [],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }),
}

// Setup and teardown hooks
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks()
})

afterEach(() => {
  // Clean up after each test
  jest.restoreAllMocks()
})