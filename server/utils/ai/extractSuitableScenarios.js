/**
 * Extract suitable scenarios from Claude's analysis response
 * @param {string} analysisResponse - Raw response text from Claude
 * @returns {string[]} Array of suitable scenario names
 */
function extractSuitableScenarios(analysisResponse) {
  let suitableScenarios = [];
  
  const suitableScenariosMatch = analysisResponse.match(/SUITABLE SCENARIOS:?\s*([\s\S]*?)(?=REASON:?|FINAL RECOMMENDATION:?|SCORE:?|$)/i);
  if (suitableScenariosMatch && suitableScenariosMatch[1]) {
    const scenariosText = suitableScenariosMatch[1].trim();
    
    // Only extract scenarios that are explicitly listed as suitable
    // Look for lines that start with numbers, bullets, or dashes followed by scenario names
    // Exclude lines with negative words like "not suitable", "inappropriate", etc.
    const lines = scenariosText.split('\n');
    const negativeWords = /not suitable|inappropriate|doesn't work|poor fit|avoid|skip|unsuitable/i;
    
    for (let line of lines) {
      line = line.trim();
      if (line && !negativeWords.test(line)) {
        // Extract scenario name by removing leading numbers, bullets, dashes
        let scenarioName = line.replace(/^[\d+\.\-\•\*\s]+/, '').trim();
        
        // Remove any trailing explanations in parentheses or after colons/dashes
        scenarioName = scenarioName.split(/[\(\:\-]/)[0].trim();
        
        if (scenarioName && scenarioName.length > 2) {
          suitableScenarios.push(scenarioName);
        }
      }
    }
  }
  
  return suitableScenarios;
}

module.exports = extractSuitableScenarios;
