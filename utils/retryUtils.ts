
import { telemetryService } from "../services/telemetryService";

/**
 * Executes a promise-returning function with retry logic.
 * Handles exponential backoff and determines if errors are retryable.
 */
import { MEDIA_CONFIG } from "../constants/aiConfig";
import { isFatalClientError, shouldRetryStatus, HTTP_STATUS } from "../constants/httpStatus";
import { RETRY_MESSAGES } from "../constants/errorMessages";

export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = MEDIA_CONFIG.RETRY.DEFAULT_MAX_RETRIES,
  initialDelayMs: number = MEDIA_CONFIG.RETRY.DEFAULT_DELAY_MS,
  context: string = 'Operation' // Added context parameter
): Promise<T> => {
  let lastError: any;
  let delay = initialDelayMs;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      const isSyntaxError = error instanceof SyntaxError;
      const status = error.status || error.response?.status || (error as any).statusCode;
      
      // Use modular status checking - fatal if client error (4xx) but NOT retryable ones
      const fatalError = status && isFatalClientError(status);

      if (!isSyntaxError && fatalError) {
        telemetryService.logError(error, `${context} (Fatal Client Error)`);
        throw error;
      }
      
      // If we used up all retries, throw
      if (attempt === maxRetries) {
        telemetryService.logError(error, `${context} (Max Retries Exceeded)`);
        throw error;
      }
      
      console.warn(RETRY_MESSAGES.ATTEMPT_FAILED(attempt, maxRetries, delay), error.message || error);
      
      // Wait for backoff delay
      await new Promise(resolve => setTimeout(resolve, delay));
      
      delay *= 2;
    }
  }
  
  throw lastError;
};
