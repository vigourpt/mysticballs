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

// Function to update user profile
async function updateUserProfile(userId, data) {
  try {
    console.log(`Updating user profile for user ${userId}...`);
    
    const { data: updatedProfile, error } = await supabase
      .from('user_profiles')
      .update(data)
      .eq('id', userId)
      .select();
      
    if (error) {
      console.error('Error updating user profile:', error);
      return null;
    }
    
    console.log('User profile updated successfully:', updatedProfile);
    return updatedProfile;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return null;
  }
}

// Function to get user by email
async function getUserByEmail(email) {
  try {
    console.log(`Getting user by email ${email}...`);
    
    const { data: user, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', email)
      .single();
      
    if (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
    
    console.log('User found:', user);
    return user;
  } catch (error) {
    console.error('Error getting user by email:', error);
    return null;
  }
}

// Function to get all users
async function getAllUsers() {
  try {
    console.log('Getting all users...');
    
    const { data: users, error } = await supabase
      .from('user_profiles')
      .select('*');
      
    if (error) {
      console.error('Error getting all users:', error);
      return null;
    }
    
    console.log(`Found ${users.length} users.`);
    return users;
  } catch (error) {
    console.error('Error getting all users:', error);
    return null;
  }
}

// Function to update all users with plan_type
async function updateAllUsersWithPlanType() {
  try {
    console.log('Updating all users with plan_type...');
    
    const { data: users, error } = await supabase
      .from('user_profiles')
      .select('*');
      
    if (error) {
      console.error('Error getting all users:', error);
      return;
    }
    
    console.log(`Found ${users.length} users.`);
    
    for (const user of users) {
      if (user.is_premium && !user.plan_type) {
        console.log(`Updating user ${user.id} with plan_type 'premium'...`);
        
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({ plan_type: 'premium' })
          .eq('id', user.id);
          
        if (updateError) {
          console.error(`Error updating user ${user.id}:`, updateError);
        } else {
          console.log(`User ${user.id} updated successfully.`);
        }
      } else if (!user.is_premium && !user.plan_type) {
        console.log(`Updating user ${user.id} with plan_type 'basic'...`);
        
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({ plan_type: 'basic' })
          .eq('id', user.id);
          
        if (updateError) {
          console.error(`Error updating user ${user.id}:`, updateError);
        } else {
          console.log(`User ${user.id} updated successfully.`);
        }
      }
    }
    
    console.log('All users updated successfully.');
  } catch (error) {
    console.error('Error updating all users:', error);
  }
}

// Main function
async function main() {
  try {
    // Get the email from the command line arguments
    const email = process.argv[2];
    
    if (!email) {
      console.log('No email provided. Updating all users with plan_type...');
      await updateAllUsersWithPlanType();
      return;
    }
    
    // Get the user by email
    const user = await getUserByEmail(email);
    
    if (!user) {
      console.error(`User with email ${email} not found.`);
      return;
    }
    
    // Update the user profile
    const updatedProfile = await updateUserProfile(user.id, {
      is_premium: true,
      plan_type: 'premium'
    });
    
    if (updatedProfile) {
      console.log('User profile updated successfully.');
    } else {
      console.error('Failed to update user profile.');
    }
  } catch (error) {
    console.error('Error in main function:', error);
  }
}

// Run the main function
main();
