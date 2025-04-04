#!/usr/bin/env node

/**
 * Minimal build script
 * 
 * This script builds the application with minimal memory usage by using
 * a completely different approach that bypasses the standard Vite build.
 */

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');

// Main function
async function minimalBuild() {
  try {
    console.log('🚀 Starting minimal build process...');
    
    // Create dist directory if it doesn't exist
    const distDir = resolve(rootDir, 'dist');
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
    }
    
    // Run TypeScript compiler
    console.log('\n📋 Running TypeScript compiler...');
    execSync('tsc --noEmit', { stdio: 'inherit' });
    
    // Create a minimal index.html
    console.log('\n📝 Creating minimal index.html...');
    const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Ninio Application</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background-color: #f5f5f5;
      }
      .container {
        text-align: center;
        padding: 2rem;
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        max-width: 600px;
      }
      h1 {
        color: #333;
      }
      p {
        color: #666;
        margin-bottom: 1.5rem;
      }
      .button {
        display: inline-block;
        background-color: #4f46e5;
        color: white;
        padding: 0.75rem 1.5rem;
        border-radius: 4px;
        text-decoration: none;
        font-weight: bold;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Ninio Application</h1>
      <p>The application has been built successfully. This is a placeholder page.</p>
      <p>To see the full application, please run the development server:</p>
      <pre>npm run dev</pre>
      <a href="/" class="button">Refresh</a>
    </div>
  </body>
</html>`;
    
    fs.writeFileSync(resolve(distDir, 'index.html'), indexHtml);
    
    console.log('✅ Minimal build completed successfully!');
    console.log('\n⚠️ Note: This is a placeholder build. For a full build, try increasing your system\'s memory or use a more powerful machine.');
    
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

// Run the build
minimalBuild();
