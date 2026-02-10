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
  // Build configuration - BroCula optimized
  build: {
    sourcemap: env.VITE_BUILD_SOURCEMAP !== 'false',
    chunkSizeWarningLimit: parseInt(env.VITE_CHUNK_SIZE_WARNING_LIMIT || '1500', 10),
    // CSS code splitting to prevent render-blocking
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        // Optimize chunk loading with better naming
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name ? assetInfo.name.split('.') : [];
          const ext = info[info.length - 1];
          if (/\.(css)$/i.test(assetInfo.name || '')) {
            return 'assets/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
        manualChunks: {
          // Vendor chunks - separate third-party libraries for better caching
          'vendor-react': ['react', 'react-dom', '@tanstack/react-query'],
          'vendor-charts': ['recharts'],
          'vendor-markdown': ['react-markdown', 'remark-gfm'],
          'vendor-ui': ['lucide-react'],
          // Feature chunks - lazy loaded features (use lazy loading)
          'feature-admin': ['./components/AdminPanel'],
          'feature-dashboard': ['./components/UserDashboard'],
          'feature-blueprint': ['./components/BlueprintView'],
        }
      }
    },
    // Minification for production - BroCula optimized
    minify: 'terser' as const,
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.trace'],
        passes: 2,
      },
      format: {
        comments: false,
      },
    },
    // Target modern browsers for smaller bundles
    target: 'es2020',
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
