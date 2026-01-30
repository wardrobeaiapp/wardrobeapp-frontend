import { WishlistStatus, UserActionStatus } from '../../../types';
import { AIHistoryItem } from '../../../types/ai';

export const transformHistoryRecord = (item: any): AIHistoryItem => {
  let richDataObject;

  if (item.analysisData) {
    richDataObject = {
      compatibleItems: item.analysisData.compatibleItems || {},
      outfitCombinations: item.analysisData.outfitCombinations || [],
      suitableScenarios: item.analysisData.suitableScenarios || [],
      seasonScenarioCombinations: item.analysisData.seasonScenarioCombinations || [],
      coverageGapsWithNoOutfits: item.analysisData.coverageGapsWithNoOutfits || [],
      itemDetails: item.analysisData.itemDetails || item.itemDetails || {},
      recommendationText: item.analysisData.recommendationText || item.recommendationText,
      analysis: item.analysisData.analysis || item.analysis,
      rawAnalysis: item.rawAnalysis
    };
  } else {
    richDataObject = undefined;
  }

  const score = item.analysisData ? (item.analysisData.score || item.score || 0) : 0;
  let mappedStatus: WishlistStatus;
  if (score >= 8) {
    mappedStatus = WishlistStatus.APPROVED;
  } else if (score >= 6) {
    mappedStatus = WishlistStatus.POTENTIAL_ISSUE;
  } else {
    mappedStatus = WishlistStatus.NOT_RECOMMENDED;
  }

  return {
    id: item.id,
    type: 'check' as const,
    title: item.title || `AI Check: ${item.itemDetails?.name || 'Unknown Item'}`,
    description: item.description || item.feedback || 'AI analysis completed',
    summary: item.summary || `Score: ${score}/10`,
    score: score,
    image: item.image_url || item.itemDetails?.imageUrl,
    wardrobeItemId: item.wardrobe_item_id || item.wardrobeItemId,
    date: new Date(item.analysisDate || item.createdAt),
    status: mappedStatus,
    userActionStatus: item.userActionStatus || UserActionStatus.PENDING,
    richData: richDataObject
  };
};
