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
  updateWardrobeItem,
  deleteWardrobeItem,
  setWardrobeItemActive
} from './itemCrudService';

// Legacy functions have been removed

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
  updateWardrobeItem,
  deleteWardrobeItem,
  setWardrobeItemActive,
  
  // Specialized queries
  getItemsByCategory,
  getItemsWithExpiredImageUrls,
  getItemsWithoutHashtags,
  getItemsByIds,
  
  // Migration utilities
  migrateLocalStorageItemsToSupabase
};

// For backward compatibility with old imports
export const wardrobeItemsService = {
  // Core functions
  generateSignedUrl,
  getWardrobeItems,
  getWardrobeItem,
  addWardrobeItem,
  updateWardrobeItem,
  deleteWardrobeItem,
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
