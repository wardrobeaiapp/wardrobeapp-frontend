const { generateOuterwearPromptSection, generateRegularPromptSection } = require('../utils/promptGenerationHelpers');
const {calculateCoveragePercent, hasGap, calculateGapType, getBaseScoreFromGapType, createGapData } = require('../utils/gapAnalysisHelpers');
const { analyzeAccessoryGaps, generateAccessoryPromptSection } = require('../utils/accessoryAnalysisHelpers');
const { analyzeFromDatabase, processFrontendCoverageData, validateCoverageData } = require('../utils/databaseAnalysisHelpers');
const { SEASONAL_OUTERWEAR_TARGETS, GAP_THRESHOLDS, INAPPROPRIATE_SCENARIO_COMBOS } = require('../constants/scenarioCoverageConstants');

/**
 * Refactored service for analyzing scenario coverage and identifying wardrobe gaps
 */
class ScenarioCoverageService {


  /**
   * Main analysis entry point
   */
  async analyze(scenarioCoverage, formData, userId, scenarios, userGoals = []) {
    // Validate input data
    if (scenarioCoverage) {
      validateCoverageData(scenarioCoverage, 'frontend');
    }

    if (scenarioCoverage && scenarioCoverage.length > 0) {
      // Use frontend-provided data
      return processFrontendCoverageData(
        scenarioCoverage, 
        formData,
        (coverage, data) => this.identifySeasonalGaps(coverage, data),
        (gaps) => this.generatePromptSection(gaps, userGoals)
      );
    } else if (userId && formData?.seasons) {
      // Use database fallback
      return analyzeFromDatabase(
        userId, 
        formData, 
        scenarios,
        (coverage, data) => this.identifySeasonalGaps(coverage, data),
        (gaps) => this.generatePromptSection(gaps, userGoals)
      );
    } else {
      console.log('=== SCENARIO COVERAGE ANALYSIS - Skipped (no data provided) ===');
      return { promptSection: '', gaps: [], method: 'skipped' };
    }
  }



  /**
   * Identify seasonal gaps (routes to appropriate analyzer)
   */
  identifySeasonalGaps(scenarioCoverage, formData) {
    const itemSeasons = formData?.seasons || [];
    const category = formData?.category?.toLowerCase();
    const isOuterwear = category === 'outerwear';
    const isAccessory = category === 'accessory';
    
    console.log(`🔍 Gap Analysis for ${category.toUpperCase()} item`);
    console.log(`   Item seasons: [${itemSeasons.join(', ')}], Category: ${formData?.category}`);
    
    if (isOuterwear) {
      return this.analyzeOuterwearGaps(scenarioCoverage, itemSeasons);
    } else if (isAccessory) {
      return analyzeAccessoryGaps(scenarioCoverage, formData, itemSeasons);
    } else {
      return this.analyzeRegularItemGaps(scenarioCoverage, formData, itemSeasons);
    }
  }

  /**
   * Analyze outerwear gaps (season-based)
   */
  analyzeOuterwearGaps(scenarioCoverage, itemSeasons) {
    const seasonalAnalysis = [];
    const seasonalData = this.extractSeasonalOuterwearData(scenarioCoverage);
    
    console.log('📊 Seasonal Outerwear Data:', seasonalData);
    
    itemSeasons.forEach(itemSeason => {
      const seasonData = seasonalData[itemSeason];
      
      if (seasonData) {
        const seasonInfo = this.processSeasonData(seasonData, itemSeason);
        // Always add seasonal info for outerwear - gaps AND oversaturated cases need scoring
        seasonalAnalysis.push(createGapData({ ...seasonInfo, isOuterwear: true }));
      } else {
        // No data - use fallback targets
        const fallbackTarget = SEASONAL_OUTERWEAR_TARGETS[itemSeason] || SEASONAL_OUTERWEAR_TARGETS.default;
        seasonalAnalysis.push(createGapData({
          season: itemSeason,
          currentItems: 0,
          targetMin: fallbackTarget.min,
          targetIdeal: fallbackTarget.ideal,
          targetMax: fallbackTarget.max,
          coveragePercent: 0,
          scenarios: ['All scenarios'],
          isOuterwear: true,
          isCritical: true,
          hasGap: true,
          gapType: 'critical',
          baseScore: 10
        }));
      }
    });
    
    console.log(`📊 Final Outerwear Seasonal Analysis: ${seasonalAnalysis.length}`);
    return seasonalAnalysis;
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
  generatePromptSection(seasonalGaps, userGoals = []) {
    if (seasonalGaps.length === 0) return '';
    
    const isOuterwearAnalysis = seasonalGaps.some(gap => gap.isOuterwearGap);
    const isAccessoryAnalysis = seasonalGaps.some(gap => gap.category === 'accessory' || gap.subcategory);
    
    if (isOuterwearAnalysis) {
      return generateOuterwearPromptSection(seasonalGaps, userGoals);
    } else if (isAccessoryAnalysis) {
      return generateAccessoryPromptSection(seasonalGaps, userGoals);
    } else {
      return generateRegularPromptSection(seasonalGaps, userGoals);
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
    const hasGapResult = hasGap(seasonData.currentItems, seasonData.targetMin, seasonData.targetMax);
    const gapType = calculateGapType(seasonData.currentItems, seasonData.targetMin, seasonData.targetIdeal, seasonData.targetMax);
    const baseScore = getBaseScoreFromGapType(gapType);
    
    // Log single summary of gap analysis results  
    console.log(`🔍 ${gapType.toUpperCase()} ${itemSeason} outerwear: ${seasonData.currentItems}/${seasonData.targetIdeal} items (${coveragePercent.toFixed(1)}%, score: ${baseScore})`);
    
    return {
      season: itemSeason,
      currentItems: seasonData.currentItems,
      targetMin: seasonData.targetMin,
      targetIdeal: seasonData.targetIdeal,
      targetMax: seasonData.targetMax,
      coveragePercent,
      scenarios: seasonData.scenarios,
      hasGap: hasGapResult,
      gapType,
      baseScore
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
    
    // Gap analysis complete - results used below
    
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
