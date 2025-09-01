import { supabase } from '../core';


/**
 * AI Usage Data Interface
 */
export interface AIUsageData {
  aiChecksUsed: number;
  periodStartDate?: string;
  periodEndDate?: string;
}

/**
 * Get AI checks usage data for a specific user
 * Fetches from user_progress table
 */
export const getAIUsageData = async (userId: string): Promise<AIUsageData> => {
  console.log('🤖 AIUsageService - Fetching AI usage data for user:', userId);
  
  try {
    // Query ai_checks_used column - get most recent record if multiple exist
    const { data, error } = await supabase
      .from('user_progress')
      .select('ai_checks_used, id')
      .eq('user_id', userId)
      .order('id', { ascending: false })
      .limit(1);

    if (error) {
      console.error('🤖 AIUsageService - Supabase error fetching AI usage data:', error);
      
      if (error.code === 'PGRST116') {
        // No rows found - new user, return default values
        console.log('🤖 AIUsageService - No AI usage record found for user, returning defaults');
        return {
          aiChecksUsed: 0
        };
      }
      
      throw error;
    }

    const record = data?.[0];
    console.log('🤖 AIUsageService - Raw AI usage record:', record);

    // Map database record to AIUsageData interface
    const mappedData: AIUsageData = {
      aiChecksUsed: (record && typeof record.ai_checks_used === 'number') ? record.ai_checks_used : 0
    };

    console.log('🤖 AIUsageService - Mapped AI usage data:', mappedData);
    return mappedData;

  } catch (error) {
    console.error('🤖 AIUsageService - Error fetching AI usage data:', error);
    
    // Return default values in case of error
    return {
      aiChecksUsed: 0
    };
  }
};

/**
 * Save/Update AI checks usage data for a specific user
 * Uses update-or-insert pattern to maintain consistency
 */
export const saveAIUsageData = async (userId: string, aiUsageData: AIUsageData): Promise<void> => {
  console.log('🤖 AIUsageService - Saving AI usage data for user:', userId, aiUsageData);
  
  try {
    // First, fetch existing record (same pattern as other budget services)
    const { data: existingRecords, error: fetchError } = await supabase
      .from('user_progress')
      .select('id, ai_checks_used')
      .eq('user_id', userId)
      .order('id', { ascending: false })
      .limit(1);

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('🤖 AIUsageService - Error fetching existing AI usage record:', fetchError);
      throw fetchError;
    }

    const existingRecord = existingRecords?.[0];

    if (existingRecord) {
      // UPDATE existing record
      console.log('🤖 AIUsageService - Updating existing AI usage record ID:', existingRecord.id);
      
      const { error: updateError } = await supabase
        .from('user_progress')
        .update({
          ai_checks_used: aiUsageData.aiChecksUsed
        })
        .eq('id', existingRecord.id as number);

      if (updateError) {
        console.error('🤖 AIUsageService - Error updating AI usage data:', updateError);
        throw updateError;
      }

      console.log('🤖 AIUsageService - Successfully updated AI usage data');
    } else {
      // INSERT new record
      console.log('🤖 AIUsageService - Creating new AI usage record for user');
      
      const { error: insertError } = await supabase
        .from('user_progress')
        .insert({
          user_id: userId,
          ai_checks_used: aiUsageData.aiChecksUsed
        });

      if (insertError) {
        console.error('🤖 AIUsageService - Error inserting AI usage data:', insertError);
        throw insertError;
      }

      console.log('🤖 AIUsageService - Successfully created AI usage data');
    }

  } catch (error) {
    console.error('🤖 AIUsageService - Error saving AI usage data:', error);
    throw error;
  }
};
