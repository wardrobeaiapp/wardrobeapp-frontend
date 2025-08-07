import { createClient } from '@supabase/supabase-js';
import { Scenario } from '../types';

// Create Supabase client with service role key to bypass RLS
// IMPORTANT: This should only be used for admin scripts, never in client code
const supabaseUrl = 'https://gujpqecwdftbwkcnwiup.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

// Create admin client that bypasses RLS
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false
  }
});

// Define database table types
type UserProfile = {
  id: string;
  user_id: string;
  preferences: UserPreferences | string;
};

// Define the shape of the preferences object
interface UserPreferences {
  scenarios?: any[];
  [key: string]: any;
}

/**
 * Migrates scenarios from user_profiles.preferences to the dedicated scenarios table
 * This is a one-time migration script that uses a service role key to bypass RLS
 * 
 * IMPORTANT: This script should only be run by administrators with appropriate permissions
 * The service role key should be set as an environment variable SUPABASE_SERVICE_ROLE_KEY
 */
const migrateScenarios = async () => {
  console.log('Starting scenarios migration...');
  
  // Fetch all user profiles with scenarios
  const { data: profiles, error } = await supabase
    .from('user_profiles')
    .select('id, user_id, preferences')
    .not('preferences', 'is', null);
    
  if (error) {
    console.error('Error fetching profiles:', error);
    return;
  }
  
  console.log(`Found ${profiles.length} profiles to migrate`);
  
  // Process each profile
  for (const profile of profiles) {
    const { id, user_id, preferences } = profile;
    
    // Handle preferences as object or string
    let preferencesObj: UserPreferences = preferences as UserPreferences;
    if (typeof preferences === 'string') {
      try {
        preferencesObj = JSON.parse(preferences) as UserPreferences;
      } catch (e) {
        console.error(`Error parsing preferences for user ${id}:`, e);
        continue;
      }
    }
    
    // Skip if no scenarios in preferences
    if (!preferencesObj.scenarios || !Array.isArray(preferencesObj.scenarios)) {
      console.log(`No scenarios found for user ${id}`);
      continue;
    }
    
    const scenarios = preferencesObj.scenarios;
    console.log(`Migrating ${scenarios.length} scenarios for user ${id}`);
    
    // Insert each scenario into the new table
    for (const scenario of scenarios) {
      // Ensure we have the required fields
      if (!scenario.name) {
        console.warn(`Skipping scenario without name for user ${id}`);
        continue;
      }
      
      const { error: insertError } = await supabase
        .from('scenarios')
        .insert({
          user_id: user_id, // Use user_id from profile
          name: scenario.name,
          type: scenario.type || 'unknown',
          description: scenario.description || '',
          frequency: scenario.frequency || ''
        });
        
      if (insertError) {
        console.error(`Error inserting scenario for user ${id}:`, insertError);
      } else {
        console.log(`Migrated scenario "${scenario.name}" for user ${id}`);
      }
    }
    
    // Remove scenarios from preferences
    const updatedPreferences: UserPreferences = { ...preferencesObj };
    delete updatedPreferences.scenarios;
    
    // Convert to string if the original was a string, otherwise keep as object
    const preferencesToSave: UserPreferences | string = typeof preferences === 'string' 
      ? JSON.stringify(updatedPreferences)
      : updatedPreferences;
    
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ preferences: preferencesToSave })
      .eq('id', id as string);
      
    if (updateError) {
      console.error(`Error updating preferences for user ${id}:`, updateError);
    } else {
      console.log(`Updated preferences for user ${id} to remove scenarios`);
    }
  }
  
  console.log('Migration completed');
};

// Check if service role key is set
if (process.env.SUPABASE_SERVICE_ROLE_KEY === undefined && serviceRoleKey === 'your-service-role-key') {
  console.error('ERROR: SUPABASE_SERVICE_ROLE_KEY environment variable is not set.');
  console.error('Please set this variable to your service role key before running this script.');
  console.error('Example: SUPABASE_SERVICE_ROLE_KEY=your-key ts-node migrateScenarios.ts');
  process.exit(1);
}

// Execute the migration
migrateScenarios().catch(error => {
  console.error('Migration failed:', error);
});

export default migrateScenarios;
