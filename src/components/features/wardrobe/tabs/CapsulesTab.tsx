import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { Season, Capsule, WardrobeItem } from '../../../../types';
import { getScenariosForUser as fetchScenarios } from '../../../../services/scenarios/scenariosService';
import { useSupabaseAuth } from '../../../../context/SupabaseAuthContext';
import CollectionCard from '../cards/CollectionCard';
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

interface CapsulesTabProps {
  capsules?: Capsule[];
  wardrobeItems?: WardrobeItem[];
  isLoading: boolean;
  error: string | null;
  seasonFilter: string;
  setSeasonFilter: (season: string) => void;
  scenarioFilter: string;
  setScenarioFilter: (scenario: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onViewCapsule: (capsule: Capsule) => void;
  onDeleteCapsule?: (id: string) => void;
}

// Memoize the collection card to prevent unnecessary re-renders
const MemoizedCollectionCard = memo(CollectionCard);

const CapsulesTabComponent: React.FC<CapsulesTabProps> = ({
  capsules = [],
  wardrobeItems = [],
  isLoading,
  error,
  seasonFilter,
  setSeasonFilter,
  scenarioFilter,
  setScenarioFilter,
  searchQuery,
  setSearchQuery,
  onViewCapsule,
}) => {
  const [scenarioOptions, setScenarioOptions] = useState<string[]>([]);
  const [loadingScenarios, setLoadingScenarios] = useState(false);
  
  // Memoize scenario options to prevent recalculation on every render
  const scenarioOptionsList = useMemo(() => {
    if (loadingScenarios) {
      return [{ value: 'loading', label: 'Loading scenarios...', disabled: true }];
    }
    return scenarioOptions.map(option => ({
      value: option,
      label: option
    }));
  }, [scenarioOptions, loadingScenarios]);
  
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
  }, []);

  // Handle scenario filter change
  const handleScenarioChange = useCallback((value: string) => {
    // Convert empty string to 'all' for consistency
    setScenarioFilter(value === '' ? 'all' : value);
  }, [setScenarioFilter]);

  // Prepare custom filters for the FiltersPanel
  const customFilters = useMemo(() => {
    const scenarioOptionsList = loadingScenarios
      ? [{ value: 'loading', label: 'Loading scenarios...', disabled: true }]
      : scenarioOptions.map(option => ({
          value: option,
          label: option
        }));
        
    return [{
      id: 'scenario',
      label: 'Scenario',
      value: scenarioFilter === 'all' ? '' : scenarioFilter,
      options: scenarioOptionsList,
      onChange: handleScenarioChange
    }];
  }, [scenarioFilter, scenarioOptions, loadingScenarios, handleScenarioChange]);

  // Memoize the filter function to prevent recreation on every render
  const filterCapsules = useCallback((capsule: Capsule) => {
    // Filter by search query
    const matchesSearch = searchQuery === '' || 
      capsule.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by season
    const matchesSeason = seasonFilter === 'all' || 
      (Array.isArray(capsule.seasons) && capsule.seasons.includes(seasonFilter as Season));
    
    // Filter by scenario - check if any of the capsule's scenarios match the filter
    const matchesScenario = 
      !scenarioFilter || 
      scenarioFilter === 'all' ||
      (Array.isArray(capsule.scenarios) && 
       capsule.scenarios.some(scenario => 
         scenario && scenario.toLowerCase() === scenarioFilter.toLowerCase()
       ));
    
    return matchesSearch && matchesSeason && matchesScenario;
  }, [searchQuery, seasonFilter, scenarioFilter]);
  
  // Filter capsules based on search, season, and scenario filters
  const filteredCapsules = useMemo(() => {
    if (!capsules || !capsules.length) return [];
    return capsules.filter(filterCapsules);
  }, [capsules, filterCapsules]);

  // Memoize the search handler to prevent recreation on every render
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, [setSearchQuery]);
  
  // Memoize the season filter handler
  const handleSeasonChange = useCallback((value: string) => {
    setSeasonFilter(value);
  }, [setSeasonFilter]);
  
  
  // Memoize the view capsule handler
  const handleViewCapsuleClick = useCallback((data: Capsule | any) => {
    if ('seasons' in data && 'scenarios' in data) {
      onViewCapsule(data as Capsule);
    }
  }, [onViewCapsule]);
  
  // Render loading state
  if (isLoading) {
    return (
      <LoadingContainer>
        <LoadingText>Loading your capsules...</LoadingText>
        <Spinner />
      </LoadingContainer>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <ErrorContainer>
        <p>Error loading capsules: {error}</p>
        <p>Please try refreshing the page.</p>
      </ErrorContainer>
    );
  }
  
  return (
    <>
      <FiltersContainer>
        <SearchFilter
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search capsules..."
        />
        <SeasonFilter
          value={seasonFilter}
          onChange={handleSeasonChange}
        />
        <SelectFilter
          id="scenario-filter"
          label="Scenario"
          value={scenarioFilter}
          onChange={handleScenarioChange}
          options={scenarioOptionsList}
          allOptionLabel="All Scenarios"
        />
      </FiltersContainer>
      
      {filteredCapsules.length === 0 ? (
        <EmptyState>
          <EmptyStateTitle>
            {searchQuery || seasonFilter !== 'all' || scenarioFilter !== 'all' 
              ? 'No matching capsules found' 
              : "You don't have any capsules yet"}
          </EmptyStateTitle>
          <EmptyStateText>
            {searchQuery || seasonFilter !== 'all' || scenarioFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Create your first capsule by clicking the "Add Capsule" button.'}
          </EmptyStateText>
        </EmptyState>
      ) : (
        <ItemsGrid>
          {filteredCapsules.map(capsule => (
            <MemoizedCollectionCard
              key={capsule.id}
              type="capsule"
              data={capsule}
              onView={handleViewCapsuleClick}
              wardrobeItems={wardrobeItems}
            />
          ))}
        </ItemsGrid>
      )}
    </>
  );
};

// Add display name for better debugging in React DevTools
const CapsulesTab = memo(CapsulesTabComponent);
CapsulesTab.displayName = 'CapsulesTab';

export default CapsulesTab;
