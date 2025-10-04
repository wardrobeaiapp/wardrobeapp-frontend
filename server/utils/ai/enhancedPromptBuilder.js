/**
 * Enhanced Prompt Builder
 * 
 * Builds comprehensive AI prompts for wardrobe item analysis with:
 * - Wishlist data integration and verification
 * - Category-specific characteristic analysis
 * - Sophisticated layering and styling intelligence
 * - Objective, evidence-based analysis requirements
 */

/**
 * Build comprehensive analysis prompt with wishlist integration
 * @param {object} analysisData - Merged form data and pre-filled data
 * @param {object} analysisScope - Scope defining which characteristics to analyze
 * @param {object} preFilledData - Pre-filled wishlist data (optional)
 * @param {array} scenarios - Available scenarios for analysis
 * @param {string} duplicatePromptSection - Duplicate analysis prompt section
 * @returns {string} Complete system prompt for AI analysis
 */
function buildEnhancedAnalysisPrompt(analysisData, analysisScope, preFilledData, scenarios, duplicatePromptSection) {
  let systemPrompt = "You are evaluating whether this clothing/accessory item is suitable for different lifestyle scenarios. Think about where and when this item would realistically be used.";
  
  // Add scenarios section if provided
  if (scenarios && scenarios.length > 0) {
    systemPrompt += "\n\nEvaluate suitability for these scenarios:\n";
    scenarios.forEach((scenario, index) => {
      systemPrompt += `\n${index + 1}. ${scenario.name}`;
      if (scenario.description) systemPrompt += `: ${scenario.description}`;
    });
    
    systemPrompt += "\n\nGuidelines:";
    systemPrompt += "\n- Pay close attention to scenario descriptions - they specify dress codes and formality requirements";
    systemPrompt += "\n- Match the item's formality level to the scenario's requirements";
    systemPrompt += "\n- Consider practical reality: Would someone actually wear this item for this activity?";
    systemPrompt += "\n- Think about styling potential: Basic items can work in elevated scenarios when styled appropriately";
    
    systemPrompt += "\n\nList ONLY truly suitable scenarios in a 'SUITABLE SCENARIOS:' section. Be realistic about when someone would actually use this item. Number them starting from 1 (1., 2., 3., etc.), one scenario per line, no explanations.";
  }
  
  // === ENHANCED CHARACTERISTIC ANALYSIS PROMPT ===
  systemPrompt += "\n\n=== COMPREHENSIVE ITEM ANALYSIS ===";
  systemPrompt += "\nAnalyze this item to extract comprehensive characteristics for future styling decisions.";
  
  // Handle pre-filled wishlist data
  if (preFilledData) {
    systemPrompt += buildWishlistVerificationSection(preFilledData);
  }

  // Universal characteristics analysis
  systemPrompt += buildUniversalAnalysisSection();
  
  // Conditional analysis based on category/subcategory
  systemPrompt += buildConditionalAnalysisSection(analysisScope);
  
  // Critical analysis rules
  systemPrompt += buildAnalysisRulesSection();

  // Add duplicate detection results to system prompt
  if (duplicatePromptSection) {
    systemPrompt += duplicatePromptSection;
  }
  
  systemPrompt += " End your response with 'REASON: [brief explanation]', then 'FINAL RECOMMENDATION: [RECOMMEND/SKIP/MAYBE]'.";

  return systemPrompt;
}

/**
 * Build wishlist verification section for pre-filled data
 * @param {object} preFilledData - Pre-filled wishlist data
 * @returns {string} Wishlist verification prompt section
 */
function buildWishlistVerificationSection(preFilledData) {
  let section = "\n\n🏷️ WISHLIST ITEM - PRE-FILLED DATA VERIFICATION:";
  section += "\nThis item was selected from the user's wishlist with some details already provided:";
  
  // Only show descriptive fields that the AI can verify from the image
  const descriptiveFields = ['name', 'category', 'subcategory', 'color', 'style', 'silhouette', 'fit', 
                            'material', 'pattern', 'length', 'sleeves', 'rise', 'neckline', 
                            'heelHeight', 'bootHeight', 'brand', 'size', 'season'];
  
  descriptiveFields.forEach(field => {
    const value = preFilledData[field];
    if (value) {
      if (Array.isArray(value)) {
        section += `\n• ${field}: ${value.join(', ')}`;
      } else {
        section += `\n• ${field}: ${value}`;
      }
    }
  });
  
  section += "\n\n⚠️ VERIFICATION INSTRUCTIONS:";
  section += "\n• VERIFY these details against what you see in the image";
  section += "\n• CORRECT any details that are wrong based on visual evidence";
  section += "\n• CONFIRM details that are accurate";
  section += "\n• COMPLETE any missing details by analyzing the image";
  section += "\n• Be honest - if you can't verify something from the image, say so";

  return section;
}

/**
 * Build universal characteristics analysis section
 * @returns {string} Universal analysis prompt section
 */
function buildUniversalAnalysisSection() {
  let section = "\n\n📊 REQUIRED ANALYSIS (for all items):";
  
  section += "\n\n1. STYLE LEVEL CLASSIFICATION (Critical for outfit balance):";
  section += "\n• BASIC: Foundation pieces - black/white/navy/gray, solid colors, minimal design, classic cuts";  
  section += "\n• NEUTRAL: Bridge pieces - muted/earth tones, some texture, sophisticated but not attention-grabbing";
  section += "\n• STATEMENT: Focal points - bright/bold colors, patterns, unique details, eye-catching design";

  section += "\n\n2. FORMALITY LEVEL (1-5 scale):";
  section += "\n• 1 = Casual (loungewear, athletic wear, basic tees, flip-flops)";
  section += "\n• 2 = Smart Casual (nice jeans, casual dresses, sneakers, polo shirts)"; 
  section += "\n• 3 = Business Casual (blazers, dress pants, blouses, professional flats)";
  section += "\n• 4 = Business Formal (suits, formal dresses, dress shoes)";
  section += "\n• 5 = Formal/Black Tie (evening wear, tuxedos, formal gowns)";

  section += "\n\n3. COLOR & PATTERN ANALYSIS:";
  section += "\n• Primary color(s): Exact color names you can see";
  section += "\n• Color family: neutral, earth-tone, bright, pastel, jewel-tone";
  section += "\n• Pattern type: solid, stripe, floral, geometric, animal, abstract, or describe pattern";

  return section;
}

/**
 * Build conditional analysis sections based on scope
 * @param {object} analysisScope - Analysis scope object
 * @returns {string} Conditional analysis prompt sections
 */
function buildConditionalAnalysisSection(analysisScope) {
  let section = "";

  if (analysisScope.conditional.neckline) {
    section += "\n\n4. NECKLINE ANALYSIS (Critical for layering compatibility):";
    section += "\n• Exact neckline type: crew, v-neck, scoop, turtleneck, cowl, boat, off-shoulder, square, etc.";
    section += "\n• Height assessment: high (turtleneck, cowl), mid (crew, scoop), low (v-neck, boat, square)";
  }

  if (analysisScope.conditional.sleeves) {
    section += "\n\n5. SLEEVE ANALYSIS (Critical for layering):";
    section += "\n• Sleeve style: sleeveless, short, 3/4, long, cap, bell, puff, fitted, balloon, bishop";
    section += "\n• Sleeve volume: fitted (close to arm), relaxed (some room), voluminous (puffy/wide)";
  }

  if (analysisScope.conditional.layeringPotential) {
    section += "\n\n6. LAYERING POTENTIAL (Critical - be objective based on what you see!):";
    section += "\n• STANDALONE: Too thick/bulky/complex for layering - worn alone";
    section += "\n  - Examples: chunky cable-knit sweaters, turtlenecks, puffy sleeves, thick materials";
    section += "\n• INNER LAYER: Thin, fitted, simple - good under other items";
    section += "\n  - Examples: fitted tees, camisoles, thin blouses, sleeveless tops";
    section += "\n• OUTER LAYER: Structured/open design - good over other items";
    section += "\n  - Examples: blazers, cardigans, open jackets, coats";
    section += "\n• VERSATILE: Medium weight - works both ways";
    section += "\n  - Examples: button-up shirts, light sweaters, structured tops";
    section += "\nBASE ASSESSMENT ON: Material thickness, neckline height, sleeve bulk, overall volume you can see";
  }

  if (analysisScope.conditional.volume) {
    section += "\n\n7. VOLUME & FIT ANALYSIS:";
    section += "\n• Overall volume: fitted (close to body), relaxed (some ease), oversized (intentionally loose), voluminous (very full)";
    section += "\n• Silhouette: straight, A-line, flowy, structured, bodycon, boxy, cocoon";
  }

  if (analysisScope.conditional.heelHeight) {
    section += "\n\n8. FOOTWEAR ANALYSIS:";
    section += "\n• Heel height: flat (0\"), low (1-2\"), medium (2-3\"), high (3-4\"), very high (4+\")";
    section += "\n• Activity appropriateness: athletic, casual walking, business, formal events";
  }

  if (analysisScope.conditional.rise) {
    section += "\n\n9. BOTTOM ANALYSIS:";
    section += "\n• Rise: low-rise (below hip bone), mid-rise (at hip bone), high-waisted (above hip bone)";
    section += "\n• Length assessment based on what you can see";
  }

  return section;
}

/**
 * Build critical analysis rules section
 * @returns {string} Analysis rules prompt section
 */
function buildAnalysisRulesSection() {
  let section = "\n\n🚨 CRITICAL ANALYSIS RULES:";
  section += "\n• Be OBJECTIVE - only describe what you can clearly see in the image";
  section += "\n• For layering potential, consider physics - thick materials don't layer well under fitted items";
  section += "\n• If you cannot determine something from the image, say 'cannot determine from image'";
  section += "\n• Don't guess or assume - base analysis on visible evidence only";
  section += "\n• Focus on characteristics that will matter for future styling decisions";

  return section;
}

module.exports = {
  buildEnhancedAnalysisPrompt,
  buildWishlistVerificationSection,
  buildUniversalAnalysisSection,
  buildConditionalAnalysisSection,
  buildAnalysisRulesSection
};
