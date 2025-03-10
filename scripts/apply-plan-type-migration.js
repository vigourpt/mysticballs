// Script to apply the plan_type migration to the Supabase database
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

// Initialize Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Path to the migration SQL file
const migrationFilePath = path.join(__dirname, '..', 'supabase', 'migrations', '20250310214700_add_plan_type_to_user_profiles.sql');

// Function to apply the migration
async function applyMigration() {
  try {
    console.log('Reading migration file...');
    const migrationSQL = fs.readFileSync(migrationFilePath, 'utf8');
    
    console.log('Applying migration...');
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      console.error('Error applying migration:', error);
      process.exit(1);
    }
    
    console.log('Migration applied successfully!');
    
    // Verify the migration by checking if the plan_type column exists
    console.log('Verifying migration...');
    const { data, error: verifyError } = await supabase
      .from('user_profiles')
      .select('plan_type')
      .limit(1);
      
    if (verifyError) {
      console.error('Error verifying migration:', verifyError);
      process.exit(1);
    }
    
    console.log('Migration verified successfully!');
    console.log('Sample data:', data);
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run the migration
applyMigration();
