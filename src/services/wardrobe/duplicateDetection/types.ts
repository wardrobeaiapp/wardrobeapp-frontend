// Types for duplicate detection service

export interface ItemData {
  category: string;
  subcategory: string;
  color?: string;
  silhouette?: string;
  style?: string;
  material?: string;
  seasons?: string[];
}

export interface ExistingItem extends ItemData {
  id: string;
  name: string;
}

export interface DuplicateMatch {
  item: ExistingItem;
  similarity_score: number;
  overlap_factors: string[];
}

export interface DuplicateAnalysis {
  found: boolean;
  count: number;
  matches: DuplicateMatch[];
  severity: 'NONE' | 'MODERATE' | 'HIGH' | 'EXCESSIVE';
  verdict: 'NO_DUPLICATES' | 'SIMILAR_ITEMS' | 'CRITICAL_DUPLICATES';
}

export interface VarietyImpact {
  color_distribution: ColorDistribution;
  silhouette_distribution: SilhouetteDistribution;
  variety_score: number;
  impact_message: string;
}

export interface ColorDistribution {
  current_colors: number;
  target_color_count: number;
  after_addition: number;
  percentage_of_category: number;
  is_dominant_color: boolean;
}

export interface SilhouetteDistribution {
  current_silhouettes: number;
  target_silhouette_count: number;
  after_addition: number;
  percentage_of_category: number;
  is_dominant_silhouette: boolean;
}

export interface DuplicateDetectionResult {
  duplicate_analysis: DuplicateAnalysis;
  variety_impact: VarietyImpact;
  recommendation: RecommendationResult;
}

export interface RecommendationResult {
  action: 'SKIP' | 'CONSIDER' | 'RECOMMEND';
  reason: string;
  message: string;
  confidence: number;
}

export interface ExtractedAttributes {
  color: string;
  silhouette: string | null;
  style: string;
  confidence: {
    color: number;
    silhouette: number;
    style: number;
  };
}
