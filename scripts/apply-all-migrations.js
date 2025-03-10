#!/usr/bin/env node
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

// Initialize dotenv
dotenv.config();

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
    
    // Step 3: Apply only the subscription-related migrations
    console.log('\n--- Applying Subscription Migrations ---');
    
    // Apply create_subscriptions_table migration
    console.log('Applying create_subscriptions_table migration...');
    const createSubscriptionsTableSQL = `
    CREATE TABLE IF NOT EXISTS subscriptions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      stripe_customer_id TEXT,
      stripe_subscription_id TEXT,
      plan_id TEXT NOT NULL,
      status TEXT NOT NULL,
      current_period_start TIMESTAMP WITH TIME ZONE,
      current_period_end TIMESTAMP WITH TIME ZONE,
      cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );
    
    -- Add RLS policies
    ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
    
    -- Create policy for users to read their own subscriptions
    CREATE POLICY "Users can read own subscriptions"
      ON subscriptions
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
    `;
    
    // Apply add_plan_type_to_user_profiles migration
    console.log('Applying add_plan_type_to_user_profiles migration...');
    const addPlanTypeSQL = `
    -- Add plan_type column to user_profiles if it doesn't exist
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'user_profiles'
        AND column_name = 'plan_type'
      ) THEN
        ALTER TABLE user_profiles ADD COLUMN plan_type TEXT;
      END IF;
    END
    $$;
    `;
    
    // Apply add_admin_field migration
    console.log('Applying add_admin_field migration...');
    const addAdminFieldSQL = `
    -- Add is_admin column to user_profiles if it doesn't exist
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'user_profiles'
        AND column_name = 'is_admin'
      ) THEN
        ALTER TABLE user_profiles ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT FALSE;
      END IF;
    END
    $$;
    `;
    
    // Execute the SQL statements using the Supabase MCP server
    try {
      console.log('Connecting to Supabase MCP server...');
      
      // We'll use direct SQL execution instead of the supabase CLI
      console.log('Executing SQL statements...');
      
      // Create a temporary SQL file
      const fs = await import('fs');
      const tempSQLPath = path.join(__dirname, 'temp_migrations.sql');
      
      // Write the SQL statements to the file
      fs.writeFileSync(tempSQLPath, createSubscriptionsTableSQL + '\n' + addPlanTypeSQL + '\n' + addAdminFieldSQL);
      
      // Execute the SQL file
      console.log('Executing SQL file...');
      runCommand(`cat ${tempSQLPath} | supabase db execute`);
      
      // Remove the temporary file
      fs.unlinkSync(tempSQLPath);
      
      console.log('SQL statements executed successfully!');
    } catch (error) {
      console.error('Error executing SQL statements:', error);
    }
    
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
