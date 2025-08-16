// Type declarations for playground

// Jest globals
declare const describe: jest.Describe;
declare const it: jest.It;
declare const expect: jest.Expect;
declare const beforeEach: jest.Lifecycle;
declare const afterEach: jest.Lifecycle;
declare const beforeAll: jest.Lifecycle;
declare const afterAll: jest.Lifecycle;

// Module declarations for workspace packages
declare module '@motiadev/test' {
  export function createMotiaTester(): {
    logger: any;
    waitEvents(): Promise<void>;
    post(path: string, options: { body: any }): Promise<{ status: number; body: any }>;
    get(path: string, options: { body: any }): Promise<{ status: number; body: any }>;
    emit(event: any): Promise<void>;
    watch<TData>(event: string): Promise<{
      getCapturedEvents(): any[];
      getLastCapturedEvent(): any;
      getCapturedEvent(index: number): any;
    }>;
    sleep(ms: number): Promise<void>;
    close(): Promise<void>;
  };
}