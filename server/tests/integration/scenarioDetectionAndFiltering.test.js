/**
 * Scenario Detection and Filtering Integration Tests
 * 
 * Tests the complete flow of scenario detection, filtering, and processing
 * for both wishlist and regular items in the analysis pipeline
 */

const { buildEnhancedAnalysisPrompt } = require('../../utils/ai/enhancedPromptBuilder');
const { getAnalysisScope } = require('../../utils/ai/analysisScopeUtils');
const generateObjectiveFinalReason = require('../../utils/ai/generateObjectiveFinalReason');

describe('Scenario Detection and Filtering Integration', () => {
  const mockScenarios = [
    { 
      id: 'd4daf7c5-c3ef-4bfa-b06d-f6f85f60c243', 
      name: 'Social Outings', 
      description: 'Casual to smart casual events',
      frequency: '2 times per week'
    },
    { 
      id: '4a014af9-b07e-469b-b503-abcaf8b5fab0', 
      name: 'Office Work', 
      description: 'Business casual dress code',
      frequency: '5 times per week'
    },
    { 
      id: '4c4257b3-ff49-4eb8-9fcc-c6f093d015c6', 
      name: 'Staying at Home', 
      description: 'Comfort-focused activities',
      frequency: '1 times per week'
    },
    { 
      id: 'bde9aa0f-d1c8-4434-828a-8b887c0e9232', 
      name: 'Light Outdoor Activities', 
      description: 'Outdoor casual activities',
      frequency: '3 times per week'
    }
  ];

  describe('Non-Wishlist Items - Scenario Detection', () => {
    it('should suggest all available scenarios for regular items', () => {
      const analysisData = { category: 'top', subcategory: 't-shirt' };
      const analysisScope = getAnalysisScope('top', 't-shirt');
      const preFilledData = null; // Regular item, not from wishlist

      const prompt = buildEnhancedAnalysisPrompt(
        analysisData,
        analysisScope,
        preFilledData,
        mockScenarios,
        null
      );

      // Should use suggestion mode with all scenarios
      expect(prompt).toContain('Evaluate suitability for these scenarios:');
      expect(prompt).toContain('Social Outings: Casual to smart casual events');
      expect(prompt).toContain('Office Work: Business casual dress code');
      expect(prompt).toContain('Staying at Home: Comfort-focused activities');
      expect(prompt).toContain('Light Outdoor Activities: Outdoor casual activities');
      expect(prompt).toContain('List ONLY truly suitable scenarios');

      // Should NOT use wishlist validation mode
      expect(prompt).not.toContain('🏷️ WISHLIST ITEM - SCENARIO VALIDATION');
      expect(prompt).not.toContain('VALIDATE whether this item is actually suitable');
    });

    it('should provide comprehensive analysis instructions for regular items', () => {
      const analysisData = { category: 'footwear', subcategory: 'heels' };
      const analysisScope = getAnalysisScope('footwear', 'heels');

      const prompt = buildEnhancedAnalysisPrompt(
        analysisData,
        analysisScope,
        null,
        mockScenarios,
        null
      );

      // Should include detailed analysis instructions
      expect(prompt).toContain('=== COMPREHENSIVE ITEM ANALYSIS ===');
      expect(prompt).toContain('STYLE LEVEL CLASSIFICATION');
      expect(prompt).toContain('FORMALITY LEVEL (1-5 scale)');
      expect(prompt).toContain('COLOR & PATTERN ANALYSIS');
      expect(prompt).toContain('End your response with \'REASON: [brief explanation]\'');
    });
  });

  describe('Wishlist Items - Scenario Validation', () => {
    it('should validate pre-selected scenarios for wishlist items', () => {
      const analysisData = { category: 'one_piece', subcategory: 'dress', isFromWishlist: true };
      const analysisScope = getAnalysisScope('one_piece', 'dress');
      const preFilledData = {
        name: 'Evening Dress',
        category: 'one_piece',
        scenarios: ['d4daf7c5-c3ef-4bfa-b06d-f6f85f60c243'] // Social Outings UUID
      };

      const prompt = buildEnhancedAnalysisPrompt(
        analysisData,
        analysisScope,
        preFilledData,
        mockScenarios,
        null
      );

      // Should use validation mode
      expect(prompt).toContain('🏷️ WISHLIST ITEM - SCENARIO VALIDATION');
      expect(prompt).toContain('The user already selected these scenarios for this wishlist item:');
      expect(prompt).toContain('1. Social Outings');
      expect(prompt).toContain('VALIDATE whether this item is actually suitable for the scenarios the user already chose');
      expect(prompt).toContain('List VALIDATED scenarios in a \'SUITABLE SCENARIOS:\' section');

      // Should NOT suggest other scenarios
      expect(prompt).not.toContain('Office Work: Business casual dress code');
      expect(prompt).not.toContain('Staying at Home: Comfort-focused activities');
      expect(prompt).not.toContain('Evaluate suitability for these scenarios');
    });

    it('should handle multiple pre-selected scenarios for wishlist items', () => {
      const analysisData = { category: 'outerwear', subcategory: 'blazer' };
      const analysisScope = getAnalysisScope('outerwear', 'blazer');
      const preFilledData = {
        name: 'Professional Blazer',
        category: 'outerwear',
        scenarios: [
          '4a014af9-b07e-469b-b503-abcaf8b5fab0', // Office Work
          'd4daf7c5-c3ef-4bfa-b06d-f6f85f60c243'  // Social Outings
        ]
      };

      const prompt = buildEnhancedAnalysisPrompt(
        analysisData,
        analysisScope,
        preFilledData,
        mockScenarios,
        null
      );

      // Should validate both scenarios
      expect(prompt).toContain('🏷️ WISHLIST ITEM - SCENARIO VALIDATION');
      expect(prompt).toContain('1. Office Work');
      expect(prompt).toContain('2. Social Outings');
      expect(prompt).not.toContain('3. Staying at Home'); // Should not suggest unselected scenarios
    });
  });

  describe('Final Reason Generation with Scenarios', () => {
    it('should include scenario name in expansion gap reasoning', () => {
      const relevantCoverage = [
        {
          scenarioName: 'Social Outings',
          category: 'one_piece',
          season: 'summer',
          currentItems: 4,
          coveragePercent: 80,
          gapType: 'expansion'
        }
      ];

      const reason = generateObjectiveFinalReason(
        relevantCoverage,
        'expansion',
        ['Social Outings'],
        false,
        { category: 'one_piece' },
        []
      );

      expect(reason).toContain('You have good coverage in one_pieces for summer for Social Outings');
      expect(reason).toContain('nice-to-have rather than essential');
    });

    it('should include scenario name in critical gap reasoning', () => {
      const relevantCoverage = [
        {
          scenarioName: 'Office Work',
          category: 'top',
          season: 'spring/fall',
          currentItems: 0,
          coveragePercent: 0,
          gapType: 'critical'
        }
      ];

      const reason = generateObjectiveFinalReason(
        relevantCoverage,
        'critical',
        ['Office Work'],
        false,
        { category: 'top' },
        []
      );

      expect(reason).toContain('You\'re missing essential tops pieces for spring/fall for Office Work');
      expect(reason).toContain('great addition to fill that gap');
    });

    it('should exclude "All scenarios" from final reasoning', () => {
      const relevantCoverage = [
        {
          scenarioName: 'All scenarios',
          category: 'outerwear',
          season: 'winter',
          currentItems: 2,
          coveragePercent: 67,
          gapType: 'expansion'
        }
      ];

      const reason = generateObjectiveFinalReason(
        relevantCoverage,
        'expansion',
        [],
        false,
        { category: 'outerwear' },
        []
      );

      // Should include season but exclude "All scenarios" mention
      expect(reason).toContain('You have good coverage in outerwear for winter');
      expect(reason).not.toContain('for All scenarios');
    });
  });

  describe('End-to-End Scenario Flow', () => {
    it('should complete full flow for wishlist item with scenario filtering', () => {
      // Step 1: Build prompt with wishlist scenarios
      const analysisData = { category: 'one_piece', subcategory: 'dress' };
      const analysisScope = getAnalysisScope('one_piece', 'dress');
      const preFilledData = {
        name: 'Summer Dress',
        category: 'one_piece',
        scenarios: ['d4daf7c5-c3ef-4bfa-b06d-f6f85f60c243'] // Social Outings
      };

      const prompt = buildEnhancedAnalysisPrompt(
        analysisData,
        analysisScope,
        preFilledData,
        mockScenarios,
        null
      );

      // Step 2: Verify wishlist validation mode
      expect(prompt).toContain('🏷️ WISHLIST ITEM - SCENARIO VALIDATION');
      expect(prompt).toContain('1. Social Outings');

      // Step 3: Generate final reason with scenario context
      const mockCoverage = [
        {
          scenarioName: 'Social Outings',
          category: 'one_piece',
          season: 'summer',
          currentItems: 3,
          coveragePercent: 75,
          gapType: 'expansion'
        }
      ];

      const finalReason = generateObjectiveFinalReason(
        mockCoverage,
        'expansion',
        ['Social Outings'],
        false,
        { category: 'one_piece' },
        []
      );

      // Step 4: Verify complete scenario context in final recommendation
      expect(finalReason).toContain('You have good coverage in one_pieces for summer for Social Outings');
      expect(finalReason).toContain('nice-to-have rather than essential');
    });

    it('should handle scenario mismatch validation', () => {
      const analysisData = { category: 'footwear', subcategory: 'heels' };
      const analysisScope = getAnalysisScope('footwear', 'heels');
      const preFilledData = {
        name: 'High Heels',
        category: 'footwear',
        scenarios: ['bde9aa0f-d1c8-4434-828a-8b887c0e9232'] // Light Outdoor Activities (inappropriate!)
      };

      const prompt = buildEnhancedAnalysisPrompt(
        analysisData,
        analysisScope,
        preFilledData,
        mockScenarios,
        null
      );

      // Should provide validation instructions for potential mismatch
      expect(prompt).toContain('🏷️ WISHLIST ITEM - SCENARIO VALIDATION');
      expect(prompt).toContain('1. Light Outdoor Activities');
      expect(prompt).toContain('Be honest - if the user\'s choice doesn\'t match the item, flag it');
      expect(prompt).toContain('Consider dress codes, formality, and practical reality');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle empty scenarios list gracefully', () => {
      const prompt = buildEnhancedAnalysisPrompt(
        { category: 'top' },
        getAnalysisScope('top', 't-shirt'),
        null,
        [], // Empty scenarios
        null
      );

      // Should not crash and should not contain scenario-related instructions
      expect(prompt).toBeDefined();
      expect(prompt).not.toContain('Evaluate suitability for these scenarios');
      expect(prompt).not.toContain('WISHLIST ITEM - SCENARIO VALIDATION');
    });

    it('should handle undefined scenarios gracefully', () => {
      const prompt = buildEnhancedAnalysisPrompt(
        { category: 'top' },
        getAnalysisScope('top', 't-shirt'),
        null,
        undefined, // Undefined scenarios
        null
      );

      expect(prompt).toBeDefined();
      expect(prompt).not.toContain('Evaluate suitability for these scenarios');
    });

    it('should handle wishlist item with null scenarios', () => {
      const preFilledData = {
        name: 'Test Item',
        category: 'top',
        scenarios: null
      };

      const prompt = buildEnhancedAnalysisPrompt(
        { category: 'top' },
        getAnalysisScope('top', 't-shirt'),
        preFilledData,
        mockScenarios,
        null
      );

      // Should fallback to suggestion mode
      expect(prompt).not.toContain('🏷️ WISHLIST ITEM - SCENARIO VALIDATION');
      expect(prompt).toContain('Evaluate suitability for these scenarios');
    });
  });
});
