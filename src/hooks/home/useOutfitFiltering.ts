import { useMemo } from 'react';
import { Outfit, Season, ItemCategory } from '../../types';

export interface OutfitFilterOptions {
  season?: string | string[];
  scenario?: string;
  searchQuery?: string;
}

export const useOutfitFiltering = (
  outfits: Outfit[], 
  options: OutfitFilterOptions
) => {
  // Default filter values
  const {
    season = 'all',
    scenario = 'all',
    searchQuery = ''
  } = options || {};

  const filteredOutfits = useMemo(() => {
    return outfits.filter(outfit => {
      const searchLower = searchQuery.toLowerCase();
      const outfitScenarios = outfit.scenarios || [];
      const outfitSeasons = Array.isArray(outfit.season) ? outfit.season : [outfit.season];
      
      // Season filter - handle both string and string[] for season
      const matchesSeason = season === 'all' || 
        (Array.isArray(season)
          ? season.some(s => s === 'all' || outfitSeasons.includes(s as Season))
          : outfitSeasons.includes(season as Season));
      
      // Scenario filter
      const matchesScenario = scenario === 'all' || 
        outfitScenarios.includes(scenario);
      
      // Search query - search name, scenarios, and item categories
      const matchesSearch = searchQuery === '' || 
        outfit.name.toLowerCase().includes(searchLower) ||
        outfitScenarios.some(s => s.toLowerCase().includes(searchLower)) ||
        (outfit.scenarioNames && outfit.scenarioNames.some(s => s.toLowerCase().includes(searchLower)));
      
      return matchesSeason && matchesScenario && matchesSearch;
    });
  }, [outfits, season, scenario, searchQuery]);

  return {
    filteredOutfits,
    outfitCount: filteredOutfits.length
  };
};

export default useOutfitFiltering;
