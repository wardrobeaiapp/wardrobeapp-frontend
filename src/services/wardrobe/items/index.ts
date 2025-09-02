// Import all functions from itemService
import {
  generateSignedUrl,
  getWardrobeItems,
  getWardrobeItem,
  addWardrobeItem,
  updateWardrobeItem,
  deleteWardrobeItem,
  setWardrobeItemActive,
  getItemsByCategory,
  getItemsWithExpiredImageUrls,
  getItemsWithoutHashtags,
  getItemsByIds,
  migrateLocalStorageItemsToSupabase,
  // API-compatible functions
  fetchWardrobeItems,
  createWardrobeItem,
  updateWardrobeItem as updateWardrobeItemApi,
  deleteWardrobeItem as deleteWardrobeItemApi
} from './itemService';

// Re-export all functions
export {
  // Core functions
  generateSignedUrl,
  getWardrobeItems,
  // API-compatible functions (deprecated but maintained for backward compatibility)
  fetchWardrobeItems,
  createWardrobeItem,
  updateWardrobeItemApi as updateWardrobeItem,
  deleteWardrobeItemApi as deleteWardrobeItem,
  // Core functions with their original names
  getWardrobeItem,
  addWardrobeItem,
  setWardrobeItemActive,
  getItemsByCategory,
  getItemsWithExpiredImageUrls,
  getItemsWithoutHashtags,
  getItemsByIds,
  migrateLocalStorageItemsToSupabase
};

// For backward compatibility with old imports
export const wardrobeItemsService = {
  generateSignedUrl,
  getWardrobeItems,
  getWardrobeItem,
  addWardrobeItem,
  updateWardrobeItem,
  deleteWardrobeItem,
  setWardrobeItemActive,
  getItemsByCategory,
  getItemsWithExpiredImageUrls,
  getItemsWithoutHashtags,
  getItemsByIds,
  migrateLocalStorageItemsToSupabase
};

// Export from updateItemImageUrl
export * from './updateItemImageUrl';
