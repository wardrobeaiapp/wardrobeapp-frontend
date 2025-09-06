// Import directly from modular service files
import { generateSignedUrl } from './items/itemImageService';
import { migrateLocalStorageItemsToSupabase } from './items/itemMigrationService';

/**
 * Services/wardrobe exports index
 * Provides centralized export of all wardrobe-related services
 */

// Re-export from feature folders
export * from './items';
export * from './outfits';
export * from './capsules';

// Export utility functions
export { generateSignedUrl, migrateLocalStorageItemsToSupabase };
