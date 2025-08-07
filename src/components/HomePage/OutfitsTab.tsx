import React, { useState, useEffect } from 'react';
import { Outfit, Season } from '../../types';
import { getScenarioNamesForFilters } from '../../utils/scenarioUtils';
import OutfitCard from '../OutfitCard';
import {
  ItemsGrid,
  EmptyState,
  EmptyStateTitle,
  EmptyStateText,
  LoadingContainer,
  LoadingText,
  Spinner,
  ErrorContainer,
  FiltersContainer,
  FilterGroup,
  FilterLabel,
  Select
} from '../../pages/HomePage.styles';

interface OutfitsTabProps {
  outfits: Outfit[];
  isLoading: boolean;
  error: string | null;
  seasonFilter: string;
  setSeasonFilter: (season: string) => void;
  scenarioFilter: string;
  setScenarioFilter: (scenario: string) => void;
  onViewOutfit: (outfit: Outfit) => void;
  onDeleteOutfit: (id: string) => void;
}

const OutfitsTab: React.FC<OutfitsTabProps> = ({
  outfits,
  isLoading,
  error,
  seasonFilter,
  setSeasonFilter,
  scenarioFilter,
  setScenarioFilter,
  onViewOutfit,
  onDeleteOutfit
}) => {
  const [scenarioOptions, setScenarioOptions] = useState<string[]>([]);
  const [loadingScenarios, setLoadingScenarios] = useState(false);
  
  // Load scenario options from the premade list when component mounts
  useEffect(() => {
    const loadScenarioOptions = async () => {
      setLoadingScenarios(true);
      try {
        const options = await getScenarioNamesForFilters();
        setScenarioOptions(options);
      } catch (err) {
        console.error('Error loading scenario options:', err);
      } finally {
        setLoadingScenarios(false);
      }
    };
    
    loadScenarioOptions();
  }, []);
  return (
    <>
      {isLoading && (
        <LoadingContainer>
          <LoadingText>Loading your outfits...</LoadingText>
          <Spinner />
        </LoadingContainer>
      )}
      
      {error && (
        <ErrorContainer>
          <p>Error loading outfits: {error}</p>
          <p>Please try refreshing the page.</p>
        </ErrorContainer>
      )}

      <FiltersContainer>
        <FilterGroup>
          <FilterLabel htmlFor="outfit-season-filter">Season</FilterLabel>
          <Select
            id="outfit-season-filter"
            value={seasonFilter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSeasonFilter(e.target.value)}
          >
            <option value="all">All Seasons</option>
            {Object.values(Season)
              .filter(season => season !== Season.ALL_SEASON)
              .map(season => (
                <option key={season} value={season}>
                  {season.charAt(0).toUpperCase() + season.slice(1)}
                </option>
              ))}
          </Select>
        </FilterGroup>

        <FilterGroup>
          <FilterLabel htmlFor="outfit-scenario-filter">Scenario</FilterLabel>
          <Select
            id="outfit-scenario-filter"
            value={scenarioFilter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setScenarioFilter(e.target.value)}
          >
            <option value="all">All Scenarios</option>
            {loadingScenarios ? (
              <option disabled>Loading scenarios...</option>
            ) : (
              scenarioOptions.map(scenario => (
                <option key={scenario} value={scenario}>
                  {scenario}
                </option>
              ))
            )}
          </Select>
        </FilterGroup>
      </FiltersContainer>

      {outfits.length === 0 ? (
        <EmptyState>
          <EmptyStateTitle>You don't have any outfits yet</EmptyStateTitle>
          <EmptyStateText>
            Create your first outfit by clicking the "Add Outfit" button.
          </EmptyStateText>
        </EmptyState>
      ) : (
        <ItemsGrid>
          {outfits
            .filter(outfit => {
              // Filter by season
              const matchesSeason = seasonFilter === 'all' || 
                (outfit.season && Array.isArray(outfit.season) && 
                  outfit.season.includes(seasonFilter as Season));
              
              // Filter by scenario - case insensitive comparison
              const matchesScenario = scenarioFilter === 'all' || 
                (outfit.scenarios && outfit.scenarios.some(s => 
                  s.toLowerCase() === scenarioFilter.toLowerCase()
                )) || 
                (outfit.occasion && outfit.occasion.toLowerCase() === scenarioFilter.toLowerCase());
              
              return matchesSeason && matchesScenario;
            })
            .map(outfit => (
              <OutfitCard
                key={outfit.id}
                outfit={outfit}
                onView={() => onViewOutfit(outfit)}
                onDelete={() => onDeleteOutfit(outfit.id)}
              />
            ))}
        </ItemsGrid>
      )}
    </>
  );
};

export default OutfitsTab;
