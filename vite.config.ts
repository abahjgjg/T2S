import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

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
      plugins: [react()],
      build: {
        sourcemap: true,
        rollupOptions: {
          output: {
            manualChunks: {
              // Split vendor libraries into separate chunks
              'vendor-react': ['react', 'react-dom'],
              'vendor-ui': ['lucide-react', 'recharts'],
              'vendor-ai': ['@google/genai'],
              'vendor-data': ['@supabase/supabase-js', '@tanstack/react-query'],
              'vendor-markdown': ['react-markdown', 'remark-gfm'],
            }
          }
        },
        chunkSizeWarningLimit: 1000
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
      build: {
        chunkSizeWarningLimit: 1500,
      },
      test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './vitest.setup.ts',
        exclude: ['**/node_modules/**', '**/dist/**', '**/.opencode/**'],
      }
    };
});
