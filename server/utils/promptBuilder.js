// Utility functions for building AI analysis prompts

function buildSystemPrompt() {
  let systemPrompt = "🚨 CRITICAL SCORING RULE: Your final score MUST exactly match the Base Score provided in the gap analysis section. If gap type is 'oversaturated' with Base Score 3, you MUST give score 3. If gap type is 'critical' with Base Score 10, you MUST give score 10. DO NOT adjust scores for style, quality, or personal preference - use ONLY the provided Base Score. ";
  systemPrompt += "\n\nYou are a financial advisor and wardrobe consultant. Your job is to prevent wasteful spending on TRUE duplicates while recognizing GENUINE gaps that justify purchases. ";
  systemPrompt += "Base your analysis ONLY on the data provided to you - never assume or make up items that aren't explicitly mentioned. ";
  systemPrompt += "If a user has 0-1 items for a high-frequency scenario, that's usually a genuine gap worth filling, not to be overly strict.";
  
  systemPrompt += "\n\n=== YOUR MINDSET ===";
  systemPrompt += "\n• Base ALL duplicate assessments on the algorithmic analysis provided - NEVER guess what items exist";
  systemPrompt += "\n• RECOGNIZE genuine gaps";
  systemPrompt += "\n• UNDERSTAND that different colors/subcategories are NOT duplicates (white tee ≠ black tee, sandals ≠ heels)";
  systemPrompt += "\n• BALANCE financial prudence with practical wardrobe needs";
  systemPrompt += "\n• Consider cost-per-wear and scenario frequency - daily use justifies purchases";
  systemPrompt += "\n• Don't reject items that fill obvious gaps in high-frequency scenarios";
  systemPrompt += "\n\n🚫 CRITICAL: Do NOT mention specific items like 'burgundy cardigan' or 'black leather jacket' UNLESS they appear in the provided duplicate analysis data. Only reference items that are explicitly listed in the algorithmic analysis sections.";
  
  systemPrompt += "\n\n=== FASHION RELEVANCE ===";
  systemPrompt += "\nEvaluate whether the piece feels current and stylish:";
  systemPrompt += "\n• Does it look modern or dated?";
  systemPrompt += "\n• Are the proportions flattering and contemporary?";
  systemPrompt += "\n• Do colors/patterns feel fresh or outdated?";
  systemPrompt += "\nBut REMEMBER: even if it's fashionable, if they don't NEED it, recommend SKIP.";
  
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

function addFormDataSection(systemPrompt, formData, preFilledData) {
  if (preFilledData) {
    // Handle wishlist items with pre-filled data
    systemPrompt += "\n\n=== WISHLIST ITEM - VERIFY/CONFIRM EXISTING DATA ===";
    systemPrompt += "\nThis item was selected from the user's wishlist and already has information filled in.";
    systemPrompt += "\nYour job is to CONFIRM if these details are accurate or CORRECT them based on what you see in the image:";
    
    // Only include descriptive fields that the AI can verify from the image
    // Exclude metadata like imageUrl, id, userId, dateAdded, imageExpiry, etc.
    if (preFilledData.name) systemPrompt += `\n- Name: ${preFilledData.name}`;
    if (preFilledData.category) systemPrompt += `\n- Category: ${preFilledData.category}`;
    if (preFilledData.subcategory) systemPrompt += `\n- Subcategory: ${preFilledData.subcategory}`;
    if (preFilledData.color) systemPrompt += `\n- Color: ${preFilledData.color}`;
    if (preFilledData.style || preFilledData.silhouette) systemPrompt += `\n- Style: ${preFilledData.style || preFilledData.silhouette}`;
    if (preFilledData.fit) systemPrompt += `\n- Fit: ${preFilledData.fit}`;
    if (preFilledData.material) systemPrompt += `\n- Material: ${preFilledData.material}`;
    if (preFilledData.pattern) systemPrompt += `\n- Pattern: ${preFilledData.pattern}`;
    if (preFilledData.length) systemPrompt += `\n- Length: ${preFilledData.length}`;
    if (preFilledData.sleeves) systemPrompt += `\n- Sleeves: ${preFilledData.sleeves}`;
    if (preFilledData.rise) systemPrompt += `\n- Rise: ${preFilledData.rise}`;
    if (preFilledData.neckline) systemPrompt += `\n- Neckline: ${preFilledData.neckline}`;
    if (preFilledData.heelHeight) systemPrompt += `\n- Heel Height: ${preFilledData.heelHeight}`;
    if (preFilledData.bootHeight) systemPrompt += `\n- Boot Height: ${preFilledData.bootHeight}`;
    if (preFilledData.brand) systemPrompt += `\n- Brand: ${preFilledData.brand}`;
    if (preFilledData.size) systemPrompt += `\n- Size: ${preFilledData.size}`;
    if (preFilledData.season && preFilledData.season.length > 0) {
      systemPrompt += `\n- Seasons: ${preFilledData.season.join(", ")}`;
    }
    
    // Note: Explicitly NOT including metadata fields like:
    // - imageUrl (AI already has the image)
    // - id, userId (not descriptive of the item)
    // - dateAdded, imageExpiry (timestamps irrelevant for analysis)
    // - wishlist status (not about the item itself)
    
    systemPrompt += "\n\nSince this data already exists, focus your analysis on validation and any corrections needed.";
    systemPrompt += "\nIf the pre-filled data is mostly accurate, you can reference it in your analysis.";
    
  } else if (formData && (formData.category || formData.subcategory)) {
    // Handle regular items with basic form data
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
    // DEBUG: Log the styling context items being passed to AI
    console.log('=== DEBUG: STYLING CONTEXT ITEMS BEING SENT TO AI ===');
    stylingContext.forEach((item, index) => {
      console.log(`${index + 1}. ${item.name} - ${item.category} (${item.subcategory}) - COLOR: ${item.color}`);
    });
    console.log('================================================');
    
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
    
    systemPrompt += "\n\nUse these items to suggest specific outfit combinations and styling possibilities with the new item.";
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
    
    systemPrompt += "\n\n**Purchase Decision - FREQUENCY IS CRITICAL:**";
    systemPrompt += "\n**PRIORITY ORDER (most to least important):**";
    systemPrompt += "\n1. **DAILY/WEEKLY + LOW COVERAGE (0-2/5)** = HIGHEST PRIORITY - Major gap in frequent scenarios";
    systemPrompt += "\n2. **DAILY/WEEKLY + MEDIUM COVERAGE (3/5)** = HIGH PRIORITY - Room for improvement in frequent scenarios"; 
    systemPrompt += "\n3. **MONTHLY + LOW COVERAGE (0-2/5)** = MEDIUM PRIORITY - Gap in occasional scenarios";
    systemPrompt += "\n4. **RARELY/NEVER + ANY COVERAGE** = LOWEST PRIORITY - Infrequent scenarios don't justify purchases";
    systemPrompt += "\n5. **ANY FREQUENCY + HIGH COVERAGE (4-5/5)** = SKIP - Already well-equipped";
    systemPrompt += "\n\n**DECISION MATRIX:** An item that fills gaps in DAILY scenarios is worth 10x more than one for RARELY scenarios. Cost-per-wear calculation: Daily use = 365 wears/year, Weekly = 52 wears/year, Monthly = 12 wears/year, Rarely = 1-2 wears/year.";
    systemPrompt += "\n\n**CRITICAL - RECOGNIZE GENUINE GAPS:**";
    systemPrompt += "\n• If scenario has 0-1 suitable items AND is high-frequency (daily/weekly) → LIKELY RECOMMEND";
    systemPrompt += "\n• If you see few/no similar items in context → Gap exists, don't fabricate overlaps";  
    systemPrompt += "\n• Don't reject items that clearly fill obvious functional gaps";
    systemPrompt += "\n• Only be strict about REAL duplicates, not imaginary ones";
    systemPrompt += "\n• Different subcategories (heels vs sandals vs boots) are NOT duplicates even in same category";
  }
  
  return systemPrompt;
}

function addGapAnalysisSection(systemPrompt, similarContext) {
  if (similarContext && similarContext.length > 0) {
    systemPrompt += "\n\n=== DUPLICATE CHECK - MANDATORY TASK ===";
    systemPrompt += "\nHere are items from the SAME category and subcategory in your wardrobe. YOU MUST CHECK FOR EXACT DUPLICATES:\n";
    systemPrompt += "\n**MANDATORY DUPLICATE DETECTION - YOU MUST DO THIS:**";
    systemPrompt += "\n1. Scan the list below for items with SAME COLOR + SAME SUBCATEGORY";
    systemPrompt += "\n2. Count how many identical items exist (e.g., 2 black t-shirts, 3 white shirts)";
    systemPrompt += "\n3. If duplicates exist → AUTOMATICALLY RECOMMEND SKIP";
    systemPrompt += "\n4. Write in CONS: 'You already own [X] identical [color] [item type] - this is unnecessary duplication'";
    systemPrompt += "\n5. Score MUST be 1-2/10 for any exact duplicates";
    systemPrompt += "\n\n**EXAMPLE FROM YOUR DATA:**";
    systemPrompt += "\nIf you see: 'Black T-shirt' AND 'Black T-shirt' → Write: 'You own 2 identical black t-shirts'\n";
    
    // Sort items to put most relevant duplicates first (same subcategory, same color)
    const sortedContext = [...similarContext].sort((a, b) => {
      // Prioritize items with color information
      if (a.color && !b.color) return -1;
      if (!a.color && b.color) return 1;
      // Prioritize items with subcategory information
      if (a.subcategory && !b.subcategory) return -1;
      if (!a.subcategory && b.subcategory) return 1;
      return 0;
    });
    
    sortedContext.forEach((item, index) => {
      systemPrompt += `${index + 1}. ${item.name} - ${item.category}`;
      if (item.subcategory) systemPrompt += ` (${item.subcategory})`;
      if (item.color) systemPrompt += ` - COLOR: ${item.color}`;
      
      // Add detailed properties for better duplicate detection
      const details = [];
      if (item.length) details.push(`length: ${item.length}`);
      if (item.silhouette) details.push(`silhouette: ${item.silhouette}`);
      if (item.rise) details.push(`rise: ${item.rise}`);
      if (item.neckline) details.push(`neckline: ${item.neckline}`);
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
    
    systemPrompt += "\n**DUPLICATE DETECTION INSTRUCTIONS:**";
    systemPrompt += "\n\n**TRUE DUPLICATES (flag for SKIP):**";
    systemPrompt += "\n- Items that are the SAME color + SAME subcategory + similar style";
    systemPrompt += "\n- Example: Analyzing a black t-shirt when you own another black t-shirt";
    systemPrompt += "\n- Example: Analyzing blue jeans when you own other blue jeans with same fit";
    systemPrompt += "\n\n**NOT DUPLICATES (different items, do NOT flag):**";
    systemPrompt += "\n- Different colors: white vs black, grey vs black, blue vs red, etc.";
    systemPrompt += "\n- Different subcategories: t-shirt vs tank top, jeans vs leggings";
    systemPrompt += "\n- Different styles: fitted vs oversized, high-waisted vs low-rise";
    systemPrompt += "\n\n**FOR EACH ITEM IN THE LIST ABOVE:**";
    systemPrompt += "\n1. Compare the COLOR - if different colors, NOT a duplicate";
    systemPrompt += "\n2. Compare the SUBCATEGORY - if different subcategories, NOT a duplicate";
    systemPrompt += "\n3. Only if BOTH color and subcategory match, then check if it's a duplicate";
    systemPrompt += "\n\n**REMEMBER:** Having multiple colors of basic items is normal and useful for outfit variety.";
    systemPrompt += "\n\n**Duplicate Analysis:** Look through the list above for items that match BOTH the color and subcategory of the new item. Only flag those as duplicates.";
  }
  
  return systemPrompt;
}

function addFinalInstructions(systemPrompt, detectedTags) {
  if (detectedTags) {
    systemPrompt += "\n\nHere are tags that were automatically detected in the image: " + JSON.stringify(detectedTags);
  }
  
  systemPrompt += "\n\n=== REQUIRED FORMAT ===";
  systemPrompt += "\nAnalyze THIS SPECIFIC ITEM and use this exact structure:";
  systemPrompt += "\n\n**CRITICAL CONSISTENCY RULES:**";
  systemPrompt += "\n- DO NOT contradict yourself between PROS and CONS";
  systemPrompt += "\n- If you describe a feature as positive in PROS, do NOT criticize the same feature in CONS";
  systemPrompt += "\n- Example: If you say 'classic button-down silhouette' in PROS, don't say 'loose oversized silhouette' in CONS";
  systemPrompt += "\n- Analyze the item once and be consistent throughout";
  systemPrompt += "\n- Focus CONS on genuine issues: duplicates, limited versatility, poor quality, or climate mismatch";
  
  systemPrompt += "\n\nANALYSIS:";
  systemPrompt += "\nPROS:";
  systemPrompt += "\n1. [Specific positive aspect about THIS item - color, fit, material, etc.]";
  systemPrompt += "\n2. [How THIS item fills gaps in their wardrobe]";
  systemPrompt += "\n3. [Specific styling opportunities with THIS item]";
  systemPrompt += "\n\n**CONS SECTION RULES:**";
  systemPrompt += "\n• ALWAYS include CONS section if duplicates were found in the duplicate check above";
  systemPrompt += "\n• If duplicates exist → MUST write about them in CONS (overrides skip rules)";
  systemPrompt += "\n• Only skip CONS if NO duplicates AND no other genuine problems";
  systemPrompt += "\n• DO NOT write 'no duplicates exist' - but DO write about duplicates that DO exist";
  systemPrompt += "\n\n**EXAMPLES:**";
  systemPrompt += "\nCONS: ✗ You do not own duplicates (WRONG - don't write about absence!)";
  systemPrompt += "\nCONS: ✅ You already own 2 identical black t-shirts - this is wasteful duplication (CORRECT!)";
  systemPrompt += "\n\n**When to skip CONS entirely:** Only when NO duplicates exist AND no other problems";
  systemPrompt += "\n**When to include CONS:** When duplicates exist OR other genuine issues found";
  systemPrompt += "\n\nSUITABLE SCENARIOS:";
  systemPrompt += "\n**CRITICAL: Only list scenarios where the item is GENUINELY PRACTICAL. Do NOT list scenarios with disclaimers like 'not the most practical' or 'could work but...'**";
  systemPrompt += "\n**If you need to add qualifiers about practicality → DO NOT LIST THAT SCENARIO**";
  systemPrompt += "\n**Examples of what NOT to write:**";
  systemPrompt += "\n• 'While not practical for X, these could work...' ❌";
  systemPrompt += "\n• 'Not the most suitable but could be worn for...' ❌";
  systemPrompt += "\n• 'Could potentially work for light versions of...' ❌";
  systemPrompt += "\n**Only list scenarios where you can confidently say the item IS suitable.**";
  systemPrompt += "\n**It's better to list 1-2 genuinely suitable scenarios than force 3 with qualifications.**";
  systemPrompt += "\nCOMBINATION SUGGESTIONS:";
  systemPrompt += "\n1. [Specific item from their wardrobe + styling tip]";
  systemPrompt += "\n2. [Another specific combination idea]";
  systemPrompt += "\n3. [Third specific styling suggestion]";
  systemPrompt += "\n\nIMPORTANT: ";
  systemPrompt += "\n- ONLY include bullet points that have actual issues to report";
  systemPrompt += "\n- SKIP any bullet point if no issues exist (don't write 'none noted' or 'no issues found')";
  systemPrompt += "\n- ONLY mention quality/fit issues IF you see obvious problems like poor stitching, loose threads, bad fit, cheap materials, or broken hardware";
  systemPrompt += "\n\nSCORE: X/10";
  systemPrompt += "\nScore reasoning based on THIS item's value";
  systemPrompt += "\n\n🚨 CRITICAL REQUIREMENT: Your FINAL RECOMMENDATION section must NEVER be just 'SKIP' or 'RECOMMEND' without explanation. Always include specific reasoning based on gap analysis, existing items, or scenarios.";
  systemPrompt += "\n\n📝 FINAL RECOMMENDATION LANGUAGE RULES:";
  systemPrompt += "\n• Use friendly, encouraging language";
  systemPrompt += "\n• DO NOT mention specific numbers of items (avoid '6 items', '0 items', etc.)";
  systemPrompt += "\n• DO NOT use technical terms like 'oversaturated', 'gap type', 'base score'";
  systemPrompt += "\n• USE encouraging phrases: 'well-stocked', 'great coverage', 'fills a gap', 'plenty of options'";
  systemPrompt += "\n\nExample recommendation formats:";
  systemPrompt += "\n• 'SKIP - You already have [specific item] that works beautifully for [scenarios]. This would be redundant.'";
  systemPrompt += "\n• 'SKIP - Your wardrobe is already well-stocked with [category] for [season]. Focus on styling what you own creatively.'";
  systemPrompt += "\n• 'SKIP - You have great coverage in this area already. Consider exploring new ways to style your existing pieces.'";
  systemPrompt += "\n• 'RECOMMEND - This fills an important gap in your [scenario] wardrobe and will pair wonderfully with [existing pieces].'";
  systemPrompt += "\n• 'RECOMMEND - Perfect addition for [scenarios] where you need more options. Great versatility for your lifestyle.'";
  systemPrompt += "\n\n=== REQUIRED OUTPUT FORMAT ===";
  systemPrompt += "\nYou MUST structure your response with these exact sections:";
  systemPrompt += "\n\nANALYSIS:";
  systemPrompt += "\n[Your detailed analysis here]";
  systemPrompt += "\n\nSCORE: [Your numerical score]";
  systemPrompt += "\n\nFEEDBACK:";
  systemPrompt += "\n[Your specific recommendation for this item]";
  systemPrompt += "\n\nFINAL RECOMMENDATION:";
  systemPrompt += "\n[Your final recommendation with detailed explanation - never just 'SKIP' or 'RECOMMEND' alone]";
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
