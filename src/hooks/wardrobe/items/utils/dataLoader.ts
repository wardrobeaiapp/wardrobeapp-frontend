/**
 * Data loading utilities for wardrobe items
 * Handles database loading, localStorage migration, and session management
 */

import { WardrobeItem } from '../../../../types';
import { getWardrobeItems, migrateLocalStorageItemsToSupabase } from '../../../../services/wardrobe/items';
import { supabase } from '../../../../services/core';
import { yieldToMain, parseLocalStorageAsync } from './asyncUtils';

interface DataLoaderResult {
  items: WardrobeItem[];
  error: string | null;
}

/**
 * Loads wardrobe items from database with localStorage fallback and migration
 * 
 * @param isMountedRef - React ref to check if component is still mounted
 * @returns Promise with items array and any error message
 */
export const loadWardrobeItems = async (
  isMountedRef: React.MutableRefObject<boolean>
): Promise<DataLoaderResult> => {
  try {
    // Check if we have a session first to avoid AuthSessionMissingError
    const { data: sessionData } = await supabase.auth.getSession();
    
    // Yield control after session check
    await yieldToMain();
    
    if (!isMountedRef.current) {
      return { items: [], error: null };
    }
    
    if (!sessionData.session || !sessionData.session.user) {
      // No active session - user is not authenticated
      return { items: [], error: null };
    }
    
    // Use user from session data instead of making another auth call
    const userId = sessionData.session.user.id;
    
    // Yield control after auth check
    await yieldToMain();
    if (!isMountedRef.current) {
      return { items: [], error: null };
    }
    
    // Always attempt to load from the database first with the actual user ID
    const dbItems = await getWardrobeItems(userId, false);
    
    if (!isMountedRef.current) {
      return { items: [], error: null };
    }
    
    if (dbItems && dbItems.length > 0) {
      return { items: dbItems, error: null };
    }
    
    // If no items in database, check localStorage asynchronously
    const localStorageItems = await parseLocalStorageAsync('wardrobe-items-guest');
    
    if (!isMountedRef.current) {
      return { items: [], error: null };
    }
    
    if (localStorageItems.length > 0) {
      // Start background migration but return localStorage items immediately
      handleBackgroundMigration(userId, isMountedRef);
      return { items: localStorageItems, error: null };
    }
    
    // No items found anywhere
    return { items: [], error: null };
    
  } catch (error) {
    console.error('Error loading items:', error);
    return { items: [], error: 'Failed to load items' };
  }
};

/**
 * Handles background migration of localStorage items to database
 * This runs asynchronously without blocking the UI
 * 
 * @param userId - User ID for migration
 * @param isMountedRef - React ref to check if component is still mounted
 * @param onMigrationComplete - Callback when migration is complete
 */
const handleBackgroundMigration = (
  userId: string,
  isMountedRef: React.MutableRefObject<boolean>,
  onMigrationComplete?: (items: WardrobeItem[]) => void
) => {
  // Defer migration to idle time to avoid blocking
  if ('requestIdleCallback' in window) {
    requestIdleCallback(async () => {
      if (!isMountedRef.current) return;
      
      try {
        const migrationSuccess = await migrateLocalStorageItemsToSupabase();
        
        if (migrationSuccess && isMountedRef.current) {
          // If migration was successful, fetch the items again
          const migratedItems = await getWardrobeItems(userId, false);
          
          if (isMountedRef.current && onMigrationComplete) {
            onMigrationComplete(migratedItems);
            // Clear localStorage after successful migration
            localStorage.removeItem('wardrobe-items-guest');
          }
        }
      } catch (migrationError) {
        console.error('Background migration failed:', migrationError);
        // Keep using localStorage items if migration fails
      }
    }, { timeout: 5000 });
  }
};
