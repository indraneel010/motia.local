import { MockFlowContext, MockLogger } from './types'

// Simple mock function type for compatibility
type MockFunction = (...args: any[]) => any

export const createMockLogger = (): MockLogger => {
  const mockFn = (): MockFunction => {
    const fn = (() => { }) as any
    fn.mockReturnValue = () => fn
    fn.mockImplementation = () => fn
    fn.mockResolvedValue = () => fn
    fn.mockRejectedValue = () => fn
    return fn
  }

  return {
    info: mockFn(),
    error: mockFn(),
    warn: mockFn(),
    debug: mockFn(),
    log: mockFn(),
  }
}

export const setupLoggerMock = () => {
  // This would be used in test environments where jest is available
  // For now, we'll provide a simple implementation
  console.warn('setupLoggerMock called - ensure jest is properly configured in test environment')
}

export const createMockContext = (options?: {
  logger?: MockLogger
  emit?: MockFunction
  traceId?: string
  state?: Partial<MockFlowContext['state']>
}): MockFlowContext => {
  const mockFn = (): MockFunction => {
    const fn = (() => { }) as any
    fn.mockReturnValue = () => fn
    fn.mockImplementation = () => fn
    return fn
  }

  const {
    logger = createMockLogger(),
    emit = mockFn(),
    traceId = 'mock-trace-id',
    state
  } = options || {}

  return {
    logger: logger as any,
    emit: emit as any,
    traceId,
    state: {
      get: mockFn(),
      set: mockFn(),
      delete: mockFn(),
      clear: mockFn(),
      getGroup: mockFn(),
      ...state,
    } as any,
  }
}
