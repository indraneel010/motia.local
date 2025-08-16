import type { Event, Logger } from '@motiadev/core'
import { createEventManager } from './event-manager'
import { CapturedEvent, MotiaTester, Response } from './types'

// Simplified implementation to avoid complex dependencies
const mockLogger: Logger = {
  info: () => { },
  error: () => { },
  warn: () => { },
  debug: () => { },
  log: () => { }
} as any

const mockResponse: Response = {
  status: 200,
  body: {},
  headers: {}
}

export const createMotiaTester = (): MotiaTester => {
  const eventManager = createEventManager()

  return {
    logger: mockLogger,
    waitEvents: async () => eventManager.waitEvents(),
    post: async (requestPath, options): Promise<Response> => {
      // Simplified mock implementation
      return mockResponse
    },
    get: async (requestPath, options): Promise<Response> => {
      // Simplified mock implementation  
      return mockResponse
    },
    emit: async (event) => eventManager.emit(event),
    watch: async <TData>(event: string) => {
      const events: CapturedEvent<TData>[] = []

      eventManager.subscribe({
        event,
        filePath: '$watcher',
        handlerName: '$watcher',
        handler: async (event: Event<TData>) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { logger, tracer, ...rest } = event
          events.push(rest)
        },
      })

      return {
        getCapturedEvents: () => events,
        getLastCapturedEvent: () => events[events.length - 1],
        getCapturedEvent: (index) => events[index],
      }
    },
    sleep: async (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
    close: async () => { },
  }
}