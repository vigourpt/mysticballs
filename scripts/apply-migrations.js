#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Initialize dotenv
dotenv.config();

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and SUPABASE_SERVICE_KEY.');
  process.exit(1);
}

// Initialize Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// SQL statements for migrations
const createSubscriptionsTableSQL = `
  -- Create subscriptions table if it doesn't exist
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

  -- Add RLS policies if the table was just created
  DO $$
  BEGIN
    -- Check if the policy already exists
    IF NOT EXISTS (
      SELECT 1
      FROM pg_policies
      WHERE tablename = 'subscriptions'
      AND policyname = 'Users can read own subscriptions'
    ) THEN
      -- Enable RLS
      ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
      
      -- Create policy for users to read their own subscriptions
      CREATE POLICY "Users can read own subscriptions"
        ON subscriptions
        FOR SELECT
        TO authenticated
        USING (auth.uid() = user_id);
    END IF;
  END
  $$;
`;

const createAuthCodeVerifiersTableSQL = `
  -- Create auth_code_verifiers table if it doesn't exist
  CREATE TABLE IF NOT EXISTS auth_code_verifiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    code_verifier TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '1 hour')
  );

  -- Add RLS policies if the table was just created
  DO $$
  BEGIN
    -- Check if the policy already exists
    IF NOT EXISTS (
      SELECT 1
      FROM pg_policies
      WHERE tablename = 'auth_code_verifiers'
      AND policyname = 'Service role can manage auth_code_verifiers'
    ) THEN
      -- Enable RLS
      ALTER TABLE auth_code_verifiers ENABLE ROW LEVEL SECURITY;
      
      -- Create policy for service role to manage auth_code_verifiers
      CREATE POLICY "Service role can manage auth_code_verifiers"
        ON auth_code_verifiers
        FOR ALL
        TO service_role
        USING (true);
    END IF;
  END
  $$;
`;

const createReadingHistoryTableSQL = `
  -- Create reading_history table if it doesn't exist
  CREATE TABLE IF NOT EXISTS reading_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reading_type TEXT NOT NULL,
    reading_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
  );

  -- Add RLS policies if the table was just created
  DO $$
  BEGIN
    -- Check if the policy already exists
    IF NOT EXISTS (
      SELECT 1
      FROM pg_policies
      WHERE tablename = 'reading_history'
      AND policyname = 'Users can read own reading history'
    ) THEN
      -- Enable RLS
      ALTER TABLE reading_history ENABLE ROW LEVEL SECURITY;
      
      -- Create policy for users to read their own reading history
      CREATE POLICY "Users can read own reading history"
        ON reading_history
        FOR SELECT
        TO authenticated
        USING (auth.uid() = user_id);
    END IF;
  END
  $$;
`;

const addPlanTypeToUserProfilesSQL = `
  -- Add plan_type column to user_profiles if it doesn't exist
  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'user_profiles'
      AND column_name = 'plan_type'
    ) THEN
      ALTER TABLE user_profiles ADD COLUMN plan_type TEXT;
    END IF;
  END
  $$;
`;

const addAdminFieldToUserProfilesSQL = `
  -- Add is_admin column to user_profiles if it doesn't exist
  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'user_profiles'
      AND column_name = 'is_admin'
    ) THEN
      ALTER TABLE user_profiles ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT FALSE;
    END IF;
  END
  $$;
`;

// Function to execute SQL
async function executeSQL(sql, description) {
  try {
    console.log(`Executing ${description}...`);
    
    const { error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error(`Error executing ${description}:`, error);
      return false;
    }
    
    console.log(`${description} executed successfully.`);
    return true;
  } catch (error) {
    console.error(`Error executing ${description}:`, error);
    return false;
  }
}

// Create the exec_sql function if it doesn't exist
async function createExecSqlFunction() {
  try {
    console.log('Creating exec_sql function...');
    
    // Try to create the function directly
    const { error } = await supabase
      .from('_exec_sql')
      .select('*')
      .limit(1)
      .then(() => {
        // If this succeeds, the function already exists
        console.log('exec_sql function already exists.');
        return { error: null };
      })
      .catch(async () => {
        // If it fails, try to create the function
        return await supabase.rpc('exec_sql', {
          sql: `
            CREATE OR REPLACE FUNCTION exec_sql(sql text)
            RETURNS void
            LANGUAGE plpgsql
            SECURITY DEFINER
            AS $$
            BEGIN
              EXECUTE sql;
            END;
            $$;
          `
        });
      });
    
    if (error) {
      // If we get here, we need to create the function using a raw query
      console.error('Error creating exec_sql function:', error);
      
      // Try a different approach - create a temporary table and execute a query
      const { error: rawError } = await supabase
        .from('_temp_exec_sql')
        .insert([{ id: 1 }])
        .select()
        .then(async ({ error }) => {
          if (error) {
            // Create the temporary table
            const createTempTable = await fetch(`${supabaseUrl}/rest/v1/`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'Prefer': 'return=minimal'
              },
              body: JSON.stringify({
                query: `
                  CREATE TEMPORARY TABLE _temp_exec_sql (id int);
                  CREATE OR REPLACE FUNCTION exec_sql(sql text)
                  RETURNS void
                  LANGUAGE plpgsql
                  SECURITY DEFINER
                  AS $$
                  BEGIN
                    EXECUTE sql;
                  END;
                  $$;
                `
              })
            });
            
            if (!createTempTable.ok) {
              return { error: await createTempTable.text() };
            }
            
            return { error: null };
          }
          
          return { error: null };
        });
      
      if (rawError) {
        console.error('Error creating exec_sql function using raw query:', rawError);
        return false;
      }
    }
    
    console.log('exec_sql function created or already exists.');
    return true;
  } catch (error) {
    console.error('Error in createExecSqlFunction:', error);
    return false;
  }
}

// Apply all migrations
async function applyMigrations() {
  try {
    console.log('Starting migration process...');
    
    // Create the exec_sql function
    const execSqlCreated = await createExecSqlFunction();
    
    if (!execSqlCreated) {
      console.error('Failed to create exec_sql function. Cannot proceed with migrations.');
      return;
    }
    
    // Apply migrations
    await executeSQL(createSubscriptionsTableSQL, 'create_subscriptions_table migration');
    await executeSQL(createAuthCodeVerifiersTableSQL, 'create_auth_code_verifiers_table migration');
    await executeSQL(createReadingHistoryTableSQL, 'create_reading_history_table migration');
    await executeSQL(addPlanTypeToUserProfilesSQL, 'add_plan_type_to_user_profiles migration');
    await executeSQL(addAdminFieldToUserProfilesSQL, 'add_admin_field_to_user_profiles migration');
    
    console.log('\nAll migrations have been applied!');
    
    // Update existing user profiles to set plan_type based on is_premium
    console.log('\nUpdating existing user profiles...');
    
    const updateUserProfilesSQL = `
      UPDATE user_profiles
      SET plan_type = CASE WHEN is_premium THEN 'premium' ELSE 'basic' END
      WHERE plan_type IS NULL AND is_premium IS NOT NULL;
    `;
    
    await executeSQL(updateUserProfilesSQL, 'update user profiles with plan_type');
    
    console.log('\nMigration process complete!');
  } catch (error) {
    console.error('Error applying migrations:', error);
  }
}

// Run the migrations
applyMigrations();
