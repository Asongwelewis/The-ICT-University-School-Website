// Temporary Jest type declarations until @types/jest is installed
declare global {
  function describe(name: string, fn: () => void): void
  function it(name: string, fn: () => void | Promise<void>): void
  function beforeEach(fn: () => void | Promise<void>): void
  function afterEach(fn: () => void | Promise<void>): void
  
  namespace jest {
    function fn(): any
    function mock(moduleName: string, factory?: () => any): void
    function clearAllMocks(): void
    function resetModules(): void
  }
  
  function expect(actual: any): {
    toBe(expected: any): void
    toEqual(expected: any): void
    toBeNull(): void
    toBeInstanceOf(expected: any): void
    not: {
      toThrow(): void
    }
    toThrow(expected?: string | Error): void
  }
}

export {}