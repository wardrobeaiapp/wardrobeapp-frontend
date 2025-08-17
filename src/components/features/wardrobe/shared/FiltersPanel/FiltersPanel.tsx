import React from 'react';
import { Season, ItemCategory } from '../../../../../types';
import { formatCategoryForFilter } from '../../../../../utils/textFormatting';
import { FormField, FormInput, FormSelect } from '../../../../../components/common/Form';
import styled from 'styled-components';
import { MdSearch } from 'react-icons/md';
import { formTokens } from '../../../../../styles/tokens/forms';
import { FiltersContainer as StyledFiltersContainer } from '../../../../../pages/HomePage.styles';

const FiltersContainer = styled(StyledFiltersContainer)<{ $layout?: 'horizontal' | 'vertical' }>`
  flex-direction: ${props => props.$layout === 'vertical' ? 'column' : 'row'};
  margin-bottom: ${formTokens.spacing.xl};
  width: 100%;
  align-items: flex-end;
`;

const SearchContainer = styled(FormField)`
  flex: 0 0 auto;
  min-width: 200px;
  max-width: 300px;
  margin: 0;
  
  .form-input-container {
    position: relative;
    width: 100%;
  }
  
  .search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: ${formTokens.colors.textMuted};
    pointer-events: none;
    z-index: 1;
  }
`;

const FilterGroup = styled.div<{ $layout?: 'horizontal' | 'vertical' }>`
  display: flex;
  gap: ${formTokens.spacing.md};
  flex-wrap: nowrap;
  width: 100%;
  align-items: flex-end;
  
  > * {
    flex: 1 1 auto;
    min-width: 160px;
  }
  
  @media (max-width: 1024px) {
    flex-wrap: wrap;
    
    > * {
      min-width: calc(50% - ${formTokens.spacing.md} / 2);
    }
  }
  
  @media (max-width: 480px) {
    > * {
      min-width: 100%;
    }
  }
`;

export interface FiltersPanelProps {
  // Search
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  showSearch?: boolean;
  
  // Category
  categoryFilter?: ItemCategory | 'all' | string;
  onCategoryChange?: (value: string) => void;
  showCategoryFilter?: boolean;
  showAllCategories?: boolean;
  
  // Color
  colorFilter?: string;
  onColorChange?: (value: string) => void;
  showColorFilter?: boolean;
  
  // Season
  seasonFilter?: Season | 'all' | string;
  onSeasonChange?: (value: string) => void;
  showSeasonFilter?: boolean;
  showAllSeasons?: boolean;
  
  // Custom filters
  customFilters?: {
    id: string;
    label: string;
    value: any;
    options: { value: any; label: string }[];
    onChange: (value: any) => void;
  }[];
  
  // Layout
  layout?: 'horizontal' | 'vertical';
  className?: string;
}

const FiltersPanel: React.FC<FiltersPanelProps> = ({
  // Search
  searchQuery = '',
  onSearchChange,
  searchPlaceholder = 'Search items...',
  showSearch = true,
  
  // Category
  categoryFilter = 'all',
  onCategoryChange,
  showCategoryFilter = true,
  showAllCategories = true,
  
  // Color
  colorFilter = '',
  onColorChange,
  showColorFilter = true,
  
  // Season
  seasonFilter = 'all',
  onSeasonChange,
  showSeasonFilter = true,
  showAllSeasons = true,
  
  // Custom filters
  customFilters = [],
  
  // Layout
  layout = 'horizontal',
  className = ''
}) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSearchChange) onSearchChange(e.target.value);
  };
  
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onCategoryChange) onCategoryChange(e.target.value);
  };
  
  const handleSeasonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onSeasonChange) onSeasonChange(e.target.value);
  };
  
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onColorChange) onColorChange(e.target.value);
  };

  return (
    <FiltersContainer className={className} $layout={layout}>
      <FilterGroup $layout={layout}>
        {/* Search Input */}
        {showSearch && onSearchChange && (
          <SearchContainer label="Search" htmlFor="search-input">
            <div className="form-input-container">
              <span className="search-icon">
                <MdSearch size={20} />
              </span>
              <FormInput
                id="search-input"
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder={searchPlaceholder}
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </SearchContainer>
        )}

        {/* Category Filter */}
        {showCategoryFilter && onCategoryChange && (
          <FormField label="Category" htmlFor="category-filter">
            <FormSelect
              id="category-filter"
              value={categoryFilter}
              onChange={handleCategoryChange}
              variant="outline"
              isFullWidth
            >
              {showAllCategories && <option value="all">All Categories</option>}
              {Object.values(ItemCategory).map((category) => (
                <option key={category} value={category}>
                  {formatCategoryForFilter(category)}
                </option>
              ))}
            </FormSelect>
          </FormField>
        )}
        

        {/* Season Filter */}
        {showSeasonFilter && onSeasonChange && (
          <FormField label="Season" htmlFor="season-filter">
            <FormSelect
              id="season-filter"
              value={seasonFilter}
              onChange={handleSeasonChange}
              variant="outline"
              isFullWidth
            >
              {showAllSeasons && <option value="all">All Seasons</option>}
              {Object.values(Season).map((season) => (
                <option key={season} value={season}>
                  {season.charAt(0).toUpperCase() + season.slice(1)}
                </option>
              ))}
            </FormSelect>
          </FormField>
        )}
        

        {/* Color Filter */}
        {showColorFilter && onColorChange && (
          <FormField label="Color" htmlFor="color-filter">
            <FormInput
              id="color-filter"
              type="text"
              placeholder="Filter by color"
              value={colorFilter}
              onChange={handleColorChange}
              variant="outline"
              isFullWidth
            />
          </FormField>
        )}
        

        {/* Custom Filters */}
        {customFilters.map((filter) => (
          <FormField key={filter.id} label={filter.label} htmlFor={`${filter.id}-filter`}>
            <FormSelect
              id={`${filter.id}-filter`}
              value={filter.value}
              onChange={(e) => filter.onChange(e.target.value)}
              variant="outline"
              isFullWidth
            >
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </FormSelect>
          </FormField>
        ))}
      </FilterGroup>
    </FiltersContainer>
  );
};

export default FiltersPanel;
