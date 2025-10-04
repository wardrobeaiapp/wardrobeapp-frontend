/**
 * Scenario Conversion and Processing Tests
 * 
 * Tests the UUID-to-name conversion logic and scenario processing
 * for both real app (UUIDs) and test environment (names)
 */

const { buildEnhancedAnalysisPrompt } = require('../../../utils/ai/enhancedPromptBuilder');
const { getAnalysisScope } = require('../../../utils/ai/analysisScopeUtils');

describe('Scenario Conversion and Processing', () => {
  // Mock scenarios with both ID and name (like real app)
  const mockScenariosWithIds = [
    { 
      id: 'd4daf7c5-c3ef-4bfa-b06d-f6f85f60c243', 
      name: 'Social Outings', 
      description: 'Casual to smart casual events' 
    },
    { 
      id: '4a014af9-b07e-469b-b503-abcaf8b5fab0', 
      name: 'Office Work', 
      description: 'Business casual dress code' 
    },
    { 
      id: '4c4257b3-ff49-4eb8-9fcc-c6f093d015c6', 
      name: 'Staying at Home', 
      description: 'Comfort-focused activities' 
    }
  ];

  // Mock scenarios without IDs (like test environment)
  const mockScenariosNamesOnly = [
    { name: 'Social Outings', description: 'Casual to smart casual events' },
    { name: 'Office Work', description: 'Business casual dress code' },
    { name: 'Staying at Home', description: 'Comfort-focused activities' }
  ];

  describe('UUID to Name Conversion', () => {
    it('should convert UUIDs to scenario names for real app data', () => {
      const analysisData = { category: 'one_piece', subcategory: 'dress' };
      const analysisScope = getAnalysisScope('one_piece', 'dress');
      const preFilledData = {
        name: 'Evening Dress',
        category: 'one_piece',
        scenarios: ['d4daf7c5-c3ef-4bfa-b06d-f6f85f60c243'] // UUID
      };

      const prompt = buildEnhancedAnalysisPrompt(
        analysisData, 
        analysisScope, 
        preFilledData, 
        mockScenariosWithIds, 
        null
      );

      // Should convert UUID to name
      expect(prompt).toContain('🏷️ WISHLIST ITEM - SCENARIO VALIDATION');
      expect(prompt).toContain('1. Social Outings');
      expect(prompt).not.toContain('d4daf7c5-c3ef-4bfa-b06d-f6f85f60c243'); // UUID should not appear
    });

    it('should handle scenario names directly for test environment', () => {
      const analysisData = { category: 'one_piece', subcategory: 'dress' };
      const analysisScope = getAnalysisScope('one_piece', 'dress');
      const preFilledData = {
        name: 'Evening Dress',
        category: 'one_piece',
        scenarios: ['Office Work'] // Name directly
      };

      const prompt = buildEnhancedAnalysisPrompt(
        analysisData, 
        analysisScope, 
        preFilledData, 
        mockScenariosNamesOnly, 
        null
      );

      // Should use name as-is
      expect(prompt).toContain('🏷️ WISHLIST ITEM - SCENARIO VALIDATION');
      expect(prompt).toContain('1. Office Work');
    });

    it('should handle multiple scenarios (mixed UUIDs and names)', () => {
      const analysisData = { category: 'one_piece', subcategory: 'dress' };
      const analysisScope = getAnalysisScope('one_piece', 'dress');
      const preFilledData = {
        name: 'Versatile Dress',
        category: 'one_piece',
        scenarios: [
          'd4daf7c5-c3ef-4bfa-b06d-f6f85f60c243', // UUID for Social Outings
          '4a014af9-b07e-469b-b503-abcaf8b5fab0'  // UUID for Office Work
        ]
      };

      const prompt = buildEnhancedAnalysisPrompt(
        analysisData, 
        analysisScope, 
        preFilledData, 
        mockScenariosWithIds, 
        null
      );

      // Should convert both UUIDs to names
      expect(prompt).toContain('🏷️ WISHLIST ITEM - SCENARIO VALIDATION');
      expect(prompt).toContain('1. Social Outings');
      expect(prompt).toContain('2. Office Work');
    });

    it('should handle unknown scenario IDs gracefully', () => {
      const analysisData = { category: 'one_piece', subcategory: 'dress' };
      const analysisScope = getAnalysisScope('one_piece', 'dress');
      const preFilledData = {
        name: 'Mystery Dress',
        category: 'one_piece',
        scenarios: ['unknown-uuid-12345'] // Unknown UUID
      };

      const prompt = buildEnhancedAnalysisPrompt(
        analysisData, 
        analysisScope, 
        preFilledData, 
        mockScenariosWithIds, 
        null
      );

      // Should show unknown scenario with UUID
      expect(prompt).toContain('🏷️ WISHLIST ITEM - SCENARIO VALIDATION');
      expect(prompt).toContain('1. Unknown scenario (unknown-uuid-12345)');
    });
  });

  describe('Fallback Behavior', () => {
    it('should fallback to suggestion mode when no scenarios in preFilledData', () => {
      const analysisData = { category: 'one_piece', subcategory: 'dress' };
      const analysisScope = getAnalysisScope('one_piece', 'dress');
      const preFilledData = {
        name: 'Basic Dress',
        category: 'one_piece'
        // No scenarios field
      };

      const prompt = buildEnhancedAnalysisPrompt(
        analysisData, 
        analysisScope, 
        preFilledData, 
        mockScenariosWithIds, 
        null
      );

      // Should use suggestion mode, not validation mode
      expect(prompt).not.toContain('🏷️ WISHLIST ITEM - SCENARIO VALIDATION');
      expect(prompt).toContain('Evaluate suitability for these scenarios:');
    });

    it('should fallback to suggestion mode when scenarios array is empty', () => {
      const analysisData = { category: 'one_piece', subcategory: 'dress' };
      const analysisScope = getAnalysisScope('one_piece', 'dress');
      const preFilledData = {
        name: 'Basic Dress',
        category: 'one_piece',
        scenarios: [] // Empty array
      };

      const prompt = buildEnhancedAnalysisPrompt(
        analysisData, 
        analysisScope, 
        preFilledData, 
        mockScenariosWithIds, 
        null
      );

      // Should use suggestion mode, not validation mode
      expect(prompt).not.toContain('🏷️ WISHLIST ITEM - SCENARIO VALIDATION');
      expect(prompt).toContain('Evaluate suitability for these scenarios:');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty scenarios array', () => {
      const analysisData = { category: 'one_piece', subcategory: 'dress' };
      const analysisScope = getAnalysisScope('one_piece', 'dress');
      const preFilledData = {
        name: 'Test Dress',
        category: 'one_piece',
        scenarios: []
      };

      const prompt = buildEnhancedAnalysisPrompt(
        analysisData, 
        analysisScope, 
        preFilledData, 
        [], // No available scenarios
        null
      );

      // Should not crash and should fallback to suggestion mode
      expect(prompt).not.toContain('🏷️ WISHLIST ITEM - SCENARIO VALIDATION');
    });

    it('should handle null/undefined scenarios gracefully', () => {
      const analysisData = { category: 'one_piece', subcategory: 'dress' };
      const analysisScope = getAnalysisScope('one_piece', 'dress');
      const preFilledData = {
        name: 'Test Dress',
        category: 'one_piece',
        scenarios: null
      };

      const prompt = buildEnhancedAnalysisPrompt(
        analysisData, 
        analysisScope, 
        preFilledData, 
        mockScenariosWithIds, 
        null
      );

      // Should not crash
      expect(prompt).toBeDefined();
      expect(prompt).not.toContain('🏷️ WISHLIST ITEM - SCENARIO VALIDATION');
    });
  });
});
