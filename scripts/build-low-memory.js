#!/usr/bin/env node

/**
 * Low-memory build script
 *
 * This script builds the application with optimizations for low-memory environments.
 * It uses a simplified build process to reduce memory usage.
 */

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');

// Load environment variables
dotenv.config({ path: resolve(rootDir, '.env') });
dotenv.config({ path: resolve(rootDir, '.env.local') });

// Create a minimal vite config for low-memory build
function createLowMemoryConfig() {
  console.log('📝 Creating minimal build configuration...');

  const lowMemConfigPath = resolve(rootDir, 'vite.config.low-mem.ts');

  // Create a minimal config with reduced memory usage
  const minimalConfig = `
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
`;

  // Write the minimal config
  fs.writeFileSync(lowMemConfigPath, minimalConfig);

  return lowMemConfigPath;
}

// Clean up temporary files
function cleanup(configPath) {
  console.log('🧹 Cleaning up temporary files...');
  if (fs.existsSync(configPath)) {
    fs.unlinkSync(configPath);
  }
}

// Main function
async function buildLowMemory() {
  try {
    console.log('🚀 Starting low-memory build process...');

    // Run TypeScript compiler
    console.log('\n📋 Running TypeScript compiler...');
    execSync('tsc --noEmit', { stdio: 'inherit' });

    // Create minimal config
    const lowMemConfigPath = createLowMemoryConfig();

    // Build the application with increased memory limit but simplified build
    console.log('\n📦 Building the application (low-memory mode)...');
    execSync(`node --max-old-space-size=4096 ./node_modules/vite/bin/vite.js build --config ${lowMemConfigPath}`, {
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_OPTIONS: '--max-old-space-size=4096'
      }
    });

    console.log('✅ Build completed successfully!');

    // Clean up
    cleanup(lowMemConfigPath);

  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

// Run the build
buildLowMemory();
