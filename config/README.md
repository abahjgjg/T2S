# Configuration System

This directory contains the centralized, modular configuration system for TrendVentures AI. All configuration values can be customized via environment variables while maintaining sensible defaults.

## 🎯 Philosophy (Flexy's Mission)

**No hardcoded values. Everything is configurable.**

- Every constant has a default value
- Every constant can be overridden via environment variables
- Configuration is type-safe
- Configuration is validated at runtime

## 📁 Structure

```
config/
├── index.ts          # Main configuration module (API_CONFIG, APP_CONFIG, etc.)
└── README.md         # This file

constants/            # Re-export files for backward compatibility
├── apiConfig.ts
├── appConfig.ts
├── aiConfig.ts
├── uiConfig.ts
├── thresholds.ts
├── theme.ts
├── searchConfig.ts
├── displayConfig.ts
├── modalConfig.ts
├── storageConfig.ts
├── zIndex.ts
├── chartConfig.ts
├── audioVisualizerConfig.ts
├── sentimentConfig.ts
├── liveConfig.ts
└── dateTimeConfig.ts
```

## 🔧 Usage

### Basic Usage

Import configurations from the config module:

```typescript
import { API_CONFIG, APP_CONFIG } from './config';

// Use the configuration
const apiEndpoint = API_CONFIG.ENDPOINTS.OPENAI.CHAT;
const appTitle = APP_CONFIG.SEO.DEFAULT_TITLE;
```

### With Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Uncomment and modify the values you want to customize:
   ```env
   VITE_OPENAI_CHAT_ENDPOINT=https://custom-api.example.com/v1/chat
   VITE_MAX_OUTPUT_TOKENS=16384
   VITE_APP_DEFAULT_TITLE=My Custom App
   ```

3. All values have sensible defaults, so you only need to set what you want to change.

### Validation

Validate configuration at startup:

```typescript
import { validateConfig } from './config';

const errors = validateConfig();
if (errors.length > 0) {
  console.error('Configuration errors:', errors);
  process.exit(1);
}
```

## 📋 Environment Variable Naming Convention

All environment variables for the browser must be prefixed with `VITE_`:

- `VITE_API_*` - API endpoints and parameters
- `VITE_APP_*` - Application settings
- `VITE_UI_*` - UI timing and animations
- `VITE_CACHE_*` - Caching configuration
- `VITE_COLOR_*` - Theme colors
- `VITE_DISPLAY_*` - Display limits and truncation
- `VITE_MODAL_*` - Modal configuration
- `VITE_STORAGE_*` - Storage keys and settings
- `VITE_CHART_*` - Chart configuration
- `VITE_AUDIO_*` - Audio configuration
- `VITE_SENTIMENT_*` - Sentiment analysis settings

## 🎨 Customization Examples

### Custom API Endpoints
```env
VITE_OPENAI_CHAT_ENDPOINT=https://api.openai.com/v1/chat/completions
VITE_GEMINI_MODEL_BASIC=gemini-3-flash-preview
```

### Custom UI Timing
```env
VITE_UI_TOAST_DURATION_MS=5000
VITE_UI_DEBOUNCE_SEARCH_MS=500
```

### Custom Colors
```env
VITE_COLOR_PRIMARY_EMERALD=#00ff88
VITE_COLOR_SENTIMENT_POSITIVE=#00ff00
```

### Custom Thresholds
```env
VITE_THRESHOLD_HOT_TREND_MIN_GROWTH=90
VITE_PAGINATION_DEFAULT_PAGE_SIZE=50
```

## 🔒 Security

- API keys are loaded from environment variables (not hardcoded)
- Only `VITE_` prefixed variables are exposed to the browser
- Server-side secrets should not use the `VITE_` prefix

## 🔄 Backward Compatibility

All existing imports from `constants/*` will continue to work. The constants files now re-export from the config module with environment variable support.

```typescript
// Old way (still works)
import { API_ENDPOINTS } from './constants/apiConfig';

// New way (recommended)
import { API_CONFIG } from './config';
```

## 🧪 Testing

When running tests, environment variables can be set in:
- `.env.test` file
- `vitest.setup.ts`
- Test-specific mocks

Example in `vitest.setup.ts`:
```typescript
process.env.VITE_MAX_OUTPUT_TOKENS = '1024';
```

## 📝 Adding New Configuration

1. Add the constant with a default value in the appropriate config section
2. Create an environment variable getter using `getEnv()` or `getEnvNumber()`
3. Update `.env.example` with the new variable
4. Add TypeScript types if needed
5. Export the new configuration

Example:
```typescript
export const MY_NEW_CONFIG = {
  VALUE: getEnvNumber('VITE_MY_NEW_VALUE', 100),
  STRING: getEnv('VITE_MY_NEW_STRING', 'default'),
};
```

## 🐛 Debugging

View all loaded configuration (development only):

```typescript
import { getAllConfig } from './config';

console.log('Current config:', getAllConfig());
```

## 📚 References

- [Vite Env Variables](https://vitejs.dev/guide/env-and-mode.html)
- [TypeScript const assertions](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#const-assertions)
