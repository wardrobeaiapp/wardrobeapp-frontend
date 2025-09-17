// Main duplicate detection service

import { DUPLICATE_SEVERITY } from './constants';
import {
  findCriticalDuplicates,
  findSimilarItems,
  calculateColorDistribution,
  calculateSilhouetteDistribution
} from './algorithms';
import type {
  ItemData,
  ExistingItem,
  DuplicateDetectionResult,
  DuplicateAnalysis,
  VarietyImpact,
  RecommendationResult
} from './types';

export class DuplicateDetectionService {
  
  /**
   * Main analysis method - analyzes duplicates and variety impact
   */
  analyze(itemData: ItemData, existingItems: ExistingItem[]): DuplicateDetectionResult {
    const duplicateAnalysis = this.analyzeDuplicates(itemData, existingItems);
    const varietyImpact = this.analyzeVarietyImpact(itemData, existingItems);
    const recommendation = this.generateRecommendation(duplicateAnalysis, varietyImpact);
    
    return {
      duplicate_analysis: duplicateAnalysis,
      variety_impact: varietyImpact,
      recommendation
    };
  }
  
  /**
   * Analyze duplicates and similar items
   */
  private analyzeDuplicates(itemData: ItemData, existingItems: ExistingItem[]): DuplicateAnalysis {
    const criticalDuplicates = findCriticalDuplicates(itemData, existingItems);
    const similarItems = findSimilarItems(itemData, existingItems);
    
    const allMatches = [...criticalDuplicates, ...similarItems];
    const totalCount = allMatches.length;
    
    let verdict: DuplicateAnalysis['verdict'] = 'NO_DUPLICATES';
    if (criticalDuplicates.length > 0) {
      verdict = 'CRITICAL_DUPLICATES';
    } else if (similarItems.length > 0) {
      verdict = 'SIMILAR_ITEMS';
    }
    
    return {
      found: totalCount > 0,
      count: totalCount,
      matches: allMatches,
      severity: this.calculateSeverity(criticalDuplicates.length),
      verdict
    };
  }
  
  /**
   * Analyze impact on wardrobe variety
   */
  private analyzeVarietyImpact(itemData: ItemData, existingItems: ExistingItem[]): VarietyImpact {
    const colorDist = calculateColorDistribution(itemData, existingItems);
    const silhouetteDist = calculateSilhouetteDistribution(itemData, existingItems);
    
    // Calculate variety score (0-10)
    const varietyScore = this.calculateVarietyScore(colorDist, silhouetteDist);
    
    // Generate impact message
    const impactMessage = this.generateVarietyMessage(colorDist, silhouetteDist);
    
    return {
      color_distribution: colorDist,
      silhouette_distribution: silhouetteDist,
      variety_score: varietyScore,
      impact_message: impactMessage
    };
  }
  
  /**
   * Calculate severity based on duplicate count
   */
  private calculateSeverity(criticalDuplicateCount: number): DuplicateAnalysis['severity'] {
    if (criticalDuplicateCount === 0) return 'NONE';
    if (criticalDuplicateCount <= DUPLICATE_SEVERITY.MODERATE.max) return 'MODERATE';
    if (criticalDuplicateCount <= DUPLICATE_SEVERITY.HIGH.max) return 'HIGH';
    return 'EXCESSIVE';
  }
  
  /**
   * Calculate variety score (higher = more variety)
   */
  private calculateVarietyScore(colorDist: any, silhouetteDist: any): number {
    let score = 10;
    
    // Reduce score for color dominance
    if (colorDist.is_dominant_color) {
      score -= 3;
    }
    
    // Reduce score for silhouette dominance  
    if (silhouetteDist.is_dominant_silhouette) {
      score -= 3;
    }
    
    // Reduce score based on percentage concentration
    const colorPercentagePenalty = Math.max(0, (colorDist.percentage_of_category - 40) / 10);
    const silhouettePercentagePenalty = Math.max(0, (silhouetteDist.percentage_of_category - 40) / 10);
    
    score -= colorPercentagePenalty + silhouettePercentagePenalty;
    
    return Math.max(0, Math.min(10, Math.round(score)));
  }
  
  /**
   * Generate variety impact message
   */
  private generateVarietyMessage(colorDist: any, silhouetteDist: any): string {
    const messages: string[] = [];
    
    if (colorDist.is_dominant_color) {
      messages.push(`${colorDist.percentage_of_category}% of your ${colorDist.category?.toLowerCase() || 'items'} would be the same color`);
    }
    
    if (silhouetteDist.is_dominant_silhouette) {
      messages.push(`${silhouetteDist.percentage_of_category}% would have the same silhouette`);
    }
    
    if (messages.length === 0) {
      return 'Good variety maintained';
    }
    
    return messages.join(', ');
  }
  
  /**
   * Generate final recommendation
   */
  private generateRecommendation(
    duplicateAnalysis: DuplicateAnalysis, 
    varietyImpact: VarietyImpact
  ): RecommendationResult {
    
    // Critical duplicates = automatic skip
    if (duplicateAnalysis.severity === 'EXCESSIVE') {
      return {
        action: 'SKIP',
        reason: 'EXCESSIVE_DUPLICATION',
        message: `You already have ${duplicateAnalysis.count} very similar items. This would be wasteful.`,
        confidence: 95
      };
    }
    
    if (duplicateAnalysis.severity === 'HIGH' && varietyImpact.variety_score <= 3) {
      return {
        action: 'SKIP',
        reason: 'HIGH_DUPLICATION_LOW_VARIETY',
        message: `This would create too much similarity in your wardrobe. ${varietyImpact.impact_message}`,
        confidence: 88
      };
    }
    
    if (duplicateAnalysis.verdict === 'CRITICAL_DUPLICATES') {
      return {
        action: 'CONSIDER',
        reason: 'MODERATE_DUPLICATION',
        message: `You have ${duplicateAnalysis.count} similar item(s). Consider if this adds meaningful variety.`,
        confidence: 70
      };
    }
    
    if (duplicateAnalysis.verdict === 'SIMILAR_ITEMS' && varietyImpact.variety_score <= 5) {
      return {
        action: 'CONSIDER',
        reason: 'VARIETY_CONCERN',
        message: `This might reduce wardrobe variety. ${varietyImpact.impact_message}`,
        confidence: 65
      };
    }
    
    return {
      action: 'RECOMMEND',
      reason: 'NO_CRITICAL_DUPLICATES',
      message: 'No critical duplicates detected. This could add useful variety.',
      confidence: 80
    };
  }
}
