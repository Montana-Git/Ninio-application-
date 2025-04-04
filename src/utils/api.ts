/**
 * API utility functions
 */

/**
 * Options for the retry function
 */
interface RetryOptions {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffFactor: number;
  retryableErrors?: Array<string | number>;
  onRetry?: (error: any, attempt: number) => void;
}

/**
 * Default retry options
 */
const defaultRetryOptions: RetryOptions = {
  maxRetries: 3,
  initialDelay: 300,
  maxDelay: 5000,
  backoffFactor: 2,
};

/**
 * Retry a function with exponential backoff
 * 
 * @param fn - The function to retry
 * @param options - Retry options
 * @returns The result of the function
 * @throws The last error encountered
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const opts: RetryOptions = { ...defaultRetryOptions, ...options };
  let lastError: any;
  
  for (let attempt = 0; attempt < opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Check if this error is retryable
      if (opts.retryableErrors && !isRetryableError(error, opts.retryableErrors)) {
        throw error;
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        opts.initialDelay * Math.pow(opts.backoffFactor, attempt),
        opts.maxDelay
      );
      
      // Add some jitter to prevent all clients retrying at the same time
      const jitteredDelay = delay * (0.8 + Math.random() * 0.4);
      
      // Call onRetry callback if provided
      if (opts.onRetry) {
        opts.onRetry(error, attempt + 1);
      } else {
        console.warn(`API call failed, retrying (${attempt + 1}/${opts.maxRetries})...`, error);
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, jitteredDelay));
    }
  }
  
  throw lastError;
}

/**
 * Check if an error is retryable based on error codes or status codes
 * 
 * @param error - The error to check
 * @param retryableErrors - Array of retryable error codes or status codes
 * @returns Whether the error is retryable
 */
function isRetryableError(error: any, retryableErrors: Array<string | number>): boolean {
  // Network errors are always retryable
  if (error instanceof TypeError && error.message.includes('Network')) {
    return true;
  }
  
  // Check for timeout errors
  if (error.message && error.message.includes('timeout')) {
    return true;
  }
  
  // Check for specific HTTP status codes (e.g., 429, 503)
  if (error.status && retryableErrors.includes(error.status)) {
    return true;
  }
  
  // Check for specific error codes
  if (error.code && retryableErrors.includes(error.code)) {
    return true;
  }
  
  return false;
}

/**
 * Default retryable status codes
 */
export const defaultRetryableStatusCodes = [
  408, // Request Timeout
  429, // Too Many Requests
  500, // Internal Server Error
  502, // Bad Gateway
  503, // Service Unavailable
  504, // Gateway Timeout
];

/**
 * Fetch with timeout and retry capabilities
 * 
 * @param url - The URL to fetch
 * @param options - Fetch options
 * @param timeoutMs - Timeout in milliseconds
 * @param retryOptions - Retry options
 * @returns The fetch response
 * @throws Error if the request fails after retries
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 10000,
  retryOptions: Partial<RetryOptions> = {}
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    return await retry(
      async () => {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });
        
        // Throw for non-2xx responses to trigger retry
        if (!response.ok) {
          const error: any = new Error(`HTTP error ${response.status}: ${response.statusText}`);
          error.status = response.status;
          error.response = response;
          throw error;
        }
        
        return response;
      },
      {
        retryableErrors: defaultRetryableStatusCodes,
        ...retryOptions,
      }
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
