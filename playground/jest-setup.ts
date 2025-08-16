// Jest setup file for playground integration tests
import '@types/jest';

// Global Jest types are now available
declare global {
  namespace jest {
    interface Matchers<R> {
      // Add any custom matchers here if needed
    }
  }
}

export {};