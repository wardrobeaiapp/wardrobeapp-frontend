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
  
  /* Mobile-specific overrides for better responsive behavior */
  @media (max-width: 768px) {
    /* Force vertical layout on mobile */
    > div {
      flex-direction: column !important;
      gap: 0.75rem !important; /* Tighter spacing like wardrobe page */
    }
    
    /* Search container adjustments - target multiple possible containers */
    > div > div:first-child,
    .search-container,
    [data-testid="search-container"],
    div[style*="flex"] > div:first-child {
      min-width: 100% !important;
      max-width: 100% !important;
      width: 100% !important;
      flex: 1 1 100% !important;
      margin-bottom: 0 !important;
      
      /* Target the actual search input field */
      input {
        width: 100% !important;
      }
      
      /* Target form field wrapper */
      > div {
        width: 100% !important;
        min-width: 100% !important;
        max-width: 100% !important;
        
        /* Target input container */
        .form-input-container,
        div {
          width: 100% !important;
        }
      }
    }
    
    /* Filter group adjustments - keep Category and Season in same row */
    > div > div:last-child {
      width: 100% !important;
      flex-direction: row !important;
      flex-wrap: wrap !important;
      gap: 0.75rem !important;
      
      /* Category and Season in same row (first two filters) */
      > div:nth-child(1), > div:nth-child(2) {
        flex: 1 1 calc(50% - 0.375rem) !important;
        min-width: calc(50% - 0.375rem) !important;
        margin-bottom: 0 !important;
      }
      
      /* Color filter takes full width (third filter) */
      > div:nth-child(3), > div:nth-child(n+4) {
        flex: 1 1 100% !important;
        min-width: 100% !important;
        margin-bottom: 0 !important;
        
        &:not(:last-child) {
          margin-bottom: 0.5rem !important;
        }
      }
    }
  }
  
  @media (max-width: 480px) {
    margin-bottom: ${formTokens.spacing.lg};
    
    /* Even tighter spacing on small mobile */
    > div > div:last-child > div {
      margin-bottom: 0 !important;
    }
  }
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
  customFilters?: Array<{
    id: string;
    label: string;
    value: any;
    options: { value: any; label: string }[];
    onChange: (value: any) => void;
  }>;
  
  // Reset functionality
  onResetFilters?: () => void;
  showResetButton?: boolean;
  
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
  
  // Reset functionality
  onResetFilters,
  showResetButton = false,
  
  // Layout
  layout = 'horizontal',
  className = ''
}) => {
  return (
    <FiltersContainer className={className} $layout={layout}>
      <div style={{ display: 'flex', width: '100%', gap: '1rem', alignItems: 'flex-end' }}>
        {showSearch && onSearchChange && (
          <FormField label="Search" htmlFor="search-filter">
            <SearchContainer>
              <div className="form-input-container">
                <MdSearch className="search-icon" />
                <FormInput
                  id="search-filter"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder={searchPlaceholder}
                  style={{ paddingLeft: '2rem' }}
                />
              </div>
            </SearchContainer>
          </FormField>
        )}

        <FilterGroup $layout={layout}>
          {showCategoryFilter && onCategoryChange && (
            <FormField label="Category" htmlFor="category-filter">
              <FormSelect
                id="category-filter"
                value={categoryFilter}
                onChange={(e) => onCategoryChange(e.target.value)}
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
                onChange={(e) => onSeasonChange(e.target.value)}
              >
                {showAllSeasons && <option value="">All Seasons</option>}
                {Object.values(Season).map((season) => (
                  <option key={season} value={season}>
                    {season.charAt(0).toUpperCase() + season.slice(1).toLowerCase()}
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
                onChange={(e) => onColorChange(e.target.value)}
              />
            </FormField>
          )}
        
        </FilterGroup>
      </div>
    </FiltersContainer>
  );
};

export default FiltersPanel;
