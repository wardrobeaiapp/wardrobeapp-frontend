/**
 * Utility to filter wardrobe items to only include essential attributes for AI analysis
 * This should be used by the frontend before sending data to avoid unnecessary bandwidth usage
 */

/**
 * Filter item context to only include essential attributes for duplicate detection and AI analysis
 * Removes IDs, URLs, timestamps, and null/empty fields to reduce payload size
 * 
 * @param {Array} items - Array of wardrobe items to filter
 * @returns {Array} Filtered array with only essential fields
 */
function filterItemContextForAI(items) {
  if (!items || !Array.isArray(items)) return [];
  
  return items.map(item => {
    const filtered = {};
    
    // Only include non-null, non-empty essential fields
    if (item.name) filtered.name = item.name;
    if (item.category) filtered.category = item.category;
    if (item.subcategory) filtered.subcategory = item.subcategory;
    if (item.color) filtered.color = item.color;
    if (item.material) filtered.material = item.material;
    if (item.silhouette) filtered.silhouette = item.silhouette;
    if (item.style) filtered.style = item.style;
    if (item.season && Array.isArray(item.season)) filtered.season = item.season;
    
    // Include pattern if it exists and is not empty
    if (item.pattern && item.pattern.trim()) filtered.pattern = item.pattern;
    
    // Explicitly exclude these heavy/unnecessary fields:
    // - id, userId: Database identifiers not needed for analysis
    // - imageUrl: Can be very large base64 strings or long URLs
    // - dateAdded, updatedAt, imageExpiry: Timestamps irrelevant for analysis
    // - wishlist, wishlistStatus: Status fields not about item attributes
    // - tags, scenarios: Complex objects handled separately 
    // - brand, price: Not essential for duplicate detection
    // - length, sleeves, rise, neckline, heelHeight, bootHeight, type: Detailed attributes (can add back if needed)
    
    return filtered;
  }).filter(item => Object.keys(item).length > 0); // Remove completely empty items
}

/**
 * Get estimated payload size reduction
 * @param {Array} originalItems - Original items array
 * @param {Array} filteredItems - Filtered items array  
 * @returns {Object} Size comparison stats
 */
function getPayloadStats(originalItems, filteredItems) {
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

module.exports = {
  filterItemContextForAI,
  getPayloadStats
};
