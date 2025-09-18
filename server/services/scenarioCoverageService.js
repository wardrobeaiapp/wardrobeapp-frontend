const { getScenarioCoverageForAnalysis } = require('../utils/scenarioCoverageCalculator');
const {
  addScenarioCoverageSection,
  addGapAnalysisSection
} = require('../utils/promptBuilder');

/**
 * Service for analyzing scenario coverage and identifying wardrobe gaps
 */
class ScenarioCoverageService {

  /**
   * Filter scenario coverage data to include only essential fields for AI analysis
   * @param {Array} scenarioCoverage - Full scenario coverage data
   * @returns {Array} Filtered scenario coverage data with only essential fields
   */
  filterScenarioCoverageData(scenarioCoverage) {
    if (!scenarioCoverage || !Array.isArray(scenarioCoverage)) {
      return [];
    }

    const filteredData = scenarioCoverage.map(coverage => ({
      scenarioName: coverage.scenarioName,
      scenarioFrequency: coverage.scenarioFrequency,
      season: coverage.season,
      category: coverage.category,
      currentItems: coverage.currentItems,
      coveragePercent: coverage.coveragePercent,
      gapCount: coverage.gapCount,
      isCritical: coverage.isCritical,
      categoryRecommendations: coverage.categoryRecommendations
    }));

    console.log(`📊 Scenario coverage data filtered: ${scenarioCoverage.length} items → essential fields only`);
    console.log('Original fields per item:', Object.keys(scenarioCoverage[0] || {}));
    console.log('Filtered fields per item:', Object.keys(filteredData[0] || {}));
    
    return filteredData;
  }

  /**
   * Analyze scenario coverage using provided data or database fallback
   * @param {Array} scenarioCoverage - Frontend provided scenario coverage data
   * @param {Object} formData - Form data including seasons, category, subcategory
   * @param {string} userId - User ID for database fallback
   * @param {Array} scenarios - User scenarios
   * @returns {Object} Analysis results including gaps and prompt sections
   */
  async analyze(scenarioCoverage, formData, userId, scenarios) {
    if (scenarioCoverage && scenarioCoverage.length > 0) {
      console.log('=== SCENARIO COVERAGE ANALYSIS - Using frontend-provided data ===');
      // Filter the data to include only essential fields before analysis
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
   * Analyze scenario coverage from frontend-provided data
   * @param {Array} scenarioCoverage - Frontend scenario coverage data
   * @param {Object} formData - Form data
   * @returns {Object} Analysis results
   */
  analyzeFrontendData(scenarioCoverage, formData) {
    console.log('Frontend scenario coverage analysis:', scenarioCoverage);
    
    const seasonalGaps = this.identifySeasonalGaps(scenarioCoverage, formData);
    const promptSection = this.generateFrontendPromptSection(seasonalGaps);
    
    return { 
      promptSection, 
      gaps: seasonalGaps,
      method: 'frontend'
    };
  }

  /**
   * Analyze scenario coverage from database
   * @param {string} userId - User ID
   * @param {Object} formData - Form data
   * @param {Array} scenarios - User scenarios
   * @returns {Object} Analysis results
   */
  async analyzeFromDatabase(userId, formData, scenarios) {
    const targetSeasons = formData.seasons;
    
    try {
      const dbScenarioCoverage = await getScenarioCoverageForAnalysis(userId, targetSeasons);
      console.log('Production scenario coverage analysis:', dbScenarioCoverage);
      
      let promptSection = addScenarioCoverageSection('', dbScenarioCoverage, scenarios);
      promptSection += addGapAnalysisSection('', dbScenarioCoverage, formData);
      
      return { 
        promptSection, 
        gaps: [], // Gap extraction from DB data could be implemented here
        method: 'database'
      };
    } catch (error) {
      console.error('Failed to get scenario coverage from production system:', error);
      return { promptSection: '', gaps: [], method: 'failed' };
    }
  }

  /**
   * Identify seasonal gaps from scenario coverage data
   * @param {Array} scenarioCoverage - Scenario coverage data
   * @param {Object} formData - Form data
   * @returns {Array} Array of seasonal gaps
   */
  identifySeasonalGaps(scenarioCoverage, formData) {
    const seasonalGaps = [];
    const itemSeasons = formData?.seasons || [];
    
    // Group coverage by scenario and identify gaps
    const coverageByScenario = {};
    scenarioCoverage.forEach(coverage => {
      const key = coverage.scenarioName;
      if (!coverageByScenario[key]) {
        coverageByScenario[key] = [];
      }
      coverageByScenario[key].push(coverage);
    });
    
    // Identify specific seasonal gaps
    Object.entries(coverageByScenario).forEach(([scenarioName, coverages]) => {
      coverages.forEach(coverage => {
        // Check if this season has a gap AND the item is suitable for this season
        const hasGap = coverage.coveragePercent < 60; // Less than 60% = gap
        const itemSuitableForSeason = itemSeasons.includes(coverage.season);
        const itemAppropriateForScenario = this.isItemAppropriateForScenario(
          formData?.category, 
          formData?.subcategory, 
          scenarioName
        );
        
        console.log(`🔍 Gap Analysis: ${scenarioName} ${coverage.season}`);
        console.log(`   Coverage: ${coverage.coveragePercent}%, HasGap: ${hasGap} (< 60%), SeasonMatch: ${itemSuitableForSeason}, ScenarioAppropriate: ${itemAppropriateForScenario}`);
        console.log(`   Item seasons: [${itemSeasons.join(', ')}], Coverage season: ${coverage.season}`);
        
        if (hasGap && itemSuitableForSeason && itemAppropriateForScenario) {
          console.log(`✅ Adding relevant gap: ${scenarioName} ${coverage.season} (${coverage.coveragePercent}%)`);
          seasonalGaps.push({
            scenario: scenarioName,
            season: coverage.season,
            currentCoverage: coverage.coveragePercent,
            frequency: coverage.scenarioFrequency,
            currentItems: coverage.currentItems,
            category: coverage.category
          });
        } else {
          const reason = !hasGap ? 'no gap' : 
                        !itemSuitableForSeason ? 'season mismatch' : 
                        !itemAppropriateForScenario ? 'inappropriate for scenario' : 'unknown';
          console.log(`❌ Not adding gap: ${scenarioName} ${coverage.season} (${reason})`);
        }
      });
    });

    console.log(`📊 Final Seasonal Gaps Detected: ${seasonalGaps.length}`);
    seasonalGaps.forEach(gap => {
      console.log(`   - ${gap.scenario} ${gap.season}: ${gap.currentCoverage}%`);
    });

    return seasonalGaps;
  }

  /**
   * Check if item type is appropriate for scenario
   * @param {string} itemCategory - Item category
   * @param {string} itemSubcategory - Item subcategory
   * @param {string} scenarioName - Scenario name
   * @returns {boolean} Whether the item is appropriate
   */
  isItemAppropriateForScenario(itemCategory, itemSubcategory, scenarioName) {
    const scenario = scenarioName.toLowerCase();
    const category = itemCategory?.toLowerCase();
    const subcategory = itemSubcategory?.toLowerCase();
    
    // Define inappropriate combinations
    const inappropriateCombos = {
      'light outdoor activities': ['heels', 'dress shoes', 'formal shoes'],
      'staying at home': ['heels', 'dress shoes', 'formal shoes'],
      'exercise': ['heels', 'dress shoes', 'formal shoes'],
      'sports': ['heels', 'dress shoes', 'formal shoes'],
      'hiking': ['heels', 'dress shoes', 'formal shoes'],
      'gym': ['heels', 'dress shoes', 'formal shoes']
    };
    
    // Check if this combination is inappropriate
    const inappropriate = inappropriateCombos[scenario];
    if (inappropriate) {
      const isInappropriate = inappropriate.some(badType => 
        subcategory?.includes(badType) || category?.includes(badType)
      );
      return !isInappropriate;
    }
    
    return true; // Default to appropriate if not in inappropriate list
  }

  /**
   * Generate prompt section for frontend scenario coverage data
   * @param {Array} seasonalGaps - Identified seasonal gaps
   * @returns {string} Formatted prompt section
   */
  generateFrontendPromptSection(seasonalGaps) {
    if (seasonalGaps.length === 0) {
      return '';
    }

    let promptSection = `\n\n=== SEASONAL GAP ANALYSIS ===`;
    promptSection += `\nThis item could potentially fill the following seasonal gaps:\n`;
    
    seasonalGaps.forEach(gap => {
      promptSection += `\n• ${gap.scenario} (${gap.frequency}) in ${gap.season}:`;
      promptSection += `\n  - Current coverage: ${gap.currentCoverage}% (${gap.currentItems} items)`;
      promptSection += `\n  - Gap severity: ${gap.currentCoverage < 20 ? 'CRITICAL' : gap.currentCoverage < 40 ? 'HIGH' : 'MODERATE'}`;
    });
    
    promptSection += `\n\n**TARGETED RECOMMENDATION INSTRUCTION:**`;
    promptSection += `\nIn your FINAL RECOMMENDATION, specifically mention ONLY the seasonal gaps listed above.`;
    promptSection += `\nDO NOT mention seasons that are not listed as gaps above.`;
    promptSection += `\nThe gaps to mention are: ${seasonalGaps.map(g => `${g.scenario} in ${g.season}`).join(', ')}.`;
    promptSection += `\nDO NOT add any other seasons beyond what is listed here.`;
    promptSection += `\nExample: "This item would be particularly valuable for your ${seasonalGaps.map(g => `${g.scenario} in ${g.season}`).join(', ')} wardrobe gap${seasonalGaps.length > 1 ? 's' : ''}."`;
    promptSection += `\nBe specific about ONLY the identified gaps and their coverage levels.`;

    return promptSection;
  }
}

module.exports = new ScenarioCoverageService();
