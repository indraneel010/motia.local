import type { Event, Logger } from './core-types'
import { createEventManager, TestEventManager } from './event-manager'
import { createMockLogger } from './helpers'
import type { MotiaTester, RequestOptions, Response, Watcher, CapturedEvent } from './types'

export class MotiaTestFramework implements MotiaTester {
  private eventManager: TestEventManager
  public logger: Logger
  private watchers: Map<string, CapturedEvent[]> = new Map()

  constructor() {
    this.eventManager = createEventManager()
    this.logger = createMockLogger() as any
    this.setupEventWatching()
  }

  private setupEventWatching(): void {
    // Override the emit method to capture events for watchers
    const originalEmit = this.eventManager.emit.bind(this.eventManager)
    this.eventManager.emit = async <TData>(event: Event<TData>, file?: string): Promise<void> => {
      // Capture the event for watchers
      const capturedEvent: CapturedEvent<TData> = {
        topic: event.topic,
        data: event.data,
        traceId: event.traceId,
        flows: event.flows
      }
      
      if (this.watchers.has(event.topic)) {
        this.watchers.get(event.topic)!.push(capturedEvent as CapturedEvent)
      }
      
      // Call the original emit
      return originalEmit(event, file)
    }
  }

  async post(path: string, options: RequestOptions): Promise<Response> {
    // Mock HTTP POST request
    return {
      status: 200,
      body: { success: true, path, method: 'POST', ...options.body },
      headers: { 'content-type': 'application/json' }
    }
  }

  async get(path: string, options: RequestOptions): Promise<Response> {
    // Mock HTTP GET request
    return {
      status: 200,
      body: { success: true, path, method: 'GET' },
      headers: { 'content-type': 'application/json' }
    }
  }

  async emit(event: Event): Promise<void> {
    return this.eventManager.emit(event)
  }

  async watch<TData>(eventTopic: string): Promise<Watcher<TData>> {
    if (!this.watchers.has(eventTopic)) {
      this.watchers.set(eventTopic, [])
    }

    const watcher: Watcher<TData> = {
      getCapturedEvents: (): CapturedEvent<TData>[] => {
        return (this.watchers.get(eventTopic) || []) as CapturedEvent<TData>[]
      },
      getLastCapturedEvent: (): CapturedEvent<TData> | undefined => {
        const events = this.watchers.get(eventTopic) || []
        return events[events.length - 1] as CapturedEvent<TData> | undefined
      },
      getCapturedEvent: (index: number): CapturedEvent<TData> | undefined => {
        const events = this.watchers.get(eventTopic) || []
        return events[index] as CapturedEvent<TData> | undefined
      }
    }

    return watcher
  }

  async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async close(): Promise<void> {
    // Clean up resources
    this.watchers.clear()
  }

  async waitEvents(): Promise<void> {
    return this.eventManager.waitEvents()
  }
}

export const createMotiaTester = (): MotiaTester => {
  return new MotiaTestFramework()
}