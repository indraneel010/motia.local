/// <reference types="jest" />

// Jest global type declarations for the test package
declare global {
  namespace jest {
    interface Matchers<R> {
      // Add any custom matchers here if needed
    }
  }
}

export {};