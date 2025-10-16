/**
 * Algorithmic Compatibility Service
 * Simple, reliable compatibility checking using actual wardrobe item data
 * No AI text parsing, no complex filters - just clean logic!
 */

/**
 * Get compatible items using algorithmic rules instead of parsing AI text
 */
function getCompatibleItems(baseItem, stylingContext) {
  console.log(`🔍 Finding compatible items for: ${baseItem.name} (${baseItem.category})`);
  
  if (!stylingContext || !Array.isArray(stylingContext)) {
    console.log('⚠️ No styling context provided');
    return {};
  }

  const compatibleItems = {};
  let totalCompatible = 0;

  // Group items by category and check compatibility
  stylingContext.forEach(item => {
    // Skip the base item itself
    if (item.id === baseItem.id) return;

    const category = item.category?.toLowerCase() || 'other';
    
    if (isCompatible(baseItem, item)) {
      if (!compatibleItems[category]) {
        compatibleItems[category] = [];
      }
      compatibleItems[category].push(item);
      totalCompatible++;
    }
  });

  // Sort items within each category for consistency
  Object.keys(compatibleItems).forEach(category => {
    compatibleItems[category].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  });

  console.log(`✅ Found ${totalCompatible} compatible items across ${Object.keys(compatibleItems).length} categories`);
  
  // Log summary by category
  Object.entries(compatibleItems).forEach(([category, items]) => {
    console.log(`   ${category}: ${items.length} items (${items.map(item => item.name).join(', ')})`);
  });

  return compatibleItems;
}

/**
 * Check if two items are compatible using simple, reliable rules
 */
function isCompatible(baseItem, candidateItem) {
  // Basic validation
  if (!baseItem || !candidateItem) return false;
  
  // Check season compatibility
  if (!hasSeasonOverlap(baseItem, candidateItem)) {
    return false;
  }
  
  // Check color compatibility (basic rules for now)
  if (!hasColorCompatibility(baseItem, candidateItem)) {
    return false;
  }
  
  // Check formality/style compatibility
  if (!hasStyleCompatibility(baseItem, candidateItem)) {
    return false;
  }

  return true;
}

/**
 * Check if items have overlapping seasons
 */
function hasSeasonOverlap(baseItem, candidateItem) {
  const baseSeasons = Array.isArray(baseItem.season) ? baseItem.season : [baseItem.season];
  const candidateSeasons = Array.isArray(candidateItem.season) ? candidateItem.season : [candidateItem.season];
  
  // If either item has no season info, assume compatible
  if (!baseSeasons.length || !candidateSeasons.length) return true;
  
  // Check for overlap
  return baseSeasons.some(baseSeason => 
    candidateSeasons.some(candidateSeason => 
      baseSeason === candidateSeason || baseSeason === 'ALL_SEASON' || candidateSeason === 'ALL_SEASON'
    )
  );
}

/**
 * Check basic color compatibility
 */
function hasColorCompatibility(baseItem, candidateItem) {
  const baseColor = baseItem.color?.toLowerCase();
  const candidateColor = candidateItem.color?.toLowerCase();
  
  // If no color info, assume compatible
  if (!baseColor || !candidateColor) return true;
  
  // Same color is always compatible
  if (baseColor === candidateColor) return true;
  
  // Neutral colors go with everything
  const neutrals = ['black', 'white', 'gray', 'grey', 'beige', 'cream', 'nude', 'brown'];
  if (neutrals.includes(baseColor) || neutrals.includes(candidateColor)) {
    return true;
  }
  
  // Basic color harmony rules (can be expanded)
  const colorHarmony = {
    'blue': ['white', 'black', 'gray', 'beige', 'brown'],
    'red': ['white', 'black', 'gray', 'beige'],
    'green': ['white', 'black', 'gray', 'beige', 'brown'],
    'yellow': ['white', 'black', 'gray', 'blue'],
    'purple': ['white', 'black', 'gray'],
    'pink': ['white', 'black', 'gray'],
    'orange': ['white', 'black', 'gray', 'brown']
  };
  
  if (colorHarmony[baseColor]?.includes(candidateColor) || 
      colorHarmony[candidateColor]?.includes(baseColor)) {
    return true;
  }
  
  return true; // For now, be permissive - can tighten later
}

/**
 * Check style/formality compatibility
 */
function hasStyleCompatibility(baseItem, candidateItem) {
  const baseStyle = baseItem.style?.toLowerCase();
  const candidateStyle = candidateItem.style?.toLowerCase();
  
  // If no style info, assume compatible
  if (!baseStyle || !candidateStyle) return true;
  
  // Same style is always compatible
  if (baseStyle === candidateStyle) return true;
  
  // Basic style compatibility rules
  const styleCompatibility = {
    'casual': ['casual', 'smart casual', 'relaxed'],
    'formal': ['formal', 'business', 'professional', 'elegant'],
    'smart casual': ['smart casual', 'casual', 'business casual'],
    'business': ['business', 'formal', 'professional'],
    'elegant': ['elegant', 'formal', 'sophisticated'],
    'sporty': ['sporty', 'athletic', 'casual']
  };
  
  if (styleCompatibility[baseStyle]?.includes(candidateStyle) || 
      styleCompatibility[candidateStyle]?.includes(baseStyle)) {
    return true;
  }
  
  return true; // For now, be permissive - can tighten later
}

module.exports = {
  getCompatibleItems,
  isCompatible,
  hasSeasonOverlap,
  hasColorCompatibility,
  hasStyleCompatibility
};
