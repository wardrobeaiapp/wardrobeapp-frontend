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
  migrateLocalStorageItemsToSupabase
} from './itemService';

// Re-export all functions
export {
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
