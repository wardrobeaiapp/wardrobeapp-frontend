import { supabase } from '../services/supabase';
import { User } from '../types';

/**
 * Migration script to move user preferences from JSON in user_profiles to the new user_preferences table
 */
async function migrateUserPreferences() {
  console.log('Starting user preferences migration...');
  
  try {
    // 1. Fetch all users with their preferences
    const { data: users, error: fetchError } = await supabase
      .from('user_profiles')
      .select('user_uuid, preferences')
      .not('preferences', 'is', null);
    
    if (fetchError) {
      throw new Error(`Error fetching users: ${fetchError.message}`);
    }
    
    console.log(`Found ${users?.length || 0} users with preferences to migrate`);
    
    // 2. Migrate each user's preferences
    for (const user of users || []) {
      const userId = user.user_uuid;
      // Use a more flexible type assertion to handle properties that might not be in the User interface
      const preferences = user.preferences as any;
      
      if (!preferences) {
        console.log(`User ${userId} has no preferences, skipping`);
        continue;
      }
      
      console.log(`Migrating preferences for user ${userId}`);
      
      // Transform the preferences from JSON structure to the new table structure
      const transformedPreferences = {
        user_id: userId,
        
        // Daily activities
        daily_activities: preferences.dailyActivities || [],
        office_dress_code: preferences.officeDressCode,
        remote_work_priority: preferences.remoteWorkPriority,
        creative_mobility: preferences.creativeMobility,
        
        // Style preferences
        preferred_styles: preferences.preferredStyles || [],
        comfort_vs_style: preferences.stylePreferences?.comfort_vs_style || 50,
        classic_vs_trendy: preferences.stylePreferences?.classic_vs_trendy || 50,
        basics_vs_statements: preferences.stylePreferences?.basics_vs_statements || 50,
        style_additional_notes: preferences.stylePreferences?.additional_notes,
        
        // Climate and location
        local_climate: preferences.localClimate,
        
        // Activities
        leisure_activities: preferences.leisureActivities || [],
        // Handle frequency fields that may not exist in the User interface
        outdoor_frequency_type: preferences.outdoor_frequency?.type,
        outdoor_frequency_value: preferences.outdoor_frequency?.value,
        social_frequency_type: preferences.social_frequency?.type,
        social_frequency_value: preferences.social_frequency?.value,
        formal_events_frequency_type: preferences.formal_events_frequency?.type,
        formal_events_frequency_value: preferences.formal_events_frequency?.value,
        travel_frequency: preferences.travel_frequency,
        
        // Wardrobe goals
        wardrobe_goals: preferences.wardrobeGoals || [],
        other_wardrobe_goal: preferences.other_wardrobe_goal, // This field may not exist in the User interface
        
        // Budget and shopping
        shopping_frequency: preferences.shoppingLimit?.frequency,
        shopping_amount: preferences.shoppingLimit?.amount,
        clothing_budget_amount: preferences.clothingBudget?.amount,
        clothing_budget_currency: preferences.clothingBudget?.currency,
        clothing_budget_frequency: preferences.clothingBudget?.frequency,
        
        // Seasonal preferences
        seasonal_preferences: JSON.stringify(preferences.seasonal_preferences || {}),
      };
      
      // 3. Insert into the new table
      const { error: insertError } = await supabase
        .from('user_preferences')
        .upsert(transformedPreferences);
      
      if (insertError) {
        console.error(`Error migrating preferences for user ${userId}: ${insertError.message}`);
      } else {
        console.log(`Successfully migrated preferences for user ${userId}`);
      }
    }
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Run the migration
migrateUserPreferences().catch(console.error);
