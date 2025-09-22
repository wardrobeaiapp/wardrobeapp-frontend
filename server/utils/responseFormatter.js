/**
 * Utility functions for formatting and parsing AI analysis responses
 */
class ResponseFormatter {

  /**
   * Parse the Claude response into structured components
   * @param {string} analysisResponse - Raw response from Claude
   * @returns {Object} Parsed response with analysis, score, feedback, finalRecommendation
   */
  parseResponse(analysisResponse) {
    console.log('🔍 Full AI Response:', analysisResponse);
    
    let analysis = analysisResponse;
    let score = 5.0;
    let feedback = "";
    let finalRecommendation = "";
    
    // Look for ANALYSIS section
    const analysisMatch = analysisResponse.match(/ANALYSIS:?\s*([\s\S]*?)(?=SCORE:?|$)/i);
    if (analysisMatch && analysisMatch[1]) {
      analysis = this.formatStructuredAnalysis(analysisMatch[1].trim());
    } else {
      analysis = this.formatStructuredAnalysis(analysisResponse); // Format the full response if no sections found
    }
    
    // Look for SCORE section
    const scoreMatch = analysisResponse.match(/SCORE:?\s*([\d\.]+)/i);
    if (scoreMatch && scoreMatch[1]) {
      score = parseFloat(scoreMatch[1]);
    }
    
    // Look for FEEDBACK section
    const feedbackMatch = analysisResponse.match(/FEEDBACK:?\s*([\s\S]*?)(?=FINAL RECOMMENDATION:?|$)/i);
    if (feedbackMatch && feedbackMatch[1]) {
      feedback = feedbackMatch[1].trim();
    }
    
    // Look for FINAL RECOMMENDATION section
    const finalRecommendationMatch = analysisResponse.match(/FINAL RECOMMENDATION:?\s*([\s\S]*?)(?=$)/i);
    if (finalRecommendationMatch && finalRecommendationMatch[1]) {
      finalRecommendation = finalRecommendationMatch[1].trim();
    }
    
    console.log('FINAL RECOMMENDATION extracted:', finalRecommendation);
    
    return {
      analysis,
      score,
      feedback,
      finalRecommendation
    };
  }

  /**
   * Format structured analysis with proper formatting and icons
   * @param {string} rawAnalysis - Raw analysis text
   * @returns {string} Formatted analysis
   */
  formatStructuredAnalysis(rawAnalysis) {
    let formatted = "";
    
    // Extract PROS section
    const prosMatch = rawAnalysis.match(/PROS:?\s*([\s\S]*?)(?=CONS:?|SUITABLE SCENARIOS:?|COMBINATION SUGGESTIONS:?|$)/i);
    if (prosMatch && prosMatch[1]) {
      const prosText = prosMatch[1].trim();
      formatted += "**PROS:**\n";
      formatted += this.formatListSection(prosText, '✓');
      formatted += "\n";
    }
    
    // Extract CONS section  
    const consMatch = rawAnalysis.match(/CONS:?\s*([\s\S]*?)(?=SUITABLE SCENARIOS:?|COMBINATION SUGGESTIONS:?|$)/i);
    if (consMatch && consMatch[1]) {
      const consText = consMatch[1].trim();
      formatted += "**CONS:**\n";
      formatted += this.formatListSection(consText, '✗');
      formatted += "\n";
    }
    
    // Extract SUITABLE SCENARIOS section
    const scenariosMatch = rawAnalysis.match(/SUITABLE SCENARIOS:?\s*([\s\S]*?)(?=COMBINATION SUGGESTIONS:?|$)/i);
    if (scenariosMatch && scenariosMatch[1]) {
      const scenariosText = scenariosMatch[1].trim();
      formatted += "**SUITABLE SCENARIOS:**\n";
      formatted += this.formatListSection(scenariosText, '🎯');
      formatted += "\n";
    }
    
    // Extract COMBINATION SUGGESTIONS section
    const combinationsMatch = rawAnalysis.match(/COMBINATION SUGGESTIONS:?\s*([\s\S]*?)(?=$)/i);
    if (combinationsMatch && combinationsMatch[1]) {
      const combinationsText = combinationsMatch[1].trim();
      formatted += "**COMBINATION SUGGESTIONS:**\n";
      formatted += this.formatListSection(combinationsText, '👔');
    }
    
    return formatted || rawAnalysis; // Fallback to original if parsing fails
  }

  /**
   * Format a list section with consistent formatting
   * @param {string} sectionText - Section text to format
   * @param {string} icon - Icon to use for list items
   * @param {number} maxItems - Maximum items to show (default 3)
   * @returns {string} Formatted list
   */
  formatListSection(sectionText, icon, maxItems = 3) {
    let formatted = "";
    
    // Look for numbered lists first (1. 2. 3.)
    const numberedPoints = sectionText.match(/\d+\.\s*([^0-9]+?)(?=\d+\.|$)/g);
    if (numberedPoints && numberedPoints.length > 0) {
      numberedPoints.forEach((point, index) => {
        if (index < maxItems) {
          const cleanPoint = point.replace(/^\d+\.\s*/, '').trim();
          formatted += `${icon} ${cleanPoint}\n`;
        }
      });
    } else {
      // Fallback: split by sentences for paragraph text
      const minLength = icon === '🎯' ? 10 : 15; // Shorter minimum for scenarios
      const points = sectionText.split(/[.!]\s+/).filter(p => p.trim().length > minLength);
      points.forEach((point, index) => {
        if (index < maxItems) {
          formatted += `${icon} ${point.trim().replace(/^[-•]\s*/, '')}\n`;
        }
      });
    }
    
    return formatted;
  }

  /**
   * Build the final response object with analysis data
   * @param {Object} parsedResponse - Parsed response from parseResponse
   * @param {Object} analysisData - Additional analysis data (duplicate detection, scenario coverage)
   * @returns {Object} Complete response object
   */
  buildResponse(parsedResponse, analysisData = {}) {
    const responseData = {
      analysis: parsedResponse.analysis,
      score: parsedResponse.score,
      feedback: parsedResponse.feedback,
      finalRecommendation: parsedResponse.finalRecommendation
    };
    
    // Add analysis transparency data
    if (Object.keys(analysisData).length > 0) {
      responseData.analysis_data = analysisData;
    }
    
    return responseData;
  }

  /**
   * Format analysis data for transparency
   * @param {Object} duplicateResult - Duplicate detection result
   * @param {Array} scenarioCoverage - Scenario coverage data
   * @returns {Object} Formatted analysis data
   */
  formatAnalysisData(duplicateResult, scenarioCoverage) {
    const analysisData = {};
    
    // Add duplicate detection data
    if (duplicateResult && duplicateResult.duplicateAnalysis) {
      analysisData.duplicate_detection = {
        method: 'enhanced_algorithmic',
        data: duplicateResult.duplicateAnalysis,
        message: 'Used deterministic duplicate detection algorithms for consistency.'
      };
    }
    
    // Add scenario coverage data
    if (scenarioCoverage) {
      analysisData.scenario_coverage = {
        method: 'coverage_analysis',
        data: scenarioCoverage,
        has_gaps: scenarioCoverage.some && scenarioCoverage.some(scenario => scenario.coverageLevel <= 2),
        message: 'Analyzed wardrobe gaps across all scenarios.'
      };
    }
    
    return analysisData;
  }
}

module.exports = new ResponseFormatter();
