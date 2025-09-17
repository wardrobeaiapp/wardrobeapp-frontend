const express = require('express');
const { Anthropic } = require('@anthropic-ai/sdk');
const { getScenarioCoverageForAnalysis } = require('../../../utils/scenarioCoverageCalculator');
const {
  buildSystemPrompt,
  addFormDataSection,
  addScenariosSection,
  addClimateSection,
  addStylingContextSection,
  addScenarioCoverageSection,
  addGapAnalysisSection,
  addFinalInstructions
} = require('../../../utils/promptBuilder');

// Import duplicate detection utilities
const {
  analyzeDuplicatesForAI,
  generateExtractionPrompt,
  parseExtractionResponse
} = require('../../../utils/duplicateDetectionUtils');

const router = express.Router();

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// @route   POST /api/analyze-wardrobe-item
// @desc    Analyze wardrobe item with Claude
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { imageBase64, detectedTags, climateData, scenarios, formData, stylingContext, similarContext, additionalContext, scenarioCoverage, userId } = req.body;
    
    // Log the complete request body for debugging
    console.log('=== Request Body ===');
    console.log('imageBase64:', imageBase64 ? 'present' : 'missing');
    console.log('detectedTags:', detectedTags || 'none');
    console.log('climateData:', climateData || 'none');
    console.log('scenarios:', scenarios || 'none');
    console.log('formData:', JSON.stringify(formData, null, 2) || 'none');
    console.log('stylingContext:', stylingContext ? `${stylingContext.length} items` : 'none');
    console.log('similarContext:', similarContext ? `${similarContext.length} items` : 'none');
    console.log('additionalContext:', additionalContext ? `${additionalContext.length} items` : 'none');
    console.log('scenarioCoverage:', scenarioCoverage ? `${scenarioCoverage.length} scenarios` : 'none');
    console.log('===================');
    
    // Log that we received user data
    if (climateData) {
      console.log('Received user climate data from frontend for analysis:', climateData);
    }
    
    if (scenarios && scenarios.length > 0) {
      console.log(`Received ${scenarios.length} scenarios from frontend`);
    }

    if (!imageBase64) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    // Extract base64 data without prefix if present and ensure it's properly formatted
    let base64Data = imageBase64;
    
    // Handle data URI format (e.g., data:image/jpeg;base64,/9j/4AAQ...)
    if (base64Data.startsWith('data:')) {
      const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        base64Data = matches[2];
      } else {
        return res.status(400).json({ 
          error: 'Invalid image data format', 
          details: 'The provided image data is not in a valid base64 format',
          analysis: 'Error analyzing image. Please try again later.',
          score: 5.0,
          feedback: 'Could not process the image analysis.'
        });
      }
    }

    // Simple validation of base64 data - ensuring it's non-empty and reasonable size
    if (!base64Data || base64Data.length < 100) {
      return res.status(400).json({ 
        error: 'Insufficient image data', 
        details: 'The provided image data is too small to be a valid image',
        analysis: 'Error analyzing image. The image data appears to be incomplete.',
        score: 5.0,
        feedback: 'Please provide a complete image.'
      });
    }

    // Build the system prompt using modular approach
    let systemPrompt = buildSystemPrompt();
    
    // Add form data section
    systemPrompt = addFormDataSection(systemPrompt, formData);
    
    // Add scenarios section
    systemPrompt = addScenariosSection(systemPrompt, req.body.scenarios);
    
    // Add climate section
    systemPrompt = addClimateSection(systemPrompt, climateData);
    
    // Add styling context section
    systemPrompt = addStylingContextSection(systemPrompt, stylingContext);

    // === SCENARIO COVERAGE ANALYSIS ===
    if (scenarioCoverage && scenarioCoverage.length > 0) {
      console.log('=== SCENARIO COVERAGE ANALYSIS - Using frontend-provided data ===');
      console.log('Frontend scenario coverage analysis:', scenarioCoverage);
      
      // Analyze seasonal gaps for targeted recommendations
      const seasonalGaps = [];
      const itemSeasons = formData?.seasons || [];
      
      // Group coverage by scenario and identify gaps
      const coverageByScenario = {};
      scenarioCoverage.forEach(coverage => {
        const key = coverage.scenarioName;
        if (!coverageByScenario[key]) {
          coverageByScenario[key] = [];
        }
        coverageByScenario[key].push(coverage);
      });
      
      // Helper function to check if item type is appropriate for scenario
      function isItemAppropriateForScenario(itemCategory, itemSubcategory, scenarioName) {
        const scenario = scenarioName.toLowerCase();
        const category = itemCategory?.toLowerCase();
        const subcategory = itemSubcategory?.toLowerCase();
        
        // Define inappropriate combinations
        const inappropriateCombos = {
          'light outdoor activities': ['heels', 'dress shoes', 'formal shoes'],
          'staying at home': ['heels', 'dress shoes', 'formal shoes'],
          'exercise': ['heels', 'dress shoes', 'formal shoes'],
          'sports': ['heels', 'dress shoes', 'formal shoes'],
          'hiking': ['heels', 'dress shoes', 'formal shoes'],
          'gym': ['heels', 'dress shoes', 'formal shoes']
        };
        
        // Check if this combination is inappropriate
        const inappropriate = inappropriateCombos[scenario];
        if (inappropriate) {
          const isInappropriate = inappropriate.some(badType => 
            subcategory?.includes(badType) || category?.includes(badType)
          );
          return !isInappropriate;
        }
        
        return true; // Default to appropriate if not in inappropriate list
      }
      
      // Identify specific seasonal gaps
      Object.entries(coverageByScenario).forEach(([scenarioName, coverages]) => {
        coverages.forEach(coverage => {
          // Check if this season has a gap AND the item is suitable for this season
          const hasGap = coverage.coveragePercent < 60; // Less than 60% = gap
          const itemSuitableForSeason = itemSeasons.includes(coverage.season);
          const itemAppropriateForScenario = isItemAppropriateForScenario(
            formData?.category, 
            formData?.subcategory, 
            scenarioName
          );
          
          console.log(`🔍 Gap Analysis: ${scenarioName} ${coverage.season}`);
          console.log(`   Coverage: ${coverage.coveragePercent}%, HasGap: ${hasGap} (< 60%), SeasonMatch: ${itemSuitableForSeason}, ScenarioAppropriate: ${itemAppropriateForScenario}`);
          console.log(`   Item seasons: [${itemSeasons.join(', ')}], Coverage season: ${coverage.season}`);
          
          if (hasGap && itemSuitableForSeason && itemAppropriateForScenario) {
            console.log(`✅ Adding relevant gap: ${scenarioName} ${coverage.season} (${coverage.coveragePercent}%)`);
            seasonalGaps.push({
              scenario: scenarioName,
              season: coverage.season,
              currentCoverage: coverage.coveragePercent,
              frequency: coverage.scenarioFrequency,
              currentItems: coverage.currentItems,
              category: coverage.category
            });
          } else {
            const reason = !hasGap ? 'no gap' : 
                          !itemSuitableForSeason ? 'season mismatch' : 
                          !itemAppropriateForScenario ? 'inappropriate for scenario' : 'unknown';
            console.log(`❌ Not adding gap: ${scenarioName} ${coverage.season} (${reason})`);
          }
        });
      });
      
      // Add seasonal gap analysis to prompt
      console.log(`📊 Final Seasonal Gaps Detected: ${seasonalGaps.length}`);
      seasonalGaps.forEach(gap => {
        console.log(`   - ${gap.scenario} ${gap.season}: ${gap.currentCoverage}%`);
      });
      
      if (seasonalGaps.length > 0) {
        systemPrompt += `\n\n=== SEASONAL GAP ANALYSIS ===`;
        systemPrompt += `\nThis item could potentially fill the following seasonal gaps:\n`;
        
        seasonalGaps.forEach(gap => {
          systemPrompt += `\n• ${gap.scenario} (${gap.frequency}) in ${gap.season}:`;
          systemPrompt += `\n  - Current coverage: ${gap.currentCoverage}% (${gap.currentItems} items)`;
          systemPrompt += `\n  - Gap severity: ${gap.currentCoverage < 20 ? 'CRITICAL' : gap.currentCoverage < 40 ? 'HIGH' : 'MODERATE'}`;
        });
        
        systemPrompt += `\n\n**TARGETED RECOMMENDATION INSTRUCTION:**`;
        systemPrompt += `\nIn your FINAL RECOMMENDATION, specifically mention ONLY the seasonal gaps listed above.`;
        systemPrompt += `\nDO NOT mention seasons that are not listed as gaps above.`;
        systemPrompt += `\nThe gaps to mention are: ${seasonalGaps.map(g => `${g.scenario} in ${g.season}`).join(', ')}.`;
        systemPrompt += `\nDO NOT add any other seasons beyond what is listed here.`;
        systemPrompt += `\nExample: "This item would be particularly valuable for your ${seasonalGaps.map(g => `${g.scenario} in ${g.season}`).join(', ')} wardrobe gap${seasonalGaps.length > 1 ? 's' : ''}."`;
        systemPrompt += `\nBe specific about ONLY the identified gaps and their coverage levels.`;
      }
    } else if (userId && formData?.seasons) {
      console.log('=== SCENARIO COVERAGE ANALYSIS - Using production system fallback ===');
      
      const targetSeasons = formData.seasons;
      
      try {
        const dbScenarioCoverage = await getScenarioCoverageForAnalysis(userId, targetSeasons);
        console.log('Production scenario coverage analysis:', dbScenarioCoverage);
        
        // Add scenario coverage to prompt using your production data
        systemPrompt = addScenarioCoverageSection(systemPrompt, dbScenarioCoverage, req.body.scenarios);
        
        // Add gap analysis using production coverage data
        systemPrompt = addGapAnalysisSection(systemPrompt, dbScenarioCoverage, formData);
      } catch (error) {
        console.error('Failed to get scenario coverage from production system:', error);
        // Continue without scenario coverage if it fails
      }
    } else {
      console.log('=== SCENARIO COVERAGE ANALYSIS - Skipped (no data provided) ===');
    }

    // === ENHANCED DUPLICATE DETECTION ===
    let duplicateAnalysis = null;
    
    // Step 1: Extract structured attributes from image
    if (formData && formData.category && (similarContext || additionalContext)) {
      console.log('=== STEP 1: AI Attribute Extraction ===');
      
      try {
        const extractionPrompt = generateExtractionPrompt(formData.category);
        
        const extractionResponse = await anthropic.messages.create({
          model: "claude-3-haiku-20240307",
          max_tokens: 200,
          temperature: 0.2, // Lower temperature for consistent extraction
          system: `You are a precise fashion attribute extractor. Extract ONLY the requested attributes using the exact options provided.`,
          messages: [{
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
                text: extractionPrompt
              }
            ]
          }]
        });

        const extractedAttributes = parseExtractionResponse(extractionResponse.content[0].text);
        console.log('Extracted attributes:', extractedAttributes);

        // Step 2: Run algorithmic duplicate analysis
        if (extractedAttributes) {
          console.log('=== STEP 2: Algorithmic Duplicate Analysis ===');
          
          const enrichedItemData = {
            category: formData.category,
            subcategory: formData.subcategory,
            color: extractedAttributes.color,
            silhouette: extractedAttributes.silhouette,
            style: extractedAttributes.style,
            seasons: formData.seasons
          };

          const allContextItems = [...(similarContext || []), ...(additionalContext || [])];
          duplicateAnalysis = analyzeDuplicatesForAI(enrichedItemData, allContextItems);
          
          console.log('Duplicate analysis result:', JSON.stringify(duplicateAnalysis, null, 2));
          
          // Add structured duplicate analysis to prompt
          systemPrompt += `\n\n=== ALGORITHMIC DUPLICATE ANALYSIS ===`;
          systemPrompt += `\nThe following analysis was performed using deterministic algorithms:\n`;
          
          systemPrompt += `\nDETECTED ATTRIBUTES:`;
          systemPrompt += `\n- Color: ${extractedAttributes.color}`;
          systemPrompt += `\n- Silhouette: ${extractedAttributes.silhouette || 'N/A'}`;
          systemPrompt += `\n- Style: ${extractedAttributes.style}`;
          
          systemPrompt += `\nDUPLICATE ANALYSIS:`;
          if (duplicateAnalysis.duplicate_analysis.found) {
            systemPrompt += `\n- DUPLICATES FOUND: ${duplicateAnalysis.duplicate_analysis.count} similar items`;
            systemPrompt += `\n- Items: ${duplicateAnalysis.duplicate_analysis.items.join(', ')}`;
            systemPrompt += `\n- Severity: ${duplicateAnalysis.duplicate_analysis.severity}`;
          } else {
            systemPrompt += `\n- NO DUPLICATES: No similar items detected`;
          }
          
          systemPrompt += `\nVARIETY IMPACT:`;
          systemPrompt += `\n- ${duplicateAnalysis.variety_impact.message}`;
          systemPrompt += `\n- Color dominance risk: ${duplicateAnalysis.variety_impact.would_dominate ? 'YES' : 'NO'}`;
          
          systemPrompt += `\nALGORITHMIC RECOMMENDATION: ${duplicateAnalysis.recommendation}`;
          
          systemPrompt += `\n\nIMPORTANT: Base your recommendation on these factual findings. If duplicates were found, score should be 1-3/10. If no duplicates and fills gaps, score 6-8/10.`;
        }
        
      } catch (extractionError) {
        console.error('Attribute extraction failed:', extractionError);
        // Fallback to original analysis if extraction fails
      }
    }
    
    // Use ONLY the new structured analyses - no old fallback logic
    
    // Add final instructions
    systemPrompt = addFinalInstructions(systemPrompt);
    
    // Debug: Log the full prompt being sent to AI (truncated for readability)
    console.log('=== FULL PROMPT TO AI (last 1000 chars) ===');
    console.log(systemPrompt.slice(-1000));
    console.log('=== END PROMPT ===');

    // Log the complete prompt for debugging
    console.log('==== FULL CLAUDE PROMPT ====');
    console.log(systemPrompt);
    console.log('============================');
    
    // Call Claude API
    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1024,
      temperature: 0.7,
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
              text: "Please analyze this clothing item for my wardrobe."
            }
          ]
        }
      ]
    });

    // Extract analysis from Claude response
    let analysisResponse = response.content[0].text;
    console.log('Claude response:', analysisResponse);
    
    // Parse and restructure response to extract sections
    let analysis = "";
    let score = 5.0;
    let feedback = "";
    let finalRecommendation = "";
    
    // Helper function to format structured analysis
    function formatStructuredAnalysis(rawAnalysis) {
      let formatted = "";
      
      // Extract PROS section
      const prosMatch = rawAnalysis.match(/PROS:?\s*([\s\S]*?)(?=CONS:?|SUITABLE SCENARIOS:?|COMBINATION SUGGESTIONS:?|$)/i);
      if (prosMatch && prosMatch[1]) {
        const prosText = prosMatch[1].trim();
        formatted += "**PROS:**\n";
        // Look for numbered lists first (1. 2. 3.)
        const numberedPoints = prosText.match(/\d+\.\s*([^0-9]+?)(?=\d+\.|$)/g);
        if (numberedPoints && numberedPoints.length > 0) {
          numberedPoints.forEach((point, index) => {
            if (index < 3) {
              const cleanPoint = point.replace(/^\d+\.\s*/, '').trim();
              formatted += `✓ ${cleanPoint}\n`;
            }
          });
        } else {
          // Fallback: split by sentences for paragraph text
          const prosPoints = prosText.split(/[.!]\s+/).filter(p => p.trim().length > 15);
          prosPoints.forEach((point, index) => {
            if (index < 3) {
              formatted += `✓ ${point.trim().replace(/^[-•]\s*/, '')}\n`;
            }
          });
        }
        formatted += "\n";
      }
      
      // Extract CONS section  
      const consMatch = rawAnalysis.match(/CONS:?\s*([\s\S]*?)(?=SUITABLE SCENARIOS:?|COMBINATION SUGGESTIONS:?|$)/i);
      if (consMatch && consMatch[1]) {
        const consText = consMatch[1].trim();
        formatted += "**CONS:**\n";
        const numberedPoints = consText.match(/\d+\.\s*([^0-9]+?)(?=\d+\.|$)/g);
        if (numberedPoints && numberedPoints.length > 0) {
          numberedPoints.forEach((point, index) => {
            if (index < 3) {
              const cleanPoint = point.replace(/^\d+\.\s*/, '').trim();
              formatted += `✗ ${cleanPoint}\n`;
            }
          });
        } else {
          const consPoints = consText.split(/[.!]\s+/).filter(p => p.trim().length > 15);
          consPoints.forEach((point, index) => {
            if (index < 3) {
              formatted += `✗ ${point.trim().replace(/^[-•]\s*/, '')}\n`;
            }
          });
        }
        formatted += "\n";
      }
      
      // Extract SUITABLE SCENARIOS section
      const scenariosMatch = rawAnalysis.match(/SUITABLE SCENARIOS:?\s*([\s\S]*?)(?=COMBINATION SUGGESTIONS:?|$)/i);
      if (scenariosMatch && scenariosMatch[1]) {
        const scenariosText = scenariosMatch[1].trim();
        formatted += "**SUITABLE SCENARIOS:**\n";
        const numberedPoints = scenariosText.match(/\d+\.\s*([^0-9]+?)(?=\d+\.|$)/g);
        if (numberedPoints && numberedPoints.length > 0) {
          numberedPoints.forEach((point, index) => {
            if (index < 3) {
              const cleanPoint = point.replace(/^\d+\.\s*/, '').trim();
              formatted += `🎯 ${cleanPoint}\n`;
            }
          });
        } else {
          const scenarioPoints = scenariosText.split(/[.!]\s+/).filter(p => p.trim().length > 10);
          scenarioPoints.forEach((point, index) => {
            if (index < 3) {
              formatted += `🎯 ${point.trim().replace(/^[-•]\s*/, '')}\n`;
            }
          });
        }
        formatted += "\n";
      }
      
      // Extract COMBINATION SUGGESTIONS section
      const combinationsMatch = rawAnalysis.match(/COMBINATION SUGGESTIONS:?\s*([\s\S]*?)(?=$)/i);
      if (combinationsMatch && combinationsMatch[1]) {
        const combinationsText = combinationsMatch[1].trim();
        formatted += "**COMBINATION SUGGESTIONS:**\n";
        const numberedPoints = combinationsText.match(/\d+\.\s*([^0-9]+?)(?=\d+\.|$)/g);
        if (numberedPoints && numberedPoints.length > 0) {
          numberedPoints.forEach((point, index) => {
            if (index < 3) {
              const cleanPoint = point.replace(/^\d+\.\s*/, '').trim();
              formatted += `👔 ${cleanPoint}\n`;
            }
          });
        } else {
          const combPoints = combinationsText.split(/[.!]\s+/).filter(p => p.trim().length > 15);
          combPoints.forEach((point, index) => {
            if (index < 3) {
              formatted += `👔 ${point.trim().replace(/^[-•]\s*/, '')}\n`;
            }
          });
        }
      }
      
      return formatted || rawAnalysis; // Fallback to original if parsing fails
    }
    
    // Look for ANALYSIS section
    const analysisMatch = analysisResponse.match(/ANALYSIS:?\s*([\s\S]*?)(?=SCORE:?|$)/i);
    if (analysisMatch && analysisMatch[1]) {
      analysis = formatStructuredAnalysis(analysisMatch[1].trim());
    } else {
      analysis = formatStructuredAnalysis(analysisResponse); // Format the full response if no sections found
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
    
    // Enhanced response with duplicate detection data
    const responseData = {
      analysis,
      score,
      feedback,
      finalRecommendation
    };
    
    // Add analysis transparency data
    if (duplicateAnalysis) {
      responseData.analysis_data = {
        duplicate_detection: {
          method: 'enhanced_algorithmic',
          data: duplicateAnalysis,
          message: 'Used deterministic duplicate detection algorithms for consistency.'
        }
      };
    }
    
    if (scenarioCoverage) {
      if (!responseData.analysis_data) responseData.analysis_data = {};
      responseData.analysis_data.scenario_coverage = {
        method: 'coverage_analysis',
        data: scenarioCoverage,
        has_gaps: scenarioCoverage.some(scenario => scenario.coverageLevel <= 2),
        message: 'Analyzed wardrobe gaps across all scenarios.'
      };
    }
    
    console.log('=== FINAL RESPONSE ===');
    console.log('Duplicate detection:', duplicateAnalysis ? 'enabled' : 'disabled');
    console.log('Scenario coverage:', scenarioCoverage ? 'enabled' : 'disabled');
    console.log('Score:', score);
    console.log('====================');
    
    res.json(responseData);
  } catch (err) {
    console.error('Error in Claude analysis:', err);
    res.status(500).json({ 
      error: 'Error analyzing image', 
      details: err.message,
      analysis: 'Sorry, there was an error analyzing your item. Please try again later.',
      score: 5.0,
      feedback: 'Technical error encountered.'
    });
  }
});

module.exports = router;
