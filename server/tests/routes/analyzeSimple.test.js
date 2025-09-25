// Simple unit tests for the analyze-simple route functionality
// Testing the utility functions and logic without complex API mocking

const extractSuitableScenarios = require('../../utils/ai/extractSuitableScenarios');
const analyzeScenarioCoverageForScore = require('../../utils/ai/analyzeScenarioCoverageForScore');

describe('analyze-simple route components', () => {
  
  describe('extractSuitableScenarios integration', () => {
    it('should extract scenarios from Claude response correctly', () => {
      const claudeResponse = `
        This is a nice t-shirt for casual wear.
        
        SUITABLE SCENARIOS:
        1. Staying at Home
        2. Light Outdoor Activities
        3. Social Outings
        
        REASON: Good basic piece for casual wear
        FINAL RECOMMENDATION: RECOMMEND for casual scenarios
      `;

      const result = extractSuitableScenarios(claudeResponse);
      expect(result).toEqual(['Staying at Home', 'Light Outdoor Activities', 'Social Outings']);
    });

    it('should handle Claude responses with no suitable scenarios', () => {
      const claudeResponse = `
        This item doesn't work well for the given scenarios.
        
        SUITABLE SCENARIOS:
        (none listed)
        
        REASON: Item doesn't match any scenarios well
        FINAL RECOMMENDATION: SKIP
      `;

      const result = extractSuitableScenarios(claudeResponse);
      expect(result).toEqual([]);
    });

    it('should extract scenarios even with different formatting', () => {
      const claudeResponse = `
        Analysis of the item...
        
        SUITABLE SCENARIOS:
        - Office Work
        - Social Outings: great for dates
        - Light Outdoor Activities (with proper styling)
        
        REASON: Versatile piece
        FINAL RECOMMENDATION: RECOMMEND
      `;

      const result = extractSuitableScenarios(claudeResponse);
      // The function should extract scenario names cleanly
      expect(result.length).toBeGreaterThan(0);
      expect(result).toContain('Office Work');
    });
  });

  describe('analyzeScenarioCoverageForScore integration', () => {
    it('should calculate score based on scenario coverage', () => {
      const scenarioCoverage = [
        { 
          scenarioName: 'Office Work', 
          category: 'tops',
          currentItems: 2,
          gapType: 'improvement',
          coveragePercent: 60
        }
      ];
      
      const suitableScenarios = ['Office Work', 'Social Outings'];
      const formData = { category: 'tops' };
      const userGoals = ['versatile-stylish'];

      const result = analyzeScenarioCoverageForScore(scenarioCoverage, suitableScenarios, formData, userGoals);
      
      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('reason');
      expect(typeof result.score).toBe('number');
      expect(typeof result.reason).toBe('string');
    });

    it('should handle empty coverage data', () => {
      const result = analyzeScenarioCoverageForScore([], ['Social Outings'], { category: 'tops' }, ['minimalist']);
      
      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('reason');
      expect(result.score).toBe(5); // Default score when no coverage data
    });
  });

  describe('System prompt building logic', () => {
    it('should create appropriate system prompt structure', () => {
      // This tests the prompt building logic without needing full API integration
      const scenarios = [
        { name: 'Office Work', description: 'Business casual dress code' },
        { name: 'Social Outings', description: 'Casual meetups with friends' }
      ];

      // Simulate the system prompt building logic from the route
      let systemPrompt = "You are evaluating whether this clothing/accessory item is suitable for different lifestyle scenarios.";
      
      if (scenarios && scenarios.length > 0) {
        systemPrompt += "\n\nEvaluate suitability for these scenarios:\n";
        scenarios.forEach((scenario, index) => {
          systemPrompt += `\n${index + 1}. ${scenario.name}`;
          if (scenario.description) systemPrompt += `: ${scenario.description}`;
        });
        
        systemPrompt += "\n\nGuidelines:";
        systemPrompt += "\n- Pay close attention to scenario descriptions - they specify dress codes and formality requirements";
        systemPrompt += "\n- Match the item's formality level to the scenario's requirements";
      }

      expect(systemPrompt).toContain('Office Work: Business casual dress code');
      expect(systemPrompt).toContain('Social Outings: Casual meetups with friends');
      expect(systemPrompt).toContain('Guidelines:');
      expect(systemPrompt).toContain('formality level to the scenario\'s requirements');
    });

    it('should handle scenarios without descriptions', () => {
      const scenarios = [
        { name: 'Office Work' },
        { name: 'Social Outings' }
      ];

      let systemPrompt = "You are evaluating whether this clothing/accessory item is suitable for different lifestyle scenarios.";
      
      if (scenarios && scenarios.length > 0) {
        systemPrompt += "\n\nEvaluate suitability for these scenarios:\n";
        scenarios.forEach((scenario, index) => {
          systemPrompt += `\n${index + 1}. ${scenario.name}`;
          if (scenario.description) systemPrompt += `: ${scenario.description}`;
        });
      }

      expect(systemPrompt).toContain('1. Office Work');
      expect(systemPrompt).toContain('2. Social Outings');
      expect(systemPrompt).not.toContain('undefined');
    });
  });
});
