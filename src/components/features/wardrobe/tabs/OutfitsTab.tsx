import React, { useState, useEffect, useCallback } from 'react';
import { Outfit, WardrobeItem } from '../../../../types';
import { getScenariosForUser as fetchScenarios } from '../../../../services/scenarios/scenariosService';
import { useSupabaseAuth } from '../../../../context/SupabaseAuthContext';
import CollectionCard from '../cards/CollectionCard';
import { Season } from '../../../../types';
import { SearchFilter } from '../shared/Filters/SearchFilter';
import { SeasonFilter } from '../shared/Filters/SeasonFilter';
import { SelectFilter } from '../shared/Filters/SelectFilter';
import {
  FiltersContainer,
  ItemsGrid,
  EmptyState,
  EmptyStateTitle,
  EmptyStateText,
  LoadingContainer,
  LoadingText,
  Spinner,
  ErrorContainer
} from '../../../../pages/HomePage.styles';

interface OutfitsTabProps {
  outfits: Outfit[];
  wardrobeItems: WardrobeItem[];
  isLoading: boolean;
  error: string | null;
  seasonFilter: string;
  setSeasonFilter: (season: string) => void;
  scenarioFilter: string;
  setScenarioFilter: (scenario: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onViewOutfit: (outfit: Outfit) => void;
  onDeleteOutfit: (id: string) => void;
}

const OutfitsTab: React.FC<OutfitsTabProps> = ({
  outfits,
  wardrobeItems,
  isLoading,
  error,
  seasonFilter,
  setSeasonFilter,
  scenarioFilter,
  setScenarioFilter,
  searchQuery,
  setSearchQuery,
  onViewOutfit,
  onDeleteOutfit
}) => {
  const [scenarioOptions, setScenarioOptions] = useState<Array<{id: string, name: string}>>([]);
  const { user } = useSupabaseAuth();

  // Load user's scenarios when component mounts or user changes
  useEffect(() => {
    let isMounted = true;
    
    const loadUserScenarios = async () => {
      if (!user) return;
      
      try {
        const userScenarios = await fetchScenarios(user.id);
        if (isMounted && userScenarios) {
          // Store both id and name to properly map between them
          setScenarioOptions(userScenarios.map((scenario: { id: string, name: string }) => ({
            id: scenario.id,
            name: scenario.name
          })));
        }
      } catch (err) {
        console.error('Error loading user scenarios:', err);
      }
    };

    loadUserScenarios();
    
    return () => {
      isMounted = false;
    };
  }, [user]);

  // Handle scenario filter change - now using scenario IDs
  const handleScenarioChange = useCallback((value: string) => {
    // Convert empty string to 'all' for consistency with the rest of the app
    // When a name is selected, find the corresponding ID and use that
    if (value === '' || value === 'all') {
      // Handle empty or 'all' value
      setScenarioFilter('all');
    } else {
      // Find the scenario ID that matches this name
      const selectedScenario = scenarioOptions.find(s => s.name === value);
      if (selectedScenario) {
        setScenarioFilter(selectedScenario.id);
      } else {
        console.debug(`[OutfitsTab] Could not find scenario with name: ${value} - defaulting to 'all'`);
        setScenarioFilter('all');
      }
    }
  }, [setScenarioFilter, scenarioOptions]);

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
        <SearchFilter
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search outfits..."
          className="flex-1 max-w-[300px]"
        />

        <SeasonFilter
          value={seasonFilter}
          onChange={setSeasonFilter}
          id="outfits-season-filter"
          className="min-w-[200px]"
        />

        <SelectFilter
          id="outfits-scenario-filter"
          label="Scenario"
          value={scenarioFilter === 'all' ? '' : scenarioOptions.find(s => s.id === scenarioFilter)?.name || ''}
          onChange={handleScenarioChange}
          options={scenarioOptions.map(option => ({
            value: option.name,
            label: option.name
          }))}
          className="min-w-[200px]"
          allOptionLabel="All Scenarios"
        />
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
              
                          // Filter by scenario - now using scenario IDs instead of names
              const hasOutfitScenarios = outfit.scenarios && Array.isArray(outfit.scenarios) && outfit.scenarios.length > 0;
              // Only check includes if we've verified scenarios exists
              const scenarioMatch = hasOutfitScenarios && outfit.scenarios?.includes(scenarioFilter);
              
              // Debug logging to trace scenario filtering
              if (scenarioFilter !== 'all' && scenarioFilter) {
                console.log(`[OutfitsTab] Filtering outfit ${outfit.id} with scenario ${scenarioFilter}:`);
                console.log(`  - Outfit scenarios:`, outfit.scenarios);
                console.log(`  - Matches filter:`, scenarioMatch);
              }
              
              const matchesScenario = 
                !scenarioFilter || 
                scenarioFilter === 'all' ||
                scenarioMatch;
              
              return matchesSeason && matchesScenario;
            })
            .map(outfit => (
              <CollectionCard
                key={outfit.id}
                type="outfit"
                data={outfit}
                onView={(data) => onViewOutfit(data as Outfit)}
                wardrobeItems={wardrobeItems}
              />
            ))}
        </ItemsGrid>
      )}
    </>
  );
};

export default OutfitsTab;
