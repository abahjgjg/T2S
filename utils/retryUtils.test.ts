
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { retryOperation } from './retryUtils';

describe('retryUtils', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should return result on first successful attempt', async () => {
    const mockFn = vi.fn().mockResolvedValue('success');
    const result = await retryOperation(mockFn);
    
    expect(result).toBe('success');
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should retry on failure and eventually succeed', async () => {
    const mockFn = vi.fn()
      .mockRejectedValueOnce(new Error('Temporary failure'))
      .mockResolvedValue('success');

    // Start operation
    const promise = retryOperation(mockFn, 3, 100);
    
    // Fast-forward time for the backoff
    await vi.runAllTimersAsync();
    
    const result = await promise;
    expect(result).toBe('success');
    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  it('should throw error after max retries are exhausted', async () => {
    const error = new Error('Persistent failure');
    const mockFn = vi.fn().mockRejectedValue(error);

    const promise = retryOperation(mockFn, 3, 100);
    promise.catch(() => {}); // Prevent unhandled rejection
    
    // Advance timers enough times
    await vi.runAllTimersAsync();
    
    await expect(promise).rejects.toThrow('Persistent failure');
    expect(mockFn).toHaveBeenCalledTimes(3);
  });

  it('should NOT retry on fatal client errors (4xx range, except 429)', async () => {
    const fatalError: any = new Error('Bad Request');
    fatalError.status = 400; // Client error
    
    const mockFn = vi.fn().mockRejectedValue(fatalError);

    // Should fail immediately without wait
    await expect(retryOperation(mockFn, 3, 100)).rejects.toThrow('Bad Request');
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should retry on 429 (Too Many Requests)', async () => {
    const rateLimitError: any = new Error('Rate Limited');
    rateLimitError.status = 429;
    
    const mockFn = vi.fn()
      .mockRejectedValueOnce(rateLimitError)
      .mockResolvedValue('success');

    const promise = retryOperation(mockFn, 3, 100);
    await vi.runAllTimersAsync();
    
    const result = await promise;
    expect(result).toBe('success');
    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  it('should retry on 5xx (Server Errors)', async () => {
    const serverError: any = new Error('Internal Server Error');
    serverError.status = 500;
    
    const mockFn = vi.fn()
      .mockRejectedValueOnce(serverError)
      .mockResolvedValue('success');

    const promise = retryOperation(mockFn, 3, 100);
    await vi.runAllTimersAsync();
    
    const result = await promise;
    expect(result).toBe('success');
    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  it('should perform exponential backoff', async () => {
    const mockFn = vi.fn().mockRejectedValue(new Error('Fail'));
    const initialDelay = 100;
    
    const promise = retryOperation(mockFn, 3, initialDelay);
    promise.catch(() => {}); // Prevent unhandled rejection
    
    // First failure caught, waiting 100ms
    expect(mockFn).toHaveBeenCalledTimes(1);
    
    await vi.advanceTimersByTimeAsync(initialDelay); 
    // Second attempt happens
    expect(mockFn).toHaveBeenCalledTimes(2);
    
    await vi.advanceTimersByTimeAsync(initialDelay * 2); // 200ms
    // Third attempt happens
    expect(mockFn).toHaveBeenCalledTimes(3);
    
    await expect(promise).rejects.toThrow('Fail');
  });
});
