// Test utilities for Motia framework
// This file provides basic testing functionality

// Define MotiaError locally for testing
class MotiaError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'MotiaError';
  }
}

// This is a placeholder for a function from one of your core packages.
// Let's pretend you have a function that processes a workflow step.
const processMotiaStep = async (input: { type: string; payload: any }): Promise<{ status: string }> => {
  if (input.type === 'SUCCESS') {
    return { status: 'OK' };
  }
  if (input.type === 'FAILURE') {
    throw new MotiaError('Step failed as expected.', 'TEST_FAILURE');
  }
  throw new Error('Unknown step type');
};
// -----------------------------------------------------------------------------


// Export the test utilities for use in other test files
export { MotiaError, processMotiaStep };