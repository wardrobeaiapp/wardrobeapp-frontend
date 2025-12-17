import { supabase } from '../core';

// Demo user IDs that have public read access (same as demoWardrobeService)
const DEMO_USER_IDS = [
  'bdc94953-9f24-477d-9fea-30a8f7192f53', // Emma - Marketing Manager
  '4d3ab63a-ae73-4dcd-8309-231bdd734272', // Max - Freelance Graphic Designer  
  '9206c9a8-920a-4304-a99a-1129e308609e', // Lisa - Stay-At-Home Mom
  'fba15166-e5e0-48ab-98f6-fee5a08e7945', // Zoe - College Student
  '7a92c24d-d2f8-4784-85eb-2de2476ba605', // Sofia - Hair Stylist
  '12e2994d-e0da-4211-b8f6-2f9046e6067a'  // Nina - Nurse
];

/**
 * Check if a user ID is a demo account with public access
 */
export const isDemoUser = (userId: string): boolean => {
  return DEMO_USER_IDS.includes(userId);
};

/**
 * Fetch scenarios for a demo user (public access, no authentication required)
 * Uses the same pattern as getDemoWardrobeItems
 */
export const getDemoScenarios = async (userId: string): Promise<Array<{ id: string; name: string }>> => {
  try {
    // Verify this is a demo user
    if (!isDemoUser(userId)) {
      console.warn(`⚠️ User ${userId} is not a demo account with public access`);
      return [];
    }

    console.log(`🎭 Demo: Fetching scenarios for demo user ${userId}`);

    // Fetch scenarios - RLS policy allows public read for demo users
    const { data, error } = await supabase
      .from('scenarios')
      .select('id, name')
      .eq('user_id', userId)
      .order('name', { ascending: true });

    if (error) {
      console.error('❌ Error fetching demo scenarios:', error);
      console.error('❌ Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return [];
    }

    console.log(`✅ Demo: Loaded ${data?.length || 0} scenarios for demo user ${userId}`);
    return (data || []) as Array<{ id: string; name: string }>;

  } catch (error) {
    console.error('❌ Error in getDemoScenarios:', error);
    return [];
  }
};

/**
 * Get all demo user IDs (for admin/testing purposes)
 */
export const getAllDemoUserIds = (): string[] => {
  return [...DEMO_USER_IDS];
};
