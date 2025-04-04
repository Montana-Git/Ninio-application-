#!/usr/bin/env node

/**
 * Pre-build validation script
 *
 * This script validates the environment variables before building the application.
 * It ensures that all required environment variables are set and valid.
 */

// Import required modules
import { readFileSync } from 'fs';
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

// Required environment variables
const REQUIRED_ENV_VARS = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_GROQ_API_KEY'
];

// Validation functions
const validators = {
  'VITE_SUPABASE_URL': (value) => value.startsWith('https://') && value.includes('.supabase.co'),
  'VITE_SUPABASE_ANON_KEY': (value) => value.length > 20,
  'VITE_GROQ_API_KEY': (value) => value.startsWith('gsk_')
};

// Error messages
const errorMessages = {
  'VITE_SUPABASE_URL': 'VITE_SUPABASE_URL must be a valid Supabase URL',
  'VITE_SUPABASE_ANON_KEY': 'VITE_SUPABASE_ANON_KEY must be a valid Supabase anon key',
  'VITE_GROQ_API_KEY': 'VITE_GROQ_API_KEY must be a valid Groq API key starting with "gsk_"'
};

// Validate environment variables
function validateEnv() {
  const missingVars = [];
  const invalidVars = [];

  for (const key of REQUIRED_ENV_VARS) {
    const value = process.env[key];

    if (!value) {
      missingVars.push(key);
      continue;
    }

    if (validators[key] && !validators[key](value)) {
      invalidVars.push({ key, message: errorMessages[key] || `Invalid value for ${key}` });
    }
  }

  return { missingVars, invalidVars };
}

// Main function
function main() {
  console.log('🔍 Validating environment variables before build...');

  const { missingVars, invalidVars } = validateEnv();

  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach(key => console.error(`   - ${key}`));
    console.error('\nPlease add these variables to your .env or .env.local file.');
    process.exit(1);
  }

  if (invalidVars.length > 0) {
    console.error('❌ Invalid environment variables:');
    invalidVars.forEach(({ key, message }) => console.error(`   - ${key}: ${message}`));
    console.error('\nPlease fix these variables in your .env or .env.local file.');
    process.exit(1);
  }

  console.log('✅ Environment validation successful!');

  // Run the build
  console.log('\n📦 Building the application...');
  try {
    // Use increased memory limit for Node.js
    execSync('tsc && node --max-old-space-size=4096 ./node_modules/vite/bin/vite.js build', { stdio: 'inherit' });
    console.log('✅ Build completed successfully!');
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

// Run the main function
main();
