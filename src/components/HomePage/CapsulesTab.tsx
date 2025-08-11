import React, { useState, useEffect } from 'react';
import { MdSearch } from 'react-icons/md';
import { Capsule, Season } from '../../types';
import { getScenarioNamesForFilters } from '../../utils/scenarioUtils';
import CapsuleItemCounter from '../capsule/CapsuleItemCounter';
import {
  ItemsGrid,
  EmptyState,
  EmptyStateTitle,
  EmptyStateText,
  LoadingContainer,
  LoadingText,
  Spinner,
  ErrorContainer,
  CapsuleCard,
  CapsuleHeader,
  CapsuleSeasons,
  SeasonTag,
  CapsuleDescription,
  CapsuleFooter,
  CapsuleItemCount,
  CapsuleActions,
  ActionButton,
  FiltersContainer,
  FilterGroup,
  FilterLabel,
  Select,
  SearchContainer,
  SearchIcon,
  SearchInput
} from '../../pages/HomePage.styles';

interface CapsulesTabProps {
  capsules: Capsule[];
  isLoading: boolean;
  error: string | null;
  seasonFilter: string;
  setSeasonFilter: (season: string) => void;
  scenarioFilter: string;
  setScenarioFilter: (scenario: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onViewCapsule: (capsule: Capsule) => void;
  onDeleteCapsule: (id: string) => void;
}

const CapsulesTab: React.FC<CapsulesTabProps> = ({
  capsules,
  isLoading,
  error,
  seasonFilter,
  setSeasonFilter,
  scenarioFilter,
  setScenarioFilter,
  searchQuery,
  setSearchQuery,
  onViewCapsule,
  onDeleteCapsule
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
          <LoadingText>Loading your capsules...</LoadingText>
          <Spinner />
        </LoadingContainer>
      )}
      
      {error && (
        <ErrorContainer>
          <p>Error loading capsules: {error}</p>
          <p>Please try refreshing the page.</p>
        </ErrorContainer>
      )}

      <FiltersContainer>
        <FilterGroup>
          <FilterLabel htmlFor="capsule-search-input">Search</FilterLabel>
          <SearchContainer>
            <SearchIcon>
              <MdSearch />
            </SearchIcon>
            <SearchInput
              id="capsule-search-input"
              type="text"
              placeholder="Search capsules by name, scenario..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            />
          </SearchContainer>
        </FilterGroup>

        <FilterGroup>
          <FilterLabel htmlFor="capsule-season-filter">Season</FilterLabel>
          <Select
            id="capsule-season-filter"
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
          <FilterLabel htmlFor="capsule-scenario-filter">Scenario</FilterLabel>
          <Select
            id="capsule-scenario-filter"
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

      {capsules.length === 0 ? (
        <EmptyState>
          <EmptyStateTitle>You don't have any capsules yet</EmptyStateTitle>
          <EmptyStateText>
            Create your first capsule by clicking the "Add Capsule" button.
          </EmptyStateText>
        </EmptyState>
      ) : (
        <ItemsGrid>
          {capsules
            .filter(capsule => {
              // Filter by season
              const matchesSeason = seasonFilter === 'all' || 
                (capsule.seasons && Array.isArray(capsule.seasons) && 
                  capsule.seasons.includes(seasonFilter as Season));
              
              // Filter by scenario
              const matchesScenario = scenarioFilter === 'all' || 
                capsule.scenario === scenarioFilter;
              
              return matchesSeason && matchesScenario;
            })
            .map(capsule => (
              <CapsuleCard key={capsule.id}>
                <CapsuleHeader>
                  <h3>{capsule.name}</h3>
                  <CapsuleSeasons>
                    {capsule.seasons.map(season => (
                      <SeasonTag key={season}>{season}</SeasonTag>
                    ))}
                  </CapsuleSeasons>
                </CapsuleHeader>
                
                {capsule.description && (
                  <CapsuleDescription>{capsule.description}</CapsuleDescription>
                )}
                
                <CapsuleFooter>
                  <CapsuleItemCount>
                    <CapsuleItemCounter capsuleId={capsule.id} fallbackCount={capsule.selectedItems?.length || 0} />
                  </CapsuleItemCount>
                  <CapsuleActions>
                    <ActionButton onClick={() => onViewCapsule(capsule)}>View</ActionButton>
                    <ActionButton onClick={() => onDeleteCapsule(capsule.id)}>Delete</ActionButton>
                  </CapsuleActions>
                </CapsuleFooter>
              </CapsuleCard>
            ))}
        </ItemsGrid>
      )}
    </>
  );
};

export default CapsulesTab;
