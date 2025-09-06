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
}: CapsulesTabProps) => {
  const [scenarioOptions, setScenarioOptions] = useState<Array<{id: string, name: string}>>([]);
  const [loadingScenarios, setLoadingScenarios] = useState(false);
  const { user } = useSupabaseAuth();
  
  // Add debug logging for current scenario filter and dropdown state
  useEffect(() => {
    console.log('[CapsulesTab] Current scenario filter:', scenarioFilter);
    console.log('[CapsulesTab] Dropdown display value:', scenarioFilter === 'all' ? 'All Scenarios' : 
      scenarioOptions.find(s => s.id === scenarioFilter)?.name || 'Unknown');
    console.log('[CapsulesTab] Available scenario options:', scenarioOptions);
  }, [scenarioFilter, scenarioOptions]);

  // Load user's scenarios when component mounts or user changes
  useEffect(() => {
    let isMounted = true;
    
    const loadUserScenarios = async () => {
      if (user) {
        try {
          setLoadingScenarios(true);
          const userScenarios = await fetchScenarios(user.id);
          if (isMounted) {
            // Store both id and name to properly map between them
            setScenarioOptions(userScenarios.map((scenario: { id: string, name: string }) => ({
              id: scenario.id,
              name: scenario.name
            })));
          }
        } catch (error) {
          console.error('Failed to load scenarios:', error);
        } finally {
          if (isMounted) {
            setLoadingScenarios(false);
          }
        }
      }
    };
    
    loadUserScenarios();
    
    return () => {
      isMounted = false;
    };
  }, [user]);

  // Handle scenario filter change - now using scenario IDs directly
  const handleScenarioChange = useCallback((value: string) => {
    console.log(`[CapsulesTab] handleScenarioChange called with value: ${value}`);
    
    // The value received is already the scenario ID or 'all'
    setScenarioFilter(value);
    
    // Log selected scenario name for debugging
    if (value !== 'all') {
      const selectedName = scenarioOptions.find(s => s.id === value)?.name;
      console.log(`[CapsulesTab] Selected scenario ID ${value} with name: ${selectedName || 'Unknown'}`);
    } else {
      console.log(`[CapsulesTab] Filter set to 'all'`);
    }
  }, [setScenarioFilter, scenarioOptions]);

  // Prepare scenario options for the filter
  const scenarioOptionsList = useMemo(() => {
    return loadingScenarios
      ? [{ value: 'loading', label: 'Loading scenarios...', disabled: true }]
      : scenarioOptions.map(option => ({
          value: option.id, // Use ID as the value to match with handleScenarioChange
          label: option.name  // Use the name as display label for the dropdown
        }));
  }, [loadingScenarios, scenarioOptions]);
  

  // Define the filter function type
  type CapsuleFilterFn = (capsule: Capsule) => boolean;

  // Memoize the filter function to prevent recreation on every render
  const filterCapsules: CapsuleFilterFn = useCallback((capsule: Capsule) => {
    // Filter by search query
    const matchesSearch = searchQuery === '' || 
      capsule.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by season
    const matchesSeason = seasonFilter === 'all' || 
      (Array.isArray(capsule.seasons) && capsule.seasons.includes(seasonFilter as Season));
    
    // Debug logging when filtering with non-default scenario filter
    if (scenarioFilter && scenarioFilter !== 'all') {
      console.log(`[CapsulesTab] Filtering capsule ${capsule.id} with scenario filter: ${scenarioFilter}`);
      console.log(`[CapsulesTab] Capsule scenarios:`, capsule.scenarios);
    }

    // Filter by scenario ID - match capsule scenario IDs with the filter ID
    const matchesScenario = 
      !scenarioFilter || 
      scenarioFilter === 'all' ||
      (Array.isArray(capsule.scenarios) && 
       capsule.scenarios.includes(scenarioFilter));
    
    // Log when there's a scenario filter but no match
    if (scenarioFilter && scenarioFilter !== 'all' && !matchesScenario) {
      console.log(`[CapsulesTab] No scenario match for capsule ${capsule.id}`);
    }
    
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
        {/* Debug logging moved to useEffect */}
        <SelectFilter
          id="scenario-filter"
          label="Scenario"
          value={scenarioFilter}
          onChange={handleScenarioChange}
          options={scenarioOptions.map(option => ({
            value: option.id, // Use ID as the value
            label: option.name // Use name as the display label
          }))}
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
