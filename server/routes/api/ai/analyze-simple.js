const express = require('express');
const { Anthropic } = require('@anthropic-ai/sdk');
const router = express.Router();

// Import services
const duplicateDetectionService = require('../../../services/duplicateDetectionService');
const compatibilityAnalysisService = require('../../../services/compatibilityAnalysisService');
const { orchestrateOutfitAnalysis } = require('../../../services/outfitAnalysisOrchestrator');

// Import utilities
const extractSuitableScenarios = require('../../../utils/ai/extractSuitableScenarios');
const imageValidator = require('../../../utils/imageValidator');

// Import new modular utilities
const { getAnalysisScope } = require('../../../utils/ai/analysisScopeUtils');
const { extractItemCharacteristics } = require('../../../utils/ai/characteristicExtractionUtils');
const { buildEnhancedAnalysisPrompt } = require('../../../utils/ai/enhancedPromptBuilder');
const { consolidateCompatibilityResults } = require('../../../utils/ai/compatibilityResultsUtils');

// Check and initialize Claude client
console.log('🔑 ANTHROPIC_API_KEY status:', process.env.ANTHROPIC_API_KEY ? 'SET' : 'NOT SET');
console.log('🔑 ANTHROPIC_API_KEY length:', process.env.ANTHROPIC_API_KEY ? process.env.ANTHROPIC_API_KEY.length : 0);

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('❌ ANTHROPIC_API_KEY environment variable is not set!');
  console.error('💡 Please check your .env file in the project root');
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

//
// @route   POST /api/analyze-wardrobe-item-simple
// @desc    Simple analysis of wardrobe item with Claude - just basic prompt
// @access  Public
router.post('/', async (req, res) => {
  console.log('🚨🚨🚨 ANALYZE SIMPLE ENDPOINT HIT - Request received! 🚨🚨🚨');
  
  // Check if API key is available before processing
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ Cannot process AI analysis: ANTHROPIC_API_KEY is not set');
    return res.status(503).json({
      error: 'AI analysis service unavailable',
      details: 'Anthropic API key is not configured. Please check server configuration.',
      success: false
    });
  }
  
  // Debug raw request body
  console.log('🔍 RAW REQUEST BODY KEYS:', Object.keys(req.body));
  console.log('🔍 RAW similarContext in req.body:', req.body.similarContext ? req.body.similarContext.length : 'undefined');
  if (req.body.similarContext) {
    console.log('🔍 RAW similarContext items:');
    req.body.similarContext.forEach((item, i) => {
      console.log(`   ${i+1}. "${item?.name}" - ${item?.category}/${item?.subcategory}`);
    });
  }
  
  try {
    const { imageBase64, formData, preFilledData, scenarios, scenarioCoverage, similarContext, stylingContext, userGoals, userId } = req.body;
    
    console.log('=== Simple Analysis Request ===');
    console.log('userId:', userId || 'not provided');
    console.log('imageBase64:', imageBase64 ? `${imageBase64.length} bytes` : 'missing');
    console.log('formData:', formData);
    console.log('scenarios:', scenarios ? `${scenarios.length} scenarios` : 'none');
    if (scenarios && scenarios.length > 0) {
      console.log('scenario objects:', scenarios.map(s => ({ id: s.id, name: s.name })));
    }
    console.log('scenarioCoverage:', scenarioCoverage ? `${scenarioCoverage.length} items` : 'none');
    console.log('similarContext:', similarContext ? `${similarContext.length} items` : 'none');
    console.log('stylingContext:', stylingContext ? `${stylingContext.length} items` : 'none');
    if (stylingContext && stylingContext.length > 0) {
      const outerwearCount = stylingContext.filter(item => item.category?.toLowerCase() === 'outerwear').length;
      console.log(`  → ${outerwearCount} outerwear items in styling context`);
      
      // Debug: Show detailed styling context data for first 3 items
      console.log('🔍 [analyze-simple] DETAILED STYLING CONTEXT (first 3 items):');
      stylingContext.slice(0, 3).forEach((item, i) => {
        console.log(`   ${i+1}. ${item.name} (${item.category}/${item.subcategory}):`);
        console.log(`      - color: ${item.color}`);
        console.log(`      - material: ${item.material || 'N/A'}`);
        console.log(`      - style: ${item.style || 'N/A'}`);
        console.log(`      - type: ${item.type || 'N/A'}`);
        console.log(`      - heelHeight: ${item.heelHeight || 'N/A'}`);
        console.log(`      - bootHeight: ${item.bootHeight || 'N/A'}`);
        console.log(`      - pattern: ${item.pattern || 'N/A'}`);
        console.log(`      - silhouette: ${item.silhouette || 'N/A'}`);
        console.log(`      - details: ${item.details || 'N/A'}`);
        console.log(`      - season: ${item.season ? item.season.join(', ') : 'N/A'}`);
      });
    }
    console.log('userGoals:', userGoals);
    console.log('preFilledData:', preFilledData ? `has ${Object.keys(preFilledData).length} fields` : 'none');
    console.log('userId:', userId);
    
    // Calculate total payload size
    const totalPayloadSize = JSON.stringify(req.body).length;
    console.log(`📦 Total payload size: ${totalPayloadSize} bytes (${(totalPayloadSize / 1024 / 1024).toFixed(2)} MB)`);
    
    // Claude API has a ~5MB limit for total request size
    if (totalPayloadSize > 4500000) {
      console.error('❌ Payload too large for Claude API');
      return res.status(400).json({
        error: 'payload_too_large',
        message: 'The request payload is too large. Please try with a smaller image or less context data.',
        details: `Payload size: ${(totalPayloadSize / 1024 / 1024).toFixed(2)} MB (limit: ~4.5 MB)`
      });
    }
    
    console.log('==============================');

    // Validate and process image data
    const imageValidation = imageValidator.validateAndProcess(imageBase64);
    if (!imageValidation.isValid) {
      console.error('❌ Image validation failed:', imageValidation.error);
      return res.status(imageValidation.statusCode || 400).json({
        ...imageValidation.errorResponse,
        success: false
      });
    }
    
    const base64Data = imageValidation.base64Data;
    const mediaType = imageValidation.mediaType || 'image/jpeg'; // Use detected media type with fallback
    console.log('🖼️ Using media type for Claude API:', mediaType);

    // === DUPLICATE DETECTION ===
    console.log('🚨 === DUPLICATE DETECTION START === 🚨');
    console.log('🔍 DEBUG - similarContext:', similarContext ? `${similarContext.length} items` : 'none');
    console.log('🔍 DEBUG - formData:', `${formData?.name} (${formData?.category}/${formData?.subcategory})`);
    
    // Enhanced debugging - show summary only
    if (similarContext && similarContext.length > 0) {
      const categoryMatches = similarContext.filter(item => 
        item.category?.toLowerCase() === formData.category?.toLowerCase()
      ).length;
      const subcategoryMatches = similarContext.filter(item => 
        item.subcategory?.toLowerCase() === formData.subcategory?.toLowerCase()
      ).length;
      
      console.log(`🔍 DEBUG - Target: "${formData.category}/${formData.subcategory}"`);
      console.log(`🔍 DEBUG - Matches: ${categoryMatches} category, ${subcategoryMatches} subcategory`);
    }
    
    const duplicateResult = await duplicateDetectionService.analyzeWithAI(
      base64Data, formData, similarContext
    );
    
    let duplicatePromptSection = '';
    if (duplicateResult) {
      duplicatePromptSection = duplicateDetectionService.generatePromptSection(
        duplicateResult.extractedAttributes, 
        duplicateResult.duplicateAnalysis
      );
      console.log('✅ Duplicate analysis completed');
      console.log('   - Duplicates found:', duplicateResult.duplicateAnalysis.duplicate_analysis.found);
      console.log('   - Count:', duplicateResult.duplicateAnalysis.duplicate_analysis.count);
      console.log('   - Items:', duplicateResult.duplicateAnalysis.duplicate_analysis.items);
      console.log('   - Severity:', duplicateResult.duplicateAnalysis.duplicate_analysis.severity);
      console.log('   - Extracted attributes:', duplicateResult.extractedAttributes);
      console.log('🔍 DEBUG - Generated duplicate prompt section:');
      console.log(duplicatePromptSection);
    } else {
      console.log('⚠️ Duplicate analysis skipped (insufficient data)');
    }

    // === ENHANCED CHARACTERISTIC ANALYSIS ===
    console.log('=== STEP: Enhanced Characteristic Analysis Setup ===');
    
    // Merge form data with pre-filled wishlist data
    const analysisData = {
      ...formData,
      ...(preFilledData || {}), // Wishlist data takes precedence where available
      isFromWishlist: !!preFilledData
    };
    
    // Determine analysis scope based on category/subcategory (using DetailsFields.tsx logic)
    const analysisScope = getAnalysisScope(analysisData.category, analysisData.subcategory);
    
    console.log('📊 Analysis data:', analysisData);
    console.log('🔍 Analysis scope:', analysisScope);
    if (preFilledData) {
      console.log('👗 Pre-filled wishlist data detected - will verify/correct/complete');
    }

    // Build comprehensive system prompt using modular approach
    const systemPrompt = buildEnhancedAnalysisPrompt(
      analysisData,
      analysisScope,
      preFilledData,
      scenarios,
      duplicatePromptSection
    );

    // Call Claude API
    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1024,
      temperature: 0.5,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: base64Data
              }
            },
            {
              type: "text",
              text: "Please analyze this clothing item as potential purchase for my wardrobe."
            }
          ]
        }
      ]
    });

    // Get the raw response text
    const rawAnalysisResponse = response.content[0].text;
    
    // Extract final reason and recommendation from raw text BEFORE cleaning
    let finalReason = "";
    const finalReasonMatch = rawAnalysisResponse.match(/REASON:?\s*([\s\S]*?)(?=FINAL RECOMMENDATION:?|$)/i);
    if (finalReasonMatch && finalReasonMatch[1]) {
      finalReason = finalReasonMatch[1].trim();
    }
    
    let claudeRecommendation = "";
    const finalRecommendationMatch = rawAnalysisResponse.match(/FINAL RECOMMENDATION:?\s*([\s\S]*?)(?=SCORE:?|$)/i);
    if (finalRecommendationMatch && finalRecommendationMatch[1]) {
      claudeRecommendation = finalRecommendationMatch[1].trim();
    }
    
    // Clean up the analysis text for display (remove Claude's recommendation sections)
    let analysisResponse = rawAnalysisResponse;
    analysisResponse = analysisResponse.replace(/FINAL RECOMMENDATION:?\s*[\s\S]*?(?=REASON:|$)/i, '');
    analysisResponse = analysisResponse.replace(/REASON:?\s*[\s\S]*?$/i, '');
    analysisResponse = analysisResponse.trim();
    
    const suitableScenarios = extractSuitableScenarios(rawAnalysisResponse);
    
    // Note: Scenario coverage scoring will be calculated after outfit generation
    // to include practical outfit-based adjustments
    
    console.log('=== Simple Analysis Response ===');
    console.log('Response length:', analysisResponse.length, 'characters');
    console.log('Claude recommendation:', claudeRecommendation);
    console.log('Extracted suitable scenarios:', suitableScenarios);
    console.log('===============================');

    // Extract comprehensive characteristics
    console.log('=== STEP: Extracting Item Characteristics ===');
    const extractedCharacteristics = extractItemCharacteristics(rawAnalysisResponse, analysisScope, preFilledData);
    console.log('🏷️ Extracted characteristics:', extractedCharacteristics);

    // === UNIFIED COMPATIBILITY ANALYSIS ===
    console.log('\n=== STEP: Unified Compatibility Analysis ===');
    console.log('🔍 [analyze-simple] DATA BEING PASSED TO COMPATIBILITY SERVICE:');
    console.log('   - formData:', formData);
    console.log('   - preFilledData:', preFilledData ? 'YES' : 'NO');
    console.log('   - extractedCharacteristics keys:', Object.keys(extractedCharacteristics || {}));
    console.log('   - stylingContext items:', stylingContext ? stylingContext.length : 0);
    if (stylingContext && stylingContext.length > 0) {
      console.log('   - stylingContext sample:', stylingContext[0].name, 'fields:', Object.keys(stylingContext[0]));
    }
    
    const compatibilityResults = await compatibilityAnalysisService.analyzeAllCompatibilities(
      formData, 
      preFilledData, 
      extractedCharacteristics, 
      stylingContext, 
      anthropic,
      suitableScenarios,
      scenarios
    );
    
    const { 
      compatibleComplementingItems, 
      compatibleLayeringItems, 
      compatibleOuterwearItems 
    } = compatibilityResults;

    const consolidatedCompatibleItems = consolidateCompatibilityResults(
      compatibleComplementingItems, 
      compatibleLayeringItems, 
      compatibleOuterwearItems
    );
    
    console.log('✅ Consolidated compatible items by category:', Object.keys(consolidatedCompatibleItems));
    console.log('✅ Suitable scenarios extracted:', suitableScenarios.length, 'scenarios');

    // ===== OUTFIT ANALYSIS ORCHESTRATION =====
    console.log('\n=== STEP: Outfit Analysis Orchestration ===');
    
    const outfitAnalysisResults = orchestrateOutfitAnalysis({
      formData,
      preFilledData,
      suitableScenarios,
      consolidatedCompatibleItems,
      scenarioCoverage,
      userGoals,
      duplicateResult,
      scenarios
    });
    
    // Extract results from orchestrator
    const {
      outfitCombinations,
      seasonScenarioCombinations,
      coverageGapsWithNoOutfits,
      analysisResult,
      objectiveFinalReason
    } = outfitAnalysisResults;

    // Return the analysis with coverage-based score and comprehensive characteristics
    res.json({
      // MAIN ANALYSIS (required field for frontend popup trigger)
      analysis: analysisResponse,
      
      // USER-FACING POPUP DATA
      score: analysisResult.score, // Frontend will convert this to action/status
      recommendationText: objectiveFinalReason, // Human-readable explanation
      suitableScenarios: suitableScenarios,
      compatibleItems: consolidatedCompatibleItems, // Items organized by category for popup
      outfitCombinations: outfitCombinations, // Complete outfit recommendations
      seasonScenarioCombinations: seasonScenarioCombinations, // Season + scenario completion status
      coverageGapsWithNoOutfits: coverageGapsWithNoOutfits, // Coverage gaps that have 0 outfits available
      
      // TECHNICAL DATA (for processing, not user display)
      itemCharacteristics: extractedCharacteristics,
      compatibilityDetails: {
        complementing: compatibleComplementingItems,
        layering: compatibleLayeringItems,
        outerwear: compatibleOuterwearItems
      },
      dataIntegration: {
        isFromWishlist: !!preFilledData,
        preFilledFields: preFilledData ? Object.keys(preFilledData).filter(key => 
          !['id', 'userId', 'imageUrl', 'dateAdded', 'imageExpiry'].includes(key)
        ) : [],
        analysisScope: analysisScope
      },
      
      success: true
    });
    
  } catch (err) {
    console.error('Error in simple Claude analysis:', err);
    res.status(500).json({ 
      error: 'Error analyzing image', 
      details: err.message,
      analysis: 'Sorry, there was an error analyzing your item. Please try again later.',
      success: false
    });
  }
});


module.exports = router;
