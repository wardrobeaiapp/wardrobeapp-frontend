import { WishlistStatus, UserActionStatus } from './index';

export interface AICheckHistoryItem {
  id: string;
  type: 'check';
  title: string;
  description: string;
  summary: string;
  score: number;
  image?: string;  // Made optional to match mock data
  date: Date;
  status: WishlistStatus;
  userActionStatus: UserActionStatus;
  errorType?: string;
  errorDetails?: string;
  extractedTags?: any;
  // Rich data for visual display in detail modal
  richData?: {
    compatibleItems: { [category: string]: any[] };
    outfitCombinations: any[];
    suitableScenarios: string[];
    seasonScenarioCombinations: any[];
    coverageGapsWithNoOutfits: any[];
    itemDetails: any;
    recommendationText?: string;
    rawAnalysis?: string;
  };
}

export interface AIRecommendationHistoryItem {
  id: string;
  type: 'recommendation';
  title: string;
  description: string;
  summary: string;
  image?: string;  // Made optional to match mock data
  date: Date;
  season: string;
  scenario: string;
  userActionStatus: UserActionStatus;
}

export type AIHistoryItem = AICheckHistoryItem | AIRecommendationHistoryItem;
