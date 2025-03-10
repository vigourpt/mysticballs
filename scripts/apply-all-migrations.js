#!/usr/bin/env node
const { execSync } = require('child_process');
const path = require('path');
require('dotenv').config();

// Path to the Supabase directory
const supabasePath = path.join(__dirname, '..', 'supabase');

// Function to execute a command and log the output
function runCommand(command) {
  console.log(`Executing: ${command}`);
  try {
    const output = execSync(command, { cwd: supabasePath, stdio: 'inherit' });
    return output;
  } catch (error) {
    console.error(`Command failed: ${error.message}`);
    process.exit(1);
  }
}

// Main function to apply all migrations
async function applyAllMigrations() {
  try {
    console.log('Starting migration process...');
    
    // Step 1: List current migrations to see the status
    console.log('\n--- Current Migration Status ---');
    runCommand('supabase migration list');
    
    // Step 2: Repair the migration history for the problematic migration
    console.log('\n--- Repairing Migration History ---');
    runCommand('supabase migration repair --status reverted 20240218000000');
    
    // Step 3: Push all pending migrations to the remote database
    console.log('\n--- Pushing Migrations to Remote Database ---');
    runCommand('supabase db push');
    
    // Step 4: Verify the migrations were applied
    console.log('\n--- Verifying Migration Status ---');
    runCommand('supabase migration list');
    
    console.log('\nAll migrations have been successfully applied!');
    
  } catch (error) {
    console.error('Error applying migrations:', error);
    process.exit(1);
  }
}

// Run the migration process
applyAllMigrations();
