const express = require('express');
const { Anthropic } = require('@anthropic-ai/sdk');
const router = express.Router();

// Import services
const compatibilityAnalysisService = require('../../../services/compatibilityAnalysisService');
const { orchestrateOutfitAnalysis } = require('../../../services/outfitAnalysisOrchestrator');
const { performClaudeAnalysis } = require('../../../services/claudeAnalysisService');
const { saveAnalysisToHistory } = require('../../../services/aiHistoryService');
const { performDuplicateDetectionWorkflow } = require('../../../services/duplicateDetectionWorkflow');

// Import utilities
const extractSuitableScenarios = require('../../../utils/ai/extractSuitableScenarios');
const imageValidator = require('../../../utils/imageValidator');

// Import utilities still used in this file
const { extractItemCharacteristics } = require('../../../utils/ai/characteristicExtractionUtils');
const { consolidateCompatibilityResults } = require('../../../utils/ai/compatibilityResultsUtils');
const { enhanceBaseItemForOutfits } = require('../../../utils/ai/baseItemEnhancer');

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
        console.log(`      - closure: ${item.closure || 'N/A'}`);
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

    // === CLAUDE ANALYSIS ===
    const {
      rawAnalysisResponse,
      analysisResponse,
      finalReason,
      claudeRecommendation,
      analysisData,
      analysisScope
    } = await performClaudeAnalysis({
      formData,
      preFilledData,
      scenarios,
      mediaType,
      base64Data,
      anthropicClient: anthropic
    });
    
    const suitableScenarios = extractSuitableScenarios(rawAnalysisResponse, scenarios);
    
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

    // === DUPLICATE DETECTION ===
    const { duplicateResult, duplicatePromptSection } = await performDuplicateDetectionWorkflow({
      analysisData,
      similarContext,
      formData
    });

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
    
    // Enhance base item data for outfit thumbnails (extracted utility)
    const itemDataForOutfits = await enhanceBaseItemForOutfits(
      formData, 
      preFilledData, 
      imageBase64, 
      mediaType, 
      base64Data, 
      rawAnalysisResponse,
      req
    );
    
    const outfitAnalysisResults = await orchestrateOutfitAnalysis({
      formData: itemDataForOutfits,
      preFilledData,
      suitableScenarios,
      consolidatedCompatibleItems,
      scenarioCoverage,
      userGoals,
      duplicateResult,
      scenarios,
      anthropicClient: anthropic
    });
    
    // Extract results from orchestrator
    const {
      outfitCombinations,
      seasonScenarioCombinations,
      coverageGapsWithNoOutfits,
      analysisResult,
      objectiveFinalReason
    } = outfitAnalysisResults;

    // ===== SAVE TO AI HISTORY =====
    await saveAnalysisToHistory({
      userId,
      analysisResponse,
      analysisResult,
      objectiveFinalReason,
      suitableScenarios,
      consolidatedCompatibleItems,
      outfitCombinations,
      seasonScenarioCombinations,
      coverageGapsWithNoOutfits,
      formData: itemDataForOutfits // Use enhanced item data with proper name
    });

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
