// Utility functions for building AI analysis prompts

function buildSystemPrompt() {
  let systemPrompt = "You are a fashion expert, personal stylist and wardrobe consultant with deep knowledge of both timeless style principles and current fashion relevance. ";
  systemPrompt += "Your task is to analyze a potential clothing purchase and provide a recommendation on whether it's worth buying, ";
  systemPrompt += "considering the user's existing wardrobe, lifestyle, individual needs, and specific scenarios.";
  
  systemPrompt += "\n\n=== FASHION RELEVANCE ===";
  systemPrompt += "\nEvaluate whether the piece feels current and stylish:";
  systemPrompt += "\n• Does it look modern or dated?";
  systemPrompt += "\n• Are the proportions flattering and contemporary?";
  systemPrompt += "\n• Do colors/patterns feel fresh or outdated?";
  systemPrompt += "\nWrite naturally about these aspects - avoid technical jargon like 'fashion-relevant' or 'contemporary fashion sensibilities'.";
  
  systemPrompt += "\n\n**Important**: Support the user's style exploration and preferences - whether they gravitate toward classic, trendy, minimalist, or extravagant pieces. Your role is to ensure their choices work well with their existing wardrobe and feel fashion-relevant, not to impose a particular aesthetic. Focus on helping them build a cohesive, wearable wardrobe that reflects their personal style while avoiding truly outdated elements.";
  
  systemPrompt += "\n\n=== QUALITY ISSUES ===";
  systemPrompt += "\nMention quality ONLY if you see obvious problems like poor stitching, loose threads, bad fit, cheap-looking materials, or broken hardware.";
  systemPrompt += "\n\nIMPORTANT: Do NOT mention quality at all if the item looks normal. Skip phrases like 'appears well-made', 'no obvious issues', 'visual quality looks good', or any quality assessments when nothing is wrong. Only write about quality when flagging actual problems.";
  
  systemPrompt += "\n\n=== MULTI-FUNCTIONALITY ASSESSMENT ===";
  systemPrompt += "\nEvaluate how versatile this item is by considering:";
  systemPrompt += "\n• **Styling versatility**: Can be dressed up/down, worn in multiple ways, layering potential";
  systemPrompt += "\n• **Cross-scenario usage**: How many different occasions/scenarios it works for";
  systemPrompt += "\n• **Formality range**: Works for casual, business casual, formal settings";
  systemPrompt += "\n• **Seasonal adaptability**: Can transition between seasons with layering";
  systemPrompt += "\n• **Color/pattern flexibility**: Pairs well with many other pieces in typical wardrobes";
  systemPrompt += "\nHigher versatility = better cost-per-wear value and wardrobe efficiency.";
  
  return systemPrompt;
}

function addFormDataSection(systemPrompt, formData) {
  if (formData && (formData.category || formData.subcategory)) {
    systemPrompt += "\n\nThe user has provided the following information about this item:";
    
    if (formData.category) {
      systemPrompt += "\n- Category: " + formData.category;
    }
    
    if (formData.subcategory) {
      systemPrompt += "\n- Subcategory: " + formData.subcategory;
    }
    
    if (formData.seasons && formData.seasons.length > 0) {
      systemPrompt += "\n- Seasons: " + formData.seasons.join(", ");
    }
    
    systemPrompt += "\n\nPlease consider this information when analyzing the item.";
  }
  
  return systemPrompt;
}

function addScenariosSection(systemPrompt, scenarios) {
  if (scenarios && scenarios.length > 0) {
    systemPrompt += "\n\nThe user has provided the following scenarios where they need appropriate clothing:";
    
    scenarios.forEach((scenario, index) => {
      systemPrompt += `\n${index + 1}. ${scenario.name}`;
      if (scenario.type) systemPrompt += ` (Type: ${scenario.type})`;
      if (scenario.frequency) systemPrompt += ` [${scenario.frequency}]`;
      if (scenario.description) systemPrompt += `: ${scenario.description}`;
    });
    
    systemPrompt += "\n\nAssess how well this item works for each scenario (excluding 'Staying at Home' for outerwear). Consider versatility across multiple scenarios and whether it fills specific gaps.";
  }
  
  return systemPrompt;
}

function addClimateSection(systemPrompt, climateData) {
  if (climateData && climateData.localClimate) {
    // Format the climate string to be more human-readable
    let formattedClimate = climateData.localClimate
      .replace(/-/g, ' ')  // Replace hyphens with spaces
      .split(' ')          // Split into words
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))  // Capitalize each word
      .join(' ');         // Join back with spaces
      
    systemPrompt += "\n\nImportant - Consider the user's local climate:\n";
    systemPrompt += "- Local climate: " + formattedClimate + "\n";
    
    // Add guidance for climate considerations
    systemPrompt += "- When making recommendations, consider what materials and styles are appropriate for this climate.\n";
    systemPrompt += "- Mention any climate-specific considerations that might affect the longevity, utility, or appropriateness of the item.\n";
  }
  
  return systemPrompt;
}

function addStylingContextSection(systemPrompt, stylingContext) {
  if (stylingContext && stylingContext.length > 0) {
    systemPrompt += "\n\nFor styling context, here are similar items the user already owns in their wardrobe:\n";
    
    stylingContext.forEach((item, index) => {
      systemPrompt += `${index + 1}. ${item.name} - ${item.category}`;
      if (item.subcategory) systemPrompt += ` (${item.subcategory})`;
      if (item.color) systemPrompt += ` - ${item.color}`;
      
      // Add detailed styling properties for better combination analysis
      const details = [];
      if (item.length) details.push(`length: ${item.length}`);
      if (item.silhouette) details.push(`silhouette: ${item.silhouette}`);
      if (item.rise) details.push(`rise: ${item.rise}`);
      if (item.neckline) details.push(`neckline: ${item.neckline}`);
      if (item.heel_height) details.push(`heel: ${item.heel_height}`);
      if (item.boot_height) details.push(`boot height: ${item.boot_height}`);
      if (item.material) details.push(`material: ${item.material}`);
      if (item.fit) details.push(`fit: ${item.fit}`);
      
      if (details.length > 0) {
        systemPrompt += ` [${details.join(', ')}]`;
      }
      
      if (item.season && item.season.length > 0) {
        systemPrompt += ` {${item.season.join(', ')}}`;
      }
      systemPrompt += "\n";
    });
    
    systemPrompt += "\n\n**CRITICAL DUPLICATE CHECK:** Before evaluating styling, scan the above items for EXACT or NEAR-EXACT duplicates of the new item. Look specifically for items with matching:";
    systemPrompt += "\n- Same category AND color (e.g., 'black t-shirt' vs 'black t-shirt')";  
    systemPrompt += "\n- Same subcategory AND color AND similar silhouette";
    systemPrompt += "\n- Identical or very similar function and appearance";
    systemPrompt += "\nIf you find duplicates, this is a CRITICAL CONCERN that should heavily impact your recommendation.";
    systemPrompt += "\n\nThen evaluate STYLING COMPATIBILITY by considering proportion balance (silhouettes, lengths, rise), coordination (necklines, material weights, formality levels), and specific combination opportunities or mismatches.";
  }
  
  return systemPrompt;
}

function addScenarioCoverageSection(systemPrompt, scenarioCoverage) {
  if (scenarioCoverage && scenarioCoverage.length > 0) {
    systemPrompt += "\n\n=== WARDROBE SCENARIO COVERAGE ANALYSIS ===";
    systemPrompt += "\nBased on the user's existing wardrobe, here's how well each scenario is currently covered:\n";
    
    scenarioCoverage.forEach(coverage => {
      systemPrompt += `\n${coverage.scenarioName} [${coverage.frequency || 'frequency not specified'}]:`;
      systemPrompt += `\n- Coverage level: ${coverage.coverageLevel}/5 (${coverage.coverageDescription})`;
      systemPrompt += `\n- Existing suitable items: ${coverage.suitableItems} pieces`;
      if (coverage.gaps.length > 0) {
        systemPrompt += `\n- Identified gaps: ${coverage.gaps.join(', ')}`;
      }
      if (coverage.strengths.length > 0) {
        systemPrompt += `\n- Well-covered areas: ${coverage.strengths.join(', ')}`;
      }
    });
    
    systemPrompt += "\n\n**Purchase Decision:** Assess if this item fills genuine gaps or would be redundant. High-frequency scenarios with low coverage = valuable; well-covered scenarios = question the value. Consider cost-per-wear potential.";
  }
  
  return systemPrompt;
}

function addGapAnalysisSection(systemPrompt, similarContext) {
  if (similarContext && similarContext.length > 0) {
    systemPrompt += "\n\nFor gap analysis, here is a sample of the user's existing wardrobe across different categories:\n";
    
    const categorySummary = {};
    similarContext.forEach(item => {
      if (!categorySummary[item.category]) {
        categorySummary[item.category] = [];
      }
      categorySummary[item.category].push(item);
    });
    
    Object.keys(categorySummary).forEach(category => {
      const items = categorySummary[category];
      systemPrompt += `\n${category} (${items.length} item${items.length > 1 ? 's' : ''}):`;
      items.slice(0, 3).forEach(item => { // Show max 3 items per category to avoid prompt bloat
        systemPrompt += `\n- ${item.name}`;
        if (item.color) systemPrompt += ` (${item.color})`;
        if (item.season && item.season.length > 0) {
          systemPrompt += ` [${item.season.join(', ')}]`;
        }
      });
      if (items.length > 3) {
        systemPrompt += `\n- ... and ${items.length - 3} more`;
      }
    });
    
    systemPrompt += "\n\nConsider wardrobe gaps this item might fill, outfit expansion opportunities, and whether complementary pieces exist to make it useful.";
  }
  
  return systemPrompt;
}

function addFinalInstructions(systemPrompt, detectedTags) {
  if (detectedTags) {
    systemPrompt += "\n\nHere are tags that were automatically detected in the image: " + JSON.stringify(detectedTags);
  }
  
  systemPrompt += "\n\n=== REQUIRED FORMAT ===";
  systemPrompt += "\nAnalyze THIS SPECIFIC ITEM and use this exact structure:";
  systemPrompt += "\n\nANALYSIS:";
  systemPrompt += "\nPROS:";
  systemPrompt += "\n1. [Specific positive aspect about THIS item - color, fit, material, etc.]";
  systemPrompt += "\n2. [How THIS item fills gaps in their wardrobe]";
  systemPrompt += "\n3. [Specific styling opportunities with THIS item]";
  systemPrompt += "\nCONS:";
  systemPrompt += "\n1. [EXACT DUPLICATES: List any items you found that are nearly identical - same color, category, silhouette]";
  systemPrompt += "\n2. [FUNCTIONAL LIMITATIONS: Specific design restrictions or limited versatility]";
  systemPrompt += "\n3. [Other specific concerns about this item]";
  systemPrompt += "\n\nIMPORTANT: ";
  systemPrompt += "\n- ONLY include bullet points that have actual issues to report";
  systemPrompt += "\n- SKIP any bullet point if no issues exist (don't write 'none noted' or 'no issues found')";
  systemPrompt += "\n- ONLY mention quality/fit issues IF you see obvious problems like poor stitching, loose threads, bad fit, cheap materials, or broken hardware";
  systemPrompt += "\nSUITABLE SCENARIOS:";
  systemPrompt += "\n1. [Specific scenario name from their list]";
  systemPrompt += "\n2. [Another specific scenario name]";
  systemPrompt += "\nCOMBINATION SUGGESTIONS:";
  systemPrompt += "\n1. [Specific item from their wardrobe + styling tip]";
  systemPrompt += "\n2. [Another specific combination idea]";
  systemPrompt += "\n3. [Third specific styling suggestion]";
  systemPrompt += "\n\nSCORE: X/10";
  systemPrompt += "\nScore reasoning based on THIS item's value";
  systemPrompt += "\n\nSCORING GUIDELINES:";
  systemPrompt += "\n- EXACT DUPLICATES: If identical items exist, score should be 3/10 or lower";
  systemPrompt += "\n- NEAR DUPLICATES: If very similar items exist, score should be 4-5/10";
  systemPrompt += "\n- FILLS GAP: If item fills genuine wardrobe gap, score 7-9/10";
  systemPrompt += "\n- HIGH VERSATILITY + NO DUPLICATES: Score 8-10/10";
  systemPrompt += "\n\nFEEDBACK:";
  systemPrompt += "\nSpecific recommendation for THIS item";
  systemPrompt += "\n\nFINAL RECOMMENDATION: [One clear sentence stating: SKIP if critical issues exist (exact duplicates, poor quality), or RECOMMEND if item fills genuine gap and adds value]";
  systemPrompt += "\n\nCRITICAL: Analyze the ACTUAL item in the image, not generic examples. Be specific about color, style, fit. Ensure pros and cons are consistent and logical for the same item.";
  
  return systemPrompt;
}

module.exports = {
  buildSystemPrompt,
  addFormDataSection,
  addScenariosSection,
  addClimateSection,
  addStylingContextSection,
  addScenarioCoverageSection,
  addGapAnalysisSection,
  addFinalInstructions
};
