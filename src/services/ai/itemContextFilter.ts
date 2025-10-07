import { WardrobeItem } from '../../types';

/**
 * Filter item context to only include essential attributes for duplicate detection and AI analysis
 * Removes IDs, URLs, timestamps, and null/empty fields to reduce payload size
 * 
 * @param items - Array of wardrobe items to filter
 * @param maxItems - Optional maximum number of items to include (default: no limit)
 * @param includeCardFields - Whether to include ID and imageUrl for frontend card display
 * @returns Filtered array with only essential fields
 */
export function filterItemContextForAI(items: WardrobeItem[], maxItems?: number, includeCardFields?: boolean): Partial<WardrobeItem>[] {
  if (!items || !Array.isArray(items)) return [];
  
  // Limit number of items if specified to prevent payload size issues
  const itemsToProcess = maxItems ? items.slice(0, maxItems) : items;
  
  return itemsToProcess.map(item => {
    const filtered: Partial<WardrobeItem> = {};
    
    // Only include non-null, non-empty essential fields
    if (item.name) filtered.name = item.name;
    if (item.category) filtered.category = item.category;
    if (item.subcategory) filtered.subcategory = item.subcategory;
    if (item.color) filtered.color = item.color;
    if (item.material) filtered.material = item.material;
    if (item.silhouette) filtered.silhouette = item.silhouette;
    if (item.style) filtered.style = item.style;
    if (item.season && Array.isArray(item.season)) filtered.season = item.season;
    
    // Include detailed attributes needed for category-specific duplicate detection
    // Include even if empty string - let the matching functions decide
    if (item.pattern !== undefined && item.pattern !== null) filtered.pattern = item.pattern;
    if (item.neckline !== undefined && item.neckline !== null) filtered.neckline = item.neckline;
    if (item.sleeves !== undefined && item.sleeves !== null) filtered.sleeves = item.sleeves;
    if (item.length !== undefined && item.length !== null) filtered.length = item.length;
    if (item.rise !== undefined && item.rise !== null) filtered.rise = item.rise;
    if (item.heelHeight !== undefined && item.heelHeight !== null) filtered.heelHeight = item.heelHeight;
    if (item.bootHeight !== undefined && item.bootHeight !== null) filtered.bootHeight = item.bootHeight;
    
    // Include card fields for frontend display when requested
    if (includeCardFields) {
      if (item.id) filtered.id = item.id;
      if (item.imageUrl) filtered.imageUrl = item.imageUrl;
      if (item.brand) filtered.brand = item.brand;
      if (item.scenarios && Array.isArray(item.scenarios)) filtered.scenarios = item.scenarios;
    }
    
    // Explicitly exclude these heavy/unnecessary fields (unless includeCardFields is true):
    // - id, userId: Database identifiers not needed for analysis
    // - imageUrl: Can be very large base64 strings or long URLs  
    // - dateAdded, updatedAt, imageExpiry: Timestamps irrelevant for analysis
    // - wishlist, wishlistStatus: Status fields not about item attributes
    // - tags, scenarios: Complex objects handled separately
    // - brand, price, type: Not essential for duplicate detection
    
    return filtered;
  }).filter(item => Object.keys(item).length > 0); // Remove completely empty items
}

/**
 * Get estimated payload size reduction
 * @param originalItems - Original items array
 * @param filteredItems - Filtered items array
 * @returns Size comparison stats
 */
export function getPayloadStats(originalItems: WardrobeItem[], filteredItems: Partial<WardrobeItem>[]) {
  const originalSize = JSON.stringify(originalItems).length;
  const filteredSize = JSON.stringify(filteredItems).length;
  const reduction = originalSize - filteredSize;
  const reductionPercent = Math.round((reduction / originalSize) * 100);
  
  return {
    originalSize,
    filteredSize,
    reduction,
    reductionPercent
  };
}
