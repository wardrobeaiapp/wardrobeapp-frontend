/**
 * Extract suitable scenarios from Claude's analysis response
 * @param {string} analysisResponse - Raw response text from Claude
 * @param {array} validScenarios - Array of valid scenario objects to validate against
 * @returns {string[]} Array of suitable scenario names
 */
function extractSuitableScenarios(analysisResponse, validScenarios = []) {
  let suitableScenarios = [];
  
  // Try to match the new equals format first (=== SUITABLE SCENARIOS ===)
  let suitableScenariosMatch = analysisResponse.match(/={3,}\s*SUITABLE SCENARIOS\s*={3,}([\s\S]*?)(?=={3,}.*?={3,}|REASON:?|FINAL RECOMMENDATION:?|SCORE:?|$)/i);
  
  // If that fails, try the original colon format (SUITABLE SCENARIOS:)
  if (!suitableScenariosMatch) {
    suitableScenariosMatch = analysisResponse.match(/SUITABLE SCENARIOS:?\s*([\s\S]*?)(?=REASON:?|FINAL RECOMMENDATION:?|SCORE:?|$)/i);
  }
  
  // Extract scenarios from the designated section
  
  if (suitableScenariosMatch && suitableScenariosMatch[1]) {
    const scenariosText = suitableScenariosMatch[1].trim();
    
    // Only extract scenarios that are explicitly listed as suitable
    // Look for lines that start with numbers, bullets, or dashes followed by scenario names
    // Exclude lines with negative words like "not suitable", "inappropriate", etc.
    const lines = scenariosText.split('\n');
    const negativeWords = /not suitable|inappropriate|doesn't work|poor fit|avoid|skip|unsuitable/i;
    
    for (let line of lines) {
      line = line.trim();
      
      // STRICT FILTERING: Only accept lines that look like numbered scenarios
      // Must start with number followed by period and space: "1. Scenario Name"
      if (/^\d+\.\s+/.test(line) && !negativeWords.test(line)) {
        // Extract scenario name by removing the number prefix
        let scenarioName = line.replace(/^\d+\.\s+/, '').trim();
        
        // Remove any trailing explanations in parentheses or after colons/dashes
        scenarioName = scenarioName.split(/[\(\:\-]/)[0].trim();
        
        // Filter out system messages and analysis text
        const systemWords = /STYLE LEVEL|FORMALITY LEVEL|COLOR|PATTERN|NECKLINE|LAYERING|STATEMENT|CLASSIFICATION|OUTERWEAR|NONE|REASON|FINAL|RECOMMENDATION|SCORE|ANALYSIS|DEBUG|===|---|###/i;
        
        // Only add if it looks like an actual scenario name (not analysis text)
        if (scenarioName && 
            scenarioName.length > 2 && 
            scenarioName.length < 50 && // Scenarios shouldn't be super long
            !systemWords.test(scenarioName) &&
            !/^(this|the|a|an|and|or|but|for|with|has|have|is|are|was|were)/i.test(scenarioName) // Not sentence fragments
        ) {
          // VALIDATE: Only include scenarios that match user's actual scenarios
          if (validScenarios && validScenarios.length > 0) {
            const validScenarioNames = validScenarios.map(s => s.name);
            const matchingScenario = validScenarioNames.find(validName => 
              // Exact match first
              validName.toLowerCase() === scenarioName.toLowerCase() ||
              // Partial match (Claude sometimes shortens or rephrases)
              validName.toLowerCase().includes(scenarioName.toLowerCase()) ||
              scenarioName.toLowerCase().includes(validName.toLowerCase())
            );
            
            if (matchingScenario) {
              // Use the exact scenario name from user's list, not Claude's version
              console.log(`✅ Validated scenario: "${scenarioName}" → "${matchingScenario}"`);
              if (!suitableScenarios.includes(matchingScenario)) {
                suitableScenarios.push(matchingScenario);
              }
            } else {
              console.log(`❌ Rejected non-matching scenario: "${scenarioName}"`);
              console.log(`   Available scenarios: [${validScenarioNames.join(', ')}]`);
            }
          } else {
            // Fallback: no validation scenarios provided, use Claude's names
            suitableScenarios.push(scenarioName);
          }
        }
      }
    }
  }
  
  return suitableScenarios;
}

module.exports = extractSuitableScenarios;
