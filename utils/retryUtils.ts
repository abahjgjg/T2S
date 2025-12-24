
/**
 * Executes a promise-returning function with retry logic.
 * Handles exponential backoff and determines if errors are retryable.
 */
export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  initialDelayMs: number = 1000
): Promise<T> => {
  let lastError: any;
  let delay = initialDelayMs;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      // Determine if error is fatal (should not retry)
      // 1. SyntaxError: Usually means LLM returned bad JSON. Retry might fix it.
      // 2. Client Error (4xx): Usually fatal (Invalid arg), EXCEPT 429 (Too Many Requests).
      // 3. Server Error (5xx): Retryable.
      
      const isSyntaxError = error instanceof SyntaxError;
      const status = error.status || error.response?.status || (error as any).statusCode;
      
      // If it's a 4xx error (but NOT 429 Too Many Requests or 408 Timeout), treat as fatal
      const isFatalClientError = status && status >= 400 && status < 500 && status !== 429 && status !== 408;

      if (!isSyntaxError && isFatalClientError) {
        console.error(`Fatal error (Attempt ${attempt}):`, error);
        throw error;
      }
      
      // If we used up all retries, throw
      if (attempt === maxRetries) throw error;
      
      console.warn(`Attempt ${attempt} failed. Retrying in ${delay}ms...`, error.message || error);
      
      // Wait for backoff delay
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Exponential backoff
      delay *= 2;
    }
  }
  
  throw lastError;
};
