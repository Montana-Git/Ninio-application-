#!/usr/bin/env node

/**
 * Deployment script
 * 
 * This script handles deployment to different environments.
 * Usage: node deploy.js [environment]
 * Where environment is one of: staging, production
 */

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import dotenv from 'dotenv';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');

// Load environment variables
dotenv.config({ path: resolve(rootDir, '.env') });
dotenv.config({ path: resolve(rootDir, '.env.local') });

// Get the environment from command line arguments
const environment = process.argv[2] || 'staging';

// Validate environment
if (!['staging', 'production'].includes(environment)) {
  console.error(`❌ Invalid environment: ${environment}`);
  console.error('Valid environments are: staging, production');
  process.exit(1);
}

// Main function
async function deploy() {
  try {
    console.log(`🚀 Deploying to ${environment}...`);
    
    // Run tests
    console.log('\n📋 Running tests...');
    execSync('npm test', { stdio: 'inherit' });
    
    // Build the application
    console.log('\n📦 Building the application...');
    execSync(`npm run build`, { stdio: 'inherit' });
    
    // Deploy based on environment
    if (environment === 'production') {
      console.log('\n🌐 Deploying to production...');
      // Add your production deployment commands here
      // Example: execSync('aws s3 sync dist/ s3://your-production-bucket/ --delete', { stdio: 'inherit' });
      console.log('⚠️ Production deployment commands not configured. Please update the deploy.js script.');
    } else {
      console.log('\n🧪 Deploying to staging...');
      // Add your staging deployment commands here
      // Example: execSync('aws s3 sync dist/ s3://your-staging-bucket/ --delete', { stdio: 'inherit' });
      console.log('⚠️ Staging deployment commands not configured. Please update the deploy.js script.');
    }
    
    console.log(`\n✅ Deployment to ${environment} completed successfully!`);
  } catch (error) {
    console.error(`\n❌ Deployment failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the deployment
deploy();
