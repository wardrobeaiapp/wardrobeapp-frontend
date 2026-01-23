/**
 * Duplicate Detection Workflow Service
 * 
 * Handles the complete duplicate detection workflow including analysis and prompt generation.
 * Extracted from analyze-simple.js to improve maintainability.
 */

const duplicateDetectionService = require('./duplicateDetectionService');

/**
 * Performs complete duplicate detection workflow
 * 
 * @param {Object} options - Workflow options
 * @param {Object} options.analysisData - Analysis data (form + prefilled data)
 * @param {Array} options.similarContext - Similar items for duplicate comparison
 * @param {Object} options.formData - Original form data for debugging
 * @returns {Object} Duplicate analysis result and prompt section
 */
async function performDuplicateDetectionWorkflow({ analysisData, similarContext, formData }) {
  console.log('=== STEP: Duplicate Detection ===');
  
  // Check if we have similar items in context for duplicate analysis
  console.log('🔍 Similar items available:', similarContext ? `${similarContext.length} items` : 'none');
  console.log('🔍 Target item:', `${formData?.name} (${formData?.category}/${formData?.subcategory})`);
  
  // Enhanced debugging - show category/subcategory matches
  if (similarContext && similarContext.length > 0) {
    const categoryMatches = similarContext.filter(item => 
      item.category?.toLowerCase() === formData.category?.toLowerCase()
    ).length;
    const subcategoryMatches = similarContext.filter(item => 
      item.subcategory?.toLowerCase() === formData.subcategory?.toLowerCase()
    ).length;
    
    console.log(`🔍 Matches found: ${categoryMatches} category, ${subcategoryMatches} subcategory`);
  }
  
  // Use analysis data (form data + pre-filled data) for duplicate detection  
  const duplicateResult = await duplicateDetectionService.analyzeWithFormData(
    analysisData, 
    similarContext
  );
  
  let duplicatePromptSection = '';
  
  // Generate prompt section if duplicates found
  if (duplicateResult) {
    duplicatePromptSection = duplicateDetectionService.generatePromptSection(
      duplicateResult.extractedAttributes, 
      duplicateResult.duplicateAnalysis
    );
    
    console.log('✅ Duplicate analysis completed');
    console.log('   - Duplicates found:', duplicateResult.duplicateAnalysis.duplicate_analysis.found);
    console.log('   - Count:', duplicateResult.duplicateAnalysis.duplicate_analysis.count);
    console.log('   - Severity:', duplicateResult.duplicateAnalysis.duplicate_analysis.severity);
    
    if (duplicateResult.duplicateAnalysis.duplicate_analysis.items?.length > 0) {
      console.log('   - Similar items:', duplicateResult.duplicateAnalysis.duplicate_analysis.items.map(item => item.name || 'Unnamed').join(', '));
    }
  } else {
    console.log('⚠️ Duplicate analysis skipped (insufficient data)');
  }

  return {
    duplicateResult,
    duplicatePromptSection
  };
}

/**
 * Validates input data for duplicate detection workflow
 * 
 * @param {Object} data - Data to validate
 * @returns {boolean} True if data is valid for duplicate detection
 */
function validateDuplicateDetectionData(data) {
  return !!(data.analysisData && data.formData);
}

module.exports = {
  performDuplicateDetectionWorkflow,
  validateDuplicateDetectionData
};
