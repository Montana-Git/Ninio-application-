#!/usr/bin/env node

/**
 * Bundle analysis script
 * 
 * This script analyzes the bundle size and provides recommendations for optimization.
 * It should be run after building the application with the analyze flag:
 * npm run build -- --mode analyze
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');
const statsFile = path.resolve(distDir, 'stats.html');

// Size thresholds in bytes
const THRESHOLDS = {
  CRITICAL: 500 * 1024, // 500KB
  WARNING: 250 * 1024,  // 250KB
  GOOD: 100 * 1024      // 100KB
};

// Check if stats file exists
if (!fs.existsSync(statsFile)) {
  console.error('❌ Stats file not found. Please run "npm run analyze" first.');
  process.exit(1);
}

console.log('🔍 Analyzing bundle size...');

// Get all JS files in the dist directory
const jsFiles = findJsFiles(distDir);

// Analyze file sizes
const fileSizes = jsFiles.map(file => {
  const stats = fs.statSync(file);
  return {
    file: path.relative(distDir, file),
    size: stats.size,
    sizeFormatted: formatBytes(stats.size),
    status: getStatus(stats.size)
  };
});

// Sort by size (largest first)
fileSizes.sort((a, b) => b.size - a.size);

// Print results
console.log('\n📊 Bundle Size Analysis:');
console.log('======================');

fileSizes.forEach(file => {
  const statusEmoji = getStatusEmoji(file.status);
  console.log(`${statusEmoji} ${file.file}: ${file.sizeFormatted}`);
});

// Print summary
const totalSize = fileSizes.reduce((sum, file) => sum + file.size, 0);
const criticalCount = fileSizes.filter(file => file.status === 'CRITICAL').length;
const warningCount = fileSizes.filter(file => file.status === 'WARNING').length;

console.log('\n📝 Summary:');
console.log(`Total bundle size: ${formatBytes(totalSize)}`);
console.log(`Critical files: ${criticalCount}`);
console.log(`Warning files: ${warningCount}`);

// Print recommendations
if (criticalCount > 0 || warningCount > 0) {
  console.log('\n💡 Recommendations:');
  
  if (criticalCount > 0) {
    console.log('- Consider code splitting for large bundles');
    console.log('- Check for unused dependencies that can be removed');
    console.log('- Use dynamic imports for routes and large components');
  }
  
  if (warningCount > 0) {
    console.log('- Review dependencies and consider alternatives');
    console.log('- Use tree-shaking to remove unused code');
  }
  
  console.log('- For detailed analysis, open the stats file:');
  console.log(`  ${statsFile}`);
}

// Helper functions
function findJsFiles(dir) {
  const files = [];
  
  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      files.push(...findJsFiles(filePath));
    } else if (file.endsWith('.js')) {
      files.push(filePath);
    }
  });
  
  return files;
}

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function getStatus(size) {
  if (size >= THRESHOLDS.CRITICAL) return 'CRITICAL';
  if (size >= THRESHOLDS.WARNING) return 'WARNING';
  if (size >= THRESHOLDS.GOOD) return 'GOOD';
  return 'EXCELLENT';
}

function getStatusEmoji(status) {
  switch (status) {
    case 'CRITICAL': return '🔴';
    case 'WARNING': return '🟠';
    case 'GOOD': return '🟢';
    case 'EXCELLENT': return '✅';
    default: return '❓';
  }
}

function dirname(path) {
  return path.substring(0, path.lastIndexOf('/'));
}
