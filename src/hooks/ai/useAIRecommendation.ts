import { useState, useEffect } from 'react';
import { getScenarioNamesForFilters } from '../../utils/scenarioUtils';

export const useAIRecommendation = () => {
  const [selectedSeason, setSelectedSeason] = useState('all');
  const [selectedScenario, setSelectedScenario] = useState('all');
  const [scenarioOptions, setScenarioOptions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [recommendationText, setRecommendationText] = useState('');

  useEffect(() => {
    const loadScenarioOptions = async () => {
      setIsLoading(true);
      try {
        const options = await getScenarioNamesForFilters();
        setScenarioOptions(options);
      } catch (err) {
        console.error('Error loading scenario options:', err);
        setError('Failed to load scenario options');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadScenarioOptions();
  }, []);

  const getRecommendation = async () => {
    if (selectedSeason === 'all' || selectedScenario === 'all') {
      setError('Please select both season and scenario');
      return null;
    }

    setIsLoading(true);
    setError('');

    try {
      // This would be replaced with an actual API call
      const response = await new Promise<string>((resolve) => {
        setTimeout(() => {
          resolve(`Here are some outfit recommendations for ${selectedScenario} in ${selectedSeason}...`);
        }, 1000);
      });

      setRecommendationText(response);
      return response;
    } catch (err) {
      console.error('Error getting recommendation:', err);
      setError('Failed to get recommendations');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const resetRecommendation = () => {
    setRecommendationText('');
    setError('');
  };

  return {
    // State
    selectedSeason,
    selectedScenario,
    scenarioOptions,
    isLoading,
    error,
    recommendationText,
    
    // Handlers
    setSelectedSeason,
    setSelectedScenario,
    getRecommendation,
    resetRecommendation,
  };
};
