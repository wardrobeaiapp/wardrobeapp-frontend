import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Outfit, WardrobeItem } from '../../../../types';
import { fetchScenarios } from '../../../../services/api';
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
  const [scenarioOptions, setScenarioOptions] = useState<string[]>([]);
  const [loadingScenarios, setLoadingScenarios] = useState(false);
  const { user } = useSupabaseAuth();

  // Load user's scenarios when component mounts or user changes
  useEffect(() => {
    let isMounted = true;
    
    const loadUserScenarios = async () => {
      if (!user) return;
      
      setLoadingScenarios(true);
      try {
        const userScenarios = await fetchScenarios(user.id);
        if (isMounted && userScenarios) {
          setScenarioOptions(userScenarios.map((scenario: { name: string }) => scenario.name));
        }
      } catch (err) {
        console.error('Error loading user scenarios:', err);
      } finally {
        if (isMounted) {
          setLoadingScenarios(false);
        }
      }
    };

    loadUserScenarios();
    
    return () => {
      isMounted = false;
    };
  }, [user]);

  // Handle scenario filter change
  const handleScenarioChange = useCallback((value: string) => {
    // Convert empty string to 'all' for consistency with the rest of the app
    setScenarioFilter(value === '' ? 'all' : value);
  }, []);

  // Prepare custom filters (empty array since we're handling scenario filter separately)
  const customFilters = useMemo(() => [], []);

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
          value={scenarioFilter === 'all' ? '' : scenarioFilter}
          onChange={handleScenarioChange}
          options={scenarioOptions.map(option => ({
            value: option,
            label: option
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
              
                          // Filter by scenario - case insensitive comparison
              const matchesScenario = 
                !scenarioFilter || 
                scenarioFilter === 'all' ||
                (outfit.scenarios && outfit.scenarios.some(s => 
                  s && s.toLowerCase() === scenarioFilter.toLowerCase()
                )) || 
                (outfit.occasion && outfit.occasion.toLowerCase() === scenarioFilter.toLowerCase());
              
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
