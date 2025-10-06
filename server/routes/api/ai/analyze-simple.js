const express = require('express');
const { Anthropic } = require('@anthropic-ai/sdk');
const router = express.Router();

// Import services
const duplicateDetectionService = require('../../../services/duplicateDetectionService');
const scenarioCoverageService = require('../../../services/scenarioCoverageService');

// Import utilities
const extractSuitableScenarios = require('../../../utils/ai/extractSuitableScenarios');
const analyzeScenarioCoverageForScore = require('../../../utils/ai/analyzeScenarioCoverageForScore');
const generateObjectiveFinalReason = require('../../../utils/ai/generateObjectiveFinalReason');
const imageValidator = require('../../../utils/imageValidator');

// Import new modular utilities
const { getAnalysisScope, getAllRelevantCharacteristics } = require('../../../utils/ai/analysisScopeUtils');
const { extractItemCharacteristics } = require('../../../utils/ai/characteristicExtractionUtils');
const { buildCompatibilityCheckingPrompt, extractItemDataForCompatibility, parseCompatibilityResponse } = require('../../../utils/ai/complementingCompatibilityPrompt');
const { buildEnhancedAnalysisPrompt } = require('../../../utils/ai/enhancedPromptBuilder');

/**
 * OUTERWEAR COMPATIBILITY FEATURE:
 * 
 * The AI now detects real physical/structural incompatibilities between items and outerwear.
 * This prevents suggesting combinations that users literally cannot wear (e.g., puffy sleeves + fitted blazers).
 * 
 * How it works:
 * 1. Enhanced AI prompt teaches the difference between real incompatibilities vs. style preferences
 * 2. AI only flags RARE cases of true physical conflicts (sleeve volume, thickness, neckline clashes)
 * 3. AI responds with "OUTERWEAR INCOMPATIBILITIES: [specific items]" section if conflicts detected
 * 4. Frontend can use isOuterwearCompatible() helper to filter suggestions
 * 
 * Conservative approach: Most items are compatible by design - only obvious impossibilities are flagged
 */

// Initialize Claude client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

//
// @route   POST /api/analyze-wardrobe-item-simple
// @desc    Simple analysis of wardrobe item with Claude - just basic prompt
// @access  Public
router.post('/', async (req, res) => {
  console.log('🚀 ANALYZE SIMPLE ENDPOINT HIT - Request received!');
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
    console.log('userGoals:', userGoals);
    console.log('preFilledData:', preFilledData ? JSON.stringify(preFilledData, null, 2) : 'none');
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
    }
    
    const base64Data = imageValidation.base64Data;

    // === DUPLICATE DETECTION ===
    console.log('=== STEP: Duplicate Detection ===');
    console.log('🔍 DEBUG - similarContext count:', similarContext?.length || 0);
    console.log('🔍 DEBUG - similarContext sample (first 2):', JSON.stringify(similarContext?.slice(0, 2), null, 2));
    console.log('🔍 DEBUG - formData:', JSON.stringify(formData, null, 2));
    
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
      console.log('   - Severity:', duplicateResult.duplicateAnalysis.duplicate_analysis.severity);
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
                media_type: "image/jpeg",
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
    
    // Analyze scenario coverage to get score and objective reason
    // Pass duplicate analysis results to prioritize duplicate detection in scoring
    const duplicateAnalysisForScore = duplicateResult ? duplicateResult.duplicateAnalysis : null;
    const analysisResult = analyzeScenarioCoverageForScore(scenarioCoverage, suitableScenarios, formData, userGoals, duplicateAnalysisForScore);
    const objectiveFinalReason = analysisResult.reason;
    
    console.log('=== Simple Analysis Response ===');
    console.log('Response length:', analysisResponse.length, 'characters');
    console.log('Score from coverage analysis:', analysisResult.score);
    console.log('Claude recommendation:', claudeRecommendation);
    console.log('Objective reason:', objectiveFinalReason);
    console.log('Extracted suitable scenarios:', suitableScenarios);
    console.log('===============================');

    // Extract comprehensive characteristics from the raw response
    console.log('=== STEP: Extracting Item Characteristics ===');
    const extractedCharacteristics = extractItemCharacteristics(rawAnalysisResponse, analysisScope, preFilledData);
    console.log('🏷️ Extracted characteristics:', extractedCharacteristics);

    // === COMPLEMENTING ITEMS COMPATIBILITY CHECK ===
    let compatibleComplementingItems = null;
    if (stylingContext && stylingContext.length > 0) {
      console.log('\n=== STEP: Complementing Items Compatibility Check ===');
      
      try {
        // Extract item data from available sources
        const itemDataForCompatibility = extractItemDataForCompatibility(formData, preFilledData, extractedCharacteristics);
        
        // Filter to get only complementing items (not layering/outerwear)
        const complementingItems = stylingContext.filter(item => {
          const newCategory = formData?.category?.toLowerCase();
          const existingCategory = item.category?.toLowerCase();
          
          // Basic complementing category check
          const complementingMap = {
            'top': ['bottom', 'footwear', 'accessory'],
            'bottom': ['top', 'footwear', 'accessory', 'outerwear'],
            'one_piece': ['footwear', 'accessory'],
            'footwear': ['top', 'bottom', 'one_piece', 'accessory', 'outerwear'],
            'outerwear': ['bottom', 'footwear', 'accessory'],
            'accessory': ['top', 'bottom', 'one_piece', 'footwear', 'outerwear']
          };
          
          const validComplements = complementingMap[newCategory] || [];
          return validComplements.includes(existingCategory);
        });
        
        console.log(`🔍 Found ${complementingItems.length} complementing items to evaluate`);
        
        if (complementingItems.length > 0) {
          // Build compatibility checking prompt
          const compatibilityPrompt = buildCompatibilityCheckingPrompt(itemDataForCompatibility, complementingItems);
          
          // Make Claude compatibility check call
          console.log('🤖 Calling Claude for compatibility evaluation...');
          const compatibilityResponse = await anthropic.messages.create({
            model: "claude-3-haiku-20240307",
            max_tokens: 1024,
            messages: [{
              role: "user",
              content: compatibilityPrompt
            }]
          });
          
          const rawCompatibilityResponse = compatibilityResponse.content[0].text;
          console.log('🎯 Claude compatibility response received');
          
          // Parse compatibility response
          compatibleComplementingItems = parseCompatibilityResponse(rawCompatibilityResponse);
          
          console.log('✅ Compatible complementing items by category:', JSON.stringify(compatibleComplementingItems, null, 2));
        } else {
          console.log('ℹ️ No complementing items found to evaluate');
        }
      } catch (error) {
        console.error('❌ Error in compatibility checking:', error);
        // Continue without compatibility data rather than failing the whole request
      }
    } else {
      console.log('ℹ️ No styling context provided for compatibility checking');
    }

    // Return the analysis with coverage-based score and comprehensive characteristics
    res.json({
      analysis: analysisResponse,
      score: analysisResult.score, // Frontend will convert this to action/status
      recommendationText: objectiveFinalReason, // Human-readable explanation
      suitableScenarios: suitableScenarios,
      
      // COMPREHENSIVE CHARACTERISTICS for future compatibility analysis
      itemCharacteristics: extractedCharacteristics,
      
      // COMPATIBLE COMPLEMENTING ITEMS grouped by category
      compatibleComplementingItems: compatibleComplementingItems,
      
      // Data integration info
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
