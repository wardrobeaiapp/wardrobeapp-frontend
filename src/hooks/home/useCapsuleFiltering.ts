import { useMemo } from 'react';
import { Capsule, Season } from '../../types';

export interface CapsuleFilterOptions {
  season?: string | string[];
  scenario?: string;
  searchQuery?: string;
}

export const useCapsuleFiltering = (
  capsules: Capsule[], 
  options?: CapsuleFilterOptions
) => {
  // Default filter values
  const {
    season = 'all',
    scenario = 'all',
    searchQuery = ''
  } = options || {};

  const filteredCapsules = useMemo(() => {
    return capsules.filter(capsule => {
      const searchLower = searchQuery.toLowerCase();
      const capsuleScenarios = capsule.scenarios || [];
      const capsuleSeasons = capsule.seasons || [];
      
      // Season filter - handle both string and string[] for season
      const matchesSeason = season === 'all' || 
        (Array.isArray(season)
          ? season.some(s => s === 'all' || capsuleSeasons.includes(s as Season))
          : capsuleSeasons.includes(season as Season));
      
      // Scenario filter
      const matchesScenario = scenario === 'all' || 
        capsuleScenarios.includes(scenario);
      
      // Search query - search name and scenarios
      const matchesSearch = searchQuery === '' || 
        capsule.name.toLowerCase().includes(searchLower) ||
        capsuleScenarios.some(s => s.toLowerCase().includes(searchLower));
      
      return matchesSeason && matchesScenario && matchesSearch;
    });
  }, [capsules, season, scenario, searchQuery]);

  return {
    filteredCapsules,
    capsuleCount: filteredCapsules.length
  };
};

export default useCapsuleFiltering;
