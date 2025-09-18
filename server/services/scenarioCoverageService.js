const { getScenarioCoverageForAnalysis } = require('../utils/scenarioCoverageCalculator');
const { addScenarioCoverageSection, addGapAnalysisSection } = require('../utils/promptBuilder');
const { generateOuterwearPromptSection, generateRegularPromptSection } = require('../utils/promptGenerationHelpers');
const { calculateGapSeverity, calculateCoveragePercent, hasGap, createGapData, logGapAnalysis } = require('../utils/gapAnalysisHelpers');
const { SEASONAL_OUTERWEAR_TARGETS, GAP_THRESHOLDS, INAPPROPRIATE_SCENARIO_COMBOS, ESSENTIAL_COVERAGE_FIELDS } = require('../constants/scenarioCoverageConstants');

/**
 * Refactored service for analyzing scenario coverage and identifying wardrobe gaps
 */
class ScenarioCoverageService {

  /**
   * Filter scenario coverage data to include only essential fields for AI analysis
   */
  filterScenarioCoverageData(scenarioCoverage) {
    if (!scenarioCoverage || !Array.isArray(scenarioCoverage)) return [];

    const filteredData = scenarioCoverage.map(coverage => {
      const filtered = {};
      ESSENTIAL_COVERAGE_FIELDS.forEach(field => {
        if (coverage[field] !== undefined) filtered[field] = coverage[field];
      });
      return filtered;
    });

    console.log(`📊 Scenario coverage data filtered: ${scenarioCoverage.length} items → essential fields only`);
    return filteredData;
  }

  /**
   * Main analysis entry point
   */
  async analyze(scenarioCoverage, formData, userId, scenarios) {
    if (scenarioCoverage && scenarioCoverage.length > 0) {
      console.log('=== SCENARIO COVERAGE ANALYSIS - Using frontend-provided data ===');
      const filteredCoverage = this.filterScenarioCoverageData(scenarioCoverage);
      return this.analyzeFrontendData(filteredCoverage, formData);
    } else if (userId && formData?.seasons) {
      console.log('=== SCENARIO COVERAGE ANALYSIS - Using production system fallback ===');
      return this.analyzeFromDatabase(userId, formData, scenarios);
    } else {
      console.log('=== SCENARIO COVERAGE ANALYSIS - Skipped (no data provided) ===');
      return { promptSection: '', gaps: [] };
    }
  }

  /**
   * Analyze using frontend data
   */
  analyzeFrontendData(scenarioCoverage, formData) {
    const seasonalGaps = this.identifySeasonalGaps(scenarioCoverage, formData);
    const promptSection = this.generatePromptSection(seasonalGaps);
    
    return { 
      promptSection, 
      gaps: seasonalGaps,
      method: 'frontend'
    };
  }

  /**
   * Analyze using database fallback
   */
  async analyzeFromDatabase(userId, formData, scenarios) {
    try {
      const dbScenarioCoverage = await getScenarioCoverageForAnalysis(userId, formData.seasons);
      let promptSection = addScenarioCoverageSection('', dbScenarioCoverage, scenarios);
      promptSection += addGapAnalysisSection('', dbScenarioCoverage, formData);
      
      return { 
        promptSection, 
        gaps: [], 
        method: 'database'
      };
    } catch (error) {
      console.error('Failed to get scenario coverage from production system:', error);
      return { promptSection: '', gaps: [], method: 'failed' };
    }
  }

  /**
   * Identify seasonal gaps (routes to appropriate analyzer)
   */
  identifySeasonalGaps(scenarioCoverage, formData) {
    const itemSeasons = formData?.seasons || [];
    const isOuterwear = formData?.category?.toLowerCase() === 'outerwear';
    
    console.log(`🔍 Gap Analysis for ${isOuterwear ? 'OUTERWEAR' : 'NON-OUTERWEAR'} item`);
    console.log(`   Item seasons: [${itemSeasons.join(', ')}], Category: ${formData?.category}`);
    
    if (isOuterwear) {
      return this.analyzeOuterwearGaps(scenarioCoverage, itemSeasons);
    } else {
      return this.analyzeRegularItemGaps(scenarioCoverage, formData, itemSeasons);
    }
  }

  /**
   * Analyze outerwear gaps (season-based)
   */
  analyzeOuterwearGaps(scenarioCoverage, itemSeasons) {
    const seasonalGaps = [];
    const seasonalData = this.extractSeasonalOuterwearData(scenarioCoverage);
    
    console.log('📊 Seasonal Outerwear Data:', seasonalData);
    
    itemSeasons.forEach(itemSeason => {
      const seasonData = seasonalData[itemSeason];
      
      if (seasonData) {
        const gapInfo = this.processSeasonData(seasonData, itemSeason);
        if (gapInfo.hasGap) {
          seasonalGaps.push(createGapData({ ...gapInfo, isOuterwear: true }));
        }
      } else {
        // No data - use fallback targets
        const fallbackTarget = SEASONAL_OUTERWEAR_TARGETS[itemSeason] || SEASONAL_OUTERWEAR_TARGETS.default;
        seasonalGaps.push(createGapData({
          season: itemSeason,
          currentItems: 0,
          targetMin: fallbackTarget.min,
          targetIdeal: fallbackTarget.ideal,
          targetMax: fallbackTarget.max,
          coveragePercent: 0,
          scenarios: ['All scenarios'],
          isOuterwear: true,
          isCritical: true
        }));
      }
    });
    
    this.logFinalGaps('Outerwear', seasonalGaps);
    return seasonalGaps;
  }

  /**
   * Analyze regular item gaps (scenario-based)
   */
  analyzeRegularItemGaps(scenarioCoverage, formData, itemSeasons) {
    const seasonalGaps = [];
    const coverageByScenario = this.groupCoverageByScenario(scenarioCoverage);
    
    Object.entries(coverageByScenario).forEach(([scenarioName, coverages]) => {
      coverages.forEach(coverage => {
        const gapCheck = this.checkRegularItemGap(coverage, formData, itemSeasons, scenarioName);
        
        if (gapCheck.shouldAdd) {
          seasonalGaps.push(createGapData({
            scenario: scenarioName,
            season: coverage.season,
            coveragePercent: coverage.coveragePercent,
            frequency: coverage.scenarioFrequency,
            currentItems: coverage.currentItems,
            category: coverage.category,
            isOuterwear: false
          }));
        }
      });
    });
    
    this.logFinalGaps('Regular', seasonalGaps);
    return seasonalGaps;
  }

  /**
   * Generate appropriate prompt section
   */
  generatePromptSection(seasonalGaps) {
    if (seasonalGaps.length === 0) return '';
    
    const isOuterwearAnalysis = seasonalGaps.some(gap => gap.isOuterwearGap);
    
    if (isOuterwearAnalysis) {
      return generateOuterwearPromptSection(seasonalGaps);
    } else {
      return generateRegularPromptSection(seasonalGaps);
    }
  }

  // === HELPER METHODS ===

  extractSeasonalOuterwearData(scenarioCoverage) {
    const seasonalData = {};
    
    scenarioCoverage.forEach(coverage => {
      if (coverage.category?.toLowerCase() === 'outerwear') {
        seasonalData[coverage.season] = {
          season: coverage.season,
          currentItems: coverage.currentItems || 0,
          targetMin: coverage.neededItemsMin || 0,
          targetIdeal: coverage.neededItemsIdeal || 0,
          targetMax: coverage.neededItemsMax || 0,
          scenarios: ['All scenarios'],
          scenarioName: coverage.scenarioName
        };
      }
    });
    
    return seasonalData;
  }

  processSeasonData(seasonData, itemSeason) {
    const coveragePercent = calculateCoveragePercent(seasonData.currentItems, seasonData.targetIdeal);
    const hasGapResult = hasGap(seasonData.currentItems, seasonData.targetMin);
    
    logGapAnalysis('outerwear', itemSeason, null, {
      currentItems: seasonData.currentItems,
      targetMin: seasonData.targetMin,
      targetIdeal: seasonData.targetIdeal,
      hasGap: hasGapResult,
      coveragePercent
    });
    
    return {
      season: itemSeason,
      currentItems: seasonData.currentItems,
      targetMin: seasonData.targetMin,
      targetIdeal: seasonData.targetIdeal,
      targetMax: seasonData.targetMax,
      coveragePercent,
      scenarios: seasonData.scenarios,
      hasGap: hasGapResult
    };
  }

  groupCoverageByScenario(scenarioCoverage) {
    const coverageByScenario = {};
    scenarioCoverage.forEach(coverage => {
      const key = coverage.scenarioName;
      if (!coverageByScenario[key]) coverageByScenario[key] = [];
      coverageByScenario[key].push(coverage);
    });
    return coverageByScenario;
  }

  checkRegularItemGap(coverage, formData, itemSeasons, scenarioName) {
    const hasGapResult = hasGap(null, null, coverage.coveragePercent, GAP_THRESHOLDS.COVERAGE_THRESHOLD);
    const itemSuitableForSeason = itemSeasons.includes(coverage.season);
    const itemAppropriateForScenario = this.isItemAppropriateForScenario(
      formData?.category, 
      formData?.subcategory, 
      scenarioName
    );
    
    logGapAnalysis('regular', scenarioName, coverage.season, {
      coveragePercent: coverage.coveragePercent,
      hasGap: hasGapResult,
      seasonMatch: itemSuitableForSeason,
      scenarioAppropriate: itemAppropriateForScenario
    });
    
    const shouldAdd = hasGapResult && itemSuitableForSeason && itemAppropriateForScenario;
    
    if (shouldAdd) {
      console.log(`✅ Adding relevant gap: ${scenarioName} ${coverage.season} (${coverage.coveragePercent}%)`);
    } else {
      const reason = !hasGapResult ? 'no gap' : 
                    !itemSuitableForSeason ? 'season mismatch' : 
                    !itemAppropriateForScenario ? 'inappropriate for scenario' : 'unknown';
      console.log(`❌ Not adding gap: ${scenarioName} ${coverage.season} (${reason})`);
    }
    
    return { shouldAdd };
  }

  /**
   * Check if item type is appropriate for scenario
   */
  isItemAppropriateForScenario(itemCategory, itemSubcategory, scenarioName) {
    const scenario = scenarioName.toLowerCase();
    const category = itemCategory?.toLowerCase();
    const subcategory = itemSubcategory?.toLowerCase();
    
    const inappropriate = INAPPROPRIATE_SCENARIO_COMBOS[scenario];
    if (inappropriate) {
      const isInappropriate = inappropriate.some(badType => 
        subcategory?.includes(badType) || category?.includes(badType)
      );
      return !isInappropriate;
    }
    
    return true; // Default to appropriate if not in inappropriate list
  }

  logFinalGaps(type, seasonalGaps) {
    console.log(`📊 Final ${type} Seasonal Gaps: ${seasonalGaps.length}`);
    seasonalGaps.forEach(gap => {
      if (gap.isOuterwearGap) {
        console.log(`   - ${gap.season}: ${gap.currentItems}/${gap.targetIdeal} items (${gap.coveragePercent.toFixed(1)}%)`);
      } else {
        console.log(`   - ${gap.scenario} ${gap.season}: ${gap.currentCoverage}%`);
      }
    });
  }
}

module.exports = new ScenarioCoverageService();
