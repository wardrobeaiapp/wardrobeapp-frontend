import { WardrobeItem } from '../../types';
import { filterStylingContext, filterSimilarContext } from './wardrobeContextHelpers';
import { filterItemContextForAI, getPayloadStats } from './itemContextFilter';

/**
 * Context filtering result with stats
 */
interface ContextFilterResult {
  filteredStylingContext: Partial<WardrobeItem>[];
  filteredSimilarContext: Partial<WardrobeItem>[];
  stylingStats?: { reduction: number; reductionPercent: number };
  similarStats?: { reduction: number; reductionPercent: number };
}

/**
 * Filter and process wardrobe contexts for AI analysis
 * @param wardrobeItems - All wardrobe items
 * @param enhancedFormData - Form data with scenarios
 * @param scenarios - Available scenarios
 * @returns Filtered contexts with payload reduction stats
 */
export const filterAndProcessContexts = (
  wardrobeItems: WardrobeItem[],
  enhancedFormData: any,
  scenarios: Array<{ id: string; name: string; description?: string; frequency?: string | number }>
): ContextFilterResult => {
  // Generate styling and similar context using helper functions
  const stylingContextResult = filterStylingContext(wardrobeItems, enhancedFormData, scenarios || []);
  const stylingContext = [
    ...(stylingContextResult.complementing.bottoms || []),
    ...(stylingContextResult.complementing.footwear || []),
    ...(stylingContextResult.complementing.accessories || []),
    ...(stylingContextResult.complementing.tops || []),
    ...(stylingContextResult.complementing.onePieces || []),
    ...(stylingContextResult.complementing.outerwear || []),
    ...stylingContextResult.layering || [],
    ...stylingContextResult.outerwear || []
  ];
  
  const similarContext = filterSimilarContext(wardrobeItems, enhancedFormData, scenarios || []);

  // Filter contexts to reduce payload size before sending to backend
  // Include card fields (ID, imageUrl) for styling context to enable card display
  // Removed 5-item limit for similarContext to enable proper duplicate detection
  const filteredStylingContext = filterItemContextForAI(stylingContext, undefined, true); // true = include card fields
  const filteredSimilarContext = filterItemContextForAI(similarContext, undefined); // No limit for duplicate detection

  // Debug: Log filtered items AFTER filtering
  if (filteredStylingContext.length > 0) {
    console.log('[aiContextFilter] 🔍 FILTERED stylingContext (first item with card fields):', JSON.stringify(filteredStylingContext[0], null, 2));
  }
  if (filteredSimilarContext.length > 0) {
    console.log('[aiContextFilter] 🔍 FILTERED similarContext (first item):', JSON.stringify(filteredSimilarContext[0], null, 2));
  }

  // Calculate payload reduction stats
  let stylingStats, similarStats;
  
  if (stylingContext.length > 0) {
    stylingStats = getPayloadStats(stylingContext, filteredStylingContext);
    console.log(`[aiContextFilter] Styling context payload reduced by ${stylingStats.reductionPercent}% (${stylingStats.reduction} chars)`);
  }
  
  if (similarContext.length > 0) {
    similarStats = getPayloadStats(similarContext, filteredSimilarContext);
    console.log(`[aiContextFilter] Similar context payload reduced by ${similarStats.reductionPercent}% (${similarStats.reduction} chars)`);
  }

  return {
    filteredStylingContext,
    filteredSimilarContext,
    stylingStats,
    similarStats
  };
};

/**
 * Get context filtering summary for logging
 * @param result - Context filter result
 * @returns Summary string for logging
 */
export const getContextFilterSummary = (result: ContextFilterResult): string => {
  const { filteredStylingContext, filteredSimilarContext, stylingStats, similarStats } = result;
  
  let summary = '';
  
  if (stylingStats) {
    summary += `Styling: ${stylingStats.reductionPercent}% reduction, `;
  }
  
  if (similarStats) {
    summary += `Similar: ${similarStats.reductionPercent}% reduction, `;
  }
  
  summary += `Items: ${filteredStylingContext.length + filteredSimilarContext.length} total`;
  
  return summary;
};
