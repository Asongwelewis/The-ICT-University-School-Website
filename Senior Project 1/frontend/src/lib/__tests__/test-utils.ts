/**
 * Test utilities for consistent testing patterns
 */

// Type augmentation for better Jest typing
declare global {
  namespace jest {
    interface Mock<T = any, Y extends any[] = any> {
      mockReturnThis(): this
    }
    
    interface Matchers<R> {
      toHaveSupabaseError(expectedMessage?: string): R
      toBeSupabaseConfigured(): R
    }
  }
}

interface EnvironmentConfig {
  url?: string
  key?: string
  nodeEnv?: string
}

interface EnvironmentSnapshot {
  env: NodeJS.ProcessEnv
  nodeEnvDescriptor?: PropertyDescriptor
}

export class TestEnvironmentManager {
  private originalSnapshot: EnvironmentSnapshot

  constructor() {
    this.originalSnapshot = this.captureEnvironmentSnapshot()
  }

  private captureEnvironmentSnapshot(): EnvironmentSnapshot {
    return {
      env: { ...process.env },
      nodeEnvDescriptor: Object.getOwnPropertyDescriptor(process.env, 'NODE_ENV')
    }
  }

  private setEnvironmentVariable(key: string, value: string | undefined): void {
    if (value !== undefined) {
      process.env[key] = value
    } else {
      delete process.env[key]
    }
  }

  private setNodeEnv(value: string): void {
    // Always use Object.defineProperty for NODE_ENV as it's often read-only
    Object.defineProperty(process.env, 'NODE_ENV', {
      value,
      writable: true,
      configurable: true,
      enumerable: true
    })
  }

  setEnvironment(config: EnvironmentConfig): void {
    this.setEnvironmentVariable('NEXT_PUBLIC_SUPABASE_URL', config.url)
    this.setEnvironmentVariable('NEXT_PUBLIC_SUPABASE_ANON_KEY', config.key)
    
    if (config.nodeEnv !== undefined) {
      this.setNodeEnv(config.nodeEnv)
    }
  }

  restore(): void {
    // Restore all environment variables
    Object.keys(process.env).forEach(key => {
      delete process.env[key]
    })
    Object.assign(process.env, this.originalSnapshot.env)

    // Restore NODE_ENV descriptor if it existed
    if (this.originalSnapshot.nodeEnvDescriptor) {
      Object.defineProperty(process.env, 'NODE_ENV', this.originalSnapshot.nodeEnvDescriptor)
    }
  }

  /**
   * Create an isolated environment for a test function
   */
  static withEnvironment<T>(config: EnvironmentConfig, testFn: () => T | Promise<T>): Promise<T> {
    const manager = new TestEnvironmentManager()
    
    return Promise.resolve()
      .then(() => {
        manager.setEnvironment(config)
        return testFn()
      })
      .finally(() => {
        manager.restore()
      })
  }
}

export const TEST_CONSTANTS = {
  VALID_SUPABASE_URL: 'https://test-project.supabase.co',
  VALID_SUPABASE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test-key',
  INVALID_URL: 'not-a-valid-url',
  MOCK_USER: {
    id: 'test-user-123',
    email: 'test@example.com',
    role: 'student' as const,
  },
  MOCK_SESSION: {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    expires_in: 3600,
    user: {
      id: 'test-user-123',
      email: 'test@example.com',
    },
  },
  // Common error messages for testing
  ERRORS: {
    NETWORK: { message: 'Network error' },
    AUTH: { message: 'Authentication failed' },
    INVALID_CREDENTIALS: { message: 'Invalid email or password' },
    USER_NOT_FOUND: { message: 'User not found' },
  },
  // Environment configurations for common test scenarios
  ENVIRONMENTS: {
    PRODUCTION: { nodeEnv: 'production' },
    DEVELOPMENT: { nodeEnv: 'development' },
    TEST: { nodeEnv: 'test' },
    CONFIGURED: {
      url: 'https://test-project.supabase.co',
      key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test-key',
      nodeEnv: 'test'
    },
    UNCONFIGURED: {
      url: undefined,
      key: undefined,
      nodeEnv: 'test'
    }
  }
} as const

interface MockSupabaseAuthOverrides {
  getSession?: Partial<{ data: any; error: any }>
  getUser?: Partial<{ data: any; error: any }>
  signOut?: Partial<{ error: any }>
  onAuthStateChange?: Partial<{ data: any }>
  signInWithPassword?: Partial<{ data: any; error: any }>
  signUp?: Partial<{ data: any; error: any }>
  resetPasswordForEmail?: Partial<{ error: any }>
}

interface MockSupabaseClientOverrides {
  auth?: MockSupabaseAuthOverrides
  from?: jest.Mock<any, any>
  [key: string]: any
}

/**
 * Builder class for creating mock Supabase clients with type safety
 */
export class MockSupabaseClientBuilder {
  private authOverrides: MockSupabaseAuthOverrides = {}
  private clientOverrides: Omit<MockSupabaseClientOverrides, 'auth'> = {}

  withAuthSession(session: any, error: any = null): this {
    this.authOverrides.getSession = { data: { session }, error }
    return this
  }

  withAuthUser(user: any, error: any = null): this {
    this.authOverrides.getUser = { data: { user }, error }
    return this
  }

  withAuthError(method: keyof MockSupabaseAuthOverrides, error: any): this {
    this.authOverrides[method] = { error }
    return this
  }

  withDatabaseMock(mockImplementation?: jest.Mock<any, any>): this {
    this.clientOverrides.from = mockImplementation || jest.fn().mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    }))
    return this
  }

  build() {
    return createMockSupabaseClient({
      auth: this.authOverrides,
      ...this.clientOverrides
    })
  }
}

export const createMockSupabaseClient = (overrides: MockSupabaseClientOverrides = {}) => ({
  auth: {
    getSession: jest.fn().mockResolvedValue({ 
      data: { session: null }, 
      error: null,
      ...overrides.auth?.getSession 
    }),
    getUser: jest.fn().mockResolvedValue({ 
      data: { user: null }, 
      error: null,
      ...overrides.auth?.getUser 
    }),
    signOut: jest.fn().mockResolvedValue({ 
      error: null,
      ...overrides.auth?.signOut 
    }),
    onAuthStateChange: jest.fn().mockReturnValue({ 
      data: { subscription: { unsubscribe: jest.fn() } },
      ...overrides.auth?.onAuthStateChange 
    }),
    signInWithPassword: jest.fn().mockResolvedValue({
      data: { user: null, session: null },
      error: null,
      ...overrides.auth?.signInWithPassword
    }),
    signUp: jest.fn().mockResolvedValue({
      data: { user: null, session: null },
      error: null,
      ...overrides.auth?.signUp
    }),
    resetPasswordForEmail: jest.fn().mockResolvedValue({
      error: null,
      ...overrides.auth?.resetPasswordForEmail
    }),
  },
  from: overrides.from || jest.fn().mockImplementation(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
  })),
  ...Object.fromEntries(
    Object.entries(overrides).filter(([key]) => !['auth', 'from'].includes(key))
  ),
})

// Convenience factory methods
export const mockSupabaseClient = {
  authenticated: () => new MockSupabaseClientBuilder()
    .withAuthSession(TEST_CONSTANTS.MOCK_SESSION)
    .withAuthUser(TEST_CONSTANTS.MOCK_USER)
    .build(),
    
  unauthenticated: () => new MockSupabaseClientBuilder()
    .withAuthSession(null)
    .withAuthUser(null)
    .build(),
    
  withError: (error: any) => new MockSupabaseClientBuilder()
    .withAuthError('getSession', error)
    .withAuthError('getUser', error)
    .build(),
}

interface MockWindowConfig {
  localStorage?: Partial<Storage>
  location?: Partial<Location>
  origin?: string
}

/**
 * Enhanced window environment mocker with better type safety and configuration
 */
export class WindowEnvironmentMocker {
  private originalWindow: typeof globalThis.window
  private originalDescriptor: PropertyDescriptor | undefined

  constructor() {
    this.originalWindow = global.window
    this.originalDescriptor = Object.getOwnPropertyDescriptor(global, 'window')
  }

  mockWindow(config: MockWindowConfig = {}): void {
    const mockWindow = {
      localStorage: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
        length: 0,
        key: jest.fn(),
        ...config.localStorage,
      },
      location: {
        origin: config.origin || 'http://localhost:3000',
        href: config.origin || 'http://localhost:3000',
        protocol: 'http:',
        host: 'localhost:3000',
        hostname: 'localhost',
        port: '3000',
        pathname: '/',
        search: '',
        hash: '',
        ...config.location,
      },
    } as any

    Object.defineProperty(global, 'window', {
      value: mockWindow,
      writable: true,
      configurable: true,
    })
  }

  removeWindow(): void {
    delete (global as any).window
  }

  restore(): void {
    if (this.originalDescriptor) {
      Object.defineProperty(global, 'window', this.originalDescriptor)
    } else if (this.originalWindow) {
      global.window = this.originalWindow
    } else {
      delete (global as any).window
    }
  }

  /**
   * Execute a function with a mocked window environment
   */
  static withWindow<T>(
    config: MockWindowConfig | boolean = true,
    testFn: () => T | Promise<T>
  ): Promise<T> {
    const mocker = new WindowEnvironmentMocker()
    
    return Promise.resolve()
      .then(() => {
        if (typeof config === 'boolean') {
          if (config) {
            mocker.mockWindow()
          } else {
            mocker.removeWindow()
          }
        } else {
          mocker.mockWindow(config)
        }
        return testFn()
      })
      .finally(() => {
        mocker.restore()
      })
  }
}

// Backward compatibility
export const mockWindowEnvironment = (hasWindow: boolean = true) => {
  const mocker = new WindowEnvironmentMocker()
  
  if (hasWindow) {
    mocker.mockWindow()
  } else {
    mocker.removeWindow()
  }

  return () => mocker.restore()
}

/**
 * Utility functions for common test scenarios
 */
export const testScenarios = {
  /**
   * Test with authenticated user
   */
  withAuthenticatedUser: async <T>(testFn: () => T | Promise<T>): Promise<T> => {
    return TestEnvironmentManager.withEnvironment(
      TEST_CONSTANTS.ENVIRONMENTS.CONFIGURED,
      testFn
    )
  },

  /**
   * Test with unauthenticated user
   */
  withUnauthenticatedUser: async <T>(testFn: () => T | Promise<T>): Promise<T> => {
    return TestEnvironmentManager.withEnvironment(
      TEST_CONSTANTS.ENVIRONMENTS.UNCONFIGURED,
      testFn
    )
  },

  /**
   * Test with server-side environment (no window)
   */
  withServerEnvironment: async <T>(testFn: () => T | Promise<T>): Promise<T> => {
    return WindowEnvironmentMocker.withWindow(false, testFn)
  },

  /**
   * Test with client-side environment (with window)
   */
  withClientEnvironment: async <T>(testFn: () => T | Promise<T>): Promise<T> => {
    return WindowEnvironmentMocker.withWindow(true, testFn)
  },

  /**
   * Composite scenario: Server environment with unconfigured Supabase
   */
  withUnconfiguredServerEnvironment: async <T>(testFn: () => T | Promise<T>): Promise<T> => {
    return WindowEnvironmentMocker.withWindow(false, async () => {
      return TestEnvironmentManager.withEnvironment(
        TEST_CONSTANTS.ENVIRONMENTS.UNCONFIGURED,
        testFn
      )
    })
  },

  /**
   * Composite scenario: Client environment with configured Supabase
   */
  withConfiguredClientEnvironment: async <T>(testFn: () => T | Promise<T>): Promise<T> => {
    return WindowEnvironmentMocker.withWindow(true, async () => {
      return TestEnvironmentManager.withEnvironment(
        TEST_CONSTANTS.ENVIRONMENTS.CONFIGURED,
        testFn
      )
    })
  },
}

/**
 * Helper to suppress console warnings/errors during tests
 */
export const suppressConsole = (methods: Array<'log' | 'warn' | 'error' | 'info'> = ['warn', 'error']) => {
  const originalMethods: Record<string, any> = {}
  
  methods.forEach(method => {
    originalMethods[method] = console[method]
    console[method] = jest.fn()
  })

  return () => {
    methods.forEach(method => {
      console[method] = originalMethods[method]
    })
  }
}

/**
 * Wait for async operations to complete (useful for testing async side effects)
 */
export const waitForAsync = (ms: number = 0): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Create a deferred promise for testing async flows
 */
export const createDeferred = <T = any>() => {
  let resolve: (value: T) => void
  let reject: (reason?: any) => void
  
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })

  return { promise, resolve: resolve!, reject: reject! }
}

/**
 * Test data factory for creating consistent test data
 */
export const testDataFactory = {
  user: (overrides: Partial<typeof TEST_CONSTANTS.MOCK_USER> = {}) => ({
    ...TEST_CONSTANTS.MOCK_USER,
    ...overrides
  }),

  session: (overrides: Partial<typeof TEST_CONSTANTS.MOCK_SESSION> = {}) => ({
    ...TEST_CONSTANTS.MOCK_SESSION,
    ...overrides
  }),

  error: (message: string, code?: string) => ({
    message,
    code: code || 'TEST_ERROR'
  }),

  authResult: <T>(data: T | null = null, error: any = null) => ({
    data,
    error: error ? new Error(typeof error === 'string' ? error : error.message) : null
  })
}

// Custom Jest matchers for Supabase testing
export const customMatchers = {
  toHaveSupabaseError(received: any, expectedMessage?: string) {
    const pass = received && 
                 received.error && 
                 received.error instanceof Error &&
                 (expectedMessage ? received.error.message === expectedMessage : true)

    return {
      message: () => 
        pass 
          ? `Expected not to have Supabase error${expectedMessage ? ` with message "${expectedMessage}"` : ''}`
          : `Expected to have Supabase error${expectedMessage ? ` with message "${expectedMessage}"` : ''}`,
      pass,
    }
  },

  toBeSupabaseConfigured(received: any) {
    const pass = typeof received === 'function' && received() === true

    return {
      message: () => 
        pass 
          ? 'Expected Supabase not to be configured'
          : 'Expected Supabase to be configured',
      pass,
    }
  }
}