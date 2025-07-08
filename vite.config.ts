import { defineConfig, PluginOption } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// lovable-tagger is optional (adds component names in dev); ignore if not installed
let componentTagger: (() => PluginOption) | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  componentTagger = require('lovable-tagger').componentTagger;
} catch (_) {
  componentTagger = null;
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    port: 8080,
    strictPort: false,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger ? componentTagger() : null,
  ].filter(Boolean) as PluginOption[],
  esbuild: {
    // Skip TypeScript type checking to avoid project reference issues
    tsconfigRaw: '{}',
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
    sourcemap: mode === 'development',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select', '@radix-ui/react-tabs'],
          'supabase': ['@supabase/supabase-js'],
          'maps': ['@googlemaps/js-api-loader', '@react-google-maps/api'],
          'charts': ['recharts'],
          'forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'ai': ['framer-motion', 'openai'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
}));
