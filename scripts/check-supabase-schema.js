#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Initialize dotenv
dotenv.config();

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

// Initialize Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSchema() {
  try {
    console.log('Checking Supabase schema...');
    
    // Check if user_profiles table exists
    console.log('\nChecking user_profiles table...');
    const { data: userProfilesData, error: userProfilesError } = await supabase
      .from('user_profiles')
      .select('id')
      .limit(1);
      
    if (userProfilesError) {
      console.error('Error checking user_profiles table:', userProfilesError);
      console.log('user_profiles table does not exist or is not accessible.');
    } else {
      console.log('user_profiles table exists.');
      
      // Check if plan_type column exists in user_profiles
      const { data: planTypeData, error: planTypeError } = await supabase
        .rpc('check_column_exists', { 
          p_table: 'user_profiles', 
          p_column: 'plan_type' 
        });
        
      if (planTypeError) {
        console.error('Error checking plan_type column:', planTypeError);
        console.log('Could not check if plan_type column exists.');
      } else {
        console.log(`plan_type column ${planTypeData ? 'exists' : 'does not exist'} in user_profiles table.`);
      }
      
      // Check if is_admin column exists in user_profiles
      const { data: isAdminData, error: isAdminError } = await supabase
        .rpc('check_column_exists', { 
          p_table: 'user_profiles', 
          p_column: 'is_admin' 
        });
        
      if (isAdminError) {
        console.error('Error checking is_admin column:', isAdminError);
        console.log('Could not check if is_admin column exists.');
      } else {
        console.log(`is_admin column ${isAdminData ? 'exists' : 'does not exist'} in user_profiles table.`);
      }
    }
    
    // Check if subscriptions table exists
    console.log('\nChecking subscriptions table...');
    const { data: subscriptionsData, error: subscriptionsError } = await supabase
      .from('subscriptions')
      .select('id')
      .limit(1);
      
    if (subscriptionsError) {
      console.error('Error checking subscriptions table:', subscriptionsError);
      console.log('subscriptions table does not exist or is not accessible.');
    } else {
      console.log('subscriptions table exists.');
    }
    
    // Check if auth_code_verifiers table exists
    console.log('\nChecking auth_code_verifiers table...');
    const { data: authCodeVerifiersData, error: authCodeVerifiersError } = await supabase
      .from('auth_code_verifiers')
      .select('id')
      .limit(1);
      
    if (authCodeVerifiersError) {
      console.error('Error checking auth_code_verifiers table:', authCodeVerifiersError);
      console.log('auth_code_verifiers table does not exist or is not accessible.');
    } else {
      console.log('auth_code_verifiers table exists.');
    }
    
    // Check if reading_history table exists
    console.log('\nChecking reading_history table...');
    const { data: readingHistoryData, error: readingHistoryError } = await supabase
      .from('reading_history')
      .select('id')
      .limit(1);
      
    if (readingHistoryError) {
      console.error('Error checking reading_history table:', readingHistoryError);
      console.log('reading_history table does not exist or is not accessible.');
    } else {
      console.log('reading_history table exists.');
    }
    
    console.log('\nSchema check complete.');
  } catch (error) {
    console.error('Error checking schema:', error);
  }
}

// Create the check_column_exists function if it doesn't exist
async function createHelperFunctions() {
  try {
    console.log('Creating helper functions...');
    
    const { error } = await supabase.rpc('create_check_column_exists_function');
    
    if (error) {
      // If the function already exists, this is fine
      if (error.message.includes('already exists')) {
        console.log('Helper functions already exist.');
      } else {
        console.error('Error creating helper functions:', error);
      }
    } else {
      console.log('Helper functions created successfully.');
    }
  } catch (error) {
    console.error('Error creating helper functions:', error);
  }
}

// Create the check_column_exists function
async function createCheckColumnExistsFunction() {
  try {
    console.log('Creating check_column_exists function...');
    
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION check_column_exists(p_table text, p_column text)
        RETURNS boolean
        LANGUAGE plpgsql
        AS $$
        DECLARE
          column_exists boolean;
        BEGIN
          SELECT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = p_table
            AND column_name = p_column
          ) INTO column_exists;
          
          RETURN column_exists;
        END;
        $$;
      `
    });
    
    if (error) {
      console.error('Error creating check_column_exists function:', error);
    } else {
      console.log('check_column_exists function created successfully.');
    }
  } catch (error) {
    console.error('Error creating check_column_exists function:', error);
  }
}

// Create the exec_sql function if it doesn't exist
async function createExecSqlFunction() {
  try {
    console.log('Creating exec_sql function...');
    
    // First check if the function already exists
    const { data, error } = await supabase
      .from('pg_proc')
      .select('proname')
      .eq('proname', 'exec_sql')
      .limit(1);
      
    if (error) {
      console.error('Error checking if exec_sql function exists:', error);
      
      // Try to create the function anyway
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE OR REPLACE FUNCTION exec_sql(sql text)
          RETURNS void
          LANGUAGE plpgsql
          AS $$
          BEGIN
            EXECUTE sql;
          END;
          $$;
        `
      });
      
      if (createError) {
        console.error('Error creating exec_sql function:', createError);
      } else {
        console.log('exec_sql function created successfully.');
      }
    } else if (data && data.length > 0) {
      console.log('exec_sql function already exists.');
    } else {
      // Create the function
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE OR REPLACE FUNCTION exec_sql(sql text)
          RETURNS void
          LANGUAGE plpgsql
          AS $$
          BEGIN
            EXECUTE sql;
          END;
          $$;
        `
      });
      
      if (createError) {
        console.error('Error creating exec_sql function:', createError);
      } else {
        console.log('exec_sql function created successfully.');
      }
    }
  } catch (error) {
    console.error('Error creating exec_sql function:', error);
  }
}

// Run the functions
async function main() {
  try {
    await createExecSqlFunction();
    await createCheckColumnExistsFunction();
    await checkSchema();
  } catch (error) {
    console.error('Error in main function:', error);
  }
}

main();
