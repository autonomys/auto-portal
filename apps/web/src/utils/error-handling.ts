/**
 * Error handling utilities for Auto SDK operations
 */

export class BlockchainError extends Error {
  constructor(
    message: string,
    public readonly operation: string,
    public readonly originalError?: Error,
  ) {
    super(message);
    this.name = 'BlockchainError';
  }
}

export class OperatorNotFoundError extends BlockchainError {
  constructor(operatorId: string) {
    super(`Operator ${operatorId} not found or inactive`, 'fetch_operator');
    this.name = 'OperatorNotFoundError';
  }
}

export class ConnectionError extends BlockchainError {
  constructor(endpoint: string, originalError?: Error) {
    super(`Failed to connect to blockchain at ${endpoint}`, 'connection', originalError);
    this.name = 'ConnectionError';
  }
}

export const handleSdkError = (error: unknown, operation: string): BlockchainError => {
  if (error instanceof BlockchainError) {
    return error;
  }

  if (error instanceof Error) {
    return new BlockchainError(`${operation} failed: ${error.message}`, operation, error);
  }

  return new BlockchainError(`${operation} failed with unknown error`, operation);
};

export const isNetworkError = (error: unknown): boolean => {
  if (error instanceof ConnectionError) {
    return true;
  }

  if (error instanceof Error) {
    return (
      error.message.includes('network') ||
      error.message.includes('connection') ||
      error.message.includes('timeout')
    );
  }

  return false;
};
