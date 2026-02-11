import path from 'path';
import { defineConfig, loadEnv, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// BroCula plugin: Transform CSS links to be non-render-blocking
const nonBlockingCssPlugin = (): Plugin => ({
  name: 'non-blocking-css',
  transformIndexHtml(html) {
    // Find CSS link tags and make them non-blocking
    return html.replace(
      /<link rel="stylesheet" crossorigin href="([^"]+)"\s*\/?>/g,
      '<link rel="preload" href="$1" as="style" onload="this.onload=null;this.rel=\'stylesheet\'" />\n<noscript><link rel="stylesheet" href="$1" /></noscript>'
    );
  },
});

// Flexy plugin: Inject environment variables into index.html with defaults
const htmlEnvPlugin = (env: Record<string, string>): Plugin => ({
  name: 'html-env',
  transformIndexHtml(html) {
    // Define default values for HTML environment variables
    const defaults: Record<string, string> = {
      VITE_APP_NAME: 'TrendVentures AI',
      VITE_APP_DEFAULT_TITLE: 'TrendVentures AI | Market Research Suite',
      VITE_APP_DEFAULT_DESCRIPTION: 'Generate comprehensive business blueprints and revenue models with AI-powered market intelligence. Transform ideas into actionable strategies.',
      VITE_OG_DESCRIPTION: 'AI-powered market intelligence suite that generates business blueprints.',
      VITE_OG_IMAGE_WIDTH: '1200',
      VITE_OG_IMAGE_HEIGHT: '630',
      VITE_PLACEHOLDER_BASE_URL: 'https://placehold.co',
      VITE_COLOR_SLATE_50: '#f8fafc',
      VITE_COLOR_SLATE_600: '#475569',
      VITE_COLOR_SLATE_700: '#334155',
      VITE_COLOR_SLATE_800: '#1e293b',
      VITE_COLOR_SLATE_900: '#0f172a',
      VITE_COLOR_SLATE_950: '#020617',
      VITE_COLOR_PRIMARY_EMERALD: '#10b981',
      VITE_APP_BASE_URL: 'https://trendventures.ai',
      VITE_GOOGLE_FONTS_URL: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&family=Fira+Code&display=swap',
    };

    // Replace placeholders with env values or defaults
    let result = html;
    Object.entries(defaults).forEach(([key, defaultValue]) => {
      const value = env[key] || defaultValue;
      const placeholder = `%${key}%`;
      result = result.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
    });

    return result;
  },
});

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
      plugins: [react(), tailwindcss(), nonBlockingCssPlugin(), htmlEnvPlugin(env)],
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
