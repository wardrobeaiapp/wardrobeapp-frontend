/**
 * Database analysis helpers for data processing and fallback analysis
 * Extracted from scenarioCoverageService.js for better modularity
 */

const { getScenarioCoverageForAnalysis } = require('./scenarioCoverageCalculator');
const { ESSENTIAL_COVERAGE_FIELDS } = require('../constants/scenarioCoverageConstants');

/**
 * Filter scenario coverage data to include only essential fields for AI analysis
 * Reduces data size by ~60% while maintaining all information needed for AI analysis
 */
function filterScenarioCoverageData(scenarioCoverage) {
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
 * Analyze using database fallback when frontend doesn't provide coverage data
 * Uses the existing in-memory calculation system as backup
 */
async function analyzeFromDatabase(userId, formData, scenarios, identifyGapsCallback, generatePromptCallback) {
  try {
    console.log('=== DATABASE FALLBACK ANALYSIS - Using in-memory calculation system ===');
    
    // Use the existing in-memory calculation system
    const dbScenarioCoverage = await getScenarioCoverageForAnalysis(userId, formData.seasons);
    
    if (!dbScenarioCoverage || dbScenarioCoverage.length === 0) {
      console.log('⚠️  No scenario coverage data found in database fallback');
      return { promptSection: '', gaps: [], method: 'database_empty' };
    }
    
    // Apply the same filtering and gap analysis as frontend data
    const filteredCoverage = filterScenarioCoverageData(dbScenarioCoverage);
    console.log(`📊 Database fallback processed ${filteredCoverage.length} coverage entries`);
    
    // Use callbacks for gap analysis and prompt generation (main service methods)
    const seasonalGaps = identifyGapsCallback(filteredCoverage, formData);
    const promptSection = generatePromptCallback(seasonalGaps);
    
    return { 
      promptSection, 
      gaps: seasonalGaps,
      method: 'database_fallback',
      dataSource: 'in_memory_calculation'
    };
  } catch (error) {
    console.error('🔴 Failed to get scenario coverage from database fallback:', error);
    return { 
      promptSection: '', 
      gaps: [], 
      method: 'database_failed',
      error: error.message 
    };
  }
}

/**
 * Process and validate frontend-provided coverage data
 * Ensures data consistency and logs analysis method
 */
function processFrontendCoverageData(scenarioCoverage, formData, identifyGapsCallback, generatePromptCallback) {
  console.log('=== FRONTEND DATA ANALYSIS - Using provided coverage data ===');
  
  if (!scenarioCoverage || scenarioCoverage.length === 0) {
    console.log('⚠️  No frontend coverage data provided');
    return { promptSection: '', gaps: [], method: 'frontend_empty' };
  }
  
  // Filter and process the frontend data
  const filteredCoverage = filterScenarioCoverageData(scenarioCoverage);
  console.log(`📊 Frontend data processed ${filteredCoverage.length} coverage entries`);
  
  // Analyze gaps and generate prompts using callbacks
  const seasonalGaps = identifyGapsCallback(filteredCoverage, formData);
  const promptSection = generatePromptCallback(seasonalGaps);
  
  return { 
    promptSection, 
    gaps: seasonalGaps,
    method: 'frontend_provided',
    dataSource: 'client_calculation'
  };
}

/**
 * Validate coverage data quality and log insights
 */
function validateCoverageData(scenarioCoverage, source = 'unknown') {
  if (!scenarioCoverage || !Array.isArray(scenarioCoverage)) {
    console.log(`⚠️  Invalid coverage data from ${source}: not an array`);
    return { isValid: false, issues: ['not_array'] };
  }

  const issues = [];
  const insights = {
    totalEntries: scenarioCoverage.length,
    categories: new Set(),
    scenarios: new Set(),
    seasons: new Set(),
    hasSubcategories: false
  };

  scenarioCoverage.forEach(coverage => {
    if (coverage.category) insights.categories.add(coverage.category);
    if (coverage.scenarioName) insights.scenarios.add(coverage.scenarioName);
    if (coverage.season) insights.seasons.add(coverage.season);
    if (coverage.subcategory) insights.hasSubcategories = true;
    
    // Check for missing essential fields
    if (coverage.currentItems === undefined) issues.push('missing_current_items');
    if (coverage.coveragePercent === undefined) issues.push('missing_coverage_percent');
  });

  console.log(`📋 Coverage Data Validation (${source}):`);
  console.log(`   Entries: ${insights.totalEntries}`);
  console.log(`   Categories: [${Array.from(insights.categories).join(', ')}]`);
  console.log(`   Scenarios: ${insights.scenarios.size} unique`);
  console.log(`   Seasons: [${Array.from(insights.seasons).join(', ')}]`);
  console.log(`   Has Subcategories: ${insights.hasSubcategories ? 'Yes' : 'No'}`);
  
  if (issues.length > 0) {
    console.log(`   ⚠️ Issues: [${issues.join(', ')}]`);
  }

  return {
    isValid: issues.length === 0,
    issues,
    insights
  };
}

module.exports = {
  filterScenarioCoverageData,
  analyzeFromDatabase,
  processFrontendCoverageData,
  validateCoverageData
};
