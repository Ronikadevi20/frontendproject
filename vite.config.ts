import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { configDefaults } from 'vitest/config';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api': 'http://localhost:8000', // your Django backend port
    },
  },

  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  // ✅ ADD THIS PART BELOW:
  test: {
    environment: 'jsdom',          // ← So window, document, sessionStorage exist
    globals: true,                  // ← So you can use describe/test/expect without importing
    setupFiles: './src/setupTests.ts', // ← If you use setupTests.ts for mocks
  },
}));
