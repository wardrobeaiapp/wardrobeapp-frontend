import { supabase } from './supabase';
import { UserPreferences } from '../types/userPreferences';

/**
 * Service for handling user preferences in the new user_preferences table
 */
export const supabasePreferencesService = {
  /**
   * Get user preferences from the user_preferences table
   * @param userId The user ID
   * @returns The user preferences
   */
  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching user preferences:', error);
        return null;
      }
      
      if (!data) {
        return null;
      }
      
      // Transform from snake_case to camelCase for frontend use
      return {
        id: data.id as string,
        userId: data.user_id as string,
        
        // Daily activities
        dailyActivities: (data.daily_activities as string[]) || [],
        homeActivities: (data.home_activities as string[]) || [],
        officeDressCode: data.office_dress_code as string | undefined,
        remoteWorkPriority: data.remote_work_priority as string | undefined,
        creativeMobility: data.creative_mobility as string | undefined,
        
        // Style preferences
        preferredStyles: (data.preferred_styles as string[]) || [],
        stylePreferences: {
          comfortVsStyle: (data.comfort_vs_style as number) || 50,
          classicVsTrendy: (data.classic_vs_trendy as number) || 50,
          basicsVsStatements: (data.basics_vs_statements as number) || 50,
          additionalNotes: (data.style_additional_notes as string) || ''
        },
        
        // Climate preference
        localClimate: data.local_climate as string,
        
        // Leisure activities
        leisureActivities: (data.leisure_activities as string[]) || [],
        outdoorFrequencyValue: data.outdoor_frequency_value as number | undefined,
        outdoorFrequencyPeriod: data.outdoor_frequency_period as string | undefined,
        socialFrequencyValue: data.social_frequency_value as number | undefined,
        socialFrequencyPeriod: data.social_frequency_period as string | undefined,
        formalEventsFrequencyValue: data.formal_events_frequency_value as number | undefined,
        formalEventsFrequencyPeriod: data.formal_events_frequency_period as string | undefined,
        travelFrequency: data.travel_frequency as string | undefined,
        
        // Wardrobe goals
        wardrobeGoals: (data.wardrobe_goals as string[]) || [],
        otherWardrobeGoal: data.other_wardrobe_goal as string | undefined,
        
        // 🎯 BUDGET DATA REMOVED - now handled by unified budget service (user_progress table)
        // Budget fields (shopping limits and clothing budget) are no longer stored in user_preferences
        // They are managed exclusively through userBudgetsService.ts and user_progress table
        
        // Subscription information
        subscriptionPlan: data.subscription_plan as string | undefined,
        subscriptionRenewalDate: data.subscription_renewal_date as string | undefined,
        
        
        // Metadata
        createdAt: data.created_at ? new Date(data.created_at as string) : undefined,
        updatedAt: data.updated_at ? new Date(data.updated_at as string) : undefined,
      };
    } catch (error) {
      console.error('Error in getUserPreferences:', error);
      return null;
    }
  },
  
  /**
   * Update user preferences in the user_preferences table
   * @param userId The user ID
   * @param preferences The user preferences to update
   * @returns The updated user preferences
   */
  async updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<UserPreferences | null> {
    try {
      // Removed excessive logging for performance
      
      // Transform from camelCase to snake_case for database storage
      const dbPreferences = {
        user_id: userId,
        
        // Daily activities
        daily_activities: preferences.dailyActivities,
        home_activities: preferences.homeActivities,
        office_dress_code: preferences.officeDressCode,
        remote_work_priority: preferences.remoteWorkPriority,
        creative_mobility: preferences.creativeMobility,
        
        // Style preferences
        preferred_styles: preferences.preferredStyles,
        comfort_vs_style: preferences.stylePreferences?.comfortVsStyle,
        classic_vs_trendy: preferences.stylePreferences?.classicVsTrendy,
        basics_vs_statements: preferences.stylePreferences?.basicsVsStatements,
        style_additional_notes: preferences.stylePreferences?.additionalNotes,
        
        // Climate preference
        local_climate: preferences.localClimate,
        
        // Leisure activities
        leisure_activities: preferences.leisureActivities,
        outdoor_frequency_value: preferences.outdoorFrequencyValue,
        outdoor_frequency_period: preferences.outdoorFrequencyPeriod,
        social_frequency_value: preferences.socialFrequencyValue,
        social_frequency_period: preferences.socialFrequencyPeriod,
        formal_events_frequency_value: preferences.formalEventsFrequencyValue,
        formal_events_frequency_period: preferences.formalEventsFrequencyPeriod,
        travel_frequency: preferences.travelFrequency,
        
        // Wardrobe goals
        wardrobe_goals: preferences.wardrobeGoals,
        other_wardrobe_goal: preferences.otherWardrobeGoal,
        
        // 🎯 BUDGET DATA REMOVED - now handled by unified budget service (user_progress table)
        // Budget fields are no longer saved to user_preferences - they go to user_progress via userBudgetsService.ts
        
        // Subscription information
        subscription_plan: preferences.subscriptionPlan,
        subscription_renewal_date: preferences.subscriptionRenewalDate,
        
        // Debug logging removed for performance
        ...(function() {
          // Just return an empty object instead of logging
          return {};
        })(),
        
        // No legacy fields
      };
      
      // Remove undefined values
      Object.keys(dbPreferences).forEach(key => {
        if (dbPreferences[key as keyof typeof dbPreferences] === undefined) {
          delete dbPreferences[key as keyof typeof dbPreferences];
        }
      });
      
      // Check if the user already has preferences
      const { data: existingData } = await supabase
        .from('user_preferences')
        .select('id')
        .eq('user_id', userId)
        .single();
      
      if (existingData) {
        // Update existing preferences
        const { error } = await supabase
          .from('user_preferences')
          .update(dbPreferences)
          .eq('user_id', userId);
        
        if (error) {
          console.error('Error updating user preferences:', error);
          return null;
        }
      } else {
        // Insert new preferences
        const { error } = await supabase
          .from('user_preferences')
          .insert(dbPreferences);
        
        if (error) {
          console.error('Error inserting user preferences:', error);
          return null;
        }
      }
      
      // Return the updated preferences
      return this.getUserPreferences(userId);
    } catch (error) {
      console.error('Error in updateUserPreferences:', error);
      return null;
    }
  },
  
  /**
   * Delete user preferences from the user_preferences table
   * @param userId The user ID
   * @returns True if successful, false otherwise
   */
  async deleteUserPreferences(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_preferences')
        .delete()
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error deleting user preferences:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in deleteUserPreferences:', error);
      return false;
    }
  }
};
