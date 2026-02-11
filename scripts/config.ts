/**
 * Script Configuration
 * Flexy: Centralized configuration for build/test scripts
 * All values can be overridden via environment variables
 */

// Helper to get env var with default
const getEnv = (key: string, defaultValue: string): string => {
  return process.env[key] || defaultValue;
};

const getEnvNumber = (key: string, defaultValue: number): number => {
  const value = process.env[key];
  return value ? parseInt(value, 10) : defaultValue;
};

const getEnvArray = (key: string, defaultValue: string[]): string[] => {
  const value = process.env[key];
  return value ? value.split(',').map(s => s.trim()) : defaultValue;
};

export const SCRIPT_CONFIG = {
  // Server Configuration
  server: {
    port: getEnvNumber('VITE_PREVIEW_PORT', 4173),
    host: getEnv('VITE_PREVIEW_HOST', 'localhost'),
    protocol: getEnv('VITE_PREVIEW_PROTOCOL', 'http'),
    get baseUrl() {
      return `${this.protocol}://${this.host}:${this.port}`;
    },
  },

  // Chrome/Playwright Configuration
  chrome: {
    path: getEnv(
      'VITE_CHROME_PATH',
      `${process.env.HOME}/.cache/ms-playwright/chromium-1208/chrome-linux/chrome`
    ),
    debuggingPort: getEnvNumber('VITE_CHROME_DEBUGGING_PORT', 9222),
    flags: getEnvArray('VITE_CHROME_FLAGS', [
      '--headless',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
    ]),
  },

  // Test Routes
  testRoutes: getEnvArray('VITE_TEST_ROUTES', ['/', '/directory']),

  // Timeouts (in milliseconds)
  timeouts: {
    // Server startup
    serverStartup: getEnvNumber('VITE_TIMEOUT_SERVER_STARTUP', 8000),
    serverStartupMax: getEnvNumber('VITE_TIMEOUT_SERVER_STARTUP_MAX', 30000),
    serverReady: getEnvNumber('VITE_TIMEOUT_SERVER_READY', 3000),

    // Page navigation
    pageNavigation: getEnvNumber('VITE_TIMEOUT_PAGE_NAVIGATION', 60000),
    networkIdle: getEnvNumber('VITE_TIMEOUT_NETWORK_IDLE', 5000),
    pageSettle: getEnvNumber('VITE_TIMEOUT_PAGE_SETTLE', 5000),

    // Interactions
    betweenRoutes: getEnvNumber('VITE_TIMEOUT_BETWEEN_ROUTES', 2000),
    clickTimeout: getEnvNumber('VITE_TIMEOUT_CLICK', 2000),
    afterClick: getEnvNumber('VITE_TIMEOUT_AFTER_CLICK', 500),

    // Chrome launch
    chromeLaunch: getEnvNumber('VITE_TIMEOUT_CHROME_LAUNCH', 3000),
  },

  // Interaction Settings
  interaction: {
    maxButtonsToClick: getEnvNumber('VITE_MAX_BUTTONS_TO_CLICK', 3),
  },

  // Lighthouse Configuration
  lighthouse: {
    categories: getEnvArray('VITE_LIGHTHOUSE_CATEGORIES', [
      'performance',
      'accessibility',
      'best-practices',
      'seo',
    ]),
    outputFormat: getEnv('VITE_LIGHTHOUSE_OUTPUT_FORMAT', 'json'),
    logLevel: getEnv('VITE_LIGHTHOUSE_LOG_LEVEL', 'error'),
    outputDir: getEnv('VITE_LIGHTHOUSE_OUTPUT_DIR', '.lighthouseci'),
    outputFilename: getEnv('VITE_LIGHTHOUSE_OUTPUT_FILENAME', 'lighthouse-report.json'),
  },

  // Scoring Thresholds
  thresholds: {
    excellent: getEnvNumber('VITE_SCORE_EXCELLENT', 90),
    good: getEnvNumber('VITE_SCORE_GOOD', 70),
    poor: getEnvNumber('VITE_SCORE_POOR', 50),
  },
} as const;

export default SCRIPT_CONFIG;
