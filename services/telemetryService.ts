
import { safeLocalStorage } from '../utils/storageUtils';
import { STORAGE_KEYS } from '../constants/storageConfig';
import { TELEMETRY_CONFIG } from '../constants/appConfig';

export interface SystemLog {
  id: string;
  timestamp: number;
  level: 'ERROR' | 'WARN' | 'INFO';
  message: string;
  stack?: string;
  context?: string; // e.g., 'TrendEngine', 'GeminiAPI'
}

const LOG_STORAGE_KEY = STORAGE_KEYS.TELEMETRY_LOGS;

export const telemetryService = {
  logError: (error: Error | string, context: string = 'System') => {
    const message = error instanceof Error ? error.message : error;
    const stack = error instanceof Error ? error.stack : undefined;
    
    const newLog: SystemLog = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      level: 'ERROR',
      message,
      stack,
      context
    };

    const logs = safeLocalStorage.getItem<SystemLog[]>(LOG_STORAGE_KEY, []);
    const updated = [newLog, ...logs].slice(0, TELEMETRY_CONFIG.MAX_LOGS);
    safeLocalStorage.setItem(LOG_STORAGE_KEY, updated);
    
    console.error(`[${context}]`, error);
  },

  getLogs: (): SystemLog[] => {
    return safeLocalStorage.getItem<SystemLog[]>(LOG_STORAGE_KEY, []);
  },

  clearLogs: () => {
    safeLocalStorage.removeItem(LOG_STORAGE_KEY);
  }
};
