// Local type definitions to avoid dependency issues with @motiadev/core
// These types mirror the core package types but are self-contained

export interface Logger {
  info: (...args: any[]) => void
  debug: (...args: any[]) => void
  warn: (...args: any[]) => void
  error: (...args: any[]) => void
  log: (...args: any[]) => void
}

export interface Tracer {
  // Tracer interface placeholder
}

export interface Event<TData = unknown> {
  topic: string
  data: TData
  traceId: string
  flows?: string[]
  logger: Logger
  tracer: Tracer
}

export interface Handler<TData = unknown> {
  (event: Event<TData>): Promise<void>
}

export interface SubscribeConfig<TData> {
  event: string
  handlerName: string
  filePath: string
  handler: Handler<TData>
}

export interface UnsubscribeConfig {
  filePath: string
  event: string
}

export interface EventManager {
  emit: <TData>(event: Event<TData>, file?: string) => Promise<void>
  subscribe: <TData>(config: SubscribeConfig<TData>) => void
  unsubscribe: (config: UnsubscribeConfig) => void
}

export interface InternalStateManager {
  get<T>(groupId: string, key: string): Promise<T | null>
  set<T>(groupId: string, key: string, value: T): Promise<T>
  delete<T>(groupId: string, key: string): Promise<T | null>
  getGroup<T>(groupId: string): Promise<T[]>
  clear(groupId: string): Promise<void>
}

export type EmitData = { topic: ''; data: unknown }
export type Emitter<TData> = (event: TData) => Promise<void>

export interface FlowContext<TEmitData = never> {
  emit: Emitter<TEmitData>
  traceId: string
  state: InternalStateManager
  logger: Logger
  streams: any // FlowContextStateStreams placeholder
}