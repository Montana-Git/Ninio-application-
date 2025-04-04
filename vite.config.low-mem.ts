
import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// Minimal config for low-memory builds
export default defineConfig({
  base: process.env.NODE_ENV === "development" ? "/" : process.env.VITE_BASE_PATH || "/",

  build: {
    // Disable source maps to save memory
    sourcemap: false,

    // Use esbuild for minification (faster and uses less memory)
    minify: 'esbuild',

    // Disable compressed size reporting
    reportCompressedSize: false,

    // Disable CSS code splitting
    cssCodeSplit: false,

    // Output directory cleaning
    emptyOutDir: true,

    // Rollup options
    rollupOptions: {
      output: {
        // Simple chunking strategy
        manualChunks: {
          'vendor': [/node_modules/]
        }
      },
      // Reduce memory usage during build
      cache: false
    }
  },

  plugins: [
    react()
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  }
});
