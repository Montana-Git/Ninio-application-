#!/usr/bin/env node

/**
 * Simple build script
 * 
 * This script builds the application with minimal memory usage.
 */

import { execSync } from 'child_process';

// Main function
async function simpleBuild() {
  try {
    console.log('🚀 Starting simple build process...');
    
    // Run TypeScript compiler
    console.log('\n📋 Running TypeScript compiler...');
    execSync('tsc --noEmit', { stdio: 'inherit' });
    
    // Set environment variables to reduce memory usage
    const env = {
      ...process.env,
      NODE_OPTIONS: '--max-old-space-size=4096',
      VITE_DISABLE_OPTIMIZATION: 'true'
    };
    
    // Build the application with minimal settings
    console.log('\n📦 Building the application (simple mode)...');
    execSync('vite build --mode production', { 
      stdio: 'inherit',
      env
    });
    
    console.log('✅ Build completed successfully!');
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

// Run the build
simpleBuild();
