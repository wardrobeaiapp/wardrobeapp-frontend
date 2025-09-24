const responseFormatter = require('../../utils/responseFormatter');

describe('responseFormatter', () => {
  describe('parseResponse', () => {
    it('should parse Claude response correctly', () => {
      const mockResponse = `
        ANALYSIS: This is a great bag for your wardrobe.
        SCORE: 8.5
        FEEDBACK: Recommended purchase
        FINAL RECOMMENDATION: This would be a nice addition!
      `;

      const result = responseFormatter.parseResponse(mockResponse);

      expect(result.score).toBe(8.5);
      expect(result.feedback).toBe('Recommended purchase');
      expect(result.finalRecommendation).toBe('This would be a nice addition!');
    });

    it('should handle response without sections', () => {
      const mockResponse = 'Simple analysis text';

      const result = responseFormatter.parseResponse(mockResponse);

      expect(result.score).toBe(5.0); // default score
      expect(result.analysis).toContain('text'); // The formatter processes the text
    });

    it('should extract score from SCORE section', () => {
      const mockResponse = 'SCORE: 9.2';

      const result = responseFormatter.parseResponse(mockResponse);

      expect(result.score).toBe(9.2);
    });
  });

  describe('formatStructuredAnalysis', () => {
    it('should format PROS and CONS sections', () => {
      const mockAnalysis = `
        PROS:
        1. Great quality material
        2. Versatile design
        CONS:
        1. Expensive price
        2. Limited color options
      `;

      const result = responseFormatter.formatStructuredAnalysis(mockAnalysis);

      expect(result).toContain('**PROS:**');
      expect(result).toContain('**CONS:**');
      expect(result).toContain('✓ Great quality material');
      expect(result).toContain('✗ Expensive price');
    });

    it('should handle SUITABLE SCENARIOS section', () => {
      const mockAnalysis = `
        SUITABLE SCENARIOS:
        1. Office Work
        2. Social Outings
      `;

      const result = responseFormatter.formatStructuredAnalysis(mockAnalysis);

      expect(result).toContain('**SUITABLE SCENARIOS:**');
      expect(result).toContain('🎯 Office Work');
      expect(result).toContain('🎯 Social Outings');
    });
  });

  describe('buildResponse', () => {
    it('should build complete response object', () => {
      const parsedResponse = {
        analysis: 'Great item',
        score: 8.5,
        feedback: 'Recommended',
        finalRecommendation: 'Buy it!'
      };

      const result = responseFormatter.buildResponse(parsedResponse);

      expect(result).toEqual({
        analysis: 'Great item',
        score: 8.5,
        feedback: 'Recommended',
        finalRecommendation: 'Buy it!'
      });
    });

    it('should include analysis data when provided', () => {
      const parsedResponse = {
        analysis: 'Great item',
        score: 8.5,
        feedback: 'Recommended',
        finalRecommendation: 'Buy it!'
      };
      
      const analysisData = {
        duplicate_detection: { method: 'enhanced' }
      };

      const result = responseFormatter.buildResponse(parsedResponse, analysisData);

      expect(result.analysis_data).toEqual(analysisData);
    });
  });

  describe('formatAnalysisData', () => {
    it('should format duplicate detection data', () => {
      const duplicateResult = {
        duplicateAnalysis: { hasMatch: false, confidence: 0.1 }
      };
      
      const result = responseFormatter.formatAnalysisData(duplicateResult);

      expect(result.duplicate_detection).toBeDefined();
      expect(result.duplicate_detection.method).toBe('enhanced_algorithmic');
      expect(result.duplicate_detection.data).toEqual(duplicateResult.duplicateAnalysis);
    });

    it('should format scenario coverage data', () => {
      const scenarioCoverage = [
        { scenarioName: 'Office Work', coverageLevel: 1 },
        { scenarioName: 'Social Outings', coverageLevel: 3 }
      ];
      
      const result = responseFormatter.formatAnalysisData(null, scenarioCoverage);

      expect(result.scenario_coverage).toBeDefined();
      expect(result.scenario_coverage.method).toBe('coverage_analysis');
      expect(result.scenario_coverage.has_gaps).toBe(true); // coverageLevel 1 <= 2
    });
  });
});
