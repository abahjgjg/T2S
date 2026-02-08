import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Note: Using hardcoded value in config file as it's evaluated at build time
// This is acceptable for build configuration
const DEFAULT_DEV_PORT = 3000;

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: DEFAULT_DEV_PORT,
        host: '0.0.0.0',
      },
      plugins: [react(), tailwindcss()],
      build: {
        sourcemap: true,
        chunkSizeWarningLimit: 1500
      },
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY || ''),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || ''),
        'process.env.SUPABASE_URL': JSON.stringify(env.SUPABASE_URL || ''),
        'process.env.SUPABASE_KEY': JSON.stringify(env.SUPABASE_KEY || '')
      },
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
