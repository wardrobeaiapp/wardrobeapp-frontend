import { Outfit } from '../../types';

/**
 * Extended Claude response that includes outfit suggestions
 */
export interface ClaudeResponse {
  message?: string;
  outfits?: Outfit[];
  error?: string;
  details?: string;
}

/**
 * Response format for style advice
 */
export interface StyleAdviceResponse {
  styleAdvice: string;
  error?: string;
  details?: string;
}

/**
 * Analysis result for a wardrobe item
 */
export interface WardrobeItemAnalysis {
  analysis: string;
  score: number;
  feedback: string;
  recommendationText?: string; // Human-readable explanation from gap analysis
  suitableScenarios?: string[]; // Clean scenarios for popup display
  compatibleItems?: { [category: string]: any[] }; // Compatible items by category for popup
  error?: string;
  details?: string;
}
