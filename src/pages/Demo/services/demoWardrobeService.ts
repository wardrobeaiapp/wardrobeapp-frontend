import { supabase } from '../../../services/core';
import { WardrobeItem } from '../../../types';
import { convertToWardrobeItems } from '../../../services/wardrobe/items/itemBaseService';
import { getBatchItemScenarios } from '../../../services/wardrobe/items/itemRelationsService';

// Demo user IDs that have public read access (defined in RLS policies)
const DEMO_USER_IDS = [
  'bdc94953-9f24-477d-9fea-30a8f7192f53', // Emma - Marketing Manager
  '4d3ab63a-ae73-4dcd-8309-231bdd734272', // Max - Freelance Graphic Designer  
  '9206c9a8-920a-4304-a99a-1129e308609e', // Lisa - Stay-At-Home Mom
  'fba15166-e5e0-48ab-98f6-fee5a08e7945', // Zoe - College Student
  '7a92c24d-d2f8-4784-85eb-2de2476ba605', // Sofia - Hair Stylist
  '12e2994d-e0da-4211-b8f6-2f9046e6067a'  // Nina - Nurse
];

const DEMO_PERSONAS = {
  'bdc94953-9f24-477d-9fea-30a8f7192f53': {
    name: 'Emma',
    title: 'Marketing Manager',
    description: 'Business casual wardrobe for office work and client meetings'
  },
  '4d3ab63a-ae73-4dcd-8309-231bdd734272': {
    name: 'Max', 
    title: 'Freelance Graphic Designer',
    description: 'Comfortable home wear that\'s presentable for video calls'
  },
  '9206c9a8-920a-4304-a99a-1129e308609e': {
    name: 'Lisa',
    title: 'Stay-At-Home Mom', 
    description: 'Practical clothes for school runs and playground activities'
  },
  'fba15166-e5e0-48ab-98f6-fee5a08e7945': {
    name: 'Zoe',
    title: 'College Student',
    description: 'Casual looks for classes, work, and social events'
  },
  '7a92c24d-d2f8-4784-85eb-2de2476ba605': {
    name: 'Sofia',
    title: 'Hair Stylist',
    description: 'Bold creative looks for salon days, industry events, and nightlife'
  },
  '12e2994d-e0da-4211-b8f6-2f9046e6067a': {
    name: 'Nina',
    title: 'Nurse',
    description: 'Comfortable practical clothes for home recovery and outdoor weekends'
  }
};

/**
 * Check if a user ID is a demo account with public access
 */
export const isDemoUser = (userId: string): boolean => {
  return DEMO_USER_IDS.includes(userId);
};

/**
 * Get demo persona information
 */
export const getDemoPersona = (userId: string) => {
  return DEMO_PERSONAS[userId as keyof typeof DEMO_PERSONAS] || null;
};

/**
 * Fetch wardrobe items for a demo user (public access, no authentication required)
 * Uses the public read RLS policies created for demo accounts
 */
export const getDemoWardrobeItems = async (userId: string): Promise<WardrobeItem[]> => {
  try {
    // Verify this is a demo user
    if (!isDemoUser(userId)) {
      console.warn(`⚠️ User ${userId} is not a demo account with public access`);
      return [];
    }

    const persona = getDemoPersona(userId);
    console.log(`🎭 Demo: Fetching wardrobe for ${persona?.name} (${userId})`);

    // Fetch wardrobe items - RLS policy allows public read for demo users
    const { data, error } = await supabase
      .from('wardrobe_items')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching demo wardrobe items:', error);
      console.error('❌ Error details:', {
        message: error.message,
        details: error.details, 
        hint: error.hint,
        code: error.code
      });
      return [];
    }

    // Convert data to WardrobeItem objects
    const items = convertToWardrobeItems(data || []);
    
    if (items.length === 0) {
      console.log(`📭 No items found for ${persona?.name}`);
      return items;
    }

    // Load scenarios for items (also has public read access via RLS)
    console.log(`🔄 Demo: Loading scenarios for ${items.length} items`);
    try {
      const itemIds = items.filter(item => item.id).map(item => item.id as string);
      console.log(`🔄 Demo: Item IDs for scenario lookup:`, itemIds);
      
      const scenariosByItem = await getBatchItemScenarios(itemIds);
      console.log(`🔄 Demo: Loaded scenarios map size:`, scenariosByItem.size);
      
      // Assign scenarios to each item
      items.forEach(item => {
        if (item.id && scenariosByItem.has(item.id)) {
          item.scenarios = scenariosByItem.get(item.id) || [];
        } else {
          item.scenarios = [];
        }
      });
    } catch (scenarioError) {
      console.warn('⚠️ Could not load scenarios for demo items:', scenarioError);
      console.warn('⚠️ Scenario error details:', {
        message: (scenarioError as any)?.message,
        stack: (scenarioError as any)?.stack
      });
      // Continue without scenarios rather than failing completely
      items.forEach(item => {
        item.scenarios = [];
      });
    }

    console.log(`✅ Demo: Loaded ${items.length} items for ${persona?.name}`);
    return items;

  } catch (error) {
    console.error('❌ Error in getDemoWardrobeItems:', error);
    return [];
  }
};

/**
 * Fetch AI analysis mocks for demo wardrobe items (public access)
 */
export const getDemoAIAnalysisMocks = async (userId: string): Promise<any[]> => {
  try {
    if (!isDemoUser(userId)) {
      console.warn(`⚠️ User ${userId} is not a demo account with public access`);
      return [];
    }

    const persona = getDemoPersona(userId);
    console.log(`🎭 Demo: Fetching AI analysis mocks for ${persona?.name}`);

    // Fetch AI analysis mocks for this user's wardrobe items
    // RLS policy allows public read for demo users
    const { data, error } = await supabase
      .from('ai_analysis_mocks')
      .select(`
        *,
        wardrobe_items!inner (
          id,
          name,
          user_id
        )
      `)
      .eq('wardrobe_items.user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching demo AI analysis mocks:', error);
      return [];
    }

    console.log(`✅ Demo: Loaded ${data?.length || 0} AI analysis mocks for ${persona?.name}`);
    return data || [];

  } catch (error) {
    console.error('❌ Error in getDemoAIAnalysisMocks:', error);
    return [];
  }
};

/**
 * Get all demo user IDs (for admin/testing purposes)
 */
export const getAllDemoUserIds = (): string[] => {
  return [...DEMO_USER_IDS];
};
