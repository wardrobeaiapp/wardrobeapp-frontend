import React from 'react';
import { Season, ItemCategory } from '../../../../../types';
import { formatCategoryForFilter } from '../../../../../utils/textFormatting';
import { FormField } from '../../../../../components/common/Form';
import {
  FormContainer,
  ThreeColumnRow,
  FormGroup,
  Select,
  Input,
} from '../../forms/OutfitForm/OutfitForm.styles';

export interface FiltersPanelProps {
  searchQuery: string;
  categoryFilter: ItemCategory | 'all' | string;
  colorFilter: string;
  seasonFilter: Season | 'all' | string;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onColorChange: (value: string) => void;
  onSeasonChange: (value: string) => void;
  searchPlaceholder?: string;
  showAllCategories?: boolean;
  showAllSeasons?: boolean;
}

const FiltersPanel: React.FC<FiltersPanelProps> = ({
  searchQuery,
  categoryFilter,
  colorFilter,
  seasonFilter,
  onSearchChange,
  onCategoryChange,
  onColorChange,
  onSeasonChange,
  searchPlaceholder = 'Search by name, brand, material...',
  showAllCategories = true,
  showAllSeasons = true,
}) => {
  return (
    <FormContainer>
      {/* Search Field - Full Width */}
      <FormGroup>
        <FormField
          label="Search"
          htmlFor="search-query"
        >
          <Input
            id="search-query"
            type="text"
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
          />
        </FormField>
      </FormGroup>
      
      {/* Filters Row - Category, Color, and Season in balanced layout */}
      <ThreeColumnRow>
        <FormGroup>
          <FormField
            label="Category"
            htmlFor="category-filter"
          >
            <Select
              id="category-filter"
              value={categoryFilter}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onCategoryChange(e.target.value)}
            >
              {showAllCategories && <option value="all">All Categories</option>}
              {Object.values(ItemCategory).map(category => (
                <option key={category} value={category}>
                  {formatCategoryForFilter(category)}
                </option>
              ))}
            </Select>
          </FormField>
        </FormGroup>
        
        <FormGroup>
          <FormField
            label="Color"
            htmlFor="color-filter"
          >
            <Input
              id="color-filter"
              type="text"
              placeholder="Enter color"
              value={colorFilter}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onColorChange(e.target.value)}
            />
          </FormField>
        </FormGroup>
        
        <FormGroup>
          <FormField
            label="Season"
            htmlFor="season-filter"
          >
            <Select
              id="season-filter"
              value={seasonFilter}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onSeasonChange(e.target.value)}
            >
              {showAllSeasons && <option value="all">All Seasons</option>}
              {Object.values(Season)
                .filter(season => season !== Season.ALL_SEASON)
                .map(season => (
                  <option key={season} value={season}>
                    {season}
                  </option>
                ))}
            </Select>
          </FormField>
        </FormGroup>
      </ThreeColumnRow>
    </FormContainer>
  );
};

export default FiltersPanel;
