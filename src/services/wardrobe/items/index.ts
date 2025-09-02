// Import from modular services
// Base utilities
import {
  camelToSnakeCase,
  snakeToCamelCase,
  convertToWardrobeItems,
  convertToWardrobeItem,
  TABLE_NAME
} from './itemBaseService';

// CRUD operations
import {
  getWardrobeItems,
  getWardrobeItem,
  addWardrobeItem,
  setWardrobeItemActive,
  // API-compatible functions
  fetchWardrobeItems,
  createWardrobeItem,
  updateWardrobeItem as updateWardrobeItemApi,
  deleteWardrobeItem as deleteWardrobeItemApi
} from './itemCrudService';

// Specialized queries
import {
  getItemsByCategory,
  getItemsWithExpiredImageUrls,
  getItemsWithoutHashtags,
  getItemsByIds
} from './itemQueryService';

// Image handling
import { generateSignedUrl } from './itemImageService';

// Migration utilities
import { migrateLocalStorageItemsToSupabase } from './itemMigrationService';

// Re-export all functions
export {
  // Base utilities
  camelToSnakeCase,
  snakeToCamelCase,
  convertToWardrobeItems,
  convertToWardrobeItem,
  TABLE_NAME,

  // Core functions
  generateSignedUrl,
  getWardrobeItems,
  getWardrobeItem,
  addWardrobeItem,
  setWardrobeItemActive,
  
  // Specialized queries
  getItemsByCategory,
  getItemsWithExpiredImageUrls,
  getItemsWithoutHashtags,
  getItemsByIds,
  
  // Migration utilities
  migrateLocalStorageItemsToSupabase,
  
  // API-compatible functions (deprecated but maintained for backward compatibility)
  fetchWardrobeItems,
  createWardrobeItem,
  updateWardrobeItemApi as updateWardrobeItem,
  deleteWardrobeItemApi as deleteWardrobeItem
};

// For backward compatibility with old imports
export const wardrobeItemsService = {
  // Core functions
  generateSignedUrl,
  getWardrobeItems,
  getWardrobeItem,
  addWardrobeItem,
  updateWardrobeItem: updateWardrobeItemApi,
  deleteWardrobeItem: deleteWardrobeItemApi,
  setWardrobeItemActive,
  
  // Specialized queries
  getItemsByCategory,
  getItemsWithExpiredImageUrls,
  getItemsWithoutHashtags,
  getItemsByIds,
  
  // Migration utilities
  migrateLocalStorageItemsToSupabase
};

// Export from updateItemImageUrl
export * from './updateItemImageUrl';
