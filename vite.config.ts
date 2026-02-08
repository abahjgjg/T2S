import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
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
      test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './vitest.setup.ts',
        exclude: ['**/node_modules/**', '**/dist/**', '**/.opencode/**'],
      }
    };
});
