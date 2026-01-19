import { useState } from 'react';
import { claudeService } from '../../services/ai/claudeService';
import { WishlistStatus, WardrobeItem } from '../../types';
import { DetectedTags } from '../../services/ai/formAutoPopulation/types';

interface AnalysisResult {
  analysisResult: string;
  score: number;
  status: WishlistStatus;
  response: any;
}

export const useAIAnalysis = () => {
  const [itemCheckResponse, setItemCheckResponse] = useState<string | null>(null);
  const [itemCheckScore, setItemCheckScore] = useState<number | undefined>();
  const [itemCheckStatus, setItemCheckStatus] = useState<WishlistStatus | undefined>();
  const [itemSubcategory, setItemSubcategory] = useState<string | null>(null);
  const [recommendationText, setRecommendationText] = useState('');
  const [suitableScenarios, setSuitableScenarios] = useState<string[]>([]);
  const [compatibleItems, setCompatibleItems] = useState<{ [category: string]: any[] }>({});
  const [outfitCombinations, setOutfitCombinations] = useState<any[]>([]);
  const [seasonScenarioCombinations, setSeasonScenarioCombinations] = useState<any[]>([]);
  const [coverageGapsWithNoOutfits, setCoverageGapsWithNoOutfits] = useState<any[]>([]);

  // Map AI score to wishlist status
  const mapScoreToStatus = (score: number): WishlistStatus => {
    if (score >= 8) {
      return WishlistStatus.APPROVED; // RECOMMEND
    } else if (score >= 6) {
      return WishlistStatus.POTENTIAL_ISSUE; // MAYBE
    } else {
      return WishlistStatus.NOT_RECOMMENDED; // SKIP
    }
  };

  // Perform AI analysis
  const analyzeItem = async (
    base64Image: string,
    detectedTags: DetectedTags | null,
    formData: any,
    preFilledData: WardrobeItem
  ): Promise<AnalysisResult> => {
    // Store subcategory from formData
    if (formData?.subcategory) {
      setItemSubcategory(formData.subcategory);
    }

    // Call Claude API for analysis
    const response = await claudeService.analyzeWardrobeItem(base64Image, detectedTags || undefined, formData, preFilledData);
    const analysisResult = response.analysis;
    const score = response.score || 0;
    
    // Determine status based on score to match AI recommendation
    const status = mapScoreToStatus(score);

    // Extract clean data from the new API response structure
    const responseData = response as any;
    const scenarios = responseData.suitableScenarios || [];
    const compatibleItemsData = responseData.compatibleItems || {};
    const outfitCombinationsData = responseData.outfitCombinations || [];
    const seasonScenarioCombinationsData = responseData.seasonScenarioCombinations || [];

    // Update state with analysis results
    setItemCheckResponse(analysisResult);
    setItemCheckScore(score);
    setItemCheckStatus(status);
    setRecommendationText(response.recommendationText || '');
    setSuitableScenarios(scenarios);
    setCompatibleItems(compatibleItemsData);
    setOutfitCombinations(outfitCombinationsData);
    setSeasonScenarioCombinations(seasonScenarioCombinationsData);
    setCoverageGapsWithNoOutfits(response.coverageGapsWithNoOutfits || []);

    return {
      analysisResult,
      score,
      status,
      response
    };
  };

  // Compute recommendation action from score
  const recommendationAction = (() => {
    if (itemCheckScore === undefined) return '';
    if (itemCheckScore >= 8) return 'RECOMMEND';
    if (itemCheckScore >= 6) return 'MAYBE';
    return 'SKIP';
  })();

  return {
    // State
    itemCheckResponse,
    itemCheckScore,
    itemCheckStatus,
    itemSubcategory,
    recommendationText,
    suitableScenarios,
    compatibleItems,
    outfitCombinations,
    seasonScenarioCombinations,
    coverageGapsWithNoOutfits,
    recommendationAction,

    // Actions
    analyzeItem,
    mapScoreToStatus
  };
};
