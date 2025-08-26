import { supabase } from './supabase';


/**
 * Impulse Buy Tracker Data Interface
 */
export interface ImpulseBuyTrackerData {
  isSet: boolean;
  startDate?: string;
}

/**
 * Get impulse buy tracker data for a user
 */
export async function getImpulseBuyTrackerData(userId: string): Promise<ImpulseBuyTrackerData> {
  console.log('🔍 Fetching impulse buy tracker data for user:', userId);
  
  try {
    const { data, error } = await supabase
      .from('user_progress')
      .select('impulse_buy_tracker_set, impulse_buy_tracker_start_date')
      .eq('user_id', userId)
      .order('id', { ascending: false })
      .limit(1);

    if (error) {
      console.error('❌ Error fetching impulse buy tracker data:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.log('📝 No impulse buy tracker data found, returning defaults');
      return {
        isSet: false,
        startDate: undefined
      };
    }

    const trackerData = data[0];
    const result: ImpulseBuyTrackerData = {
      isSet: !!trackerData.impulse_buy_tracker_set,
      startDate: typeof trackerData.impulse_buy_tracker_start_date === 'string' ? trackerData.impulse_buy_tracker_start_date : undefined
    };

    console.log('✅ Successfully fetched impulse buy tracker data:', result);
    return result;

  } catch (error) {
    console.error('❌ Error in getImpulseBuyTrackerData:', error);
    throw error;
  }
}

/**
 * Set impulse buy tracker as active with current timestamp
 */
export async function activateImpulseBuyTracker(userId: string): Promise<void> {
  console.log('🎯 Activating impulse buy tracker for user:', userId);
  
  try {
    const currentTimestamp = new Date().toISOString();
    
    // Check if record exists
    const { data: existingData } = await supabase
      .from('user_progress')
      .select('id')
      .eq('user_id', userId)
      .order('id', { ascending: false })
      .limit(1);

    if (existingData && existingData.length > 0) {
      // Update existing record
      const { error } = await supabase
        .from('user_progress')
        .update({
          impulse_buy_tracker_set: true,
          impulse_buy_tracker_start_date: currentTimestamp
        })
        .eq('id', existingData[0].id as number);

      if (error) {
        console.error('❌ Error updating impulse buy tracker:', error);
        throw error;
      }
    } else {
      // Insert new record
      const { error } = await supabase
        .from('user_progress')
        .insert({
          user_id: userId,
          impulse_buy_tracker_set: true,
          impulse_buy_tracker_start_date: currentTimestamp,
          // Set default values for other required fields
          shopping_limit_used: 0,
          clothing_current_spent: 0,
          ai_checks_used: 0
        });

      if (error) {
        console.error('❌ Error inserting impulse buy tracker:', error);
        throw error;
      }
    }

    console.log('✅ Successfully activated impulse buy tracker at:', currentTimestamp);
  } catch (error) {
    console.error('❌ Error in activateImpulseBuyTracker:', error);
    throw error;
  }
}

/**
 * Calculate days since tracker was activated
 */
export function calculateDaysSinceStart(startDate?: string): number {
  if (!startDate) return 0;
  
  const start = new Date(startDate);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}
