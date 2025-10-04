/**
 * Wishlist Scenario Validation Integration Tests
 * 
 * Tests the critical difference between:
 * - Regular items: AI suggests suitable scenarios
 * - Wishlist items: AI validates user's pre-selected scenarios
 */

const { buildEnhancedAnalysisPrompt } = require('../../utils/ai/enhancedPromptBuilder');
const { getAnalysisScope } = require('../../utils/ai/analysisScopeUtils');

describe('Wishlist Scenario Validation Integration', () => {
  const mockScenarios = [
    { name: 'Office Work', description: 'Business casual dress code' },
    { name: 'Social Outings', description: 'Casual to smart casual events' },
    { name: 'Staying at Home', description: 'Comfort-focused activities' }
  ];

  describe('Regular Items (Suggestion Mode)', () => {
    it('should use suggestion mode for items without preFilledData', () => {
      const analysisData = { category: 'TOP', subcategory: 't-shirt' };
      const analysisScope = getAnalysisScope('TOP', 't-shirt');
      const preFilledData = null; // No wishlist data
      
      const prompt = buildEnhancedAnalysisPrompt(
        analysisData, 
        analysisScope, 
        preFilledData, 
        mockScenarios, 
        null
      );

      // Should suggest scenarios from the full list
      expect(prompt).toContain('Evaluate suitability for these scenarios:');
      expect(prompt).toContain('Office Work: Business casual dress code');
      expect(prompt).toContain('Social Outings: Casual to smart casual events');
      expect(prompt).toContain('List ONLY truly suitable scenarios');
      expect(prompt).not.toContain('WISHLIST ITEM - SCENARIO VALIDATION');
    });
  });

  describe('Wishlist Items (Validation Mode)', () => {
    it('should use validation mode when wishlist item has pre-selected scenarios', () => {
      const analysisData = { category: 'TOP', subcategory: 't-shirt', isFromWishlist: true };
      const analysisScope = getAnalysisScope('TOP', 't-shirt');
      const preFilledData = {
        name: 'Wishlist T-Shirt',
        category: 'TOP',
        scenarios: ['Office Work', 'Social Outings'] // User pre-selected these
      };
      
      const prompt = buildEnhancedAnalysisPrompt(
        analysisData, 
        analysisScope, 
        preFilledData, 
        mockScenarios, 
        null
      );

      // Should validate user's pre-selected scenarios
      expect(prompt).toContain('WISHLIST ITEM - SCENARIO VALIDATION');
      expect(prompt).toContain('The user already selected these scenarios');
      expect(prompt).toContain('1. Office Work');
      expect(prompt).toContain('2. Social Outings');
      expect(prompt).toContain('VALIDATE whether this item is actually suitable');
      expect(prompt).toContain('Be honest - if the user\'s choice doesn\'t match');
      expect(prompt).not.toContain('Evaluate suitability for these scenarios:');
    });

    it('should use validation mode with suitableScenarios field as fallback', () => {
      const analysisData = { category: 'TOP', subcategory: 'dress', isFromWishlist: true };
      const analysisScope = getAnalysisScope('TOP', 'dress');
      const preFilledData = {
        name: 'Wishlist Dress',
        category: 'ONE_PIECE',
        suitableScenarios: ['Social Outings'] // Alternative field name
      };
      
      const prompt = buildEnhancedAnalysisPrompt(
        analysisData, 
        analysisScope, 
        preFilledData, 
        mockScenarios, 
        null
      );

      // Should validate the suitableScenarios
      expect(prompt).toContain('WISHLIST ITEM - SCENARIO VALIDATION');
      expect(prompt).toContain('1. Social Outings');
      expect(prompt).toContain('VALIDATION TASK');
    });

    it('should fallback to suggestion mode for wishlist items without pre-selected scenarios', () => {
      const analysisData = { category: 'TOP', subcategory: 't-shirt', isFromWishlist: true };
      const analysisScope = getAnalysisScope('TOP', 't-shirt');
      const preFilledData = {
        name: 'Wishlist T-Shirt',
        category: 'TOP'
        // No scenarios or suitableScenarios field
      };
      
      const prompt = buildEnhancedAnalysisPrompt(
        analysisData, 
        analysisScope, 
        preFilledData, 
        mockScenarios, 
        null
      );

      // Should fall back to suggestion mode
      expect(prompt).toContain('Evaluate suitability for these scenarios:');
      expect(prompt).not.toContain('WISHLIST ITEM - SCENARIO VALIDATION');
    });
  });

  describe('Critical Business Logic', () => {
    it('should prevent wishlist items from suggesting unselected scenarios', () => {
      const preFilledData = {
        name: 'Work Dress',
        scenarios: ['Office Work'] // User only selected Office Work
      };
      
      const prompt = buildEnhancedAnalysisPrompt(
        { category: 'ONE_PIECE', subcategory: 'dress' }, 
        getAnalysisScope('ONE_PIECE', 'dress'), 
        preFilledData, 
        mockScenarios, 
        null
      );

      // Should only validate Office Work, not suggest Social Outings
      expect(prompt).toContain('1. Office Work');
      expect(prompt).not.toContain('2. Social Outings');
      expect(prompt).not.toContain('3. Staying at Home');
      expect(prompt).toContain('VALIDATION TASK');
    });

    it('should flag validation concerns when user choice might not match item', () => {
      const preFilledData = {
        scenarios: ['Office Work', 'Social Outings']
      };
      
      const prompt = buildEnhancedAnalysisPrompt(
        { category: 'TOP', subcategory: 't-shirt' }, 
        getAnalysisScope('TOP', 't-shirt'), 
        preFilledData, 
        mockScenarios, 
        null
      );

      // Should instruct AI to flag mismatches
      expect(prompt).toContain('If NOT suitable: Explain why in the analysis');
      expect(prompt).toContain('Be honest - if the user\'s choice doesn\'t match the item, flag it');
      expect(prompt).toContain('Consider dress codes, formality, and practical reality');
    });
  });
});
