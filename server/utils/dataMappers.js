/**
 * Data mapping utilities for converting between frontend and database formats
 */

/**
 * Map wardrobe item data from request to Supabase format
 * @param {Object} itemData - Raw item data from request
 * @param {string} userId - User ID
 * @returns {Object} - Supabase-formatted data
 */
const mapItemDataForSupabase = (itemData, userId) => {
  const supabaseData = {
    user_id: userId,
    name: itemData.name,
    category: itemData.category,
    subcategory: itemData.subcategory,
    color: itemData.color,
    pattern: itemData.pattern,
    material: itemData.material,
    brand: itemData.brand,
    price: itemData.price,
    silhouette: itemData.silhouette,
    length: itemData.length,
    sleeves: itemData.sleeves,
    style: itemData.style,
    rise: itemData.rise,
    neckline: itemData.neckline,
    heel_height: itemData.heelHeight,
    boot_height: itemData.bootHeight,
    type: itemData.type,
    closure: itemData.closure,
    details: itemData.details,
    season: itemData.season,
    scenarios: itemData.scenarios,
    image_url: itemData.imageUrl,
    wishlist: itemData.wishlist,
    date_added: new Date().toISOString(),
  };

  // Remove undefined fields
  Object.keys(supabaseData).forEach(key => {
    if (supabaseData[key] === undefined) {
      delete supabaseData[key];
    }
  });

  return supabaseData;
};

/**
 * Process and validate request body data for wardrobe items
 * @param {Object} body - Request body
 * @returns {Object} - Processed item data
 */
const processItemRequestData = (body) => {
  // Handle arrays with safe defaults
  let season = ['ALL_SEASON'];
  
  // Try to parse season if provided
  if (body.season) {
    try {
      season = JSON.parse(body.season);
    } catch (err) {
      console.log('Using default season due to parsing error');
    }
  }
  
  // Create the item object with all possible fields
  const itemData = {
    name: body.name,
    category: body.category,
    color: body.color,
    season,
    wishlist: body.wishlist === true || body.wishlist === 'true',
    // Include all optional fields if provided
    ...(body.subcategory && { subcategory: body.subcategory }),
    ...(body.brand && { brand: body.brand }),
    ...(body.size && { size: body.size }),
    ...(body.material && { material: body.material }),
    ...(body.price && { price: parseFloat(body.price) }),
    ...(body.pattern && { pattern: body.pattern }),
    ...(body.silhouette && { silhouette: body.silhouette }),
    ...(body.length && { length: body.length }),
    ...(body.sleeves && { sleeves: body.sleeves }),
    ...(body.style && { style: body.style }),
    ...(body.rise && { rise: body.rise }),
    ...(body.neckline && { neckline: body.neckline }),
    ...(body.heelHeight && { heelHeight: body.heelHeight }),
    ...(body.bootHeight && { bootHeight: body.bootHeight }),
    ...(body.type && { type: body.type }),
    ...(body.closure && { closure: body.closure }),
    ...(body.details && { details: body.details }),
    ...(body.scenarios && { scenarios: typeof body.scenarios === 'string' ? JSON.parse(body.scenarios) : body.scenarios }),
    ...(body.tags && { tags: typeof body.tags === 'string' ? JSON.parse(body.tags) : body.tags }),
    ...(body.wishlistStatus && { wishlistStatus: body.wishlistStatus })
  };
  
  return itemData;
};

module.exports = {
  mapItemDataForSupabase,
  processItemRequestData
};
