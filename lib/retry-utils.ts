/**
 * Retry utilities for handling transient API failures
 * 
 * This module provides retry logic with exponential backoff for API calls.
 * Includes specialized functions for Spotify and Replicate API integration
 * with appropriate error handling and rate limiting support.
 * 
 * @module retry-utils
 */

/**
 * Configuration options for retry behavior
 * 
 * @interface RetryOptions
 * @property {number} maxAttempts - Maximum number of retry attempts
 * @property {number} baseDelay - Base delay in milliseconds before first retry
 * @property {number} maxDelay - Maximum delay in milliseconds between retries
 * @property {number} backoffMultiplier - Multiplier for exponential backoff
 */
export interface RetryOptions {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

/**
 * Default retry configuration
 * Uses exponential backoff with reasonable defaults for most API calls
 */
const defaultOptions: RetryOptions = {
  maxAttempts: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2
};

/**
 * Generic retry wrapper with exponential backoff
 * 
 * @template T
 * @param {() => Promise<T>} operation - Async operation to retry
 * @param {Partial<RetryOptions>} options - Retry configuration options
 * @returns {Promise<T>} Result of the operation
 * 
 * @example
 * const result = await withRetry(() => fetch('/api/data'), {
 *   maxAttempts: 5,
 *   baseDelay: 2000
 * });
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const opts = { ...defaultOptions, ...options };
  let lastError: Error;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === opts.maxAttempts) {
        throw lastError;
      }

      // Check if error is retryable
      if (!isRetryableError(error)) {
        throw lastError;
      }

      const delay = Math.min(
        opts.baseDelay * Math.pow(opts.backoffMultiplier, attempt - 1),
        opts.maxDelay
      );

      console.log(`Attempt ${attempt} failed, retrying in ${delay}ms:`, lastError.message);
      await sleep(delay);
    }
  }

  throw lastError!;
}

function isRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    // Network errors
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return true;
    }
    
    // HTTP status errors that are retryable
    if (error.message.includes('500') || 
        error.message.includes('502') || 
        error.message.includes('503') || 
        error.message.includes('504') || 
        error.message.includes('429')) { // Rate limit
      return true;
    }
  }
  
  return false;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public retryable = false
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export async function spotifyApiCall<T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> {
  return withRetry(
    async () => {
      try {
        return await operation();
      } catch (error: unknown) {
        const apiError = error as { statusCode?: number; headers?: Record<string, string>; message?: string };
        if (apiError.statusCode === 429) {
          // Rate limited - wait for retry-after header if available
          const retryAfter = apiError.headers?.['retry-after'];
          if (retryAfter) {
            const waitTime = parseInt(retryAfter) * 1000;
            console.log(`Spotify rate limited, waiting ${waitTime}ms`);
            await sleep(waitTime);
            return await operation();
          }
          throw new APIError(`Spotify API rate limited: ${operationName}`, 429, true);
        }
        
        if (apiError.statusCode === 401) {
          throw new APIError(`Spotify API unauthorized: ${operationName}`, 401, false);
        }
        
        if (apiError.statusCode && apiError.statusCode >= 500) {
          throw new APIError(`Spotify API server error: ${operationName}`, apiError.statusCode, true);
        }
        
        throw new APIError(`Spotify API error: ${operationName} - ${apiError.message}`, apiError.statusCode, false);
      }
    },
    {
      maxAttempts: 3,
      baseDelay: 2000,
      maxDelay: 30000
    }
  );
}

export async function replicateApiCall<T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> {
  return withRetry(
    async () => {
      try {
        return await operation();
      } catch (error: unknown) {
        const apiError = error as { message?: string; status?: number };
        if (apiError.message?.includes('rate limit') || apiError.status === 429) {
          throw new APIError(`Replicate API rate limited: ${operationName}`, 429, true);
        }
        
        if (apiError.status && apiError.status >= 500) {
          throw new APIError(`Replicate API server error: ${operationName}`, apiError.status, true);
        }
        
        throw new APIError(`Replicate API error: ${operationName} - ${apiError.message}`, apiError.status, false);
      }
    },
    {
      maxAttempts: 2, // Fewer attempts for Replicate as it's more expensive
      baseDelay: 5000,
      maxDelay: 60000
    }
  );
}