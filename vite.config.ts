import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Load configuration from environment variables with defaults
const loadConfig = (env: Record<string, string>) => ({
  // Server configuration
  server: {
    port: parseInt(env.VITE_DEV_DEFAULT_PORT || '3000', 10),
    host: env.VITE_DEV_HOST || '0.0.0.0',
  },
  // Build configuration
  build: {
    sourcemap: env.VITE_BUILD_SOURCEMAP !== 'false',
    chunkSizeWarningLimit: parseInt(env.VITE_CHUNK_SIZE_WARNING_LIMIT || '1500', 10),
  },
});

// Expose all VITE_ prefixed env vars to the browser
const exposeEnvVars = (env: Record<string, string>): Record<string, string> => {
  const exposed: Record<string, string> = {};
  
  // Automatically expose all VITE_ prefixed variables
  Object.keys(env).forEach(key => {
    if (key.startsWith('VITE_')) {
      exposed[`process.env.${key}`] = JSON.stringify(env[key]);
    }
  });
  
  // Legacy support for old env var names
  exposed['process.env.API_KEY'] = JSON.stringify(env.GEMINI_API_KEY || '');
  exposed['process.env.GEMINI_API_KEY'] = JSON.stringify(env.GEMINI_API_KEY || '');
  exposed['process.env.SUPABASE_URL'] = JSON.stringify(env.SUPABASE_URL || '');
  exposed['process.env.SUPABASE_KEY'] = JSON.stringify(env.SUPABASE_KEY || '');
  
  return exposed;
};

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const config = loadConfig(env);
    
    return {
      server: config.server,
      plugins: [react(), tailwindcss()],
      build: config.build,
      define: exposeEnvVars(env),
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './vitest.setup.ts',
        exclude: ['**/node_modules/**', '**/dist/**', '**/.opencode/**'],
      }
    };
});
