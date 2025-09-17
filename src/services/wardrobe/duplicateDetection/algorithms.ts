// Core algorithms for duplicate detection

import { COLOR_FAMILIES, SILHOUETTE_FAMILIES, SIMILARITY_WEIGHTS, DUPLICATE_THRESHOLDS } from './constants';
import type { ItemData, ExistingItem, DuplicateMatch } from './types';

/**
 * Check if two colors are considered similar/matching
 */
export function colorsMatch(color1?: string, color2?: string): boolean {
  if (!color1 || !color2) return false;
  
  // Exact match
  if (color1 === color2) return true;
  
  // Check color families
  for (const family of Object.values(COLOR_FAMILIES)) {
    if ((family as readonly string[]).includes(color1) && (family as readonly string[]).includes(color2)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Check if two silhouettes are considered similar/matching
 */
export function silhouettesMatch(silhouette1?: string, silhouette2?: string): boolean {
  if (!silhouette1 || !silhouette2) return false;
  
  // Exact match
  if (silhouette1 === silhouette2) return true;
  
  // Check silhouette families
  for (const family of Object.values(SILHOUETTE_FAMILIES)) {
    if ((family as readonly string[]).includes(silhouette1) && (family as readonly string[]).includes(silhouette2)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Calculate similarity score between two items
 */
export function calculateSimilarityScore(newItem: ItemData, existingItem: ExistingItem): number {
  // Category and subcategory must match
  if (newItem.category !== existingItem.category || 
      newItem.subcategory !== existingItem.subcategory) {
    return 0;
  }
  
  let score = 0;
  const maxScore = SIMILARITY_WEIGHTS.COLOR + SIMILARITY_WEIGHTS.SILHOUETTE + 
                  SIMILARITY_WEIGHTS.STYLE + SIMILARITY_WEIGHTS.MATERIAL;
  
  // Color matching (most important)
  if (colorsMatch(newItem.color, existingItem.color)) {
    score += SIMILARITY_WEIGHTS.COLOR;
  }
  
  // Silhouette matching (second most important)
  if (silhouettesMatch(newItem.silhouette, existingItem.silhouette)) {
    score += SIMILARITY_WEIGHTS.SILHOUETTE;
  }
  
  // Style matching
  if (newItem.style === existingItem.style) {
    score += SIMILARITY_WEIGHTS.STYLE;
  }
  
  // Material matching
  if (newItem.material === existingItem.material) {
    score += SIMILARITY_WEIGHTS.MATERIAL;
  }
  
  return Math.round((score / maxScore) * 100);
}

/**
 * Find items that are critical duplicates (color + silhouette match)
 */
export function findCriticalDuplicates(newItem: ItemData, existingItems: ExistingItem[]): DuplicateMatch[] {
  return existingItems
    .filter(item => 
      item.category === newItem.category && 
      item.subcategory === newItem.subcategory
    )
    .map(item => {
      const similarity_score = calculateSimilarityScore(newItem, item);
      const overlap_factors = getOverlapFactors(newItem, item);
      
      return {
        item,
        similarity_score,
        overlap_factors
      };
    })
    .filter(match => match.similarity_score >= DUPLICATE_THRESHOLDS.CRITICAL_DUPLICATE)
    .sort((a, b) => b.similarity_score - a.similarity_score);
}

/**
 * Find items that are similar but not critical duplicates
 */
export function findSimilarItems(newItem: ItemData, existingItems: ExistingItem[]): DuplicateMatch[] {
  return existingItems
    .filter(item => 
      item.category === newItem.category && 
      item.subcategory === newItem.subcategory
    )
    .map(item => {
      const similarity_score = calculateSimilarityScore(newItem, item);
      const overlap_factors = getOverlapFactors(newItem, item);
      
      return {
        item,
        similarity_score,
        overlap_factors
      };
    })
    .filter(match => 
      match.similarity_score >= DUPLICATE_THRESHOLDS.SIMILAR_ITEM &&
      match.similarity_score < DUPLICATE_THRESHOLDS.CRITICAL_DUPLICATE
    )
    .sort((a, b) => b.similarity_score - a.similarity_score);
}

/**
 * Identify specific factors that overlap between items
 */
export function getOverlapFactors(newItem: ItemData, existingItem: ExistingItem): string[] {
  const factors: string[] = [];
  
  if (colorsMatch(newItem.color, existingItem.color)) {
    factors.push(`Same color (${newItem.color || 'unknown'})`);
  }
  
  if (silhouettesMatch(newItem.silhouette, existingItem.silhouette)) {
    factors.push(`Same silhouette (${newItem.silhouette || 'unknown'})`);
  }
  
  if (newItem.style === existingItem.style && newItem.style) {
    factors.push(`Same style (${newItem.style})`);
  }
  
  if (newItem.material === existingItem.material && newItem.material) {
    factors.push(`Same material (${newItem.material})`);
  }
  
  return factors;
}

/**
 * Calculate color distribution in category
 */
export function calculateColorDistribution(newItem: ItemData, existingItems: ExistingItem[]) {
  const categoryItems = existingItems.filter(item => item.category === newItem.category);
  
  const colorCounts: Record<string, number> = {};
  categoryItems.forEach(item => {
    if (item.color) {
      colorCounts[item.color] = (colorCounts[item.color] || 0) + 1;
    }
  });
  
  const newColor = newItem.color || 'unknown';
  const currentCount = colorCounts[newColor] || 0;
  const afterAddition = currentCount + 1;
  const totalAfterAddition = categoryItems.length + 1;
  
  return {
    current_colors: Object.keys(colorCounts).length,
    target_color_count: currentCount,
    after_addition: afterAddition,
    percentage_of_category: Math.round((afterAddition / totalAfterAddition) * 100),
    is_dominant_color: afterAddition / totalAfterAddition >= (DUPLICATE_THRESHOLDS.VARIETY_RISK_THRESHOLD / 100)
  };
}

/**
 * Calculate silhouette distribution in category
 */
export function calculateSilhouetteDistribution(newItem: ItemData, existingItems: ExistingItem[]) {
  const categoryItems = existingItems.filter(item => item.category === newItem.category);
  
  const silhouetteCounts: Record<string, number> = {};
  categoryItems.forEach(item => {
    if (item.silhouette) {
      silhouetteCounts[item.silhouette] = (silhouetteCounts[item.silhouette] || 0) + 1;
    }
  });
  
  const newSilhouette = newItem.silhouette || 'unknown';
  const currentCount = silhouetteCounts[newSilhouette] || 0;
  const afterAddition = currentCount + 1;
  const totalAfterAddition = categoryItems.length + 1;
  
  return {
    current_silhouettes: Object.keys(silhouetteCounts).length,
    target_silhouette_count: currentCount,
    after_addition: afterAddition,
    percentage_of_category: Math.round((afterAddition / totalAfterAddition) * 100),
    is_dominant_silhouette: afterAddition / totalAfterAddition >= (DUPLICATE_THRESHOLDS.VARIETY_RISK_THRESHOLD / 100)
  };
}
