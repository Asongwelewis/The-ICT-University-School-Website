/**
 * Tests for Supabase client configuration and utilities
 */

import '@testing-library/jest-dom'
import {
    TestEnvironmentManager,
    TEST_CONSTANTS,
    mockSupabaseClient,
    WindowEnvironmentMocker,
    testScenarios,
} from './test-utils'

// Mock Supabase client to prevent actual API calls
const mockClient = mockSupabaseClient.unauthenticated()

jest.mock('@supabase/auth-helpers-nextjs', () => ({
    createClientComponentClient: jest.fn().mockImplementation(() => mockClient),
}))

describe('Supabase Configuration', () => {
    let envManager: TestEnvironmentManager

    beforeEach(() => {
        envManager = new TestEnvironmentManager()
    })

    afterEach(() => {
        envManager.restore()
        jest.clearAllMocks()
        // Only reset modules when necessary for environment changes
        jest.resetModules()
    })

    describe('Configuration Validation', () => {
        describe('when environment variables are valid', () => {
            it('should indicate Supabase is properly configured', async () => {
                await TestEnvironmentManager.withEnvironment(
                    TEST_CONSTANTS.ENVIRONMENTS.CONFIGURED,
                    async () => {
                        const { isSupabaseConfigured } = await import('../supabase')
                        expect(isSupabaseConfigured()).toBe(true)
                    }
                )
            })

            it('should create client without throwing errors', async () => {
                await TestEnvironmentManager.withEnvironment(
                    TEST_CONSTANTS.ENVIRONMENTS.CONFIGURED,
                    async () => {
                        const { createClient } = await import('../supabase')
                        expect(() => createClient()).not.toThrow()
                    }
                )
            })

            it('should provide valid configuration status', async () => {
                await TestEnvironmentManager.withEnvironment(
                    TEST_CONSTANTS.ENVIRONMENTS.CONFIGURED,
                    async () => {
                        const { CONFIG_STATUS } = await import('../supabase')
                        expect(CONFIG_STATUS.isConfigured).toBe(true)
                        expect(CONFIG_STATUS.hasUrl).toBe(true)
                        expect(CONFIG_STATUS.hasKey).toBe(true)
                    }
                )
            })
        })

        describe('when environment variables are missing', () => {
            it('should indicate Supabase is not configured', async () => {
                await testScenarios.withUnconfiguredServerEnvironment(async () => {
                    const { isSupabaseConfigured } = await import('../supabase')
                    expect(isSupabaseConfigured()).toBe(false)
                })
            })

            it('should handle client creation gracefully', async () => {
                await WindowEnvironmentMocker.withWindow(false, async () => {
                    await TestEnvironmentManager.withEnvironment(
                        TEST_CONSTANTS.ENVIRONMENTS.UNCONFIGURED,
                        async () => {
                            const { createClient } = await import('../supabase')
                            expect(() => createClient()).toThrow('Supabase configuration is not available')
                        }
                    )
                })
            })

            it('should provide accurate configuration status', async () => {
                await WindowEnvironmentMocker.withWindow(false, async () => {
                    await TestEnvironmentManager.withEnvironment(
                        TEST_CONSTANTS.ENVIRONMENTS.UNCONFIGURED,
                        async () => {
                            const { CONFIG_STATUS } = await import('../supabase')
                            expect(CONFIG_STATUS.isConfigured).toBe(false)
                            expect(CONFIG_STATUS.hasUrl).toBe(false)
                            expect(CONFIG_STATUS.hasKey).toBe(false)
                        }
                    )
                })
            })
        })

        describe('when URL is invalid', () => {
            beforeEach(() => {
                envManager.setEnvironment({
                    url: TEST_CONSTANTS.INVALID_URL,
                    key: TEST_CONSTANTS.VALID_SUPABASE_KEY
                })
            })

            it('should handle invalid URL gracefully in server environment', async () => {
                await WindowEnvironmentMocker.withWindow(false, async () => {
                    const { isSupabaseConfigured } = await import('../supabase')
                    expect(isSupabaseConfigured()).toBe(false)
                })
            })
        })
    })

    describe('Utility Functions', () => {
        beforeEach(() => {
            envManager.setEnvironment(TEST_CONSTANTS.ENVIRONMENTS.CONFIGURED)
        })

        describe('supabaseUtils.isAuthenticated', () => {
            it('should return false when no session exists', async () => {
                const { supabaseUtils } = await import('../supabase')
                const result = await supabaseUtils.isAuthenticated()
                expect(result).toBe(false)
            })

            it('should handle errors gracefully', async () => {
                mockClient.auth.getSession.mockRejectedValueOnce(TEST_CONSTANTS.ERRORS.NETWORK)

                const { supabaseUtils } = await import('../supabase')
                const result = await supabaseUtils.isAuthenticated()
                expect(result).toBe(false)
            })
        })

        describe('supabaseUtils.getCurrentUser', () => {
            it('should return user data when available', async () => {
                mockClient.auth.getUser.mockResolvedValueOnce({
                    data: { user: TEST_CONSTANTS.MOCK_USER },
                    error: null
                })

                const { supabaseUtils } = await import('../supabase')
                const result = await supabaseUtils.getCurrentUser()

                expect(result.data).toEqual(TEST_CONSTANTS.MOCK_USER)
                expect(result.error).toBeNull()
            })

            it('should handle errors properly', async () => {
                mockClient.auth.getUser.mockResolvedValueOnce({
                    data: { user: null },
                    error: TEST_CONSTANTS.ERRORS.AUTH
                })

                const { supabaseUtils } = await import('../supabase')
                const result = await supabaseUtils.getCurrentUser()

                expect(result.data).toBeNull()
                expect(result.error).toBeInstanceOf(Error)
                expect(result.error?.message).toBe('Authentication failed')
            })
        })

        describe('supabaseUtils.signOut', () => {
            it('should sign out successfully', async () => {
                const { supabaseUtils } = await import('../supabase')
                const result = await supabaseUtils.signOut()

                expect(result.error).toBeNull()
            })

            it('should handle sign out errors', async () => {
                mockClient.auth.signOut.mockResolvedValueOnce({
                    error: { message: 'Sign out failed' }
                })

                const { supabaseUtils } = await import('../supabase')
                const result = await supabaseUtils.signOut()

                expect(result.error).toBeInstanceOf(Error)
                expect(result.error?.message).toBe('Sign out failed')
            })
        })

        describe('supabaseUtils.healthCheck', () => {
            it('should return true when connection is healthy', async () => {
                const { supabaseUtils } = await import('../supabase')
                const result = await supabaseUtils.healthCheck()
                expect(result).toBe(true)
            })

            it('should return false when connection fails', async () => {
                mockClient.auth.getSession.mockRejectedValueOnce(new Error('Connection failed'))

                const { supabaseUtils } = await import('../supabase')
                const result = await supabaseUtils.healthCheck()
                expect(result).toBe(false)
            })
        })
    })

    describe('Error Handling', () => {
        describe('when Supabase is not configured', () => {
            const unconfiguredTestCases = [
                {
                    method: 'isAuthenticated' as const,
                    expectedResult: false,
                    description: 'should return false for isAuthenticated when Supabase is not configured'
                },
                {
                    method: 'healthCheck' as const,
                    expectedResult: false,
                    description: 'should return false for healthCheck when Supabase is not configured'
                }
            ]

            const unconfiguredErrorTestCases = [
                {
                    method: 'getCurrentUser' as const,
                    expectedError: 'Supabase not configured',
                    description: 'should return configuration error for getCurrentUser when Supabase is not configured'
                },
                {
                    method: 'signOut' as const,
                    expectedError: 'Supabase not configured',
                    description: 'should return configuration error for signOut when Supabase is not configured'
                }
            ]

            unconfiguredTestCases.forEach(({ method, expectedResult, description }) => {
                it(description, async () => {
                    await testScenarios.withUnconfiguredServerEnvironment(async () => {
                        const { supabaseUtils } = await import('../supabase')
                        const result = await supabaseUtils[method]()
                        expect(result).toBe(expectedResult)
                    })
                })
            })

            unconfiguredErrorTestCases.forEach(({ method, expectedError, description }) => {
                it(description, async () => {
                    await testScenarios.withUnconfiguredServerEnvironment(async () => {
                        const { supabaseUtils } = await import('../supabase')
                        const result = await supabaseUtils[method]()
                        expect(result.data).toBeNull()
                        expect(result.error?.message).toBe(expectedError)
                    })
                })
            })
        })
    })
})