import { supabase, handleSupabaseError } from './supabase';
import { WardrobeItem, Outfit, Capsule } from '../types';

// Wardrobe Item API calls
export const fetchWardrobeItems = async (): Promise<WardrobeItem[]> => {
  try {
    const { data, error } = await supabase
      .from('wardrobe_items')
      .select('*')
      .order('dateAdded', { ascending: false });
    
    if (error) throw error;
    // Use double type assertion to safely convert the data
    return (data as unknown as WardrobeItem[]) || [];
  } catch (error) {
    console.error('[Supabase] Error fetching wardrobe items:', error);
    // Try to get items from local storage as fallback
    const storedItems = localStorage.getItem('guestItems');
    if (storedItems) {
      return JSON.parse(storedItems) as WardrobeItem[];
    }
    throw error;
  }
};
