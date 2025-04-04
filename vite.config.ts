import path from "path";
import { defineConfig, splitVendorChunkPlugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import { tempo } from "tempo-devtools/dist/vite";
import { visualizer } from "rollup-plugin-visualizer";

const conditionalPlugins: [string, Record<string, any>][] = [];

// @ts-ignore
if (process.env.TEMPO === "true") {
  conditionalPlugins.push(["tempo-devtools/swc", {}]);
}

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const isProduction = mode === 'production';
  const disableOptimization = process.env.VITE_DISABLE_OPTIMIZATION === 'true';

  return {
    base: process.env.NODE_ENV === "development" ? "/" : process.env.VITE_BASE_PATH || "/",

    // Optimize dependencies
    optimizeDeps: {
      entries: ["src/main.tsx", "src/tempobook/**/*"],
      // Force include problematic dependencies
      include: [
        "react",
        "react-dom",
        "react-router-dom",
        "@supabase/supabase-js",
        "groq-sdk"
      ],
      // Exclude large dependencies that don't need optimization
      exclude: ["tempo-devtools"]
    },

    // Build options
    build: {
      // Enable source maps in development, disable in production or when optimization is disabled
      sourcemap: !isProduction && !disableOptimization,

      // Minification options - use esbuild for faster builds with less memory usage
      minify: isProduction ? (disableOptimization ? 'esbuild' : 'esbuild') : false,
      esbuildOptions: {
        target: 'es2020',
        drop: isProduction ? ['console', 'debugger'] : [],
        legalComments: 'none',
        treeShaking: !disableOptimization
      },

      // Chunk size warnings at 500kb instead of default 1mb
      chunkSizeWarningLimit: 500,

      // Output directory cleaning
      emptyOutDir: true,

      // Disable compressed size reporting when optimization is disabled
      reportCompressedSize: !disableOptimization,

      // Disable CSS code splitting when optimization is disabled
      cssCodeSplit: !disableOptimization,

      // Rollup options
      rollupOptions: {
        output: {
          // Reduce memory usage during build
          experimentalMinChunkSize: disableOptimization ? 0 : 10000,

          // Improve code splitting - use a simpler strategy when optimization is disabled
          manualChunks: disableOptimization ?
            // Simple chunking for low memory builds
            {
              'vendor': [/node_modules/]
            } :
            // Detailed chunking for optimized builds
            {
              // Vendor chunks
              'react-vendor': [
                'react',
                'react-dom',
                'react-router-dom',
                'scheduler'
              ],
              'ui-vendor': [
                '@radix-ui/react-dialog',
                '@radix-ui/react-dropdown-menu',
                '@radix-ui/react-label',
                '@radix-ui/react-slot',
                '@radix-ui/react-tabs',
                'framer-motion',
                'lucide-react',
                'class-variance-authority'
              ],
              'data-vendor': [
                '@supabase/supabase-js',
                'groq-sdk'
              ],
              'three-vendor': [
                'three'
              ],
              'i18n-vendor': [
                'i18next',
                'react-i18next'
              ]
            }
        },
        // Reduce memory usage during build
        cache: false,
        treeshake: {
          moduleSideEffects: disableOptimization ? true : false,
          propertyReadSideEffects: disableOptimization ? true : false
        }
      }
    },

    plugins: [
      // React plugin is always needed
      react({
        plugins: conditionalPlugins,
      }),

      // Only include tempo in development or when not disabling optimization
      (!isProduction || !disableOptimization) && tempo(),

      // Only include splitVendorChunkPlugin when not disabling optimization
      !disableOptimization && splitVendorChunkPlugin(),

      // Add visualizer plugin in build mode when not disabling optimization
      isProduction && !disableOptimization && visualizer({
        filename: './dist/stats.html',
        open: false,
        gzipSize: true,
        brotliSize: true
      })
    ].filter(Boolean),

    resolve: {
      preserveSymlinks: true,
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },

    server: {
      // @ts-ignore
      allowedHosts: true,

      // Enable HMR
      hmr: true,

      // Configure CORS for development
      cors: true
    },

    // Preview server options (for npm run preview)
    preview: {
      port: 4173,
      strictPort: true,
    },

    // Enable esbuild transformation for all files
    esbuild: {
      jsxInject: `import React from 'react'`
    }
  };
});
