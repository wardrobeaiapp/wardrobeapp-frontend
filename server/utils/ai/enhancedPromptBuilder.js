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
  
  // Handle scenarios differently for wishlist items vs regular items
  if (scenarios && scenarios.length > 0) {
    const isWishlistItem = !!preFilledData;
    const wishlistScenarioIds = preFilledData?.scenarios || preFilledData?.suitableScenarios;
    
    // Convert scenario IDs to scenario names (handle both UUIDs and names)
    let wishlistScenarios = [];
    if (wishlistScenarioIds && wishlistScenarioIds.length > 0) {
      console.log('🔄 Converting wishlist scenarios:', wishlistScenarioIds);
      wishlistScenarios = wishlistScenarioIds.map(scenarioIdOrName => {
        // Check if it's already a scenario name (for test environment)
        const existingScenario = scenarios.find(s => s.name === scenarioIdOrName);
        if (existingScenario) {
          console.log(`📝 Already a name: ${scenarioIdOrName}`);
          return scenarioIdOrName;
        }
        
        // Otherwise, treat as UUID and look up by ID (for real app)
        const scenario = scenarios.find(s => s.id === scenarioIdOrName);
        const scenarioName = scenario ? scenario.name : `Unknown scenario (${scenarioIdOrName})`;
        console.log(`📝 UUID ${scenarioIdOrName} → Name: ${scenarioName}`);
        return scenarioName;
      });
      console.log('✅ Final wishlist scenarios:', wishlistScenarios);
    }
    
    // Unified scenario evaluation with conditional formatting
    const isWishlistValidation = isWishlistItem && wishlistScenarios && wishlistScenarios.length > 0;
    
    // Conditional header and scenario listing
    systemPrompt += isWishlistValidation 
      ? "\n\n🏷️ WISHLIST ITEM - SCENARIO VALIDATION:\nThe user already selected these scenarios for this wishlist item:"
      : "\n\nEvaluate suitability for these scenarios:";
    
    // Unified scenario listing with conditional source
    const scenarioList = isWishlistValidation ? wishlistScenarios : scenarios;
    scenarioList.forEach((scenario, index) => {
      const scenarioName = isWishlistValidation ? scenario : scenario.name;
      const scenarioDesc = isWishlistValidation ? '' : (scenario.description ? `: ${scenario.description}` : '');
      systemPrompt += `\n${index + 1}. ${scenarioName}${scenarioDesc}`;
    });
    
    // Conditional task instructions with shared evaluation criteria
    if (isWishlistValidation) {
      systemPrompt += "\n\n⚠️ VALIDATION TASK:";
      systemPrompt += "\n- VALIDATE whether this item is actually suitable for the scenarios the user already chose";
      systemPrompt += "\n- List VALIDATED scenarios in a 'SUITABLE SCENARIOS:' section";
      systemPrompt += "\n- If unsuitable, exclude and explain why";
      systemPrompt += "\n- If NOT suitable: Explain why in the analysis";
      systemPrompt += "\n- Be honest - if the user's choice doesn't match the item, flag it";
    } else {
      systemPrompt += "\n\nList ONLY truly suitable scenarios in a 'SUITABLE SCENARIOS:' section. Be realistic about when someone would actually use this item.";
    }
    
    // Shared evaluation criteria and output format  
    systemPrompt += "\n\nConsider dress codes, formality, and practical reality" + (isWishlistValidation ? "" : ", and styling potential") + " when determining suitability.";
    systemPrompt += "\n\nNumber them starting from 1 (1., 2., 3., etc.), one scenario per line, no explanations.";
  }
  
  // === ENHANCED CHARACTERISTIC ANALYSIS PROMPT ===
  systemPrompt += "\n\n=== COMPREHENSIVE ITEM ANALYSIS ===";
  systemPrompt += "\nAnalyze this item to extract comprehensive characteristics for future styling decisions.";
  systemPrompt += "\n\n🔍 LAYERING COMPATIBILITY FOCUS: Examine the image for visual details that affect layering. CRITICAL: Look at sleeve SHAPE (not just length) - do sleeves puff out, balloon, or gather? Also check for textured surfaces, structured elements, high necklines, hardware, bulk, or any features preventing layering under blazers/jackets.";
  
  // Handle pre-filled wishlist data
  if (preFilledData) {
    systemPrompt += buildWishlistVerificationSection(preFilledData);
  }

  // Universal characteristics analysis
  systemPrompt += buildUniversalAnalysisSection();
  
  // Conditional analysis based on category/subcategory
  const conditionalSection = buildConditionalAnalysisSection(analysisScope);
  console.log('\n🔍 CONDITIONAL ANALYSIS SECTIONS DEBUG:');
  console.log('analysisScope.conditional:', analysisScope.conditional);
  console.log('conditionalSection length:', conditionalSection.length);
  console.log('conditionalSection preview:', conditionalSection.substring(0, 200) + '...');
  
  systemPrompt += conditionalSection;
  
  // Critical analysis rules
  systemPrompt += buildAnalysisRulesSection();

  // Add duplicate detection results to system prompt
  if (duplicatePromptSection) {
    systemPrompt += duplicatePromptSection;
  }
  
  systemPrompt += "\n\n📝 RESPONSE FORMAT:";
  systemPrompt += "\n• If you detect outerwear incompatibilities, include a section: 'OUTERWEAR INCOMPATIBILITIES: [list specific items that won't work, e.g. 'fitted blazers', 'slim jackets']'";
  systemPrompt += "\n• End with 'REASON: [brief explanation]', then 'FINAL RECOMMENDATION: [RECOMMEND/SKIP/MAYBE]'";
  systemPrompt += "\n• Only list REAL physical incompatibilities, not style preferences";

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
                            'material', 'pattern', 'length', 'sleeves', 'details', 'rise', 'neckline', 
                            'heelHeight', 'bootHeight', 'brand', 'size', 'season'];
  
  descriptiveFields.forEach(field => {
    const value = preFilledData[field];
    if (value) {
      if (Array.isArray(value)) {
        section += `\n• ${field}: ${value.join(', ')}`;
      } else {
        // Highlight details field if it contains layering-critical information
        if (field === 'details' && (value.toLowerCase().includes('balloon') || value.toLowerCase().includes('puff') || value.toLowerCase().includes('gathered'))) {
          section += `\n• ⚠️ ${field}: ${value} ⚠️ CRITICAL FOR LAYERING ASSESSMENT`;
        } else {
          section += `\n• ${field}: ${value}`;
        }
      }
    }
  });
  
  section += "\n\n⚠️ VERIFICATION INSTRUCTIONS:";
  section += "\n• VERIFY these details against what you see in the image";
  section += "\n• CORRECT any details that are wrong based on visual evidence";
  section += "\n• CONFIRM details that are accurate";
  section += "\n• ⚠️ CRITICAL: If 'details' mentions balloon/puff/gathered sleeves, USE THIS INFORMATION for layering assessment regardless of visual interpretation";
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
  section += "\n• 1=Casual • 2=Smart Casual • 3=Business Casual • 4=Business Formal (workplace) • 5=Evening Formal (party/event)";
  section += "\n• Key: 4=conservative/professional, 5=dramatic/glamorous elements allowed";

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
  console.log('\n🔍 BUILDING CONDITIONAL SECTIONS:');

  if (analysisScope.conditional.neckline) {
    console.log('  ✅ Adding NECKLINE analysis section (item 4)');
    section += "\n\n4. NECKLINE ANALYSIS - CRITICAL FOR LAYERING:";
    section += "\n• Type: crew, v-neck, scoop, turtleneck, cowl, boat, off-shoulder, square, halter, mock neck";
    section += "\n• Height: high/mid/low";
    section += "\n• ⚠️ LAYERING BLOCKERS: Identify high turtlenecks, mock necks, large collars, bow details, hardware that prevent layering under blazers";
  }

  if (analysisScope.conditional.sleeves) {
    console.log('  ✅ Adding SLEEVE analysis section (item 5)');
    section += "\n\n5. SLEEVE ANALYSIS - CRITICAL FOR LAYERING:";
    section += "\n• LENGTH: sleeveless, short, 3/4, long, cap";
    section += "\n• SHAPE/VOLUME (CRITICAL FOR LAYERING): fitted, balloon, puff, bell, bishop, flutter, gathered, voluminous";
    section += "\n• ⚠️ MANDATORY: Examine sleeve SHAPE - do they puff out from the arm? Balloon/puff/gathered sleeves create bulk that prevents layering under fitted blazers/jackets";
    section += "\n• ⚠️ Don't just identify length - identify if sleeves have volume/puffiness that affects layering";
  } else {
    console.log('  ❌ SLEEVE analysis section SKIPPED - conditional.sleeves is false');
  }

  if (analysisScope.conditional.layeringPotential) {
    console.log('  ✅ Adding LAYERING POTENTIAL analysis section (item 6)');
    section += "\n\n6. LAYERING POTENTIAL - MANDATORY SLEEVE VOLUME CHECK:";
    section += "\n\n🔍 CRITICAL SLEEVE ASSESSMENT:";
    section += "\n⚠️ FIRST CHECK: If pre-filled data mentions 'balloon sleeves', 'puff sleeves', or similar volume descriptions, TRUST THAT INFORMATION over visual assessment.";
    section += "\n\nIf no pre-filled sleeve details, examine image for:";
    section += "\n• Gathered or elastic cuffs at the wrists";
    section += "\n• Fabric that extends outward from where the arm would be";
    section += "\n• Extra fabric creating volume between shoulder and cuff";
    section += "\n• Sleeves that appear wider than a fitted sleeve would be";
    section += "\n\n🔍 REQUIRED: Are balloon/puff sleeves indicated by pre-filled data OR visual cues? (YES/NO)";
    section += "\n\n⚠️ LAYERING ASSESSMENT RULES:";
    section += "\n• If balloon/puff sleeves are indicated (pre-filled OR visual) → LAYERING POTENTIAL: LIMITED";
    section += "\n• Only if sleeves are confirmed fitted → Check other factors";
    section += "\n\n• STANDALONE: thick/bulky (chunky knits, turtlenecks) • INNER: thin/fitted (tees, camisoles)";
    section += "\n• OUTER: structured/open (blazers, cardigans) • VERSATILE: medium weight (shirts, light sweaters)";
    section += "\n\n🔍 CLOSURE TYPE ANALYSIS (for outer layers):";
    section += "\n• CRITICAL: If this is a cardigan, blazer, vest, or jacket, identify the closure type";
    section += "\n• CLOSURE TYPES affect layering requirements:";
    section += "\n  - 'Open Front' or 'Wrap Style': REQUIRES something underneath (cannot be worn alone)";
    section += "\n  - 'Buttons', 'Zipper', or 'Belt': CAN be worn alone or with layers";
    section += "\n• Always specify the closure type for outer layer items";
    section += "\n\n⚠️ OTHER LAYERING BLOCKERS TO CHECK:";
    section += "\n• NECKLINE: High turtlenecks, mock necks create conflicts";
    section += "\n• TEXTURE: Sequins, chunky knits, fuzzy textures create bulk";
    section += "\n• CONSTRUCTION: Wrap ties, structured elements add bulk";
  }

  if (analysisScope.conditional.volume) {
    section += "\n\n7. VOLUME & FIT ANALYSIS:";
    section += "\n• Volume: fitted/relaxed/oversized/voluminous • Silhouette: straight/A-line/flowy/structured/bodycon/boxy/cocoon";
    section += "\n• ⚠️ LAYERING IMPACT: Voluminous/oversized items typically cannot layer under fitted outerwear";
  }

  if (analysisScope.conditional.heelHeight) {
    section += "\n\n8. FOOTWEAR ANALYSIS:";
    section += "\n• Heel height: flat (0\")/low (1-2\")/medium (2-3\")/high (3-4\")/very high (4+\")";
    section += "\n• Activity: athletic/casual/business/formal";
  }

  if (analysisScope.conditional.rise) {
    section += "\n\n9. BOTTOM ANALYSIS:";
    section += "\n• Rise: low-rise/mid-rise/high-waisted • Length: assess what's visible";
  }

  console.log('  📋 Final conditional sections built. Total length:', section.length);
  return section;
}

/**
 * Build critical analysis rules section
 * @returns {string} Analysis rules prompt section
 */
function buildAnalysisRulesSection() {
  let section = "\n\n🚨 ANALYSIS RULES:";
  section += "\n• Only describe what's clearly visible - say 'cannot determine from image' if unsure";
  section += "\n• Consider physics for layering - thick materials don't layer under fitted items";

  section += "\n\n🧥 OUTERWEAR COMPATIBILITY - Flag only TRUE physical incompatibilities:";
  section += "\n• Puffy sleeves + fitted blazers • Voluminous items + slim coats • High necks + crew blazers • Thick knits + slim jackets";
  section += "\n• Most clothing works together - incompatibilities are rare exceptions";

  return section;
}

module.exports = {
  buildEnhancedAnalysisPrompt,
  buildWishlistVerificationSection,
  buildUniversalAnalysisSection,
  buildConditionalAnalysisSection,
  buildAnalysisRulesSection
};
