import path from 'path';
import { defineConfig, loadEnv, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import {
  LAZY_LOADED_PATTERNS,
  BUILD_OPTIMIZATION,
  TERSER_OPTIONS,
  FILE_NAMING,
  SERVER_CONFIG,
  HTML_ENV_DEFAULTS,
  MANUAL_CHUNKS,
} from './viteBuildConfig';

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

// BroCula plugin: Remove modulepreload for lazy-loaded chunks to prevent loading unused JavaScript
// Flexy: Now uses configurable LAZY_LOADED_PATTERNS from viteBuildConfig!
const removeLazyModulePreloadPlugin = (): Plugin => ({
  name: 'remove-lazy-module-preload',
  transformIndexHtml(html) {
    // Remove modulepreload links for lazy-loaded chunks
    // These chunks should only load when the component is actually needed
    // Flexy: No more hardcoded patterns - using LAZY_LOADED_PATTERNS from config!
    
    let result = html;
    LAZY_LOADED_PATTERNS.forEach(pattern => {
      // Remove modulepreload links that match lazy-loaded chunk patterns
      const regex = new RegExp(`<link rel="modulepreload"[^>]*href="[^"]*${pattern}[^"]*"[^>]*>\\n?`, 'g');
      result = result.replace(regex, '');
    });
    
    return result;
  },
});

// Flexy plugin: Inject environment variables into index.html with defaults
// Flexy: Now uses configurable HTML_ENV_DEFAULTS from viteBuildConfig!
const htmlEnvPlugin = (env: Record<string, string>): Plugin => ({
  name: 'html-env',
  transformIndexHtml(html) {
    // Flexy: Using configurable defaults from viteBuildConfig!
    const defaults = HTML_ENV_DEFAULTS;

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
// Flexy: Now uses modular configuration from viteBuildConfig!
const loadConfig = () => ({
  // Server configuration - from viteBuildConfig
  server: {
    port: SERVER_CONFIG.port,
    host: SERVER_CONFIG.host,
  },
  // Build configuration - BroCula optimized, Flexy modularized!
  build: {
    sourcemap: BUILD_OPTIMIZATION.sourcemap,
    chunkSizeWarningLimit: BUILD_OPTIMIZATION.chunkSizeWarningLimit,
    // CSS code splitting to prevent render-blocking
    cssCodeSplit: BUILD_OPTIMIZATION.cssCodeSplit,
    rollupOptions: {
      output: {
        // Optimize chunk loading with better naming - from viteBuildConfig
        entryFileNames: FILE_NAMING.entry,
        chunkFileNames: FILE_NAMING.chunk,
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name ? assetInfo.name.split('.') : [];
          const ext = info[info.length - 1];
          if (/\.(css)$/i.test(assetInfo.name || '')) {
            return FILE_NAMING.css;
          }
          return FILE_NAMING.asset;
        },
        // Flexy: No more hardcoded manual chunks - using configurable MANUAL_CHUNKS!
        manualChunks: MANUAL_CHUNKS,
      }
    },
    // Minification for production - BroCula optimized, Flexy modularized!
    minify: BUILD_OPTIMIZATION.minify,
    terserOptions: TERSER_OPTIONS,
    // Target modern browsers for smaller bundles
    target: BUILD_OPTIMIZATION.target,
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
    // Flexy: loadConfig now uses modular config - no need to pass env!
    const config = loadConfig();
    
    return {
      server: config.server,
      plugins: [react(), tailwindcss(), nonBlockingCssPlugin(), removeLazyModulePreloadPlugin(), htmlEnvPlugin(env)],
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
