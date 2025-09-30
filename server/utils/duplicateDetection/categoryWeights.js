/**
 * Category-specific weight configurations for duplicate detection
 * Each category defines which attributes matter most for identifying duplicates
 */

/**
 * Get category-specific weights for duplicate detection
 * @param {string} category - Item category (e.g., 'top', 'bottom', 'footwear')
 * @param {string} subcategory - Item subcategory (e.g., 't-shirt', 'jeans', 'heels')
 * @returns {Object} Weight configuration for the category
 */
function getCategoryWeights(category, subcategory) {
  const cat = category?.toLowerCase();
  const subcat = subcategory?.toLowerCase();
  
  // T-shirts and tank tops: pattern, neckline, sleeves matter more than silhouette
  if (cat === 'top' && (subcat === 't-shirt' || subcat === 'tank top')) {
    return { 
      color: 40, 
      pattern: 20,      // Plain vs patterned is important
      neckline: 15,     // Crew vs v-neck vs scoop matters
      sleeves: 10,      // Short vs long matters
      silhouette: 10,   // Less important for basic tops
      style: 5 
    };
  }
  
  // Bottoms: silhouette is very important (skinny vs wide leg)
  if (cat === 'bottom') {
    return { 
      color: 40, 
      silhouette: 35,   // Very important for pants/skirts
      style: 15, 
      material: 10,
      rise: 10,         // High-rise vs low-rise matters
      length: 10        // Full-length vs cropped matters
    };
  }
  
  // Outerwear: style and silhouette matter a lot
  if (cat === 'outerwear') {
    return { 
      color: 35, 
      silhouette: 30, 
      style: 25, 
      material: 10,
      length: 10        // Long coat vs short jacket
    };
  }
  
  // Footwear: heel height and boot height are defining characteristics
  if (cat === 'footwear') {
    return {
      color: 35,
      heelHeight: 30,   // Flat vs high heel is crucial
      bootHeight: 20,   // Ankle vs knee-high for boots
      style: 10,
      material: 5
    };
  }
  
  // Default weights for other categories
  return { 
    color: 50, 
    silhouette: 30, 
    style: 10, 
    material: 10 
  };
}

module.exports = {
  getCategoryWeights
};
