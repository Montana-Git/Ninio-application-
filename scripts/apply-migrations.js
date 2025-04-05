// This script helps apply SQL migrations to your Supabase project
// You'll need to run this script with Node.js

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Get Supabase URL and API key from environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_KEY must be set in your environment variables');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Path to migrations directory
const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');

async function applyMigration(filePath) {
  try {
    console.log(`Applying migration: ${path.basename(filePath)}`);
    
    // Read the SQL file
    const sql = fs.readFileSync(filePath, 'utf8');
    
    // Execute the SQL
    const { error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error(`Error applying migration ${path.basename(filePath)}:`, error);
      return false;
    }
    
    console.log(`Successfully applied migration: ${path.basename(filePath)}`);
    return true;
  } catch (error) {
    console.error(`Error applying migration ${path.basename(filePath)}:`, error);
    return false;
  }
}

async function applyMigrations() {
  try {
    // Get all SQL files in the migrations directory
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Sort to apply in order
    
    console.log(`Found ${files.length} migration files`);
    
    // Apply each migration
    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const success = await applyMigration(filePath);
      
      if (!success) {
        console.error(`Failed to apply migration: ${file}`);
        process.exit(1);
      }
    }
    
    console.log('All migrations applied successfully');
  } catch (error) {
    console.error('Error applying migrations:', error);
    process.exit(1);
  }
}

// Apply the latest migration only
async function applyLatestMigration() {
  try {
    // Get all SQL files in the migrations directory
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Sort to apply in order
    
    if (files.length === 0) {
      console.log('No migration files found');
      return;
    }
    
    // Get the latest migration file
    const latestFile = files[files.length - 1];
    const filePath = path.join(migrationsDir, latestFile);
    
    console.log(`Applying latest migration: ${latestFile}`);
    
    const success = await applyMigration(filePath);
    
    if (!success) {
      console.error(`Failed to apply latest migration: ${latestFile}`);
      process.exit(1);
    }
    
    console.log('Latest migration applied successfully');
  } catch (error) {
    console.error('Error applying latest migration:', error);
    process.exit(1);
  }
}

// Check command line arguments
const args = process.argv.slice(2);
if (args.includes('--latest')) {
  applyLatestMigration();
} else {
  applyMigrations();
}
